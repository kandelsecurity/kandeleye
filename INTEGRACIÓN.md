# 🛡️ KANDELeye — Sistema de Integración de Herramientas

## Visión General

KANDELeye unifica todas las herramientas de KANDEL en un único dashboard:

| Herramienta | Función | Dato en el Mapa |
|-------------|---------|-----------------|
| **KANDELscan** | Escaneo de vulnerabilidades (Nuclei) | Puntos de vulnerabilidad |
| **KANDELcrack** | Auditoría Wi-Fi (aircrack-ng) | Redes Wi-Fi detectadas |
| **KANDELlimiter** | Control de tráfico (tc HTB) | Dispositivos de red |
| **KANDELker** | GPS y rastreo de activos | Puntos de localización |

## Arquitectura de Integración

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  KANDELscan     │────▶│  kandeleye-connect │────▶│  KANDELeye API  │
│  (Nuclei)       │     │  (.sh script)       │     │  (/api/integrac) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐     ┌────────┴────────┐
│  KANDELcrack    │────▶│  kandeleye-connect │────▶│  Capas en Mapa  │
│  (aircrack-ng)  │     │  (.sh script)       │     │  (MapLibre GL)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  KANDELlimiter  │────▶│  kandeleye-connect │────▶│  Panel Resumen  │
│  (tc HTB)       │     │  (.sh script)       │     │  (Dashboard)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  KANDELker      │────▶│  kandeleye-connect │────▶│  Puntos GPS     │
│  (Flask+GPS)    │     │  (.sh script)       │     │  (en tiempo real)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Uso

### 1. Conectar cada herramienta

```bash
# KANDELscan → KANDELeye
export KANDELYE_API=http://localhost:3000/api/integration
./integration/kandeleye-connect.sh kandelscan vulnerability '{"target":"192.168.1.1","severity":"critical","port":80}'

# KANDELcrack → KANDELeye
./integration/kandeleye-connect.sh kandelcrack network '{"bssid":"AA:BB:CC:DD:EE:FF","ssid":"MiRed","channel":6}'

# KANDELlimiter → KANDELeye
./integration/kandeleye-connect.sh kandellimiter device '{"ip":"192.168.1.50","mac":"AA:BB:CC:DD:EE:01","status":"limited"}'

# KANDELker → KANDELeye
./integration/kandeleye-connect.sh kandelker gps '{"lat":40.4168,"lng":-3.7038,"label":"Activo 1"}'
```

### 2. Auditoría completa

```bash
# Iniciar auditoría
./integration/kandeleye-connect.sh audit start '{}'

# Ejecutar cada herramienta...
# KANDELscan → kandeleye-connect.sh kandelscan ...
# KANDELcrack → kandeleye-connect.sh kandelcrack ...
# KANDELlimiter → kandeleye-connect.sh kandellimiter ...
# KANDELker → kandeleye-connect.sh kandelker ...

# Completar auditoría
./integration/kandeleye-connect.sh audit complete '{}'
```

### 3. Ver resumen

```bash
curl http://localhost:3000/api/integration?type=summary
```

## Flujo de Auditoría Integrado

1. **Pulsar "Auditar"** en KANDELeye
2. **KANDELscan** ejecuta escaneo Nuclei → envía vulnerabilidades
3. **KANDELcrack** escanea Wi-Fi → envía redes detectadas
4. **KANDELlimiter** identifica dispositivos → envía estado
5. **KANDELker** rastrea GPS → envía ubicaciones
6. **KANDELeye** muestra todo en el mapa + panel resumen
7. **Un clic** genera PDF corporativo

## Archivos Clave

- `src/lib/integration/aggregator.ts` — Clase Aggregator (singleton)
- `src/app/api/integration/route.ts` — API REST de integración
- `integration/kandeleye-connect.sh` — Script connector universal

## Estado

- ✅ API de integración funcional
- ✅ Aggregator singleton implementado
- ✅ Connector shell script creado
- 🔄 Capas de mapa en desarrollo
- 🔄 Botón "Auditar" en desarrollo

---

**KANDEL Security** — Plataforma Unificada de Inteligencia y Auditoría
