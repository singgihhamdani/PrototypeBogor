import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureRekapitulasiFeatures() {
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

  // 2. Navigasi ke Halaman Rekapitulasi Pelatihan (/pelatihan/rekapitulasi)
  console.log("2. Navigasi ke /pelatihan/rekapitulasi...");
  await page.goto("http://localhost:3000/pelatihan/rekapitulasi", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Tabel 11 Kolom Baku SIPJAKI + Header EDIT + Badge Default DESC + Tanpa Kolom Status
  console.log("3. Mengambil screenshot Tabel 11 Kolom Rekapitulasi SIPJAKI (Header EDIT, Tanpa Kolom Status, Default Sort DESC)...");
  const shotTabelArtifact = path.join(artifactDir, "screenshot_rekapitulasi_tabel_11_kolom_desc.png");
  const shotTabelDocs = path.join(docsDir, "screenshot_rekapitulasi_tabel_11_kolom_desc.png");
  await page.screenshot({ path: shotTabelArtifact, fullPage: false });
  fs.copyFileSync(shotTabelArtifact, shotTabelDocs);
  // Also save with new filename to prevent any VS Code image tab caching
  fs.copyFileSync(shotTabelArtifact, path.join(artifactDir, "screenshot_rekapitulasi_tabel_baru.png"));
  fs.copyFileSync(shotTabelArtifact, path.join(docsDir, "screenshot_rekapitulasi_tabel_baru.png"));
  console.log("Screenshot tabel tersimpan:", shotTabelArtifact);

  // 4. Tangkap Layar Filter Tahun & Filter Capaian
  console.log("4. Mengambil screenshot Toolbar Filter Tahun (pilih TA 2026)...");
  const selectTahun = page.locator("#filterTahunSelect");
  if (await selectTahun.count() > 0) {
    await selectTahun.selectOption("2026");
    await page.waitForTimeout(800);
  }

  const shotFilterArtifact = path.join(artifactDir, "screenshot_rekapitulasi_filter_tahun.png");
  const shotFilterDocs = path.join(docsDir, "screenshot_rekapitulasi_filter_tahun.png");
  await page.screenshot({ path: shotFilterArtifact, fullPage: false });
  fs.copyFileSync(shotFilterArtifact, shotFilterDocs);
  console.log("Screenshot filter tersimpan:", shotFilterArtifact);

  // Kembalikan filter ke Semua
  if (await selectTahun.count() > 0) {
    await selectTahun.selectOption("Semua");
    await page.waitForTimeout(500);
  }

  // 5. Tangkap Layar Modal Edit Rekapitulasi (Klik tombol Edit baris pertama)
  console.log("5. Membuka Modal Edit Rekapitulasi...");
  const editButtons = page.locator("button[title='Edit Data Rekapitulasi'], table tbody tr button:has-text('Edit')");
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotEditArtifact = path.join(artifactDir, "screenshot_rekapitulasi_modal_edit.png");
    const shotEditDocs = path.join(docsDir, "screenshot_rekapitulasi_modal_edit.png");
    await page.screenshot({ path: shotEditArtifact, fullPage: false });
    fs.copyFileSync(shotEditArtifact, shotEditDocs);
    // Also save with new filename to prevent any VS Code image tab caching
    fs.copyFileSync(shotEditArtifact, path.join(artifactDir, "screenshot_rekapitulasi_modal_edit_baru.png"));
    fs.copyFileSync(shotEditArtifact, path.join(docsDir, "screenshot_rekapitulasi_modal_edit_baru.png"));
    console.log("Screenshot modal edit tersimpan:", shotEditArtifact);

    // Tutup modal edit
    const cancelEdit = page.locator("button:has-text('Batal')").first();
    if (await cancelEdit.count() > 0) {
      await cancelEdit.click();
      await page.waitForTimeout(600);
    }
  }

  // 6. Tangkap Layar Dialog Konfirmasi Hapus Rekapitulasi (Klik tombol Hapus baris pertama)
  console.log("6. Membuka Dialog Konfirmasi Hapus Rekapitulasi...");
  const deleteButtons = page.locator("button[title='Hapus Data Rekapitulasi'], table tbody tr button:has-text('Hapus')");
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotDeleteArtifact = path.join(artifactDir, "screenshot_rekapitulasi_delete_dialog.png");
    const shotDeleteDocs = path.join(docsDir, "screenshot_rekapitulasi_delete_dialog.png");
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

  // 7. Tangkap Layar Modal Tambah Data Rekapitulasi (+ TAMBAH DATA)
  console.log("7. Membuka Modal Tambah Data Rekapitulasi...");
  const addBtn = page.locator("button:has-text('+ TAMBAH DATA')");
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotAddArtifact = path.join(artifactDir, "screenshot_rekapitulasi_modal_add.png");
    const shotAddDocs = path.join(docsDir, "screenshot_rekapitulasi_modal_add.png");
    await page.screenshot({ path: shotAddArtifact, fullPage: false });
    fs.copyFileSync(shotAddArtifact, shotAddDocs);
    console.log("Screenshot modal tambah tersimpan:", shotAddArtifact);

    const cancelAdd = page.locator("button:has-text('Batal')").first();
    if (await cancelAdd.count() > 0) {
      await cancelAdd.click();
      await page.waitForTimeout(600);
    }
  }

  console.log("Seluruh 5 screenshot fitur Rekapitulasi Pelatihan TKK sukses diambil!");
  await browser.close();
}

captureRekapitulasiFeatures().catch((err) => {
  console.error("Gagal mengambil tangkapan layar:", err);
  process.exit(1);
});
