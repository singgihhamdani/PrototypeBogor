# SIJAKON BOGOR — Backend API Service

> **Stack:** NestJS 10 • Prisma ORM 5 • PostgreSQL 16 (PostGIS) • Redis 7 • Argon2id • Swagger OpenAPI

---

## 1. Ikhtisar Arsitektur Fondasi

Backend API SIJAKON dibangun dengan arsitektur modular enterprise-grade yang mengimplementasikan **6-Tier Role Hierarchy & Granular RBAC (15 Resources × 7 Actions)**.

### Model Basis Data Inti (`prisma/schema.prisma`):
1. **`roles`**: Menyimpan 5 role sistem (`SUPER_ADMIN`, `ADMIN_BIDANG`, `EKSEKUTIF`, `OPERATOR_BUJK`, `PESERTA_TKK`).
2. **`role_permissions`**: Matriks 105 kombinasi Resource × Action dengan flag `is_granted`.
3. **`users`**: Akun pengguna terotentikasi dengan hash kata sandi **Argon2id** dan asosiasi tenant BUJK.
4. **`audit_logs`**: Pencatatan riwayat setiap aksi mutasi data dan login.
5. **`districts`**: Master 40 kecamatan Kabupaten Bogor.
6. **`bujk_master`**: Master profil rekanan penyedia jasa konstruksi.

---

## 2. Cara Menjalankan Layanan Lokal

### Langkah 1: Jalankan Kontainer Database & Redis
Pastikan Docker Desktop aktif di komputer Anda, lalu jalankan dari root workspace:

```bash
docker compose up -d
```

Layanan yang akan aktif:
- **PostgreSQL 16 + PostGIS**: `localhost:5432` (User: `sijakon_admin`, DB: `sijakon_db`)
- **Redis Cache**: `localhost:6379`
- **MinIO Storage**: `localhost:9000` (Console: `localhost:9001`)

### Langkah 2: Migrasi & Seeding Basis Data
Masuk ke direktori `backend/`:

```bash
cd backend
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

Hasil seeding:
- 5 Role sistem terdaftar
- 105 entri matriks permission terkonfigurasi
- 6 Akun demo dibuat lengkap dengan password default: `Demo2026!`

### Langkah 3: Jalankan Backend NestJS Dev Server

```bash
npm run start:dev
```

Server API akan aktif pada:
- **API Base URL:** `http://localhost:4000/api/v1`
- **Swagger Documentation:** `http://localhost:4000/api/docs`

---

## 3. Daftar Endpoint yang Tersedia (Fase 1 & 2)

### Autentikasi (`/api/v1/auth`)
- `POST /api/v1/auth/login` — Autentikasi kredensial pengguna, menghasilkan access token JWT & refresh token.
- `POST /api/v1/auth/refresh` — Rotasi token akses menggunakan refresh token.
- `GET /api/v1/auth/me` — Mengambil data profil pengguna aktif beserta seluruh hak akses granularnya (Protected).

### Manajemen Peran & RBAC (`/api/v1/roles`) — Super Admin Only
- `GET /api/v1/roles` — Daftar seluruh role beserta jumlah pengguna dan izin aktif.
- `GET /api/v1/roles/:id` — Detail satu role dan permission-nya.
- `GET /api/v1/roles/:id/permissions` — Ambil matriks 105 hak akses role tertentu.
- `PUT /api/v1/roles/:id/permissions` — Bulk update hak akses role tertentu.

---

## 4. Akun Demo untuk Pengujian API

| Username | Email | Role | Password |
|:---|:---|:---|:---|
| `superadmin` | `admin@sijakon.bogor.go.id` | `SUPER_ADMIN` | `Demo2026!` |
| `op_binkon` | `binkon@sijakon.bogor.go.id` | `ADMIN_BIDANG` | `Demo2026!` |
| `op_pengawas` | `pengawas@sijakon.bogor.go.id` | `ADMIN_BIDANG` | `Demo2026!` |
| `eksekutif` | `kadis@sijakon.bogor.go.id` | `EKSEKUTIF` | `Demo2026!` |
| `bujk_demo` | `admin@ptbangunjaya.co.id` | `OPERATOR_BUJK` | `Demo2026!` |
| `peserta_demo` | `ahmad.fauzi@gmail.com` | `PESERTA_TKK` | `Demo2026!` |
