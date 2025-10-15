import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Settings, LogOut } from "lucide-react"; // iconos modernos
import logo from "../assets/logo.png";

export default function Services() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

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
      title: "Consultoría SAP",
      desc: "Optimiza tus procesos con soluciones SAP adaptadas a tus necesidades.",
    },
    {
      title: "Soporte Técnico",
      desc: "Atención rápida y confiable para garantizar continuidad operativa.",
    },
    {
      title: "Desarrollo Web",
      desc: "Sitios y aplicaciones modernas, responsivas y seguras.",
    },
    {
      title: "Capacitación Empresarial",
      desc: "Formación especializada para potenciar el talento de tu equipo.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins text-gray-800"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow relative">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo Serproc" className="h-10 w-10 drop-shadow-lg" />
          <span className="font-orbitron text-lg font-bold tracking-wide text-white">
            Serproc Consulting
          </span>
        </div>

        <nav className="space-x-6 text-sm font-semibold text-white/80 flex items-center">
          <Link to="/home" className="hover:text-cyan-400 transition">Inicio</Link>
          <Link to="/contact" className="hover:text-cyan-400 transition">Contacto</Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="bg-white/20 text-white px-3 py-1 rounded-lg hover:bg-cyan-500 transition"
              >
                {user.name.split(" ")[0]} ⬇
              </button>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white/90 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    <button
                      onClick={() => navigate("/configuracion")}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} className="mr-2" /> Configuración
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" /> Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="hover:text-cyan-400 transition">Login</Link>
          )}
        </nav>
      </header>

      {/* Servicios */}
      <section className="flex-grow py-16 px-6 bg-white/10 backdrop-blur-2xl rounded-t-3xl shadow-inner">
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-white drop-shadow mb-4"
        >
          Nuestros Servicios
        </motion.h2>
        <p className="text-center text-white/70 mb-12">
          Consultoría y soporte tecnológico especializado en SAP
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.05, rotateX: 2, rotateY: -2 }}
              className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/20 hover:border-cyan-400 transition relative overflow-hidden"
            >
              {/* Glow decorativo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-blue-600/10 opacity-50 pointer-events-none" />
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">{s.title}</h3>
              <p className="text-white/80 mb-6">{s.desc}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg shadow hover:opacity-90 transition relative z-10"
              >
                Más info
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-white/70 py-5 border-t border-white/30">
        © 2025 Serproc Consulting | Privacidad | Términos de uso
      </footer>
    </motion.div>
  );
}
