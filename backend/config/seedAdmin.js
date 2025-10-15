import bcrypt from "bcryptjs";
import pool from "./db.js";

export async function seedAdmin() {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    process.env.ADMIN_EMAIL,
  ]);

  if (rows.length > 0) {
    console.log("✅ Admin ya existe:", process.env.ADMIN_EMAIL);
    return;
  }

  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hashed, "admin"]
  );

  console.log("🚀 Admin creado:", process.env.ADMIN_EMAIL);
}
