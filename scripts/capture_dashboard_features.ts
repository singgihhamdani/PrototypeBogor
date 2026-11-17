import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1.25
  });
  const page = await context.newPage();

  const brainDir = path.resolve("C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617");
  const assetsDir = path.resolve("docs/assets/screenshots");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log("1. Melakukan demo login via /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => {});
  }
  await page.waitForTimeout(2000);

  // 2. Screenshot 1: Dashboard Overview (Hero banner, 4 cards, Grafis 2 Nested Doughnut + Tabel Excel, Grafis 1 5 Pilar, Paket DESC)
  console.log("2. Mengambil screenshot 1: Dashboard Overview TA 2026...");
  const overviewPathBrain = path.join(brainDir, "screenshot_dashboard_overview.png");
  const overviewPathAssets = path.join(assetsDir, "screenshot_dashboard_overview.png");
  await page.screenshot({ path: overviewPathBrain, fullPage: false });
  await page.screenshot({ path: overviewPathAssets, fullPage: false });
  console.log("Screenshot overview tersimpan:", overviewPathBrain);

  // 3. Ganti Dropdown Tahun ke 2025 & Screenshot Reactive Auto-Reset
  console.log("3. Mengganti Tahun Anggaran ke TA 2025...");
  const yearSelect = page.locator('select').first();
  if (await yearSelect.isVisible()) {
    await yearSelect.selectOption("2025");
    await page.waitForTimeout(1500);

    const yearPathBrain = path.join(brainDir, "screenshot_dashboard_year_filter.png");
    const yearPathAssets = path.join(assetsDir, "screenshot_dashboard_year_filter.png");
    await page.screenshot({ path: yearPathBrain, fullPage: false });
    await page.screenshot({ path: yearPathAssets, fullPage: false });
    console.log("Screenshot filter tahun 2025 tersimpan:", yearPathBrain);

    // Kembalikan ke 2026
    await yearSelect.selectOption("2026");
    await page.waitForTimeout(1000);
  }

  // 4. Buka Modal Backup Data
  console.log("4. Membuka Modal Cadangkan Data (Backup)...");
  const backupBtn = page.locator('button:has-text("Cadangkan Data (Backup)")').first();
  if (await backupBtn.isVisible()) {
    await backupBtn.click();
    await page.waitForTimeout(800);

    const backupPathBrain = path.join(brainDir, "screenshot_dashboard_backup_modal.png");
    const backupPathAssets = path.join(assetsDir, "screenshot_dashboard_backup_modal.png");
    await page.screenshot({ path: backupPathBrain, fullPage: false });
    await page.screenshot({ path: backupPathAssets, fullPage: false });
    console.log("Screenshot modal backup tersimpan:", backupPathBrain);

    // 5. Ganti ke Tab Restore Data
    console.log("5. Berpindah ke Tab Pulihkan Data (Restore)...");
    const restoreTabBtn = page.locator('button:has-text("Pulihkan Data (Restore)")').first();
    if (await restoreTabBtn.isVisible()) {
      await restoreTabBtn.click();
      await page.waitForTimeout(600);

      const restorePathBrain = path.join(brainDir, "screenshot_dashboard_restore_modal.png");
      const restorePathAssets = path.join(assetsDir, "screenshot_dashboard_restore_modal.png");
      await page.screenshot({ path: restorePathBrain, fullPage: false });
      await page.screenshot({ path: restorePathAssets, fullPage: false });
      console.log("Screenshot modal restore tersimpan:", restorePathBrain);
    }

    const closeBtn = page.locator('button:has-text("Batal"), button:has-text("Tutup")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  console.log("Semua pengujian dan tangkapan layar fitur Dashboard selesai!");
}

main().catch(console.error);
