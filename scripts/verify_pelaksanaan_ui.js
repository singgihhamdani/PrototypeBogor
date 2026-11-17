const { chromium } = require("../prototype/node_modules/playwright");
const path = require("path");

async function main() {
  const artifactDir = "C:\\Users\\ultraman\\.gemini\\antigravity\\brain\\d9da67b7-89d2-44a4-84d6-870caf820617";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1550, height: 1000 } });
  const page = await context.newPage();

  console.log("Logging in via demo account...");
  await page.goto("http://localhost:3000/login?redirect=/pengawasan/tertib-usaha/pelaksanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const submitBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")').first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForURL("**/pengawasan/tertib-usaha/pelaksanaan", { timeout: 15000 });
  }

  await page.waitForTimeout(2000);

  // 1. Tab 1.a.1 (15 Kolom Baku Produsen) - Scrolled to Table
  console.log("Clicking Tab 1.a.1...");
  const tab1a1 = page.locator('button').filter({ hasText: /1\.a\.1/ }).first();
  await tab1a1.click();
  await page.waitForTimeout(1000);

  // Scroll table into view
  const table = page.locator('table').first();
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "screenshot_tertib_usaha_tab_1a1_15kolom.png"),
    fullPage: false
  });

  // 2. Tab 1.b.1 (9 Kolom NIB & OSS) - Scrolled to Table
  console.log("Clicking Tab 1.b.1...");
  const tab1b1 = page.locator('button').filter({ hasText: /1\.b\.1/ }).first();
  await tab1b1.click();
  await page.waitForTimeout(1000);
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "screenshot_tertib_usaha_tab_1b1_nib.png"),
    fullPage: false
  });

  // 3. Tab 1.d (8 Kolom Tenaga Kerja) - Scrolled to Table
  console.log("Clicking Tab 1.d...");
  const tab1d = page.locator('button').filter({ hasText: /1\.d/ }).first();
  if (await tab1d.isVisible()) {
    await tab1d.click();
    await page.waitForTimeout(1000);
    await table.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(artifactDir, "screenshot_tertib_usaha_tab_1d_tkk.png"),
      fullPage: false
    });
  }

  await browser.close();
  console.log("Detailed table screenshots saved successfully!");
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
