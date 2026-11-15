import type { Camera, DashboardStats, Event } from "./types";

export const mockStats: DashboardStats = {
  cameras_total: 3,
  cameras_online: 2,
  events_today: 7,
  events_unreviewed: 3,
};

export const mockCameras: Camera[] = [
  { id: "c1", gateway_id: "g1", name: "Entrée principale", stream_key: "cam-entree", status: "online", is_enabled: true, created_at: "2024-01-10T10:00:00Z" },
  { id: "c2", gateway_id: "g1", name: "Salon", stream_key: "cam-salon", status: "online", is_enabled: true, created_at: "2024-01-10T10:05:00Z" },
  { id: "c3", gateway_id: "g1", name: "Jardin", stream_key: "cam-jardin", status: "offline", is_enabled: true, created_at: "2024-01-10T10:10:00Z" },
];

export const mockEvents: Event[] = [
  { id: "e1", camera_id: "c1", event_type: "person", detected_at: "2024-06-20T14:32:00Z", confidence: 0.92, reviewed: false },
  { id: "e2", camera_id: "c2", event_type: "motion", detected_at: "2024-06-20T13:10:00Z", confidence: 0.61, reviewed: false },
  { id: "e3", camera_id: "c1", event_type: "animal", detected_at: "2024-06-20T09:45:00Z", confidence: 0.78, reviewed: true },
];