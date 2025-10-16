import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import logo from "../assets/logo.png";
import { 
  Mail, 
  Phone, 
  Home, 
  BarChart2, 
  Menu, 
  X, 
  Briefcase,
  Settings,
  LogOut,
  Send
} from "lucide-react";

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contactus", form);
      toast.success("Mensaje enviado correctamente");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al enviar el mensaje");
    } finally {
      setLoading(false);
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
          <Link to="/contact" className="text-white">
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
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors"
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
                className="flex items-center space-x-3 text-white text-base py-3 px-4 rounded-xl bg-white/5"
              >
                <Phone size={20} />
                <span>Contacto</span>
              </Link>

              {user ? (
                <>
                  <div className="h-px bg-white/10 my-4" />
                  <p className="text-white/50 text-xs px-4 mb-2">{user.name}</p>
                  <button
                    onClick={() => { navigate("/configuracion"); setMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 text-white/70 text-base py-3 px-4 rounded-xl hover:bg-white/5 transition"
                  >
                    <Settings size={20} />
                    <span>Configuración</span>
                  </button>
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
      <section className="pt-28 sm:pt-32 lg:pt-40 pb-8 sm:pb-12 px-4 sm:px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 sm:mb-6">
            Hablemos de tu{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
              proyecto
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible
          </p>
        </motion.div>
      </section>

      {/* Content Grid */}
      <div className="flex-grow max-w-7xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-white/5"
        >
          <div className="mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Send className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight">
              Envíanos un mensaje
            </h2>
            <p className="text-sm sm:text-base text-white/60">
              Completa el formulario y nos pondremos en contacto contigo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="juan@empresa.com"
                className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+502 1234 5678"
                className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Mensaje
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                placeholder="Cuéntanos sobre tu proyecto..."
                className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none resize-none transition-all"
                required
              ></textarea>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-white text-slate-950 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </motion.button>
          </form>
        </motion.div>

        {/* Info y Widget */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Card de contacto */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-white/5">
            <div className="mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight">
                Soporte remoto
              </h2>
              <p className="text-sm sm:text-base text-white/60">
                Nuestro equipo trabaja 100% online y siempre está conectado para ti
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-cyan-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">Email</p>
                  <p className="text-sm sm:text-base text-white font-medium">serproc.noreply@gmail.com</p>
                </div>
              </div>

              

              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Home className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">Ubicación</p>
                  <p className="text-sm sm:text-base text-white font-medium">Operamos de manera remota</p>
                </div>
              </div>
            </div>
          </div>

          {/* Widget de estadísticas */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-cyan-400/20 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BarChart2 size={32} className="text-white" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold mb-2">+2000</h3>
            <p className="text-base sm:text-lg font-semibold mb-2">Consultas resueltas</p>
            <p className="text-sm text-white/60">Soporte confiable en todo momento</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs sm:text-sm text-white/40 py-6 sm:py-8 border-t border-white/5 px-4">
        <p>© 2025 Serproc Consulting. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}