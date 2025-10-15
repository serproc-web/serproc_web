import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.get("/time", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS server_time");
    res.json({ time: rows[0].server_time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
