export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
    token: string;
    role: string;
}

export interface OwnProfileDTO {
  id: number | string;
  nombre?: string;
  name?: string;
  email: string;
  rol?: string;
  role?: string;
  activo?: boolean;
  active?: boolean;
}

export interface ErrorResponse {
    status: number;
    mensaje: string;
    timestamp: string;
}

export type Role = "TECNICO" | "ADMIN" | "SUPER_ADMIN";