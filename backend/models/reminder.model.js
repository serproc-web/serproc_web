import pool from "../config/db.js";

// Obtener todos
export async function getReminders() {
  const [rows] = await pool.query("SELECT * FROM reminders ORDER BY date ASC, time ASC");
  return rows;
}

// Obtener uno
export async function getReminder(id) {
  const [rows] = await pool.query("SELECT * FROM reminders WHERE id = ?", [id]);
  return rows[0];
}

// Crear
export async function createReminder(r) {
  const [res] = await pool.query(
    `INSERT INTO reminders (title, date, time, description, type, status) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [r.title, r.date, r.time, r.description, r.type, r.status || "Pendiente"]
  );
  return res.insertId;
}

// Actualizar
export async function updateReminder(id, r) {
  await pool.query(
    `UPDATE reminders 
     SET title=?, date=?, time=?, description=?, type=?, status=? 
     WHERE id=?`,
    [r.title, r.date, r.time, r.description, r.type, r.status, id]
  );
}

// Eliminar
export async function deleteReminder(id) {
  await pool.query("DELETE FROM reminders WHERE id=?", [id]);
}

// reminder.model.js
export async function completeReminder(id) {
  await pool.query("UPDATE reminders SET status='Completado' WHERE id=?", [id]);
}
