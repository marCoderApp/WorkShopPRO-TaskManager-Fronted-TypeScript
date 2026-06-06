import { useState } from "react";
import {
  Wrench, LogOut, Clock, CheckCircle2, AlertCircle, Loader2,
  Calendar, MapPin, User, Filter, Sun, Moon
} from "lucide-react";
import { TaskDetailModal } from "./TaskDetailModal";

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

interface CurrentUser {
  id: string;
  name: string;
  role: "admin" | "technician";
  avatar: string;
}

interface TechnicianDashboardProps {
  currentUser: CurrentUser;
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: <Loader2 className="w-3.5 h-3.5" /> },
  completed: { label: "Completed", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  blocked: { label: "Blocked", color: "text-red-500 bg-red-500/10 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const priorityConfig: Record<Priority, { label: string; dot: string }> = {
  low: { label: "Low", dot: "bg-slate-400" },
  medium: { label: "Medium", dot: "bg-amber-400" },
  high: { label: "High", dot: "bg-orange-400" },
  critical: { label: "Critical", dot: "bg-red-500" },
};

export function TechnicianDashboard({ currentUser, tasks, onUpdateStatus, onLogout, darkMode, onToggleDark }: TechnicianDashboardProps) {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const filtered = filterStatus === "all" ? myTasks : myTasks.filter((t) => t.status === filterStatus);

  const counts = {
    all: myTasks.length,
    pending: myTasks.filter((t) => t.status === "pending").length,
    in_progress: myTasks.filter((t) => t.status === "in_progress").length,
    completed: myTasks.filter((t) => t.status === "completed").length,
    blocked: myTasks.filter((t) => t.status === "blocked").length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Wrench className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-foreground" style={{ fontWeight: 700 }}>FieldOps</span>
          <span className="text-border mx-1">·</span>
          <span className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>Technician</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleDark} className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-foreground" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{currentUser.name}</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <LogOut className="w-4 h-4" />
            <span style={{ fontSize: "0.875rem" }}>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-1" style={{ fontWeight: 600, fontSize: "1.5rem" }}>My Tasks</h1>
          <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>
            {counts.in_progress} in progress · {counts.pending} pending · {counts.completed} completed
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: counts.all, color: "text-foreground" },
            { label: "Pending", value: counts.pending, color: "text-amber-500" },
            { label: "In Progress", value: counts.in_progress, color: "text-blue-500" },
            { label: "Completed", value: counts.completed, color: "text-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className={s.color} style={{ fontWeight: 700, fontSize: "1.75rem" }}>{s.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["all", "pending", "in_progress", "completed", "blocked"] as const).map((s) => {
            const isActive = filterStatus === s;
            const label = s === "all" ? "All" : statusConfig[s].label;
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg transition-all ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                style={{ fontWeight: isActive ? 600 : 400, fontSize: "0.8125rem" }}>
                {label}
                <span className={`ml-1.5 text-xs ${isActive ? "opacity-70" : "opacity-50"}`}>
                  {s === "all" ? counts.all : counts[s as TaskStatus]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            filtered.map((task) => {
              const sc = statusConfig[task.status];
              const pc = priorityConfig[task.priority];
              return (
                <div
                  key={task.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  {/* Priority accent line */}
                  <div className={`h-0.5 w-full ${
                    task.priority === "critical" ? "bg-red-500" :
                    task.priority === "high" ? "bg-orange-400" :
                    task.priority === "medium" ? "bg-amber-400" : "bg-slate-400"
                  }`} />
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-foreground" style={{ fontWeight: 500 }}>{task.title}</p>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${sc.color}`}>
                          {sc.icon}{sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                          <MapPin className="w-3 h-3" />{task.location}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                          <Calendar className="w-3 h-3" />Due {task.dueDate}
                        </span>
                        <span className="flex items-center gap-1.5" style={{ fontSize: "0.75rem" }}>
                          <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
                          <span className="text-muted-foreground">{pc.label} priority</span>
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{task.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          canChangeStatus={true}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={(id, status) => {
            onUpdateStatus(id, status);
            setSelectedTask((t) => t ? { ...t, status } : null);
          }}
        />
      )}
    </div>
  );
}
