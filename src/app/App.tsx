import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { TechnicianDashboard } from "./components/TechnicianDashboard";

export type TaskStatus = "pendiente" | "en_progreso" | "completada" | "bloqueada";
export type Priority = "baja" | "media" | "alta" | "critica";
export type UserRole = "superadmin" | "admin" | "tecnico";

export interface AppUser {
  id: string;
  nombre: string;
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
  notificada?: boolean;
  notificadaPor?: string;
  notificadaEn?: string;
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
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  function handleLogin(user: AppUser) { setCurrentUser(user); }
  function handleLogout() { setCurrentUser(null); }

  function handleCreateTask(task: Omit<Task, "id" | "creadoEn">) {
    setTasks((prev) => [{
      ...task,
      id: `t-${Date.now()}`,
      creadoEn: new Date().toISOString().split("T")[0],
    }, ...prev]);
  }

  function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  function handleUpdateStatus(taskId: string, estado: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, estado } : t)));
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

  function handleCreateUser(user: Omit<AppUser, "id" | "activo">) {
    setUsers((prev) => [...prev, { ...user, id: `u-${Date.now()}`, activo: true }]);
  }

  function handleDeleteUser(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  const tecnicos = users.filter((u) => u.rol === "tecnico" && u.activo).map((u) => ({
    id: u.id, nombre: u.nombre, avatar: u.avatar,
  }));

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />;
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
