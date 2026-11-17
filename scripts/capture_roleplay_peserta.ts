import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureRoleplayPeserta() {
  const artifactDir = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1480, height: 980 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Login ke Portal Peserta TKK melalui /portal/login
  console.log("1. Melakukan login ke Portal Peserta via /portal/login...");
  await page.goto("http://localhost:3000/portal/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Klik tab Peserta Tenaga Kerja (TKK)
  const pesertaTab = page.locator('text=Peserta Tenaga Kerja (TKK)').first();
  if (await pesertaTab.count() > 0) {
    await pesertaTab.click();
    await page.waitForTimeout(500);
  }

  // Klik tombol Masuk ke Portal Peserta TKK
  const submitLogin = page.locator('button[type="submit"]').first();
  if (await submitLogin.count() > 0) {
    await submitLogin.click();
    await page.waitForURL("**/portal/peserta", { timeout: 10000 });
    console.log("Berhasil login dan masuk ke /portal/peserta");
  }

  await page.waitForTimeout(2000);

  // 2. Tangkap Dashboard Peserta 1 (Ahmad Fauzi) - Default Sort Pelatihan Terakhir (DESC) & E-Sertifikat Otomatis
  console.log("2. Menangkap tampilan Dashboard Peserta Ahmad Fauzi (Default Sort Terkini)...");
  await page.evaluate(() => {
    const el = document.getElementById("riwayat");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(1200);

  const dashShotArtifact = path.join(artifactDir, "screenshot_portal_peserta_dashboard_terkini.png");
  const dashShotDocs = path.join(docsDir, "screenshot_portal_peserta_dashboard_terkini.png");
  await page.screenshot({ path: dashShotArtifact });
  fs.copyFileSync(dashShotArtifact, dashShotDocs);
  console.log("Tersimpan Dashboard Peserta Terkini:", dashShotArtifact);

  // 3. Simulasi Skema Internal: First Login & Wajib Ganti Password (Dedi Kurniawan)
  console.log("3. Memilih Dedi Kurniawan untuk simulasi First Login & Wajib Ubah Password...");
  // Scroll kembali ke atas agar role switcher terlihat
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const dediBtn = page.locator('button:has-text("Dedi Kurniawan")').first();
  if (await dediBtn.count() > 0) {
    await dediBtn.click();
    await page.waitForTimeout(1500);

    const passwordShotArtifact = path.join(artifactDir, "screenshot_peserta_force_password_modal.png");
    const passwordShotDocs = path.join(docsDir, "screenshot_peserta_force_password_modal.png");
    await page.screenshot({ path: passwordShotArtifact });
    fs.copyFileSync(passwordShotArtifact, passwordShotDocs);
    console.log("Tersimpan Modal Wajib Ganti Password:", passwordShotArtifact);

    // Refresh halaman untuk mengembalikan state
    await page.goto("http://localhost:3000/portal/peserta", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
  }

  // 4. Simulasi Skema Eksternal: Formulir Pendaftaran Mandiri TKK & Validasi NIK
  console.log("4. Membuka Modal Pendaftaran Mandiri Eksternal...");
  const registerBtn = page.locator('button:has-text("Pendaftaran Mandiri")').first();
  if (await registerBtn.count() > 0) {
    await registerBtn.click();
    await page.waitForTimeout(1000);

    // Isi formulir contoh
    const nameInput = page.locator('input[placeholder*="Budi Prasetyo"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill("Budi Prasetyo");
    }

    const nikInput = page.locator('input[placeholder*="16 digit NIK"]').first();
    if (await nikInput.count() > 0) {
      await nikInput.fill("3201032104930003");
      await page.waitForTimeout(600);
    }

    const checkLpjk = page.locator('input[type="checkbox"]').first();
    if (await checkLpjk.count() > 0) {
      await checkLpjk.check();
      await page.waitForTimeout(600);
    }

    const regLpjkInput = page.locator('input[placeholder*="REG-2022"]').first();
    if (await regLpjkInput.count() > 0) {
      await regLpjkInput.fill("REG-2022-TKK-99120");
    }

    const regShotArtifact = path.join(artifactDir, "screenshot_peserta_pendaftaran_eksternal_modal.png");
    const regShotDocs = path.join(docsDir, "screenshot_peserta_pendaftaran_eksternal_modal.png");
    await page.screenshot({ path: regShotArtifact });
    fs.copyFileSync(regShotArtifact, regShotDocs);
    console.log("Tersimpan Modal Pendaftaran Eksternal:", regShotArtifact);
  }

  await browser.close();
  console.log("Selesai merekam seluruh tangkapan layar pembuktian Roleplay Peserta!");
}

captureRoleplayPeserta().catch((err) => {
  console.error("Gagal capture screenshot:", err);
  process.exit(1);
});
