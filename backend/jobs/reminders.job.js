import cron from "node-cron";
import pool from "../config/db.js";

// Job que corre cada minuto
cron.schedule("* * * * *", async () => {
  try {
    const [rows] = await pool.query(
      "UPDATE reminders SET status='Vencido' WHERE status='Pendiente' AND TIMESTAMP(date, time) < NOW()"
    );

    if (rows.affectedRows > 0) {
      console.log(`⚡ Recordatorios vencidos actualizados: ${rows.affectedRows}`);
    }
  } catch (err) {
    console.error("❌ Error actualizando recordatorios vencidos:", err.message);
  }
});
