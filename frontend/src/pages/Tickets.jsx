// frontend/src/pages/Tickets.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import {
  Search,
  Upload,
  Download,
  Home,
  X,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Filter,
  FileText,
  HelpCircle,
  FileDown,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ q: "", month: "", estado: "all" });
  const [availableMonths, setAvailableMonths] = useState([]);
  const [uniqueClientes, setUniqueClientes] = useState([]);
  const [uniqueUsuarios, setUniqueUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const [showUsuarioSuggestions, setShowUsuarioSuggestions] = useState(false);
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name") || "Usuario";

  useEffect(() => {
    fetchTickets();
    fetchMonths();
    fetchClientes();
    fetchUsuarios();
  }, [filters]);

  function initialForm() {
    return {
      numero: "",
      fecha: new Date().toISOString().split("T")[0],
      actividad: "",
      cliente: "",
      usuario_cliente: "",
      minutos: "",
      horas: "0",
      observaciones: "",
      estado: "pendiente",
    };
  }

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append("q", filters.q);
      if (filters.month) params.append("month", filters.month);
      if (filters.estado !== "all") params.append("estado", filters.estado);

      const res = await api.get(`/tickets/${userId}?${params.toString()}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error al cargar tickets", err);
      toast.error("Error cargando tickets");
    }
  };

  const fetchMonths = async () => {
    try {
      const res = await api.get(`/tickets/${userId}/filters/months`);
      setAvailableMonths(res.data);
    } catch (err) {
      console.error("Error cargando meses", err);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await api.get(`/tickets/${userId}/filters/clientes`);
      setUniqueClientes(res.data);
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.get(`/tickets/${userId}/filters/usuarios`);
      setUniqueUsuarios(res.data);
    } catch (err) {
      console.error("Error cargando usuarios", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // 🔥 Cálculo automático de horas cuando cambian los minutos
      if (name === "minutos") {
        const mins = parseFloat(value) || 0;
        updated.horas = (mins / 60).toFixed(2);
      }

      return updated;
    });

    // Mostrar sugerencias
    if (name === "cliente") {
      setShowClienteSuggestions(value.length > 0);
    }
    if (name === "usuario_cliente") {
      setShowUsuarioSuggestions(value.length > 0);
    }
  };

  const selectCliente = (cliente) => {
    setForm({ ...form, cliente });
    setShowClienteSuggestions(false);
  };

  const selectUsuario = (usuario) => {
    setForm({ ...form, usuario_cliente: usuario });
    setShowUsuarioSuggestions(false);
  };

  // 🔥 Generar PDF con jsPDF
  const generatePDF = async () => {
    try {
      toast.loading("Generando reporte PDF...");

      const params = new URLSearchParams();
      if (filters.month) params.append("month", filters.month);
      if (filters.estado !== "all") params.append("estado", filters.estado);

      const res = await api.get(
        `/tickets/${userId}/report/data?${params.toString()}`
      );
      const { tickets: reportTickets, stats } = res.data;

      // Importar jsPDF dinámicamente
      const { jsPDF } = await import("jspdf");
      await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header con gradiente simulado
      doc.setFillColor(6, 182, 212); // cyan
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.text("Reporte de Tickets", pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Generado por: ${userName}`, pageWidth / 2, 28, {
        align: "center",
      });
      doc.text(
        `Fecha: ${new Date().toLocaleDateString("es")}`,
        pageWidth / 2,
        34,
        { align: "center" }
      );

      // Stats
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Resumen Ejecutivo", 14, 50);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      let yPos = 58;

      const statLines = [
        `Total de Tickets: ${stats.totalTickets}`,
        `Completados: ${stats.completados} | Pendientes: ${stats.pendientes}`,
        `Total Horas: ${stats.totalHoras}h (${stats.totalMinutos} minutos)`,
      ];

      statLines.forEach((line) => {
        doc.text(line, 14, yPos);
        yPos += 6;
      });

      // Tickets por cliente
      if (stats.porCliente.length > 0) {
        yPos += 5;
        doc.setFont(undefined, "bold");
        doc.text("Distribución por Cliente:", 14, yPos);
        doc.setFont(undefined, "normal");
        yPos += 6;

        stats.porCliente.forEach((c) => {
          doc.text(
            `  • ${c.cliente}: ${c.cantidad} tickets (${c.horas}h)`,
            14,
            yPos
          );
          yPos += 5;
        });
      }

      // Tabla de tickets
      yPos += 10;
      const tableData = reportTickets.map((t) => [
        t.numero || "-",
        new Date(t.fecha).toLocaleDateString("es"),
        t.actividad || "-",
        t.cliente || "-",
        t.usuario_cliente || "-",
        t.minutos || "0",
        parseFloat(t.horas || 0).toFixed(2),
        t.estado,
      ]);

      doc.autoTable({
        head: [
          [
            "Nº",
            "Fecha",
            "Actividad",
            "Cliente",
            "Usuario",
            "Min",
            "Hrs",
            "Estado",
          ],
        ],
        body: tableData,
        startY: yPos,
        theme: "grid",
        headStyles: {
          fillColor: [6, 182, 212],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 22 },
          2: { cellWidth: 45 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 12, halign: "right" },
          6: { cellWidth: 12, halign: "right" },
          7: { cellWidth: 20, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 7) {
            if (data.cell.raw === "completado") {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [245, 158, 11];
            }
          }
        },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${pageCount} | © 2025 Serproc Consulting`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      doc.save(
        `reporte_tickets_${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast.dismiss();
      toast.success("📄 PDF generado exitosamente");
    } catch (err) {
      toast.dismiss();
      toast.error("Error generando PDF");
      console.error("Error en PDF:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.actividad || !form.cliente) {
      toast.error("Actividad y cliente son requeridos");
      return;
    }

    try {
      const payload = {
        ...form,
        user_id: userId,
        fecha: formatDate(form.fecha || new Date()),
      };

      if (selected) {
        await api.patch(`/tickets/${selected.id}`, {
          field: "all",
          value: payload,
        });
        toast.success("Ticket actualizado ✅");
      } else {
        await api.post("/tickets", payload);
        toast.success("Ticket creado ✅");
      }

      setForm(initialForm());
      setSelected(null);
      setShowModal(false);
      fetchTickets();
    } catch (err) {
      console.error("Error al guardar ticket", err);
      toast.error("Error guardando ticket ❌");
    }
  };

  const handleSelect = (ticket) => {
    setSelected(ticket);
    setForm({ ...ticket, fecha: formatDate(ticket.fecha) });
    setShowModal(true);
  };

  const handleCancel = () => {
    setSelected(null);
    setForm(initialForm());
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este ticket?")) return;

    try {
      await api.delete(`/tickets/${id}`);
      toast.success("Ticket eliminado ✅");
      fetchTickets();
    } catch (err) {
      toast.error("Error eliminando ticket ❌");
    }
  };

  const exportCSV = () => {
    const headers =
      "Numero Ticket,Fecha,Actividad,Minutos,Horas,Cliente,Usuario,Observaciones";
    const rows = tickets
      .map(
        (t) =>
          `"${t.numero || ""}","${formatDate(t.fecha)}","${
            t.actividad || ""
          }","${t.minutos || ""}","${t.horas || ""}","${
            t.cliente || ""
          }","${t.usuario_cliente || ""}","${t.observaciones || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + "\n" + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado ✅");
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());

      if (lines.length < 2) {
        toast.error("El archivo CSV está vacío");
        return;
      }

      // Parsear el header
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Mapeo de headers del CSV a campos de la BD
      const fieldMap = {
        "numero ticket": "numero",
        numero: "numero",
        fecha: "fecha",
        actividad: "actividad",
        minutos: "minutos",
        horas: "horas",
        cliente: "cliente",
        "usuario del cliente (nombre)": "usuario_cliente",
        usuario: "usuario_cliente",
        observaciones: "observaciones",
      };

      const bulk = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parsear valores respetando comillas
        const values = [];
        let current = "";
        let inQuotes = false;

        for (let char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        // Construir objeto ticket
        const ticket = {
          user_id: userId,
          numero: "",
          fecha: formatDate(new Date()),
          actividad: "",
          cliente: "",
          usuario_cliente: "",
          minutos: "0",
          horas: "0",
          observaciones: "",
          estado: "completado",
        };

        // Mapear valores según headers
        headers.forEach((header, idx) => {
          const fieldName = fieldMap[header];
          if (fieldName && values[idx]) {
            let value = values[idx].trim();

            // Limpiar comillas
            value = value.replace(/^"|"$/g, "");

            if (!value) return;

            if (fieldName === "fecha") {
              // Convertir fecha DD/MM/YYYY a YYYY-MM-DD
              if (value.includes("/")) {
                const parts = value.split("/");
                if (parts.length === 3) {
                  const day = parts[0].padStart(2, "0");
                  const month = parts[1].padStart(2, "0");
                  const year = parts[2];
                  ticket.fecha = `${year}-${month}-${day}`;
                }
              } else {
                ticket.fecha = value;
              }
            } else if (fieldName === "minutos" || fieldName === "horas") {
              // Convertir comas decimales a puntos
              value = value.replace(",", ".");
              ticket[fieldName] = value;
            } else {
              ticket[fieldName] = value;
            }
          }
        });

        // Solo agregar si tiene al menos actividad o cliente
        if (ticket.actividad || ticket.cliente) {
          bulk.push(ticket);
        }
      }

      if (bulk.length === 0) {
        toast.error("No se encontraron tickets válidos en el CSV");
        return;
      }

      const loadingToast = toast.loading(
        `Importando ${bulk.length} tickets...`
      );

      await api.post("/tickets/bulk", { tickets: bulk });

      toast.dismiss(loadingToast);
      toast.success(`✅ ${bulk.length} tickets importados correctamente`);

      fetchTickets();

      // Limpiar input
      e.target.value = "";
    } catch (err) {
      toast.dismiss();
      toast.error("❌ Error importando CSV");
      console.error("Error en importación:", err);
    }
  };

  const totalHoras = tickets.reduce(
    (sum, t) => sum + parseFloat(t.horas || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-inter text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-2xl shadow-2xl border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <FileText size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Gestión de Tickets
            </h1>
            <p className="text-xs text-white/50">Control de actividades</p>
          </div>
        </div>
        <Link
          to="/home"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
        >
          <Home size={18} />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
      </header>

      <main className="flex-1 p-4 sm:p-8 space-y-6">
        {/* Filtros y acciones */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2 relative">
            <Search
              className="absolute left-3 top-3 text-white/40"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por actividad, cliente..."
              value={filters.q}
              onChange={(e) =>
                setFilters({ ...filters, q: e.target.value })
              }
              className="w-full pl-10 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Filtro por mes - estilo oscuro */}
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: e.target.value })
              }
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
            >
              <option className="bg-slate-900 text-white" value="">
                Todos los meses
              </option>
              {availableMonths.map((m) => (
                <option
                  key={m}
                  value={m}
                  className="bg-slate-900 text-white"
                >
                  {new Date(m + "-01").toLocaleDateString("es", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
            />
          </div>

          {/* Filtro por estado - estilo oscuro */}
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <select
              value={filters.estado}
              onChange={(e) =>
                setFilters({ ...filters, estado: e.target.value })
              }
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
            >
              <option value="all" className="bg-slate-900 text-white">
                Todos los estados
              </option>
              <option
                value="pendiente"
                className="bg-slate-900 text-white"
              >
                Pendiente
              </option>
              <option
                value="completado"
                className="bg-slate-900 text-white"
              >
                Completado
              </option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
            />
          </div>
        </div>

        {/* Stats y acciones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={20} className="text-cyan-400" />
              <span className="text-sm text-white/60">
                Total Tickets
              </span>
            </div>
            <p className="text-3xl font-bold">{tickets.length}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-blue-400" />
              <span className="text-sm text-white/60">
                Horas Totales
              </span>
            </div>
            <p className="text-3xl font-bold">
              {totalHoras.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm(initialForm());
                setSelected(null);
                setShowModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Plus size={20} /> Nuevo
            </button>
            <button
              onClick={generatePDF}
              className="px-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all border border-red-500/30"
              title="Generar PDF"
            >
              <FileDown
                size={20}
                className="text-red-400"
              />
            </button>
            <button
              onClick={exportCSV}
              className="px-4 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all border border-emerald-500/30"
              title="Exportar CSV"
            >
              <Download
                size={20}
                className="text-emerald-400"
              />
            </button>
            <label
              className="px-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all border border-purple-500/30 flex items-center cursor-pointer"
              title="Importar CSV"
            >
              <Upload
                size={20}
                className="text-purple-400"
              />
              <input
                type="file"
                accept=".csv"
                onChange={importCSV}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all border border-blue-500/30"
              title="Ayuda CSV"
            >
              <HelpCircle
                size={20}
                className="text-blue-400"
              />
            </button>
          </div>
        </div>

        {/* Tabla de tickets */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">
                    Nº
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">
                    Actividad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/70 uppercase">
                    Minutos
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/70 uppercase">
                    Horas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/70 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((t) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-white/80">
                      {t.numero || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80">
                      {formatDate(t.fecha)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {t.actividad}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80">
                      {t.cliente}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {t.usuario_cliente || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-white/80">
                      {t.minutos}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-cyan-400">
                      {parseFloat(t.horas || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          t.estado === "completado"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-orange-500/20 text-orange-300"
                        }`}
                      >
                        {t.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSelect(t)}
                          className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-all"
                        >
                          <Edit
                            size={16}
                            className="text-cyan-400"
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                        >
                          <Trash2
                            size={16}
                            className="text-red-400"
                          />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-12 text-center"
                    >
                      <FileText
                        size={48}
                        className="mx-auto text-white/20 mb-3"
                      />
                      <p className="text-white/40">
                        No hay tickets para mostrar
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de formulario */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleSubmit}
              className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">
                  {selected ? "Editar Ticket" : "Nuevo Ticket"}
                </h3>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Número
                  </label>
                  <input
                    name="numero"
                    value={form.numero}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Actividad *
                  </label>
                  <input
                    name="actividad"
                    value={form.actividad}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Descripción de la actividad"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Cliente *
                  </label>
                  <div className="relative">
                    <input
                      name="cliente"
                      value={form.cliente}
                      onChange={handleFormChange}
                      onFocus={() =>
                        setShowClienteSuggestions(
                          form.cliente.length > 0
                        )
                      }
                      onBlur={() =>
                        setTimeout(
                          () => setShowClienteSuggestions(false),
                          200
                        )
                      }
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="Nombre del cliente"
                      required
                    />
                    {showClienteSuggestions &&
                      uniqueClientes.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-white/10 rounded-xl max-h-48 overflow-y-auto shadow-xl">
                          {uniqueClientes
                            .filter((c) =>
                              c
                                .toLowerCase()
                                .includes(
                                  form.cliente.toLowerCase()
                                )
                            )
                            .map((cliente, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() =>
                                  selectCliente(cliente)
                                }
                                className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-sm text-white"
                              >
                                {cliente}
                              </button>
                            ))}
                        </div>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Usuario
                  </label>
                  <div className="relative">
                    <input
                      name="usuario_cliente"
                      value={form.usuario_cliente}
                      onChange={handleFormChange}
                      onFocus={() =>
                        setShowUsuarioSuggestions(
                          form.usuario_cliente.length > 0
                        )
                      }
                      onBlur={() =>
                        setTimeout(
                          () => setShowUsuarioSuggestions(false),
                          200
                        )
                      }
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="Opcional"
                    />
                    {showUsuarioSuggestions &&
                      uniqueUsuarios.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-white/10 rounded-xl max-h-48 overflow-y-auto shadow-xl">
                          {uniqueUsuarios
                            .filter((u) =>
                              u
                                .toLowerCase()
                                .includes(
                                  form.usuario_cliente.toLowerCase()
                                )
                            )
                            .map((usuario, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() =>
                                  selectUsuario(usuario)
                                }
                                className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-sm text-white"
                              >
                                {usuario}
                              </button>
                            ))}
                        </div>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Minutos
                  </label>
                  <input
                    type="number"
                    name="minutos"
                    value={form.minutos}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Horas (calculado)
                  </label>
                  <input
                    type="text"
                    name="horas"
                    value={form.horas}
                    readOnly
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-cyan-400 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option
                      value="pendiente"
                      className="bg-slate-900 text-white"
                    >
                      Pendiente
                    </option>
                    <option
                      value="completado"
                      className="bg-slate-900 text-white"
                    >
                      Completado
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-white/50 mb-2 font-medium">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
                >
                  {selected ? "Actualizar" : "Crear Ticket"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de ayuda CSV */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <HelpCircle
                      size={20}
                      className="text-blue-400"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold">
                    Formato de CSV
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-white/70">
                  El archivo CSV debe tener estos campos (separados
                  por comas):
                </p>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 font-mono text-sm overflow-x-auto">
                  <div className="text-cyan-400">
                    Numero Ticket,Fecha,Actividad,Minutos,Horas,Cliente,Usuario,Observaciones
                  </div>
                  <div className="text-white/60 mt-2">
                    #251420,3/11/2025,Problema con SAP,120,2.00,BARENTZ
                    GT,Alejandro Rodas,Revisión
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-white/90 font-medium">
                    📋 Campos aceptados (case-insensitive):
                  </p>
                  <ul className="space-y-1 text-white/70 ml-4">
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Numero Ticket
                      </span>{" "}
                      o{" "}
                      <span className="text-cyan-400">
                        Numero
                      </span>
                    </li>
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Fecha
                      </span>{" "}
                      (formato: DD/MM/YYYY)
                    </li>
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Actividad
                      </span>
                    </li>
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Minutos
                      </span>{" "}
                      (acepta comas: 0,5 o puntos: 0.5)
                    </li>
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Horas
                      </span>{" "}
                      (acepta comas: 2,5 o puntos: 2.5)
                    </li>
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Cliente
                      </span>
                    </li>
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Usuario
                      </span>{" "}
                      o{" "}
                      <span className="text-cyan-400">
                        Usuario del cliente (Nombre)
                      </span>
                    </li>
                    <li>
                      •{" "}
                      <span className="text-cyan-400">
                        Observaciones
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Tip:</strong> Las filas vacías o sin
                    actividad/cliente serán ignoradas
                    automáticamente. Todos los tickets importados se
                    marcarán como "completado" por defecto.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-medium hover:scale-105 transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center text-xs text-white/40 py-6 border-t border-white/5">
        <p>© 2025 Serproc Consulting. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
