# Panduan Penerapan & Operasional (Deployment Guide) — SIJAKON BOGOR

> **Instruksi Instalasi Server, Kontainerisasi Docker, Konfigurasi Nginx, & Manajemen Operasional**
> Versi: 1.0.0 | Tanggal: Agustus 2026

---

## 1. Spesifikasi Infrastruktur Server

Sesuai standar operasional Pusat Data / Server Diskominfo & DPUPR Kabupaten Bogor:

| Komponen | Spesifikasi Minimum (Staging) | Spesifikasi Rekomendasi (Production) |
| :--- | :--- | :--- |
| **Sistem Operasi** | Ubuntu Server 22.04 / 24.04 LTS | Ubuntu Server 24.04 LTS (x86_64) |
| **Processor (CPU)**| 4 vCPU Core (2.5 GHz+) | 8 vCPU Core (3.0 GHz+) |
| **Memori (RAM)** | 8 GB DDR4 | 16 GB - 32 GB DDR4/DDR5 ECC |
| **Penyimpanan (Storage)**| 100 GB SSD / NVMe | 500 GB NVMe SSD (RAID 1 / Managed SAN) |
| **Jaringan & Bandwidth**| 100 Mbps Shared | 1 Gbps Dedicated + IP Publik Statis |
| **Perangkat Lunak Pendukung**| Docker Engine 26+, Docker Compose v2 | Docker Engine 26+, Nginx, SSL Certbot |

---

## 2. Kontainerisasi Multi-Stage Docker

### 2.1 Dockerfile Frontend Next.js (`infrastructure/docker/Dockerfile.web`)

```dockerfile
# Multi-stage build for Next.js 15
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Dependencies stage
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
RUN pnpm install --frozen-lockfile

# 2. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm --filter @sijakon/web build

# 3. Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### 2.2 Dockerfile Backend NestJS (`infrastructure/docker/Dockerfile.api`)

```dockerfile
# Multi-stage build for NestJS Backend
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @sijakon/api prisma generate
RUN pnpm --filter @sijakon/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Install Chromium untuk generator PDF Puppeteer
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/src/database/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
```

---

## 3. Konfigurasi Orkestrasi Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # Database PostgreSQL 16 dengan ekstensi PostGIS 3.4
  postgres:
    image: postgis/postgis:16-3.4-alpine
    container_name: sijakon-postgres
    restart: always
    environment:
      POSTGRES_DB: sijakon_db
      POSTGRES_USER: sijakon_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./infrastructure/scripts/init-postgis.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - sijakon-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sijakon_admin -d sijakon_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # In-Memory Cache & Job Queue Redis
  redis:
    image: redis:7.2-alpine
    container_name: sijakon-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - sijakon-network

  # S3-Compatible Object Storage MinIO
  minio:
    image: minio/minio:RELEASE.2024-05-10T01-41-38Z
    container_name: sijakon-minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    networks:
      - sijakon-network

  # Backend API NestJS
  api:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.api
    container_name: sijakon-api
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://sijakon_admin:${DB_PASSWORD}@postgres:5432/sijakon_db
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      S3_SECRET_KEY: ${MINIO_SECRET_KEY}
      S3_BUCKET_NAME: sijakon-files
    ports:
      - "127.0.0.1:4000:4000"
    networks:
      - sijakon-network

  # Frontend Next.js
  web:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.web
    container_name: sijakon-web
    restart: always
    depends_on:
      - api
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://sijakon.bogorkab.go.id/api/v1
    ports:
      - "127.0.0.1:3000:3000"
    networks:
      - sijakon-network

networks:
  sijakon-network:
    driver: bridge

volumes:
  pg_data:
  redis_data:
  minio_data:
```

---

## 4. Konfigurasi Web Server Nginx & SSL Certbot

Simpan berkas konfigurasi di `/etc/nginx/sites-available/sijakon.bogorkab.go.id`:

```nginx
# Konfigurasi Reverse Proxy Nginx untuk SIJAKON BOGOR
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream nestjs_upstream {
    server 127.0.0.1:4000;
    keepalive 64;
}

server {
    listen 80;
    server_name sijakon.bogorkab.go.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sijakon.bogorkab.go.id;

    # SSL Certificate (Let's Encrypt / DigiCert Pemda)
    ssl_certificate /etc/letsencrypt/live/sijakon.bogorkab.go.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sijakon.bogorkab.go.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Client Body Limit (Maksimal Upload 15MB untuk File SHP Zip)
    client_max_body_size 15M;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy API Request ke NestJS Backend
    location /api/ {
        proxy_pass http://nestjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Proxy Static Files & Pages ke Next.js
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. Script Pencadangan Otomatis Basis Data (`backup-db.sh`)

Simpan di `/usr/local/bin/backup-sijakon.sh` dan jadwalkan via `cron` harian:

```bash
#!/bin/bash
# ==============================================================================
# Script Backup Otomatis Database PostgreSQL + PostGIS SIJAKON BOGOR
# ==============================================================================

BACKUP_DIR="/var/backups/sijakon/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sijakon_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p ${BACKUP_DIR}

echo "[$(date)] Memulai pencadangan basis data..."
docker exec -t sijakon-postgres pg_dump -U sijakon_admin -d sijakon_db | gzip > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "[$(date)] Pencadangan berhasil: ${BACKUP_FILE}"
    # Hapus file backup yang berumur lebih dari 30 hari
    find ${BACKUP_DIR} -type f -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
else
    echo "[$(date)] ERROR: Pencadangan gagal!" >&2
    exit 1
fi
```

### Konfigurasi Crontab Server:
```cron
# Jalankan backup otomatis setiap pukul 02:00 dini hari
0 2 * * * /usr/local/bin/backup-sijakon.sh >> /var/log/sijakon-backup.log 2>&1
```

---

## 6. Prosedur Pemulihan Data (Disaster Recovery)

Jika terjadi kendala server atau migrasi data ke mesin baru:

```bash
# 1. Ekstrak dan restore data dari berkas backup
gunzip -c /var/backups/sijakon/db/sijakon_db_20260821_020000.sql.gz | \
  docker exec -i sijakon-postgres psql -U sijakon_admin -d sijakon_db

# 2. Verifikasi ekstensi PostGIS setelah restore
docker exec -it sijakon-postgres psql -U sijakon_admin -d sijakon_db -c "SELECT PostGIS_Version();"

# 3. Jalankan Prisma migration sync jika ada migrasi baru
docker exec -it sijakon-api npx prisma migrate deploy
```

---

## 7. Endpoint Pemeriksaan Kesehatan (Health Checks)

Sistem menyediakan endpoint `/health` untuk monitoring uptime otomatis:
- **HTTP GET** `https://sijakon.bogorkab.go.id/api/v1/health`
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-08-21T16:00:00.000Z",
    "services": {
      "database": "connected",
      "postgis": "3.4.0",
      "redis": "ready",
      "storage": "accessible"
    }
  }
  ```

---

*Panduan deployment ini memastikan aplikasi SIJAKON BOGOR dapat diinstalasi, dikelola, dicadangkan, dan beroperasi dengan ketersediaan tinggi (High Availability) sesuai SLA pemerintah daerah.*
