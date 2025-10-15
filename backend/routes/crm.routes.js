import { Router } from "express";
import {
  getStatsOverview,
  getStatsByWorker,
  getTimeseries,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../models/crm.model.js";

const router = Router();

/* ===== STATS ===== */
router.get("/stats/overview", async (req, res) => {
  const { from, to, status = "all" } = req.query;
  const data = await getStatsOverview({ from, to, status });
  res.json(data);
});

router.get("/stats/by-worker", async (req, res) => {
  const { from, to, status = "all" } = req.query;
  const rows = await getStatsByWorker({ from, to, status });
  res.json(rows);
});

router.get("/stats/timeseries", async (req, res) => {
  const { from, to, status = "all", interval = "day" } = req.query;
  const rows = await getTimeseries({ from, to, status, interval });
  res.json(rows);
});

/* ===== USERS (CRUD simple) ===== */
router.get("/users", async (req, res) => {
  const rows = await listUsers(req.query.q || "");
  res.json(rows);
});

router.post("/users", async (req, res) => {
  const id = await createUser(req.body);
  res.status(201).json({ id });
});

router.put("/users/:id", async (req, res) => {
  await updateUser(req.params.id, req.body);
  res.json({ ok: true });
});

router.delete("/users/:id", async (req, res) => {
  await deleteUser(req.params.id);
  res.json({ ok: true });
});

export default router;
