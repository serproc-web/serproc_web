import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import api from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estados login/registro
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  // Estados verificación
  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Timer de reenvío
  useEffect(() => {
    if (!showVerify) return;
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [showVerify, timeLeft]);

  const handleChange = (e, setter) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Registro/Login
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = type === "register" ? "/auth/register" : "/auth/login";
      const data = type === "register" ? registerForm : loginForm;
      const res = await api.post(url, data);

      if (type === "login") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("userId", res.data.userId);
        toast.success(res.data.message || "Operación exitosa");
        navigate("/home");
      } else {
        setVerifyEmail(registerForm.email);
        setShowVerify(true);
        setTimeLeft(120);
        setCanResend(false);
        toast.success("Se envió un código de verificación a tu correo");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error en la operación");
    } finally {
      setLoading(false);
    }
  };

  // Inputs del código
  const handleCodeChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  // Verificar cuenta
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const verificationCode = code.join("");
      const res = await api.post("/auth/verify", {
        email: verifyEmail,
        code: verificationCode,
      });
      toast.success(res.data.message || "Cuenta verificada");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("userId", res.data.userId);
      setShowVerify(false);
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.error || "Código inválido");
    }
  };

  // Reenviar código
  const handleResend = async () => {
    try {
      await api.post("/auth/register", registerForm);
      setTimeLeft(120);
      setCanResend(false);
      toast.success("Se envió un nuevo código a tu correo");
    } catch {
      toast.error("Error al reenviar código");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins"
    >
      {/* Decoración futurista */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-3xl -top-32 -left-32 animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse" />

      {/* Header */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 w-full flex items-center justify-between px-10 py-6"
      >
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo Serproc" className="h-10 w-10 drop-shadow-lg" />
          <span className="font-orbitron text-xl font-bold tracking-wide text-white">
            Serproc Consulting
          </span>
        </div>
      </motion.header>

      {/* Título */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center text-5xl font-bold mt-20 text-white drop-shadow-lg"
      >
        Bienvenido a <span className="text-cyan-400">SERPROC</span>
      </motion.h1>
      <p className="text-center text-white/80 mt-4 text-lg max-w-xl">
        Un ecosistema moderno para gestionar tu empresa de forma segura.
      </p>

      {/* Contenido principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full px-6 z-10"
      >
        {/* Login */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">
            Iniciar Sesión
          </h2>
          <form onSubmit={(e) => handleSubmit(e, "login")} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Usuario / Email"
              value={loginForm.email}
              onChange={(e) => handleChange(e, setLoginForm)}
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={loginForm.password}
              onChange={(e) => handleChange(e, setLoginForm)}
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Ingresar"}
            </motion.button>
          </form>
        </motion.div>

        {/* Registro */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">
            Crear Cuenta
          </h2>
          <form onSubmit={(e) => handleSubmit(e, "register")} className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={registerForm.name}
              onChange={(e) => handleChange(e, setRegisterForm)}
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={registerForm.email}
              onChange={(e) => handleChange(e, setRegisterForm)}
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={registerForm.password}
              onChange={(e) => handleChange(e, setRegisterForm)}
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
            <input
              type="password"
              name="confirm"
              placeholder="Confirmar contraseña"
              value={registerForm.confirm}
              onChange={(e) => handleChange(e, setRegisterForm)}
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Registrarme"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Modal de verificación */}
      <AnimatePresence>
        {showVerify && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 text-center w-[400px] space-y-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white drop-shadow">
                Verifica tu cuenta
              </h2>
              <p className="text-white/70">
                Ingresa el código de 6 dígitos enviado a <br />
                <span className="font-semibold">{verifyEmail}</span>
              </p>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center space-x-3">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      value={digit}
                      id={`code-${i}`}
                      onChange={(e) => handleCodeChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      className="w-12 h-12 text-center text-xl rounded-xl bg-white/20 text-white border border-white/30 focus:ring-2 focus:ring-cyan-400 outline-none"
                    />
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition"
                >
                  Verificar
                </motion.button>
              </form>
              <div className="text-sm text-white/60">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-cyan-400 hover:underline"
                  >
                    Reenviar código
                  </button>
                ) : (
                  <p>
                    Reenviar en{" "}
                    <span className="font-semibold text-white">
                      {Math.floor(timeLeft / 60)}:
                      {(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center text-xs text-white/70 py-5 mt-10">
        © 2025 Serproc Consulting | Privacidad | Términos de uso
      </footer>
    </motion.div>
  );
}
