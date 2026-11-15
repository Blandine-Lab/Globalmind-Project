import Link from "next/link";
import { Bell, Camera, Check, Cloud, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-6">
          <Logo size={40} variant="light" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-ink">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-ink">Tarifs</a>
            <a href="#security" className="hover:text-ink">Sécurité</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100">
              Se connecter
            </Link>
            <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-gradient text-white shadow-glow">
              Demander une démo
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-brand-halo">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
              Sécurité intelligente
            </span>
            <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Gardez un œil sur ce qui compte,{" "}
              <span className="text-brand-gradient">où que vous soyez.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Globalmind SmartWatch connecte vos caméras à un tableau de bord
              sécurisé. Détection intelligente, alertes en temps réel et
              historique cloud — pensé pour les particuliers et les entreprises.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-brand-gradient text-white font-medium shadow-glow text-center">
                Voir le dashboard
              </Link>
              <Link href="#pricing" className="px-6 py-3 rounded-xl border border-slate-300 text-center hover:bg-slate-50 font-medium">
                Voir les tarifs
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">Déploiement en 24h · Conforme RGPD · Sans engagement</p>
          </div>

          <div className="bg-navy rounded-2xl p-3 shadow-2xl">
            <div className="bg-navy-light rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Caméra · Entrée principale</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">● En ligne</span>
              </div>
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center relative">
                <Camera className="w-10 h-10 text-slate-600" />
                <div className="absolute bottom-2 left-2 text-[10px] text-slate-500">LIVE · 1080p</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[["Caméras", "3"], ["En ligne", "2"], ["Alertes", "7"]].map(([k, v]) => (
                  <div key={k} className="bg-navy border border-navy-border rounded-md p-2">
                    <div className="text-[10px] text-slate-500">{k}</div>
                    <div className="text-white font-semibold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-center">Une plateforme simple, puissante, sécurisée</h2>
          <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
            Conçue par Globalmind.MK.INNOTECH pour les foyers, commerces et entreprises qui veulent surveiller sans complexité.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: Camera, title: "Caméras connectées", desc: "Compatible RTSP/ONVIF, Wi-Fi ou Ethernet. Branchez, c'est prêt." },
              { icon: Bell, title: "Alertes intelligentes", desc: "Détection de mouvement filtrée : personne, animal, changement de lumière." },
              { icon: ShieldCheck, title: "Accès contrôlé", desc: "Chaque client voit uniquement ses caméras. Journalisation complète." },
              { icon: Cloud, title: "Historique cloud", desc: "Clips chiffrés, conservation configurable, suppression automatique." },
              { icon: Zap, title: "Faible latence", desc: "Streaming WebRTC pour une vision en direct instantanée." },
              { icon: Check, title: "Conforme RGPD", desc: "Caméras visibles, consentement, droits des personnes filmées." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 border border-slate-200 rounded-xl hover:border-brand-blue/50 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-cloud">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-center">Des offres claires</h2>
          <p className="mt-3 text-center text-slate-600">Tous les tarifs sont mensuels, sans engagement.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { name: "Basic", price: "9,99", features: ["1 caméra", "Alertes email", "Historique 7 jours"], highlight: false },
              { name: "Standard", price: "19,99", features: ["Jusqu'à 3 caméras", "Notifications mobile", "Historique 30 jours"], highlight: true },
              { name: "Premium", price: "29,99", features: ["Caméras illimitées", "Historique 90 jours", "Support prioritaire"], highlight: false },
            ].map((p) => (
              <div key={p.name} className={`p-6 rounded-2xl border ${p.highlight ? "border-transparent bg-navy text-white shadow-glow" : "border-slate-200 bg-white"}`}>
                {p.highlight && <span className="text-[10px] font-semibold bg-brand-gradient px-2 py-1 rounded text-white">RECOMMANDÉ</span>}
                <h3 className={`mt-2 text-lg font-semibold ${p.highlight ? "text-white" : ""}`}>{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{p.price} €</span>
                  <span className={p.highlight ? "text-slate-400" : "text-slate-500"}>/mois</span>
                </div>
                <ul className={`mt-4 space-y-2 text-sm ${p.highlight ? "text-slate-300" : "text-slate-600"}`}>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${p.highlight ? "text-brand-cyan" : "text-brand-blue"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className={`mt-6 block text-center py-2.5 rounded-lg font-medium text-sm ${p.highlight ? "bg-brand-gradient text-white" : "border border-slate-300 hover:bg-slate-50"}`}>
                  Choisir {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-20 bg-navy text-white bg-brand-halo">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold">Sécurité et confidentialité par défaut</h2>
            <ul className="mt-6 space-y-3 text-slate-300">
              {[
                "Caméras visibles et signalées — aucun enregistrement caché.",
                "Communications chiffrées (TLS, WebRTC DTLS).",
                "Isolation stricte des données de chaque client.",
                "Journalisation de tous les accès aux images.",
                "Suppression automatique des vidéos à expiration.",
                "Conformité RGPD, information des occupants.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-navy-light border border-navy-border rounded-2xl p-6">
            <p className="text-sm text-slate-400">Engagement Globalmind.MK.INNOTECH</p>
            <p className="mt-3 text-lg text-white leading-relaxed">
              « Nous ne surveillons pas les gens. Nous aidons les gens à protéger ce qui compte, avec leur consentement et en toute transparence. »
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-navy text-slate-400 py-10 border-t border-navy-border">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <Logo size={40} variant="dark" href="/" />
            <p className="mt-3 text-xs max-w-sm">
              Plateforme de vidéosurveillance connectée. Un produit{" "}
              <span className="text-slate-300">Globalmind.MK.INNOTECH</span>.
            </p>
          </div>
          <div className="text-xs space-y-1">
            <p className="text-slate-300 font-medium">Contact</p>
            <p>contact@globalmind-smartwatch.com</p>
            <p>Lyon, France</p>
          </div>
          <div className="text-xs space-y-1">
            <p className="text-slate-300 font-medium">Légal</p>
            <a href="#" className="block hover:text-white">Mentions légales</a>
            <a href="#" className="block hover:text-white">Confidentialité (RGPD)</a>
            <a href="#" className="block hover:text-white">CGV</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-navy-border text-[11px] text-slate-500 flex justify-between">
          <span>© {new Date().getFullYear()} Globalmind.MK.INNOTECH</span>
          <span>Globalmind SmartWatch™</span>
        </div>
      </footer>
    </div>
  );
}