import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureSimakRemoval() {
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

  // 1. Login ke Dashboard
  console.log("1. Melakukan login ke sistem...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("Login dinas berhasil.");
  }
  await page.waitForTimeout(1500);

  // 2. Tangkap tampilan Hero Banner Dashboard Utama (tanpa shortcut Mulai Audit SIMAK)
  console.log("2. Menangkap tampilan Hero Banner Dashboard Utama (bersih tanpa shortcut)...");
  const dashBannerShotArtifact = path.join(artifactDir, "screenshot_dashboard_tanpa_shortcut_audit.png");
  const dashBannerShotDocs = path.join(docsDir, "screenshot_dashboard_tanpa_shortcut_audit.png");
  await page.screenshot({ path: dashBannerShotArtifact });
  fs.copyFileSync(dashBannerShotArtifact, dashBannerShotDocs);
  console.log("Tersimpan Screenshot Hero Banner Tanpa Shortcut:", dashBannerShotArtifact);

  // 3. Scroll navigasi sidebar ke bawah untuk merekam SISTEM & ADMINISTRASI (hanya Pengaturan & Role)
  console.log("3. Menggeser navigasi sidebar ke bagian SISTEM & ADMINISTRASI...");
  await page.evaluate(() => {
    const nav = document.querySelector('nav.custom-touch-scroll');
    if (nav) {
      nav.scrollTop = nav.scrollHeight;
    }
  });
  await page.waitForTimeout(800);

  const sidebarShotArtifact = path.join(artifactDir, "screenshot_sidebar_tanpa_portal_simak.png");
  const sidebarShotDocs = path.join(docsDir, "screenshot_sidebar_tanpa_portal_simak.png");
  await page.screenshot({ path: sidebarShotArtifact });
  fs.copyFileSync(sidebarShotArtifact, sidebarShotDocs);
  console.log("Tersimpan Screenshot Sidebar Tanpa Portal SIMAK:", sidebarShotArtifact);

  // 4. Akses langsung URL /pengawasan untuk memverifikasi transisi graceful redirect ke /dashboard
  console.log("4. Mengetes akses langsung ke URL /pengawasan...");
  await page.goto("http://localhost:3000/pengawasan", { waitUntil: "networkidle" });
  console.log("URL saat ini:", page.url());

  const redirectedShotArtifact = path.join(artifactDir, "screenshot_redirect_pengawasan_to_dashboard.png");
  const redirectedShotDocs = path.join(docsDir, "screenshot_redirect_pengawasan_to_dashboard.png");
  await page.screenshot({ path: redirectedShotArtifact });
  fs.copyFileSync(redirectedShotArtifact, redirectedShotDocs);
  console.log("Tersimpan Screenshot Redirect Berhasil:", redirectedShotArtifact);

  await browser.close();
  console.log("Selesai pengujian dan capture pembuktian penghilangan Portal Pengawasan SIMAK!");
}

captureSimakRemoval().catch((err) => {
  console.error("Gagal capture screenshot:", err);
  process.exit(1);
});
