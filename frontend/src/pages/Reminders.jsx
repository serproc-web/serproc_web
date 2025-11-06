import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
  Bell, Home, X, Plus, Edit, Trash2, Calendar, Clock, 
  CheckCircle, AlertCircle, Filter, Settings
} from "lucide-react";

// 🔥 IMPORTANTE: Cambiar esta línea por tu ruta de API
// import api from "../utils/api";
const api = {
  get: async (url) => {
    const res = await fetch(`http://localhost:5000/api${url}`);
    return await res.json();
  },
  post: async (url, data) => {
    const res = await fetch(`http://localhost:5000/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  put: async (url, data) => {
    const res = await fetch(`http://localhost:5000/api${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  delete: async (url) => {
    const res = await fetch(`http://localhost:5000/api${url}`, {
      method: 'DELETE'
    });
    return await res.json();
  }
};

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    intervalo: 24,
    enviar_panel: 1,
    enviar_correo: 0
  });
  const [form, setForm] = useState(initialForm());
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: "all" });
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("reminders");

  useEffect(() => {
    fetchReminders();
    fetchNotifications();
    fetchNotificationSettings();
  }, [filters]);

  function initialForm() {
    return {
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      description: "",
      type: "",
      status: "Pendiente",
    };
  }

  const fetchReminders = async () => {
    try {
      const data = await api.get("/reminders");
      let filtered = data;
      
      if (filters.status !== "all") {
        filtered = data.filter(r => r.status === filters.status);
      }
      
      setReminders(filtered);
    } catch (err) {
      console.error("Error cargando recordatorios", err);
      toast.error("Error cargando recordatorios");
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Error cargando notificaciones", err);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const data = await api.get("/notifications/settings/config");
      setNotificationSettings(data);
    } catch (err) {
      console.error("Error cargando configuración", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.date || !form.time) {
      toast.error("Título, fecha y hora son requeridos");
      return;
    }

    try {
      if (selected) {
        await api.put(`/reminders/${selected}`, form);
        toast.success("Recordatorio actualizado ✅");
      } else {
        await api.post("/reminders", form);
        toast.success("Recordatorio creado ✅");
      }

      setForm(initialForm());
      setSelected(null);
      setShowModal(false);
      fetchReminders();
    } catch (err) {
      console.error("Error guardando recordatorio", err);
      toast.error("Error guardando recordatorio ❌");
    }
  };

  const handleSelect = (reminder) => {
    setSelected(reminder.id);
    setForm({ ...reminder });
    setShowModal(true);
  };

  const handleCancel = () => {
    setSelected(null);
    setForm(initialForm());
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este recordatorio?")) return;
    
    try {
      await api.delete(`/reminders/${id}`);
      toast.success("Recordatorio eliminado ✅");
      fetchReminders();
    } catch (err) {
      toast.error("Error eliminando recordatorio ❌");
    }
  };

  const completeReminder = async (id) => {
    try {
      await api.put(`/reminders/${id}/complete`);
      toast.success("Recordatorio completado ✅");
      fetchReminders();
    } catch (err) {
      toast.error("Error actualizando recordatorio ❌");
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/notifications/settings/config", notificationSettings);
      toast.success("Configuración actualizada ✅");
      setShowSettingsModal(false);
    } catch (err) {
      toast.error("Error actualizando configuración ❌");
    }
  };

  const processNotifications = async () => {
    try {
      toast.loading("Procesando notificaciones...");
      const result = await api.post("/notifications/process");
      toast.dismiss();
      toast.success(`✅ ${result.message}`);
      fetchNotifications();
    } catch (err) {
      toast.dismiss();
      toast.error("Error procesando notificaciones");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completado": return "bg-emerald-500/20 text-emerald-300";
      case "Vencido": return "bg-red-500/20 text-red-300";
      default: return "bg-orange-500/20 text-orange-300";
    }
  };

  const pendingCount = reminders.filter(r => r.status === "Pendiente").length;
  const completedCount = reminders.filter(r => r.status === "Completado").length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-inter text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-2xl shadow-2xl border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Bell size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Centro de Notificaciones</h1>
            <p className="text-xs text-white/50">Recordatorios y alertas automáticas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
          >
            <Settings size={18} />
            <span className="hidden sm:inline">Config</span>
          </button>
          <a href="/home" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all">
            <Home size={18} />
            <span className="hidden sm:inline">Inicio</span>
          </a>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("reminders")}
            className={`px-6 py-2 rounded-xl transition-all font-medium ${
              activeTab === "reminders" 
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Recordatorios
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-6 py-2 rounded-xl transition-all font-medium ${
              activeTab === "notifications" 
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Notificaciones
          </button>
        </div>

        {activeTab === "reminders" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Bell size={20} className="text-purple-400" />
                  <span className="text-sm text-white/60">Total</span>
                </div>
                <p className="text-3xl font-bold">{reminders.length}</p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={20} className="text-orange-400" />
                  <span className="text-sm text-white/60">Pendientes</span>
                </div>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span className="text-sm text-white/60">Completados</span>
                </div>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
            </div>

            {/* Filtros y acciones */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Completado">Completado</option>
                <option value="Vencido">Vencido</option>
              </select>

              <button
                onClick={() => { setForm(initialForm()); setSelected(null); setShowModal(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all ml-auto"
              >
                <Plus size={20} /> Nuevo Recordatorio
              </button>
            </div>

            {/* Tabla de recordatorios */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-500/10 to-pink-600/10 border-b border-white/5">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Título</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-white/70 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reminders.map((r) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.title}</div>
                          {r.description && (
                            <div className="text-xs text-white/60 mt-1">{r.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/80">{r.date}</td>
                        <td className="px-4 py-3 text-sm text-white/80">{r.time}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{r.type || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {r.status === "Pendiente" && (
                              <button
                                onClick={() => completeReminder(r.id)}
                                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-all"
                                title="Marcar completado"
                              >
                                <CheckCircle size={16} className="text-emerald-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleSelect(r)}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all"
                            >
                              <Edit size={16} className="text-purple-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {reminders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center">
                          <Bell size={48} className="mx-auto text-white/20 mb-3" />
                          <p className="text-white/40">No hay recordatorios para mostrar</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Tabla de notificaciones */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Historial de Notificaciones</h2>
              <button
                onClick={processNotifications}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-xl font-medium hover:scale-105 transition-all"
              >
                <Bell size={18} /> Procesar Ahora
              </button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-white/5">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Destinatario</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Mensaje</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase">Estado</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase">Canal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-white/80">{n.fecha}</td>
                        <td className="px-4 py-3 text-sm font-medium">{n.tipo}</td>
                        <td className="px-4 py-3 text-sm text-white/80">{n.destinatario}</td>
                        <td className="px-4 py-3 text-sm text-white/60">{n.mensaje}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            n.estado === "Enviado" 
                              ? "bg-emerald-500/20 text-emerald-300" 
                              : "bg-orange-500/20 text-orange-300"
                          }`}>
                            {n.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-white/60">
                          {n.sent_channel || "-"}
                        </td>
                      </tr>
                    ))}
                    {notifications.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center">
                          <Bell size={48} className="mx-auto text-white/20 mb-3" />
                          <p className="text-white/40">No hay notificaciones enviadas</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal de formulario */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleSubmit}
              className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">
                  {selected ? "Editar Recordatorio" : "Nuevo Recordatorio"}
                </h3>
                <button type="button" onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-xs text-white/50 mb-2 font-medium">Título *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Título del recordatorio"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Fecha *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Hora *</label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Tipo</label>
                  <input
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Ej: Reunión, Llamada"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Estado</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Completado">Completado</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-white/50 mb-2 font-medium">Descripción</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    placeholder="Detalles adicionales..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
                >
                  {selected ? "Actualizar" : "Crear"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de configuración */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleSettingsSubmit}
              className="w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Settings size={20} className="text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-semibold">Configuración</h3>
                </div>
                <button type="button" onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-white/70 mb-2 font-medium">
                    Intervalo de revisión (horas)
                  </label>
                  <input
                    type="number"
                    value={notificationSettings.intervalo}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      intervalo: parseInt(e.target.value)
                    })}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="1"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Notificar cuando un ticket lleve X horas pendiente
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <span className="text-sm text-white/70">Notificaciones en Panel</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.enviar_panel === 1}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      enviar_panel: e.target.checked ? 1 : 0
                    })}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <span className="text-sm text-white/70">Enviar por Correo</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.enviar_correo === 1}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      enviar_correo: e.target.checked ? 1 : 0
                    })}
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
              >
                Guardar Configuración
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center text-xs text-white/40 py-6 border-t border-white/5">
        <p>© 2025 Serproc Consulting. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}