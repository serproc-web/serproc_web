import pool from "../config/db.js";

// ---------- CRUD: notifications ----------
export async function getNotifications() {
  const [rows] = await pool.query(
    "SELECT * FROM notifications ORDER BY fecha DESC, id DESC"
  );
  return rows;
}

export async function getNotification(id) {
  const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [id]);
  return rows[0];
}

export async function createNotification(n) {
  const [res] = await pool.query(
    `INSERT INTO notifications (fecha, tipo, destinatario, estado, mensaje, sent_at, sent_channel)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      n.fecha || null,
      n.tipo || null,
      n.destinatario || null,
      n.estado || "Pendiente",
      n.mensaje || null,
      n.sent_at || null,
      n.sent_channel || null,
    ]
  );
  return res.insertId;
}

export async function updateNotification(id, n) {
  await pool.query(
    `UPDATE notifications 
     SET fecha=?, tipo=?, destinatario=?, estado=?, mensaje=?, sent_at=?, sent_channel=?
     WHERE id=?`,
    [
      n.fecha || null,
      n.tipo || null,
      n.destinatario || null,
      n.estado || null,
      n.mensaje || null,
      n.sent_at || null,
      n.sent_channel || null,
      id,
    ]
  );
}

export async function deleteNotification(id) {
  await pool.query("DELETE FROM notifications WHERE id=?", [id]);
}

export async function markSent(id, channel) {
  await pool.query(
    "UPDATE notifications SET estado='Enviado', sent_at=NOW(), sent_channel=? WHERE id=?",
    [channel, id]
  );
}

// ---------- Settings: notification_settings ----------
export async function getNotificationSettings() {
  const [rows] = await pool.query(
    "SELECT * FROM notification_settings WHERE id = 1"
  );
  return rows[0];
}

export async function saveNotificationSettings({ intervalo, enviar_panel, enviar_correo }) {
  // Normalizamos valores
  const _intervalo = Number.isFinite(Number(intervalo)) ? Number(intervalo) : 24;
  const _panel = enviar_panel ? 1 : 0;
  const _correo = enviar_correo ? 1 : 0;

  await pool.query(
    `INSERT INTO notification_settings (id, intervalo, enviar_panel, enviar_correo, updated_at)
     VALUES (1, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE 
       intervalo=VALUES(intervalo),
       enviar_panel=VALUES(enviar_panel),
       enviar_correo=VALUES(enviar_correo),
       updated_at=NOW()`,
    [_intervalo, _panel, _correo]
  );
}
