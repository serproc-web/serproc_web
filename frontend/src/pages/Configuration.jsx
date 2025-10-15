// frontend/src/pages/Configuration.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Home, Bell, Settings } from "lucide-react";
import api from "../utils/api";

export default function Configuration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Config global (tabla notification_settings) ---
  const [cfg, setCfg] = useState({
    intervalo: 24,
    enviar_panel: 1,
    enviar_correo: 0,
  });

  // --- “Aplicar a todos los usuarios” (tabla users) ---
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
      toast.success("Configuración guardada");
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
      toast.success(`Aplicado a ${data.affectedRows ?? 0} usuarios`);
    } catch {
      toast.error("Error aplicando la configuración a usuarios");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins text-gray-200">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Settings size={22} />
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
        </div>
        <Link
          to="/home"
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          <Home size={18} /> Inicio
        </Link>
      </header>

      <main className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuración de Notificaciones (global) */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-cyan-400" />
            <h2 className="text-xl font-semibold">Notificaciones (Global)</h2>
          </div>

          {loading ? (
            <p className="text-white/70">Cargando…</p>
          ) : (
            <form onSubmit={saveCfg} className="space-y-5">
              <div>
                <label className="block text-sm mb-1">Intervalo (horas)</label>
                <select
                  value={cfg.intervalo}
                  onChange={(e) => setCfg({ ...cfg, intervalo: Number(e.target.value) })}
                  className="w-full p-3 rounded-lg bg-white/20 text-white"
                >
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                </select>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!cfg.enviar_panel}
                    onChange={(e) => setCfg({ ...cfg, enviar_panel: e.target.checked ? 1 : 0 })}
                  />
                  <span>Panel interno</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!cfg.enviar_correo}
                    onChange={(e) => setCfg({ ...cfg, enviar_correo: e.target.checked ? 1 : 0 })}
                  />
                  <span>Correo electrónico</span>
                </label>
              </div>

              <button
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow hover:scale-105 transition disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar configuración"}
              </button>
            </form>
          )}
        </motion.section>

        {/* Aplicar a todos los usuarios */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md shadow-xl"
        >
          <h2 className="text-xl font-semibold mb-4">Aplicar a todos los usuarios</h2>
          <p className="text-white/70 mb-5 text-sm">
            Esto actualiza los campos <code>notify_* </code> en la tabla <code>users</code> (preferencias por usuario).
          </p>

          <form onSubmit={applyToAllUsers} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Intervalo usuario</label>
                <select
                  value={applyAll.intervalo}
                  onChange={(e) => setApplyAll({ ...applyAll, intervalo: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/20 text-white"
                >
                  <option value="24h">24h</option>
                  <option value="48h">48h</option>
                  <option value="72h">72h</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Activar notificaciones</label>
                <select
                  value={applyAll.enabled}
                  onChange={(e) => setApplyAll({ ...applyAll, enabled: Number(e.target.value) })}
                  className="w-full p-3 rounded-lg bg-white/20 text-white"
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!applyAll.panel}
                  onChange={(e) => setApplyAll({ ...applyAll, panel: e.target.checked ? 1 : 0 })}
                />
                <span>Panel</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!applyAll.correo}
                  onChange={(e) => setApplyAll({ ...applyAll, correo: e.target.checked ? 1 : 0 })}
                />
                <span>Correo</span>
              </label>
            </div>

            <button
              disabled={applying}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow hover:scale-105 transition disabled:opacity-60"
            >
              {applying ? "Aplicando…" : "Aplicar a todos los usuarios"}
            </button>
          </form>
        </motion.section>
      </main>

      <footer className="text-center text-sm text-white/70 py-6 border-t border-white/20">
        © 2025 Serproc Consulting | Todos los derechos reservados
      </footer>
    </div>
  );
}
