// routes/ticket.routes.js
import { Router } from "express";
import { 
  getTicketsByEmpleado, 
  createTicket, 
  updateTicket,
  deleteTicket,
  getAvailableMonths,
  getUniqueClientes,
  getUniqueUsuarios,
  getTicketsForReport
} from "../models/ticket.model.js";

const router = Router();

// Obtener tickets por empleado con filtros
router.get("/:empleadoId", async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { month, estado, q } = req.query;
    
    const filters = {};
    if (month) filters.month = month;
    if (estado) filters.estado = estado;
    if (q) filters.q = q;

    const tickets = await getTicketsByEmpleado(empleadoId, filters);
    res.json(tickets);
  } catch (err) {
    console.error("Error obteniendo tickets:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Obtener meses disponibles
router.get("/:empleadoId/filters/months", async (req, res) => {
  try {
    const months = await getAvailableMonths(req.params.empleadoId);
    res.json(months);
  } catch (err) {
    console.error("Error obteniendo meses:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Obtener clientes únicos
router.get("/:empleadoId/filters/clientes", async (req, res) => {
  try {
    const clientes = await getUniqueClientes(req.params.empleadoId);
    res.json(clientes);
  } catch (err) {
    console.error("Error obteniendo clientes:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Obtener usuarios únicos
router.get("/:empleadoId/filters/usuarios", async (req, res) => {
  try {
    const usuarios = await getUniqueUsuarios(req.params.empleadoId);
    res.json(usuarios);
  } catch (err) {
    console.error("Error obteniendo usuarios:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Obtener datos para reporte PDF
router.get("/:empleadoId/report/data", async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { month, estado } = req.query;
    
    const filters = {};
    if (month) filters.month = month;
    if (estado && estado !== "all") filters.estado = estado;

    const data = await getTicketsForReport(empleadoId, filters);
    res.json(data);
  } catch (err) {
    console.error("Error obteniendo datos para reporte:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear ticket
router.post("/", async (req, res) => {
  try {
    const id = await createTicket(req.body);
    res.status(201).json({ message: "Ticket creado exitosamente", id });
  } catch (err) {
    console.error("Error creando ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

// Carga masiva de tickets (CSV)
router.post("/bulk", async (req, res) => {
  try {
    const { tickets } = req.body;

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ error: "No se enviaron tickets" });
    }

    let created = 0;
    let errors = 0;

    for (const t of tickets) {
      try {
        await createTicket({
          ...t,
          estado: t.estado || "completado",
        });
        created++;
      } catch (err) {
        console.error("Error en ticket individual:", err);
        errors++;
      }
    }

    res.json({ 
      message: `Se cargaron ${created} tickets correctamente`,
      created,
      errors
    });
  } catch (err) {
    console.error("Error en carga masiva:", err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar ticket
router.patch("/:id", async (req, res) => {
  try {
    const { field, value } = req.body;
    await updateTicket(req.params.id, field, value);
    res.json({ message: "Ticket actualizado exitosamente" });
  } catch (err) {
    console.error("Error actualizando ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar ticket
router.delete("/:id", async (req, res) => {
  try {
    await deleteTicket(req.params.id);
    res.json({ message: "Ticket eliminado exitosamente" });
  } catch (err) {
    console.error("Error eliminando ticket:", err);
    
    if (err.message?.includes("no encontrado")) {
      return res.status(404).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message });
  }
});

export default router;