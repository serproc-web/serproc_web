// models/ticket.model.js
import pool from "../config/db.js";

export async function getTicketsByEmpleado(empleadoId, filters = {}) {
  let query = "SELECT * FROM tickets WHERE user_id = ?";
  const params = [empleadoId];

  // Filtro por mes y año (formato: YYYY-MM)
  if (filters.month) {
    query += " AND DATE_FORMAT(fecha, '%Y-%m') = ?";
    params.push(filters.month);
  }

  // Filtro por estado
  if (filters.estado && filters.estado !== "all") {
    query += " AND estado = ?";
    params.push(filters.estado);
  }

  // 🔥 Búsqueda mejorada
  if (filters.q && filters.q.trim() !== "") {
    query += " AND (actividad LIKE ? OR cliente LIKE ? OR usuario_cliente LIKE ? OR numero LIKE ?)";
    const searchTerm = `%${filters.q.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY fecha DESC, id DESC";

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

  const allowed = [
    "numero", "fecha", "actividad", "cliente", "usuario_cliente",
    "minutos", "horas", "observaciones", "estado",
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

// 🔥 Obtener meses disponibles con año
export async function getAvailableMonths(empleadoId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT DATE_FORMAT(fecha, '%Y-%m') as month
     FROM tickets
     WHERE user_id = ? AND fecha IS NOT NULL
     ORDER BY month DESC`,
    [empleadoId]
  );
  return rows.map(r => r.month);
}

// 🔥 Obtener clientes únicos del usuario
export async function getUniqueClientes(empleadoId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT cliente 
     FROM tickets 
     WHERE user_id = ? AND cliente IS NOT NULL AND cliente != ''
     ORDER BY cliente ASC`,
    [empleadoId]
  );
  return rows.map(r => r.cliente);
}

// 🔥 Obtener usuarios únicos del usuario
export async function getUniqueUsuarios(empleadoId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT usuario_cliente 
     FROM tickets 
     WHERE user_id = ? AND usuario_cliente IS NOT NULL AND usuario_cliente != ''
     ORDER BY usuario_cliente ASC`,
    [empleadoId]
  );
  return rows.map(r => r.usuario_cliente);
}

// 🔥 Obtener tickets para reporte PDF (con stats)
export async function getTicketsForReport(empleadoId, filters = {}) {
  const tickets = await getTicketsByEmpleado(empleadoId, filters);
  
  // Calcular estadísticas
  const totalTickets = tickets.length;
  const totalHoras = tickets.reduce((sum, t) => sum + parseFloat(t.horas || 0), 0);
  const totalMinutos = tickets.reduce((sum, t) => sum + parseInt(t.minutos || 0), 0);
  const completados = tickets.filter(t => t.estado === 'completado').length;
  const pendientes = tickets.filter(t => t.estado === 'pendiente').length;
  
  // Tickets por cliente
  const porCliente = {};
  tickets.forEach(t => {
    if (t.cliente) {
      if (!porCliente[t.cliente]) {
        porCliente[t.cliente] = { cantidad: 0, horas: 0 };
      }
      porCliente[t.cliente].cantidad++;
      porCliente[t.cliente].horas += parseFloat(t.horas || 0);
    }
  });
  
  return {
    tickets,
    stats: {
      totalTickets,
      totalHoras: totalHoras.toFixed(2),
      totalMinutos,
      completados,
      pendientes,
      porCliente: Object.entries(porCliente).map(([cliente, data]) => ({
        cliente,
        cantidad: data.cantidad,
        horas: data.horas.toFixed(2)
      }))
    }
  };
}