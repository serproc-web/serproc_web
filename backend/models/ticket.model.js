// models/ticket.model.js
import pool from "../config/db.js";

export async function getTicketsByEmpleado(empleadoId, filters = {}) {
  let query = "SELECT * FROM tickets WHERE user_id = ?";
  const params = [empleadoId];

  // Filtro por mes (formato: YYYY-MM)
  if (filters.month) {
    query += " AND DATE_FORMAT(fecha, '%Y-%m') = ?";
    params.push(filters.month);
  }

  // Filtro por estado
  if (filters.estado && filters.estado !== "all") {
    query += " AND estado = ?";
    params.push(filters.estado);
  }

  // Filtro por búsqueda en actividad o cliente
  if (filters.q) {
    query += " AND (actividad LIKE ? OR cliente LIKE ? OR usuario_cliente LIKE ?)";
    const searchTerm = `%${filters.q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY fecha DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function createTicket(ticket) {
  const {
    user_id,
    numero,
    fecha,
    actividad,
    cliente,
    usuario_cliente,
    minutos,
    horas,
    observaciones,
    estado
  } = ticket;

  const [res] = await pool.query(
    `INSERT INTO tickets 
     (user_id, numero, fecha, actividad, cliente, usuario_cliente, minutos, horas, observaciones, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      numero || null,
      fecha,
      actividad || null,
      cliente || null,
      usuario_cliente || null,
      minutos || 0,
      horas || 0,
      observaciones || null,
      estado || "pendiente",
    ]
  );
  return res.insertId;
}

export async function updateTicket(id, field, value) {
  if (field === "all") {
    const {
      numero,
      fecha,
      actividad,
      cliente,
      usuario_cliente,
      minutos,
      horas,
      observaciones,
      estado,
    } = value;

    await pool.query(
      `UPDATE tickets SET 
        numero=?, fecha=?, actividad=?, cliente=?, usuario_cliente=?, 
        minutos=?, horas=?, observaciones=?, estado=? 
       WHERE id=?`,
      [
        numero || null,
        fecha || null,
        actividad || null,
        cliente || null,
        usuario_cliente || null,
        minutos || 0,
        horas || 0,
        observaciones || null,
        estado || "pendiente",
        id,
      ]
    );
    return;
  }

  // Actualizar un solo campo
  const allowed = [
    "numero",
    "fecha",
    "actividad",
    "cliente",
    "usuario_cliente",
    "minutos",
    "horas",
    "observaciones",
    "estado",
  ];
  
  if (!allowed.includes(field)) {
    throw new Error("Campo no permitido");
  }
  
  await pool.query(`UPDATE tickets SET ${field} = ? WHERE id = ?`, [value, id]);
}

export async function deleteTicket(id) {
  const [existing] = await pool.query("SELECT id FROM tickets WHERE id = ?", [id]);
  if (existing.length === 0) {
    throw new Error("Ticket no encontrado");
  }
  
  await pool.query("DELETE FROM tickets WHERE id = ?", [id]);
  return true;
}

// Obtener meses disponibles para filtros
export async function getAvailableMonths(empleadoId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT DATE_FORMAT(fecha, '%Y-%m') as month
     FROM tickets
     WHERE user_id = ?
     ORDER BY month DESC`,
    [empleadoId]
  );
  return rows.map(r => r.month);
}