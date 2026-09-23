import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { TechnicianDashboard } from "./components/TechnicianDashboard";
import api from "../api/axios";

export type TaskStatus = "pendiente" | "en_progreso" | "completada" | "bloqueada";
export type Priority = "baja" | "media" | "alta" | "critica";
export type UserRole = "superadmin" | "admin" | "tecnico";

export interface AppUser {
  id: string;
  nombre: string;
  apellido?: string;
  dni?: string;
  rol: UserRole;
  email: string;
  password: string;
  avatar: string;
  activo: boolean;
}

export interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  prioridad: Priority;
  estado: TaskStatus;
  asignadoAId: string;
  asignadoANombre: string;
  creadoEn: string;
  fechaVencimiento: string;
  categoria: string;
  comentario?: string;
  notificada?: boolean;
  notificadaPor?: string;
  notificadaEn?: string;
}

interface TaskDTO {
  id?: number | string;
  task_id?: number | string;
  titulo?: string;
  title?: string;
  descripcion?: string;
  description?: string;
  ubicacion?: string;
  location?: string;
  prioridad?: string;
  priority?: string;
  estado?: string;
  status?: string;
  asignadoAId?: number | string;
  assignedToId?: number | string;
  assignedTo?: number | string;
  asignadoANombre?: string;
  assignedToName?: string;
  creadoEn?: string;
  createdAt?: string;
  fechaVencimiento?: string;
  due_date?: string;
  dueDate?: string;
  categoria?: string;
  category?: string;
  comment?: string;
}

interface UserDTO {
  id?: number | string;
  user_id?: number | string;
  name?: string;
  nombre?: string;
  lastname?: string;
  apellido?: string;
  email: string;
  role?: string | { name?: string; authority?: string };
  rol?: string;
  userRole?: string;
  enabled?: boolean;
  activo?: boolean;
}

interface UsersResponse {
  content?: UserDTO[];
  users?: UserDTO[];
  data?: UserDTO[];
  items?: UserDTO[];
}

function mapUser(user: UserDTO): AppUser {
  const name = [user.name ?? user.nombre, user.lastname ?? user.apellido]
    .filter(Boolean)
    .join(" ") || user.email;
  const role = normalizeUserRole(user);
  const appRole = role === "SUPER_ADMIN"
    ? "superadmin"
    : role === "ADMIN"
      ? "admin"
      : "tecnico";

  return {
    id: String(user.id ?? user.user_id),
    nombre: name,
    rol: appRole,
    email: user.email,
    password: "",
    avatar: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    activo: user.enabled ?? user.activo ?? true,
  };
}

function normalizeUserRole(user: UserDTO): string {
  const role = typeof user.role === "object"
    ? user.role.name ?? user.role.authority ?? ""
    : user.role ?? user.rol ?? user.userRole ?? "";

  return role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/^ROLE_/, "");
}

function normalizeTaskValue(value: string | undefined, fallback: string): string {
  return (value ?? fallback).toLowerCase().replace(/\s+/g, "_");
}

export function formatTaskDate(value: string): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getCategoryLabel(value: string): string {
  return {
    gas: "Gas",
    electric: "Eléctrico",
    wireless: "Inalámbrico",
    inverter: "Inversor",
    manual: "Manual",
  }[normalizeTaskValue(value, "manual")] ?? value;
}

function mapTask(task: TaskDTO, assignedUserName?: string): Task {
  const priority = normalizeTaskValue(task.prioridad ?? task.priority, "media");
  const status = normalizeTaskValue(task.estado ?? task.status, "pendiente");
  const priorityMap: Record<string, Priority> = {
    low: "baja",
    medium: "media",
    high: "alta",
    urgent: "critica",
    critical: "critica",
  };
  const statusMap: Record<string, TaskStatus> = {
    pending: "pendiente",
    pendiente: "pendiente",
    in_progress: "en_progreso",
    en_progreso: "en_progreso",
    completed: "completada",
    completada: "completada",
    blocked: "bloqueada",
    cancelled: "bloqueada",
    bloqueada: "bloqueada",
  };

  return {
    id: String(task.id ?? task.task_id),
    titulo: task.titulo ?? task.title ?? "Sin título",
    descripcion: task.descripcion ?? task.description ?? "",
    ubicacion: task.ubicacion ?? task.location ?? "Sin ubicación",
    prioridad: priorityMap[priority] ?? "media",
    estado: statusMap[status] ?? "pendiente",
    asignadoAId: String(task.asignadoAId ?? task.assignedToId ?? task.assignedTo ?? ""),
    asignadoANombre: task.asignadoANombre ?? task.assignedToName ?? assignedUserName ?? "Sin asignar",
    creadoEn: task.creadoEn ?? task.createdAt ?? "",
    fechaVencimiento: task.fechaVencimiento ?? task.due_date ?? task.dueDate ?? "",
    categoria: task.categoria ?? task.category ?? "MANUAL",
    comentario: task.comment ?? "",
  };
}

function toBackendStatus(status: TaskStatus): string {
  return {
    pendiente: "PENDING",
    en_progreso: "IN_PROGRESS",
    completada: "COMPLETED",
    bloqueada: "CANCELLED",
  }[status];
}

function toBackendEnum(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function toBackendPriority(priority: Priority): string {
  return {
    baja: "LOW",
    media: "MEDIUM",
    alta: "HIGH",
    critica: "URGENT",
  }[priority];
}

const INITIAL_USERS: AppUser[] = [
  { id: "superadmin-1", nombre: "Carlos Rivera", rol: "superadmin", email: "superadmin@fieldops.com", password: "super123", avatar: "CR", activo: true },
  { id: "admin-1", nombre: "Laura Gómez", rol: "admin", email: "admin@fieldops.com", password: "admin123", avatar: "LG", activo: true },
  { id: "tech-1", nombre: "James Okafor", rol: "tecnico", email: "james@fieldops.com", password: "tech123", avatar: "JO", activo: true },
  { id: "tech-2", nombre: "Sofía Martínez", rol: "tecnico", email: "sofia@fieldops.com", password: "tech123", avatar: "SM", activo: true },
  { id: "tech-3", nombre: "Wei Zhang", rol: "tecnico", email: "wei@fieldops.com", password: "tech123", avatar: "WZ", activo: true },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "t1", titulo: "Reemplazar filtro HVAC — Unidad B3",
    descripcion: "La unidad HVAC del 3er piso del Edificio B requiere el reemplazo trimestral del filtro. Usar filtros MERV-13 del almacén estante 4. Inspeccionar el motor del ventilador y reportar cualquier ruido inusual.",
    ubicacion: "Edificio B, Piso 3", prioridad: "alta", estado: "pendiente",
    asignadoAId: "tech-1", asignadoANombre: "James Okafor",
    creadoEn: "2026-05-28", fechaVencimiento: "2026-06-10", categoria: "HVAC",
  },
  {
    id: "t2", titulo: "Inspeccionar panel eléctrico — Sala de servidores",
    descripcion: "Inspección anual del panel eléctrico principal en la sala de servidores. Verificar integridad de los disyuntores, conexión a tierra y protectores de sobretensión. Documentar hallazgos en el registro de mantenimiento.",
    ubicacion: "Centro de Datos, Nivel B1", prioridad: "critica", estado: "en_progreso",
    asignadoAId: "tech-1", asignadoANombre: "James Okafor",
    creadoEn: "2026-06-01", fechaVencimiento: "2026-06-08", categoria: "Eléctrico",
  },
  {
    id: "t3", titulo: "Reparar tubería — Baño 2do piso",
    descripcion: "Reporte de goteo bajo el lavabo del baño de mujeres en el 2do piso. Posible falla en el sello del sifón. Reemplazar sello y verificar todas las conexiones de suministro.",
    ubicacion: "Edificio A, Piso 2", prioridad: "media", estado: "completada",
    asignadoAId: "tech-2", asignadoANombre: "Sofía Martínez",
    creadoEn: "2026-05-30", fechaVencimiento: "2026-06-05", categoria: "Plomería",
  },
  {
    id: "t4", titulo: "Cableado de red — Sala de conferencias C",
    descripcion: "Instalar 4 puntos de red en la Sala de Conferencias C para el nuevo sistema AV. Tender cables Cat6a desde el IDF más cercano. Terminar en placas de pared y patch panel. Probar con equipo Fluke.",
    ubicacion: "Edificio C, Planta Baja", prioridad: "media", estado: "en_progreso",
    asignadoAId: "tech-2", asignadoANombre: "Sofía Martínez",
    creadoEn: "2026-06-02", fechaVencimiento: "2026-06-12", categoria: "Redes",
  },
  {
    id: "t5", titulo: "Inspección de seguridad — Equipos en azotea",
    descripcion: "Recorrido trimestral de seguridad en los equipos mecánicos de la azotea. Verificar protecciones, soportes antivibratorios y sellos de impermeabilización en todas las unidades. Actualizar lista de verificación de seguridad.",
    ubicacion: "Azotea, Edificio Principal", prioridad: "alta", estado: "pendiente",
    asignadoAId: "tech-3", asignadoANombre: "Wei Zhang",
    creadoEn: "2026-06-03", fechaVencimiento: "2026-06-15", categoria: "Seguridad",
  },
  {
    id: "t6", titulo: "Prueba de luces de emergencia — Todos los pisos",
    descripcion: "Prueba mensual de todas las luminarias de emergencia en los pisos 1 al 5. Presionar botón de prueba, registrar duración y reportar unidades que no enciendan. Reemplazar baterías en unidades con autonomía menor a 30 minutos.",
    ubicacion: "Todos los edificios", prioridad: "baja", estado: "pendiente",
    asignadoAId: "tech-3", asignadoANombre: "Wei Zhang",
    creadoEn: "2026-06-04", fechaVencimiento: "2026-06-20", categoria: "Seguridad",
  },
  {
    id: "t7", titulo: "Reemplazo de sello — Cámara frigorífica",
    descripcion: "Los sellos de la puerta de la cámara frigorífica muestran desgaste y están causando variaciones de temperatura. Reemplazar el juego completo de empaques en ambas cámaras. Verificar que la puerta cierre correctamente y la temperatura se mantenga estable.",
    ubicacion: "Cocina, Nivel 1", prioridad: "critica", estado: "bloqueada",
    asignadoAId: "tech-1", asignadoANombre: "James Okafor",
    creadoEn: "2026-06-01", fechaVencimiento: "2026-06-07", categoria: "Mantenimiento",
  },
  {
    id: "t8", titulo: "Evaluación de grietas — Deck de estacionamiento",
    descripcion: "Se observaron grietas en la superficie del deck de estacionamiento cerca de la escalera B. Evaluar profundidad y ancho, fotografiar todas las grietas con escala de referencia. Indicar si se requiere consulta con ingeniero estructural.",
    ubicacion: "Estacionamiento, Nivel P2", prioridad: "alta", estado: "pendiente",
    asignadoAId: "tech-2", asignadoANombre: "Sofía Martínez",
    creadoEn: "2026-06-05", fechaVencimiento: "2026-06-18", categoria: "Estructural",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const user = currentUser;

    async function loadTasks() {
      try {
        const endpoint = user.rol === "tecnico"
          ? "/techs/my_tasks"
          : "/tasks";
        const response = await api.get<TaskDTO[]>(endpoint);
        setTasks(response.data.map((task) => {
          const assignedToId = String(task.asignadoAId ?? task.assignedToId ?? task.assignedTo ?? "");
          const assignedUser = users.find((item) => item.id === assignedToId)
            ?? (user.id === assignedToId ? user : undefined);
          return mapTask(task, assignedUser?.nombre);
        }));
      } catch (error) {
        console.error("No se pudieron cargar las tareas", error);
        setTasks([]);
      }
    }

    void loadTasks();
  }, [currentUser, users]);

  useEffect(() => {
    if (!currentUser || currentUser.rol === "tecnico") return;

    async function loadTechnicians() {
      try {
        const response = await api.get<UserDTO[] | UsersResponse>("/admin/users");
        const usersData = Array.isArray(response.data)
          ? response.data
          : response.data.content ?? response.data.users ?? response.data.data ?? response.data.items ?? [];
        const allUsers = usersData
          .filter((user) => user.id !== undefined || user.user_id !== undefined)
          .map(mapUser);
        setUsers(allUsers);
      } catch (error) {
        console.error("No se pudieron cargar los técnicos", error);
        setUsers([]);
      }
    }

    void loadTechnicians();
  }, [currentUser]);

  function handleLogin(user: AppUser) { setCurrentUser(user); }
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setCurrentUser(null);
  }

  async function handleCreateTask(task: Omit<Task, "id" | "creadoEn">) {
    if (!task.asignadoAId) {
      window.alert("Selecciona un técnico antes de crear la tarea.");
      return;
    }

    try {
      const response = await api.post<TaskDTO>(`/tasks/create/${task.asignadoAId}`, {
        title: task.titulo,
        description: task.descripcion,
        status: toBackendStatus(task.estado),
        createdBy: currentUser?.id ?? "",
        priority: toBackendPriority(task.prioridad),
        due_date: `${task.fechaVencimiento}T23:59:59`,
        category: toBackendEnum(task.categoria),
        assignedTo: task.asignadoAId,
        comment: task.comentario ?? "",
      });

      const assignedUser = users.find((user) => user.id === task.asignadoAId);
      setTasks((prev) => [mapTask(response.data, assignedUser?.nombre), ...prev]);
    } catch (error: any) {
      const message = error.response?.data;
      window.alert(typeof message === "string" ? message : "No se pudo crear la tarea.");
    }
  }

  function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  async function handleUpdateStatus(taskId: string, estado: TaskStatus) {
    const numericTaskId = Number(taskId);
    if (!Number.isInteger(numericTaskId) || numericTaskId <= 0) {
      window.alert("La tarea no tiene un ID válido para actualizar su estado.");
      return;
    }

    if (currentUser?.rol !== "tecnico") {
      window.alert("Solo un usuario con rol técnico puede cambiar el estado.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.patch(
        "/techs/change_status",
        { task_id: numericTaskId, status: toBackendStatus(estado) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, estado } : t)));
    } catch (error: any) {
      const responseData = error.response?.data;
      const message = typeof responseData === "string"
        ? responseData
        : responseData?.message ?? responseData?.mensaje ?? responseData?.error;
      const errorMessage = message
        ?? `No se pudo guardar el estado (HTTP ${error.response?.status ?? "sin respuesta"}).`;
      window.alert(errorMessage);
      throw new Error(errorMessage);
    }
  }

  function handleNotificarTarea(taskId: string, adminNombre: string) {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
    const hora = ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, notificada: true, notificadaPor: adminNombre, notificadaEn: `${fecha} ${hora}` }
          : t
      )
    );
  }

  async function handleCreateUser(user: Omit<AppUser, "id" | "activo">) {
    try {
      await api.post("/users/register_user", {
        name: user.nombre,
        lastName: user.apellido ?? "",
        dni: user.dni ?? "",
        email: user.email,
        password: user.password,
        role: user.rol.toUpperCase() === "SUPERADMIN" ? "SUPER_ADMIN" : user.rol.toUpperCase(),
      });

      const response = await api.get<UserDTO[] | UsersResponse>("/admin/users");
      const usersData = Array.isArray(response.data)
        ? response.data
        : response.data.content ?? response.data.users ?? response.data.data ?? response.data.items ?? [];
      setUsers(usersData
        .filter((item) => item.id !== undefined || item.user_id !== undefined)
        .map(mapUser));
    } catch (error: any) {
      const message = error.response?.data;
      window.alert(typeof message === "string" ? message : "No se pudo crear el usuario.");
    }
  }

  function handleDeleteUser(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  const tecnicos = users.filter((u) => u.rol === "tecnico" && u.activo).map((u) => ({
    id: u.id, nombre: u.nombre, avatar: u.avatar,
  }));

  if (!currentUser) {
    return <Login onLogin={handleLogin} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />;
  }

  if (currentUser.rol === "tecnico") {
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

  return (
    <AdminDashboard
      currentUser={currentUser}
      tasks={tasks}
      users={users}
      tecnicos={tecnicos}
      onCreateTask={handleCreateTask}
      onDeleteTask={handleDeleteTask}
      onUpdateStatus={handleUpdateStatus}
      onCreateUser={handleCreateUser}
      onDeleteUser={handleDeleteUser}
      onNotificarTarea={handleNotificarTarea}
      onLogout={handleLogout}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((d) => !d)}
    />
  );
}
