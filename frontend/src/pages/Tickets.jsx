import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { Search, Upload, Download, Home, XCircle } from "lucide-react";
import { toast } from "react-hot-toast"; // 👈 ya lo usas en Login.jsx

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchTickets();
  }, []);

  function initialForm() {
    return {
      numero: "",
      fecha: "",
      actividad: "",
      cliente: "",
      usuario_cliente: "",
      minutos: "",
      horas: "",
      observaciones: "",
      estado: "pendiente",
    };
  }

  const fetchTickets = async () => {
    try {
      const res = await api.get(`/tickets/${userId}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error al cargar tickets", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (!selected && !prev.fecha) {
        return { ...prev, [name]: value, fecha: formatDate(new Date()) };
      }
      return { ...prev, [name]: value };
    });
  };
const handleBulkUpload = async (csvData) => {
  try {
    // cada fila del CSV ya está mapeada en "csvData"
    const bulk = csvData.map((row) => ({
      ...row,
      estado: "completado", // ✅ forzar estado
    }));

    toast.loading("Subiendo tickets...");

    await api.post("/tickets/bulk", { tickets: bulk });

    toast.dismiss();
    toast.success("Carga masiva completada con éxito ✅");

    fetchTickets();
  } catch (err) {
    toast.dismiss();
    toast.error("Error al cargar tickets masivos ❌");
    console.error("Error en carga masiva", err);
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        user_id: userId,
        fecha: formatDate(form.fecha || new Date()),
      };

      if (selected) {
        await api.patch(`/tickets/${selected.id}`, { field: "all", value: payload });
      } else {
        await api.post("/tickets", payload);
      }

      setForm(initialForm());
      setSelected(null);
      fetchTickets();
    } catch (err) {
      console.error("Error al guardar ticket", err);
    }
  };

  const handleSelect = (ticket) => {
    setSelected(ticket);
    setForm({ ...ticket, fecha: formatDate(ticket.fecha) });
  };

  const handleCancel = () => {
    setSelected(null);
    setForm(initialForm());
  };

  // Filtrado por actividad
  const filteredTickets = tickets.filter((t) =>
    t.actividad?.toLowerCase().includes(search.toLowerCase())
  );

  // Exportar a CSV
  const exportCSV = () => {
    const headers = Object.keys(initialForm()).join(",");
    const rows = tickets
      .map((t) =>
        Object.keys(initialForm())
          .map((k) => `"${t[k] || ""}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tickets.csv";
    a.click();
  };

  // Importar CSV
  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").slice(1);
    const bulk = lines.map((line) => {
  const [numero, fecha, actividad, cliente, usuario_cliente, minutos, horas, observaciones] =
    line.split(",");

  return {
    user_id: userId,
    numero,
    fecha: fecha || formatDate(new Date()),
    actividad,
    cliente,
    usuario_cliente,
    minutos,
    horas,
    observaciones,
    estado: "completado",  // 👈 siempre completado
  };
});



    try {
      await api.post("/tickets/bulk", { tickets: bulk });
      fetchTickets();
    } catch (err) {
      console.error("Error en carga masiva", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-azulCorp via-azulTec to-cian font-poppins text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="flex items-center space-x-3">
          <Home size={20} />
          <span className="font-bold tracking-wide">Gestión de Tiquetes</span>
        </div>
        <button
          onClick={() => (window.location.href = "/home")}
          className="px-4 py-2 bg-cian rounded-lg hover:bg-turquesa transition"
        >
          Volver al Home
        </button>
      </header>

      {/* Formulario */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 space-y-4 mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(initialForm()).map((key) =>
            key === "observaciones" ? (
              <textarea
                key={key}
                name={key}
                placeholder="Observaciones"
                value={form[key]}
                onChange={handleFormChange}
                className="p-3 rounded-xl bg-white/20 placeholder-white/70 border focus:ring-2 focus:ring-cian outline-none md:col-span-2"
              />
            ) : key === "estado" ? (
              <select
                key={key}
                name={key}
                value={form[key]}
                onChange={handleFormChange}
                className="p-3 rounded-xl bg-white/20 border focus:ring-2 focus:ring-cian outline-none md:col-span-2"
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
              </select>
            ) : (
              <input
                key={key}
                type={key === "fecha" ? "date" : "text"}
                name={key}
                placeholder={key}
                value={form[key]}
                onChange={handleFormChange}
                className="p-3 rounded-xl bg-white/20 placeholder-white/70 border focus:ring-2 focus:ring-cian outline-none"
              />
            )
          )}
        </div>

        {/* Botones */}
        <div className="flex space-x-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gradient-to-r from-cian to-turquesa py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
          >
            {selected ? "Actualizar Ticket" : "Registrar Ticket"}
          </motion.button>
          {selected && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="flex-1 bg-red-500 py-3 rounded-xl font-semibold shadow-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
            >
              <XCircle size={18} /> <span>Cancelar</span>
            </motion.button>
          )}
        </div>
      </motion.form>

      {/* Buscador y acciones */}
      <div className="flex justify-between items-center max-w-4xl mx-auto mt-8">
        <div className="relative w-1/2">
          <Search className="absolute left-3 top-3 text-white/70" size={18} />
          <input
            type="text"
            placeholder="Buscar por actividad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-3 rounded-xl bg-white/20 placeholder-white/70 border focus:ring-2 focus:ring-cian outline-none"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-500 rounded-lg flex items-center hover:bg-green-600"
          >
            <Download size={16} className="mr-2" /> Exportar CSV
          </button>
          
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/30 mt-6">
        <h2 className="text-xl font-bold mb-4">Tickets Registrados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/10">
                {Object.keys(initialForm()).map((h) => (
                  <th key={h} className="p-2 capitalize">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <motion.tr
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cursor-pointer hover:bg-white/10 transition"
                >
                  {Object.keys(initialForm()).map((h) => (
                    <td key={h} className="p-2">
                      {h === "fecha" ? formatDate(t[h]) : t[h]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}