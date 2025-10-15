import pool from "../config/db.js";

export async function getTicketsByEmpleado(empleadoId) {
  const [rows] = await pool.query(
    "SELECT * FROM tickets WHERE user_id = ? ORDER BY fecha DESC",
    [empleadoId]
  );
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
      numero,
      fecha,
      actividad,
      cliente,
      usuario_cliente,
      minutos,
      horas,
      observaciones,
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
        minutos || null,
        horas || null,
        observaciones || null,
        estado || "pendiente",
        id,
      ]
    );
    return;
  }

  // modo antiguo (un solo campo)
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
