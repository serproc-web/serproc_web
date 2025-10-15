import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../utils/api";
import logo from "../assets/logo.png";

export default function Profile() {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);

  // Estados edición
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  // Estados contraseña
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/${userId}`);
      setUser(res.data);
      setForm(res.data);
    } catch {
      toast.error("Error al cargar el perfil");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/profile/${userId}`, form);
      toast.success("Perfil actualizado");
      setEditMode(false);
      fetchProfile();
    } catch {
      toast.error("Error al actualizar perfil");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    try {
      await api.put(`/profile/${userId}/password`, {
        password: passwordForm.password,
      });
      toast.success("Contraseña actualizada");
      setPasswordForm({ password: "", confirm: "" });
      setPasswordMode(false);
    } catch {
      toast.error("Error al cambiar contraseña");
    }
  };

  if (!user) return <p className="text-center text-white">Cargando...</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-azulCorp via-azulTec to-cian font-poppins text-gray-800">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-10 w-10" />
          <span className="font-orbitron text-lg font-bold tracking-wide text-white">
            Serproc Consulting
          </span>
        </div>
        <nav className="space-x-6 text-sm font-semibold text-white/80 flex items-center">
          <Link to="/home" className="hover:text-cian transition">
            Inicio
          </Link>
          <Link to="/services" className="hover:text-cian transition">
            Servicios
          </Link>
          <Link to="/profile" className="hover:text-cian transition">
            Perfil
          </Link>
        </nav>
      </header>

      <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tarjeta datos personales */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30"
        >
          <h2 className="text-xl font-bold text-white mb-4">Datos Personales</h2>

          {!editMode ? (
            <div className="space-y-2 text-white/90">
              <p>
                <span className="font-semibold">Nombre:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Correo:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span> {user.phone}
              </p>
              <p>
                <span className="font-semibold">Rol:</span> {user.role}
              </p>
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 px-5 py-2 bg-cian text-white rounded-lg hover:bg-azulTec transition shadow"
              >
                Editar perfil
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/20 text-white border placeholder-white/70"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/20 text-white border placeholder-white/70"
              />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/20 text-white border placeholder-white/70"
              />

              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setForm(user);
                  }}
                  className="flex-1 px-5 py-2 bg-gray-400/40 text-white rounded-lg hover:bg-gray-500/60 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2 bg-gradient-to-r from-azulTec to-cian text-white rounded-lg shadow hover:opacity-90"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Cambio de contraseña */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30"
        >
          <h2 className="text-xl font-bold text-white mb-4">Seguridad</h2>

          {!passwordMode ? (
            <button
              onClick={() => setPasswordMode(true)}
              className="px-5 py-2 bg-cian text-white rounded-lg hover:bg-azulTec transition shadow"
            >
              Cambiar contraseña
            </button>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <input
                type="password"
                name="password"
                value={passwordForm.password}
                onChange={handlePasswordChange}
                placeholder="Nueva contraseña"
                className="w-full p-3 rounded-xl bg-white/20 text-white border placeholder-white/70"
                required
              />
              <input
                type="password"
                name="confirm"
                value={passwordForm.confirm}
                onChange={handlePasswordChange}
                placeholder="Confirmar contraseña"
                className="w-full p-3 rounded-xl bg-white/20 text-white border placeholder-white/70"
                required
              />

              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordForm({ password: "", confirm: "" });
                  }}
                  className="flex-1 px-5 py-2 bg-gray-400/40 text-white rounded-lg hover:bg-gray-500/60 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2 bg-gradient-to-r from-cian to-turquesa text-white rounded-lg shadow hover:opacity-90"
                >
                  Guardar nueva contraseña
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-white/70 py-5 border-t border-white/30 mt-10">
        © 2025 Serproc Consulting | Privacidad | Términos de uso
      </footer>
    </div>
  );
}
