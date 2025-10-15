import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Verify({ email }) {
  const [code, setCode] = useState(Array(6).fill(""));

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await axios.post("http://localhost:4000/api/auth/verify", {
        email,
        code: verificationCode,
      });
      toast.success("Cuenta verificada con éxito 🚀");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error en la verificación");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-azulCorp via-azulTec to-cian">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-10 text-center space-y-6"
      >
        <h2 className="text-2xl font-bold text-azulCorp">Verifica tu cuenta</h2>
        <p className="text-gray-500">Ingresa el código que enviamos a tu correo</p>
        <div className="flex justify-center space-x-3">
          {code.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-cian"
            />
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-azulTec text-white font-semibold py-3 rounded-lg hover:bg-cian transition"
        >
          Verificar
        </button>
      </form>
    </div>
  );
}
