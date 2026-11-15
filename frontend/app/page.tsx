// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  Bell, Camera, Check, Cloud, ShieldCheck, Zap, ArrowRight, Play,
  Eye, Lock, Wifi, Smartphone, HeartPulse, Activity, Fingerprint,
  Sparkles, Mail, MapPin, ArrowUpRight, Home, Store, Building, School,
  Briefcase, Factory, DoorOpen, Star, ShoppingCart, Box,
  Map, Navigation, Car, Siren, Battery, ShieldAlert,
  Wind, Brain, FileText, Pill, Calendar, Stethoscope
} from "lucide-react";
import { Logo } from "@/components/logo";
import { SecretLogo } from "@/components/secret-logo";
import { MobileNav } from "@/components/landing/mobile-nav";

/* ------------------------------------------------------------------ */
/*  ASSETS                                                             */
/* ------------------------------------------------------------------ */
const A = {
  heroVideo:  "/media/hero-live.mp4",
  heroPoster: "/media/hero-live.png",
  howVideo:   "/media/how-it-works.mp4",
  howPoster:  "/media/how-it-works.jpg",
  camera:     "/media/camera-install.jpg",
  security:   "/media/security-team.jpg",
  av1: "/media/avatar-1.jpg",
  av2: "/media/avatar-2.jpg",
  av3: "/media/avatar-3.jpg",
  av4: "/media/avatar-4.jpg",
  teamGroup: "/media/5.jpg",
  sensor:     "/images/capteur-porte-wifi.jpg",
  bgVideo1:   "/video1.mp4",
  bgVideo2:   "/video2.mp4",
  bgVideo3:   "/video3.mp4",
  bgVideo4:   "/video4.mp4",
};

const FEATURES = [
  { icon: Camera,     title: "Caméras connectées", desc: "RTSP / ONVIF, Wi-Fi ou Ethernet. Branchée = en ligne en 5 min.", badge: "Plug & Play" },
  { icon: Navigation, title: "Suivi GPS & Alarme", desc: "Localisez vos véhicules et coupez le moteur à distance.", badge: "Smart Track" },
  { icon: Bell,       title: "Alertes intelligentes", desc: "Filtrage IA : personne, animal, lumière. Zéro fausse alerte.", badge: "IA Cloud" },
  { icon: ShieldCheck,title: "Accès contrôlé", desc: "Chaque client ne voit que SES caméras. Accès opérateur tracé.", badge: "RGPD" },
  { icon: Cloud,      title: "Historique cloud", desc: "Clips chiffrés, conservation 7 à 90 jours, purge automatique.", badge: "Chiffré" },
  { icon: Zap,        title: "Live ultra-rapide", desc: "Streaming WebRTC, moins d'1 s de latence. Comme sur place.", badge: "WebRTC" },
  { icon: Lock,       title: "Confidentialité totale", desc: "Caméras visibles, consentement, journal d'accès complet.", badge: "Audit" },
];

const HEALTH_EXAMS = [
  { 
    icon: HeartPulse, 
    title: "BPM & Tension", 
    desc: "Analyse PPG par caméra",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    btn: "bg-rose-500 hover:bg-rose-400 text-white",
    href: "/ai-tension",
  },
  { 
    icon: Activity,   
    title: "Stress (VFC)", 
    desc: "Variabilité cardiaque",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white",
    href: "/stress",
  },
  { 
    icon: Wind,       
    title: "Respiration", 
    desc: "Fréquence respiratoire",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    btn: "bg-cyan-500 hover:bg-cyan-400 text-white",
    href: "/respiration",
  },
  { 
    icon: Brain,      
    title: "Triage IA", 
    desc: "Vérificateur de symptômes",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    btn: "bg-blue-500 hover:bg-blue-400 text-white",
    href: "/triage",
  },
];

// ── FIX : href ajoute pour rendre les boutons cliquables ──
// href = null  -> grise "Bientot disponible"
// href = "...": -> cliquable
const SECONDARY_HEALTH: { icon: typeof FileText; title: string; href: string | null }[] = [
  { icon: FileText,    title: "Bilan PDF",        href: "/ai-tension" },
  { icon: Pill,        title: "Pilulier",         href: "/pilulier" },
  { icon: Calendar,    title: "Téléconsultation", href: null },
  { icon: Stethoscope, title: "Portail Médecin",  href: null },
];

const STEPS = [
  { n: "01", icon: Wifi,       title: "Branchez", desc: "Votre caméra se connecte au réseau. Aucun réglage technique." },
  { n: "02", icon: Smartphone, title: "Scannez", desc: "Un QR code, votre compte créé, la caméra apparaît dans le dashboard." },
  { n: "03", icon: Eye,        title: "Regardez", desc: "Live en moins d'une seconde, alertes intelligentes, historique chiffré." },
];

const PRICING = [
  { name: "Basic",    price: "9,99",  desc: "Pour un appartement ou un petit local", features: ["1 caméra", "Alertes email", "Historique 7 jours", "App mobile"], highlight: false, cta: "Commencer Basic" },
  { name: "Standard", price: "19,99", desc: "Le choix de 80% de nos clients", features: ["Jusqu'à 3 caméras", "Notifications mobile instantanées", "Historique 30 jours", "Détection personne / animal", "Support 7j/7"], highlight: true, cta: "Choisir Standard" },
  { name: "Premium",  price: "29,99", desc: "Pour maisons et commerces", features: ["Caméras illimitées", "Historique 90 jours", "Support prioritaire", "Installation incluse"], highlight: false, cta: "Choisir Premium" },
];

const TESTIMONIALS = [
  { name: "Marie B.",  role: "Particulier · Lyon",           img: A.av1, text: "Installée en 10 minutes. Le soir même je recevais une alerte quand le chat est passé — et seulement le chat.", stars: 5 },
  { name: "Samir K.",  role: "Gérant · Épicerie de quartier", img: A.av2, text: "Trois caméras, un seul écran. Je vérifie la boutique depuis chez moi sans appeler personne.", stars: 5 },
  { name: "Gaëlle M.", role: "Bureau · 12 collaborateurs",    img: A.av3, text: "Ce qui a fait la différence : la transparence. Les équipes ont été informées, tout est tracé.", stars: 5 },
  { name: "Thomas R.", role: "Maison secondaire",             img: A.av4, text: "Je regarde la maison depuis l'étranger. Zéro coupure en six mois.", stars: 5 },
];

const TEAM = [
  { name: "Mathurin",    role: "DG · Directeur Général",           title: "Docteur ingénieur en Tech & Innovation", img: "/media/1.jpg" },
  { name: "Dorcas Lama", role: "Directrice RH & Projets",          title: "Experte en ressources humaines et communication", img: "/media/2.jpg" },
  { name: "Nathan",      role: "Directeur National & International", title: "Expert en suivi et exécution de projets", img: "/media/3.jpg" },
  { name: "Guerchom",    role: "Directeur Exécutif International",  title: "Relations projets & partenariats locaux et internationaux", img: "/media/44.jpg" },
];

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                     */
/* ------------------------------------------------------------------ */
function Eyebrow({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "emerald" | "cyan" }) {
  const tones = {
    blue:    "text-blue-700 bg-blue-50 border-blue-100",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cyan:    "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  };
  return (
    <div className={`inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full border ${tones[tone]}`}>
      {children}
    </div>
  );
}

function SectionHeader({
  eyebrow, title, subtitle, align = "left", dark = false,
}: {
  eyebrow?: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode;
  align?: "left" | "center"; dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow}
      <h2 className={`mt-5 font-display text-[34px] sm:text-[42px] lg:text-[48px] font-extrabold tracking-[-0.03em] leading-[1.05] ${dark ? "text-white" : "text-slate-950"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-[16px] leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden selection:bg-blue-600 selection:text-white">

      {/* ================= HEADER ================= */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto h-[68px] flex items-center justify-between px-5 lg:px-8">

          <SecretLogo />

          <nav className="hidden lg:flex items-center gap-1 text-[13.5px] font-medium text-slate-600">
            {[
              { label: "Sécurité", href: "#watch" },
              { label: "Smart GPS", href: "#gps" },
              { label: "Santé IA", href: "#health", special: true },
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "Équipe", href: "#team" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-3.5 py-2 rounded-full transition-colors ${
                  l.special
                    ? "text-emerald-600 font-semibold hover:bg-emerald-50 flex items-center gap-1.5"
                    : "hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                {l.special && <HeartPulse className="w-3.5 h-3.5" />}
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex text-[13.5px] font-semibold px-4 py-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition">
              Se connecter
            </Link>
            <Link href="/login" className="group hidden sm:inline-flex items-center gap-1.5 text-[13.5px] font-semibold px-5 py-2.5 rounded-full bg-slate-950 text-white hover:bg-black shadow-lg shadow-slate-950/20 transition">
              Demander une démo
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ================= HERO SPLIT-SCREEN ================= */}
      <section className="relative flex flex-col md:flex-row w-full mt-[68px] min-h-[600px] lg:min-h-[75vh] p-0 m-0 overflow-hidden bg-[#0A1628]">
        <div className="relative w-full md:w-[55%] h-[50vh] md:h-auto overflow-hidden">
          <Image
            src="/Image.png"
            alt="GlobalMind Smart City"
            fill
            className="object-cover object-center"
            quality={100}
            sizes="(max-width: 768px) 100vw, 55vw"
            priority
          />
        </div>
        <div className="w-full md:w-[45%] flex flex-col justify-center px-6 md:px-12 py-12 md:py-16 bg-[#0A1628] text-white">
          <div className="flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-3 py-1.5 w-fit">
            <span className="bg-[#E60023] text-white text-xs font-bold px-2 py-1 rounded-md">GM</span>
            <span className="text-[11px] leading-tight text-gray-300">GLOBALMIND<br /><span className="text-white font-semibold">Smart Care & Watch</span></span>
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.1] tracking-tight">
            Votre sécurité.<br />
            <span className="text-gray-400">Votre santé.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Un seul écosystème.</span>
          </h1>
          <p className="mt-5 text-gray-400 text-sm md:text-[15.5px] leading-relaxed max-w-lg">
            <span className="text-white font-semibold">Globalmind Smart Care & Watch</span> repousse les limites de la technologie. Surveillez vos espaces avec une IA de pointe, suivez vos véhicules en temps réel et prenez soin de votre corps.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/login" className="group bg-[#E60023] hover:bg-[#C2001D] transition-colors px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-xl shadow-red-900/20">
              <Eye className="w-4 h-4" /> <span>Voir la démo</span>
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
            <Link href="/ai-tension" className="group border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> <span>Tester l'IA Santé</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[12px] text-gray-400 border-t border-white/5 pt-6">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Conforme RGPD</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Live &lt; 1 s</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-blue-400" /> Chiffré bout-en-bout</span>
          </div>
        </div>
      </section>

      {/* ================= BREADCRUMB ================= */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex items-center justify-between text-[13px] text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition">Accueil</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Écosystème Globalmind</span>
          </div>
          <Link href="#features" className="hidden sm:inline-flex items-center gap-1 hover:text-slate-900 transition">
            En savoir plus <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ================= TRUST SECTION ================= */}
      <section className="relative py-24 border-b border-slate-200 overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" autoPlay muted loop playsInline>
          <source src={A.bgVideo1} type="video/mp4" />
        </video>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-slate-900/50 ring-4 ring-white/10 aspect-[4/3] lg:aspect-square group">
              <Image
                src={A.camera}
                alt="Sécurité et surveillance"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-bold text-[22px] leading-tight mb-2">Une technologie adaptée à chaque environnement.</p>
                <p className="text-slate-300 text-[14px]">Du simple appartement au plus grand complexe industriel.</p>
              </div>
            </div>

            <div className="bg-[#0A1628] p-8 lg:p-12 rounded-[32px] shadow-2xl border border-white/10 text-white">
              <div className="mb-10">
                <Eyebrow>Ils nous font confiance</Eyebrow>
                <h2 className="mt-5 font-display text-[34px] sm:text-[42px] font-extrabold tracking-[-0.03em] leading-[1.05] text-white">
                  Une solution pour <br />
                  <span className="text-slate-400">chaque besoin.</span>
                </h2>
                <p className="mt-4 text-[16px] text-slate-300 leading-relaxed max-w-md">
                  Que vous soyez un particulier ou une grande entreprise, notre écosystème s'adapte à votre échelle pour vous apporter sécurité et sérénité.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Home, label: "Particuliers" },
                  { icon: Store, label: "Commerces" },
                  { icon: Building, label: "Bureaux" },
                  { icon: School, label: "Écoles" },
                  { icon: HeartPulse, label: "Cliniques" },
                  { icon: Briefcase, label: "Entreprises" },
                  { icon: Factory, label: "Usines" },
                  { icon: ShieldCheck, label: "Sites sensibles" }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                      <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700 group-hover:text-blue-900 transition-colors text-center">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= WATCH SECTION ================= */}
      <section id="watch" className="relative py-24 lg:py-32 overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" autoPlay muted loop playsInline>
          <source src={A.bgVideo2} type="video/mp4" />
        </video>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-16 items-center">
          <div className="bg-[#0A1628] p-8 lg:p-12 rounded-[32px] shadow-2xl border border-white/10">
            <Eyebrow>
              <ShieldCheck className="w-3.5 h-3.5" /> Globalmind Smart Watch
            </Eyebrow>
            <h2 className="mt-6 font-display text-[36px] lg:text-[54px] font-extrabold tracking-[-0.03em] leading-[1.02] text-white">
              Votre maison, surveillée.
              <br />
              <span className="text-slate-400">Vous, rassuré.</span>
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-slate-300 max-w-[520px]">
              Connectez vos caméras à un dashboard sécurisé. Live en moins d'une seconde, alertes intelligentes, historique cloud — sans complexité.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-950 text-[14px] font-semibold shadow-xl hover:bg-slate-100 hover:-translate-y-0.5 transition">
                <Eye className="w-4 h-4" /> Voir le live démo
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white text-[14px] font-semibold hover:bg-white/10 transition">
                En savoir plus <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-slate-400">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Déploiement 24h</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Conforme RGPD</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Support 7j/7</span>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden className="absolute -inset-8 bg-gradient-to-tr from-blue-500/15 via-indigo-400/10 to-cyan-300/15 blur-3xl rounded-[48px]" />
            <div className="relative rounded-[28px] p-2.5 bg-gradient-to-b from-[#111B2E] to-[#0B1220] shadow-2xl shadow-slate-900/40 ring-1 ring-slate-900/10">
              <div className="rounded-[20px] overflow-hidden bg-[#0F172A]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="p-4">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 ring-1 ring-white/5">
                    <video className="absolute inset-0 w-full h-full object-cover" poster={A.heroPoster} autoPlay muted loop playsInline>
                      <source src={A.heroVideo} type="video/mp4" />
                    </video>
                    <div className="absolute left-[38%] top-[34%] w-[26%] h-[42%] border-2 border-emerald-400/90 rounded-md">
                      <span className="absolute -top-5 left-0 text-[9px] font-semibold text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded">person 0.98</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[{ label: "Caméras", value: "3" }, { label: "Alertes", value: "7" }, { label: "Stockage", value: "30j" }].map((s) => (
                      <div key={s.label} className="bg-white/[0.04] border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">{s.label}</p>
                        <p className="text-white font-bold text-[17px] mt-0.5 tabular-nums">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SMART GPS & ALARM SECTION ================= */}
      <section id="gps" className="relative py-24 lg:py-32 overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" autoPlay muted loop playsInline>
          <source src={A.bgVideo3} type="video/mp4" />
        </video>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-16 items-center">
          <div className="bg-[#0A1628] p-8 lg:p-12 rounded-[32px] shadow-2xl border border-white/10">
            <Eyebrow tone="blue">
              <Navigation className="w-3.5 h-3.5" /> Globalmind Smart Track
            </Eyebrow>
            <h2 className="mt-6 font-display text-[36px] lg:text-[54px] font-extrabold tracking-[-0.03em] leading-[1.02] text-white">
              Suivez vos véhicules.
              <br />
              <span className="text-slate-400">Pilotez à distance.</span>
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-slate-300 max-w-[520px]">
              Localisez vos voitures, motos ou flottes en temps réel. Grâce à notre traceur GPS intelligent couplé à une alarme, coupez le moteur à distance en cas de vol et recevez des alertes de mouvement instantanées.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login?next=/tracking" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-950 text-[14px] font-semibold shadow-xl hover:bg-slate-100 hover:-translate-y-0.5 transition">
                <Map className="w-4 h-4" /> Voir le suivi live
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white text-[14px] font-semibold hover:bg-white/10 transition">
                Découvrir l'alarme <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5 text-[13px] text-slate-300 font-medium">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Car className="w-3.5 h-3.5 text-white" />
                </div>
                Voitures & Motos
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-slate-300 font-medium">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-white" />
                </div>
                Anti-démarrage
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-slate-300 font-medium">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Battery className="w-3.5 h-3.5 text-white" />
                </div>
                Batterie de secours
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-slate-300 font-medium">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Siren className="w-3.5 h-3.5 text-white" />
                </div>
                Alerte vibration
              </div>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden className="absolute -inset-8 bg-gradient-to-tr from-amber-500/15 via-orange-400/10 to-transparent blur-3xl rounded-[48px]" />
            <div className="relative rounded-[32px] p-2.5 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl shadow-slate-900/40 ring-1 ring-slate-900/10">
              <div className="rounded-[24px] overflow-hidden bg-[#0F172A]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span className="text-[13px] font-bold text-white">Ma Voiture</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En ligne
                  </span>
                </div>
                <div className="relative aspect-[4/3] bg-slate-800 overflow-hidden">
                  <div aria-hidden className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=48.8566,2.3522&zoom=13&size=600x400&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:geometry|color:0x1e293b')] bg-cover bg-center" />
                  <div className="absolute inset-0 bg-[#0F172A]/60" />

                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300">
                    <path d="M0,150 Q100,100 200,150 T400,100" stroke="#94a3b8" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    <path d="M100,0 Q150,100 100,300" stroke="#475569" strokeWidth="4" fill="none" />
                  </svg>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20 w-16 h-16 -m-4" />
                      <div className="w-10 h-10 bg-amber-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg relative z-10">
                        <Navigation className="w-5 h-5 text-slate-900 fill-slate-900" />
                      </div>
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl border border-white/10">
                      Vitesse: 45 km/h
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Battery className="w-3 h-3" /> Batterie Traceur
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[85%]" />
                      </div>
                      <span className="text-[11px] font-bold text-white">85%</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Siren className="w-3 h-3" /> Alarme
                    </p>
                    <p className="text-[12px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> Désactivée
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 text-[12px] font-bold border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Couper le moteur à distance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CAPTEUR PORTE / FENÊTRE ================= */}
      <section className="relative py-24 overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" autoPlay muted loop playsInline>
          <source src={A.bgVideo4} type="video/mp4" />
        </video>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-square rounded-[32px] overflow-hidden shadow-2xl shadow-slate-900/50 ring-4 ring-white/10 group">
                <Image
                  src={A.sensor}
                  alt="Capteur Porte / Fenêtre WiFi Smart"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-emerald-500" /> En stock
                  </span>
                  <span className="bg-[#E60023] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Nouveau
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 bg-[#0A1628] p-8 lg:p-12 rounded-[32px] shadow-2xl border border-white/10 text-white">
              <Eyebrow>
                <DoorOpen className="w-3.5 h-3.5" /> Sécurité & Surveillance
              </Eyebrow>

              <h2 className="mt-5 font-display text-[34px] sm:text-[42px] font-extrabold tracking-[-0.03em] leading-[1.05] text-white">
                Capteur Porte / Fenêtre <br />
                <span className="text-slate-400">WiFi Smart.</span>
              </h2>

              <div className="flex items-center gap-2 mt-4">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-[13px] font-medium text-slate-400">3.8/5 (12 avis)</span>
              </div>

              <p className="mt-6 text-[16px] leading-relaxed text-slate-300 max-w-[520px]">
                Soyez alerté en temps réel dès qu'une porte ou une fenêtre s'ouvre. Compatible <strong>Tuya Smart / Smart Life</strong>, Alexa & Google Home. Détecte instantanément toute ouverture même à distance.
              </p>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-[36px] font-extrabold text-white tracking-tight leading-none">44 AED</span>
                <span className="text-[16px] font-medium text-slate-400 mb-1">≈ 11 €</span>
              </div>

              <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                {[
                  "Alerte instantanée < 1s",
                  "WiFi direct, sans Hub",
                  "App Smart Life (iOS/Android)",
                  "Compatible Alexa & Google Home",
                  "Installation en 2 min (adhésif)",
                  "Historique d'ouverture / fermeture"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[14px] text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Box className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[13px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Inclus dans la boîte :</strong> 1x Capteur principal + 1x Aimant, adhésifs double-face, pile longue durée, guide de démarrage.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:contact@globalmind-smartwatch.com?subject=Commande%20Capteur%20Porte%2FFen%C3%AAtre%20WiFi%20Smart&body=Bonjour%2C%0A%0AJe%20souhaite%20commander%20le%20Capteur%20Porte%2FFen%C3%AAtre%20WiFi%20Smart%20(44%20AED)%2E%0A%0AMerci."
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-950 text-[14px] font-semibold shadow-xl hover:bg-slate-100 hover:-translate-y-0.5 transition"
                >
                  <ShoppingCart className="w-4 h-4" /> Acheter maintenant
                </a>
                <Link
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white text-[14px] font-semibold hover:bg-white/10 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Inclus dans le Pack Sécurité
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HEALTH SECTION (LES 4 SMARTPHONES INDÉPENDANTS) ================= */}
      <section id="health" className="relative py-24 lg:py-32 bg-[#0A1628] text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(900px_600px_at_15%_10%,rgba(16,185,129,0.16),transparent_60%),radial-gradient(700px_500px_at_85%_90%,rgba(59,130,246,0.14),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          
          {/* HEADER DE LA SECTION */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Eyebrow tone="emerald"><Sparkles className="w-3.5 h-3.5" /> Globalmind Smart Care</Eyebrow>
            <h2 className="mt-6 font-display text-[36px] lg:text-[48px] font-extrabold tracking-[-0.03em] leading-[1.04] text-white">
              Votre santé, mesurée par la <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">lumière.</span>
            </h2>
            <p className="mt-6 text-slate-300 text-[16px] leading-relaxed">
              Utilisez la caméra et la torche de votre téléphone. Choisissez un examen ci-dessous pour lancer l'analyse IA de votre choix.
            </p>
          </div>

          {/* LA GRILLE DES 4 SMARTPHONES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
            {HEALTH_EXAMS.map((exam) => (
              <div key={exam.title} className="relative flex flex-col items-center">
                {/* LE SMARTPHONE */}
                <div className="w-full bg-[#0F172A] rounded-[36px] border-[6px] border-slate-800 shadow-2xl ring-1 ring-white/10 p-5 pb-8 flex flex-col items-center text-center min-h-[380px]">
                  
                  {/* Encoche du téléphone */}
                  <div className="w-16 h-5 bg-slate-800 rounded-b-xl absolute top-0" />

                  <div className={`w-16 h-16 rounded-2xl ${exam.bg} flex items-center justify-center mt-6 mb-5`}>
                    <exam.icon className={`w-8 h-8 ${exam.color}`} />
                  </div>
                  
                  <h3 className="text-white font-bold text-lg leading-tight mb-2">{exam.title}</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed flex-1">{exam.desc}</p>
                  
                  {/* Bouton d'action à l'intérieur du smartphone */}
                  <Link 
                    href={exam.href} 
                    className={`mt-6 w-full py-3 rounded-xl font-bold text-[13px] shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 ${exam.btn}`}
                  >
                    Lancer l'examen
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* 4 BOUTONS SECONDAIRES EN DESSOUS — FIX : Pilulier + Bilan PDF cliquables */}
          <div className="mt-16 pt-10 border-t border-white/10 w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SECONDARY_HEALTH.map((s) => {
              const isAvailable = s.href !== null;
              if (isAvailable) {
                return (
                  <Link
                    key={s.title}
                    href={s.href!}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/40 transition-all group"
                  >
                    <s.icon className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 mb-2 transition-colors" />
                    <span className="text-[12px] font-semibold text-slate-300 text-center leading-tight">{s.title}</span>
                  </Link>
                );
              }
              return (
                <div
                  key={s.title}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
                  title="Bientôt disponible"
                >
                  <s.icon className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-[12px] font-semibold text-slate-300 text-center leading-tight">{s.title}</span>
                  <span className="text-[9px] text-slate-500 mt-1">Bientôt</span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5 aspect-[4/3] bg-slate-900">
              <video className="w-full h-full object-cover" poster={A.howPoster} controls muted loop playsInline preload="none">
                <source src={A.howVideo} type="video/mp4" />
              </video>
            </div>
            <div className="absolute -bottom-5 left-6 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-blue-600 fill-current" />
              </div>
              <span className="text-[13px] font-semibold text-slate-800">Installation en 60 s</span>
            </div>
          </div>
          <div>
            <Eyebrow>Comment ça marche</Eyebrow>
            <h2 className="mt-5 font-display text-[34px] lg:text-[44px] font-extrabold tracking-[-0.03em] leading-[1.05] text-slate-950">
              Trois étapes.
              <br />
              Pas une de plus.
            </h2>
            <div className="mt-10 space-y-8">
              {STEPS.map(({ n, icon: Icon, title, desc }) => (
                <div key={n} className="flex gap-5">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] text-slate-400">{n}</p>
                    <h3 className="font-bold text-[17px] mt-1 text-slate-950">{title}</h3>
                    <p className="text-[14px] text-slate-600 mt-1.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeader
            eyebrow={<Eyebrow>Fonctionnalités</Eyebrow>}
            title={<>Tout pour protéger,<br />rien de compliqué.</>}
            subtitle="Conçue par Globalmind.MK.INNOTECH pour les foyers, commerces et entreprises qui veulent surveiller — sans devenir techniciens."
          />

          <div className="mt-14 grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 relative rounded-[28px] overflow-hidden group min-h-[340px]">
              <Image src={A.camera} alt="Caméra connectée" fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-8 text-white">
                <span className="self-start text-[10px] font-bold tracking-wider bg-white/15 backdrop-blur border border-white/20 px-2.5 py-1 rounded-full">PLUG &amp; PLAY</span>
                <h3 className="mt-3 text-[26px] font-extrabold tracking-tight">Branchez. C'est en ligne.</h3>
                <p className="mt-2 text-[14px] text-slate-200 max-w-md leading-relaxed">Compatible RTSP / ONVIF, Wi-Fi ou Ethernet. Aucun boîtier, aucun abonnement caché.</p>
              </div>
            </div>

            <div className="grid gap-5">
              {FEATURES.slice(1, 3).map(({ icon: Icon, title, desc, badge }) => (
                <div key={title} className="p-6 rounded-[24px] border border-slate-200 bg-white hover:border-slate-900 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-600">{badge}</span>
                  </div>
                  <h3 className="mt-4 font-bold text-[15px] text-slate-950">{title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{desc}</p>
                </div>
              ))}
            </div>

            {FEATURES.slice(3).map(({ icon: Icon, title, desc, badge }) => (
              <div key={title} className="p-6 rounded-[24px] border border-slate-200 bg-white hover:border-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-600">{badge}</span>
                </div>
                <h3 className="mt-4 font-bold text-[15px] text-slate-950">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeader
            align="center"
            eyebrow={<Eyebrow>Témoignages</Eyebrow>}
            title={<>Ils nous font confiance.</>}
            subtitle="Des particuliers, des commerçants, des équipes — qui protègent ce qui compte."
          />
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-[24px] border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex text-amber-400 text-[13px] mb-3">{"★".repeat(t.stars)}</div>
                <p className="text-[14px] text-slate-700 leading-relaxed">« {t.text} »</p>
                <div className="mt-5 flex items-center gap-3 pt-5 border-t border-slate-100">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100">
                    <Image src={t.img} alt={t.name} fill sizes="36px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-950">{t.name}</p>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeader
            align="center"
            eyebrow={<Eyebrow>Tarifs</Eyebrow>}
            title={<>Des offres claires, sans surprise.</>}
            subtitle="Mensuel, sans engagement. Installation à partir de 49 € une fois."
          />
          <div className="mt-14 grid lg:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
            {PRICING.map((p) => (
              <div key={p.name} className={`p-8 rounded-[28px] flex flex-col ${p.highlight ? "bg-slate-950 text-white shadow-2xl shadow-slate-950/30 lg:scale-[1.04] ring-1 ring-slate-900 relative overflow-hidden" : "bg-white border border-slate-200"}`}>
                {p.highlight && (
                  <>
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(400px_200px_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]" />
                    <span className="relative self-start text-[10.5px] font-bold tracking-wider bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1.5 rounded-full text-white">⭐ RECOMMANDÉ</span>
                  </>
                )}
                <h3 className={`relative mt-4 text-[18px] font-bold ${p.highlight ? "text-white" : "text-slate-950"}`}>{p.name}</h3>
                <p className={`relative mt-1 text-[13px] ${p.highlight ? "text-slate-400" : "text-slate-500"}`}>{p.desc}</p>
                <div className="relative mt-6 flex items-baseline gap-1">
                  <span className="text-[44px] font-extrabold tracking-tight leading-none tabular-nums">{p.price} €</span>
                  <span className={p.highlight ? "text-slate-400" : "text-slate-500"}>/mois</span>
                </div>
                <ul className={`relative mt-7 space-y-3 text-[13.5px] flex-1 ${p.highlight ? "text-slate-200" : "text-slate-600"}`}>
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.highlight ? "bg-cyan-500/20 text-cyan-300" : "bg-emerald-50 text-emerald-600"}`}>
                        <Check className="w-3 h-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`relative mt-8 block text-center py-3.5 rounded-full font-semibold text-[14px] transition ${p.highlight ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-black"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEAM ================= */}
      <section id="team" className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeader
            align="center"
            eyebrow={<Eyebrow>L'équipe</Eyebrow>}
            title={<>Derrière chaque caméra,<br />des visages.</>}
            subtitle="Une équipe internationale — tech, humain, exécution, partenariats — qui construit Globalmind Smart Care & Watch au quotidien."
          />

          <div className="mt-14 relative rounded-[32px] overflow-hidden ring-1 ring-slate-900/10 shadow-2xl shadow-slate-900/15">
            <div className="relative aspect-[16/9] sm:aspect-[21/9]">
              <Image src={A.teamGroup} alt="L'équipe Globalmind" fill sizes="100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/10" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14 text-white">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Globalmind.MK.INNOTECH
              </span>
              <div className="mt-5 max-w-3xl">
                <p className="text-[18px] sm:text-[22px] lg:text-[26px] font-bold leading-snug text-white">
                  Contrôler son avoir et prendre soin de soi, c'est une quiétude qu'on s'impose — où que nous soyons.
                </p>
                <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-white/80">
                  Alors la plateforme <span className="font-semibold text-white">Globalmind Smart Care & Watch</span> devient une solution dans la poche, dans votre téléphone.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((m, i) => (
              <article key={m.name} className="group rounded-[24px] overflow-hidden bg-white border border-slate-200 hover:border-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <Image src={m.img} alt={`Portrait de ${m.name}`} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold tabular-nums bg-white/90 backdrop-blur px-2 py-1 rounded-full text-slate-900">0{i + 1}</span>
                </div>
                <div className="p-5">
                  <p className="text-[10.5px] font-bold tracking-[0.14em] text-blue-600 uppercase">{m.role}</p>
                  <h3 className="mt-1.5 font-bold text-[17px] text-slate-950">{m.name}</h3>
                  <p className="mt-1 text-[12.5px] text-slate-600 leading-relaxed">{m.title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section id="security" className="relative py-24 lg:py-32 bg-[#0A1628] text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(800px_500px_at_88%_-5%,rgba(59,130,246,0.24),transparent_62%)]" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Eyebrow tone="cyan">Sécurité &amp; confidentialité</Eyebrow>
            <h2 className="mt-6 font-display text-[34px] lg:text-[42px] font-extrabold tracking-[-0.03em] leading-[1.05] text-white">
              Sécurité par défaut.<br />
              <span className="text-slate-500">Pas en option.</span>
            </h2>
            <ul className="mt-9 space-y-4">
              {[
                "Caméras visibles et signalées — aucun enregistrement caché.",
                "Communications chiffrées TLS + WebRTC DTLS.",
                "Isolation stricte : chaque client = ses données uniquement.",
                "Journalisation de TOUS les accès aux images.",
                "Suppression automatique à expiration.",
                "Conformité RGPD, information des occupants.",
              ].map((line) => (
                <li key={line} className="flex gap-3 text-[14.5px] text-slate-300">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /> {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-[28px] overflow-hidden ring-1 ring-white/10">
            <div className="relative aspect-[4/3]">
              <Image src={A.security} alt="Équipe Globalmind" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/55 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-7">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold text-[13px]">GM</div>
                <div>
                  <p className="font-bold text-[14px]">Globalmind.MK.INNOTECH</p>
                  <p className="text-[11px] text-slate-400">Fondateur &amp; CEO</p>
                </div>
                <span className="ml-auto text-amber-400 text-[13px]">★★★★★</span>
              </div>
              <p className="mt-4 text-[16px] leading-relaxed text-slate-100 font-medium">
                « Nous ne surveillons pas les gens. Nous aidons les gens à protéger ce qui compte, avec leur consentement et en toute transparence. »
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0A1628] text-slate-400 pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-[1.2fr_0.6fr_0.6fr] gap-12">
          <div>
            <Logo size={36} variant="dark" href="/" />
            <p className="mt-5 text-[13px] leading-relaxed max-w-sm">
              Plateforme de vidéosurveillance connectée, de suivi GPS et de santé numérique. Un produit <span className="text-white font-medium">Globalmind.MK.INNOTECH</span>. Caméras visibles, consentement, RGPD.
            </p>
          </div>
          <div className="text-[13px] space-y-3">
            <p className="text-white font-bold mb-3">Contact</p>
            <p className="flex gap-2 items-start"><Mail className="w-4 h-4 shrink-0 mt-0.5" /> contact@globalmind-smartwatch.com</p>
            <p className="flex gap-2 items-start"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> Lyon, France</p>
          </div>
          <div className="text-[13px] space-y-2.5">
            <p className="text-white font-bold mb-3">Légal</p>
            <a href="#" className="block hover:text-white transition">Mentions légales</a>
            <a href="#" className="block hover:text-white transition">Confidentialité (RGPD)</a>
            <a href="#" className="block hover:text-white transition">CGV</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-12 pt-6 border-t border-white/5 text-[12px] flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 Globalmind.MK.INNOTECH — Tous droits réservés</span>
          <span className="font-semibold text-slate-300">Globalmind Smart Care & Watch™</span>
        </div>
      </footer>
    </div>
  );
}