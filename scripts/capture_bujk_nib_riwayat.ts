import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureBujkNibRiwayat() {
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

  // 1. Login terlebih dahulu agar session dashboard aktif
  console.log("1. Melakukan login ke sistem...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("Login dinas berhasil.");
  }

  // 2. Tangkap Master BUJK (/bujk) & Validasi NIB Ganda
  console.log("2. Membuka Master BUJK (/bujk) & memicu validasi NIB ganda...");
  await page.goto("http://localhost:3000/bujk", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const addBtn = page.locator('button:has-text("Tambah BUJK Baru")').first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(1000);

    const nibInput = page.locator('input[placeholder*="13 digit NIB OSS"]').first();
    if (await nibInput.count() > 0) {
      await nibInput.fill("1234567890123");
      await page.waitForTimeout(1200);
    }

    const validationShotArtifact = path.join(artifactDir, "screenshot_bujk_nib_unique_validation.png");
    const validationShotDocs = path.join(docsDir, "screenshot_bujk_nib_unique_validation.png");
    await page.screenshot({ path: validationShotArtifact });
    fs.copyFileSync(validationShotArtifact, validationShotDocs);
    console.log("Tersimpan Validasi NIB Ganda:", validationShotArtifact);

    // Tutup modal
    const closeBtn = page.locator('button:has-text("Batal")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 3. Tangkap Halaman Detail BUJK (/bujk/B001) dengan Tabel Riwayat Pekerjaan Terkini
  console.log("3. Membuka Detail Profil BUJK (/bujk/B001)...");
  await page.goto("http://localhost:3000/bujk/B001", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Scroll ke tabel riwayat portofolio
  await page.evaluate(() => {
    window.scrollBy(0, 320);
  });
  await page.waitForTimeout(1000);

  const detailShotArtifact = path.join(artifactDir, "screenshot_bujk_detail_riwayat_terkini.png");
  const detailShotDocs = path.join(docsDir, "screenshot_bujk_detail_riwayat_terkini.png");
  await page.screenshot({ path: detailShotArtifact });
  fs.copyFileSync(detailShotArtifact, detailShotDocs);
  console.log("Tersimpan Detail BUJK Riwayat Terkini:", detailShotArtifact);

  // 4. Tangkap Portal Role Play BUJK (/portal/bujk) dengan Default Sort Pekerjaan Terakhir
  console.log("4. Membuka Portal Role Play BUJK (/portal/bujk)...");
  await page.goto("http://localhost:3000/portal/bujk", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Scroll ke bagian Riwayat Paket Pekerjaan
  await page.evaluate(() => {
    const el = document.getElementById("proyek");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(1000);

  const portalShotArtifact = path.join(artifactDir, "screenshot_portal_bujk_riwayat_terkini.png");
  const portalShotDocs = path.join(docsDir, "screenshot_portal_bujk_riwayat_terkini.png");
  await page.screenshot({ path: portalShotArtifact });
  fs.copyFileSync(portalShotArtifact, portalShotDocs);
  console.log("Tersimpan Portal BUJK Riwayat Terkini:", portalShotArtifact);

  await browser.close();
  console.log("Selesai mengambil seluruh screenshot pembuktian!");
}

captureBujkNibRiwayat().catch((err) => {
  console.error("Gagal capture screenshot:", err);
  process.exit(1);
});
