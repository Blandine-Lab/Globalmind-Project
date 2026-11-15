export type CameraStatus = "online" | "offline" | "error";
export type EventType = "motion" | "person" | "animal" | "unknown";

export interface Camera {
  id: string;
  gateway_id: string;
  name: string;
  stream_key: string;
  status: CameraStatus;
  is_enabled: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  camera_id: string;
  event_type: EventType;
  detected_at: string;
  confidence?: number | null;
  reviewed: boolean;
}

export interface DashboardStats {
  cameras_total: number;
  cameras_online: number;
  events_today: number;
  events_unreviewed: number;
}

export interface User {
  id: string;
  email: string;
  role: "client" | "operator" | "admin";
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}