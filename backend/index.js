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
import notificationRoutes from "./routes/notification.routes.js"; // 👈 CORRECTO
import reminderRoutes from "./routes/reminder.routes.js";
import "./jobs/reminders.job.js";
import configurationRoutes from "./routes/configuration.routes.js";
import crmRoutes from "./routes/crm.routes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/contactus", contactusRoutes);
app.use("/api/notifications", notificationRoutes); // 👈 AQUÍ ESTABA EL ERROR
app.use("/api/profile", profileRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/config", configurationRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", db: "running" });
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  await seedAdmin();
});
