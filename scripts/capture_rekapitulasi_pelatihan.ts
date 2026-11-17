import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureRekapitulasiPelatihan() {
  const artifactDir = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1480, height: 950 },
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
  console.log("Login berhasil, URL:", page.url());

  // 2. Navigasi ke Rekapitulasi TKK Pelatihan
  console.log("2. Navigasi ke Rekapitulasi TKK Pelatihan...");
  await page.goto("http://localhost:3000/pelatihan/rekapitulasi", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama (3 Kartu Capaian, Filter, Table Toolbar, & Tabel 12 Kolom)
  console.log("3. Mengambil screenshot tabel utama Rekapitulasi Pelatihan (12 Kolom Standar SIPJAKI)...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_rekapitulasi_pelatihan_tabel_12_kolom.png");
  const tableShotDocs = path.join(docsDir, "screenshot_rekapitulasi_pelatihan_tabel_12_kolom.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel Rekapitulasi Pelatihan:", tableShotArtifact);

  // 4. Buka Modal Detail Rincian Paket Kegiatan (Tombol Mata Biru di Kolom AKSI)
  console.log("4. Membuka modal Detail Rincian Paket Pelatihan...");
  const detailButtons = page.locator('button[title*="Lihat Rincian"]');
  if (await detailButtons.count() > 0) {
    await detailButtons.first().click();
    await page.waitForTimeout(1000);
    const detailShotArtifact = path.join(artifactDir, "screenshot_rekapitulasi_pelatihan_detail_modal.png");
    const detailShotDocs = path.join(docsDir, "screenshot_rekapitulasi_pelatihan_detail_modal.png");
    await page.screenshot({ path: detailShotArtifact });
    fs.copyFileSync(detailShotArtifact, detailShotDocs);
    console.log("Tersimpan modal Detail Rincian Paket:", detailShotArtifact);

    // Tutup modal detail
    const closeBtn = page.locator('button:has-text("Tutup Rincian")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Modal Dokumen Rekapitulasi ("Lihat")
  console.log("5. Membuka modal Dokumen Rekapitulasi (Tombol Lihat)...");
  const docButtons = page.locator('button:has-text("Lihat")');
  if (await docButtons.count() > 0) {
    await docButtons.first().click();
    await page.waitForTimeout(1000);
    const docShotArtifact = path.join(artifactDir, "screenshot_rekapitulasi_pelatihan_doc_modal.png");
    const docShotDocs = path.join(docsDir, "screenshot_rekapitulasi_pelatihan_doc_modal.png");
    await page.screenshot({ path: docShotArtifact });
    fs.copyFileSync(docShotArtifact, docShotDocs);
    console.log("Tersimpan modal Dokumen Rekapitulasi:", docShotArtifact);

    // Tutup modal dokumen
    const closeDocBtn = page.locator('button:has-text("Tutup")').first();
    if (await closeDocBtn.count() > 0) {
      await closeDocBtn.click();
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  console.log("Selesai menangkap seluruh screenshot Rekapitulasi TKK Pelatihan!");
}

captureRekapitulasiPelatihan().catch(err => {
  console.error("Gagal capture rekapitulasi pelatihan:", err);
  process.exit(1);
});
