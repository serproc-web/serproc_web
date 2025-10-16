import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  Bell, 
  Settings, 
  Menu, 
  X, 
  Phone, 
  Briefcase,
  Users,
  Save,
  Zap,
  LogOut
} from "lucide-react";
import api from "../utils/api";
import logo from "../assets/logo.png";

export default function Configuration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

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
    const name = localStorage.getItem("name");
    if (name) setUser({ name });

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

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-inter text-white">
      {/* Header estilo Apple */}
      <header className="fixed top-0 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 z-50">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img src={logo} alt="Logo Serproc" className="h-8 w-8 sm:h-9 sm:w-9 drop-shadow-lg" />
          <span className="font-semibold text-sm sm:text-base tracking-tight text-white">
            Serproc Consulting
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/70">
          <Link to="/home" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <Link to="/services" className="hover:text-white transition-colors">
            Servicios
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">
            Contacto
          </Link>

          {user ? (
            <div className="relative ml-4">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <span className="text-sm">{user.name?.split(" ")[0]}</span>
                <svg className={`w-4 h-4 transition-transform ${openMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                  >
                    <button
                      onClick={() => navigate("/configuracion")}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-white bg-white/5"
                    >
                      <Settings size={16} className="mr-3" />
                      Configuración
                    </button>
                    <div className="h-px bg-white/5" />
                    <button
                      onClick={logout}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-4 px-4 py-1.5 bg-white text-slate-950 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden bg-slate-950 pt-16"
          >
            <nav className="flex flex-col px-6 py-8 space-y-1">
              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 text-white/70 text-base py-3 px-4 rounded-xl hover:bg-white/5 transition"
              >
                <Home size={20} />
                <span>Inicio</span>
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 text-white/70 text-base py-3 px-4 rounded-xl hover:bg-white/5 transition"
              >
                <Briefcase size={20} />
                <span>Servicios</span>
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 text-white/70 text-base py-3 px-4 rounded-xl hover:bg-white/5 transition"
              >
                <Phone size={20} />
                <span>Contacto</span>
              </Link>

              {user ? (
                <>
                  <div className="h-px bg-white/10 my-4" />
                  <p className="text-white/50 text-xs px-4 mb-2">{user.name}</p>
                  <Link
                    to="/configuracion"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-white text-base py-3 px-4 rounded-xl bg-white/5"
                  >
                    <Settings size={20} />
                    <span>Configuración</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 text-red-400 text-base py-3 px-4 rounded-xl hover:bg-white/5 transition"
                  >
                    <LogOut size={20} />
                    <span>Cerrar sesión</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-white/10 my-4" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-white text-slate-950 text-center py-3 px-6 rounded-xl font-medium"
                  >
                    Login
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 lg:pt-36 pb-6 sm:pb-8 px-4 sm:px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-3 sm:mb-4">
            Configuración del{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
              sistema
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl mx-auto">
            Gestiona las preferencias globales y de usuarios para las notificaciones
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="flex-grow px-4 sm:px-6 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Configuración Global */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-white/5"
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 tracking-tight">
                Notificaciones Globales
              </h2>
              <p className="text-sm text-white/60">
                Configuración predeterminada del sistema
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={saveCfg} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Intervalo de notificaciones
                  </label>
                  <select
                    value={cfg.intervalo}
                    onChange={(e) => setCfg({ ...cfg, intervalo: Number(e.target.value) })}
                    className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 text-white border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value={24}>24 horas</option>
                    <option value={48}>48 horas</option>
                    <option value={72}>72 horas</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!cfg.enviar_panel}
                      onChange={(e) => setCfg({ ...cfg, enviar_panel: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium">Panel interno</span>
                      <p className="text-xs text-white/50">Mostrar en el dashboard</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!cfg.enviar_correo}
                      onChange={(e) => setCfg({ ...cfg, enviar_correo: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium">Correo electrónico</span>
                      <p className="text-xs text-white/50">Enviar por email</p>
                    </div>
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving}
                  className="w-full flex items-center justify-center space-x-2 bg-white text-slate-950 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  <span>{saving ? "Guardando…" : "Guardar configuración"}</span>
                </motion.button>
              </form>
            )}
          </motion.section>

          {/* Aplicar a Todos */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-white/5"
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 tracking-tight">
                Aplicar a todos los usuarios
              </h2>
              <p className="text-sm text-white/60">
                Actualiza las preferencias individuales de cada usuario
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">
                  ⚠️ Esta acción afectará la configuración de <strong>todos</strong> los usuarios del sistema
                </p>
              </div>
            </div>

            <form onSubmit={applyToAllUsers} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Intervalo
                  </label>
                  <select
                    value={applyAll.intervalo}
                    onChange={(e) => setApplyAll({ ...applyAll, intervalo: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="24h">24 horas</option>
                    <option value="48h">48 horas</option>
                    <option value="72h">72 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Estado
                  </label>
                  <select
                    value={applyAll.enabled}
                    onChange={(e) => setApplyAll({ ...applyAll, enabled: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value={1}>Activado</option>
                    <option value={0}>Desactivado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!applyAll.panel}
                    onChange={(e) => setApplyAll({ ...applyAll, panel: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium">Panel</span>
                  </div>
                </label>

                <label className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!applyAll.correo}
                    onChange={(e) => setApplyAll({ ...applyAll, correo: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium">Correo</span>
                  </div>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={applying}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={18} />
                <span>{applying ? "Aplicando…" : "Aplicar a todos"}</span>
              </motion.button>
            </form>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs sm:text-sm text-white/40 py-6 sm:py-8 border-t border-white/5 px-4">
        <p>© 2025 Serproc Consulting. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}