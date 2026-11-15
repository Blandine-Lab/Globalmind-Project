// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // On accepte les deux noms (nouvelle clé publishable + ancienne anon)
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase URL ou clé manquante. Vérifie tes variables d'environnement sur Render."
    );
  }

  return createBrowserClient(url, key);
}