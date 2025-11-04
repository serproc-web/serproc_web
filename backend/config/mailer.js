import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ─────────────────────────────  Configuración  ───────────────────────────── */

const PROVIDER = process.env.EMAIL_PROVIDER || "smtp"; // 'brevo' o 'smtp'
const BRAND = {
  name: process.env.BRAND_NAME || "Serproc Consulting",
  url: process.env.BRAND_URL || "https://serproc.onrender.com",
  logo: process.env.BRAND_LOGO || null,
  from: process.env.SMTP_FROM || `"Serproc Consulting" <${process.env.SMTP_USER || "serproc.noreply@gmail.com"}>`,
};

/* ─────────────────────────────  Brevo API  ───────────────────────────── */

async function sendViaBrevo({ to, subject, text, html, attachments = [] }) {
  const url = "https://api.brevo.com/v3/smtp/email";

  const mappedAttachments = (attachments || []).map((a) => {
    let contentBase64 = "";
    if (a?.content) {
      contentBase64 = Buffer.isBuffer(a.content)
        ? a.content.toString("base64")
        : Buffer.from(String(a.content)).toString("base64");
    }
    return {
      name: a?.filename || a?.name || "adjunto",
      content: contentBase64,
    };
  });

  const fromMatch = BRAND.from.match(/^"?([^"<]+)"?\s*<(.+?)>$/);
  const senderName = fromMatch ? fromMatch[1].trim() : BRAND.name;
  const senderEmail = fromMatch ? fromMatch[2] : BRAND.from;

  const body = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html || undefined,
    textContent: text || undefined,
    attachment: mappedAttachments.length ? mappedAttachments : undefined,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Brevo ${res.status}: ${errText}`);
  }

  const result = await res.json();
  console.log(`[mail:brevo] ✅ ${subject} -> ${to} (${result.messageId || "sent"})`);
  return result;
}

/* ─────────────────────────────  SMTP (Nodemailer)  ───────────────────────────── */

const secure = String(process.env.SMTP_PORT || "587") === "465";

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  pool: true,
  maxConnections: 2,
  maxMessages: 50,
  connectionTimeout: 7000,
  socketTimeout: 7000,
  requireTLS: !secure,
  tls: {
    minVersion: "TLSv1.2",
  },
});

async function sendViaSMTP({ to, subject, text, html, attachments = [] }) {
  const payload = {
    from: BRAND.from,
    to,
    subject,
    html,
    text: text || toPlainText(html),
    attachments,
    headers: {
      "X-Entity-Ref-ID": cryptoRandom(),
      "List-Unsubscribe": `<mailto:${(BRAND.from.match(/<(.+?)>/) || [])[1] || "no-reply@example.com"}?subject=unsubscribe>`,
    },
  };

  const info = await smtpTransporter.sendMail(payload);
  console.log(`[mail:smtp] ✅ ${subject} -> ${to} (${info.messageId})`);
  return info;
}

/* ─────────────────────────────  Helpers  ───────────────────────────── */

const toPlainText = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[m]);

/* ─────────────────────────────  Template HTML  ───────────────────────────── */

const emailTemplate = ({ title, preheader = "", contentHTML }) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body,table,td,a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100% }
    table,td { mso-table-lspace:0pt; mso-table-rspace:0pt }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none }
    body { margin:0; padding:0; width:100%!important; }
    @media (prefers-color-scheme: dark) {
      .card { background:#101316 !important; color:#e6e6e6 !important; }
      .muted { color:#a0a7b4 !important; }
      .title { color:#60a5fa !important; }
      .btn { background:#2563eb !important; color:#fff !important; }
    }
  </style>
</head>
<body style="background:#0ea5e9; background:linear-gradient(135deg,#1F6FEB,#00C9FF); padding:24px; font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
  <div style="display:none; max-height:0; overflow:hidden;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr><td align="center">
      <table role="presentation" width="600" class="card" cellspacing="0" cellpadding="0" style="background:#fff; border-radius:16px; box-shadow:0 8px 28px rgba(0,0,0,.12); overflow:hidden;">
        <tr>
          <td style="padding:24px 24px 8px; text-align:center;">
            ${BRAND.logo ? `<img src="${BRAND.logo}" alt="${BRAND.name}" height="40" style="display:inline-block; margin-bottom:8px;" />` : ""}
            <div class="title" style="font-size:22px; font-weight:700; color:#1F6FEB; margin:8px 0;">${title}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 24px 24px; color:#374151; font-size:15px; line-height:1.6;">
            ${contentHTML}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 24px 24px; text-align:center;" class="muted">
            <div style="font-size:12px; color:#6b7280;">© ${new Date().getFullYear()} ${BRAND.name} · Innovación tecnológica y consultoría SAP</div>
            <div style="font-size:12px; margin-top:6px;">
              <a href="${BRAND.url}" style="color:#2563eb; text-decoration:none;">${BRAND.url.replace(/^https?:\/\//, "")}</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

/* ─────────────────────────────  Envío con reintentos  ───────────────────────────── */

async function deliver({ to, subject, html, text, attachments = [] }) {
  if (String(process.env.DISABLE_EMAIL || "false") === "true") {
    console.log(`[mail:disabled] 🚫 ${subject} -> ${to}`);
    return { disabled: true };
  }

  const opts = { to, subject, text, html, attachments };

  // 2 intentos con delay
  let lastErr;
  for (let i = 0; i < 2; i++) {
    try {
      if (PROVIDER === "brevo") {
        return await sendViaBrevo(opts);
      } else {
        return await sendViaSMTP(opts);
      }
    } catch (e) {
      lastErr = e;
      console.error(`[mail:${PROVIDER}] ❌ intento ${i + 1}/2 falló:`, e.message);
      if (i === 0) await new Promise((r) => setTimeout(r, 1000)); // espera 1s antes del retry
    }
  }
  throw lastErr;
}

/* ─────────────────────────────  Emails listos para usar  ───────────────────────────── */

// 📧 Email de verificación con código
export async function sendVerificationEmail(to, code) {
  const contentHTML = `
    <p>Gracias por registrarte en <strong>${BRAND.name}</strong>.</p>
    <p>Usa este código para verificar tu cuenta:</p>
    <div style="font-size:32px; letter-spacing:8px; font-weight:800; color:#1F6FEB; text-align:center; margin:20px 0; padding:16px; background:#f0f9ff; border-radius:12px;">${code}</div>
    <p style="margin:16px 0;">O haz clic en el siguiente botón:</p>
    <div style="text-align:center; margin:20px 0;">
      <a href="${BRAND.url}/verify?code=${code}" class="btn" style="background:#1F6FEB; color:#fff; padding:14px 32px; border-radius:10px; text-decoration:none; display:inline-block; font-weight:600; font-size:16px;">✓ Verificar mi cuenta</a>
    </div>
    <p class="muted" style="font-size:13px; color:#6b7280; text-align:center;">⏱️ El código expira en <strong>10 minutos</strong></p>
  `;

  const html = emailTemplate({
    title: "🔐 Verifica tu cuenta",
    preheader: `Tu código de verificación: ${code}`,
    contentHTML,
  });

  return deliver({
    to,
    subject: `Verificación de cuenta - ${BRAND.name}`,
    html,
  });
}

// 📧 Reenvío de código de verificación
export async function resendVerificationEmail(to, code) {
  return sendVerificationEmail(to, code);
}

// 📧 Formulario de contacto
export async function sendContactEmail({ name, email, phone, message }) {
  const dest = process.env.SUPPORT_TO || "admin@serproc.com";
  const contentHTML = `
    <p><strong>📩 Nuevo mensaje desde el formulario de contacto</strong></p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; font-size:14px; margin-top:16px;">
      <tr>
        <td style="padding:10px; background:#f9fafb; border-left:3px solid #1F6FEB;">
          <strong>👤 Nombre:</strong> ${escapeHtml(name)}
        </td>
      </tr>
      <tr>
        <td style="padding:10px; background:#ffffff;">
          <strong>✉️ Correo:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#2563eb;">${escapeHtml(email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px; background:#f9fafb;">
          <strong>📱 Teléfono:</strong> ${escapeHtml(phone || "No especificado")}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 10px;">
          <strong>💬 Mensaje:</strong><br>
          <div style="background:#f4f6f8; padding:16px; border-radius:8px; margin-top:8px; line-height:1.6;">${escapeHtml(message || "").replace(/\n/g, "<br/>")}</div>
        </td>
      </tr>
    </table>
    <div style="margin-top:20px; padding:12px; background:#eff6ff; border-radius:8px; text-align:center;">
      <a href="mailto:${escapeHtml(email)}" class="btn" style="background:#1F6FEB; color:#fff; padding:10px 24px; border-radius:8px; text-decoration:none; display:inline-block; font-weight:600;">↩️ Responder a ${escapeHtml(name)}</a>
    </div>
  `;

  const html = emailTemplate({
    title: "📬 Nuevo mensaje de contacto",
    preheader: `Mensaje de ${name}`,
    contentHTML,
  });

  return deliver({
    to: dest,
    subject: `📩 Nuevo mensaje de contacto - ${name}`,
    html,
  });
}

/* ─────────────────────────────  Envío genérico + Diagnóstico  ───────────────────────────── */

// Envío genérico para cualquier email personalizado
export async function sendMail(opts) {
  return deliver(opts);
}

// Health check del sistema de correos
export async function mailHealth() {
  try {
    if (PROVIDER === "brevo") {
      if (!process.env.BREVO_API_KEY) {
        return { 
          ok: false, 
          provider: "brevo", 
          error: "BREVO_API_KEY no configurada" 
        };
      }
      return { 
        ok: true, 
        provider: "brevo",
        message: "Brevo API configurada correctamente" 
      };
    } else {
      await smtpTransporter.verify();
      return { 
        ok: true, 
        provider: "smtp",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        message: "Conexión SMTP verificada correctamente"
      };
    }
  } catch (e) {
    return { 
      ok: false, 
      provider: PROVIDER, 
      error: e.message 
    };
  }
}

// Alias para compatibilidad
export async function verifyMailer() {
  return mailHealth();
}