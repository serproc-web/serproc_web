import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // serproc.noreply@gmail.com
    pass: process.env.EMAIL_PASS, // contraseña de aplicación
  },
});

// 🎨 Plantilla base moderna
const emailTemplate = (title, content) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; text-align: center; padding: 40px; background: linear-gradient(135deg, #1F6FEB, #00C9FF);">
    <div style="background: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); max-width: 500px; margin: auto;">
      <h2 style="color:#1F6FEB; margin-bottom: 16px;">${title}</h2>
      <div style="color:#444; font-size: 15px; line-height: 1.6; text-align:left;">
        ${content}
      </div>
      <p style="font-size: 11px; color:#999; margin-top: 30px; text-align:center;">
        © 2025 Serproc Consulting · Innovación tecnológica y consultoría SAP
      </p>
    </div>
  </div>
`;

// 📩 Correo de verificación
export const sendVerificationEmail = async (to, code) => {
  const content = `
    <p>Gracias por registrarte en <strong>Serproc Consulting</strong>.</p>
    <p>Ingresa este código para verificar tu cuenta:</p>
    <h1 style="letter-spacing: 12px; color:#1F6FEB; text-align:center;">${code}</h1>
    <p style="font-size: 13px; color:#666;">Este código expira en <strong>10 minutos</strong>.</p>
  `;

  await transporter.sendMail({
    from: `"Serproc Consulting" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verificación de tu cuenta - Serproc",
    html: emailTemplate("Bienvenido a Serproc Consulting 🚀", content),
  });
};

// 📩 Correo de contacto (cuando alguien escribe desde Contact.jsx)
export const sendContactEmail = async ({ name, email, phone, message }) => {
  const content = `
    <p><strong>Nuevo mensaje recibido desde el formulario de contacto:</strong></p>
    <p><strong>Nombre:</strong> ${name}</p>
    <p><strong>Correo:</strong> ${email}</p>
    <p><strong>Teléfono:</strong> ${phone || "No especificado"}</p>
    <p><strong>Mensaje:</strong></p>
    <div style="background:#f4f6f8; padding:12px; border-radius:8px; margin-top:8px;">
      ${message}
    </div>
  `;

  await transporter.sendMail({
    from: `"Serproc Contacto" <${process.env.EMAIL_USER}>`,
    to: "serproc.noreply@gmail.com",
    subject: `Nuevo mensaje de contacto - ${name}`,
    html: emailTemplate("📬 Nuevo mensaje de contacto", content),
  });
};
