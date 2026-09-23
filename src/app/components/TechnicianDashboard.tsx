import { useState } from "react";
import {
  Wrench, LogOut, Clock, CheckCircle2, AlertCircle, Loader2,
  Calendar, User, Filter, Sun, Moon
} from "lucide-react";
import { TaskDetailModal } from "./TaskDetailModal";
import { ConfirmModal } from "./ConfirmModal";
import { formatTaskDate, getCategoryLabel } from "../App";
import type { Task, TaskStatus, AppUser } from "../App";

type Priority = "baja" | "media" | "alta" | "critica";

interface TechnicianDashboardProps {
  currentUser: AppUser;
  tasks: Task[];
  onUpdateStatus: (taskId: string, estado: TaskStatus) => void | Promise<void>;
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

const prioridadConfig: Record<Priority, { label: string; dot: string; bar: string }> = {
  baja: { label: "Baja", dot: "bg-slate-400", bar: "bg-slate-400" },
  media: { label: "Media", dot: "bg-amber-400", bar: "bg-amber-400" },
  alta: { label: "Alta", dot: "bg-orange-400", bar: "bg-orange-400" },
  critica: { label: "Crítica", dot: "bg-red-500", bar: "bg-red-500" },
};

export function TechnicianDashboard({ currentUser, tasks, onUpdateStatus, onLogout, darkMode, onToggleDark }: TechnicianDashboardProps) {
  const [filtroEstado, setFiltroEstado] = useState<TaskStatus | "todas">("todas");
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Task | null>(null);
  const [confirmarLogout, setConfirmarLogout] = useState(false);

  const misTareas = tasks.filter((t) => t.asignadoAId === currentUser.id);
  const filtradas = filtroEstado === "todas" ? misTareas : misTareas.filter((t) => t.estado === filtroEstado);

  const conteos = {
    todas: misTareas.length,
    pendiente: misTareas.filter((t) => t.estado === "pendiente").length,
    en_progreso: misTareas.filter((t) => t.estado === "en_progreso").length,
    completada: misTareas.filter((t) => t.estado === "completada").length,
    bloqueada: misTareas.filter((t) => t.estado === "bloqueada").length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Wrench className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-foreground" style={{ fontWeight: 700 }}>FieldOps</span>
          <span className="text-muted-foreground mx-1">·</span>
          <span className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>Técnico</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleDark} className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-foreground" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{currentUser.nombre}</span>
          </div>
          <button onClick={() => setConfirmarLogout(true)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <LogOut className="w-4 h-4" />
            <span style={{ fontSize: "0.875rem" }}>Salir</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-1" style={{ fontWeight: 600, fontSize: "1.5rem" }}>Mis Tareas</h1>
          <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>
            {conteos.en_progreso} en progreso · {conteos.pendiente} pendientes · {conteos.completada} completadas
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: conteos.todas, color: "text-foreground" },
            { label: "Pendientes", value: conteos.pendiente, color: "text-amber-500" },
            { label: "En progreso", value: conteos.en_progreso, color: "text-blue-500" },
            { label: "Completadas", value: conteos.completada, color: "text-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className={s.color} style={{ fontWeight: 700, fontSize: "1.75rem" }}>{s.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {([
            { key: "todas", label: "Todas", count: conteos.todas },
            { key: "pendiente", label: "Pendientes", count: conteos.pendiente },
            { key: "en_progreso", label: "En progreso", count: conteos.en_progreso },
            { key: "completada", label: "Completadas", count: conteos.completada },
            { key: "bloqueada", label: "Bloqueadas", count: conteos.bloqueada },
          ] as const).map((s) => {
            const isActive = filtroEstado === s.key;
            return (
              <button key={s.key} onClick={() => setFiltroEstado(s.key as TaskStatus | "todas")}
                className={`px-3 py-1.5 rounded-lg transition-all ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                style={{ fontWeight: isActive ? 600 : 400, fontSize: "0.8125rem" }}>
                {s.label}
                <span className={`ml-1.5 text-xs ${isActive ? "opacity-70" : "opacity-50"}`}>{s.count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {filtradas.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No se encontraron tareas</p>
            </div>
          ) : (
            filtradas.map((task) => {
              const sc = estadoConfig[task.estado];
              const pc = prioridadConfig[task.prioridad as Priority];
              return (
                <div key={task.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => setTareaSeleccionada(task)}>
                  <div className={`h-0.5 w-full ${pc?.bar ?? "bg-slate-400"}`} />
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-foreground" style={{ fontWeight: 500 }}>{task.titulo}</p>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${sc.color}`}>
                          {sc.icon}{sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                          <Calendar className="w-3 h-3" />Vence {formatTaskDate(task.fechaVencimiento)}
                        </span>
                        <span className="flex items-center gap-1.5" style={{ fontSize: "0.75rem" }}>
                          <span className={`w-2 h-2 rounded-full ${pc?.dot}`} />
                          <span className="text-muted-foreground">{pc?.label} prioridad</span>
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{getCategoryLabel(task.categoria)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {tareaSeleccionada && (
        <TaskDetailModal
          task={tareaSeleccionada}
          puedeModificarEstado={true}
          onClose={() => setTareaSeleccionada(null)}
          onUpdateStatus={async (id, estado) => {
            await onUpdateStatus(id, estado);
            setTareaSeleccionada((t) => t ? { ...t, estado } : null);
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
    </div>
  );
}
