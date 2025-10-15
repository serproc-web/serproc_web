import { Router } from "express";
import { createContact, getContacts, deleteContact, updateContact } from "../models/contact.model.js";

const router = Router();

// Obtener todos los contactos
router.get("/", async (req, res) => {
  try {
    const contacts = await getContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo contacto
router.post("/", async (req, res) => {
  try {
    const { name, company, phone, email, notes } = req.body;
    const id = await createContact(name, company, phone, email, notes);
    res.status(201).json({ message: "Contacto creado", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar contacto
router.put("/:id", async (req, res) => {
  try {
    const { name, company, phone, email, notes } = req.body;
    await updateContact(req.params.id, name, company, phone, email, notes);
    res.json({ message: "Contacto actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar contacto
router.delete("/:id", async (req, res) => {
  try {
    await deleteContact(req.params.id);
    res.json({ message: "Contacto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
