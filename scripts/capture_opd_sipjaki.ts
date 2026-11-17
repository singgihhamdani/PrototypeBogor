import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureOpdSipjaki() {
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

  // 1. Login Demo
  console.log("1. Melakukan login demo...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  await loginBtn.click();
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Login berhasil, URL:", page.url());

  // 2. Navigasi ke Halaman Profil OPD
  console.log("2. Navigasi ke /profil-opd...");
  await page.goto("http://localhost:3000/profil-opd", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 3. Tab 1: Profil OPD & SDM
  console.log("3. Mengambil screenshot Tab 1: Profil OPD & SDM...");
  const tab1ShotArtifact = path.join(artifactDir, "screenshot_opd_tab1_profil_sdm.png");
  const tab1ShotDocs = path.join(docsDir, "screenshot_opd_tab1_profil_sdm.png");
  await page.screenshot({ path: tab1ShotArtifact, fullPage: false });
  fs.copyFileSync(tab1ShotArtifact, tab1ShotDocs);
  console.log("Tersimpan Tab 1:", tab1ShotArtifact);

  // 4. Tab 2: Data Pendukung & Anggaran
  console.log("4. Membuka Tab 2: Data Pendukung & Anggaran...");
  const tab2Btn = page.locator('button:has-text("2. Data Pendukung & Anggaran")');
  await tab2Btn.click();
  await page.waitForTimeout(1000);

  const tab2ShotArtifact = path.join(artifactDir, "screenshot_opd_tab2_data_pendukung.png");
  const tab2ShotDocs = path.join(docsDir, "screenshot_opd_tab2_data_pendukung.png");
  await page.screenshot({ path: tab2ShotArtifact, fullPage: false });
  fs.copyFileSync(tab2ShotArtifact, tab2ShotDocs);
  console.log("Tersimpan Tab 2:", tab2ShotArtifact);

  // 5. Tab 3: Pelaksanaan & Pengawasan
  console.log("5. Membuka Tab 3: Pelaksanaan & Pengawasan...");
  const tab3Btn = page.locator('button:has-text("3. Pelaksanaan & Pengawasan")');
  await tab3Btn.click();
  await page.waitForTimeout(1000);

  const tab3ShotArtifact = path.join(artifactDir, "screenshot_opd_tab3_pelaksanaan_pengawasan.png");
  const tab3ShotDocs = path.join(docsDir, "screenshot_opd_tab3_pelaksanaan_pengawasan.png");
  await page.screenshot({ path: tab3ShotArtifact, fullPage: false });
  fs.copyFileSync(tab3ShotArtifact, tab3ShotDocs);
  console.log("Tersimpan Tab 3:", tab3ShotArtifact);

  // 6. Mode Edit Form Data OPD
  console.log("6. Mengaktifkan Mode Ubah Data OPD...");
  const editBtn = page.locator('button:has-text("Ubah Data OPD")');
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(1000);

    // Buka kembali Tab 1 saat mode edit
    const tab1Btn = page.locator('button:has-text("1. Profil OPD & SDM")');
    await tab1Btn.click();
    await page.waitForTimeout(500);

    const editShotArtifact = path.join(artifactDir, "screenshot_opd_edit_mode.png");
    const editShotDocs = path.join(docsDir, "screenshot_opd_edit_mode.png");
    await page.screenshot({ path: editShotArtifact, fullPage: false });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan Mode Edit:", editShotArtifact);
  }

  await browser.close();
  console.log("✅ Seluruh tangkapan layar fitur Profil OPD & SIPJAKI Pusat (3 Pilar) berhasil diambil!");
}

captureOpdSipjaki().catch((err) => {
  console.error("Gagal capture OPD SIPJAKI:", err);
  process.exit(1);
});
