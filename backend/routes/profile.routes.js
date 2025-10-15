import { Router } from "express";
import { getUserById, updateUser, updatePassword } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// Obtener perfil
router.get("/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar perfil
router.put("/:id", async (req, res) => {
  try {
    await updateUser(req.params.id, req.body);
    res.json({ message: "Perfil actualizado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar contraseña
router.put("/:id/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "La contraseña es requerida" });
    const hashed = await bcrypt.hash(password, 10);
    await updatePassword(req.params.id, hashed);
    res.json({ message: "Contraseña actualizada con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
