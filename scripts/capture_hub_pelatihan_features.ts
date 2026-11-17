import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureHubPelatihanFeatures() {
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

  // 1. Melakukan login demo ke Dashboard Dinas
  console.log("1. Melakukan login demo via /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("Login berhasil, URL sekarang:", page.url());
  }

  // 2. Navigasi ke Halaman Hub Pelatihan (/pelatihan)
  console.log("2. Navigasi ke /pelatihan...");
  await page.goto("http://localhost:3000/pelatihan", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 3. Berpindah ke Tab "Database TKK Tersertifikasi"
  console.log("3. Mengklik Tab 'Database TKK Tersertifikasi'...");
  const tkkTab = page.locator("button:has-text('Database TKK Tersertifikasi')").first();
  await tkkTab.click();
  await page.waitForTimeout(1200);

  // 4. Tangkap Layar Tabel 9 Kolom Standar + Sort DESC Default + 2 Kolom Sertifikat + Kolom Aksi "EDIT"
  console.log("4. Mengambil screenshot Tabel 9 Kolom Hub Pelatihan (Sort DESC, 2 Kolom Sertifikat, Kolom EDIT)...");
  const shotTabelArtifact = path.join(artifactDir, "screenshot_pelatihan_hub_tabel_tkk_desc.png");
  const shotTabelDocs = path.join(docsDir, "screenshot_pelatihan_hub_tabel_tkk_desc.png");
  await page.screenshot({ path: shotTabelArtifact, fullPage: false });
  fs.copyFileSync(shotTabelArtifact, shotTabelDocs);
  console.log("Screenshot tabel tersimpan:", shotTabelArtifact);

  // 5. Tangkap Layar Filter Jenjang PP 14/2021 & Toolbar Filter
  console.log("5. Mengambil screenshot Filter Jenjang PP 14/2021...");
  // Pilih filter jenjang "Jenjang 3"
  const selects = page.locator("select");
  // select 0: Kategori, select 1: Jenjang PP 14/2021
  if (await selects.count() >= 2) {
    await selects.nth(1).selectOption("Jenjang 3");
    await page.waitForTimeout(800);
  }

  const shotFilterArtifact = path.join(artifactDir, "screenshot_pelatihan_hub_filter_jenjang_pp14.png");
  const shotFilterDocs = path.join(docsDir, "screenshot_pelatihan_hub_filter_jenjang_pp14.png");
  await page.screenshot({ path: shotFilterArtifact, fullPage: false });
  fs.copyFileSync(shotFilterArtifact, shotFilterDocs);
  console.log("Screenshot filter tersimpan:", shotFilterArtifact);

  // Kembalikan filter jenjang ke "Semua"
  if (await selects.count() >= 2) {
    await selects.nth(1).selectOption("Semua");
    await page.waitForTimeout(500);
  }

  // 6. Tangkap Layar Modal Edit Peserta & Sertifikasi
  console.log("6. Membuka Modal Edit Peserta...");
  const editButtons = page.locator("table tbody tr button:has-text('Edit')");
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);

    const shotEditArtifact = path.join(artifactDir, "screenshot_pelatihan_hub_modal_edit.png");
    const shotEditDocs = path.join(docsDir, "screenshot_pelatihan_hub_modal_edit.png");
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

  // 7. Tangkap Layar Dialog Konfirmasi Hapus Peserta
  console.log("7. Membuka Dialog Konfirmasi Hapus...");
  const deleteButtons = page.locator("table tbody tr button:has-text('Hapus')");
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);

    const shotDeleteArtifact = path.join(artifactDir, "screenshot_pelatihan_hub_delete_dialog.png");
    const shotDeleteDocs = path.join(docsDir, "screenshot_pelatihan_hub_delete_dialog.png");
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

  console.log("Seluruh 4 screenshot fitur Hub Pelatihan & Sertifikasi sukses diambil!");
  await browser.close();
}

captureHubPelatihanFeatures().catch((err) => {
  console.error("Gagal mengambil tangkapan layar:", err);
  process.exit(1);
});
