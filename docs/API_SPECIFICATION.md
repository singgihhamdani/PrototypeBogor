# Spesifikasi Antarmuka Pemrograman Aplikasi (API) — SIJAKON BOGOR

> **RESTful API Endpoint Contract, OpenAPI 3.1 & Data Export**
> Versi: 1.1.0 | Tanggal: September 2026

---

## 1. Standar & Konvensi API

- **Base URL**: `https://sijakon.bogorkab.go.id/api/v1`
- **Format Pertukaran Data**: `application/json` (Kecuali upload file menggunakan `multipart/form-data`)
- **Autentikasi**: Bearer JWT Token (`Authorization: Bearer <token>`)
- **Penanganan Tanggal**: ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Format Standar Respons**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Operasi berhasil",
    "data": {},
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 120,
      "totalPages": 6
    }
  }
  ```

---

## 2. Modul Autentikasi & Profil (`/auth`)

### 2.1 Login Pengguna
- **Endpoint**: `POST /auth/login`
- **Akses**: Publik
- **Request Body**:
  ```json
  {
    "username": "admin_dinas",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "dGhpcy1pcy1...",
      "expiresIn": 3600,
      "user": {
        "id": "usr_98a7sd",
        "username": "admin_dinas",
        "fullName": "Budi Santoso, ST",
        "role": "ADMIN_BIDANG",
        "permissions": ["bujk:create", "bujk:verify", "gis:read", "supervision:assess"]
      }
    }
  }
  ```

### 2.2 Refresh Token
- **Endpoint**: `POST /auth/refresh`
- **Request Body**: `{ "refreshToken": "..." }`
- **Response `200 OK`**: `{ "accessToken": "...", "expiresIn": 3600 }`

---

## 3. Modul Master BUJK & SBU (`/bujk`)

### 3.1 Pendaftaran BUJK Mandiri (Stepper Wizard)
- **Endpoint**: `POST /bujk/register`
- **Akses**: Publik / Operator BUJK
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `name`: PT Maju Bersama Konstruksi
  - `entityType`: PT
  - `nib`: 1234567890123
  - `npwp`: 01.234.567.8-403.000
  - `leaderName`: Ir. Hendra Gunawan
  - `pjtName`: Agus Pratama, ST
  - `districtId`: 320101 (Cibinong)
  - `address`: Jl. Raya Pemda No. 45
  - `latitude`: -6.483912
  - `longitude`: 106.832910
  - `phone`: 081234567890
  - `email`: info@majubersama.co.id
  - `legalDocument`: [File PDF legalitas maks 5MB]
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Pendaftaran BUJK berhasil, menunggu verifikasi dinas",
    "data": {
      "bujkId": "bjk_12893812",
      "status": "PENDING_VERIFICATION",
      "submittedAt": "2026-08-21T10:00:00.000Z"
    }
  }
  ```

### 3.2 List & Filter BUJK
- **Endpoint**: `GET /bujk`
- **Query Params**:
  - `page`: 1
  - `limit`: 20
  - `search`: kata kunci (nama/NIB)
  - `status`: `APPROVED` | `PENDING_VERIFICATION`
  - `districtId`: ID kecamatan
  - `qualification`: `KECIL` | `MENENGAH` | `BESAR`
- **Response `200 OK`**: Data array BUJK terpaginasi.

### 3.3 Verifikasi Pendaftaran BUJK (Side-by-Side Reviewer)
- **Endpoint**: `PATCH /bujk/:id/verify`
- **Akses**: `SUPER_ADMIN`, `ADMIN_BIDANG`
- **Request Body**:
  ```json
  {
    "status": "APPROVED", // atau "REJECTED"
    "rejectionReason": null // diisi string jika status REJECTED
  }
  ```

### 3.4 Manajemen SBU BUJK
- `POST /bujk/:id/sbu`: Tambah data SBU baru (beserta berkas PDF)
- `GET /bujk/:id/sbu`: Riwayat & daftar SBU yang dimiliki
- `DELETE /bujk/:id/sbu/:sbuId`: Hapus data SBU

---

## 4. Modul WebGIS & Spasial (`/gis`)

### 4.1 GeoJSON Sebaran Proyek & BBox Filter
- **Endpoint**: `GET /gis/projects`
- **Akses**: Publik
- **Query Params**:
  - `bbox`: `minLng,minLat,maxLng,maxLat` (e.g. `106.70,-6.65,106.95,-6.40`)
  - `fiscalYear`: 2026
  - `budgetSource`: `APBD_KAB`
  - `status`: `ON_PROGRESS`
- **Response `200 OK` (RFC 7946 GeoJSON FeatureCollection)**:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [106.832910, -6.483912]
        },
        "properties": {
          "projectId": "prj_91283",
          "projectName": "Peningkatan Jalan Sentul - Babakan Madang",
          "contractValue": 12500000000,
          "contractorName": "PT Maju Bersama Konstruksi",
          "physicalProgress": 68.50,
          "status": "ON_PROGRESS",
          "districtName": "Babakan Madang"
        }
      }
    ]
  }
  ```

### 4.2 Import File Shapefile (.SHP)
- **Endpoint**: `POST /gis/import-shapefile`
- **Akses**: `SUPER_ADMIN`, `ADMIN_BIDANG`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `layerType`: `PROJECT_AREAS` | `DISTRICT_BOUNDARIES`
  - `shpZipFile`: [File .zip berisi .shp, .shx, .dbf, .prj]
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Shapefile berhasil diproses",
    "data": {
      "importedFeaturesCount": 40,
      "layerName": "Batas 40 Kecamatan Kab. Bogor"
    }
  }
  ```

### 4.3 Export Data Spasial ke `.SHP` / `GeoJSON`
- **Endpoint**: `GET /gis/export`
- **Query Params**:
  - `format`: `shp` | `geojson`
  - `layer`: `projects` | `bujk`
  - `year`: 2026
- **Response**: Binary File download (`Content-Type: application/zip` untuk SHP).

---

## 5. Modul Pengawasan Tertib Konstruksi (`/supervision`)

### 5.1 Penjadwalan & Instrumen SIMAK
- `POST /supervision/schedules`: Buat jadwal audit pengawasan baru
- `POST /supervision/schedules/:id/upload-simak`: Unggah formulir excel SIMAK oleh BUJK

### 5.2 Formulir Audit Digital & Live Scoring (Permen PUPR 1/2023)
- **Endpoint**: `POST /supervision/inspections`
- **Akses**: `ADMIN_BIDANG` (varian Pengawas), `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "scheduleId": "sch_128",
    "bujkId": "bjk_12893812",
    "projectId": "prj_91283",
    "checklist": {
      "businessOrder": {
        "hasValidNib": true,
        "hasValidSbu": true,
        "hasCertifiedWorkers": true,
        "submittedBusinessDev": false
      },
      "executionOrder": {
        "appliesSmkk": true,
        "standardContractUsed": true,
        "qualityAssurancePlan": true,
        "environmentalControl": true
      },
      "utilizationOrder": {
        "functionCertificate": true,
        "periodicMaintenance": true
      }
    },
    "officialMemo": "BUJK telah memenuhi 88% standar kepatuhan K3 dan administrasi."
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "inspectionId": "insp_9921",
      "businessScore": 75.00,
      "executionScore": 100.00,
      "utilizationScore": 100.00,
      "finalScore": 88.75,
      "complianceStatus": "TERTIB",
      "inspectedAt": "2026-08-21T11:30:00Z"
    }
  }
  ```

---

## 6. Modul Pelatihan, TKK & e-Certificate (`/training`)

### 6.1 Pendaftaran Peserta Pelatihan
- **Endpoint**: `POST /training/register`
- **Akses**: Publik
- **Request**: Data NIK, Identitas, Dokumen KTP, Foto, Ijazah.

### 6.2 Generator e-Certificate & QR Code Token
- **Endpoint**: `POST /training/packages/:id/issue-certificates`
- **Akses**: `SUPER_ADMIN`, `ADMIN_BIDANG`
- **Response `200 OK`**: Trigger background job BullMQ untuk render PDF sertifikat ber-QR code dan kirim notifikasi unduhan.

### 6.3 Validasi Publik QR Code Sertifikat
- **Endpoint**: `GET /training/verify/:qrToken`
- **Akses**: Publik (Tanpa Autentikasi)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "isValid": true,
    "certificate": {
      "certNumber": "600.1.2/1042/JAKON-DPUPR/2026",
      "recipientName": "Ahmad Fauzi",
      "trainingTitle": "Bimbingan Teknis Petugas Keselamatan Konstruksi (SMKK)",
      "kkniLevel": 5,
      "trainingHours": 40,
      "issuedAt": "2026-06-15",
      "organizer": "Dinas PUPR Kabupaten Bogor",
      "pdfUrl": "https://sijakon.bogorkab.go.id/storage/certs/cert_1042.pdf"
    }
  }
  ```

## 7. Modul Pelaporan & Ekspor Data (`/reports`)

### 7.1 Laporan Rekapitulasi Eksekutif
- **Endpoint**: `GET /reports/executive-summary`
- **Akses**: `SUPER_ADMIN`, `ADMIN_BIDANG`, `EKSEKUTIF`
- **Query Params**: `fiscalYear=2026`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "fiscalYear": 2026,
      "bujkSummary": {
        "total": 1240,
        "smallScale": 820,
        "mediumScale": 340,
        "largeScale": 80
      },
      "projectsSummary": {
        "totalPackages": 342,
        "totalValue": 428500000000,
        "avgPhysicalProgress": 76.4
      },
      "supervisionSummary": {
        "totalInspected": 150,
        "orderlyPct": 88.5
      }
    }
  }
  ```

### 7.2 Ekspor Data ke Excel / CSV / PDF
- **Endpoint**: `GET /reports/export`
- **Query Params**: `module=bujk&format=xlsx`
- **Response**: Binary File (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

---

*Spesifikasi API ini merupakan standar baku integrasi frontend-backend sistem SIJAKON BOGOR TA 2026.*
