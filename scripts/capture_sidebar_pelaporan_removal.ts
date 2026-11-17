import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capturePelaporanRemoval() {
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

  // 2. Scroll sidebar ke bawah agar seksi SISTEM & ADMINISTRASI terlihat jelas
  console.log("2. Menggeser navigasi sidebar ke bagian SISTEM & ADMINISTRASI...");
  await page.evaluate(() => {
    const nav = document.querySelector('nav.custom-touch-scroll');
    if (nav) {
      nav.scrollTop = nav.scrollHeight;
    }
  });
  await page.waitForTimeout(800);

  const sidebarShotArtifact = path.join(artifactDir, "screenshot_sidebar_clean_tanpa_pelaporan.png");
  const sidebarShotDocs = path.join(docsDir, "screenshot_sidebar_clean_tanpa_pelaporan.png");
  await page.screenshot({ path: sidebarShotArtifact });
  fs.copyFileSync(sidebarShotArtifact, sidebarShotDocs);
  console.log("Tersimpan Screenshot Sidebar Bersih:", sidebarShotArtifact);

  // 3. Akses langsung URL /pelaporan untuk memverifikasi transisi graceful redirect ke /dashboard
  console.log("3. Mengetes akses langsung ke URL /pelaporan...");
  await page.goto("http://localhost:3000/pelaporan", { waitUntil: "networkidle" });
  console.log("URL saat ini:", page.url());

  const redirectedShotArtifact = path.join(artifactDir, "screenshot_redirect_pelaporan_to_dashboard.png");
  const redirectedShotDocs = path.join(docsDir, "screenshot_redirect_pelaporan_to_dashboard.png");
  await page.screenshot({ path: redirectedShotArtifact });
  fs.copyFileSync(redirectedShotArtifact, redirectedShotDocs);
  console.log("Tersimpan Screenshot Redirect Berhasil:", redirectedShotArtifact);

  await browser.close();
  console.log("Selesai pengujian dan capture pembuktian penghilangan Pelaporan SIPJAKI!");
}

capturePelaporanRemoval().catch((err) => {
  console.error("Gagal capture screenshot:", err);
  process.exit(1);
});
