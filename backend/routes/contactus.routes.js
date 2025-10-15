import { Router } from "express";
import { sendContactEmail } from "../config/mailer.js";

const router = Router();

// Ruta para recibir mensajes de contacto
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    await sendContactEmail({ name, email, phone, message });

    res.json({ message: "Mensaje enviado correctamente" });
  } catch (err) {
    console.error("Error enviando correo:", err);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
});

export default router;
