const { chromium } = require("../prototype/node_modules/playwright");
const path = require("path");
const fs = require("fs");
const XLSX = require("../prototype/node_modules/xlsx");

async function captureWebGISUpload() {
  const artifactDir = "C:\\Users\\ultraman\\.gemini\\antigravity\\brain\\d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  // Siapkan file contoh Excel untuk pengujian upload
  const sampleFilePath = path.join(artifactDir, "scratch", "sample_proyek_upload.xlsx");
  const sampleData = [
    {
      "Nama Paket Pekerjaan": "Peningkatan Ruas Jalan Tegar Beriman - Bojonggede",
      "Kategori": "Jalan dan Jembatan",
      "Kecamatan": "Cibinong",
      "Alamat Lengkap": "Jl. Tegar Beriman KM 3, Cibinong",
      "Latitude": -6.48550,
      "Longitude": 106.84890,
      "Nilai Kontrak (Rp)": 3500000000,
      "Kontraktor Pelaksana": "PT Bogor Bangun Persada",
      "Sumber Dana": "APBD",
      "Progres Fisik (%)": 60
    },
    {
      "Nama Paket Pekerjaan": "Pembangunan Jembatan Gantung Wisata Puncak Cisarua",
      "Kategori": "Jalan dan Jembatan",
      "Kecamatan": "Cisarua",
      "Alamat Lengkap": "Jl. Raya Puncak KM 82, Cisarua",
      "Latitude": -6.68890,
      "Longitude": 106.92340,
      "Nilai Kontrak (Rp)": 2400000000,
      "Kontraktor Pelaksana": "PT Mandiri Cipta Karya",
      "Sumber Dana": "APBD",
      "Progres Fisik (%)": 40
    },
    {
      "Nama Paket Pekerjaan": "Pembangunan Sarana Air Bersih & Sanitasi Desa Cariu",
      "Kategori": "Sanitasi dan Tata Air",
      "Kecamatan": "Cariu",
      "Alamat Lengkap": "Desa Babakan Raden, Kec. Cariu",
      "Latitude": -6.51230,
      "Longitude": 107.12310,
      "Nilai Kontrak (Rp)": 1150000000,
      "Kontraktor Pelaksana": "CV Graha Tirta Mandiri",
      "Sumber Dana": "DAK",
      "Progres Fisik (%)": 85
    }
  ];
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, sampleFilePath);
  console.log("File sampel excel berhasil dibuat:", sampleFilePath);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1550, height: 980 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Login & Navigasi ke /webgis
  console.log("1. Melakukan login demo & navigasi ke WebGIS...");
  await page.goto("http://localhost:3000/login?redirect=/webgis", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")').first();
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await page.waitForURL("**/webgis", { timeout: 15000 });
  }
  console.log("Login sukses, URL:", page.url());
  await page.waitForTimeout(2500);

  // 2. Screenshot Overview WebGIS dengan Tombol "+ Upload / Plot Titik Spasial"
  console.log("2. Mengambil screenshot WebGIS Overview...");
  const overviewPath = path.join(artifactDir, "screenshot_webgis_overview_button.png");
  await page.screenshot({ path: overviewPath });
  fs.copyFileSync(overviewPath, path.join(docsDir, "screenshot_webgis_overview_button.png"));
  console.log("Tersimpan:", overviewPath);

  // 3. Buka Modal Upload Data & Titik Spasial (Tab 1: Upload File)
  console.log("3. Membuka Modal Spasial...");
  const openModalBtn = page.locator('button:has-text("+ Upload / Plot Titik Spasial")').first();
  await openModalBtn.click();
  await page.waitForTimeout(1500);

  const tab1Path = path.join(artifactDir, "screenshot_webgis_modal_tab1_upload.png");
  await page.screenshot({ path: tab1Path });
  fs.copyFileSync(tab1Path, path.join(docsDir, "screenshot_webgis_modal_tab1_upload.png"));
  console.log("Tersimpan Tab 1 Kosong:", tab1Path);

  // 4. Unggah File Sample ke Dropzone Tab 1 & Screenshot Pratinjau Tabel Spasial
  console.log("4. Mengunggah file sample ke input file...");
  const fileInput = page.locator('input[type="file"]#spatial-file-input');
  await fileInput.setInputFiles(sampleFilePath);
  await page.waitForTimeout(2000);

  const tab1ParsedPath = path.join(artifactDir, "screenshot_webgis_modal_tab1_parsed_preview.png");
  await page.screenshot({ path: tab1ParsedPath });
  fs.copyFileSync(tab1ParsedPath, path.join(docsDir, "screenshot_webgis_modal_tab1_parsed_preview.png"));
  console.log("Tersimpan Tab 1 Parsed Preview:", tab1ParsedPath);

  // 5. Beralih ke Tab 2: Plot Titik Interaktif (Pinpoint)
  console.log("5. Beralih ke Tab 2: Plot Titik Interaktif (Pinpoint)...");
  const tabPinpoint = page.locator('button:has-text("2. Plot Titik Interaktif (Pinpoint)")').first();
  await tabPinpoint.click();
  await page.waitForTimeout(2000);

  // Isi nama paket contoh di form
  const nameInput = page.locator('input[placeholder*="Contoh: Peningkatan"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill("Pembangunan Jembatan Flyover Simpang Sentul - Babakan Madang");
  }

  await page.waitForTimeout(1000);
  const tab2Path = path.join(artifactDir, "screenshot_webgis_modal_tab2_pinpoint.png");
  await page.screenshot({ path: tab2Path });
  fs.copyFileSync(tab2Path, path.join(docsDir, "screenshot_webgis_modal_tab2_pinpoint.png"));
  console.log("Tersimpan Tab 2 Pinpoint:", tab2Path);

  await browser.close();
  console.log("Semua pengujian visual dan screenshot WebGIS Upload berhasil 100%!");
}

captureWebGISUpload().catch((err) => {
  console.error("Gagal capture WebGIS:", err);
  process.exit(1);
});
