// components/secret-logo.tsx
"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export function SecretLogo() {
  const router = useRouter();
  const clickCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêche la navigation par défaut si le logo est dans un lien

    clickCount.current += 1;

    // Réinitialiser le compteur si l'utilisateur arrête de cliquer pendant 2 secondes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      clickCount.current = 0;
    }, 2000);

    // Si on atteint 5 clics, on redirige vers l'admin
    if (clickCount.current >= 5) {
      clickCount.current = 0; // Reset
      router.push("/admin"); // Redirection secrète
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer select-none" title="Globalmind">
      <Logo size={36} variant="light" />
    </div>
  );
}