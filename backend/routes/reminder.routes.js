import { Router } from "express";
import {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../models/reminder.model.js";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await getReminders();
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const row = await getReminder(req.params.id);
  if (!row) return res.status(404).json({ error: "Recordatorio no encontrado" });
  res.json(row);
});

router.post("/", async (req, res) => {
  const id = await createReminder(req.body);
  res.status(201).json({ id });
});

router.put("/:id", async (req, res) => {
  await updateReminder(req.params.id, req.body);
  res.json({ message: "Recordatorio actualizado" });
});

router.delete("/:id", async (req, res) => {
  await deleteReminder(req.params.id);
  res.json({ message: "Recordatorio eliminado" });
});
// reminder.routes.js
router.put("/:id/complete", async (req, res) => {
  await completeReminder(req.params.id);
  res.json({ message: "Recordatorio marcado como completado" });
});

export default router;
