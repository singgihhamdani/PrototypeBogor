import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capturePelaporan() {
  const artifactDir = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Login
  console.log("1. Melakukan login demo...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  await loginBtn.click();
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Login berhasil, URL sekarang:", page.url());

  // 2. Navigasi ke Pelaporan Tertib Usaha
  console.log("2. Navigasi ke Pelaporan Pengawasan (Tertib Usaha)...");
  await page.goto("http://localhost:3000/pengawasan/tertib-usaha/pelaporan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama & Tabel (Format 8 Kolom Standar SIPJAKI)
  console.log("3. Mengambil screenshot tabel utama pelaporan 8 kolom...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_pelaporan_tabel.png");
  const tableShotDocs = path.join(docsDir, "screenshot_pelaporan_tabel.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel:", tableShotArtifact);

  // 4. Buka Modal Edit Laporan
  console.log("4. Membuka modal Edit Laporan...");
  const editButtons = page.locator('button[title="Edit Data Laporan"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    const editShotArtifact = path.join(artifactDir, "screenshot_pelaporan_edit_modal.png");
    const editShotDocs = path.join(docsDir, "screenshot_pelaporan_edit_modal.png");
    await page.screenshot({ path: editShotArtifact });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan modal Edit:", editShotArtifact);

    // Tutup modal edit
    const closeBtn = page.locator('button:has-text("Batal")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Dialog Konfirmasi Hapus Laporan
  console.log("5. Membuka dialog konfirmasi Hapus Laporan...");
  const deleteButtons = page.locator('button[title="Hapus Laporan"]');
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    const delShotArtifact = path.join(artifactDir, "screenshot_pelaporan_delete_dialog.png");
    const delShotDocs = path.join(docsDir, "screenshot_pelaporan_delete_dialog.png");
    await page.screenshot({ path: delShotArtifact });
    fs.copyFileSync(delShotArtifact, delShotDocs);
    console.log("Tersimpan dialog Hapus:", delShotArtifact);

    // Tutup dialog hapus
    const cancelDelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelDelBtn.count() > 0) {
      await cancelDelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Pratinjau Dokumen ("Lihat" SIPJAKI)
  console.log("6. Membuka modal Pratinjau Dokumen (Tombol 'Lihat')...");
  const viewButtons = page.locator('button[title="Lihat Pratinjau Dokumen Laporan Pengawasan"]');
  if (await viewButtons.count() > 0) {
    await viewButtons.first().click();
    await page.waitForTimeout(1000);
    const viewShotArtifact = path.join(artifactDir, "screenshot_pelaporan_lihat_dokumen.png");
    const viewShotDocs = path.join(docsDir, "screenshot_pelaporan_lihat_dokumen.png");
    await page.screenshot({ path: viewShotArtifact });
    fs.copyFileSync(viewShotArtifact, viewShotDocs);
    console.log("Tersimpan modal Lihat Dokumen:", viewShotArtifact);
  }

  await browser.close();
  console.log("🎉 Seluruh screenshot pelaporan berhasil diambil dan disimpan!");
}

capturePelaporan().catch((err) => {
  console.error("Gagal capture pelaporan:", err);
  process.exit(1);
});
