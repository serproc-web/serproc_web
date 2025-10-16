import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Settings,
  LogOut,
  Users,
  Bell,
  BellRing,
  Briefcase,
  Ticket,
  User,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (token && name && role) setUser({ name, role });
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  // Cerrar menú móvil al cambiar de ruta
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 lg:py-5 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-xl fixed w-full z-50">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 sm:space-x-3"
        >
          <img src={logo} alt="Logo Serproc" className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-lg" />
          <span className="font-orbitron text-base sm:text-xl font-bold tracking-wide text-white drop-shadow">
            Serproc Consulting
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="space-x-6 lg:space-x-8 text-sm font-semibold text-white/90 hidden md:flex items-center">
          <Link to="/" className="hover:text-cyan-400 transition">
            Inicio
          </Link>
          <Link to="/services" className="hover:text-cyan-400 transition">
            Servicios
          </Link>
          <Link to="/contact" className="hover:text-cyan-400 transition">
            Contacto
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:scale-105 transform transition"
              >
                {user.name.split(" ")[0]} ⬇
              </button>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200"
                  >
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <User size={18} className="mr-3 text-cyan-600" />
                      Perfil
                    </button>

                    {user.role === "admin" && (
                      <button
                        onClick={() => navigate("/notifications")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <BellRing size={18} className="mr-3 text-cyan-600" />
                        Notificaciones
                      </button>
                    )}

                    {(user.role === "admin" || user.role === "worker") && (
                      <>
                        <button
                          onClick={() => navigate("/reminders")}
                          className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <Bell size={18} className="mr-3 text-cyan-600" />
                          Recordatorios
                        </button>

                        <button
                          onClick={() => navigate("/contacts")}
                          className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          <Users size={18} className="mr-3 text-cyan-600" />
                          Gestión de Contactos
                        </button>
                      </>
                    )}

                    {user.role === "worker" && (
                      <button
                        onClick={() => navigate("/tickets")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <Ticket size={18} className="mr-3 text-cyan-600" />
                        Tickets
                      </button>
                    )}

                    {user.role === "admin" && (
                      <button
                        onClick={() => navigate("/crm")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <Briefcase size={18} className="mr-3 text-cyan-600" />
                        CRM
                      </button>
                    )}

                    <button
                      onClick={() => navigate("/configuracion")}
                      className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Settings size={18} className="mr-3 text-cyan-600" />
                      Configuración
                    </button>

                    <button
                      onClick={logout}
                      className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-gray-100 transition"
                    >
                      <LogOut size={18} className="mr-3" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg shadow-md hover:scale-105 transform transition"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="fixed inset-0 z-40 md:hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] pt-20"
          >
            <div className="flex flex-col h-full overflow-y-auto">
              <nav className="flex flex-col space-y-1 px-6 py-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                >
                  Inicio
                </Link>
                <Link
                  to="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                >
                  Servicios
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                >
                  Contacto
                </Link>

                {user ? (
                  <>
                    <div className="border-t border-white/20 my-4"></div>
                    <p className="text-cyan-400 text-sm font-semibold px-4 mb-2">
                      {user.name}
                    </p>

                    <button
                      onClick={() => handleNavigation("/profile")}
                      className="flex items-center text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                    >
                      <User size={20} className="mr-3 text-cyan-400" />
                      Perfil
                    </button>

                    {user.role === "admin" && (
                      <button
                        onClick={() => handleNavigation("/notifications")}
                        className="flex items-center text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                      >
                        <BellRing size={20} className="mr-3 text-cyan-400" />
                        Notificaciones
                      </button>
                    )}

                    {(user.role === "admin" || user.role === "worker") && (
                      <>
                        <button
                          onClick={() => handleNavigation("/reminders")}
                          className="flex items-center text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                        >
                          <Bell size={20} className="mr-3 text-cyan-400" />
                          Recordatorios
                        </button>

                        <button
                          onClick={() => handleNavigation("/contacts")}
                          className="flex items-center text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                        >
                          <Users size={20} className="mr-3 text-cyan-400" />
                          Gestión de Contactos
                        </button>
                      </>
                    )}

                    {user.role === "worker" && (
                      <button
                        onClick={() => handleNavigation("/tickets")}
                        className="flex items-center text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                      >
                        <Ticket size={20} className="mr-3 text-cyan-400" />
                        Tickets
                      </button>
                    )}

                    {user.role === "admin" && (
                      <button
                        onClick={() => handleNavigation("/crm")}
                        className="flex items-center text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                      >
                        <Briefcase size={20} className="mr-3 text-cyan-400" />
                        CRM
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigation("/configuracion")}
                      className="flex items-center text-white text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                    >
                      <Settings size={20} className="mr-3 text-cyan-400" />
                      Configuración
                    </button>

                    <div className="border-t border-white/20 my-4"></div>

                    <button
                      onClick={logout}
                      className="flex items-center text-red-400 text-lg py-3 px-4 rounded-lg hover:bg-white/10 transition"
                    >
                      <LogOut size={20} className="mr-3" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-white/20 my-4"></div>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-3 px-6 rounded-lg shadow-md font-semibold"
                    >
                      Login
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 flex-grow pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg px-4"
        >
          Bienvenido al futuro con{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Serproc Consulting
          </span>
        </motion.h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/80 max-w-3xl leading-relaxed px-4">
          Tecnología, soporte y consultoría SAP diseñados para la nueva era digital.
        </p>
        <motion.a
          href="/services"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 sm:mt-10 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-2xl hover:opacity-90 transition"
        >
          Descúbrenos
        </motion.a>
      </section>

      {/* Servicios */}
      <section
        id="services"
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white/90 backdrop-blur-md rounded-t-3xl shadow-inner"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-azulCorp mb-8 sm:mb-12 lg:mb-16">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {[
            {
              title: "Consultoría SAP",
              desc: "Optimiza procesos y potencia tu empresa con soluciones SAP adaptadas a tus necesidades.",
            },
            {
              title: "Soporte Técnico",
              desc: "Atención rápida y confiable para resolver incidencias y garantizar continuidad operativa.",
            },
            {
              title: "Desarrollo Web",
              desc: "Sitios y aplicaciones modernas, responsivas y seguras para llevar tu negocio al siguiente nivel.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(14,165,233,0.5)",
              }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 text-center border hover:shadow-2xl transition"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-azulTec mb-4 sm:mb-6">{s.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs sm:text-sm text-white/70 py-4 sm:py-6 border-t border-white/20 px-4">
        © 2025 Serproc Consulting | Todos los derechos reservados
      </footer>
    </div>
  );
}