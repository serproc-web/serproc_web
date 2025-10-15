// backend/routes/configuration.routes.js
import { Router } from "express";
import {
  getGlobalNotificationSettings,
  updateGlobalNotificationSettings,
  applyNotificationSettingsToAllUsers,
} from "../models/configuration.model.js";

const router = Router();

/** Obtener configuración global de notificaciones */
router.get("/notifications", async (req, res) => {
  const cfg = await getGlobalNotificationSettings();
  // fallback seguro si la tabla aún está vacía
  res.json(
    cfg || { intervalo: 24, enviar_panel: 1, enviar_correo: 0, id: 1 }
  );
});

/** Guardar configuración global de notificaciones */
router.put("/notifications", async (req, res) => {
  const { intervalo, enviar_panel, enviar_correo } = req.body;
  await updateGlobalNotificationSettings({
    intervalo: Number(intervalo ?? 24),
    enviar_panel: !!enviar_panel ? 1 : 0,
    enviar_correo: !!enviar_correo ? 1 : 0,
  });
  res.json({ message: "Configuración guardada" });
});

/** Aplicar configuración global a TODOS los usuarios (bulk) */
router.post("/notifications/apply-to-all", async (req, res) => {
  const { enabled, intervalo, panel, correo } = req.body;
  const { affectedRows } = await applyNotificationSettingsToAllUsers({
    enabled: !!enabled ? 1 : 0,
    intervalo: intervalo || "24h",
    panel: !!panel ? 1 : 0,
    correo: !!correo ? 1 : 0,
  });
  res.json({ message: "Configuración aplicada a usuarios", affectedRows });
});

export default router;
