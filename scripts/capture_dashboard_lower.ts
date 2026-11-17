import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";

const brainDir = path.resolve("C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1.25
  });
  const page = await context.newPage();

  console.log("1. Login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => {});
  }
  await page.waitForTimeout(1500);

  // 2. Scroll ke Grafis 1 (Rincian 5 Pilar) dan Tabel Paket Terkini DESC
  console.log("2. Scroll ke bagian bawah dashboard...");
  await page.evaluate(() => window.scrollBy(0, 750));
  await page.waitForTimeout(1000);

  const lowerPath = path.join(brainDir, "screenshot_dashboard_pilar_dan_paket.png");
  await page.screenshot({ path: lowerPath, fullPage: false });
  console.log("Screenshot lower section tersimpan:", lowerPath);

  // 3. Scroll kembali ke atas, buka modal restore
  console.log("3. Buka modal restore...");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const restoreBtn = page.locator('button:has-text("Pulihkan Data (Restore)")').first();
  if (await restoreBtn.isVisible()) {
    await restoreBtn.click();
    await page.waitForTimeout(600);
    // Klik tab restore jika perlu
    const tabRestore = page.locator('button:has-text("Pulihkan Data (Restore)")').nth(1);
    if (await tabRestore.isVisible()) {
      await tabRestore.click();
      await page.waitForTimeout(400);
    }
    const restorePath = path.join(brainDir, "screenshot_dashboard_restore_modal.png");
    await page.screenshot({ path: restorePath, fullPage: false });
    console.log("Screenshot restore modal tersimpan:", restorePath);
  }

  await browser.close();
  console.log("Selesai!");
}

main().catch(console.error);
