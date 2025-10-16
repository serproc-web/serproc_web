// src/pages/Verify.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api"; // ← usa el axios con VITE_API_URL

export default function Verify({ email: emailProp }) {
  const navigate = useNavigate();
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const email = emailProp || localStorage.getItem("pendingEmail") || ""; // fallback

  const isComplete = useMemo(() => code.every((d) => d && d.length === 1), [code]);

  useEffect(() => {
    // foco en el primer input
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      const next = [...code];
      next[i - 1] = "";
      setCode(next);
      inputsRef.current[i - 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = text.split("");
    while (next.length < 6) next.push("");
    setCode(next);
    inputsRef.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Falta el correo a verificar");
      return;
    }
    const verificationCode = code.join("");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify", { email, code: verificationCode });
      toast.success("Cuenta verificada con éxito 🚀");
      // opcional: guardar token/role si tu backend devuelve al verificar
      if (data?.token) {
        localStorage.setItem("token", data.token);
        if (data.role) localStorage.setItem("role", data.role);
        if (data.name) localStorage.setItem("name", data.name);
      }
      // ya no necesitamos el pendingEmail
      localStorage.removeItem("pendingEmail");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || "Error en la verificación";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // (Opcional) Reenviar código si ya implementaste /auth/resend
  const handleResend = async () => {
    if (!email) return toast.error("Falta el correo");
    try {
      setLoading(true);
      await api.post("/auth/resend", { email });
      toast.success("Código reenviado ✅");
    } catch (err) {
      toast.error(err?.response?.data?.error || "No se pudo reenviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-azulCorp via-azulTec to-cian">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-10 text-center space-y-6">
        <h2 className="text-2xl font-bold text-azulCorp">Verifica tu cuenta</h2>
        <p className="text-gray-500">
          Ingresa el código que enviamos a <span className="font-medium">{email || "tu correo"}</span>
        </p>

        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              ref={(el) => (inputsRef.current[i] = el)}
              className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-cian outline-none"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!isComplete || loading}
          className="w-full bg-azulTec text-white font-semibold py-3 rounded-lg hover:bg-cian transition disabled:opacity-60"
        >
          {loading ? "Verificando..." : "Verificar"}
        </button>

        {/* Mostrar si implementas el endpoint /auth/resend */}
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full border border-azulTec text-azulTec font-semibold py-3 rounded-lg hover:bg-blue-50 transition disabled:opacity-60"
        >
          Reenviar código
        </button>
      </form>
    </div>
  );
}
