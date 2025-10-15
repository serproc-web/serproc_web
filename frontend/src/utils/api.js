import axios from "axios";

// 👇 Aquí defines la base de tu backend
const api = axios.create({
  baseURL: "http://localhost:4000/api", // ⚡ Cambia esto al dominio en producción
  headers: {
    "Content-Type": "application/json",
  },
});

// 👇 Interceptor opcional: agrega el token automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
