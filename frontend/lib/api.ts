// lib/api.ts
import { mockCameras, mockEvents, mockStats } from "./mock-data";
import type { Camera, DashboardStats, Event } from "./types";
import { createClient } from "@/lib/supabase";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function get<T>(path: string): Promise<T> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 60));
    if (path === "/api/stats") return mockStats as T;
    if (path === "/api/cameras") return mockCameras as T;
    if (path === "/api/events") return mockEvents as T;
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { cache: "no-store", headers });

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  getStats: () => get<DashboardStats>("/api/stats"),
  getCameras: () => get<Camera[]>("/api/cameras"),
  getEvents: () => get<Event[]>("/api/events"),
};