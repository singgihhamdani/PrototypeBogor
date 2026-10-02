# Metodologi Pengembangan — SIJAKON BOGOR

> **Panduan Proses, Workflow & Standar Kerja Tim**
> Versi: 1.0.0 | Tanggal: Agustus 2026

---

## 1. Framework Metodologi

SIJAKON BOGOR mengadopsi **Agile Scrum yang disesuaikan** untuk konteks proyek pemerintah dengan timeline tetap 90 hari kalender. Metodologi ini menggabungkan disiplin sprint Scrum dengan checkpoint deliverable yang terstruktur sesuai KAK.

```mermaid
graph LR
    subgraph "Sprint Cycle (2 Minggu)"
        A["📋 Sprint Planning<br/>(Senin, Minggu ke-1)"] --> B["💻 Development<br/>(10 hari kerja)"]
        B --> C["🔍 Code Review<br/>(Setiap PR)"]
        C --> D["🧪 Sprint Testing<br/>(Jumat, Minggu ke-2)"]
        D --> E["📊 Sprint Review<br/>(Demo ke PPK)"]
        E --> F["🔄 Sprint Retro<br/>(Internal Tim)"]
        F --> A
    end
```

### 1.1 Pembagian Sprint (6 Sprint × 2 Minggu)

| Sprint | Periode (Hari) | Fokus Utama | Deliverable |
| :---: | :--- | :--- | :--- |
| **Sprint 0** | Hari 1-15 | Persiapan, Analisis, Setup Infra | Design System, DB Schema, Docker env |
| **Sprint 1** | Hari 16-25 | Auth, RBAC, BUJK Core | Login, User Management, BUJK Register |
| **Sprint 2** | Hari 26-35 | SBU, Pengalaman, Monitoring | SBU CRUD, Kurva S, Progress Tracking |
| **Sprint 3** | Hari 36-50 | WebGIS & Pelatihan | Peta Interaktif, SHP Import, e-Cert |
| **Sprint 4** | Hari 51-65 | Pengawasan & Pelaporan | Audit Checklist, Scoring, Export |
| **Sprint 5** | Hari 66-80 | Pelaporan & CMS | Modul Pelaporan Eksekutif, Export SHP/Excel, CMS, Polish |
| **Sprint 6** | Hari 81-90 | Testing & Serah Terima | UAT, Migrasi, Training, Go-Live |

---

## 2. Git Workflow & Branching Strategy

### 2.1 Branching Model

Menggunakan **GitHub Flow + Release Branch** yang disederhanakan:

```text
main (production-ready)
 │
 ├── develop (integration branch)
 │    │
 │    ├── feature/FR-BJK-01-bujk-registration
 │    ├── feature/FR-GIS-03-geocoding-input
 │    ├── feature/FR-AUD-02-checklist-tertib-usaha
 │    ├── fix/login-session-timeout
 │    └── chore/update-prisma-schema
 │
 └── release/v1.0.0 (UAT & staging)
      │
      └── hotfix/critical-auth-fix
```

### 2.2 Konvensi Penamaan Branch

```text
feature/FR-{MODULE}-{ID}-{deskripsi-singkat}
fix/{deskripsi-bug}
chore/{deskripsi-tugas}
hotfix/{deskripsi-kritis}
docs/{deskripsi-dokumentasi}
refactor/{deskripsi-refactor}
```

**Contoh**:
- `feature/FR-GIS-01-interactive-map`
- `feature/FR-AUD-06-scoring-engine`
- `fix/sbu-expiry-calculation`
- `chore/seed-40-kecamatan-geodata`

### 2.3 Aturan Pull Request (PR)

| Aturan | Detail |
| :--- | :--- |
| **Ukuran PR** | Maks 400 LOC perubahan (tidak termasuk auto-generated) |
| **Review Wajib** | Minimal 1 approval dari reviewer sebelum merge |
| **Status Check** | CI pipeline (lint, test, build) harus hijau ✅ |
| **Squash Merge** | Semua PR di-squash merge ke `develop` |
| **Template PR** | Wajib mengisi template: deskripsi, screenshot, FR ID |
| **Label** | Setiap PR wajib memiliki label (`feature`, `fix`, `chore`) |

---

## 3. Commit Convention

Mengikuti standar **Conventional Commits** v1.0.0:

```text
<type>(<scope>): <deskripsi singkat>

[body opsional]

[footer opsional: BREAKING CHANGE, Refs #issue]
```

### 3.1 Tipe Commit

| Type | Penggunaan |
| :--- | :--- |
| `feat` | Fitur baru (`feat(bujk): add stepper wizard registration`) |
| `fix` | Perbaikan bug (`fix(auth): resolve session timeout issue`) |
| `docs` | Perubahan dokumentasi |
| `style` | Formatting, whitespace (tanpa perubahan logika) |
| `refactor` | Refaktor kode tanpa perubahan behavior |
| `perf` | Peningkatan performa |
| `test` | Penambahan/perbaikan test |
| `chore` | Maintenance, dependency update |
| `ci` | Perubahan CI/CD pipeline |
| `build` | Perubahan build system |

### 3.2 Contoh Commit Message

```text
feat(gis): implement MapLibre GL split-view with bbox filtering

- Add MapLibre GL JS component with cluster support
- Implement dynamic bounding box filtering on map move
- Sync project table with visible map markers
- Support APBD/APBN layer toggle

Refs: FR-GIS-01, FR-GIS-02
```

---

## 4. Code Review Checklist

Reviewer wajib memeriksa item berikut sebelum approve PR:

### 4.1 Kualitas Kode
- [ ] Kode mengikuti standar `CODING_STANDARDS.md`
- [ ] Tidak ada `any` type di TypeScript (gunakan tipe eksplisit atau Zod infer)
- [ ] Error handling yang proper (tidak ada swallowed errors)
- [ ] Tidak ada hardcoded values (gunakan constants/env)
- [ ] Tidak ada kode yang di-comment-out (hapus atau buat issue)

### 4.2 Keamanan
- [ ] Input divalidasi via Zod schema (server-side wajib)
- [ ] Query database menggunakan parameterized query (Prisma)
- [ ] File upload divalidasi tipe dan ukuran
- [ ] Endpoint dilindungi guard RBAC yang sesuai
- [ ] Tidak ada secret/credential yang ter-commit

### 4.3 Testing
- [ ] Unit test untuk business logic baru
- [ ] Integration test untuk endpoint API baru
- [ ] Edge case dan error scenario tercakup

### 4.4 Performa
- [ ] Query database dioptimasi (gunakan `EXPLAIN ANALYZE` untuk query kompleks)
- [ ] Tidak ada N+1 query problem
- [ ] Asset gambar dioptimasi (WebP, lazy loading)
- [ ] React component tidak re-render berlebihan

---

## 5. CI/CD Pipeline

### 5.1 Pipeline Stages

```mermaid
graph LR
    A["🔍 Lint<br/>(ESLint + Prettier)"] --> B["🧪 Unit Test<br/>(Vitest)"]
    B --> C["🏗️ Build<br/>(Next.js + NestJS)"]
    C --> D["🔒 Security Scan<br/>(npm audit)"]
    D --> E["📦 Docker Build<br/>(Multi-stage)"]
    E --> F{"Branch?"}
    F -->|develop| G["🚀 Deploy Staging"]
    F -->|release/*| H["🚀 Deploy UAT"]
    F -->|main| I["🚀 Deploy Production"]
    G --> J["🧪 E2E Test<br/>(Playwright)"]
```

### 5.2 Quality Gates

| Gate | Threshold | Blokir Deploy? |
| :--- | :--- | :---: |
| **ESLint Errors** | 0 errors | ✅ Ya |
| **TypeScript Errors** | 0 errors | ✅ Ya |
| **Unit Test Coverage** | ≥ 70% (lines) | ✅ Ya |
| **Build Success** | Harus berhasil | ✅ Ya |
| **npm audit** | 0 critical vulnerabilities | ✅ Ya |
| **E2E Tests** | Semua pass | ✅ Ya (staging) |
| **Bundle Size** | JS < 250KB (gzip, initial) | ⚠️ Warning |

---

## 6. Environment & Secret Management

### 6.1 Variabel Lingkungan

```bash
# .env.example
# ============================================================
# APPLICATION
# ============================================================
NODE_ENV=development                    # development | staging | production
APP_PORT=4000
APP_URL=http://localhost:3000

# ============================================================
# DATABASE
# ============================================================
DATABASE_URL=postgresql://sijakon:password@localhost:5432/sijakon_db
DIRECT_URL=postgresql://sijakon:password@localhost:5432/sijakon_db

# ============================================================
# REDIS
# ============================================================
REDIS_URL=redis://localhost:6379

# ============================================================
# AUTHENTICATION
# ============================================================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ============================================================
# OBJECT STORAGE (S3 / MinIO)
# ============================================================
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio_access_key
S3_SECRET_KEY=minio_secret_key
S3_BUCKET_NAME=sijakon-files
S3_REGION=us-east-1
```

### 6.2 Aturan Secret

> [!CAUTION]
> - **JANGAN PERNAH** commit file `.env` ke repository
> - Gunakan `.env.example` sebagai template (tanpa nilai rahasia)
> - Di production, gunakan secret manager (Docker Secrets / Vault)
> - Rotasi JWT_SECRET dan API keys setiap 90 hari

---

## 7. Definition of Done (DoD)

Sebuah user story / fitur dianggap **DONE** jika memenuhi semua kriteria berikut:

| # | Kriteria | Wajib? |
| :---: | :--- | :---: |
| 1 | Kode sudah di-review dan di-approve minimal 1 reviewer | ✅ |
| 2 | Semua CI pipeline checks hijau ✅ | ✅ |
| 3 | Unit test ditulis untuk business logic | ✅ |
| 4 | Validasi input Zod tersedia di server-side | ✅ |
| 5 | RBAC guard terpasang di endpoint yang relevan | ✅ |
| 6 | Responsive design berfungsi di mobile (≥ 375px) | ✅ |
| 7 | Audit trail tercatat untuk aksi data-mutating | ✅ |
| 8 | Dokumentasi API (Swagger) diperbarui | ✅ |
| 9 | Demo berhasil di Sprint Review | ✅ |
| 10 | Tidak ada regresi di fitur sebelumnya | ✅ |

---

## 8. Komunikasi & Koordinasi Tim

### 8.1 Jadwal Meeting Rutin

| Meeting | Frekuensi | Durasi | Peserta |
| :--- | :--- | :--- | :--- |
| **Daily Standup** | Setiap hari kerja (09:00) | 15 menit | Seluruh tim development |
| **Sprint Planning** | Setiap 2 minggu (Senin) | 2 jam | Tim + Product Owner |
| **Sprint Review** | Setiap 2 minggu (Jumat) | 1 jam | Tim + PPK/DPU |
| **Sprint Retro** | Setiap 2 minggu (Jumat) | 45 menit | Tim internal |
| **Weekly Sync PPK** | Setiap Senin (14:00) | 30 menit | PM + PPK |

### 8.2 Tools Kolaborasi

| Kebutuhan | Tools |
| :--- | :--- |
| **Source Code** | GitHub / GitLab Private Repository |
| **Project Board** | GitHub Issues + Projects / Linear |
| **Komunikasi** | Slack / Microsoft Teams |
| **Dokumentasi** | Markdown di repository (`/docs`) |
| **Design** | Figma (UI mockup & prototype) |
| **API Testing** | Bruno / Postman (collection shared) |

---

## 9. Risiko & Mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Data spasial 40 kecamatan tidak tersedia/akurat | Tinggi | Sedang | Siapkan data OSM sebagai fallback; koordinasi dini dengan BIG/Bappedalitbang |
| 2 | Format data awal migrasi BUJK tidak seragam | Sedang | Sedang | Sediakan template baku Excel dan modul validasi data import |
| 3 | Performa WebGIS lambat pada data besar | Sedang | Sedang | Gunakan clustering, tile-based rendering, pagination spasial |
| 4 | Tim kurang familiar dengan TypeScript/NestJS | Sedang | Rendah | Sediakan bootcamp 3 hari di Sprint 0, pair programming |
| 5 | Scope creep dari stakeholder | Tinggi | Tinggi | Patuhi MoSCoW prioritization, semua perubahan via Change Request formal |

---

*Dokumen ini merupakan panduan kerja bersama tim dan harus dipatuhi oleh seluruh anggota tim pengembangan SIJAKON BOGOR.*
