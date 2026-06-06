import { useState } from "react";
import {
  Wrench, LogOut, Plus, Shield, Users, ClipboardList,
  CheckCircle2, Clock, Loader2, AlertCircle, Trash2,
  Calendar, MapPin, Search, X, Sun, Moon
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

interface Technician {
  id: string;
  name: string;
  avatar: string;
}

interface CurrentUser {
  id: string;
  name: string;
  role: "admin" | "technician";
}

interface AdminDashboardProps {
  currentUser: CurrentUser;
  tasks: Task[];
  technicians: Technician[];
  onCreateTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onDeleteTask: (taskId: string) => void;
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

const categories = ["Electrical", "Plumbing", "HVAC", "Structural", "Network", "Safety", "Maintenance", "Inspection"];

function CreateTaskModal({ technicians, onClose, onSubmit }: {
  technicians: Technician[];
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState({
    title: "", description: "", location: "",
    priority: "medium" as Priority, status: "pending" as TaskStatus,
    assigneeId: technicians[0]?.id ?? "", assigneeName: technicians[0]?.name ?? "",
    dueDate: "", category: "Maintenance",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-foreground" style={{ fontWeight: 600, fontSize: "1.125rem" }}>Create New Task</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Task Title *</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Replace HVAC filter unit B3"
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detailed task instructions..." rows={3}
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Location *</label>
              <input required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Building A, Floor 3"
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Due Date *</label>
              <input required type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                {(Object.keys(priorityConfig) as Priority[]).map((p) => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Assign To *</label>
            <select required value={form.assigneeId}
              onChange={(e) => { const t = technicians.find((x) => x.id === e.target.value); setForm((f) => ({ ...f, assigneeId: e.target.value, assigneeName: t?.name ?? "" })); }}
              className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
              {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminDashboard({ currentUser, tasks, technicians, onCreateTask, onDeleteTask, onUpdateStatus, onLogout, darkMode, onToggleDark }: AdminDashboardProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"tasks" | "overview">("tasks");

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(search.toLowerCase());
    const matchAssignee = filterAssignee === "all" || t.assigneeId === filterAssignee;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchAssignee && matchStatus;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
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
          <span className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleDark} className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{currentUser.name}</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
            <LogOut className="w-4 h-4" />
            <span style={{ fontSize: "0.875rem" }}>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-foreground mb-1" style={{ fontWeight: 600, fontSize: "1.5rem" }}>Task Management</h1>
            <p className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>Create and assign tasks to your technicians</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity" style={{ fontWeight: 600 }}>
            <Plus className="w-4 h-4" />New Task
          </button>
        </div>

        <div className="flex gap-1 mb-8 border-b border-border">
          {[
            { key: "tasks", label: "All Tasks", icon: <ClipboardList className="w-4 h-4" /> },
            { key: "overview", label: "Team Overview", icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all -mb-px ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              style={{ fontSize: "0.875rem", fontWeight: activeTab === tab.key ? 600 : 400 }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "tasks" ? (
          <>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total", value: stats.total, color: "text-foreground" },
                { label: "Pending", value: stats.pending, color: "text-amber-500" },
                { label: "In Progress", value: stats.in_progress, color: "text-blue-500" },
                { label: "Completed", value: stats.completed, color: "text-emerald-500" },
                { label: "Blocked", value: stats.blocked, color: "text-red-500" },
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
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
                  className="w-full bg-input-background border border-border rounded-lg pl-9 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ fontSize: "0.875rem" }} />
              </div>
              <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: "0.875rem" }}>
                <option value="all">All Technicians</option>
                {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
                className="bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: "0.875rem" }}>
                <option value="all">All Statuses</option>
                {(Object.keys(statusConfig) as TaskStatus[]).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="grid gap-0 border-b border-border px-5 py-3" style={{ gridTemplateColumns: "1fr auto auto auto auto auto" }}>
                {["Task", "Location", "Due Date", "Priority", "Assignee", "Status"].map((h) => (
                  <p key={h} className="text-muted-foreground" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</p>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="px-5 py-12 text-center"><p className="text-muted-foreground">No tasks match your filters</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((task) => {
                    const sc = statusConfig[task.status];
                    const pc = priorityConfig[task.priority];
                    return (
                      <div key={task.id}
                        className="grid gap-4 px-5 py-4 items-center hover:bg-secondary/30 transition-colors group cursor-pointer"
                        style={{ gridTemplateColumns: "1fr auto auto auto auto auto" }}
                        onClick={() => setSelectedTask(task)}>
                        <div className="min-w-0">
                          <p className="text-foreground truncate" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{task.title}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{task.category}</p>
                        </div>
                        <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>
                          <MapPin className="w-3 h-3" />{task.location}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>
                          <Calendar className="w-3 h-3" />{task.dueDate}
                        </span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>
                          <span className={`w-2 h-2 rounded-full ${pc.dot}`} />
                          <span className="text-muted-foreground">{pc.label}</span>
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>{task.assigneeName}</span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${sc.color}`}>
                            {sc.icon}{sc.label}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
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
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicians.map((tech) => {
              const techTasks = tasks.filter((t) => t.assigneeId === tech.id);
              const ts = {
                total: techTasks.length,
                pending: techTasks.filter((t) => t.status === "pending").length,
                in_progress: techTasks.filter((t) => t.status === "in_progress").length,
                completed: techTasks.filter((t) => t.status === "completed").length,
                blocked: techTasks.filter((t) => t.status === "blocked").length,
              };
              const completion = ts.total > 0 ? Math.round((ts.completed / ts.total) * 100) : 0;

              return (
                <div key={tech.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-500" style={{ fontWeight: 700, fontSize: "1rem" }}>
                        {tech.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontWeight: 500 }}>{tech.name}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Technician · {ts.total} tasks</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Completion</span>
                      <span className="text-foreground" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{completion}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Pending", value: ts.pending, color: "text-amber-500" },
                      { label: "Active", value: ts.in_progress, color: "text-blue-500" },
                      { label: "Done", value: ts.completed, color: "text-emerald-500" },
                      { label: "Blocked", value: ts.blocked, color: "text-red-500" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className={s.color} style={{ fontWeight: 700 }}>{s.value}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent tasks for this tech */}
                  {techTasks.length > 0 && (
                    <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2">
                      {techTasks.slice(0, 3).map((t) => {
                        const sc = statusConfig[t.status];
                        return (
                          <button key={t.id} onClick={() => setSelectedTask(t)}
                            className="flex items-center justify-between text-left gap-2 hover:bg-secondary/50 rounded-lg px-2 py-1.5 transition-colors w-full">
                            <span className="text-foreground truncate" style={{ fontSize: "0.75rem" }}>{t.title}</span>
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
      </main>

      {showCreate && (
        <CreateTaskModal technicians={technicians} onClose={() => setShowCreate(false)} onSubmit={onCreateTask} />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          canChangeStatus={false}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </div>
  );
}
