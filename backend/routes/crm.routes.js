// routes/crm.routes.js
import { Router } from "express";
import bcrypt from "bcrypt";
import {
  getStatsOverview,
  getStatsByWorker,
  getTimeseries,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../models/crm.model.js";

const router = Router();

/* ===== STATS ===== */
router.get("/stats/overview", async (req, res) => {
  try {
    const { from, to, status = "all" } = req.query;
    const data = await getStatsOverview({ from, to, status });
    res.json(data);
  } catch (error) {
    console.error("Error en stats/overview:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

router.get("/stats/by-worker", async (req, res) => {
  try {
    const { from, to, status = "all" } = req.query;
    const rows = await getStatsByWorker({ from, to, status });
    res.json(rows);
  } catch (error) {
    console.error("Error en stats/by-worker:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas por trabajador" });
  }
});

router.get("/stats/timeseries", async (req, res) => {
  try {
    const { from, to, status = "all", interval = "day" } = req.query;
    const rows = await getTimeseries({ from, to, status, interval });
    res.json(rows);
  } catch (error) {
    console.error("Error en stats/timeseries:", error);
    res.status(500).json({ error: "Error obteniendo serie temporal" });
  }
});

/* ===== USERS (CRUD con validaciones y bcrypt) ===== */

// Obtener usuarios con búsqueda
router.get("/users", async (req, res) => {
  try {
    const rows = await listUsers(req.query.q || "");
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

// Crear usuario
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: "Nombre, email y contraseña son requeridos" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // 🔥 Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con password hasheada
    const userData = {
      ...req.body,
      password: hashedPassword
    };

    const id = await createUser(userData);
    res.status(201).json({ id, message: "Usuario creado exitosamente" });
  } catch (error) {
    console.error("Error creando usuario:", error);
    
    // Manejar error de email duplicado
    if (error.code === "ER_DUP_ENTRY" || error.message?.includes("duplicate")) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    res.status(500).json({ error: "Error creando usuario" });
  }
});

// Actualizar usuario
router.put("/users/:id", async (req, res) => {
  try {
    const { password, ...otherFields } = req.body;

    // 🔥 Si se envió una nueva contraseña, hashearla
    let updateData = { ...otherFields };
    
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({ 
          error: "La contraseña debe tener al menos 6 caracteres" 
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    // Si no se envió password o está vacío, no se actualiza

    await updateUser(req.params.id, updateData);
    res.json({ ok: true, message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    
    // Manejar error de email duplicado
    if (error.code === "ER_DUP_ENTRY" || error.message?.includes("duplicate")) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    if (error.message?.includes("not found") || error.message?.includes("No encontrado")) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(500).json({ error: "Error actualizando usuario" });
  }
});

// Eliminar usuario
router.delete("/users/:id", async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ ok: true, message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    
    if (error.message?.includes("not found") || error.message?.includes("No encontrado")) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(500).json({ error: "Error eliminando usuario" });
  }
});

export default router;