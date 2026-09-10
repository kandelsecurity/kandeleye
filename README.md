# ⬡ KANDELeye

### Plataforma Unificada de Inteligencia y Auditoría — KANDEL Security

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?logo=typescript)](https://www.typescriptlang.org)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-WebGL-2E8E5C?logo=maplibre)](https://maplibre.org)

**Dashboard de inteligencia OSINT y auditoría de seguridad. El ojo que ve lo que otros no ven.**

[Live Demo](https://osirisai.live) · [Documentación](DOCKER.md) · [Issue Tracker](https://github.com/kandelsecurity/kandeleye/issues)

---

## 🇪🇸 Descripción

KANDELeye es una plataforma de inteligencia open source que agrega datos en tiempo real sobre vuelos, CCTV, terremotos, conflictos, vulnerabilidades, criptomonedas, noticias y más en un mapa interactivo GPU-acelerado. Diseñado específicamente para equipos de seguridad y auditoría.

### Características principales

- **16 capas de inteligencia** con datos en tiempo real
- **Renderizado WebGL** — 60fps con miles de entidades simultáneas
- **RECON Toolkit** — Port Scan, DNS, WHOIS, SSL/TLS, IP Intel, CVE Scanner
- **OSINT de Telegram** — Posts geoparseados de canales públicos
- **Trazabilidad Crypto** — BTC/ETH con detección de wallets sancionados (OFAC)
- **Zonas de conflicto** — 13 zonas activas monitoreadas
- **25+ streams de noticias** en vivo

### Integraciones KANDEL

| Módulo | Descripción |
|--------|-------------|
| **KANDELscan** | Escaneo de vulnerabilidades Nuclei → capa en mapa |
| **KANDELcrack** | Auditoría Wi-Fi → redes detectadas en mapa |
| **KANDELlimiter** | Dispositivos de red controlados → capa visual |
| **KANDELker** | GPS de activos → puntos rastreables |
| **Flujo de auditoría** | Orquestación: scan → auditoría → PDF → alerta |

---

## 🇪🇸 Instalación rápida

```bash
git clone https://github.com/kandelsecurity/kandeleye.git
cd kandeleye
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Docker

```bash
docker compose up -d
```

Imagen preconstruida: `ghcr.io/kandelsecurity/kandeleye:latest`

---

## 🇪🇸 Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Lenguaje | TypeScript 5 |
| Mapa | MapLibre GL JS (WebGL) |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Despliegue | Docker multi-stage / Vercel |

---

## 🇪🇸 Licencia

MIT License — ver [LICENSE](LICENSE) para detalles.

---

## 🇪🇸 Marca

KANDELeye es un producto de **KANDEL Security**. Todos los derechos reservados para la marca KANDEL.

- Colores corporativos: `#0F0A15` (fondo), `#8A2BE2` (violeta), `#E8E2FF` (texto)
- Logo: `logo_kandel.png`
- Contacto: nelsondecanmontilla@gmail.com

---

**🛠️ KANDELeye — Intelligence at a glance.**
