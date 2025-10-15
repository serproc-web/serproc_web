import axios from "axios";

// 🧩 Detecta automáticamente la URL del backend desde el .env de Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://localhost:4000/api", // fallback para desarrollo local
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Interceptor opcional: agrega el token automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
