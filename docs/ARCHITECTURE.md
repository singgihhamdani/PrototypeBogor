# Arsitektur Teknis Sistem — SIJAKON BOGOR

> **Dokumen Referensi Arsitektur & Design Decisions**
> Versi: 1.1.0 | Tanggal: September 2026

---

## 1. Gambaran Umum Arsitektur

SIJAKON BOGOR mengadopsi arsitektur **Modular Monolith** pada tahap awal (90 hari) dengan kemampuan evolusi ke **Microservices** pada fase lanjutan. Keputusan ini diambil untuk menyeimbangkan *velocity* pengembangan dengan *maintainability* jangka panjang.

```mermaid
graph TB
    subgraph "Client Layer"
        Browser["🌐 Web Browser<br/>(Desktop/Mobile)"]
        PWA["📱 PWA Offline<br/>(Admin Bidang - Varian Pengawas)"]
    end

    subgraph "Edge & CDN"
        CDN["☁️ Vercel Edge / Nginx<br/>Static Assets + ISR Cache"]
    end

    subgraph "Application Layer"
        FE["⚛️ Next.js 15 App Router<br/>React 19 + RSC"]
        API["🔧 NestJS Backend<br/>REST + OpenAPI"]
    end

    subgraph "Service Layer"
        AuthSvc["🔐 Auth Service<br/>JWT + RBAC"]
        GISSvc["🗺️ GIS Service<br/>PostGIS + Turf.js"]
        AuditSvc["📋 Audit Service<br/>Scoring Engine"]
        DocSvc["📄 Document Service<br/>PDF/Excel Generator"]
        NotifSvc["🔔 Notification Service<br/>In-App & Dashboard Alerts"]
    end

    subgraph "Data Layer"
        PG["🐘 PostgreSQL 16<br/>+ PostGIS 3.4"]
        Redis["⚡ Redis 7<br/>Cache + Queue"]
        S3["📦 Object Storage<br/>MinIO / S3<br/>(PDF, SHP, Foto)"]
    end

    Browser --> CDN
    PWA --> CDN
    CDN --> FE
    FE --> API
    API --> AuthSvc
    API --> GISSvc
    API --> AuditSvc
    API --> DocSvc
    API --> NotifSvc
    AuthSvc --> PG
    GISSvc --> PG
    AuditSvc --> PG
    DocSvc --> Redis
    DocSvc --> S3
    NotifSvc --> Redis
```

---

## 2. Keputusan Arsitektur (Architecture Decision Records)

### ADR-001: Modular Monolith vs Microservices

| Aspek | Keputusan |
| :--- | :--- |
| **Status** | ✅ Diadopsi |
| **Konteks** | Timeline 90 hari kalender tidak memungkinkan overhead orkestrasi microservices penuh. |
| **Keputusan** | Adopsi **Modular Monolith** dengan batas modul yang jelas (NestJS Modules). Setiap modul memiliki domain boundary sendiri dan berkomunikasi via internal event bus. |
| **Konsekuensi** | Deploy sebagai satu unit, tapi modul dapat di-extract ke service terpisah di masa depan tanpa refactor masif. |

### ADR-002: Next.js App Router + Server Components

| Aspek | Keputusan |
| :--- | :--- |
| **Status** | ✅ Diadopsi |
| **Konteks** | Diperlukan SSR untuk SEO halaman publik (regulasi, berita) dan performa rendering data tabel besar. |
| **Keputusan** | Gunakan **Next.js 15 App Router** dengan React Server Components untuk halaman data-heavy, Client Components untuk interaktivitas (peta, form wizard). |
| **Konsekuensi** | Reduced client-side JS bundle, faster TTFB, tetapi memerlukan pemahaman mental model RSC oleh tim. |

### ADR-003: PostgreSQL + PostGIS sebagai Spatial Database

| Aspek | Keputusan |
| :--- | :--- |
| **Status** | ✅ Diadopsi |
| **Konteks** | Kebutuhan penyimpanan dan query data geospasial (titik proyek, poligon kecamatan, import SHP). |
| **Keputusan** | Gunakan **PostgreSQL 16 + PostGIS 3.4** sebagai satu-satunya database, menghindari kebutuhan spatial database terpisah. |
| **Konsekuensi** | Query spasial (`ST_Contains`, `ST_DWithin`, `ST_Transform`) berjalan native di level database, sangat efisien. |

### ADR-004: Object Storage untuk File Biner

| Aspek | Keputusan |
| :--- | :--- |
| **Status** | ✅ Diadopsi |
| **Konteks** | Sistem menyimpan banyak file biner: PDF legalitas, foto proyek, Shapefile, e-Certificate. |
| **Keputusan** | Gunakan **S3-compatible Object Storage** (MinIO untuk on-premise, AWS S3 untuk cloud). Database hanya menyimpan metadata dan URL referensi. |
| **Konsekuensi** | Database tetap ringan. File dapat di-serve langsung via signed URL tanpa membebani backend. |

---

## 3. Struktur Folder Proyek (Monorepo)

```text
sijakon-bogor/
├── apps/
│   ├── web/                          # Next.js 15 Frontend
│   │   ├── app/                      # App Router pages & layouts
│   │   │   ├── (public)/             # Route group: halaman publik
│   │   │   │   ├── page.tsx          # Landing page / peta publik
│   │   │   │   ├── regulasi/         # Direktori regulasi
│   │   │   │   ├── berita/           # Berita & agenda
│   │   │   │   └── validasi/[token]/ # QR Code validation
│   │   │   ├── (auth)/               # Route group: login/register
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/          # Route group: area terproteksi
│   │   │   │   ├── layout.tsx        # Sidebar + Topbar layout
│   │   │   │   ├── dashboard/        # Ringkasan statistik
│   │   │   │   ├── bujk/             # Master BUJK, SBU, Pengalaman
│   │   │   │   ├── webgis/           # Peta interaktif full-screen
│   │   │   │   ├── pengawasan/       # Audit & checklist digital
│   │   │   │   ├── pelatihan/        # Manajemen pelatihan & TKK
│   │   │   │   ├── pelaporan/        # Laporan eksekutif
│   │   │   │   └── pengaturan/       # User, role, permission, audit log
│   │   │   └── api/                  # Next.js Route Handlers (BFF proxy)
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   # Shadcn UI primitives
│   │   │   ├── forms/                # Form wizard, stepper
│   │   │   ├── maps/                 # MapLibre wrapper components
│   │   │   ├── charts/               # Recharts / Nivo wrappers
│   │   │   └── layout/               # Sidebar, Topbar, CommandPalette
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities, API client, constants
│   │   ├── styles/                   # Global CSS, Tailwind config
│   │   └── public/                   # Static assets, favicon, fonts
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── modules/              # Domain modules (bounded contexts)
│       │   │   ├── auth/             # Authentication & authorization
│       │   │   ├── users/            # User & role management
│       │   │   ├── bujk/             # BUJK master, SBU, experiences
│       │   │   ├── projects/         # Paket pekerjaan & progress
│       │   │   ├── gis/              # Geospatial data & SHP parsing
│       │   │   ├── supervision/      # Pengawasan & audit checklist
│       │   │   ├── training/         # Pelatihan, TKK, e-certificate
│       │   │   ├── reporting/        # Laporan eksekutif & multi-format export
│       │   │   ├── cms/              # Berita & regulasi
│       │   │   └── notifications/    # In-app & system alerts
│       │   ├── common/               # Shared guards, pipes, decorators
│       │   ├── config/               # Environment & app configuration
│       │   ├── database/             # Prisma schema & migrations
│       │   │   ├── schema.prisma
│       │   │   ├── migrations/
│       │   │   └── seed/
│       │   └── main.ts               # Bootstrap entry point
│       └── test/                     # E2E & integration tests
│
├── packages/                         # Shared packages (monorepo)
│   ├── shared-types/                 # TypeScript types & Zod schemas
│   │   ├── src/
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   ├── enums/                # Shared enumerations
│   │   │   └── schemas/              # Zod validation schemas
│   │   └── package.json
│   ├── shared-utils/                 # Shared utility functions
│   └── eslint-config/                # Shared ESLint configuration
│
├── infrastructure/                   # DevOps & deployment
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   └── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf
│   ├── scripts/
│   │   ├── backup-db.sh              # pg_dump automated backup
│   │   ├── restore-db.sh
│   │   └── seed-gis-data.sh          # Import SHP kecamatan
│   └── k8s/                          # Kubernetes manifests (future)
│
├── docs/                             # Dokumentasi teknis
│   ├── ARCHITECTURE.md               # (Dokumen ini)
│   ├── METHODOLOGY.md
│   ├── AGENT.md
│   ├── API_SPECIFICATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── CODING_STANDARDS.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── SECURITY_POLICY.md
│
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root workspace manifest
├── pnpm-workspace.yaml               # PNPM workspace definition
├── .env.example                      # Environment variables template
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## 4. Alur Data Utama (Data Flow)

### 4.1 Alur Pendaftaran BUJK (Stepper Wizard)

```mermaid
sequenceDiagram
    actor User as Operator BUJK
    participant FE as Next.js Frontend
    participant API as NestJS Backend
    participant DB as PostgreSQL
    participant S3 as Object Storage

    User->>FE: Isi Form Step 1 (Legalitas)
    FE->>FE: Auto-save draft (localStorage)
    User->>FE: Isi Form Step 2-3 (Alamat, PJ)
    FE->>FE: Validasi Zod per-step
    User->>FE: Step 4: Review & Submit
    FE->>API: POST /api/bujk/register (multipart)
    API->>API: Validasi Zod server-side
    API->>S3: Upload PDF legalitas
    S3-->>API: file_url
    API->>DB: INSERT bujk_master (status: DRAFT)
    API->>DB: INSERT audit_log
    DB-->>API: bujk_id
    API-->>FE: 201 Created { bujk_id, status }
    FE-->>User: Toast "Pendaftaran berhasil!"
```

### 4.2 Alur WebGIS Split-View Filtering

```mermaid
sequenceDiagram
    actor User as Operator Dinas
    participant Map as MapLibre GL JS
    participant FE as React State
    participant API as NestJS GIS Module
    participant DB as PostGIS

    User->>Map: Pan/Zoom peta
    Map->>FE: onMoveEnd → extract bbox
    FE->>API: GET /api/gis/projects?bbox=...&layer=apbd
    API->>DB: SELECT * FROM bujk_projects<br/>WHERE ST_Intersects(geom_area, ST_MakeEnvelope(...))
    DB-->>API: GeoJSON FeatureCollection
    API-->>FE: { features: [...], total: N }
    FE->>Map: Update markers & clusters
    FE->>FE: Sync tabel daftar proyek
```

### 4.3 Alur Scoring Audit Pengawasan

```mermaid
sequenceDiagram
    actor Auditor as Admin Bidang (Pengawas)
    participant FE as Checklist UI
    participant Gauge as Live Score Gauge
    participant API as NestJS Audit Module
    participant DB as PostgreSQL

    Auditor->>FE: Centang item checklist Tertib Usaha
    FE->>Gauge: Hitung skor real-time (client-side)
    Gauge-->>Auditor: 🟢 85% Tertib
    Auditor->>FE: Upload foto bukti
    Auditor->>FE: Submit seluruh checklist
    FE->>API: POST /api/supervision/inspections
    API->>API: Validasi & hitung final score
    API->>DB: INSERT supervision_inspections
    API->>DB: UPDATE supervision_schedules.status
    API-->>FE: { final_status: "TERTIB", score: 85.2 }
    FE-->>Auditor: Sertifikat kepatuhan tersedia
```

---

## 5. Stack Teknologi & Versi Pinned

| Layer | Teknologi | Versi | Justifikasi |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | ≥ 20 LTS | Dukungan native ESM, performance V8 terbaru |
| **Package Manager** | pnpm | ≥ 9.x | Workspace monorepo native, disk-efficient |
| **Monorepo Tool** | Turborepo | ≥ 2.x | Build caching, task orchestration |
| **Frontend Framework** | Next.js | 15.x | App Router, RSC, ISR, Middleware |
| **UI Library** | React | 19.x | Server Components, concurrent features |
| **Styling** | Tailwind CSS | 4.x | Utility-first, JIT compilation |
| **Component Library** | Shadcn UI | latest | Composable, accessible, customizable |
| **Animation** | Framer Motion | 11.x | Declarative animations |
| **Maps** | MapLibre GL JS | 4.x | GPU-accelerated vector tile rendering |
| **Charts** | Recharts | 2.x | Composable React chart library |
| **Backend Framework** | NestJS | 10.x | Modular, decorator-based, enterprise-grade |
| **ORM** | Prisma | 6.x | Type-safe queries, auto-migration |
| **Validation** | Zod | 3.x | Runtime type checking, schema-first |
| **Database** | PostgreSQL | 16.x | ACID, JSONB, CTE, Window Functions |
| **Spatial Extension** | PostGIS | 3.4.x | ST_* functions, geography types |
| **Cache / Queue** | Redis | 7.x | In-memory cache, pub/sub |
| **Job Queue** | BullMQ | 5.x | Reliable job processing |
| **File Storage** | MinIO / S3 | latest | S3-compatible object storage |
| **PDF Engine** | Puppeteer | 23.x | Headless Chrome PDF generation |
| **Excel Engine** | ExcelJS | 4.x | Streaming Excel read/write |
| **Spatial Parser** | shpjs | 4.x | Shapefile → GeoJSON |
| **Spatial Analysis** | @turf/turf | 7.x | Client/server geospatial ops |
| **QR Code** | qrcode | 1.x | Dynamic QR generation |
| **Testing** | Vitest + Playwright | latest | Unit + E2E testing |
| **Linting** | ESLint + Prettier | latest | Code consistency |
| **API Docs** | Swagger / OpenAPI | 3.1 | Auto-generated API documentation |

---

## 6. Strategi Deployment

### 6.1 Lingkungan (Environments)

| Environment | Tujuan | URL Pattern |
| :--- | :--- | :--- |
| **Development** | Pengembangan lokal | `localhost:3000` (web), `localhost:4000` (api) |
| **Staging** | UAT & testing internal | `staging.sijakon.bogorkab.go.id` |
| **Production** | Live untuk pengguna | `sijakon.bogorkab.go.id` |

### 6.2 Docker Compose (Development & Staging)

```yaml
# docker-compose.yml (simplified)
services:
  web:
    build: ./infrastructure/docker/Dockerfile.web
    ports: ["3000:3000"]
    depends_on: [api]
    environment:
      - NEXT_PUBLIC_API_URL=http://api:4000

  api:
    build: ./infrastructure/docker/Dockerfile.api
    ports: ["4000:4000"]
    depends_on: [postgres, redis]
    environment:
      - DATABASE_URL=postgresql://sijakon:***@postgres:5432/sijakon_db
      - REDIS_URL=redis://redis:6379

  postgres:
    image: postgis/postgis:16-3.4
    volumes: ["pg_data:/var/lib/postgresql/data"]
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]
    volumes: ["minio_data:/data"]

volumes:
  pg_data:
  minio_data:
```

---

## 7. Strategi Monitoring & Observability

| Aspek | Tools | Keterangan |
| :--- | :--- | :--- |
| **Application Logging** | Pino (structured JSON) | Log terstruktur, rotasi harian |
| **Error Tracking** | Sentry | Real-time error alerts |
| **APM / Tracing** | OpenTelemetry | Distributed tracing per request |
| **Database Monitoring** | pg_stat_statements | Slow query detection |
| **Uptime Monitoring** | UptimeRobot / Healthchecks | Endpoint `/health` setiap 60 detik |
| **Backup Verification** | Custom cron script | Validasi backup harian via checksum |

---

*Dokumen ini merupakan sumber kebenaran tunggal (single source of truth) untuk arsitektur teknis SIJAKON BOGOR dan harus diperbarui setiap kali ada perubahan arsitektur signifikan.*
