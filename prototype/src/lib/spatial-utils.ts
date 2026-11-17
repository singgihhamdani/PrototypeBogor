import * as XLSX from "xlsx";
import districtsData from "@/data/districts.json";

export interface SpatialValidationResult {
  isValid: boolean;
  status: "VALID" | "SWAPPED" | "OUT_OF_BOUNDS" | "INVALID";
  message: string;
  isSwapped?: boolean;
  correctedLat?: number;
  correctedLng?: number;
}

export interface ParsedSpatialRecord {
  tempId: string;
  name: string;
  category?: string;
  district: string;
  districtId: string;
  address: string;
  lat: number;
  lng: number;
  contractValue: number;
  contractor: string;
  nib?: string;
  qualification?: "Besar" | "Menengah" | "Kecil";
  physProgress?: number;
  source?: string;
  validation: SpatialValidationResult;
  raw: Record<string, any>;
}

// =============================================================================
// 1. GEOFENCING VALIDATOR KABUPATEN BOGOR
// Batas Geografis Resmi Kabupaten Bogor:
// Lat: -6.85 s/d -6.30 | Lng: 106.40 s/d 107.15
// =============================================================================

export const BOGOR_BOUNDS = {
  minLat: -6.85,
  maxLat: -6.30,
  minLng: 106.40,
  maxLng: 107.15
};

export function validateBogorCoordinates(lat: number, lng: number): SpatialValidationResult {
  if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
    return {
      isValid: false,
      status: "INVALID",
      message: "Koordinat tidak valid atau bukan angka numerik."
    };
  }

  // Deteksi jika koordinat tertukar (Lat terisi nilai Lng ~106, dan Lng terisi nilai Lat ~-6)
  if (
    lat >= BOGOR_BOUNDS.minLng && lat <= BOGOR_BOUNDS.maxLng &&
    lng >= BOGOR_BOUNDS.minLat && lng <= BOGOR_BOUNDS.maxLat
  ) {
    return {
      isValid: false,
      status: "SWAPPED",
      isSwapped: true,
      message: "Koordinat terbalik! Latitude bernilai Longitude (>100) dan Longitude bernilai Latitude (<0).",
      correctedLat: lng,
      correctedLng: lat
    };
  }

  // Pengecekan rentang koordinat Kabupaten Bogor
  if (
    lat >= BOGOR_BOUNDS.minLat && lat <= BOGOR_BOUNDS.maxLat &&
    lng >= BOGOR_BOUNDS.minLng && lng <= BOGOR_BOUNDS.maxLng
  ) {
    return {
      isValid: true,
      status: "VALID",
      message: "Koordinat berada tepat di dalam wilayah administratif Kabupaten Bogor."
    };
  }

  return {
    isValid: false,
    status: "OUT_OF_BOUNDS",
    message: `Koordinat [${lat.toFixed(5)}, ${lng.toFixed(5)}] berada di luar rentang geografis Kabupaten Bogor (Lat: -6.85 s/d -6.30, Lng: 106.40 s/d 107.15).`
  };
}

/**
 * Mencari kecamatan terdekat atau mencocokkan string nama kecamatan ke master kecamatan
 */
export function matchDistrict(districtInput?: string, lat?: number, lng?: number): { id: string; name: string } {
  const cleanInput = (districtInput || "").toLowerCase().trim();

  // 1. Coba kecocokan nama
  if (cleanInput) {
    const found = districtsData.find(
      (d) => d.name.toLowerCase() === cleanInput || cleanInput.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(cleanInput)
    );
    if (found) return { id: found.id, name: found.name };
  }

  // 2. Jika koordinat tersedia, cari kecamatan terdekat berdasarkan jarak Euclidean
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    let closestDist = Infinity;
    let closest = districtsData[0];

    for (const d of districtsData) {
      const dist = Math.hypot(d.lat - lat, d.lng - lng);
      if (dist < closestDist) {
        closestDist = dist;
        closest = d;
      }
    }
    return { id: closest.id, name: closest.name };
  }

  return { id: "01", name: "Cibinong" };
}

// =============================================================================
// 2. PARSER UNTUK EXCEL (.xlsx, .xls) & CSV (.csv)
// =============================================================================

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractValue(row: Record<string, any>, candidates: string[]): any {
  const rowKeys = Object.keys(row);
  for (const candidate of candidates) {
    const normCand = normalizeKey(candidate);
    const matchedKey = rowKeys.find((k) => normalizeKey(k) === normCand || normalizeKey(k).includes(normCand));
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== "") {
      return row[matchedKey];
    }
  }
  return undefined;
}

export function processRawRows(rawRows: Record<string, any>[], defaultLayer: "projects" | "bujk" = "projects"): ParsedSpatialRecord[] {
  return rawRows.map((row, idx) => {
    // Ekstraksi Nilai Kolom dengan sinonim fleksibel
    const rawName = extractValue(row, ["nama_paket", "nama_badan_usaha", "nama", "nama_kegiatan", "nama_proyek", "objek", "name", "title"]) || `Data Titik #${idx + 1}`;
    const rawCategory = extractValue(row, ["kategori", "jenis", "subsektor", "bentuk_usaha", "tipe", "type", "category"]) || (defaultLayer === "projects" ? "Pekerjaan Konstruksi" : "PT");
    const rawDistrict = extractValue(row, ["kecamatan", "wilayah", "district", "lokasi_kecamatan"]);
    const rawAddress = extractValue(row, ["alamat", "lokasi", "alamat_lengkap", "address", "jalan"]) || "Kabupaten Bogor";
    
    // Ekstraksi Koordinat
    let latVal = parseFloat(String(extractValue(row, ["latitude", "lat", "lintang", "y", "koordinat_lat"]) || ""));
    let lngVal = parseFloat(String(extractValue(row, ["longitude", "lng", "lon", "long", "bujur", "x", "koordinat_lng"]) || ""));
    
    // Cek jika ada kolom gabungan "koordinat" misal: "-6.4816, 106.8516"
    if (isNaN(latVal) || isNaN(lngVal)) {
      const combined = extractValue(row, ["koordinat", "coordinate", "point", "coordinates", "lokasi_gps"]);
      if (typeof combined === "string" && combined.includes(",")) {
        const parts = combined.split(",").map((s) => parseFloat(s.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          latVal = parts[0];
          lngVal = parts[1];
        }
      }
    }

    const matchedDist = matchDistrict(rawDistrict, latVal, lngVal);

    // Fallback koordinat jika kosong: gunakan koordinat centroid kecamatan
    if (isNaN(latVal) || isNaN(lngVal)) {
      const dObj = districtsData.find((d) => d.id === matchedDist.id);
      if (dObj) {
        latVal = dObj.lat;
        lngVal = dObj.lng;
      }
    }

    const rawContract = extractValue(row, ["nilai_kontrak", "nilai", "anggaran", "pagu", "biaya", "contract_value"]);
    const contractValue = typeof rawContract === "number" ? rawContract : parseFloat(String(rawContract || "0").replace(/[^0-9.-]/g, "")) || 0;

    const contractor = extractValue(row, ["nama_penyedia", "penyedia", "kontraktor", "badan_usaha", "bujk", "contractor"]) || (defaultLayer === "projects" ? "Dinas PUPR / Rekanan Terdaftar" : rawName);
    const nib = extractValue(row, ["nib", "nomor_induk_berusaha", "nib_penyedia"]) || undefined;
    
    const rawQual = String(extractValue(row, ["kualifikasi", "qualification"]) || "Kecil").toLowerCase();
    const qualification = rawQual.includes("besar") ? "Besar" : rawQual.includes("menengah") ? "Menengah" : "Kecil";

    const rawProg = extractValue(row, ["progres_fisik", "progres", "progress", "persentase"]);
    const physProgress = typeof rawProg === "number" ? rawProg : parseFloat(String(rawProg || "0").replace(/[^0-9.]/g, "")) || 0;

    const source = extractValue(row, ["sumber_dana", "sumber", "dana", "source"]) || "APBD";

    // Validasi Geofence
    const validation = validateBogorCoordinates(latVal, lngVal);

    return {
      tempId: `UPLOAD-${Date.now()}-${idx + 1}`,
      name: String(rawName).trim(),
      category: String(rawCategory).trim(),
      district: matchedDist.name,
      districtId: matchedDist.id,
      address: String(rawAddress).trim(),
      lat: latVal,
      lng: lngVal,
      contractValue,
      contractor: String(contractor).trim(),
      nib: nib ? String(nib).trim() : undefined,
      qualification,
      physProgress: Math.min(100, Math.max(0, physProgress)),
      source: String(source).trim(),
      validation,
      raw: row
    };
  });
}

export async function parseSpatialExcel(file: File, layer: "projects" | "bujk" = "projects"): Promise<ParsedSpatialRecord[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  if (!jsonRows || jsonRows.length === 0) {
    throw new Error("Berkas Excel tidak memiliki data baris atau sheet kosong.");
  }

  return processRawRows(jsonRows, layer);
}

export function parseSpatialCSV(csvText: string, layer: "projects" | "bujk" = "projects"): ParsedSpatialRecord[] {
  // Parsing CSV sederhana atau melalui SheetJS
  const workbook = XLSX.read(csvText, { type: "string" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  if (!jsonRows || jsonRows.length === 0) {
    throw new Error("Berkas CSV kosong atau tidak memiliki baris data yang valid.");
  }

  return processRawRows(jsonRows, layer);
}

// =============================================================================
// 3. PARSER UNTUK GEOJSON (.geojson, .json)
// =============================================================================

export function parseSpatialGeoJSON(geojsonText: string, layer: "projects" | "bujk" = "projects"): ParsedSpatialRecord[] {
  let parsed: any;
  try {
    parsed = JSON.parse(geojsonText);
  } catch (err: any) {
    throw new Error(`Format JSON tidak valid: ${err.message}`);
  }

  const features = parsed.type === "FeatureCollection" ? parsed.features : parsed.type === "Feature" ? [parsed] : [];

  if (!features || features.length === 0) {
    throw new Error("Tidak ditemukan elemen Feature spasial dalam berkas GeoJSON.");
  }

  const rows: Record<string, any>[] = [];

  for (const feat of features) {
    const geom = feat.geometry;
    const props = feat.properties || {};

    let lat: number | undefined;
    let lng: number | undefined;

    if (geom && geom.type === "Point" && Array.isArray(geom.coordinates)) {
      // Standar GeoJSON format: [longitude, latitude]
      lng = Number(geom.coordinates[0]);
      lat = Number(geom.coordinates[1]);
    }

    rows.push({
      ...props,
      latitude: lat,
      longitude: lng
    });
  }

  return processRawRows(rows, layer);
}

// =============================================================================
// 4. PARSER UNTUK KML (.kml)
// =============================================================================

export function parseSpatialKML(kmlText: string, layer: "projects" | "bujk" = "projects"): ParsedSpatialRecord[] {
  const rows: Record<string, any>[] = [];

  if (typeof window !== "undefined" && window.DOMParser) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    const placemarks = xmlDoc.getElementsByTagName("Placemark");

    if (!placemarks || placemarks.length === 0) {
      throw new Error("Tidak ditemukan elemen <Placemark> dalam berkas KML.");
    }

    for (let i = 0; i < placemarks.length; i++) {
      const pm = placemarks[i];
      const name = pm.getElementsByTagName("name")[0]?.textContent || `Titik KML #${i + 1}`;
      const desc = pm.getElementsByTagName("description")[0]?.textContent || "";

      let lat: number | undefined;
      let lng: number | undefined;

      const coordEl = pm.getElementsByTagName("coordinates")[0];
      if (coordEl && coordEl.textContent) {
        const parts = coordEl.textContent.trim().split(",");
        if (parts.length >= 2) {
          lng = parseFloat(parts[0]);
          lat = parseFloat(parts[1]);
        }
      }

      // Ambil ExtendedData jika ada
      const extendedProps: Record<string, any> = {};
      const simpleData = pm.getElementsByTagName("SimpleData");
      for (let j = 0; j < simpleData.length; j++) {
        const sd = simpleData[j];
        const key = sd.getAttribute("name");
        if (key) {
          extendedProps[key] = sd.textContent;
        }
      }

      rows.push({
        nama_paket: name,
        alamat: desc,
        latitude: lat,
        longitude: lng,
        ...extendedProps
      });
    }
  } else {
    // Regex Fallback untuk environment tanpa DOMParser
    const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/gi;
    let match;
    let idx = 0;

    while ((match = placemarkRegex.exec(kmlText)) !== null) {
      idx++;
      const block = match[1];
      const nameMatch = /<name>([\s\S]*?)<\/name>/i.exec(block);
      const coordMatch = /<coordinates>([\s\S]*?)<\/coordinates>/i.exec(block);

      let lat: number | undefined;
      let lng: number | undefined;

      if (coordMatch) {
        const parts = coordMatch[1].trim().split(",");
        if (parts.length >= 2) {
          lng = parseFloat(parts[0]);
          lat = parseFloat(parts[1]);
        }
      }

      rows.push({
        nama_paket: nameMatch ? nameMatch[1].trim() : `Titik KML #${idx}`,
        latitude: lat,
        longitude: lng
      });
    }
  }

  if (rows.length === 0) {
    throw new Error("Gagal membaca titik dari berkas KML.");
  }

  return processRawRows(rows, layer);
}

// =============================================================================
// 5. GENERATOR TEMPLATE EXCEL UNGGAH SPASIAL (DOWNLOAD CLIENT-SIDE)
// =============================================================================

export function downloadSpatialTemplateExcel(layer: "projects" | "bujk" = "projects") {
  let data: Record<string, any>[] = [];

  if (layer === "projects") {
    data = [
      {
        "Nama Paket Pekerjaan": "Peningkatan Jalan dan Jembatan Tegar Beriman II",
        "Kategori": "Jalan dan Jembatan",
        "Kecamatan": "Cibinong",
        "Alamat Lengkap": "Jl. Tegar Beriman Kav. 12, Kel. Pakansari",
        "Latitude": -6.48160,
        "Longitude": 106.85160,
        "Nilai Kontrak (Rp)": 4850000000,
        "Kontraktor Pelaksana": "PT Bogor Bangun Persada",
        "Sumber Dana": "APBD",
        "Progres Fisik (%)": 45
      },
      {
        "Nama Paket Pekerjaan": "Pembangunan Saluran Drainase dan Trotoar Ciawi",
        "Kategori": "Drainase dan Tata Air",
        "Kecamatan": "Ciawi",
        "Alamat Lengkap": "Jl. Raya Puncak KM 67, Ciawi",
        "Latitude": -6.70120,
        "Longitude": 106.86120,
        "Nilai Kontrak (Rp)": 1750000000,
        "Kontraktor Pelaksana": "CV Graha Cipta Mandiri",
        "Sumber Dana": "APBD",
        "Progres Fisik (%)": 70
      },
      {
        "Nama Paket Pekerjaan": "Pembangunan Gedung Fasilitas Puskesmas Leuwiliang",
        "Kategori": "Gedung dan Sanitasi",
        "Kecamatan": "Leuwiliang",
        "Alamat Lengkap": "Jl. Raya Leuwiliang No. 45",
        "Latitude": -6.58120,
        "Longitude": 106.62340,
        "Nilai Kontrak (Rp)": 3200000000,
        "Kontraktor Pelaksana": "PT Citra Mandiri Karya",
        "Sumber Dana": "DAK",
        "Progres Fisik (%)": 25
      }
    ];
  } else {
    data = [
      {
        "Nama Badan Usaha": "PT Bogor Bangun Persada",
        "Bentuk Usaha": "PT",
        "NIB": "9120001234567",
        "Kualifikasi": "Besar",
        "Kecamatan": "Cibinong",
        "Alamat Lengkap": "Ruko Cibinong City Center Blok A No. 10",
        "Penanggung Jawab": "H. Bambang Sudarsono, S.T.",
        "Telepon": "021-8754123",
        "Latitude": -6.48160,
        "Longitude": 106.85160
      },
      {
        "Nama Badan Usaha": "CV Graha Cipta Mandiri",
        "Bentuk Usaha": "CV",
        "NIB": "9120007654321",
        "Kualifikasi": "Menengah",
        "Kecamatan": "Ciawi",
        "Alamat Lengkap": "Jl. Raya Puncak No. 108, Ciawi",
        "Penanggung Jawab": "Ir. Hendri Gunawan",
        "Telepon": "0251-8241098",
        "Latitude": -6.70120,
        "Longitude": 106.86120
      }
    ];
  }

  const ws = XLSX.utils.json_to_sheet(data);

  // Atur lebar kolom agar mudah dibaca pengguna
  const colWidths = [
    { wch: 45 },
    { wch: 18 },
    { wch: 16 },
    { wch: 35 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 18 }
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template_Upload_Spasial");

  const fileName = layer === "projects"
    ? "Template_Upload_Proyek_WebGIS_Bogor.xlsx"
    : "Template_Upload_BUJK_WebGIS_Bogor.xlsx";

  XLSX.writeFile(wb, fileName);
}
