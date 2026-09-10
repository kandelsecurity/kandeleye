# Auto-alojamiento de KANDELeye con Docker

KANDELeye se distribuye como un build standalone de Next.js autosuficiente.
Esta guía cubre su ejecución con Docker / Docker Compose, despliegue como
aplicación [CasaOS](https://casaos.io) y configuración de las claves API opcionales.

> **TL;DR:** KANDELeye funciona completamente **sin ninguna clave API**.
> Todas las fuentes principales (aviación, satélites, incendios, terremotos,
> clima, noticias, CVE) usan fuentes públicas sin clave. Las claves solo
> importan para el backend opcional del escáner RECON y para aumentar
> los límites de tasa en algunas fuentes.

---

## 1. Docker Compose (recomendado)

```bash
git clone https://github.com/kandelsecurity/kandeleye.git
cd kandeleye

# opcional: configurar claves / backend del escáner
cp .env.template .env        # luego editar .env

docker compose up -d
```

Abre <http://localhost:3000>.

Qué hace el archivo compose:

- **`build:`** — compose construye la imagen localmente desde el `Dockerfile`,
  así siempre ejecutas el código que acabas de clonar. Para usar la imagen
  preconstruida del registro en su lugar, añade
  `image: ghcr.io/kandelsecurity/kandeleye:latest` al servicio `kandeleye`
  y elimina el bloque `build:`.
- **`env_file: .env` (`requerido: no`)** — si existe un archivo `.env`,
  sus valores se inyectan en el contenedor; si no existe, KANDELeye sigue
  funcionando con las fuentes sin clave.
- **`ports: ${OSIRIS_PORT:-3000}:3000`** — la interfaz web. El contenedor
  siempre escucha en el puerto 3000; el **puerto host** publicado es
  `OSIRIS_PORT` (por defecto `3000`). Configura `OSIRIS_PORT` en `.env`
  para redirigirlo, por ejemplo `OSIRIS_PORT=3005` cuando el 3000 ya
  esté en uso — no necesitas editar el archivo compose.
- **`restart: unless-stopped`** — sobrevive a reinicios.

Comandos comunes:

```bash
docker compose logs -f          # seguir logs
docker compose up -d --build    # reconstruir localmente tras obtener nuevo código
docker compose down             # detener y eliminar
```

### Descargar la imagen preconstruida de GHCR

Una imagen preconstruida para `linux/amd64` y `linux/arm64` se publica en
el GitHub Container Registry en cada push a `master` y cada etiqueta `v*.*.*`,
así puedes ejecutar KANDELeye sin construir nada:

```bash
docker pull ghcr.io/kandelsecurity/kandeleye:latest   # o una versión fija, ej. :1.0.0
docker run -d --name kandeleye \
  -p 3005:3000 --env-file .env --restart unless-stopped \
  ghcr.io/kandelsecurity/kandeleye:latest
```

El paquete es público — no se requiere `docker login` para descargarlo.

### `docker run` simple

```bash
docker build -t kandeleye:latest .
docker run -d --name kandeleye -p 3000:3000 --env-file .env --restart unless-stopped kandeleye:latest
```

### Detalles de la imagen

Build multi-stage en `node:22-alpine`, ejecuta como usuario no root
(`nextjs`, uid 1001), sirve Next.js standalone via `node server.js` en el
puerto 3000. La imagen final es ~220 MB. La construcción excluye `node_modules`,
`.next`, `.git` y los grandes artefactos `*.diff` del repositorio via `.dockerignore`.

---

## 2. CasaOS

El archivo compose incluye un bloque de metadatos `x-casaos:` (título,
descripción, icono, mapeo de puerto, descripciones de env) que Docker Compose
ignora pero CasaOS lee.

**Instalación:**

1. En el host CasaOS, clona el repositorio en una ubicación persistente (ej.
   `/DATA/AppData/kandeleye`).
2. Dashboard de CasaOS → **`+`** → **Instalar una app personalizada** → pega el
   contenido de `docker-compose.yml`.
   *(o simplemente ejecuta `docker compose up -d` desde el directorio clonado).*
3. KANDELeye aparece en el dashboard con su icono, accesible en el puerto
   host `3000` (o lo que configures en `OSIRIS_PORT` en `.env`).

El icono de la app es la marca del Ojo de Horus dorada en
`public/casaos-icon.png` (512×512 PNG), referenciada por la URL `icon:`
en los metadatos.

> CasaOS almacena los archivos compose importados bajo `/var/lib/casaos/apps/`,
> por lo que un `build:` relativo puede no resolver allí. Si importas el YAML
> directamente, construye/etiqueta `kandeleye:latest` primero
> (`docker build -t kandeleye:latest /path/to/kandeleye`) o reemplaza el bloque
> `build:` con `image: ghcr.io/kandelsecurity/kandeleye:latest`.

---

## 3. Claves API y fuentes de datos

Copia `.env.template` a `.env` y rellena solo lo que necesites.

### Qué lee el código actualmente

| Variable | Propósito | Requerido para |
|----------|-----------|----------------|
| `SCANNER_URL` | URL base del backend del escáner RECON (ej. `http://scanner:7700`) | Toolkit RECON (quick/ssl/headers/rdns/subdomains/tech/whois/geoloc/vuln) |
| `SCANNER_KEY` | Secreto compartido; **debe ser igual a `OSIRIS_KEY` del backend** | Toolkit RECON |

Sin `SCANNER_URL`/`SCANNER_KEY` los endpoints RECON devuelven `503` y
el resto de KANDELeye funciona normalmente. Genera una clave con `openssl rand -hex 32`.

### Claves opcionales (reservadas / para mayores límites de tasa)

Están documentadas por completitud y compatibilidad futura. Las rutas de
datos actuales usan **fuentes públicas sin clave**, así que no se consumen aún —
configúralas solo si extiendes la ruta relevante o alcanzas límites de tasa.

| Variable | Servicio | Cómo obtenerla (todas gratuitas) |
|----------|----------|-------------------------------------|
| `FIRMS_API_KEY` | NASA FIRMS incendios activos | Entra un email en <https://firms.modaps.eosdis.nasa.gov/api/map_key/> — el `MAP_KEY` se envía por email instantáneamente. Límite 5000 req / 10 min. |
| `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET` | OpenSky aviación | Crea una cuenta en <https://opensky-network.org/>, abre **Account → API client**, crea un cliente y copia id/secret. **Solo OAuth2 desde marzo 2025** (auth usuario/contraseña eliminada). |
| `N2YO_API_KEY` | N2YO satélites | Regístrate en <https://www.n2yo.com/login/register/>, luego **Profile → generate API key**. Límite 1000 req / hora; la clave no puede regenerarse. |
| `AIS_API_KEY` | aisstream.io maritime | Regístrate en <https://aisstream.io/>, crea una clave en la página **API Keys**. Usado sobre `wss://stream.aisstream.io/v0/stream`. |

> Mantén `.env` fuera del control de versiones — ya está en `.gitignore`. Solo
> `.env.template` (sin secretos) está comprometido.

### Sobreescrituras de runtime opcionales

| Variable | Propósito | Default |
|----------|-----------|---------|
| `OSIRIS_TELEGRAM_CHANNELS` | Lista separada por comas de nombres de canales públicos de Telegram (sin `@`) para el mapa **Telegram OSINT**. Sobrescribe el conjunto por defecto curado. | `osintdefender,insiderpaper,aljazeeraenglish,nexta_live,war_monitor` |
| `OSIRIS_PORT` | Puerto host que publica el compose (el contenedor símpre escucha en 3000). | `3000` |

### Fuentes sin clave (sin configuración necesaria)

Aviación → `adsb.lol` · Satélites → `celestrak.org` (TLE) · Incendios →
NASA FIRMS open-data CSV · Terremotos → USGS · Clima → NASA EONET · Clima
espacial → NOAA SWPC · CVEs → NVD · Noticias → streams RSS / HLS públicos · CCTV →
fuentes públicas de autoridades de tráfico · Crypto (BTC) → `blockstream.info` · Crypto
(ETH) → `eth.blockscout.com` ([Blockscout](https://github.com/blockscout/blockscout)
explorador open-source) · Sanciones OFAC SDN → [OpenSanctions](https://www.opensanctions.org)
mirror (CC-BY 4.0) · Telegram OSINT → preview web público `t.me/s/<channel>`.
