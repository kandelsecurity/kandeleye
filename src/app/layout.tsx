import type { Metadata, Viewport } from "next";
import ErrorBoundary from '@/components/ErrorBoundary';
import "./globals.css";

const SITE_URL = "https://osirisai.live";
const SITE_NAME = "KANDELeye";
const SITE_TITLE = "KANDELeye — Plataforma Unificada de Inteligencia y Auditoría | OSINT en Vivo";
const SITE_DESCRIPTION = "La alternativa open source a Palantir. Monitorea más de 10,000 aeronaves, 2,000 satélites y 17,000 cámaras CCTV en tiempo real en un globo 3D. Escaneos Nmap, búsquedas DNS, consultas WHOIS, análisis de certificados SSL e inteligencia de amenazas — todo desde tu navegador. Más de 20 fuentes de datos en vivo incluyendo terremotos, incendios, ciberamenazas y conflictos globales. Gratis y de código abierto.";

export const viewport: Viewport = {
  themeColor: "#0F0A15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | KANDELeye Inteligencia",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "herramientas OSINT", "inteligencia de fuentes abiertas", "plataforma de inteligencia",
    "escaneo de vulnerabilidades", "auditoría de seguridad", "ciberseguridad",
    "OSINT tools", "free OSINT tools", "online OSINT toolkit", "OSINT framework",
    "nmap online", "nmap scanner online", "free nmap scan", "port scanner online",
    "DNS lookup tool", "WHOIS lookup", "reverse DNS", "DNS records",
    "SSL certificate checker", "certificate transparency", "cert lookup",
    "BGP routing lookup", "ASN lookup", "IP geolocation",
    "threat intelligence", "threat intel lookup", "IP reputation check",
    "network reconnaissance", "recon tools", "penetration testing tools",
    "cybersecurity tools", "infosec tools", "security scanner",
    "linux OSINT tools", "kali linux tools online", "OSINT browser tools",
    "OSINT", "open source intelligence", "intelligence platform", "global intelligence",
    "geospatial intelligence", "GEOINT", "SIGINT", "real-time tracking",
    "palantir alternative", "open source palantir", "intelligence dashboard",
    "flight tracker", "aircraft tracking", "ADS-B tracker", "live flight radar",
    "satellite tracking", "ISS tracker", "space station tracker",
    "CCTV cameras live", "security cameras worldwide", "live cameras",
    "earthquake monitor", "seismic activity", "USGS earthquake",
    "wildfire tracker", "NASA FIRMS", "active fires",
    "nuclear facilities map", "nuclear power plants",
    "severe weather alerts", "weather radar",
    "cyber threats dashboard", "CVE tracker",
    "space weather", "solar storm", "GPS jamming",
    "defense stocks", "commodities tracker",
    "kandeleye", "kandelsecurity", "kandeleye.live",
  ],
  authors: [{ name: "KANDEL Security", url: SITE_URL }],
  creator: "KANDEL Security",
  publisher: "KANDEL Security",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "KANDELeye — La Alternativa Open Source a Palantir | Vuelos, CCTV, Satélites y OSINT",
    description: "Monitorea más de 10,000 aeronaves, 2,000 satélites y CCTV mundial en un globo 3D. Escaneos Nmap, DNS, WHOIS e inteligencia de amenazas desde tu navegador. Más de 20 fuentes de datos en vivo. Gratis. Código abierto.",
    type: "website",
    siteName: SITE_NAME,
    locale: "es_ES",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "KANDELeye — Plataforma de Inteligencia con Seguimiento en Vivo y Herramientas OSINT",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🛡️ KANDELeye — Alternativa Open Source a Palantir | Seguimiento en Vivo + OSINT",
    description: "Monitorea más de 10K aeronaves, satélites y CCTV mundial. Escaneos Nmap, DNS, WHOIS desde tu navegador. Más de 20 fuentes de datos en vivo. Gratis y código abierto.",
    creator: "@kandelsecurity",
    site: "@kandelsecurity",
    images: [`${SITE_URL}/og-image.png`],
  },
  category: "technology",
  classification: "Intelligence & Security",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "KANDELeye",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0F0A15",
    "msapplication-config": "none",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "KANDELeye — Plataforma Unificada de Inteligencia y Auditoría",
  alternateName: ["KANDELeye", "KANDEL Intelligence", "KANDEL OSINT"],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires a modern web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Escaneo de puertos Nmap desde el navegador — sin instalación requerida",
    "Búsqueda de registros DNS (A, AAAA, MX, NS, TXT, CNAME)",
    "Consulta de registro de dominio WHOIS",
    "Búsqueda de transparencia de certificados SSL/TLS",
    "Búsqueda de rutas BGP y ASN",
    "Geolocalización IP e inteligencia de amenazas",
    "Seguimiento de vuelos en tiempo real (10,000+ aeronaves via ADS-B)",
    "Seguimiento de satélites (2,000+ objetos incluyendo ISS)",
    "Monitoreo de cámaras CCTV mundiales (17,000+ feeds)",
    "Monitoreo de terremotos (USGS en vivo)",
    "Detección de incendios (datos satelitales NASA FIRMS)",
    "Mapeo de instalaciones nucleares (mundial)",
    "Alertas de clima severo y seguimiento",
    "Inteligencia de ciberamenazas y CVE",
    "Clima espacial y monitoreo de tormentas solares",
    "Detección de jamming GPS",
    "Seguimiento de mercado de defensa y materias primas",
    "Aggregación de noticias SIGINT",
    "Globo 3D interactivo con ciclo día/noche",
    "Informes de inteligencia regional",
  ],
  screenshot: `${SITE_URL}/og-image.png`,
  author: {
    "@type": "Organization",
    name: "KANDEL Security",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href={SITE_URL} />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

      </head>
      <body className="antialiased">
        <ErrorBoundary name="KANDELeye Core">
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
