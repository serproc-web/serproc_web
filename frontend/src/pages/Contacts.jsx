import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { User, Building2, Phone, Mail, Trash2 } from "lucide-react";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Animaciones de página
  const pageVariants = {
    hidden: { opacity: 0, y: 40 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -40, transition: { duration: 0.4 } },
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const res = await api.get("/contacts");
    setContacts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/contacts", form);
    setForm({ name: "", company: "", phone: "", email: "", notes: "" });
    fetchContacts();
  };

  const handleDelete = async (id) => {
    await api.delete(`/contacts/${id}`);
    fetchContacts();
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins"
      variants={pageVariants}
      initial="hidden"
      animate="enter"
      exit="exit"
    >
      {/* Navbar */}
      <header className="flex items-center justify-between px-10 py-5 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-xl">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo Serproc" className="h-12 w-12" />
          <span className="font-orbitron text-xl font-bold tracking-wide text-white drop-shadow">
            Serproc Consulting
          </span>
        </div>
        <nav className="space-x-6 text-sm font-semibold text-white/80 hidden md:flex">
          <Link to="/home" className="hover:text-cyan-400 transition">
            Inicio
          </Link>
          <Link to="/services" className="hover:text-cyan-400 transition">
            Servicios
          </Link>
          <Link to="/contacts" className="hover:text-cyan-400 transition">
            Contactos
          </Link>
        </nav>
      </header>

      {/* Gestión de contactos */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-white mb-10"
        >
          Gestión de Contactos
        </motion.h1>

        {/* Formulario */}
        <motion.form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-12 border border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {[
            { name: "name", placeholder: "Nombre", icon: <User size={18} /> },
            {
              name: "company",
              placeholder: "Empresa",
              icon: <Building2 size={18} />,
            },
            { name: "phone", placeholder: "Teléfono", icon: <Phone size={18} /> },
            { name: "email", placeholder: "Correo", icon: <Mail size={18} /> },
          ].map((f) => (
            <div
              key={f.name}
              className="flex items-center bg-white/20 rounded-xl p-3 text-white focus-within:ring-2 focus-within:ring-cyan-400"
            >
              {f.icon}
              <input
                type={f.name === "email" ? "email" : "text"}
                name={f.name}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                className="ml-3 bg-transparent outline-none w-full placeholder-white/60"
              />
            </div>
          ))}
          <textarea
            name="notes"
            placeholder="Observaciones"
            value={form.notes}
            onChange={handleChange}
            className="p-3 rounded-xl bg-white/20 text-white placeholder-white/60 border-none outline-none focus:ring-2 focus:ring-cyan-400 md:col-span-2"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-8 rounded-xl font-semibold shadow-xl hover:opacity-90 transition md:col-span-2"
          >
            Guardar contacto
          </motion.button>
        </motion.form>

        {/* Listado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-azulCorp">
            Contactos registrados
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {contacts.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-100"
                    >
                      <td className="p-3 border">{c.name}</td>
                      <td className="p-3 border">{c.company}</td>
                      <td className="p-3 border">{c.phone}</td>
                      <td className="p-3 border">{c.email}</td>
                      <td className="p-3 border">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="flex items-center text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} className="mr-1" />
                          Eliminar
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
