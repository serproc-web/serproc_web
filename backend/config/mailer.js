// mailer.js
import dotenv from "dotenv";

dotenv.config();

/* ─────────────────────────────  Configuración  ───────────────────────────── */

const BRAND = {
  name: process.env.BRAND_NAME || "Serproc Consulting",
  url: process.env.BRAND_URL || "https://serproc.onrender.com",
  logo: process.env.BRAND_LOGO || "",
};

const FROM = (() => {
  const raw = process.env.EMAIL_FROM || `${BRAND.name} <no-reply@example.com>`;
  if (/<.+>/.test(raw)) return raw;
  return `${BRAND.name} <${raw}>`;
})();

/* ─────────────────────────────  Brevo API  ───────────────────────────── */

async function sendViaBrevo({ to, subject, text, html, attachments = [] }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY no configurada");
  }

  const url = "https://api.brevo.com/v3/smtp/email";

  const mappedAttachments = (attachments || []).map((a) => {
    let contentBase64 = "";
    if (a?.content) {
      contentBase64 = Buffer.isBuffer(a.content)
        ? a.content.toString("base64")
        : Buffer.from(String(a.content)).toString("base64");
    }
    return { name: a?.filename || a?.name || "adjunto", content: contentBase64 };
  });

  const senderName = (FROM.split("<")[0] || "").replace(/"/g, "").trim() || BRAND.name;
  const senderEmail = (FROM.match(/<(.+?)>/) || [])[1] || FROM;

  const body = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html || undefined,
    textContent: text || toPlainText(html) || undefined,
    ...(mappedAttachments.length > 0 && { attachment: mappedAttachments }),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text().catch(() => "");
  
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("BREVO_API_KEY inválida o expirada");
    }
    if (res.status === 400 && responseText.includes("sender")) {
      throw new Error(`Email sender '${senderEmail}' no verificado en Brevo`);
    }
    throw new Error(`Brevo ${res.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return { ok: true, provider: "brevo", id: data.messageId };
}

/* ─────────────────────────────  Helpers  ───────────────────────────── */

function toPlainText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (m) => ({ 
    "&": "&amp;", 
    "<": "&lt;", 
    ">": "&gt;", 
    '"': "&quot;", 
    "'": "&#39;" 
  }[m]));

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
            <div style="font-size:12px; color:#6b7280;">© ${new Date().getFullYear()} ${BRAND.name}</div>
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
    return { disabled: true };
  }

  const opts = { to, subject, html, text, attachments };
  let lastErr;

  for (let i = 0; i < 2; i++) {
    try {
      return await sendViaBrevo(opts);
    } catch (e) {
      lastErr = e;
      if (i === 0) await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw lastErr;
}

/* ─────────────────────────────  Emails predefinidos  ───────────────────────────── */

export async function sendVerificationEmail(to, code) {
  const contentHTML = `
    <p>Gracias por registrarte en <strong>${BRAND.name}</strong>.</p>
    <p>Usa este código para verificar tu cuenta:</p>
    <div style="font-size:32px; letter-spacing:8px; font-weight:800; color:#1F6FEB; text-align:center; margin:20px 0; padding:16px; background:#f0f9ff; border-radius:12px;">${code}</div>
    <p style="margin:16px 0;">O haz clic en el siguiente botón:</p>
    <div style="text-align:center; margin:20px 0;">
      <a href="${BRAND.url}/verify?code=${code}" class="btn" style="background:#1F6FEB; color:#fff; padding:14px 32px; border-radius:10px; text-decoration:none; display:inline-block; font-weight:600;">✓ Verificar mi cuenta</a>
    </div>
    <p class="muted" style="font-size:13px; color:#6b7280; text-align:center;">⏱️ El código expira en <strong>10 minutos</strong></p>
  `;

  const html = emailTemplate({
    title: "🔐 Verifica tu cuenta",
    preheader: `Tu código de verificación: ${code}`,
    contentHTML,
  });

  return deliver({ to, subject: `Verificación de cuenta - ${BRAND.name}`, html });
}

export async function resendVerificationEmail(to, code) {
  return sendVerificationEmail(to, code);
}

export async function sendContactEmail({ name, email, phone, message }) {
  const dest = process.env.SUPPORT_TO || "serproc.noreply@gmail.com";

  const contentHTML = `
    <p><strong>📩 Nuevo mensaje desde el formulario de contacto</strong></p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; font-size:14px; margin-top:16px;">
      <tr><td style="padding:10px; background:#f9fafb; border-left:3px solid #1F6FEB;"><strong>👤 Nombre:</strong> ${escapeHtml(name)}</td></tr>
      <tr><td style="padding:10px; background:#ffffff;"><strong>✉️ Correo:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#2563eb;">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:10px; background:#f9fafb;"><strong>📱 Teléfono:</strong> ${escapeHtml(phone || "No especificado")}</td></tr>
      <tr><td style="padding:16px 10px;"><strong>💬 Mensaje:</strong><br><div style="background:#f4f6f8; padding:16px; border-radius:8px; margin-top:8px; line-height:1.6;">${escapeHtml(message || "").replace(/\n/g, "<br/>")}</div></td></tr>
    </table>
  `;

  const html = emailTemplate({ 
    title: "📬 Nuevo mensaje de contacto", 
    preheader: `Mensaje de ${name}`, 
    contentHTML 
  });

  return deliver({ 
    to: dest, 
    subject: `📩 Nuevo mensaje de contacto - ${name}`, 
    html 
  });
}

/* ─────────────────────────────  API pública  ───────────────────────────── */

export async function sendMail(opts) {
  return deliver(opts);
}

export async function mailHealth() {
  try {
    if (!process.env.BREVO_API_KEY) {
      return { ok: false, provider: "brevo", error: "BREVO_API_KEY no configurada" };
    }
    return { ok: true, provider: "brevo" };
  } catch (e) {
    return { ok: false, provider: "brevo", error: e.message };
  }
}

export async function verifyMailer() {
  return mailHealth();
}