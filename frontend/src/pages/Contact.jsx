import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import logo from "../assets/logo.png";
import { Mail, Phone, Home, BarChart2 } from "lucide-react";

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-azulCorp via-azulTec to-cian font-poppins text-gray-800">
      {/* Header con navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo Serproc" className="h-10 w-10" />
          <span className="font-orbitron text-lg font-bold tracking-wide text-white">
            Serproc Consulting
          </span>
        </div>
        <nav className="space-x-6 text-sm font-semibold text-white/80 flex items-center">
          <Link to="/home" className="hover:text-cian transition">Inicio</Link>
          <Link to="/services" className="hover:text-cian transition">Servicios</Link>
          <Link to="/contact" className="hover:text-cian transition">Contacto</Link>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/30"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border focus:ring-2 focus:ring-cian focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border focus:ring-2 focus:ring-cian focus:outline-none"
              required
            />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Teléfono"
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border focus:ring-2 focus:ring-cian focus:outline-none"
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="Escribe tu mensaje..."
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border focus:ring-2 focus:ring-cian focus:outline-none resize-none"
              required
            ></textarea>
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-azulTec to-cian text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </motion.button>
          </form>
        </motion.div>

        {/* Widget dinámico */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/30 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Soporte remoto</h2>
            <p className="text-white/80 mb-4">
              Nuestro equipo trabaja 100% online y siempre está conectado para ti.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="text-cian" size={20} />
                <span className="text-white">info@serproc.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-cian" size={20} />
                <span className="text-white">+502 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Home className="text-cian" size={20} />
                <span className="text-white">Operamos de manera remota</span>
              </div>
            </div>
          </div>

          {/* Widget animado de estadísticas */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mt-8 p-6 rounded-xl bg-gradient-to-r from-cian to-azulTec shadow-lg text-center"
          >
            <BarChart2 size={32} className="mx-auto text-white mb-3" />
            <p className="text-white text-lg font-semibold">+2000 consultas resueltas</p>
            <p className="text-white/70 text-sm">Soporte confiable en todo momento</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-white/70 py-5 border-t border-white/30">
        © 2025 Serproc Consulting | Privacidad | Términos de uso
      </footer>
    </div>
  );
}
