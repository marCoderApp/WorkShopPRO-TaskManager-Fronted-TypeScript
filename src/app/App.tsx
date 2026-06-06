import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { TechnicianDashboard } from "./components/TechnicianDashboard";

type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
type Priority = "low" | "medium" | "high" | "critical";

interface User {
  id: string;
  name: string;
  role: "admin" | "technician";
  email: string;
  password: string;
  avatar: string;
}

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

const USERS: User[] = [
  { id: "admin-1", name: "Carlos Rivera", role: "admin", email: "admin@fieldops.com", password: "admin123", avatar: "CR" },
  { id: "tech-1", name: "James Okafor", role: "technician", email: "james@fieldops.com", password: "tech123", avatar: "JO" },
  { id: "tech-2", name: "Sofia Martínez", role: "technician", email: "sofia@fieldops.com", password: "tech123", avatar: "SM" },
  { id: "tech-3", name: "Wei Zhang", role: "technician", email: "wei@fieldops.com", password: "tech123", avatar: "WZ" },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "t1", title: "Replace HVAC filter — Unit B3",
    description: "The HVAC unit on the 3rd floor of Building B requires a quarterly filter replacement. Use MERV-13 filters from stockroom shelf 4. Inspect blower motor and report any unusual noise.",
    location: "Building B, Floor 3", priority: "high", status: "pending",
    assigneeId: "tech-1", assigneeName: "James Okafor",
    createdAt: "2026-05-28", dueDate: "2026-06-10", category: "HVAC",
  },
  {
    id: "t2", title: "Inspect electrical panel — Server Room",
    description: "Annual inspection of the main electrical panel in the server room. Check breaker integrity, verify grounding, and test surge protection units. Document findings in the maintenance log.",
    location: "Data Center, Level B1", priority: "critical", status: "in_progress",
    assigneeId: "tech-1", assigneeName: "James Okafor",
    createdAt: "2026-06-01", dueDate: "2026-06-08", category: "Electrical",
  },
  {
    id: "t3", title: "Fix leaking pipe — Restroom 2F",
    description: "Report of water dripping under the sink in the women's restroom on the 2nd floor. Likely P-trap seal failure. Replace seal and check all supply line connections.",
    location: "Building A, Floor 2", priority: "medium", status: "completed",
    assigneeId: "tech-2", assigneeName: "Sofia Martínez",
    createdAt: "2026-05-30", dueDate: "2026-06-05", category: "Plumbing",
  },
  {
    id: "t4", title: "Network cable routing — Conference Room C",
    description: "Install 4 ethernet drops in Conference Room C for the new AV setup. Run Cat6a cables from the nearest IDF. Terminate at wall plates and patch panel. Test with Fluke tester.",
    location: "Building C, Ground Floor", priority: "medium", status: "in_progress",
    assigneeId: "tech-2", assigneeName: "Sofia Martínez",
    createdAt: "2026-06-02", dueDate: "2026-06-12", category: "Network",
  },
  {
    id: "t5", title: "Safety inspection — Rooftop equipment",
    description: "Quarterly safety walkthrough of rooftop mechanical equipment. Check all guards, anti-vibration mounts, and weatherproofing seals on all units. Update safety checklist form.",
    location: "Rooftop, Main Building", priority: "high", status: "pending",
    assigneeId: "tech-3", assigneeName: "Wei Zhang",
    createdAt: "2026-06-03", dueDate: "2026-06-15", category: "Safety",
  },
  {
    id: "t6", title: "Emergency light testing — All floors",
    description: "Monthly test of all emergency lighting units across floors 1-5. Press test button, record duration, note any units failing to illuminate. Replace batteries in units under 30 min runtime.",
    location: "All Buildings", priority: "low", status: "pending",
    assigneeId: "tech-3", assigneeName: "Wei Zhang",
    createdAt: "2026-06-04", dueDate: "2026-06-20", category: "Safety",
  },
  {
    id: "t7", title: "Door seal replacement — Cold storage",
    description: "Cold storage door seals showing wear and causing temperature variance. Replace full door gasket set on both cold storage units. Verify door closes to spec and temperature holds.",
    location: "Kitchen, Level 1", priority: "critical", status: "blocked",
    assigneeId: "tech-1", assigneeName: "James Okafor",
    createdAt: "2026-06-01", dueDate: "2026-06-07", category: "Maintenance",
  },
  {
    id: "t8", title: "Structural crack assessment — Parking deck",
    description: "Small cracks observed in the parking deck surface near stairwell B. Assess depth and width, photograph all cracks with reference scale. Flag if structural engineer consultation is needed.",
    location: "Parking Deck, Level P2", priority: "high", status: "pending",
    assigneeId: "tech-2", assigneeName: "Sofia Martínez",
    createdAt: "2026-06-05", dueDate: "2026-06-18", category: "Structural",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // initialize class on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  function handleLogin(user: User) { setCurrentUser(user); }
  function handleLogout() { setCurrentUser(null); }

  function handleCreateTask(task: Omit<Task, "id" | "createdAt">) {
    setTasks((prev) => [{
      ...task,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }, ...prev]);
  }

  function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  function handleUpdateStatus(taskId: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }

  const technicians = USERS.filter((u) => u.role === "technician").map((u) => ({
    id: u.id, name: u.name, avatar: u.avatar,
  }));

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={USERS} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />;
  }

  if (currentUser.role === "admin") {
    return (
      <AdminDashboard
        currentUser={currentUser}
        tasks={tasks}
        technicians={technicians}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
        onUpdateStatus={handleUpdateStatus}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
    );
  }

  return (
    <TechnicianDashboard
      currentUser={currentUser}
      tasks={tasks}
      onUpdateStatus={handleUpdateStatus}
      onLogout={handleLogout}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((d) => !d)}
    />
  );
}
