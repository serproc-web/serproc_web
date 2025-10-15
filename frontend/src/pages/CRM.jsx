// frontend/src/pages/CRM.jsx
import { useEffect, useMemo, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { Link } from "react-router-dom";
import {
  Plus, Edit, Trash2, X, Search, Home,
  Users as UsersIcon, ChartBar, CalendarRange
} from "lucide-react";

const COLORS = ["#06b6d4", "#2563eb", "#10b981", "#f59e0b", "#ef4444"];

export default function CRM() {
  const today = new Date().toISOString().slice(0, 10);
  const thirty = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [tab, setTab] = useState("analytics");
  const [chartType, setChartType] = useState("bar");
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
  const startEdit = (u) => { setEditingId(u.id); setUserForm({ ...u, password: "" }); setOpenModal(true); };

  async function saveUser(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/users/${editingId}`, userForm);
        toast.success("Usuario actualizado");
      } else {
        await api.post("/crm/users", userForm);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0ea5e9] font-poppins text-gray-200">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 bg-white/10 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <ChartBar size={22} />
          <h1 className="text-2xl font-bold text-white">Panel CRM</h1>
        </div>
        <Link to="/home" className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:scale-105 transition">
          <Home size={18} /> Inicio
        </Link>
      </header>

      {/* Tabs */}
      <div className="px-8 pt-6">
        <div className="inline-flex bg-white/10 rounded-xl p-1 backdrop-blur-md">
          <button onClick={() => setTab("analytics")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === "analytics" ? "bg-cyan-500 text-white" : "text-white/80 hover:text-white"}`}>
            Analítica
          </button>
          <button onClick={() => setTab("users")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === "users" ? "bg-cyan-500 text-white" : "text-white/80 hover:text-white"}`}>
            Usuarios
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="p-8 space-y-10">
        <AnimatePresence mode="wait">
          {tab === "analytics" ? (
            <motion.section key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
              {/* Filtros */}
              <div className="grid md:grid-cols-5 gap-4 bg-white/10 rounded-2xl p-5 backdrop-blur-md">
                <div className="col-span-2">
                  <label className="block text-xs mb-1">Rango</label>
                  <div className="flex items-center gap-2">
                    <input type="date" name="from" value={filters.from} onChange={onChangeFilter}
                      className="w-full p-2 rounded-lg bg-white/20 text-white" />
                    <CalendarRange size={18} />
                    <input type="date" name="to" value={filters.to} onChange={onChangeFilter}
                      className="w-full p-2 rounded-lg bg-white/20 text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1">Intervalo</label>
                  <select name="interval" value={filters.interval} onChange={onChangeFilter}
                          className="w-full p-2 rounded-lg bg-white/20 text-white">
                    <option value="day">Día</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1">Estado</label>
                  <select name="status" value={filters.status} onChange={onChangeFilter}
                          className="w-full p-2 rounded-lg bg-white/20 text-white">
                    <option value="all">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1">Gráfico</label>
                  <select value={chartType} onChange={e => setChartType(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white/20 text-white">
                    <option value="bar">Barras</option>
                    <option value="line">Líneas</option>
                    <option value="pie">Pastel</option>
                  </select>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: "Tiquetes Pendientes", value: overview.pendientes },
                  { label: "Tiquetes Completados", value: overview.completados },
                  { label: "Total", value: overview.total },
                ].map((m, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03 }} className="bg-white/20 rounded-2xl p-6 shadow-xl">
                    <p className="text-white/70 text-sm">{m.label}</p>
                    <p className="text-4xl font-extrabold">{m.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Serie temporal */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-azulCorp mb-4">Evolución en el tiempo</h3>
                <div className="h-[340px]">
                  {!chartsReady || series.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay datos para mostrar</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                      {chartType === "bar" ? (
                        <BarChart data={series}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="cantidad" fill="#06b6d4" />
                        </BarChart>
                      ) : chartType === "line" ? (
                        <LineChart data={series}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="cantidad" stroke="#06b6d4" strokeWidth={3} dot={false}/>
                        </LineChart>
                      ) : (
                        <PieChart>
                          <Pie data={series} dataKey="cantidad" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                            {series.map((_, idx) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Por trabajador */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-azulCorp mb-4">Rendimiento por trabajador</h3>
                <div className="h-[320px]">
                  {!chartsReady || byWorker.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay datos</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                      <BarChart data={byWorker}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pendientes" fill="#f59e0b" />
                        <Bar dataKey="completados" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Pastel resumen */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-azulCorp mb-4">Pendientes vs Completados</h3>
                <div className="h-[280px]">
                  {!chartsReady || pieOverview.every(p => p.value === 0) ? (
                    <p className="text-center text-gray-500 py-8">No hay datos</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                      <PieChart>
                        <Pie data={pieOverview} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {pieOverview.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </motion.section>
          ) : (
            // ------- USERS (sin cambios funcionales) -------
            <motion.section key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-6">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 flex-1">
                  <Search size={18} className="opacity-80" />
                  <input
                    placeholder="Buscar por nombre, correo o rol…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="bg-transparent outline-none w-full text-white"
                  />
                </div>
                <button onClick={startCreate}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg shadow hover:scale-105 transition">
                  <Plus size={18}/> Nuevo usuario
                </button>
              </div>

              <div className="overflow-x-auto bg-white/90 rounded-2xl shadow-2xl">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3"><UsersIcon size={16} className="inline mr-2"/>Usuario</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3">Notificaciones</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-100 text-gray-800">
                        <td className="px-4 py-3 font-semibold">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3 capitalize">{u.role}</td>
                        <td className="px-4 py-3">{u.phone || "-"}</td>
                        <td className="px-4 py-3">
                          {u.notify_enabled
                            ? `${u.notify_interval} • ${u.notify_email ? "correo" : ""}${u.notify_panel ? (u.notify_email ? " + " : "") + "panel" : ""}`
                            : "Desactivadas"}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => startEdit(u)} className="p-2 bg-cyan-500 rounded-lg text-white hover:bg-cyan-600"><Edit size={16}/></button>
                          <button onClick={() => removeUser(u.id)} className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan="6" className="text-center text-gray-500 py-6">Sin resultados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <AnimatePresence>
                {openModal && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.form
                      initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                      onSubmit={saveUser}
                      className="w-full max-w-lg bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{editingId ? "Editar usuario" : "Nuevo usuario"}</h3>
                        <button type="button" onClick={() => setOpenModal(false)}><X/></button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="p-3 rounded-lg bg-white/20 text-white" placeholder="Nombre"
                               value={userForm.name} onChange={e=>setUserForm({...userForm, name:e.target.value})} required/>
                        <input className="p-3 rounded-lg bg-white/20 text-white" placeholder="Correo"
                               type="email" value={userForm.email} onChange={e=>setUserForm({...userForm, email:e.target.value})} required/>
                        <input className="p-3 rounded-lg bg-white/20 text-white" placeholder="Teléfono"
                               value={userForm.phone||""} onChange={e=>setUserForm({...userForm, phone:e.target.value})}/>
                        <select className="p-3 rounded-lg bg-white/20 text-white"
                                value={userForm.role} onChange={e=>setUserForm({...userForm, role:e.target.value})}>
                          <option value="client">client</option>
                          <option value="worker">worker</option>
                          <option value="admin">admin</option>
                        </select>
                        <select className="p-3 rounded-lg bg-white/20 text-white"
                                value={userForm.notify_interval}
                                onChange={e=>setUserForm({...userForm, notify_interval:e.target.value})}>
                          <option value="24h">24h</option>
                          <option value="48h">48h</option>
                          <option value="72h">72h</option>
                        </select>
                        <input className="p-3 rounded-lg bg-white/20 text-white" type="password" placeholder="Nueva contraseña (opcional)"
                               value={userForm.password} onChange={e=>setUserForm({...userForm, password:e.target.value})}/>
                        <label className="flex items-center gap-2 text-white/90">
                          <input type="checkbox" checked={!!userForm.notify_enabled}
                                 onChange={e=>setUserForm({...userForm, notify_enabled: e.target.checked ? 1 : 0})}/>
                          Notificaciones activas
                        </label>
                        <label className="flex items-center gap-2 text-white/90">
                          <input type="checkbox" checked={!!userForm.notify_panel}
                                 onChange={e=>setUserForm({...userForm, notify_panel: e.target.checked ? 1 : 0})}/>
                          Panel
                        </label>
                        <label className="flex items-center gap-2 text-white/90">
                          <input type="checkbox" checked={!!userForm.notify_email}
                                 onChange={e=>setUserForm({...userForm, notify_email: e.target.checked ? 1 : 0})}/>
                          Correo
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={()=>setOpenModal(false)}
                                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">Cancelar</button>
                        <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow">Guardar</button>
                      </div>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center text-sm text-white/70 py-6 border-t border-white/20">
        © 2025 Serproc Consulting | Todos los derechos reservados
      </footer>
    </div>
  );
}
