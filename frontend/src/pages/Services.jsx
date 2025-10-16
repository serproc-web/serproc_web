import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Phone,
  Cpu,
  Headphones,
  Globe,
  GraduationCap
} from "lucide-react";
import logo from "../assets/logo.png";

export default function Services() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    if (token && name) setUser({ name });
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const services = [
    {
      icon: Cpu,
      title: "Consultoría SAP",
      desc: "Optimiza tus procesos empresariales con soluciones SAP de vanguardia adaptadas a tu industria",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Headphones,
      title: "Soporte Técnico",
      desc: "Atención experta 24/7 que garantiza la continuidad operativa de tu negocio",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Globe,
      title: "Desarrollo Web",
      desc: "Experiencias digitales excepcionales que conectan con tus usuarios",
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: GraduationCap,
      title: "Capacitación Empresarial",
      desc: "Programas de formación especializados que transforman el potencial de tu equipo",
      gradient: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-inter text-white"
    >
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
          <Link to="/services" className="text-white">
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
                <span className="text-sm">{user.name.split(" ")[0]}</span>
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
                className="flex items-center space-x-3 text-white text-base py-3 px-4 rounded-xl bg-white/5"
              >
                <Cpu size={20} />
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
      <section className="pt-28 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 sm:mb-6">
            Servicios que{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
              transforman
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Consultoría y soporte tecnológico especializado en SAP para llevar tu empresa al siguiente nivel
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="flex-grow pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="relative h-full bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-xl rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all duration-500">
                    <service.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${service.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-4 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs sm:text-sm text-white/40 py-6 sm:py-8 border-t border-white/5 px-4">
        <p>© 2025 Serproc Consulting. Todos los derechos reservados.</p>
      </footer>
    </motion.div>
  );
}