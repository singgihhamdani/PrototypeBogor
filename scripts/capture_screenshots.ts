import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capture() {
  const outputDir = path.resolve(__dirname, "../docs/assets/screenshots");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  console.log("1. Capturing Login Page with 5 roles...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, "01_login_5roles_dropdown.png") });

  console.log("2. Capturing Executive Dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, "02_executive_dashboard.png") });

  console.log("3. Capturing WebGIS...");
  await page.goto("http://localhost:3000/webgis", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDir, "03_webgis_spasial_bujk.png") });

  console.log("4. Capturing Paket Pekerjaan Detail...");
  await page.goto("http://localhost:3000/paket-pekerjaan/P001", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, "04_paket_pekerjaan_detail.png") });

  console.log("5. Capturing Pengawasan SIMAK...");
  await page.goto("http://localhost:3000/pengawasan", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, "06_pengawasan_tertib_simak.png") });

  console.log("6. Capturing Portal Peserta TKK...");
  await page.goto("http://localhost:3000/portal/peserta", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  // Scroll to certificate section
  await page.screenshot({ path: path.join(outputDir, "07_portal_peserta_sertifikat.png") });

  console.log("7. Capturing Regulasi Jakon & AI Copilot...");
  await page.goto("http://localhost:3000/regulasi", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, "08_ai_copilot_regulasi.png") });

  // 8. Batch Import Modal: copy from existing artifact or trigger modal
  const existingModal = "C:/Users/ultraman/.gemini/antigravity-ide/brain/cd4d6ea2-7b70-4ec2-b46f-086de827650a/import_excel_modal_1793059389277.png";
  if (fs.existsSync(existingModal)) {
    fs.copyFileSync(existingModal, path.join(outputDir, "05_batch_import_excel.png"));
    console.log("8. Copied Batch Import Modal screenshot.");
  }

  await browser.close();
  console.log("All screenshots successfully captured in:", outputDir);
}

capture().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
