// routes/mailTest.js
import { Router } from "express";
import { mailHealth, sendMail } from "../mailer.js";

const router = Router();

router.get("/api/mail/health", async (_req, res) => {
  try {
    const status = await mailHealth();
    res.json(status);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/api/mail/test", async (req, res) => {
  try {
    const to = req.query.to || req.body?.to;
    if (!to) return res.status(400).json({ ok: false, error: "Falta ?to=" });
    const result = await sendMail({
      to,
      subject: "✅ Prueba de correo",
      html: "<h1>Hola</h1><p>Esto es una prueba desde el backend.</p>",
    });
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
