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
} from "lucide-react";
import logo from "../assets/logo.png";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-xl fixed w-full z-50">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <img src={logo} alt="Logo Serproc" className="h-12 w-12 drop-shadow-lg" />
          <span className="font-orbitron text-xl font-bold tracking-wide text-white drop-shadow">
            Serproc Consulting
          </span>
        </motion.div>

        <nav className="space-x-8 text-sm font-semibold text-white/90 hidden md:flex items-center">
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
                    {/* Perfil */}
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <User size={18} className="mr-3 text-cyan-600" />
                      Perfil
                    </button>

                    {/* Notificaciones SOLO admin */}
                    {user.role === "admin" && (
                      <button
                        onClick={() => navigate("/notifications")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <BellRing size={18} className="mr-3 text-cyan-600" />
                        Notificaciones
                      </button>
                    )}

                    {/* Recordatorios */}
                    {(user.role === "admin" || user.role === "worker") && (
                      <button
                        onClick={() => navigate("/reminders")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <Bell size={18} className="mr-3 text-cyan-600" />
                        Recordatorios
                      </button>
                    )}

                    {/* Contactos */}
                    {(user.role === "admin" || user.role === "worker") && (
                      <button
                        onClick={() => navigate("/contacts")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <Users size={18} className="mr-3 text-cyan-600" />
                        Gestión de Contactos
                      </button>
                    )}

                    {/* Tickets */}
                    {user.role === "worker" && (
                      <button
                        onClick={() => navigate("/tickets")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <Ticket size={18} className="mr-3 text-cyan-600" />
                        Tickets
                      </button>
                    )}

                    {/* CRM */}
                    {user.role === "admin" && (
                      <button
                        onClick={() => navigate("/crm")}
                        className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <Briefcase size={18} className="mr-3 text-cyan-600" />
                        CRM
                      </button>
                    )}

                    {/* Configuración */}
                    <button
                      onClick={() => navigate("/configuracion")}
                      className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Settings size={18} className="mr-3 text-cyan-600" />
                      Configuración
                    </button>

                    {/* Logout */}
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
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 flex-grow pt-40 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg"
        >
          Bienvenido al futuro con{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Serproc Consulting
          </span>
        </motion.h1>
        <p className="mt-6 text-lg text-white/80 max-w-3xl leading-relaxed">
          Tecnología, soporte y consultoría SAP diseñados para la nueva era digital.
        </p>
        <motion.a
          href="/services"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-2xl hover:opacity-90 transition"
        >
          Descúbrenos
        </motion.a>
      </section>

      {/* Servicios */}
      <section
        id="services"
        className="py-20 px-6 bg-white/90 backdrop-blur-md rounded-t-3xl shadow-inner"
      >
        <h2 className="text-4xl font-bold text-center text-azulCorp mb-16">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
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
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-10 text-center border hover:shadow-2xl transition"
            >
              <h3 className="text-2xl font-bold text-azulTec mb-6">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-white/70 py-6 border-t border-white/20">
        © 2025 Serproc Consulting | Todos los derechos reservados
      </footer>
    </div>
  );
}
