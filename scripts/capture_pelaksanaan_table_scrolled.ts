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

  console.log("Login demo via /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => {});
  }
  await page.waitForTimeout(1000);

  console.log("Navigasi ke /pengawasan/tertib-penyelenggaraan/pelaksanaan...");
  await page.goto("http://localhost:3000/pengawasan/tertib-penyelenggaraan/pelaksanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Scroll element into view (table container)
  const table = page.locator("table");
  if (await table.count() > 0) {
    await table.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
  }

  const scrollPathBrain = path.join(brainDir, "screenshot_pelaksanaan_tabel_detail_kolom.png");
  const scrollPathAssets = path.join(assetsDir, "screenshot_pelaksanaan_tabel_detail_kolom.png");
  await page.screenshot({ path: scrollPathBrain, fullPage: false });
  await page.screenshot({ path: scrollPathAssets, fullPage: false });
  console.log("Screenshot tabel detail tersimpan:", scrollPathBrain);

  await browser.close();
}

main().catch(console.error);
