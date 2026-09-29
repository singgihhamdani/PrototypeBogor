# Panduan Agen Pengembangan — SIJAKON BOGOR

> **Instruksi untuk AI Agent & Developer dalam membangun SIJAKON BOGOR**
> Versi: 1.1.0 | Tanggal: September 2026

---

## 1. Konteks Proyek

Kamu adalah agen pengembang yang membangun **SIJAKON BOGOR** — Sistem Informasi Pembinaan & Pengawasan Jasa Konstruksi untuk Kabupaten Bogor, Provinsi Jawa Barat, Tahun Anggaran 2026.

### 1.1 Referensi Utama

Sebelum mulai mengerjakan task apapun, **WAJIB** baca dan pahami dokumen-dokumen berikut:

| Dokumen | Path | Deskripsi |
| :--- | :--- | :--- |
| **PRD Rekomendasi** | `PRD_REKOMENDASI_JAKON_BOGOR_2026.md` | Spesifikasi fungsional lengkap |
| **Arsitektur** | `docs/ARCHITECTURE.md` | Arsitektur teknis & stack |
| **Metodologi** | `docs/METHODOLOGY.md` | Workflow & standar kerja |
| **Coding Standards** | `docs/CODING_STANDARDS.md` | Konvensi kode |
| **API Spec** | `docs/API_SPECIFICATION.md` | Kontrak API endpoint |
| **Database Schema** | `docs/DATABASE_SCHEMA.md` | Skema database & relasi |
| **Security** | `docs/SECURITY_POLICY.md` | Kebijakan keamanan |

### 1.2 Prinsip Utama

1. **Type Safety First** — Seluruh kode HARUS TypeScript strict mode. Tidak ada `any`.
2. **Schema-Driven** — Validasi input SELALU menggunakan Zod. Definisi di `packages/shared-types/`.
3. **Security by Default** — Setiap endpoint terproteksi RBAC guard. Audit trail untuk semua mutasi data.
4. **Spatial-Aware** — Data lokasi tersimpan sebagai PostGIS geometry. Gunakan `ST_*` functions.
5. **Mobile-First** — Semua UI responsive mulai dari 375px. Admin Bidang (varian Pengawas) bekerja di lapangan.
6. **Role-Aware** — Selalu pertimbangkan 6 peran sistem saat membangun fitur. Lihat Bagian 9.

### 1.3 Struktur Peran Sistem (6 Peran)

Sistem memiliki **6 peran** (5 login + 1 publik). Pahami ini sebelum mengerjakan task apapun:

| # | Kode Role | Nama | Sifat | Deskripsi |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `SUPER_ADMIN` | Super Admin | Internal | Full access. Kelola user, RBAC, audit trail, sistem. |
| 2 | `ADMIN_BIDANG` | Admin Bidang | Internal | Operator dinas — permission dikonfigurasi via RBAC per bidang. Mencakup varian: *Operator Bina Konstruksi*, *Operator Pelatihan*, dan *Tim Pengawas/Asesor*. |
| 3 | `EKSEKUTIF` | Eksekutif | Internal | **Read-only** — dashboard, laporan, peta. Kepala Dinas, PPK, Bupati. |
| 4 | `OPERATOR_BUJK` | Operator BUJK | Eksternal | Portal mandiri kontraktor. Tenant-scoped (`bujk_id`). Self-register. |
| 5 | `PESERTA_TKK` | Peserta TKK | Eksternal | Portal peserta pelatihan. Self-register. |
| 6 | — | Publik / Visitor | Tanpa Login | Halaman publik: peta, regulasi, berita, validasi QR. |

**PENTING:**
- `ADMIN_BIDANG` adalah satu role di database, **bukan** 3 role terpisah. Variannya dikontrol via `role_permissions`.
- `OPERATOR_BUJK` harus selalu di-filter `WHERE bujk_id = current_user.bujk_id` (tenant isolation).
- `EKSEKUTIF` tidak boleh memiliki permission `CREATE`, `UPDATE`, atau `DELETE` pada data operasional.
- Endpoint publik (registrasi BUJK, registrasi pelatihan, validasi QR, WebGIS publik) **tidak memerlukan autentikasi**.

---

## 2. Cara Mengerjakan Task

### 2.1 Workflow Standar

```text
1. BACA    → Pahami FR-ID terkait dari PRD_REKOMENDASI_JAKON_BOGOR_2026.md
2. ANALISIS → Identifikasi modul, entity, endpoint, dan UI yang terlibat
3. SCHEMA  → Pastikan Prisma schema sudah mendukung (atau buat migrasi baru)
4. BACKEND → Buat module NestJS: Controller → Service → Repository
5. TYPES   → Definisikan DTO & Zod schema di shared-types
6. FRONTEND→ Buat halaman/komponen Next.js dengan Shadcn UI
7. TEST    → Tulis unit test untuk business logic
8. REVIEW  → Verifikasi RBAC, validasi, dan audit trail
```

### 2.2 Checklist Per-Task

Sebelum menganggap task selesai, pastikan:

- [ ] Kode TypeScript strict (no `any`, no `@ts-ignore`)
- [ ] Validasi Zod di server-side (client optional tapi direkomendasikan)
- [ ] RBAC guard terpasang sesuai peran yang diizinkan
- [ ] Audit trail dicatat untuk operasi CREATE, UPDATE, DELETE
- [ ] Responsive di desktop (1440px) dan mobile (375px)
- [ ] Loading state menggunakan skeleton/shimmer
- [ ] Error state ditampilkan dengan toast notification
- [ ] Data spasial menggunakan PostGIS geometry type
- [ ] File upload ke Object Storage (bukan database)

---

## 3. Konvensi Penamaan

### 3.1 File & Direktori

```text
# Frontend (Next.js)
app/(dashboard)/bujk/page.tsx          # Halaman list
app/(dashboard)/bujk/[id]/page.tsx     # Halaman detail
app/(dashboard)/bujk/create/page.tsx   # Halaman create
components/bujk/bujk-table.tsx         # Komponen tabel
components/bujk/bujk-form-wizard.tsx   # Komponen form
hooks/use-bujk.ts                      # Custom hook

# Backend (NestJS)
modules/bujk/bujk.module.ts           # Module declaration
modules/bujk/bujk.controller.ts       # HTTP handlers
modules/bujk/bujk.service.ts          # Business logic
modules/bujk/bujk.repository.ts       # Data access
modules/bujk/dto/create-bujk.dto.ts   # DTO definition
modules/bujk/guards/bujk-owner.guard.ts # Custom guard

# Shared Types
packages/shared-types/src/dto/bujk.dto.ts
packages/shared-types/src/schemas/bujk.schema.ts
packages/shared-types/src/enums/bujk-status.enum.ts
```

### 3.2 Naming Convention

| Elemen | Konvensi | Contoh |
| :--- | :--- | :--- |
| **File** | kebab-case | `bujk-registration-form.tsx` |
| **Komponen React** | PascalCase | `BujkRegistrationForm` |
| **Hook** | camelCase dengan prefix `use` | `useBujkList` |
| **Variabel & Fungsi** | camelCase | `calculateAuditScore` |
| **Konstanta** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE_MB` |
| **Tipe & Interface** | PascalCase | `BujkCreateDto` |
| **Enum** | PascalCase | `BujkStatus.APPROVED` |
| **Tabel Database** | snake_case | `bujk_master` |
| **Kolom Database** | snake_case | `created_at` |
| **API Endpoint** | kebab-case | `/api/bujk-master/:id` |
| **Environment Variable** | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## 4. Pola Kode Standar (Code Patterns)

### 4.1 NestJS Module Pattern

```typescript
// modules/bujk/bujk.module.ts
import { Module } from '@nestjs/common';
import { BujkController } from './bujk.controller';
import { BujkService } from './bujk.service';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BujkController],
  providers: [BujkService],
  exports: [BujkService],
})
export class BujkModule {}
```

### 4.2 Controller Pattern (dengan RBAC & Validation)

```typescript
// modules/bujk/bujk.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuditLog } from '@/common/decorators/audit-log.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { createBujkSchema, CreateBujkDto } from '@shared-types/schemas/bujk.schema';
import { BujkService } from './bujk.service';

@Controller('api/bujk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BujkController {
  constructor(private readonly bujkService: BujkService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_BIDANG', 'OPERATOR_BUJK')
  @AuditLog({ module: 'BUJK', action: 'CREATE' })
  async create(
    @Body(new ZodValidationPipe(createBujkSchema)) dto: CreateBujkDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bujkService.create(dto, req.user);
  }

  // Contoh endpoint khusus Eksekutif (read-only)
  @Get('summary')
  @Roles('SUPER_ADMIN', 'ADMIN_BIDANG', 'EKSEKUTIF')
  async getSummary(@Query() query: BujkSummaryQueryDto) {
    return this.bujkService.getSummary(query);
  }
}
```

### 4.3 Service Pattern (Business Logic)

```typescript
// modules/bujk/bujk.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateBujkDto } from '@shared-types/schemas/bujk.schema';

@Injectable()
export class BujkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBujkDto, user: AuthUser) {
    // Check NIB uniqueness
    const existing = await this.prisma.bujkMaster.findUnique({
      where: { nib: dto.nib },
    });

    if (existing) {
      throw new ConflictException(`BUJK dengan NIB ${dto.nib} sudah terdaftar`);
    }

    return this.prisma.bujkMaster.create({
      data: {
        ...dto,
        status: 'DRAFT',
        geomLocation: dto.latitude && dto.longitude
          ? { type: 'Point', coordinates: [dto.longitude, dto.latitude] }
          : undefined,
        createdBy: user.id,
      },
    });
  }
}
```

### 4.4 Zod Schema Pattern (Shared Types)

```typescript
// packages/shared-types/src/schemas/bujk.schema.ts
import { z } from 'zod';

export const createBujkSchema = z.object({
  name: z.string().min(3, 'Nama BUJK minimal 3 karakter').max(255),
  entityType: z.enum(['PT', 'CV', 'PO', 'KOPERASI']),
  npwp: z.string().regex(/^\d{15,16}$/, 'Format NPWP tidak valid'),
  nib: z.string().regex(/^\d{13}$/, 'NIB harus 13 digit'),
  leaderName: z.string().min(2),
  pjtName: z.string().min(2),
  address: z.string().min(10),
  districtId: z.number().int().positive(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().regex(/^08\d{8,12}$/, 'Nomor telepon tidak valid'),
  email: z.string().email('Format email tidak valid'),
});

export type CreateBujkDto = z.infer<typeof createBujkSchema>;

export const bujkStatusEnum = z.enum([
  'DRAFT',
  'PENDING_VERIFICATION',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
]);

export type BujkStatus = z.infer<typeof bujkStatusEnum>;
```

### 4.5 React Page Pattern (Next.js App Router)

```tsx
// app/(dashboard)/bujk/page.tsx
import { Suspense } from 'react';
import { BujkTable } from '@/components/bujk/bujk-table';
import { BujkTableSkeleton } from '@/components/bujk/bujk-table-skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function BujkListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Master BUJK"
        description="Daftar Badan Usaha Jasa Konstruksi terdaftar di Kabupaten Bogor"
      >
        <Button asChild>
          <Link href="/bujk/create">
            <Plus className="mr-2 h-4 w-4" />
            Daftarkan BUJK
          </Link>
        </Button>
      </PageHeader>

      <Suspense fallback={<BujkTableSkeleton />}>
        <BujkTable />
      </Suspense>
    </div>
  );
}
```

### 4.6 API Client Pattern (Frontend)

```typescript
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || 'Terjadi kesalahan');
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ... put, patch, delete
}

export const apiClient = new ApiClient();
```

---

## 5. Konvensi Spasial (GIS)

### 5.1 Aturan Data Spasial

| Aturan | Detail |
| :--- | :--- |
| **SRID** | Selalu gunakan **EPSG:4326** (WGS84) untuk penyimpanan |
| **Format Internal** | PostGIS `geometry(Point, 4326)` atau `geometry(Polygon, 4326)` |
| **Format Transfer** | GeoJSON (RFC 7946) untuk API response |
| **Import SHP** | Parse via `shpjs` → konversi ke GeoJSON → insert via `ST_GeomFromGeoJSON` |
| **Export SHP** | Query PostGIS → GeoJSON → konversi via `@mapbox/shp-write` |
| **Clustering** | Gunakan Supercluster (client-side) atau `ST_ClusterDBSCAN` (server-side) |

### 5.2 Contoh Query Spasial

```sql
-- Cari proyek dalam bounding box (untuk WebGIS split-view)
SELECT id, project_name, contract_val, phys_prog,
       ST_AsGeoJSON(geom_area) as geojson
FROM bujk_projects
WHERE ST_Intersects(
    geom_area,
    ST_MakeEnvelope($1, $2, $3, $4, 4326)  -- minLng, minLat, maxLng, maxLat
)
AND fiscal_year = $5
ORDER BY contract_val DESC
LIMIT 100;

-- Cari BUJK dalam radius 5 km dari titik tertentu
SELECT id, name, qualification,
       ST_Distance(
           geom_location::geography,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       ) as distance_m
FROM bujk_master
WHERE ST_DWithin(
    geom_location::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    5000  -- 5 km radius
)
ORDER BY distance_m;
```

---

## 6. Error Handling Convention

### 6.1 HTTP Status Codes

| Status | Kapan Digunakan |
| :--- | :--- |
| `200 OK` | GET berhasil, UPDATE berhasil |
| `201 Created` | POST berhasil membuat resource baru |
| `204 No Content` | DELETE berhasil |
| `400 Bad Request` | Validasi input gagal (Zod error) |
| `401 Unauthorized` | Token JWT tidak valid / expired |
| `403 Forbidden` | User tidak memiliki permission |
| `404 Not Found` | Resource tidak ditemukan |
| `409 Conflict` | Duplikasi data (NIB, username, dll) |
| `422 Unprocessable Entity` | Business rule violation |
| `500 Internal Server Error` | Unexpected server error |

### 6.2 Error Response Format

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validasi gagal",
  "details": [
    {
      "field": "nib",
      "message": "NIB harus 13 digit"
    },
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ],
  "timestamp": "2026-08-21T10:30:00.000Z",
  "path": "/api/bujk"
}
```

---

## 7. Audit Trail Convention

Semua operasi yang mengubah data (CREATE, UPDATE, DELETE) WAJIB dicatat ke tabel `audit_logs`:

```typescript
// Gunakan decorator @AuditLog
@Post()
@AuditLog({ module: 'BUJK', action: 'CREATE' })
async create(@Body() dto: CreateBujkDto) { ... }

@Patch(':id')
@AuditLog({ module: 'BUJK', action: 'UPDATE' })
async update(@Param('id') id: string, @Body() dto: UpdateBujkDto) { ... }

@Delete(':id')
@AuditLog({ module: 'BUJK', action: 'DELETE' })
async remove(@Param('id') id: string) { ... }
```

Format log yang dicatat:

```json
{
  "userId": "uuid",
  "action": "UPDATE",
  "module": "BUJK",
  "recordId": "target-uuid",
  "oldValues": { "name": "PT Lama" },
  "newValues": { "name": "PT Baru" },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-08-21T10:30:00.000Z"
}
```

---

## 8. Prioritas Pengerjaan

Ketika ada banyak task, ikuti urutan prioritas berikut:

1. 🔴 **Security fixes** — Kerentanan keamanan
2. 🟠 **Bug fixes** — Fitur rusak/tidak berjalan
3. 🟡 **Must Have [M]** — Fitur FR berprioritas M dari PRD
4. 🔵 **Should Have [S]** — Fitur FR berprioritas S dari PRD
5. 🟢 **Could Have [C]** — Fitur nice-to-have
6. ⚪ **Technical debt** — Refactor, optimasi

---

## 9. Panduan Implementasi Role & RBAC

### 9.1 Aturan Role dalam Kode

Ketika menulis guard/decorator RBAC, gunakan kode role sesuai enum berikut:

```typescript
// packages/shared-types/src/enums/role.enum.ts
export enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_BIDANG = 'ADMIN_BIDANG',
  EKSEKUTIF = 'EKSEKUTIF',
  OPERATOR_BUJK = 'OPERATOR_BUJK',
  PESERTA_TKK = 'PESERTA_TKK',
}
```

### 9.2 Pola Guard per Tipe Endpoint

```typescript
// Endpoint data-mutating (Create/Update/Delete)
@Roles('SUPER_ADMIN', 'ADMIN_BIDANG')           // Internal only

// Endpoint data-mutating oleh BUJK sendiri
@Roles('SUPER_ADMIN', 'ADMIN_BIDANG', 'OPERATOR_BUJK')
// + TenantGuard: pastikan req.user.bujkId === target.bujkId

// Endpoint read-only dashboard/laporan
@Roles('SUPER_ADMIN', 'ADMIN_BIDANG', 'EKSEKUTIF')

// Endpoint publik (tanpa guard)
// Tidak pakai @UseGuards(JwtAuthGuard, RolesGuard)

// Endpoint peserta TKK
@Roles('SUPER_ADMIN', 'ADMIN_BIDANG', 'PESERTA_TKK')
```

### 9.3 Tenant Isolation untuk OPERATOR_BUJK

Selalu terapkan filter `bujk_id` untuk Operator BUJK:

```typescript
// Di service layer
async findProjects(user: AuthUser) {
  const where: Prisma.BujkProjectWhereInput = {};
  
  // Tenant isolation: BUJK hanya lihat data sendiri
  if (user.role === RoleCode.OPERATOR_BUJK) {
    where.bujkId = user.bujkId;
  }
  
  return this.prisma.bujkProject.findMany({ where });
}
```

### 9.4 Frontend Route Protection

```typescript
// Middleware atau layout guard di Next.js
const routePermissions: Record<string, RoleCode[]> = {
  '/dashboard':     ['SUPER_ADMIN', 'ADMIN_BIDANG', 'EKSEKUTIF'],
  '/bujk':          ['SUPER_ADMIN', 'ADMIN_BIDANG', 'OPERATOR_BUJK'],
  '/pengawasan':    ['SUPER_ADMIN', 'ADMIN_BIDANG'],
  '/pelatihan':     ['SUPER_ADMIN', 'ADMIN_BIDANG'],
  '/pelaporan':     ['SUPER_ADMIN', 'ADMIN_BIDANG', 'EKSEKUTIF'],
  '/pengaturan':    ['SUPER_ADMIN'],
  '/portal/bujk':   ['OPERATOR_BUJK'],
  '/portal/peserta':['PESERTA_TKK'],
};
```

### 9.5 Seed Data Wajib

Pastikan migration/seed selalu menyertakan 5 role default:

```sql
INSERT INTO roles (code, name, description, is_system) VALUES
  ('SUPER_ADMIN',   'Super Admin',       'Full access seluruh sistem',                    TRUE),
  ('ADMIN_BIDANG',  'Admin Bidang',      'Operator dinas — permission per bidang via RBAC', TRUE),
  ('EKSEKUTIF',     'Eksekutif',         'Read-only dashboard & laporan',                  TRUE),
  ('OPERATOR_BUJK', 'Operator BUJK',     'Portal mandiri kontraktor (tenant-scoped)',      TRUE),
  ('PESERTA_TKK',   'Peserta TKK',       'Portal peserta pelatihan & sertifikasi',         TRUE);
```

---

*Dokumen ini adalah panduan utama bagi setiap developer dan AI agent yang bekerja pada proyek SIJAKON BOGOR. Patuhi konvensi ini untuk menjaga konsistensi dan kualitas codebase.*
