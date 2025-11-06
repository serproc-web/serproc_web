// backend/jobs/reminders.job.js
import cron from "node-cron";
import pool from "../config/db.js";
import { sendMail } from "../config/mailer.js";
import { 
  createNotification, 
  markSent, 
  getNotificationSettings 
} from "../models/notification.model.js";

/* ═══════════════════════════════════════════════════════════════════════════
   🔔 JOB 1: ACTUALIZAR RECORDATORIOS VENCIDOS (cada minuto)
═══════════════════════════════════════════════════════════════════════════ */
cron.schedule("* * * * *", async () => {
  try {
    const [rows] = await pool.query(
      "UPDATE reminders SET status='Vencido' WHERE status='Pendiente' AND TIMESTAMP(date, time) < NOW()"
    );

    if (rows.affectedRows > 0) {
      console.log(`⚡ Recordatorios vencidos actualizados: ${rows.affectedRows}`);
    }
  } catch (err) {
    console.error("❌ Error actualizando recordatorios vencidos:", err.message);
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   📧 JOB 2: NOTIFICACIONES DE TICKETS PENDIENTES (cada hora)
═══════════════════════════════════════════════════════════════════════════ */

// Template de email para ticket pendiente
function ticketPendingEmailTemplate(ticket) {
  const brandName = process.env.BRAND_NAME || "Serproc Consulting";
  const brandUrl = process.env.BRAND_URL || "https://serproc.onrender.com";

  return `
    <div style="font-family: Inter, Arial, sans-serif; padding:24px; background:#0b1220;">
      <div style="max-width:600px;margin:auto;background:#0f172a;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;">
        
        <!-- Header con alerta -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 20px; text-align:center;">
          <h1 style="margin:0; color:white; font-size:24px; font-weight:700;">
            ⚠️ Ticket Pendiente
          </h1>
          <p style="margin:8px 0 0 0; color:rgba(255,255,255,0.9); font-size:14px;">
            Requiere tu atención
          </p>
        </div>

        <!-- Contenido -->
        <div style="padding:24px; color:#cbd5e1; line-height:1.6;">
          <p style="margin:0 0 16px 0;">
            Hola <strong style="color:#e2e8f0;">${ticket.worker_name}</strong>,
          </p>
          
          <p style="margin:0 0 20px 0;">
            El siguiente ticket lleva <strong style="color:#ef4444; font-size:18px;">${ticket.hours_pending} horas</strong> en estado <span style="color:#f59e0b;">pendiente</span> y requiere tu atención:
          </p>

          <!-- Tabla de detalles -->
          <table style="width:100%; border-collapse:collapse; margin:20px 0;">
            <tr style="background:#1e293b;">
              <td style="padding:12px; font-weight:600; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,.08); width:140px;">
                Ticket #
              </td>
              <td style="padding:12px; color:#e2e8f0; border-bottom:1px solid rgba(255,255,255,.08);">
                ${ticket.numero || "Sin número"}
              </td>
            </tr>
            <tr>
              <td style="padding:12px; font-weight:600; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,.08); background:#0f172a;">
                Fecha
              </td>
              <td style="padding:12px; color:#e2e8f0; border-bottom:1px solid rgba(255,255,255,.08);">
                ${new Date(ticket.fecha).toLocaleDateString("es-ES", { 
                  day: "2-digit", 
                  month: "long", 
                  year: "numeric" 
                })}
              </td>
            </tr>
            <tr style="background:#1e293b;">
              <td style="padding:12px; font-weight:600; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,.08);">
                Cliente
              </td>
              <td style="padding:12px; color:#e2e8f0; border-bottom:1px solid rgba(255,255,255,.08);">
                ${ticket.cliente}
              </td>
            </tr>
            <tr>
              <td style="padding:12px; font-weight:600; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,.08); background:#0f172a;">
                Usuario Cliente
              </td>
              <td style="padding:12px; color:#e2e8f0; border-bottom:1px solid rgba(255,255,255,.08);">
                ${ticket.usuario_cliente || "No especificado"}
              </td>
            </tr>
            <tr style="background:#1e293b;">
              <td style="padding:12px 12px 12px 12px; font-weight:600; color:#94a3b8; vertical-align:top;">
                Actividad
              </td>
              <td style="padding:12px; color:#e2e8f0;">
                ${ticket.actividad}
              </td>
            </tr>
          </table>

          <!-- Botón de acción -->
          <div style="text-align:center; margin:30px 0 20px 0;">
            <a href="${brandUrl}/tickets" 
               style="display:inline-block; 
                      background:linear-gradient(135deg, #06b6d4, #3b82f6); 
                      color:white; 
                      padding:14px 32px; 
                      border-radius:10px; 
                      text-decoration:none; 
                      font-weight:600; 
                      box-shadow:0 4px 12px rgba(6,182,212,0.3);">
              📋 Ver Ticket en el Sistema
            </a>
          </div>

          <!-- Nota de recordatorio -->
          <div style="background:#422006; 
                      border-left:4px solid #f59e0b; 
                      padding:16px; 
                      border-radius:8px; 
                      margin:20px 0 0 0;">
            <p style="margin:0; color:#fbbf24; font-size:14px;">
              <strong>⏰ Recordatorio:</strong> Por favor, actualiza el estado del ticket una vez hayas completado la actividad.
            </p>
          </div>

          <p style="margin:24px 0 0 0; color:#64748b; font-size:13px;">
            Este es un mensaje automático del sistema de gestión de tickets.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:16px 24px; 
                    color:#64748b; 
                    border-top:1px solid rgba(255,255,255,.08); 
                    font-size:12px; 
                    text-align:center;">
          © ${new Date().getFullYear()} ${brandName} | Sistema de Notificaciones
        </div>
      </div>
    </div>
  `;
}

// Función principal para procesar notificaciones de tickets
async function processTicketNotifications() {
  try {
    console.log("🔔 [TICKETS] Verificando tickets pendientes...");
    
    // Obtener configuración
    const settings = await getNotificationSettings();
    
    if (!settings) {
      console.log("⚠️  [TICKETS] No hay configuración de notificaciones");
      return { processed: 0, sent: 0, message: "Sin configuración" };
    }

    if (!settings.enviar_correo) {
      console.log("⏸️  [TICKETS] Notificaciones por correo deshabilitadas");
      return { processed: 0, sent: 0, message: "Correos deshabilitados" };
    }

    const hoursThreshold = settings.intervalo || 24;
    
    // Obtener tickets pendientes que cumplan el criterio
    const [pendingTickets] = await pool.query(
      `SELECT 
        t.id, 
        t.numero, 
        t.fecha, 
        t.actividad, 
        t.cliente, 
        t.usuario_cliente,
        t.created_at,
        u.name as worker_name,
        u.email as worker_email,
        TIMESTAMPDIFF(HOUR, t.created_at, NOW()) as hours_pending
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.estado = 'pendiente'
        AND TIMESTAMPDIFF(HOUR, t.created_at, NOW()) >= ?
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.tipo = CONCAT('Ticket #', COALESCE(t.numero, t.id))
            AND n.estado = 'Enviado'
            AND DATE(n.sent_at) = CURDATE()
        )`,
      [hoursThreshold]
    );

    if (pendingTickets.length === 0) {
      console.log("✅ [TICKETS] No hay tickets pendientes para notificar");
      return { processed: 0, sent: 0, message: "Sin tickets pendientes" };
    }

    console.log(`📊 [TICKETS] Encontrados ${pendingTickets.length} tickets para notificar`);

    let sent = 0;
    let errors = 0;

    for (const ticket of pendingTickets) {
      try {
        // Crear registro de notificación
        const notificationId = await createNotification({
          fecha: new Date().toISOString().split("T")[0],
          tipo: `Ticket #${ticket.numero || ticket.id}`,
          destinatario: ticket.worker_email,
          estado: "Pendiente",
          mensaje: `Ticket pendiente desde hace ${ticket.hours_pending} horas - ${ticket.cliente}`,
        });

        // Enviar email
        const htmlContent = ticketPendingEmailTemplate(ticket);
        
        await sendMail({
          to: ticket.worker_email,
          subject: `⚠️ Ticket Pendiente #${ticket.numero || ticket.id} - ${ticket.cliente}`,
          html: htmlContent,
          text: `
Ticket Pendiente - Acción Requerida

Hola ${ticket.worker_name},

El ticket #${ticket.numero || ticket.id} lleva ${ticket.hours_pending} horas en estado pendiente.

Cliente: ${ticket.cliente}
Usuario: ${ticket.usuario_cliente || "No especificado"}
Actividad: ${ticket.actividad}
Fecha: ${new Date(ticket.fecha).toLocaleDateString("es-ES")}

Por favor, actualiza el estado del ticket una vez completada la actividad.

---
Este es un mensaje automático del sistema de gestión de tickets.
© ${new Date().getFullYear()} Serproc Consulting
          `.trim(),
        });

        // Marcar como enviada
        await markSent(notificationId, "email");
        sent++;

        console.log(`✅ [TICKETS] Email enviado a ${ticket.worker_email} para ticket #${ticket.numero || ticket.id}`);
      } catch (error) {
        errors++;
        console.error(`❌ [TICKETS] Error enviando notificación para ticket #${ticket.numero || ticket.id}:`, error.message);
      }
    }

    const result = {
      processed: pendingTickets.length,
      sent,
      errors,
      message: `Procesados: ${pendingTickets.length}, Enviados: ${sent}, Errores: ${errors}`,
    };

    console.log(`📊 [TICKETS] Resultado: ${result.message}`);
    return result;
  } catch (error) {
    console.error("❌ [TICKETS] Error procesando notificaciones:", error);
    throw error;
  }
}

// Ejecutar cada hora en el minuto 0
cron.schedule("0 * * * *", async () => {
  try {
    await processTicketNotifications();
  } catch (error) {
    console.error("❌ [CRON] Error en el scheduler de tickets:", error);
  }
});

console.log("✅ [CRON] Scheduler de notificaciones de tickets iniciado (cada hora)");

// Exportar para uso manual desde la API
export { processTicketNotifications };