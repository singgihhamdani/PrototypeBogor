# Standar Kode — SIJAKON BOGOR

> **Konvensi Penulisan Kode, Formatting & Best Practices**
> Versi: 1.0.0 | Tanggal: Agustus 2026

---

## 1. Aturan Umum TypeScript

### 1.1 Strict Mode

Seluruh codebase WAJIB menggunakan TypeScript strict mode:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

### 1.2 Aturan Type

| Aturan | Status | Contoh |
| :--- | :---: | :--- |
| Tidak boleh menggunakan `any` | 🚫 Dilarang | Gunakan `unknown` lalu narrow |
| Tidak boleh `@ts-ignore` / `@ts-expect-error` | 🚫 Dilarang | Perbaiki tipe-nya |
| Gunakan `type` untuk object shape | ✅ Wajib | `type BujkDto = { ... }` |
| Gunakan `interface` untuk class contracts | ✅ Wajib | `interface IBujkService { ... }` |
| Prefer `z.infer<typeof schema>` | ✅ Wajib | Derive types dari Zod schema |
| Return type eksplisit pada fungsi publik | ✅ Wajib | `async create(dto): Promise<Bujk>` |
| Prefer `const` over `let` | ✅ Wajib | `let` hanya jika reassignment diperlukan |
| Tidak boleh `var` | 🚫 Dilarang | Gunakan `const` atau `let` |

### 1.3 Null & Undefined Handling

```typescript
// ✅ Benar — gunakan optional chaining & nullish coalescing
const districtName = bujk?.district?.name ?? 'Tidak diketahui';

// ✅ Benar — explicit null check
if (bujk === null) {
  throw new NotFoundException('BUJK tidak ditemukan');
}

// 🚫 Salah — loose equality check
if (bujk == null) { ... }

// 🚫 Salah — truthy check yang bisa false positive
if (bujk) { ... }  // 0, '', false juga falsy!
```

---

## 2. Formatting & Linting

### 2.1 Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 2.2 ESLint Configuration (Highlights)

```javascript
// .eslintrc.js (key rules)
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/strict-type-checked',
    'prettier',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    
    // React
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
    }],
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

---

## 3. Standar React & Next.js

### 3.1 Aturan Komponen

```tsx
// ✅ Benar — functional component dengan named export
export function BujkCard({ bujk, onEdit }: BujkCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{bujk.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ... */}
      </CardContent>
    </Card>
  );
}

// 🚫 Salah — default export untuk komponen non-page
export default function BujkCard() { ... }

// 🚫 Salah — class component
class BujkCard extends React.Component { ... }
```

### 3.2 Props Type Definition

```tsx
// ✅ Benar — props type langsung di file komponen
type BujkCardProps = {
  bujk: BujkListItem;
  onEdit: (id: string) => void;
  isLoading?: boolean;
  className?: string;
};

// ✅ Benar — menggunakan React.ComponentPropsWithoutRef untuk extending
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
};
```

### 3.3 Server Components vs Client Components

```tsx
// ✅ Server Component (default di App Router) — untuk data fetching
// app/(dashboard)/bujk/page.tsx
import { getBujkList } from '@/lib/api/bujk';

export default async function BujkPage() {
  const bujkList = await getBujkList();  // Server-side fetch
  return <BujkTable data={bujkList} />;
}

// ✅ Client Component — untuk interaktivitas
// components/bujk/bujk-filter.tsx
'use client';

import { useState } from 'react';

export function BujkFilter({ onFilter }: BujkFilterProps) {
  const [search, setSearch] = useState('');
  // ...
}
```

### 3.4 Custom Hooks

```typescript
// ✅ Benar — hook fokus pada satu concern
export function useBujkList(params: BujkListParams) {
  const [data, setData] = useState<BujkListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetch logic
  }, [params]);

  return { data, isLoading, error } as const;
}

// 🚫 Salah — hook yang melakukan terlalu banyak hal
export function useBujkEverything() {
  // list, detail, create, update, delete, filter, sort...
}
```

---

## 4. Standar NestJS Backend

### 4.1 Module Organization

Setiap domain module HARUS mengikuti struktur berikut:

```text
modules/bujk/
├── bujk.module.ts          # Module declaration
├── bujk.controller.ts      # HTTP layer (thin, delegasi ke service)
├── bujk.service.ts          # Business logic (bulk of code here)
├── bujk.repository.ts       # Data access (opsional jika Prisma cukup)
├── dto/
│   ├── create-bujk.dto.ts   # Create request DTO
│   ├── update-bujk.dto.ts   # Update request DTO
│   └── bujk-query.dto.ts    # Query/filter params DTO
├── guards/
│   └── bujk-owner.guard.ts  # Domain-specific guard
├── interfaces/
│   └── bujk.interface.ts    # Service interface
└── __tests__/
    ├── bujk.service.spec.ts
    └── bujk.controller.spec.ts
```

### 4.2 Controller Rules

```typescript
// ✅ Controller HARUS tipis — hanya menerima request, validasi, dan delegasi
@Controller('api/bujk')
export class BujkController {
  @Get()
  async findAll(@Query() query: BujkQueryDto) {
    return this.bujkService.findAll(query);  // Delegasi ke service
  }
}

// 🚫 Controller TIDAK BOLEH berisi business logic
@Controller('api/bujk')
export class BujkController {
  @Get()
  async findAll(@Query() query: BujkQueryDto) {
    const bujks = await this.prisma.bujkMaster.findMany({...}); // ❌ Langsung query
    const filtered = bujks.filter(b => b.status === 'ACTIVE');  // ❌ Logic di controller
    return filtered.map(b => ({ ...b, score: b.x * 0.7 }));    // ❌ Transformasi
  }
}
```

### 4.3 Service Rules

```typescript
// ✅ Service berisi SEMUA business logic
@Injectable()
export class BujkService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BujkQueryDto): Promise<PaginatedResult<BujkListItem>> {
    const { page = 1, limit = 20, search, status, districtId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BujkMasterWhereInput = {
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nib: { contains: search } },
        ],
      } : {}),
      ...(status ? { status } : {}),
      ...(districtId ? { districtId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.bujkMaster.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.bujkMaster.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

---

## 5. Standar Database & Prisma

### 5.1 Prisma Schema Convention

```prisma
// schema.prisma

model BujkMaster {
  id           String       @id @default(cuid())
  name         String       @db.VarChar(255)
  entityType   EntityType
  npwp         String       @unique @db.VarChar(16)
  nib          String       @unique @db.VarChar(13)
  leaderName   String       @db.VarChar(255) @map("leader_name")
  pjtName      String       @db.VarChar(255) @map("pjt_name")
  address      String       @db.Text
  districtId   Int          @map("district_id")
  status       BujkStatus   @default(DRAFT)
  
  // Spatial — menggunakan raw SQL / extension
  // geomLocation dikelola via @turf/turf dan raw query
  
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")
  createdBy    String       @map("created_by")

  // Relations
  district     District     @relation(fields: [districtId], references: [id])
  sbuList      BujkSbu[]
  experiences  BujkExperience[]
  projects     BujkProject[]

  @@map("bujk_master")
  @@index([status])
  @@index([districtId])
}

enum EntityType {
  PT
  CV
  PO
  KOPERASI
}

enum BujkStatus {
  DRAFT
  PENDING_VERIFICATION
  APPROVED
  REJECTED
  SUSPENDED
}
```

### 5.2 Migration Rules

| Aturan | Detail |
| :--- | :--- |
| **Naming** | `npx prisma migrate dev --name add_bujk_master_table` |
| **Destructive Changes** | WAJIB diskusi tim sebelum drop column/table |
| **Data Migration** | Buat script terpisah di `database/seed/` |
| **PostGIS Setup** | Inisialisasi via `CREATE EXTENSION IF NOT EXISTS postgis;` |

---

## 6. Standar Testing

### 6.1 Naming Convention

```typescript
// ✅ Benar — describe yang jelas, test case deskriptif
describe('BujkService', () => {
  describe('create', () => {
    it('should create BUJK with DRAFT status when valid data provided', async () => {
      // ...
    });

    it('should throw ConflictException when NIB already exists', async () => {
      // ...
    });

    it('should create audit log entry on successful creation', async () => {
      // ...
    });
  });
});

// 🚫 Salah — vague test names
describe('BujkService', () => {
  it('should work', () => { ... });
  it('test create', () => { ... });
});
```

### 6.2 Test Structure (AAA Pattern)

```typescript
it('should calculate audit score correctly', () => {
  // Arrange
  const checklist = {
    businessOrder: [true, true, false, true, true],  // 4/5
    executionOrder: [true, true, true],               // 3/3
    utilizationOrder: [true, false],                   // 1/2
  };

  // Act
  const result = calculateAuditScore(checklist);

  // Assert
  expect(result.businessScore).toBe(80);
  expect(result.executionScore).toBe(100);
  expect(result.utilizationScore).toBe(50);
  expect(result.finalScore).toBeCloseTo(76.67, 1);
  expect(result.status).toBe('CUKUP_TERTIB');
});
```

### 6.3 Test Coverage Targets

| Layer | Target | Prioritas Test |
| :--- | :---: | :--- |
| **Service (Business Logic)** | ≥ 80% | Scoring engine, validasi bisnis, kalkulasi |
| **Controller (Integration)** | ≥ 70% | RBAC guard, input validation, response shape |
| **Utility Functions** | ≥ 90% | Formatters, parsers, helpers |
| **React Components** | ≥ 60% | Form validation, conditional rendering |
| **E2E (Critical Paths)** | 100% | Login → BUJK Register → Verifikasi → Audit |

---

## 7. Import Order Convention

```typescript
// 1. Node.js built-in modules
import { readFileSync } from 'node:fs';
import path from 'node:path';

// 2. External packages (alphabetical)
import { Controller, Get, Post } from '@nestjs/common';
import { z } from 'zod';

// 3. Internal packages (monorepo)
import type { CreateBujkDto } from '@shared-types/schemas/bujk.schema';

// 4. Parent directory imports
import { PrismaService } from '../../database/prisma.service';

// 5. Sibling/local imports
import { BujkService } from './bujk.service';
import { calculateAuditScore } from './utils';

// 6. Type-only imports (always use `import type`)
import type { AuthenticatedRequest } from '@/common/interfaces';
```

---

## 8. Comment & Documentation Convention

### 8.1 Kapan Menulis Komentar

```typescript
// ✅ Benar — jelaskan MENGAPA, bukan APA
// Scoring formula berdasarkan Lampiran B Permen PUPR No. 1/2023
// Bobot: Tertib Usaha (40%), Penyelenggaraan (35%), Pemanfaatan (25%)
const finalScore =
  businessScore * 0.4 +
  executionScore * 0.35 +
  utilizationScore * 0.25;

// ✅ Benar — warning tentang edge case
// PERINGATAN: PostGIS ST_Distance mengembalikan meter jika menggunakan geography type,
// tapi derajat jika menggunakan geometry type. Selalu cast ke ::geography.

// 🚫 Salah — komentar yang hanya mengulang kode
// Set name to dto.name
this.name = dto.name;

// 🚫 Salah — komentar TODO tanpa issue reference
// TODO: fix this later
```

### 8.2 JSDoc untuk Public API

```typescript
/**
 * Menghitung skor kepatuhan audit berdasarkan checklist pengawasan.
 * Formula scoring mengikuti ketentuan Permen PUPR No. 1/2023 Lampiran B.
 *
 * @param checklist - Objek berisi array boolean untuk setiap kategori tertib
 * @returns Objek skor per-kategori, skor akhir, dan status kepatuhan
 *
 * @example
 * ```ts
 * const result = calculateAuditScore({
 *   businessOrder: [true, true, false, true, true],
 *   executionOrder: [true, true, true],
 *   utilizationOrder: [true, false],
 * });
 * // result.finalScore = 76.67
 * // result.status = 'CUKUP_TERTIB'
 * ```
 */
export function calculateAuditScore(checklist: AuditChecklist): AuditScoreResult {
  // ...
}
```

---

## 9. Performance Best Practices

### 9.1 Database

```typescript
// ✅ Benar — gunakan select untuk membatasi kolom
const bujkList = await prisma.bujkMaster.findMany({
  select: { id: true, name: true, nib: true, status: true },
  take: 20,
});

// 🚫 Salah — select semua kolom tanpa batasan
const bujkList = await prisma.bujkMaster.findMany();

// ✅ Benar — parallel queries
const [bujks, total] = await Promise.all([
  prisma.bujkMaster.findMany({ ... }),
  prisma.bujkMaster.count({ ... }),
]);

// 🚫 Salah — sequential queries
const bujks = await prisma.bujkMaster.findMany({ ... });
const total = await prisma.bujkMaster.count({ ... });
```

### 9.2 React

```tsx
// ✅ Benar — lazy load komponen berat
const MapView = dynamic(() => import('@/components/maps/map-view'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// ✅ Benar — useMemo untuk kalkulasi berat
const sortedBujks = useMemo(
  () => bujks.sort((a, b) => b.contractValue - a.contractValue),
  [bujks],
);

// ✅ Benar — image optimization
import Image from 'next/image';
<Image src="/logo.png" width={120} height={40} alt="SIJAKON Logo" />
```

---

*Standar kode ini bersifat wajib untuk seluruh anggota tim. Pelanggaran akan ditangkap oleh ESLint/Prettier di CI pipeline.*
