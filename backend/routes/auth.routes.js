import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js"; // 👈 necesario para el update en verify
import { findUserByEmail, createUser } from "../models/user.model.js";
import { sendVerificationEmail } from "../config/mailer.js";

const router = Router();

// Registro con verificación por correo
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, confirm } = req.body;
    if (!name || !email || !password || !confirm) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    if (password !== confirm) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    email = String(email).trim().toLowerCase();

    const exists = await findUserByEmail(email);
    if (exists) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // código de 6 dígitos

    // crear usuario como no verificado
    const id = await createUser(name.trim(), email, hashed, "client", code);

    // enviar correo con el código
    await sendVerificationEmail(email, code);

    res.status(201).json({
      message: "Usuario registrado, revisa tu correo para verificar tu cuenta",
      userId: id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificar código
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "Código inválido" });
    }

    // marcar como verificado
    await pool.query(
      "UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?",
      [user.id]
    );

    // generar token después de verificar
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Cuenta verificada con éxito",
      token,
      role: user.role,
      name: user.name,
      userId: user.id,   // 👈 AGREGADO
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    email = String(email).trim().toLowerCase();

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // si no está verificado → no permitir login
    if (!user.is_verified) {
      return res.status(403).json({
        error: "Cuenta no verificada. Revisa tu correo.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      role: user.role,
      name: user.name,
      userId: user.id,   // 👈 AGREGADO
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
