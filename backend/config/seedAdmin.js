import bcrypt from "bcryptjs";
import pool from "./db.js";

export async function seedAdmin() {
  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
      process.env.ADMIN_EMAIL,
    ]);
    if (rows.length > 0) {
      console.log("✅ Admin ya existe:", process.env.ADMIN_EMAIL);
      return;
    }

    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, 1)",
      [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hashed, "admin"]
    );
    console.log("🚀 Admin creado:", process.env.ADMIN_EMAIL);
  } catch (e) {
    console.error("❌ seedAdmin error:", e.message);
  }
}
