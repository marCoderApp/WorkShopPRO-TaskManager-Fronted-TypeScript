import { X, MapPin, Calendar, Tag, User, Clock, CheckCircle2, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
type Priority = "low" | "medium" | "high" | "critical";

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
  createdAt: string;
  dueDate: string;
  category: string;
}

interface TaskDetailModalProps {
  task: Task;
  canChangeStatus?: boolean;
  onClose: () => void;
  onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: <Loader2 className="w-3.5 h-3.5" /> },
  completed: { label: "Completed", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  blocked: { label: "Blocked", color: "text-red-500 bg-red-500/10 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const priorityConfig: Record<Priority, { label: string; dot: string; bar: string }> = {
  low: { label: "Low", dot: "bg-slate-400", bar: "bg-slate-400" },
  medium: { label: "Medium", dot: "bg-amber-400", bar: "bg-amber-400" },
  high: { label: "High", dot: "bg-orange-400", bar: "bg-orange-400" },
  critical: { label: "Critical", dot: "bg-red-500", bar: "bg-red-500" },
};

const priorityOrder: Priority[] = ["low", "medium", "high", "critical"];

export function TaskDetailModal({ task, canChangeStatus = false, onClose, onUpdateStatus }: TaskDetailModalProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const sc = statusConfig[task.status];
  const pc = priorityConfig[task.priority];
  const priorityLevel = priorityOrder.indexOf(task.priority) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar — priority color accent */}
        <div className={`h-1 w-full ${pc.bar}`} />

        <div className="p-6">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {task.category}
              </p>
              <h2 className="text-foreground" style={{ fontWeight: 600, fontSize: "1.125rem", lineHeight: "1.4" }}>{task.title}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status + Priority row */}
          <div className="flex items-center gap-3 mb-6">
            {canChangeStatus && onUpdateStatus ? (
              <div className="relative">
                <button
                  onClick={() => setStatusOpen(!statusOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:opacity-80 ${sc.color}`}
                >
                  {sc.icon}
                  {sc.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {statusOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                      {(Object.keys(statusConfig) as TaskStatus[]).map((s) => {
                        const c = statusConfig[s];
                        return (
                          <button
                            key={s}
                            onClick={() => { onUpdateStatus(task.id, s); setStatusOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors ${s === task.status ? "bg-secondary" : ""}`}
                          >
                            <span className={c.color.split(" ")[0]}>{c.icon}</span>
                            <span className="text-foreground">{c.label}</span>
                            {s === task.status && <CheckCircle2 className="w-3 h-3 text-primary ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${sc.color}`}>
                {sc.icon}
                {sc.label}
              </span>
            )}

            {/* Priority indicator */}
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-sm transition-all ${i <= priorityLevel ? pc.bar : "bg-border"}`}
                    style={{ height: `${8 + i * 3}px` }}
                  />
                ))}
              </div>
              <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{pc.label} priority</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-muted-foreground mb-2" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</p>
            <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: "1.7" }}>
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <MapPin className="w-4 h-4" />, label: "Location", value: task.location },
              { icon: <User className="w-4 h-4" />, label: "Assigned to", value: task.assigneeName },
              { icon: <Calendar className="w-4 h-4" />, label: "Due date", value: task.dueDate },
              { icon: <Clock className="w-4 h-4" />, label: "Created", value: task.createdAt },
              { icon: <Tag className="w-4 h-4" />, label: "Category", value: task.category },
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
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent transition-colors"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
