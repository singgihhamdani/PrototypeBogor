import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureSipjakiDashboardPelatihanFeatures() {
  const artifactDir = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1540, height: 980 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Melakukan login demo via /login
  console.log("1. Melakukan login demo via /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("Login berhasil, URL sekarang:", page.url());
  }

  // 2. Navigasi ke Halaman SIPJAKI - Dashboard Pelatihan (/sipjaki/pelatihan)
  console.log("2. Navigasi ke /sipjaki/pelatihan...");
  await page.goto("http://localhost:3000/sipjaki/pelatihan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Tabel Baku SIPJAKI + Header EDIT + Badge Default DESC + 3 Metode Baru
  console.log("3. Mengambil screenshot Tabel SIPJAKI Pelatihan (Default Riwayat Terkini DESC, Kolom EDIT, 3 Metode Baru)...");
  const shotTabelArtifact = path.join(artifactDir, "screenshot_sipjaki_dashboard_tabel_terkini.png");
  const shotTabelDocs = path.join(docsDir, "screenshot_sipjaki_dashboard_tabel_terkini.png");
  await page.screenshot({ path: shotTabelArtifact, fullPage: false });
  fs.copyFileSync(shotTabelArtifact, shotTabelDocs);
  console.log("Screenshot tabel tersimpan:", shotTabelArtifact);

  // 4. Tangkap Layar Filter Metode (Pilih Distance Learning)
  console.log("4. Mengambil screenshot Filter Metode (Pilih Distance Learning)...");
  const selectMetode = page.locator("#filterMetodeSelect");
  if (await selectMetode.count() > 0) {
    await selectMetode.selectOption("Distance Learning");
    await page.waitForTimeout(800);
  }

  const shotFilterArtifact = path.join(artifactDir, "screenshot_sipjaki_dashboard_filter_metode.png");
  const shotFilterDocs = path.join(docsDir, "screenshot_sipjaki_dashboard_filter_metode.png");
  await page.screenshot({ path: shotFilterArtifact, fullPage: false });
  fs.copyFileSync(shotFilterArtifact, shotFilterDocs);
  console.log("Screenshot filter metode tersimpan:", shotFilterArtifact);

  // Kembalikan filter ke Semua
  if (await selectMetode.count() > 0) {
    await selectMetode.selectOption("Semua");
    await page.waitForTimeout(500);
  }

  // 5. Tangkap Layar Modal Edit Pelatihan (Klik tombol Edit kuning pada baris pertama)
  console.log("5. Membuka Modal Edit Pelatihan...");
  const editButtons = page.locator("button[title*='Edit Kegiatan Pelatihan'], table tbody tr button:has-text('Edit')");
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotEditArtifact = path.join(artifactDir, "screenshot_sipjaki_dashboard_modal_edit.png");
    const shotEditDocs = path.join(docsDir, "screenshot_sipjaki_dashboard_modal_edit.png");
    await page.screenshot({ path: shotEditArtifact, fullPage: false });
    fs.copyFileSync(shotEditArtifact, shotEditDocs);
    console.log("Screenshot modal edit tersimpan:", shotEditArtifact);

    // Tutup modal edit
    const cancelEdit = page.locator("button:has-text('Batal')").first();
    if (await cancelEdit.count() > 0) {
      await cancelEdit.click();
      await page.waitForTimeout(600);
    }
  }

  // 6. Tangkap Layar Dialog Konfirmasi Hapus Pelatihan (Klik tombol Hapus merah pada baris pertama)
  console.log("6. Membuka Dialog Konfirmasi Hapus Pelatihan...");
  const deleteButtons = page.locator("button[title*='Hapus Kegiatan Pelatihan'], table tbody tr button:has-text('Hapus')");
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotDeleteArtifact = path.join(artifactDir, "screenshot_sipjaki_dashboard_delete_dialog.png");
    const shotDeleteDocs = path.join(docsDir, "screenshot_sipjaki_dashboard_delete_dialog.png");
    await page.screenshot({ path: shotDeleteArtifact, fullPage: false });
    fs.copyFileSync(shotDeleteArtifact, shotDeleteDocs);
    console.log("Screenshot dialog hapus tersimpan:", shotDeleteArtifact);

    // Tutup dialog hapus
    const cancelDelete = page.locator("button:has-text('Batal')").first();
    if (await cancelDelete.count() > 0) {
      await cancelDelete.click();
      await page.waitForTimeout(600);
    }
  }

  console.log("Seluruh 4 screenshot fitur SIPJAKI Dashboard Pelatihan sukses diambil!");
  await browser.close();
}

captureSipjakiDashboardPelatihanFeatures().catch((err) => {
  console.error("Gagal mengambil tangkapan layar:", err);
  process.exit(1);
});
