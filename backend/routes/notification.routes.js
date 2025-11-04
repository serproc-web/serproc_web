import { Router } from "express";
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationSettings,
  saveNotificationSettings,
  markSent,
} from "../models/notification.model.js";
import { sendMail } from "../config/mailer.js";

const router = Router();

// ---------- CRUD ----------
router.get("/", async (req, res) => {
  const rows = await getNotifications();
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const row = await getNotification(req.params.id);
  if (!row) return res.status(404).json({ error: "Notificación no encontrada" });
  res.json(row);
});

router.post("/", async (req, res) => {
  const id = await createNotification(req.body);
  res.status(201).json({ id });
});

router.put("/:id", async (req, res) => {
  await updateNotification(req.params.id, req.body);
  res.json({ message: "Notificación actualizada" });
});

router.delete("/:id", async (req, res) => {
  await deleteNotification(req.params.id);
  res.json({ message: "Notificación eliminada" });
});

// ---------- Settings ----------
router.get("/settings", async (req, res) => {
  const cfg = await getNotificationSettings();
  res.json(
    cfg || { intervalo: 24, enviar_panel: 1, enviar_correo: 0 }
  );
});

router.put("/settings", async (req, res) => {
  await saveNotificationSettings(req.body);
  res.json({ message: "Configuración guardada" });
});

// ---------- Reenviar (marca como enviado y opcionalmente manda correo) ----------
router.post("/:id/resend", async (req, res) => {
  const n = await getNotification(req.params.id);
  if (!n) return res.status(404).json({ error: "Notificación no encontrada" });

  const cfg = await getNotificationSettings();
  const enviarCorreo = cfg?.enviar_correo === 1 || cfg?.enviar_correo === true;

  if (enviarCorreo && n.destinatario) {
    try {
      // Usar el nuevo sistema de mailer (soporta Brevo API o SMTP)
      await sendMail({
        to: n.destinatario,
        subject: `[${n.tipo || "Notificación"}] Serproc Consulting`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; padding:24px; background:#0b1220;">
            <div style="max-width:560px;margin:auto;background:#0f172a;border:1px solid rgba(255,255,255,.1);border-radius:16px;">
              <div style="padding:24px 24px 8px 24px;">
                <h2 style="margin:0;color:#e2e8f0;font-weight:700;">${n.tipo || "Notificación"}</h2>
                <p style="margin:8px 0 0 0;color:#94a3b8;font-size:14px;">Enviada por Serproc Consulting</p>
              </div>
              <div style="padding:16px 24px 24px 24px;color:#cbd5e1;line-height:1.6;">
                ${n.mensaje || "Sin mensaje"}
              </div>
              <div style="padding:16px 24px;color:#94a3b8;border-top:1px solid rgba(255,255,255,.08);font-size:12px;">
                Enviado automáticamente según su configuración. <br>
                <span style="color:#64748b;">© ${new Date().getFullYear()} Serproc Consulting</span>
              </div>
            </div>
          </div>
        `,
        text: `
${n.tipo || "Notificación"} - Serproc Consulting

${n.mensaje || "Sin mensaje"}

---
Enviado automáticamente según su configuración.
© ${new Date().getFullYear()} Serproc Consulting
        `.trim(),
      });

      await markSent(n.id, "correo");
      console.log(`[notification] ✅ Email enviado a ${n.destinatario} - Tipo: ${n.tipo}`);
      return res.json({ 
        message: "Notificación reenviada por correo",
        destinatario: n.destinatario,
        tipo: n.tipo
      });
    } catch (err) {
      console.error(`[notification] ❌ Error enviando a ${n.destinatario}:`, err.message);
      return res.status(500).json({ 
        error: "Error enviando correo", 
        detail: err.message 
      });
    }
  }

  // Si no hay correo o está deshabilitado, solo marcamos como enviado (panel)
  await markSent(n.id, "panel");
  res.json({ message: "Notificación marcada como enviada (panel)" });
});

export default router;