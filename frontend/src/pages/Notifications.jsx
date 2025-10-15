import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { Plus, Edit, Trash2, Save, XCircle, Home, RefreshCcw } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    fecha: "",
    tipo: "",
    destinatario: "",
    estado: "Pendiente",
    mensaje: "",
  });
  const [config, setConfig] = useState({ intervalo: 24, enviar_panel: true, enviar_correo: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchConfig();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch {
      toast.error("Error cargando notificaciones");
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get("/notifications/settings");
      setConfig({
        intervalo: Number(res.data?.intervalo ?? 24),
        enviar_panel: !!res.data?.enviar_panel,
        enviar_correo: !!res.data?.enviar_correo,
      });
    } catch {
      toast.error("Error cargando configuración");
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setEditing(null);
    setForm({ fecha: "", tipo: "", destinatario: "", estado: "Pendiente", mensaje: "" });
  };

  const saveNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/notifications/${editing}`, form);
        toast.success("Notificación actualizada");
      } else {
        await api.post("/notifications", form);
        toast.success("Notificación creada");
      }
      resetForm();
      fetchNotifications();
    } catch {
      toast.error("Error guardando notificación");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Notificación eliminada");
      fetchNotifications();
    } catch {
      toast.error("Error eliminando notificación");
    }
  };

  const resendNotification = async (id) => {
    try {
      const res = await api.post(`/notifications/${id}/resend`);
      toast.success(res.data?.message || "Reenvío realizado");
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al reenviar");
    }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    try {
      await api.put("/notifications/settings", {
        intervalo: Number(config.intervalo),
        enviar_panel: !!config.enviar_panel,
        enviar_correo: !!config.enviar_correo,
      });
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error guardando configuración");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins text-gray-200">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20">
        <h1 className="text-3xl font-bold text-white drop-shadow">Gestión de Notificaciones</h1>
        <Link
          to="/home"
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          <Home size={18} /> Inicio
        </Link>
      </header>

      <div className="grid xl:grid-cols-2 gap-10 p-8">
        {/* Formulario */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {editing ? "Editar Notificación" : "Nueva Notificación"}
          </h2>
          <form onSubmit={saveNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                required
              />
              <input
                type="text"
                name="tipo"
                placeholder="Tipo (Recordatorio, Alerta...)"
                value={form.tipo}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                required
              />
              <input
                type="text"
                name="destinatario"
                placeholder="Destinatario (email recomendado)"
                value={form.destinatario}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:outline-none md:col-span-2"
                required
              />
            </div>

            <textarea
              name="mensaje"
              placeholder="Mensaje"
              value={form.mensaje}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:outline-none resize-none"
              rows={4}
              required
            />

            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white shadow hover:scale-105 transition"
                disabled={loading}
              >
                <Save size={16} />
                {editing ? "Guardar cambios" : "Registrar"}
              </button>
              {editing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-5 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition"
                >
                  <XCircle size={16} />
                  Cancelar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      fecha: "",
                      tipo: "",
                      destinatario: "",
                      estado: "Pendiente",
                      mensaje: "",
                    })
                  }
                  className="flex items-center gap-2 px-5 py-2 bg-slate-600 rounded-lg text-white hover:bg-slate-700 transition"
                >
                  <Plus size={16} />
                  Nuevo
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Configuración */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Configuración</h2>
          <form onSubmit={saveConfig} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-white/80">Intervalo de envío</label>
              <select
                name="intervalo"
                value={config.intervalo}
                onChange={(e) => setConfig((c) => ({ ...c, intervalo: Number(e.target.value) }))}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/20 focus:ring-2 focus:ring-cyan-400"
              >
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
                <option value={72}>72 horas</option>
              </select>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!config.enviar_panel}
                  onChange={(e) => setConfig((c) => ({ ...c, enviar_panel: e.target.checked }))}
                />
                <span>Panel interno</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!config.enviar_correo}
                  onChange={(e) => setConfig((c) => ({ ...c, enviar_correo: e.target.checked }))}
                />
                <span>Correo electrónico</span>
              </label>
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow hover:scale-105 transition">
              Guardar configuración
            </button>
          </form>
        </motion.div>
      </div>

      {/* DataGrid */}
      <div className="p-8">
        <div className="overflow-x-auto bg-white/90 rounded-2xl shadow-2xl">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Destinatario</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Mensaje</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              <AnimatePresence>
                {notifications.map((n) => (
                  <motion.tr
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-100"
                  >
                    <td className="px-4 py-2">{n.fecha ? String(n.fecha).split("T")[0] : ""}</td>
                    <td className="px-4 py-2">{n.tipo}</td>
                    <td className="px-4 py-2">{n.destinatario}</td>
                    <td className="px-4 py-2 font-semibold">{n.estado}</td>
                    <td className="px-4 py-2">{n.mensaje}</td>
                    <td className="px-4 py-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setEditing(n.id);
                          setForm({
                            fecha: n.fecha ? String(n.fecha).split("T")[0] : "",
                            tipo: n.tipo || "",
                            destinatario: n.destinatario || "",
                            estado: n.estado || "Pendiente",
                            mensaje: n.mensaje || "",
                            sent_at: n.sent_at || null,
                            sent_channel: n.sent_channel || null,
                          });
                        }}
                        className="p-2 bg-cyan-500 rounded-lg text-white hover:bg-cyan-600"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => resendNotification(n.id)}
                        className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700"
                        title="Reenviar"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <footer className="text-center text-xs text-white/70 py-6 border-t border-white/20">
        © 2025 Serproc Consulting | Privacidad | Términos
      </footer>
    </div>
  );
}
