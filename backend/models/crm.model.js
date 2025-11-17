// models/crm.model.js
import pool from "../config/db.js";

/* ===== HELPERS ===== */
function whereDates({ from, to, status }) {
  const where = ["t.fecha BETWEEN ? AND ?"];
  const params = [from, to];
  if (status && status !== "all") {
    where.push("t.estado = ?");
    params.push(status);
  }
  return { where: where.join(" AND "), params };
}

/* ===== STATS ===== */
export async function getStatsOverview({ from, to, status }) {
  const { where, params } = whereDates({ from, to, status });
  const [rows] = await pool.query(
    `
    SELECT
      SUM(t.estado='pendiente') AS pendientes,
      SUM(t.estado='completado') AS completados,
      COUNT(*) AS total
    FROM tickets t
    WHERE ${where}
    `,
    params
  );
  const r = rows[0] || {};
  return {
    pendientes: Number(r.pendientes || 0),
    completados: Number(r.completados || 0),
    total: Number(r.total || 0),
  };
}

export async function getStatsByWorker({ from, to, status }) {
  const { where, params } = whereDates({ from, to, status });
  const [rows] = await pool.query(
    `
    SELECT u.id, u.name,
      SUM(t.estado='pendiente') AS pendientes,
      SUM(t.estado='completado') AS completados
    FROM tickets t
    JOIN users u ON u.id = t.user_id
    WHERE ${where}
    GROUP BY u.id, u.name
    ORDER BY u.name
    `,
    params
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    pendientes: Number(r.pendientes || 0),
    completados: Number(r.completados || 0),
  }));
}

export async function getTimeseries({ from, to, status, interval }) {
  const { where, params } = whereDates({ from, to, status });

  let bucketExpr = "DATE_FORMAT(t.fecha, '%Y-%m-%d')";
  if (interval === "week") bucketExpr = "DATE_FORMAT(t.fecha, '%x-W%v')";
  if (interval === "month") bucketExpr = "DATE_FORMAT(t.fecha, '%Y-%m')";

  const [rows] = await pool.query(
    `
    SELECT ${bucketExpr} AS bucket,
           COUNT(*) AS cantidad
    FROM tickets t
    WHERE ${where}
    GROUP BY bucket
    ORDER BY MIN(t.fecha)
    `,
    params
  );
  return rows.map(r => ({ bucket: r.bucket, cantidad: Number(r.cantidad || 0) }));
}

// 🔥 Nueva función para obtener tickets pendientes con detalle del trabajador
export async function getPendingTickets({ from, to }) {
  const params = [from, to];
  
  const [rows] = await pool.query(
    `
    SELECT 
      t.id,
      t.numero,
      t.fecha,
      t.actividad,
      t.cliente,
      t.usuario_cliente,
      t.minutos,
      t.horas,
      t.observaciones,
      t.estado,
      u.id AS worker_id,
      u.name AS worker_name,
      u.email AS worker_email
    FROM tickets t
    JOIN users u ON u.id = t.user_id
    WHERE t.fecha BETWEEN ? AND ?
      AND t.estado = 'pendiente'
    ORDER BY t.fecha DESC, t.created_at DESC
    `,
    params
  );

  return rows.map(r => ({
    id: r.id,
    numero: r.numero,
    fecha: r.fecha,
    actividad: r.actividad,
    cliente: r.cliente,
    usuario_cliente: r.usuario_cliente,
    minutos: Number(r.minutos || 0),
    horas: Number(r.horas || 0),
    observaciones: r.observaciones,
    estado: r.estado,
    worker_id: r.worker_id,
    worker_name: r.worker_name,
    worker_email: r.worker_email,
  }));
}

/* ===== USERS CRUD ===== */
export async function listUsers(q = "") {
  let query = `
    SELECT id, name, email, role, phone, 
           notify_enabled, notify_interval, notify_panel, notify_email,
           created_at
    FROM users
  `;
  const params = [];

  if (q && q.trim() !== "") {
    query += " WHERE name LIKE ? OR email LIKE ? OR role LIKE ?";
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function createUser(data) {
  const {
    name,
    email,
    password, // Ya viene hasheada desde el router
    role = "client",
    phone = null,
    notify_enabled = 1,
    notify_interval = "24h",
    notify_panel = 1,
    notify_email = 1,
    is_verified = 1, // 🔥 Auto-verificar cuando lo crea el admin
  } = data;

  const [result] = await pool.query(
    `INSERT INTO users (
      name, email, password, role, phone,
      notify_enabled, notify_interval, notify_panel, notify_email, is_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      password,
      role,
      phone,
      notify_enabled,
      notify_interval,
      notify_panel,
      notify_email,
      is_verified,
    ]
  );

  return result.insertId;
}

export async function updateUser(id, data) {
  // Verificar que el usuario existe
  const [existing] = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
  if (existing.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  // Construir UPDATE dinámicamente solo con los campos enviados
  const updates = [];
  const values = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.email !== undefined) {
    updates.push("email = ?");
    values.push(data.email);
  }
  if (data.password !== undefined) {
    // Ya viene hasheada desde el router
    updates.push("password = ?");
    values.push(data.password);
  }
  if (data.role !== undefined) {
    updates.push("role = ?");
    values.push(data.role);
  }
  if (data.phone !== undefined) {
    updates.push("phone = ?");
    values.push(data.phone || null);
  }
  if (data.notify_enabled !== undefined) {
    updates.push("notify_enabled = ?");
    values.push(data.notify_enabled);
  }
  if (data.notify_interval !== undefined) {
    updates.push("notify_interval = ?");
    values.push(data.notify_interval);
  }
  if (data.notify_panel !== undefined) {
    updates.push("notify_panel = ?");
    values.push(data.notify_panel);
  }
  if (data.notify_email !== undefined) {
    updates.push("notify_email = ?");
    values.push(data.notify_email);
  }

  if (updates.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  values.push(id);

  await pool.query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  return true;
}

export async function deleteUser(id) {
  const [existing] = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
  if (existing.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return true;
}