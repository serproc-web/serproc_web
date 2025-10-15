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
import "./jobs/reminders.job.js";
import configurationRoutes from "./routes/configuration.routes.js";
import crmRoutes from "./routes/crm.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- CORS dinámico desde env ---
const allowed = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.includes("*")
      ? true
      : (origin, cb) => {
          // Permite llamadas sin Origin (curl, health checks)
          if (!origin) return cb(null, true);
          return cb(null, allowed.includes(origin));
        },
    credentials: true,
  })
);

// --- Seguridad y logs ---
app.set("trust proxy", 1); // Render / proxies
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));

// --- Parsers ---
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Rutas API ---
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/contactus", contactusRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/config", configurationRoutes);

// --- Health & ping ---
app.get("/health", (_req, res) => res.send("ok"));
app.get("/api/ping", (_req, res) => res.json({ status: "ok", db: "running" }));

// --- Start ---
app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  try {
    await seedAdmin();
    console.log("✅ seedAdmin listo");
  } catch (e) {
    console.error("❌ seedAdmin error:", e.message);
  }
});
