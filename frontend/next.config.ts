import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  
  // ✅ AJOUT ICI : Autorise les requêtes cross-origin depuis votre réseau local
  allowedDevOrigins: ['192.168.160.197', 'localhost:3000'],

  turbopack: {
    root: __dirname,
  },

  images: {
    // Autorise la qualité 100 utilisée dans le Hero, en plus de la 75 par défaut
    qualities: [75, 100],

    // Formats modernes servis en priorité par next/image
    formats: ["image/avif", "image/webp"],

    // Tailles utilisées par la landing (mobile → desktop 2x)
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [40, 64, 96, 128, 256, 384],

    // Autorise les images distantes pendant la phase de test.
    // À SUPPRIMER en prod si tout est dans /public/media.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],

    // Cache long côté navigateur — les fichiers médias ne changent pas
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
  },

  // Les vidéos du dossier /public/media sont déjà servies par Next.
  experimental: {
    // optionnel : active le streaming des gros <video> si tu passes un jour
    // par une route /api au lieu de /public
  },

  // Bonus : headers de cache pour /media (vidéos, posters)
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;