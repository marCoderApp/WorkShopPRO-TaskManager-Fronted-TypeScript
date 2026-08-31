import { X, MapPin, Calendar, Tag, User, Clock, CheckCircle2, Loader2, AlertCircle, ChevronDown, BellRing, Bell } from "lucide-react";
import { useState } from "react";
import type { Task, TaskStatus } from "../App";

interface TaskDetailModalProps {
  task: Task;
  puedeModificarEstado?: boolean;
  puedeNotificar?: boolean;
  onClose: () => void;
  onUpdateStatus?: (taskId: string, estado: TaskStatus) => void;
  onNotificar?: (taskId: string) => void;
}

const estadoConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pendiente: { label: "Pendiente", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: <Clock className="w-3.5 h-3.5" /> },
  en_progreso: { label: "En progreso", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: <Loader2 className="w-3.5 h-3.5" /> },
  completada: { label: "Completada", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  bloqueada: { label: "Bloqueada", color: "text-red-500 bg-red-500/10 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

type Priority = "baja" | "media" | "alta" | "critica";

const prioridadConfig: Record<Priority, { label: string; bar: string }> = {
  baja: { label: "Baja", bar: "bg-slate-400" },
  media: { label: "Media", bar: "bg-amber-400" },
  alta: { label: "Alta", bar: "bg-orange-400" },
  critica: { label: "Crítica", bar: "bg-red-500" },
};

const prioridadOrden: Priority[] = ["baja", "media", "alta", "critica"];

export function TaskDetailModal({ task, puedeModificarEstado = false, puedeNotificar = false, onClose, onUpdateStatus, onNotificar }: TaskDetailModalProps) {
  const [estadoOpen, setEstadoOpen] = useState(false);
  const sc = estadoConfig[task.estado];
  const pc = prioridadConfig[task.prioridad as Priority];
  const nivelPrioridad = prioridadOrden.indexOf(task.prioridad as Priority) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className={`h-1 w-full ${pc?.bar ?? "bg-slate-400"}`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {task.categoria}
              </p>
              <h2 className="text-foreground" style={{ fontWeight: 600, fontSize: "1.125rem", lineHeight: "1.4" }}>{task.titulo}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Estado + Prioridad */}
          <div className="flex items-center gap-3 mb-6">
            {puedeModificarEstado && onUpdateStatus ? (
              <div className="relative">
                <button onClick={() => setEstadoOpen(!estadoOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:opacity-80 ${sc.color}`}>
                  {sc.icon}{sc.label}<ChevronDown className="w-3 h-3" />
                </button>
                {estadoOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setEstadoOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[170px]">
                      {(Object.keys(estadoConfig) as TaskStatus[]).map((s) => {
                        const c = estadoConfig[s];
                        return (
                          <button key={s} onClick={() => { onUpdateStatus(task.id, s); setEstadoOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors ${s === task.estado ? "bg-secondary" : ""}`}>
                            <span className={c.color.split(" ")[0]}>{c.icon}</span>
                            <span className="text-foreground">{c.label}</span>
                            {s === task.estado && <CheckCircle2 className="w-3 h-3 text-primary ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${sc.color}`}>
                {sc.icon}{sc.label}
              </span>
            )}

            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}
                    className={`w-1.5 rounded-sm transition-all ${i <= nivelPrioridad ? pc?.bar : "bg-border"}`}
                    style={{ height: `${8 + i * 3}px` }} />
                ))}
              </div>
              <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{pc?.label} prioridad</span>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <p className="text-muted-foreground mb-2" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Descripción</p>
            <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: "1.7" }}>
              {task.descripcion || "Sin descripción."}
            </p>
          </div>

          {/* Metadatos */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <MapPin className="w-4 h-4" />, label: "Ubicación", value: task.ubicacion },
              { icon: <User className="w-4 h-4" />, label: "Asignado a", value: task.asignadoANombre },
              { icon: <Calendar className="w-4 h-4" />, label: "Fecha límite", value: task.fechaVencimiento },
              { icon: <Clock className="w-4 h-4" />, label: "Creada el", value: task.creadoEn },
              { icon: <Tag className="w-4 h-4" />, label: "Categoría", value: task.categoria },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/50 rounded-lg p-3 flex items-start gap-2.5">
                <span className="text-muted-foreground mt-0.5 flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-muted-foreground" style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                  <p className="text-foreground" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Banner de notificación */}
          {task.notificada && (
            <div className="mt-4 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-4 py-3">
              <BellRing className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-emerald-500" style={{ fontWeight: 600, fontSize: "0.8125rem" }}>Técnico notificado</p>
                <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                  Por <span className="text-foreground" style={{ fontWeight: 500 }}>{task.notificadaPor}</span> el {task.notificadaEn}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          {/* Botón notificar (solo admins, solo si no fue notificada aún) */}
          {puedeNotificar && !task.notificada && onNotificar && (
            <button
              onClick={() => onNotificar(task.id)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
              style={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              <Bell className="w-4 h-4" />
              Marcar como notificada
            </button>
          )}
          {puedeNotificar && task.notificada && (
            <span className="flex items-center gap-1.5 text-emerald-500" style={{ fontSize: "0.8125rem" }}>
              <BellRing className="w-4 h-4" />Ya notificada
            </span>
          )}
          {!puedeNotificar && <span />}
          <button onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
