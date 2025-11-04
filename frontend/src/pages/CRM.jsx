// frontend/src/pages/CRM.jsx
import { useEffect, useMemo, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { Link } from "react-router-dom";
import {
  Plus, Edit, Trash2, X, Search, Home, Users as UsersIcon, 
  ChartBar, CalendarRange, TrendingUp, Activity, Target,
  Award, Clock, Zap, Eye, EyeOff
} from "lucide-react";

const COLORS = ["#06b6d4", "#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CRM() {
  const today = new Date().toISOString().slice(0, 10);
  const thirty = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [tab, setTab] = useState("analytics");
  const [filters, setFilters] = useState({
    from: thirty,
    to: today,
    interval: "day",
    status: "all",
  });
  const onChangeFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  // Recharts safe-mount
  const [chartsReady, setChartsReady] = useState(false);
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Analytics
  const [overview, setOverview] = useState({ pendientes: 0, completados: 0, total: 0 });
  const [byWorker, setByWorker] = useState([]);
  const [series, setSeries] = useState([]);

  // Users CRUD
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "", email: "", role: "client", phone: "",
    notify_enabled: 1, notify_interval: "24h", notify_panel: 1, notify_email: 1,
    password: ""
  });

  useEffect(() => { if (tab === "analytics") fetchAnalytics(); }, [tab, filters]);
  useEffect(() => { if (tab === "users") fetchUsers(); }, [tab, q]);

  async function fetchAnalytics() {
    try {
      const [ov, bw, ts] = await Promise.all([
        api.get("/crm/stats/overview", { params: filters }),
        api.get("/crm/stats/by-worker", { params: filters }),
        api.get("/crm/stats/timeseries", { params: filters }),
      ]);
      const ovData = ov?.data ?? {};
      setOverview({
        pendientes: Number(ovData.pendientes || 0),
        completados: Number(ovData.completados || 0),
        total: Number(ovData.total || 0),
      });
      setByWorker(
        (Array.isArray(bw?.data) ? bw.data : []).map(r => ({
          name: r?.name || "N/A",
          pendientes: Number(r?.pendientes || 0),
          completados: Number(r?.completados || 0),
          total: Number(r?.pendientes || 0) + Number(r?.completados || 0),
        }))
      );
      setSeries(
        (Array.isArray(ts?.data) ? ts.data : []).map(r => ({
          name: String(r?.bucket ?? "N/A"),
          cantidad: Number(r?.cantidad || 0),
        }))
      );
    } catch {
      toast.error("Error cargando analítica");
      setOverview({ pendientes: 0, completados: 0, total: 0 });
      setByWorker([]);
      setSeries([]);
    }
  }

  async function fetchUsers() {
    try {
      const res = await api.get("/crm/users", { params: { q } });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Error cargando usuarios");
      setUsers([]);
    }
  }

  const resetUserForm = () => {
    setEditingId(null);
    setUserForm({
      name: "", email: "", role: "client", phone: "",
      notify_enabled: 1, notify_interval: "24h", notify_panel: 1, notify_email: 1,
      password: ""
    });
  };
  const startCreate = () => { resetUserForm(); setOpenModal(true); };
  const startEdit = (u) => { 
    setEditingId(u.id); 
    setUserForm({ ...u, password: "" }); // No enviamos el hash actual
    setOpenModal(true); 
  };

  async function saveUser(e) {
    e.preventDefault();
    try {
      const payload = { ...userForm };
      
      // Si estamos editando y no se cambió la contraseña, no la enviamos
      if (editingId && !payload.password) {
        delete payload.password;
      }

      if (editingId) {
        await api.put(`/crm/users/${editingId}`, payload);
        toast.success("Usuario actualizado");
      } else {
        await api.post("/crm/users", payload);
        toast.success("Usuario creado");
      }
      setOpenModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error guardando usuario");
    }
  }

  async function removeUser(id) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await api.delete(`/crm/users/${id}`);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch {
      toast.error("Error eliminando");
    }
  }

  const pieOverview = useMemo(() => ([
    { name: "Pendientes", value: Number(overview.pendientes || 0) },
    { name: "Completados", value: Number(overview.completados || 0) },
  ]), [overview]);

  const radarData = useMemo(() => 
    byWorker.slice(0, 5).map(w => ({
      worker: w.name.split(' ')[0],
      rendimiento: ((w.completados / (w.total || 1)) * 100).toFixed(0),
      volumen: w.total
    }))
  , [byWorker]);

  const completionRate = overview.total > 0 
    ? ((overview.completados / overview.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-inter text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-2xl shadow-2xl border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <ChartBar size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Panel CRM</h1>
            <p className="text-xs text-white/50">Analytics & Management</p>
          </div>
        </div>
        <Link to="/home" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all">
          <Home size={18} />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
      </header>

      {/* Tabs */}
      <div className="px-8 pt-6">
        <div className="inline-flex bg-white/5 rounded-2xl p-1 backdrop-blur-xl border border-white/5">
          <button onClick={() => setTab("analytics")}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "analytics" 
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}>
            <Activity size={16} className="inline mr-2" />
            Analítica
          </button>
          <button onClick={() => setTab("users")}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "users" 
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}>
            <UsersIcon size={16} className="inline mr-2" />
            Usuarios
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="p-4 sm:p-8 space-y-6">
        <AnimatePresence mode="wait">
          {tab === "analytics" ? (
            <motion.section 
              key="analytics" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Desde</label>
                  <input 
                    type="date" 
                    name="from" 
                    value={filters.from} 
                    onChange={onChangeFilter}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Hasta</label>
                  <input 
                    type="date" 
                    name="to" 
                    value={filters.to} 
                    onChange={onChangeFilter}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Intervalo</label>
                  <select 
                    name="interval" 
                    value={filters.interval} 
                    onChange={onChangeFilter}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="day">Por día</option>
                    <option value="week">Por semana</option>
                    <option value="month">Por mes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">Estado</label>
                  <select 
                    name="status" 
                    value={filters.status} 
                    onChange={onChangeFilter}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="all">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    icon: Clock, 
                    label: "Pendientes", 
                    value: overview.pendientes,
                    color: "from-orange-500 to-amber-500",
                    bgColor: "bg-orange-500/10"
                  },
                  { 
                    icon: Award, 
                    label: "Completados", 
                    value: overview.completados,
                    color: "from-emerald-500 to-teal-500",
                    bgColor: "bg-emerald-500/10"
                  },
                  { 
                    icon: Target, 
                    label: "Total", 
                    value: overview.total,
                    color: "from-blue-500 to-cyan-500",
                    bgColor: "bg-blue-500/10"
                  },
                  { 
                    icon: Zap, 
                    label: "Completitud", 
                    value: `${completionRate}%`,
                    color: "from-purple-500 to-pink-500",
                    bgColor: "bg-purple-500/10"
                  },
                ].map((m, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative group"
                  >
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all">
                      <div className={`w-12 h-12 rounded-xl ${m.bgColor} flex items-center justify-center mb-4`}>
                        <m.icon size={24} className={`bg-gradient-to-r ${m.color} text-transparent bg-clip-text`} />
                      </div>
                      <p className="text-white/50 text-xs font-medium mb-1">{m.label}</p>
                      <p className="text-3xl font-bold tracking-tight">{m.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Gráficas principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Serie temporal - Area Chart */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Evolución Temporal</h3>
                      <p className="text-xs text-white/50 mt-1">Tendencia de tiquetes en el período</p>
                    </div>
                    <TrendingUp size={20} className="text-cyan-400" />
                  </div>
                  <div className="h-[300px]">
                    {!chartsReady || series.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white/40 text-sm">Sin datos disponibles</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series}>
                          <defs>
                            <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="#ffffff40" style={{ fontSize: '12px' }} />
                          <YAxis stroke="#ffffff40" style={{ fontSize: '12px' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              backdropFilter: 'blur(10px)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cantidad" 
                            stroke="#06b6d4" 
                            strokeWidth={3}
                            fill="url(#colorCantidad)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Distribución de Estados</h3>
                      <p className="text-xs text-white/50 mt-1">Pendientes vs Completados</p>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    {!chartsReady || pieOverview.every(p => p.value === 0) ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white/40 text-sm">Sin datos disponibles</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieOverview} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: '#ffffff40' }}
                          >
                            {pieOverview.map((_, idx) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Rendimiento por trabajador */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart Horizontal */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Rendimiento por Trabajador</h3>
                      <p className="text-xs text-white/50 mt-1">Comparativa de productividad</p>
                    </div>
                  </div>
                  <div className="h-[320px]">
                    {!chartsReady || byWorker.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white/40 text-sm">Sin datos disponibles</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byWorker} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="#ffffff40" style={{ fontSize: '12px' }} />
                          <YAxis type="category" dataKey="name" stroke="#ffffff40" style={{ fontSize: '12px' }} width={100} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="pendientes" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                          <Bar dataKey="completados" fill="#10b981" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Análisis de Eficiencia</h3>
                      <p className="text-xs text-white/50 mt-1">Top 5 trabajadores</p>
                    </div>
                  </div>
                  <div className="h-[320px]">
                    {!chartsReady || radarData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white/40 text-sm">Sin datos disponibles</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="worker" stroke="#ffffff60" style={{ fontSize: '11px' }} />
                          <PolarRadiusAxis stroke="#ffffff40" />
                          <Radar 
                            name="% Completitud" 
                            dataKey="rendimiento" 
                            stroke="#06b6d4" 
                            fill="#06b6d4" 
                            fillOpacity={0.3} 
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            // ------- USERS -------
            <motion.section 
              key="users" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="space-y-6"
            >
              {/* Barra de búsqueda */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-xl rounded-xl p-3 flex-1 border border-white/5">
                  <Search size={20} className="text-white/40" />
                  <input
                    placeholder="Buscar usuarios por nombre, email o rol..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="bg-transparent outline-none w-full text-white placeholder:text-white/40"
                  />
                </div>
                <button 
                  onClick={startCreate}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
                >
                  <Plus size={20}/> Nuevo usuario
                </button>
              </div>

              {/* Tabla de usuarios */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-white/5">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Notificaciones
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <motion.tr 
                          key={u.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-semibold">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white/70">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                              u.role === 'worker' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white/70">{u.phone || "-"}</td>
                          <td className="px-6 py-4">
                            {u.notify_enabled ? (
                              <div className="text-xs text-white/60">
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock size={12} className="text-cyan-400" />
                                  <span>{u.notify_interval}</span>
                                </div>
                                <div className="flex gap-2">
                                  {u.notify_email && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">Email</span>}
                                  {u.notify_panel && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Panel</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-white/40">Desactivadas</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => startEdit(u)} 
                                className="p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-300 transition-all"
                              >
                                <Edit size={16}/>
                              </button>
                              <button 
                                onClick={() => removeUser(u.id)} 
                                className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-all"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <UsersIcon size={48} className="mx-auto text-white/20 mb-3" />
                            <p className="text-white/40">No se encontraron usuarios</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal de usuario */}
              <AnimatePresence>
                {openModal && (
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
                      onSubmit={saveUser}
                      className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-semibold">
                            {editingId ? "Editar usuario" : "Crear usuario"}
                          </h3>
                          <p className="text-sm text-white/50 mt-1">
                            {editingId ? "Actualiza la información del usuario" : "Completa los datos del nuevo usuario"}
                          </p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setOpenModal(false)}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-xs text-white/50 mb-2 font-medium">Nombre completo</label>
                          <input 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" 
                            placeholder="Juan Pérez"
                            value={userForm.name} 
                            onChange={e=>setUserForm({...userForm, name:e.target.value})} 
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-white/50 mb-2 font-medium">Correo electrónico</label>
                          <input 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" 
                            placeholder="correo@ejemplo.com"
                            type="email" 
                            value={userForm.email} 
                            onChange={e=>setUserForm({...userForm, email:e.target.value})} 
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-white/50 mb-2 font-medium">Teléfono</label>
                          <input 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" 
                            placeholder="+502 1234-5678"
                            value={userForm.phone||""} 
                            onChange={e=>setUserForm({...userForm, phone:e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-white/50 mb-2 font-medium">Rol</label>
                          <select 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                            value={userForm.role} 
                            onChange={e=>setUserForm({...userForm, role:e.target.value})}
                          >
                            <option value="client">Cliente</option>
                            <option value="worker">Trabajador</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-white/50 mb-2 font-medium">Intervalo de notificación</label>
                          <select 
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                            value={userForm.notify_interval}
                            onChange={e=>setUserForm({...userForm, notify_interval:e.target.value})}
                          >
                            <option value="24h">Cada 24 horas</option>
                            <option value="48h">Cada 48 horas</option>
                            <option value="72h">Cada 72 horas</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-white/50 mb-2 font-medium">
                            {editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
                          </label>
                          <div className="relative">
                            <input 
                              className="w-full p-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" 
                              type={showPassword ? "text" : "password"}
                              placeholder={editingId ? "Dejar en blanco para no cambiar" : "••••••••"}
                              value={userForm.password} 
                              onChange={e=>setUserForm({...userForm, password:e.target.value})}
                              required={!editingId}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Notificaciones */}
                      <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
                        <p className="text-sm font-medium mb-3 text-white/70">Configuración de notificaciones</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!userForm.notify_enabled}
                              onChange={e=>setUserForm({...userForm, notify_enabled: e.target.checked ? 1 : 0})}
                              className="w-4 h-4 accent-cyan-500"
                            />
                            <span className="text-sm">Activadas</span>
                          </label>
                          
                          <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!userForm.notify_panel}
                              onChange={e=>setUserForm({...userForm, notify_panel: e.target.checked ? 1 : 0})}
                              className="w-4 h-4 accent-cyan-500"
                            />
                            <span className="text-sm">Panel</span>
                          </label>
                          
                          <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!userForm.notify_email}
                              onChange={e=>setUserForm({...userForm, notify_email: e.target.checked ? 1 : 0})}
                              className="w-4 h-4 accent-cyan-500"
                            />
                            <span className="text-sm">Correo</span>
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3">
                        <button 
                          type="button" 
                          onClick={()=>setOpenModal(false)}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
                        >
                          {editingId ? "Actualizar" : "Crear usuario"}
                        </button>
                      </div>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center text-xs text-white/40 py-6 border-t border-white/5">
        <p>© 2025 Serproc Consulting. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}