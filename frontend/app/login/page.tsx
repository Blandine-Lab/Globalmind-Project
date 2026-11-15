// app/login/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase";

/**
 * Only allow relative paths as post-login redirect targets.
 * Blocks `?next=https://evil.com`, `?next=//evil.com`, and `?next=/\evil.com`.
 */
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null; // must be a relative path
  if (raw.startsWith("//")) return null; // protocol-relative URL
  if (raw.startsWith("/\\")) return null; // backslash escape
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (authError) {
        console.error("Erreur Supabase :", authError.message);

        if (authError.message.toLowerCase().includes("email not confirmed")) {
          throw new Error(
            "Votre email n'est pas encore confirmé. Vérifiez votre boîte de réception (ou demandez à l'admin de valider votre compte)."
          );
        }
        if (
          authError.message.toLowerCase().includes("invalid login credentials")
        ) {
          throw new Error("Email ou mot de passe incorrect.");
        }

        throw new Error(
          authError.message || "Une erreur est survenue lors de la connexion."
        );
      }

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (next) {
          router.push(next);
        } else if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo size={56} href="/" variant="light" />
        <h1 className="mt-6 font-display text-2xl font-bold">Connexion</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accédez à votre espace sécurisé
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <div className="mt-1 flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20">
            <Mail className="w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent text-sm outline-none w-full"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <div className="mt-1 flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20">
            <Lock className="w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent text-sm outline-none w-full"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 leading-relaxed">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-gradient text-white font-medium shadow-glow disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      <div className="mt-6 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="font-medium text-slate-700 mb-1">
          Comptes de test (Supabase)
        </p>
        <p className="text-emerald-600 font-medium">
          Veuillez utiliser les comptes créés dans votre tableau de bord
          Supabase.
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        <a href="/" className="hover:text-brand-blue">
          ← Retour à l'accueil
        </a>
      </p>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-14 w-14 bg-slate-200 rounded-lg mx-auto" />
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
        <div className="h-10 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy bg-brand-halo p-6">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}