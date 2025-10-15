import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0];
};

// 👇 ahora recibe verificationCode
export const createUser = async (name, email, hashedPassword, role, verificationCode) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role, is_verified, verification_code) VALUES (?, ?, ?, ?, 0, ?)",
    [name, email, hashedPassword, role, verificationCode]
  );
  return result.insertId;
};

// Obtener usuario por ID
export async function getUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, role FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
}

// Actualizar datos del usuario
export async function updateUser(id, data) {
  const { name, email, phone } = data;
  await pool.query(
    "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
    [name, email, phone, id]
  );
}

// Actualizar contraseña
export async function updatePassword(id, hashedPassword) {
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    hashedPassword,
    id,
  ]);
}