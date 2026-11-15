// frontend/lib/subscriptions.ts
"use client";

import { useEffect, useState } from "react";
import { get } from "./api";

export type Subscription = {
  id: string;
  service_id: "surveillance" | "tracking" | "health" | string;
  service_name: string;
  service_description: string;
  service_icon: "camera" | "navigation" | "heart" | string;
  service_route: string;
  status: "active" | "trial" | "expired" | "cancelled" | string;
  started_at: string | null;
  expires_at: string | null;
};

export function useSubscriptions(): {
  subs: Subscription[] | null;
  error: string | null;
} {
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    get("/api/me/subscriptions")
      .then((data: unknown) => {
        if (!cancelled) setSubs(data as Subscription[]);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "unknown error");
          setSubs([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { subs, error };
}