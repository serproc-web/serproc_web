// backend/models/configuration.model.js
import pool from "../config/db.js";

/* ============ GLOBAL NOTIFICATION SETTINGS (tabla: notification_settings) ============ */
export async function getGlobalNotificationSettings() {
  const [rows] = await pool.query(
    "SELECT id, intervalo, enviar_panel, enviar_correo, updated_at FROM notification_settings WHERE id = 1 LIMIT 1"
  );
  return rows[0];
}

export async function updateGlobalNotificationSettings({ intervalo, enviar_panel, enviar_correo }) {
  // REPLACE garantiza que exista el registro id=1
  await pool.query(
    `REPLACE INTO notification_settings (id, intervalo, enviar_panel, enviar_correo)
     VALUES (1, ?, ?, ?)`,
    [intervalo, enviar_panel, enviar_correo]
  );
}

/* ============ APLICAR A TODOS LOS USUARIOS (tabla: users) ============ */
export async function applyNotificationSettingsToAllUsers({ enabled, intervalo, panel, correo }) {
  const [res] = await pool.query(
    `UPDATE users 
       SET notify_enabled = ?, 
           notify_interval = ?, 
           notify_panel   = ?, 
           notify_email   = ?`,
    [enabled, intervalo, panel, correo]
  );
  return res; // { affectedRows: n }
}
