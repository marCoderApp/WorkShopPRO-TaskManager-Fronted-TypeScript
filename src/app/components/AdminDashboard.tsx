import { useState } from "react";
import {
  Wrench, LogOut, Plus, Shield, Users, ClipboardList,
  CheckCircle2, Clock, Loader2, AlertCircle, Trash2,
  Calendar, MapPin, Search, X, Sun, Moon, UserCog,
  UserPlus, Eye, EyeOff, BellRing
} from "lucide-react";
import { TaskDetailModal } from "./TaskDetailModal";
import { ConfirmModal } from "./ConfirmModal";
import type { Task, TaskStatus, AppUser } from "../App";
import { formatTaskDate, getCategoryLabel } from "../App";

type Priority = "baja" | "media" | "alta" | "critica";

interface Tecnico {
  id: string;
  nombre: string;
  avatar: string;
}

interface AdminDashboardProps {
  currentUser: AppUser;
  tasks: Task[];
  users: AppUser[];
  tecnicos: Tecnico[];
  onCreateTask: (task: Omit<Task, "id" | "creadoEn">) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, estado: TaskStatus) => void;
  onCreateUser: (user: Omit<AppUser, "id" | "activo">) => void;
  onDeleteUser: (userId: string) => void;
  onNotificarTarea: (taskId: string, adminNombre: string) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const estadoConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pendiente: { label: "Pendiente", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: <Clock className="w-3.5 h-3.5" /> },
  en_progreso: { label: "En progreso", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: <Loader2 className="w-3.5 h-3.5" /> },
  completada: { label: "Completada", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  bloqueada: { label: "Bloqueada", color: "text-red-500 bg-red-500/10 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const prioridadConfig: Record<Priority, { label: string; dot: string }> = {
  baja: { label: "Baja", dot: "bg-slate-400" },
  media: { label: "Media", dot: "bg-amber-400" },
  alta: { label: "Alta", dot: "bg-orange-400" },
  critica: { label: "Crítica", dot: "bg-red-500" },
};

const categorias = [
  { value: "GAS", label: "Gas" },
  { value: "ELECTRIC", label: "Eléctrico" },
  { value: "WIRELESS", label: "Inalámbrico" },
  { value: "INVERTER", label: "Inversor" },
  { value: "MANUAL", label: "Manual" },
];

/* ─── Modal: Nueva Tarea ─── */
function CrearTareaModal({ tecnicos, onClose, onSubmit }: {
  tecnicos: Tecnico[];
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "creadoEn">) => void;
}) {
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    titulo: "", descripcion: "", comentario: "",
    prioridad: "media" as Priority, estado: "pendiente" as TaskStatus,
    asignadoAId: tecnicos[0]?.id ?? "", asignadoANombre: tecnicos[0]?.nombre ?? "",
    fechaVencimiento: "", categoria: "MANUAL",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asignadoAId) {
      setFormError("No hay un técnico seleccionado. Verifica que existan técnicos activos.");
      return;
    }
    setFormError("");
    onSubmit(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-foreground" style={{ fontWeight: 600, fontSize: "1.125rem" }}>Nueva Tarea</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Título *</label>
            <input required value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="ej. Reemplazar filtro HVAC unidad B3"
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Instrucciones detalladas de la tarea..." rows={3}
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Comentario</label>
            <textarea value={form.comentario} onChange={(e) => setForm((f) => ({ ...f, comentario: e.target.value }))}
              placeholder="Comentario adicional..." rows={2}
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Fecha límite *</label>
              <input required type="date" value={form.fechaVencimiento} onChange={(e) => setForm((f) => ({ ...f, fechaVencimiento: e.target.value }))}
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Prioridad</label>
              <select value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value as Priority }))}
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                {(Object.keys(prioridadConfig) as Priority[]).map((p) => <option key={p} value={p}>{prioridadConfig[p].label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                {categorias.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Asignar a *</label>
            <select required value={form.asignadoAId}
              onChange={(e) => { const t = tecnicos.find((x) => x.id === e.target.value); setForm((f) => ({ ...f, asignadoAId: e.target.value, asignadoANombre: t?.nombre ?? "" })); }}
              disabled={tecnicos.length === 0}
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
              {tecnicos.length === 0 ? (
                <option value="">No hay técnicos disponibles</option>
              ) : (
                tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)
              )}
            </select>
          </div>
          {formError && <p className="text-destructive text-sm">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">Cancelar</button>
            <button type="submit" disabled={!tecnicos.length} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontWeight: 600 }}>Crear Tarea</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal: Nuevo Usuario ─── */
function CrearUsuarioModal({ isSuperAdmin, onClose, onSubmit }: {
  isSuperAdmin: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<AppUser, "id" | "activo">) => void;
}) {
  const [form, setForm] = useState({
    nombre: "", apellido: "", dni: "", email: "", password: "",
    rol: "tecnico" as AppUser["rol"], avatar: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const initials = `${form.nombre} ${form.apellido}`.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    onSubmit({ ...form, avatar: initials });
    onClose();
  }

  const rolesDisponibles = isSuperAdmin
    ? [{ value: "admin", label: "Administrador" }, { value: "tecnico", label: "Técnico" }]
    : [{ value: "tecnico", label: "Técnico" }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-foreground" style={{ fontWeight: 600, fontSize: "1.125rem" }}>Crear Usuario</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Nombre completo *</label>
            <input required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="ej. Ana Torres"
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Apellido *</label>
              <input required value={form.apellido} onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
                placeholder="ej. Torres"
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>DNI *</label>
              <input required value={form.dni} onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                placeholder="Documento"
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Correo electrónico *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="ana@empresa.com"
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Contraseña *</label>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres" minLength={6}
                className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Rol *</label>
            <select value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as AppUser["rol"] }))}
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
              {rolesDisponibles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>Crear Usuario</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Dashboard principal ─── */
type Tab = "tareas" | "equipo" | "usuarios";

const rolLabel: Record<AppUser["rol"], string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  tecnico: "Técnico",
};

const rolColor: Record<AppUser["rol"], string> = {
  superadmin: "text-primary bg-primary/15 border-primary/30",
  admin: "text-violet-500 bg-violet-500/10 border-violet-500/30",
  tecnico: "text-blue-500 bg-blue-500/10 border-blue-500/30",
};

export function AdminDashboard({
  currentUser, tasks, users, tecnicos,
  onCreateTask, onDeleteTask, onUpdateStatus,
  onCreateUser, onDeleteUser, onNotificarTarea,
  onLogout, darkMode, onToggleDark,
}: AdminDashboardProps) {
  const [showCrearTarea, setShowCrearTarea] = useState(false);
  const [showCrearUsuario, setShowCrearUsuario] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Task | null>(null);
  const [confirmarLogout, setConfirmarLogout] = useState(false);
  const [confirmarEliminarTarea, setConfirmarEliminarTarea] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAsignado, setFiltroAsignado] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState<TaskStatus | "todos">("todos");
  const [tabActivo, setTabActivo] = useState<Tab>("tareas");

  const isSuperAdmin = currentUser.rol === "superadmin";

  const tareasFiltradas = tasks.filter((t) => {
    const matchBusqueda = t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.asignadoANombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchAsignado = filtroAsignado === "todos" || t.asignadoAId === filtroAsignado;
    const matchEstado = filtroEstado === "todos" || t.estado === filtroEstado;
    return matchBusqueda && matchAsignado && matchEstado;
  });

  const stats = {
    total: tasks.length,
    pendiente: tasks.filter((t) => t.estado === "pendiente").length,
    en_progreso: tasks.filter((t) => t.estado === "en_progreso").length,
    completada: tasks.filter((t) => t.estado === "completada").length,
    bloqueada: tasks.filter((t) => t.estado === "bloqueada").length,
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; soloSuperAdmin?: boolean }[] = [
    { key: "tareas", label: "Tareas", icon: <ClipboardList className="w-4 h-4" /> },
    { key: "equipo", label: "Equipo", icon: <Users className="w-4 h-4" /> },
    { key: "usuarios", label: "Usuarios", icon: <UserCog className="w-4 h-4" />, soloSuperAdmin: false },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Encabezado */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Wrench className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-foreground" style={{ fontWeight: 700 }}>FieldOps</span>
          <span className="text-muted-foreground mx-1">·</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${rolColor[currentUser.rol]}`}>
            {rolLabel[currentUser.rol]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleDark} className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{currentUser.nombre}</span>
          </div>
          <button onClick={() => setConfirmarLogout(true)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <LogOut className="w-4 h-4" />
            <span style={{ fontSize: "0.875rem" }}>Salir</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Encabezado de página */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-foreground mb-1" style={{ fontWeight: 600, fontSize: "1.5rem" }}>Panel de Administración</h1>
            <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>Gestiona tareas y usuarios de la plataforma</p>
          </div>
          <div className="flex gap-2">
            {(isSuperAdmin || currentUser.rol === "admin") && tabActivo === "usuarios" && (
              <button onClick={() => setShowCrearUsuario(true)}
                className="flex items-center gap-2 bg-secondary border border-border text-foreground px-4 py-2.5 rounded-lg hover:bg-accent transition-colors"
                style={{ fontWeight: 500 }}>
                <UserPlus className="w-4 h-4" />Nuevo Usuario
              </button>
            )}
            {tabActivo === "tareas" && (
              <button onClick={() => setShowCrearTarea(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontWeight: 600 }}>
                <Plus className="w-4 h-4" />Nueva Tarea
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setTabActivo(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all -mb-px ${tabActivo === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              style={{ fontSize: "0.875rem", fontWeight: tabActivo === tab.key ? 600 : 400 }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Tareas ── */}
        {tabActivo === "tareas" && (
          <>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total", value: stats.total, color: "text-foreground" },
                { label: "Pendientes", value: stats.pendiente, color: "text-amber-500" },
                { label: "En progreso", value: stats.en_progreso, color: "text-blue-500" },
                { label: "Completadas", value: stats.completada, color: "text-emerald-500" },
                { label: "Bloqueadas", value: stats.bloqueada, color: "text-red-500" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <p className={s.color} style={{ fontWeight: 700, fontSize: "1.5rem" }}>{s.value}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar tareas..."
                  className="w-full bg-input-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ fontSize: "0.875rem" }} />
              </div>
              <select value={filtroAsignado} onChange={(e) => setFiltroAsignado(e.target.value)}
                className="bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: "0.875rem" }}>
                <option value="todos">Todos los técnicos</option>
                {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as TaskStatus | "todos")}
                className="bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: "0.875rem" }}>
                <option value="todos">Todos los estados</option>
                {(Object.keys(estadoConfig) as TaskStatus[]).map((s) => <option key={s} value={s}>{estadoConfig[s].label}</option>)}
              </select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="grid border-b border-border px-5 py-3" style={{ gridTemplateColumns: "1fr auto auto auto auto auto" }}>
                {["Tarea", "Vencimiento", "Prioridad", "Técnico", "Notif.", "Estado"].map((h) => (
                  <p key={h} className="text-muted-foreground" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</p>
                ))}
              </div>
              {tareasFiltradas.length === 0 ? (
                <div className="px-5 py-12 text-center"><p className="text-muted-foreground">No se encontraron tareas</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {tareasFiltradas.map((task) => {
                    const sc = estadoConfig[task.estado];
                    const pc = prioridadConfig[task.prioridad as Priority];
                    return (
                      <div key={task.id}
                        className="grid gap-4 px-5 py-4 items-center hover:bg-secondary/30 transition-colors group cursor-pointer"
                        style={{ gridTemplateColumns: "1fr auto auto auto auto auto" }}
                        onClick={() => setTareaSeleccionada(task)}>
                        <div className="min-w-0">
                          <p className="text-foreground truncate" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{task.titulo}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{getCategoryLabel(task.categoria)}</p>
                        </div>
                        <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>
                          <Calendar className="w-3 h-3" />{formatTaskDate(task.fechaVencimiento)}
                        </span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>
                          <span className={`w-2 h-2 rounded-full ${pc?.dot}`} />
                          <span className="text-muted-foreground">{pc?.label}</span>
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>{task.asignadoANombre}</span>
                        <div className="flex items-center justify-center" title={task.notificada ? `Notificado por ${task.notificadaPor} el ${task.notificadaEn}` : "Sin notificar"}>
                          {task.notificada
                            ? <BellRing className="w-4 h-4 text-emerald-500" />
                            : <BellRing className="w-4 h-4 text-border" />}
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${sc.color}`}>
                            {sc.icon}{sc.label}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmarEliminarTarea(task.id); }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Tab: Equipo ── */}
        {tabActivo === "equipo" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tecnicos.map((tech) => {
              const techTasks = tasks.filter((t) => t.asignadoAId === tech.id);
              const ts = {
                total: techTasks.length,
                pendiente: techTasks.filter((t) => t.estado === "pendiente").length,
                en_progreso: techTasks.filter((t) => t.estado === "en_progreso").length,
                completada: techTasks.filter((t) => t.estado === "completada").length,
                bloqueada: techTasks.filter((t) => t.estado === "bloqueada").length,
              };
              const completitud = ts.total > 0 ? Math.round((ts.completada / ts.total) * 100) : 0;

              return (
                <div key={tech.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-500" style={{ fontWeight: 700, fontSize: "1rem" }}>{tech.avatar}</span>
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontWeight: 500 }}>{tech.nombre}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Técnico · {ts.total} tareas</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Completitud</span>
                      <span className="text-foreground" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{completitud}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${completitud}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Pendientes", value: ts.pendiente, color: "text-amber-500" },
                      { label: "Activas", value: ts.en_progreso, color: "text-blue-500" },
                      { label: "Listas", value: ts.completada, color: "text-emerald-500" },
                      { label: "Bloqueadas", value: ts.bloqueada, color: "text-red-500" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className={s.color} style={{ fontWeight: 700 }}>{s.value}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {techTasks.length > 0 && (
                    <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2">
                      {techTasks.slice(0, 3).map((t) => {
                        const sc = estadoConfig[t.estado];
                        return (
                          <button key={t.id} onClick={() => setTareaSeleccionada(t)}
                            className="flex items-center justify-between text-left gap-2 hover:bg-secondary/50 rounded-lg px-2 py-1.5 transition-colors w-full">
                            <span className="text-foreground truncate" style={{ fontSize: "0.75rem" }}>{t.titulo}</span>
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-xs flex-shrink-0 ${sc.color}`}>{sc.icon}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Tab: Usuarios ── */}
        {tabActivo === "usuarios" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="grid border-b border-border px-5 py-3" style={{ gridTemplateColumns: "1fr auto auto auto" }}>
              {["Usuario", "Correo", "Rol", "Acciones"].map((h) => (
                <p key={h} className="text-muted-foreground" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</p>
              ))}
            </div>
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="grid gap-4 px-5 py-4 items-center hover:bg-secondary/20 transition-colors group"
                  style={{ gridTemplateColumns: "1fr auto auto auto" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${u.rol !== "tecnico" ? "bg-primary/20" : "bg-blue-500/20"}`}>
                      <span className={`font-bold text-sm ${u.rol !== "tecnico" ? "text-primary" : "text-blue-500"}`}>{u.avatar}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground truncate" style={{ fontWeight: 500, fontSize: "0.875rem" }}>{u.nombre}</p>
                      {u.id === currentUser.id && (
                        <span className="text-primary" style={{ fontSize: "0.7rem" }}>Tú</span>
                      )}
                    </div>
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>{u.email}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${rolColor[u.rol]}`}>
                    {rolLabel[u.rol]}
                  </span>
                  <div className="flex items-center justify-end">
                    {/* No se puede eliminar a uno mismo ni al superadmin si no eres superadmin */}
                    {u.id !== currentUser.id && (isSuperAdmin || u.rol === "tecnico") && (
                      <button onClick={() => onDeleteUser(u.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showCrearTarea && (
        <CrearTareaModal tecnicos={tecnicos} onClose={() => setShowCrearTarea(false)} onSubmit={onCreateTask} />
      )}
      {showCrearUsuario && (
        <CrearUsuarioModal isSuperAdmin={isSuperAdmin} onClose={() => setShowCrearUsuario(false)} onSubmit={onCreateUser} />
      )}
      {tareaSeleccionada && (
        <TaskDetailModal
          task={tareaSeleccionada}
          puedeModificarEstado={false}
          puedeNotificar={true}
          onClose={() => setTareaSeleccionada(null)}
          onUpdateStatus={onUpdateStatus}
          onNotificar={(taskId) => {
            onNotificarTarea(taskId, currentUser.nombre);
            setTareaSeleccionada((t) => t ? { ...t, notificada: true, notificadaPor: currentUser.nombre } : null);
          }}
        />
      )}

      {confirmarLogout && (
        <ConfirmModal
          titulo="¿Cerrar sesión?"
          mensaje="¿Estás seguro que quieres salir de la plataforma?"
          labelConfirmar="Sí, salir"
          labelCancelar="Cancelar"
          variante="warning"
          onConfirmar={() => { setConfirmarLogout(false); onLogout(); }}
          onCancelar={() => setConfirmarLogout(false)}
        />
      )}

      {confirmarEliminarTarea && (
        <ConfirmModal
          titulo="¿Eliminar tarea?"
          mensaje="Esta acción no se puede deshacer. La tarea será eliminada permanentemente."
          labelConfirmar="Sí, eliminar"
          labelCancelar="Cancelar"
          variante="danger"
          onConfirmar={() => { onDeleteTask(confirmarEliminarTarea); setConfirmarEliminarTarea(null); }}
          onCancelar={() => setConfirmarEliminarTarea(null)}
        />
      )}
    </div>
  );
}
