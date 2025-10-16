import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ─────────────────────────────  Transporter (Brevo SMTP)  ─────────────────────────────
   Usa tus envs:
   - SMTP_HOST=smtp-relay.brevo.com
   - SMTP_PORT=587           (465 => secure:true)
   - SMTP_USER=...           (identificador SMTP de Brevo)
   - SMTP_PASS=...           (SMTP key)
   - SMTP_FROM="Serproc Consulting <no-reply@tudominio.com>"
   - DISABLE_EMAIL=false     (true = no envía nada)
   - SUPPORT_TO=soporte@tudominio.com (destino para contact form)
*/
const secure = String(process.env.SMTP_PORT || "587") === "465";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure, // 465 -> true, 587 -> false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 2,
  maxMessages: 50,
  connectionTimeout: 7000,
  socketTimeout: 7000,
  tls: {
    minVersion: "TLSv1.2",
  },
});

/* ─────────────────────────────  Helpers  ───────────────────────────── */

const BRAND = {
  name: process.env.BRAND_NAME || "Serproc Consulting",
  url: process.env.BRAND_URL || "https://serproc.onrender.com",
  logo: process.env.BRAND_LOGO || null, // URL pública opcional
  from: process.env.SMTP_FROM || "Serproc <no-reply@example.com>",
};

// texto alterno simple (fallback para clientes sin HTML)
const toPlainText = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

// plantilla responsive + dark-mode friendly, inline styles (mejor deliverability)
const emailTemplate = ({ title, preheader = "", contentHTML }) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    /* Reset básico */
    body,table,td,a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100% }
    table,td { mso-table-lspace:0pt; mso-table-rspace:0pt }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none }
    body { margin:0; padding:0; width:100%!important; }
    /* Dark-mode tweaks */
    @media (prefers-color-scheme: dark) {
      .card { background:#101316 !important; color:#e6e6e6 !important; }
      .muted { color:#a0a7b4 !important; }
      .title { color:#60a5fa !important; }
      .btn { background:#2563eb !important; color:#fff !important; }
    }
  </style>
</head>
<body style="background:#0ea5e9; background:linear-gradient(135deg,#1F6FEB,#00C9FF); padding:24px; font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
  <!-- Preheader (hidden) -->
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
              <a href="${BRAND.url}" style="color:#2563eb; text-decoration:none;">${BRAND.url.replace(/^https?:\/\//,'')}</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// envío con reintentos + headers útiles
async function deliver({ to, subject, html, text }) {
  if (String(process.env.DISABLE_EMAIL || "false") === "true") {
    console.log(`[mail:disabled] ${subject} -> ${to}`);
    return { disabled: true };
  }

  const payload = {
    from: BRAND.from,
    to,
    subject,
    html,
    text: text || toPlainText(html),
    headers: {
      "X-Entity-Ref-ID": cryptoRandom(),        // ayuda a agrupar
      "List-Unsubscribe": `<mailto:${(BRAND.from.match(/<(.+?)>/)||[])[1] || "no-reply@example.com"}?subject=unsubscribe>`,
    },
  };

  // 2 intentos rápidos
  let lastErr;
  for (let i = 0; i < 2; i++) {
    try {
      const info = await transporter.sendMail(payload);
      if (info?.messageId) {
        console.log(`[mail] OK ${subject} -> ${to} (${info.messageId})`);
        return info;
      }
    } catch (e) {
      lastErr = e;
      console.error(`[mail] intento ${i + 1} falló:`, e.message);
    }
  }
  throw lastErr;
}

function cryptoRandom() {
  // id corto legible para trazabilidad en logs
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ─────────────────────────────  Emails listos para usar  ───────────────────────────── */

// Verificación con código (botón + código grande de fallback)
export async function sendVerificationEmail(to, code) {
  const contentHTML = `
    <p>Gracias por registrarte en <strong>${BRAND.name}</strong>.</p>
    <p>Usa este código para verificar tu cuenta:</p>
    <div style="font-size:28px; letter-spacing:10px; font-weight:800; color:#1F6FEB; text-align:center; margin:16px 0;">${code}</div>
    <p style="margin:16px 0;">O haz clic en el siguiente botón y pega tu código:</p>
    <div style="text-align:center; margin:18px 0;">
      <a href="${BRAND.url}/verify" class="btn" style="background:#1F6FEB; color:#fff; padding:12px 18px; border-radius:10px; text-decoration:none; display:inline-block; font-weight:600;">Verificar cuenta</a>
    </div>
    <p class="muted" style="font-size:12px; color:#6b7280;">El código expira en <strong>10 minutos</strong>.</p>
  `;

  const html = emailTemplate({
    title: "Verifica tu cuenta",
    preheader: "Tu código de verificación de Serproc",
    contentHTML,
  });

  return deliver({
    to,
    subject: "Verificación de tu cuenta - Serproc",
    html,
  });
}

// Reenvío de código (por si lo agregas en tu API)
export async function resendVerificationEmail(to, code) {
  return sendVerificationEmail(to, code);
}

// Contacto desde el sitio (envíalo a tu buzón de soporte)
export async function sendContactEmail({ name, email, phone, message }) {
  const dest = process.env.SUPPORT_TO || email; // cambia a tu inbox si prefieres
  const contentHTML = `
    <p><strong>Nuevo mensaje desde el formulario de contacto</strong></p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; font-size:14px;">
      <tr><td style="padding:6px 0;"><strong>Nombre:</strong> ${name}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Correo:</strong> ${email}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Teléfono:</strong> ${phone || "No especificado"}</td></tr>
      <tr><td style="padding:10px 0;"><strong>Mensaje:</strong><br>
        <div style="background:#f4f6f8; padding:12px; border-radius:8px; margin-top:8px;">${(message || "").replace(/\n/g, "<br/>")}</div>
      </td></tr>
    </table>
  `;

  const html = emailTemplate({
    title: "📬 Nuevo mensaje de contacto",
    preheader: `Mensaje de ${name}`,
    contentHTML,
  });

  return deliver({
    to: dest,
    subject: `Nuevo mensaje de contacto - ${name}`,
    html,
  });
}

/* ─────────────────────────────  Diagnóstico  ───────────────────────────── */
export async function verifyMailer() {
  try {
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
