import pool from "../config/db.js";

// Util para medir tiempos en logs (puedes quitarlo luego)
const bench = (label) => {
  const t0 = Date.now();
  return () => console.log(`[DB] ${label} ${Date.now() - t0}ms`);
};

export const findUserByEmail = async (email) => {
  const end = bench("findUserByEmail");
  try {
    // LIMIT 1 + columnas necesarias = más rápido
    const [rows] = await pool.execute(
      "SELECT id, name, email, password, role, is_verified, verification_code FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0];
  } finally {
    end();
  }
};

// Crea y devuelve el insertId
export const createUser = async (name, email, hashedPassword, role, verificationCode) => {
  const end = bench("createUser");
  try {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role, is_verified, verification_code) VALUES (?, ?, ?, ?, 0, ?)",
      [name, email, hashedPassword, role, verificationCode]
    );
    return result.insertId;
  } finally {
    end();
  }
};

export async function getUserById(id) {
  const end = bench("getUserById");
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, role FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0];
  } finally {
    end();
  }
}

export async function updateUser(id, data) {
  const end = bench("updateUser");
  try {
    const { name, email, phone } = data;
    await pool.execute(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, id]
    );
  } finally {
    end();
  }
}

export async function updatePassword(id, hashedPassword) {
  const end = bench("updatePassword");
  try {
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
  } finally {
    end();
  }
}
