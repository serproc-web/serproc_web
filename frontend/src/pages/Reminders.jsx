import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import logo from "../assets/logo.png";
import { Edit, Trash2, Save, XCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    type: "",
    status: "Pendiente",
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get("/reminders");
      setReminders(res.data);
    } catch {
      toast.error("Error cargando recordatorios");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/reminders/${editing}`, form);
        toast.success("Recordatorio actualizado");
      } else {
        await api.post("/reminders", form);
        toast.success("Recordatorio creado");
      }
      resetForm();
      fetchReminders();
    } catch {
      toast.error("Error guardando recordatorio");
    }
  };

  const resetForm = () => {
    setForm({ title: "", date: "", time: "", description: "", type: "", status: "Pendiente" });
    setEditing(null);
  };

  const deleteReminder = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      toast.success("Recordatorio eliminado");
      fetchReminders();
    } catch {
      toast.error("Error eliminando recordatorio");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-xl fixed w-full z-50">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo Serproc" className="h-12 w-12 drop-shadow-lg" />
          <span className="font-orbitron text-xl font-bold tracking-wide text-white drop-shadow">
            Serproc Consulting
          </span>
        </div>
        <Link
          to="/home"
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          <Home size={18} /> Inicio
        </Link>
      </header>

      <main className="flex-1 pt-32 p-10">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Sistema de Recordatorios
        </h1>
        <p className="text-center text-white/70 mb-8">
          Cree, gestione y reciba alertas automáticas
        </p>

        {/* Formulario */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-3xl mx-auto mb-12 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {editing ? "Editar Recordatorio" : "Nuevo Recordatorio"}
          </h2>
          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Título"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" name="date" value={form.date} onChange={handleChange}
              className="p-3 rounded-xl bg-white/20 text-white border" required />
            <input type="time" name="time" value={form.time} onChange={handleChange}
              className="p-3 rounded-xl bg-white/20 text-white border" required />
          </div>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border" />
          <input type="text" name="type" value={form.type} onChange={handleChange} placeholder="Tipo de recordatorio"
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border" />
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2 bg-cyan-500 rounded-lg text-white hover:bg-cyan-600 transition">
              <Save size={16} /> {editing ? "Guardar cambios" : "Registrar"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition">
                <XCircle size={16} /> Cancelar
              </button>
            )}
          </div>
        </motion.form>

        {/* DataGrid */}
        <div className="overflow-x-auto bg-white/90 rounded-2xl shadow-2xl max-w-5xl mx-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-100 text-gray-800">
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2">{r.time}</td>
                  <td className="px-4 py-2 font-semibold">{r.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => { setEditing(r.id); setForm(r); }}
                      className="p-2 bg-cyan-500 rounded-lg text-white hover:bg-cyan-600">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteReminder(r.id)}
                      className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {reminders.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-6">
                    No hay recordatorios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-white/70 py-5 border-t border-white/30 mt-10">
        © 2025 Serproc Consulting | Privacidad | Términos de uso
      </footer>
    </div>
  );
}
