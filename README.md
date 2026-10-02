# 🏗️ SIJAKON BOGOR

**Sistem Informasi Pembinaan & Pengawasan Jasa Konstruksi — Kabupaten Bogor TA 2026**

Platform digital untuk pembinaan dan pengawasan jasa konstruksi, dikembangkan berdasarkan **KAK Jasa Konstruksi Kab. Bogor TA 2026**, **Permen PUPR No. 1/2023**, dan integrasi alur kerja **SIBIJAK**.

---

## 📂 Struktur Repository

```
ciptabintar/
├── prototype/          # Frontend — Next.js 15 (App Router, React 19)
│   ├── src/app/        # Pages & layouts (6-role adaptive portal)
│   ├── src/lib/        # Shared utilities, API client, RBAC config
│   └── .env.example    # Template konfigurasi frontend
│
├── backend/            # Backend API — NestJS + Prisma ORM 5
│   ├── src/            # Modules (Auth, Users, RBAC Guards)
│   ├── prisma/         # Schema & migrations (PostgreSQL + PostGIS)
│   └── .env.example    # Template konfigurasi backend
│
├── docs/               # Dokumentasi teknis
│   ├── AGENT.md        # Panduan developer & AI agent
│   ├── ARCHITECTURE.md # Blueprint arsitektur
│   ├── SECURITY_POLICY.md
│   ├── referensi/      # Dokumen referensi proyek (KAK, PRD, SIBIJAK)
│   └── ...
│
├── scripts/            # Script utilitas (generator DOCX, dll.)
├── docker-compose.yml  # Infrastruktur lokal (PostgreSQL, Redis, MinIO)
└── README.md           # ← Anda di sini
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.x
- **Docker & Docker Compose** (untuk database & services)
- **Git**

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_ORG/sijakon-bogor.git
cd sijakon-bogor
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env          # Edit .env dengan kredensial Anda
npm install
npx prisma generate           # Generate Prisma client
npx prisma migrate dev         # Jalankan migrasi database
npm run start:dev              # Start backend di http://localhost:4000
```

### 3. Frontend Setup

```bash
cd prototype
cp .env.example .env.local    # Edit .env.local jika perlu
npm install
npm run dev                    # Start frontend di http://localhost:3000
```

### 4. Infrastruktur (Docker)

```bash
# Dari root project
docker-compose up -d           # PostgreSQL + Redis + MinIO
```

---

## 🔐 Sistem Role & RBAC

Platform mendukung **6 role** dengan portal adaptif:

| Role | Portal | Akses Utama |
|:-----|:-------|:------------|
| **Super Admin** | Admin Console | Full system, manajemen user, RBAC matrix |
| **Admin Bidang** | Dashboard Bidang | CRUD data per-bidang, validasi dokumen |
| **Eksekutif** | Executive Dashboard | Statistik, monitoring, decision support (read-only) |
| **Operator BUJK** | Portal BUJK | Submit SBU/SKK, upload berkas, tracking status |
| **Peserta TKK** | Portal TKK | Pendaftaran TKK, jadwal ujian, sertifikat |
| **Publik/Umum** | Portal Informasi | Cek legalitas BUJK, data publik |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|:------|:----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Shadcn UI, Framer Motion, SheetJS (xlsx) |
| **Backend** | NestJS, TypeScript, Prisma ORM 5, Zod Validation |
| **Database** | PostgreSQL 16 + PostGIS 3.4 |
| **Cache** | Redis 7 + BullMQ |
| **Storage** | MinIO (S3-compatible) |
| **WebGIS** | MapLibre GL JS, Turf.js |
| **Auth** | JWT + Argon2id, Multi-layer RBAC Guards |

---

## 📚 Dokumentasi
 
| Dokumen | Deskripsi |
|:--------|:----------|
| [CHANGELOG.md](./CHANGELOG.md) | 📋 Log rilis & riwayat pembaruan sistem |
| [PANDUAN_KONTRIBUSI_DAN_PERUBAHAN.md](./docs/PANDUAN_KONTRIBUSI_DAN_PERUBAHAN.md) | 📖 Panduan rilis GitHub, PR template, & integrasi modul |
| [SIPJAKI_INTEGRATION_SPECIFICATION.md](./docs/SIPJAKI_INTEGRATION_SPECIFICATION.md) | 🏛️ Spesifikasi 5 Pilar Pengawasan SIPJAKI Kementerian PUPR |
| [AGENT.md](./docs/AGENT.md) | Panduan developer & AI agent |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Blueprint arsitektur modular |
| [METHODOLOGY.md](./docs/METHODOLOGY.md) | Sprint Scrum 90 hari, Git flow |
| [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) | Standar TypeScript & konvensi |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Kamus data & skema PostGIS |
| [API_SPECIFICATION.md](./docs/API_SPECIFICATION.md) | Kontrak RESTful API (OpenAPI 3.1) |
| [SECURITY_POLICY.md](./docs/SECURITY_POLICY.md) | Autentikasi, RBAC, kepatuhan UU PDP |
| [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) | Docker, Nginx SSL, backup otomatis |

---

## 🤝 Contributing & Pull Requests

1. Pelajari panduan lengkap di [PANDUAN_KONTRIBUSI_DAN_PERUBAHAN.md](./docs/PANDUAN_KONTRIBUSI_DAN_PERUBAHAN.md).
2. Buat branch dari `main`: `git checkout -b feature/nama-fitur`
3. Ikuti standar di [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md)
4. Commit dengan format konvensional: `feat(module): deskripsi singkat`
5. Jalankan `npx tsc --noEmit` untuk memastikan 0 error.
6. Push dan buat Pull Request menggunakan template yang disediakan.

---

## 📋 Status Proyek

- [x] **Fase 0**: Perencanaan & PRD
- [x] **Fase 1**: Prototype Frontend (6-role portal)
- [x] **Fase 1**: Backend Foundation (NestJS + Prisma + RBAC)
- [x] **Integrasi SIPJAKI PUPR**: 5 Pilar Pengawasan Jakon & Data Master (Sprint 1 - 6)
- [x] **Fitur Batch Upload**: Modul Import Batch Data (Excel / CSV)
- [x] **Fitur Ekspor/Impor SIPJAKI**: Engine XLSX/CSV native (SheetJS) + 6 template resmi Kementerian PUPR
- [x] **Audit Trail**: Riwayat ekspor/impor data SIPJAKI (`/pengaturan/riwayat-data`)
- [x] **Standar & Template Integrasi**: Tab SIPJAKI file-based (menggantikan API fiktif)
- [ ] **Fase 2**: Integrasi Full-Stack & Autentikasi API
- [ ] **Fase 3**: Sinkronisasi Otomatis Database SIPJAKI Pusat (menunggu pembukaan API PUPR)
- [ ] **Fase 4**: WebGIS & Reporting Lanjutan
- [ ] **Fase 5**: Testing & Deployment Produksi

---

*Dinas Pekerjaan Umum (DPU) Kabupaten Bogor — TA 2026*
