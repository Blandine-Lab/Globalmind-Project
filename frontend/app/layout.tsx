import "./globals.css";
import "leaflet/dist/leaflet.css";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://globalmind-smartwatch.com"),

  title: {
    default: "Globalmind SmartWatch — Surveillance connectée",
    template: "%s · Globalmind SmartWatch",
  },
  description:
    "Plateforme de vidéosurveillance à distance par Globalmind.MK.INNOTECH. Visualisez vos caméras, recevez les alertes, gardez le contrôle.",
  applicationName: "Globalmind SmartWatch",
  icons: { icon: "/logo.png", apple: "/logo.png" },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Globalmind SmartWatch",
    title: "Globalmind SmartWatch — Surveillance connectée",
    description:
      "Live en moins d'une seconde, alertes IA, historique cloud chiffré. Conforme RGPD, sans engagement.",
    images: [
      {
        url: "/media/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Dashboard Globalmind SmartWatch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Globalmind SmartWatch",
    description: "Vos caméras dans un dashboard sécurisé.",
    images: ["/media/og-cover.jpg"],
  },

  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}