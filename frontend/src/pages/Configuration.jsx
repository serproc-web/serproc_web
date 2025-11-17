import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { 
  Home, 
  Bell, 
  Settings, 
  Users,
  Save,
  Zap
} from "lucide-react";
import api from "../utils/api";

export default function Configuration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Config global
  const [cfg, setCfg] = useState({
    intervalo: 24,
    enviar_panel: 1,
    enviar_correo: 0,
  });

  // Aplicar a todos
  const [applyAll, setApplyAll] = useState({
    enabled: 1,
    intervalo: "24h",
    panel: 1,
    correo: 1,
  });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/config/notifications");
        setCfg({
          intervalo: Number(res.data?.intervalo ?? 24),
          enviar_panel: res.data?.enviar_panel ? 1 : 0,
          enviar_correo: res.data?.enviar_correo ? 1 : 0,
        });
      } catch {
        toast.error("No se pudo cargar la configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveCfg = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/config/notifications", cfg);
      toast.success("Configuración guardada ✅");
    } catch {
      toast.error("Error guardando configuración");
    } finally {
      setSaving(false);
    }
  };

  const applyToAllUsers = async (e) => {
    e.preventDefault();
    if (!confirm("¿Aplicar esta configuración a TODOS los usuarios?")) return;
    setApplying(true);
    try {
      const { data } = await api.post("/config/notifications/apply-to-all", applyAll);
      toast.success(`✅ Aplicado a ${data.affectedRows ?? 0} usuarios`);
    } catch {
      toast.error("Error aplicando la configuración a usuarios");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-inter text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-2xl shadow-2xl border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Settings size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Configuración</h1>
            <p className="text-xs text-white/50">Sistema de notificaciones</p>
          </div>
        </div>
        <Link to="/home" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all">
          <Home size={18} />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración Global */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/5"
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 tracking-tight">
                Notificaciones Globales
              </h2>
              <p className="text-sm text-white/60">
                Configuración predeterminada del sistema
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={saveCfg} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Intervalo de notificaciones
                  </label>
                  <select
                    value={cfg.intervalo}
                    onChange={(e) => setCfg({ ...cfg, intervalo: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                  >
                    <option value={24}>24 horas</option>
                    <option value={48}>48 horas</option>
                    <option value={72}>72 horas</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!cfg.enviar_panel}
                      onChange={(e) => setCfg({ ...cfg, enviar_panel: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5 rounded accent-cyan-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium">Panel interno</span>
                      <p className="text-xs text-white/50">Mostrar en el dashboard</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!cfg.enviar_correo}
                      onChange={(e) => setCfg({ ...cfg, enviar_correo: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5 rounded accent-cyan-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium">Correo electrónico</span>
                      <p className="text-xs text-white/50">Enviar por email</p>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Save size={18} />
                  <span>{saving ? "Guardando…" : "Guardar configuración"}</span>
                </button>
              </form>
            )}
          </motion.section>

          {/* Aplicar a Todos */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/5"
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 tracking-tight">
                Aplicar a todos los usuarios
              </h2>
              <p className="text-sm text-white/60">
                Actualiza las preferencias de cada usuario
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">
                  ⚠️ Esta acción afectará a <strong>todos</strong> los usuarios
                </p>
              </div>
            </div>

            <form onSubmit={applyToAllUsers} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Intervalo
                  </label>
                  <select
                    value={applyAll.intervalo}
                    onChange={(e) => setApplyAll({ ...applyAll, intervalo: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                  >
                    <option value="24h">24 horas</option>
                    <option value="48h">48 horas</option>
                    <option value="72h">72 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Estado
                  </label>
                  <select
                    value={applyAll.enabled}
                    onChange={(e) => setApplyAll({ ...applyAll, enabled: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                  >
                    <option value={1}>Activado</option>
                    <option value={0}>Desactivado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!applyAll.panel}
                    onChange={(e) => setApplyAll({ ...applyAll, panel: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 rounded accent-cyan-500"
                  />
                  <span className="ml-3 text-sm font-medium">Notificaciones en panel</span>
                </label>

                <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!applyAll.correo}
                    onChange={(e) => setApplyAll({ ...applyAll, correo: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 rounded accent-cyan-500"
                  />
                  <span className="ml-3 text-sm font-medium">Notificaciones por correo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Zap size={18} />
                <span>{applying ? "Aplicando…" : "Aplicar a todos"}</span>
              </button>
            </form>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-white/40 py-6 border-t border-white/5">
        <p>© 2025 Serproc Consulting. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}