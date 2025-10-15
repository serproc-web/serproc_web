import pool from "../config/db.js";

export const createContact = async (name, company, phone, email, notes) => {
  const [result] = await pool.query(
    "INSERT INTO contacts (name, company, phone, email, notes) VALUES (?, ?, ?, ?, ?)",
    [name, company, phone, email, notes]
  );
  return result.insertId;
};

export const getContacts = async () => {
  const [rows] = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
  return rows;
};

export const deleteContact = async (id) => {
  await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
};

export const updateContact = async (id, name, company, phone, email, notes) => {
  await pool.query(
    "UPDATE contacts SET name=?, company=?, phone=?, email=?, notes=? WHERE id=?",
    [name, company, phone, email, notes, id]
  );
};
