import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { findUserByEmail, createUser } from "../models/user.model.js";
import { sendVerificationEmail } from "../config/mailer.js";

const router = Router();

// Registro con verificación por correo (NO bloquear respuesta por SMTP)
router.post("/register", async (req, res) => {
  const t0 = Date.now();
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
    if (exists) return res.status(400).json({ error: "El usuario ya existe" });

    // 🔐 bajar a 10 rondas en plan free para evitar bloqueo
    const hashed = await bcrypt.hash(password, 10);

    // Código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear como NO verificado
    const id = await createUser(name.trim(), email, hashed, "client", code);

    // ⚡ Responder YA; enviar email en background (no bloquea al cliente)
    res.status(201).json({
      message: "Usuario registrado, revisa tu correo para verificar tu cuenta",
      userId: id,
    });

    // Background: envío de correo con timeout propio (no afecta la respuesta)
    try {
      const msLeft = Math.max(0, 8000 - (Date.now() - t0)); // margen
      await Promise.race([
        sendVerificationEmail(email, code),
        new Promise((_, rej) => setTimeout(() => rej(new Error("mail-timeout")), Math.max(3000, msLeft))),
      ]);
      console.log(`[mail] verification sent to ${email}`);
    } catch (e) {
      console.error("[mail] error:", e.message);
      // Si falla el mail, NO rompemos nada; el usuario puede pedir reenvío luego.
    }
  } catch (err) {
    console.error("[register] error:", err);
    return res.status(500).json({ error: "Error en registro" });
  }
});

// Verificar código
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await findUserByEmail(String(email).trim().toLowerCase());
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "Código inválido" });
    }

    await pool.query(
      "UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?",
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Cuenta verificada con éxito",
      token,
      role: user.role,
      name: user.name,
      userId: user.id,
    });
  } catch (err) {
    console.error("[verify] error:", err);
    return res.status(500).json({ error: "Error en verificación" });
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
    if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

    if (!user.is_verified) {
      return res.status(403).json({ error: "Cuenta no verificada. Revisa tu correo." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login exitoso",
      token,
      role: user.role,
      name: user.name,
      userId: user.id,
    });
  } catch (err) {
    console.error("[login] error:", err);
    return res.status(500).json({ error: "Error en login" });
  }
});

export default router;
