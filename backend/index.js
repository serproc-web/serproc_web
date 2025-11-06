import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import { seedAdmin } from "./config/seedAdmin.js";
import ticketRoutes from "./routes/ticket.routes.js";
import contactusRoutes from "./routes/contactus.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";
import configurationRoutes from "./routes/configuration.routes.js";
import crmRoutes from "./routes/crm.routes.js";

// 🔥 NUEVO: Importar el scheduler de notificaciones
import { startNotificationScheduler } from "./jobs/reminders.job.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/* ------------------------- CORS dinámico (Express 5) ------------------------ */
const allowed = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isAllowed = (origin) =>
  allowed.includes("*") || (origin && allowed.includes(origin));

// Ponemos ACAO antes para todas las requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
});

// cors() para requests normales
app.use(
  cors({
    origin: (origin, cb) => cb(null, isAllowed(origin) ? origin : false),
    credentials: true,
  })
);

// Preflight universal con headers completos (sin usar "*")
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    if (!isAllowed(origin)) return res.sendStatus(403);

    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(204);
  }
  next();
});

/* ------------------------ Seguridad + logs + parsers ------------------------ */
app.set("trust proxy", 1); // Render / proxies
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));

app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - t0;
    console.log(
      `[SLOWLOG] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${ms}ms`
    );
  });
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------- Rutas ---------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/contactus", contactusRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/config", configurationRoutes);

/* ------------------------------ Health & ping ------------------------------ */
app.get("/health", (_req, res) => 
  res.json({ 
    status: "ok",
    notifications: "active",
    timestamp: new Date().toISOString()
  })
);

app.get("/api/ping", (_req, res) =>
  res.json({ 
    status: "ok", 
    db: "running",
    notifications: "active"
  })
);

/* ---------------------------- 404 y error global --------------------------- */
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

/* --------------------------------- Start ---------------------------------- */
app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  
  try {
    await seedAdmin();
    console.log("✅ seedAdmin listo");
  } catch (e) {
    console.error("❌ seedAdmin error:", e.message);
  }

  // 🔥 NUEVO: Iniciar el scheduler de notificaciones
  try {
    startNotificationScheduler();
    console.log("🔔 Sistema de notificaciones activo");
    console.log(`📧 Emails configurados con ${process.env.BREVO_API_KEY ? 'Brevo' : 'sin API key'}`);
  } catch (e) {
    console.error("❌ Error iniciando scheduler de notificaciones:", e.message);
  }
});

// 🔥 OPCIONAL: Para testing (descomentar si necesitas testing cada minuto)
// import { startTestScheduler } from "./jobs/reminders.job.js";
// startTestScheduler();

export default app;