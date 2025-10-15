import { Router } from "express";
import { getTicketsByEmpleado, createTicket, updateTicket } from "../models/ticket.model.js";

const router = Router();

// Obtener tickets por empleado
router.get("/:empleadoId", async (req, res) => {
  try {
    const tickets = await getTicketsByEmpleado(req.params.empleadoId);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear ticket
router.post("/", async (req, res) => {
  try {
    const id = await createTicket(req.body);
    res.status(201).json({ message: "Ticket creado", id });
  } catch (err) {
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

    for (const t of tickets) {
      await createTicket({
        ...t,
        estado: "completado", // ✅ siempre en completado
      });
    }

    res.json({ message: `Se cargaron ${tickets.length} tickets correctamente` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar campo en línea
router.patch("/:id", async (req, res) => {
  try {
    const { field, value } = req.body;
    await updateTicket(req.params.id, field, value);
    res.json({ message: "Ticket actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
