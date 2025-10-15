import pool from "../config/db.js";

/* Helpers */
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

  // agrupación por día / semana / mes usando columna `fecha`
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

/* ===== USERS (CRUD simple) ===== */
export async function listUsers(q = "") {
  const like = `%${q}%`;
  const [rows] = await pool.query(
    `
    SELECT id, name, email, role, phone,
           notify_enabled, notify_interval, notify_panel, notify_email
    FROM users
    WHERE ? = '' OR (name LIKE ? OR email LIKE ? OR role LIKE ?)
    ORDER BY name
    `,
    [q, like, like, like]
  );
  return rows;
}

export async function createUser(u) {
  const [res] = await pool.query(
    `
    INSERT INTO users (name, email, role, phone,
      notify_enabled, notify_interval, notify_panel, notify_email, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      u.name, u.email, u.role || "client", u.phone || null,
      u.notify_enabled ? 1 : 0,
      u.notify_interval || "24h",
      u.notify_panel ? 1 : 0,
      u.notify_email ? 1 : 0,
      u.password || null, // asume hashing en otra capa si lo necesitas
    ]
  );
  return res.insertId;
}

export async function updateUser(id, u) {
  // si no manda password, no lo toques
  if (u.password && u.password.trim()) {
    await pool.query(
      `UPDATE users SET name=?, email=?, role=?, phone=?,
        notify_enabled=?, notify_interval=?, notify_panel=?, notify_email=?, password=?
       WHERE id=?`,
      [
        u.name, u.email, u.role, u.phone || null,
        u.notify_enabled ? 1 : 0, u.notify_interval || "24h",
        u.notify_panel ? 1 : 0, u.notify_email ? 1 : 0,
        u.password, id,
      ]
    );
  } else {
    await pool.query(
      `UPDATE users SET name=?, email=?, role=?, phone=?,
        notify_enabled=?, notify_interval=?, notify_panel=?, notify_email=?
       WHERE id=?`,
      [
        u.name, u.email, u.role, u.phone || null,
        u.notify_enabled ? 1 : 0, u.notify_interval || "24h",
        u.notify_panel ? 1 : 0, u.notify_email ? 1 : 0,
        id,
      ]
    );
  }
}

export async function deleteUser(id) {
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
}
