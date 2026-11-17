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
  await page.waitForTimeout(1500);

  // 2. Navigasi ke Halaman Perencanaan SDM Pengawasan (Tertib Usaha)
  console.log("2. Navigasi ke /pengawasan/tertib-usaha/perencanaan/sdm...");
  await page.goto("http://localhost:3000/pengawasan/tertib-usaha/perencanaan/sdm", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Screenshot 1: Tabel SDM Pengawasan (Tanpa kata SK, Tanpa Wilayah, Ketua & Sertifikasi, Personil 1 Kesatuan, Default Sort Terkini DESC)
  console.log("3. Mengambil screenshot 1: Tabel SDM Pengawasan Terkini DESC...");
  const tabelPathBrain = path.join(brainDir, "screenshot_sdm_tabel_terkini.png");
  const tabelPathAssets = path.join(assetsDir, "screenshot_sdm_tabel_terkini.png");
  await page.screenshot({ path: tabelPathBrain, fullPage: false });
  await page.screenshot({ path: tabelPathAssets, fullPage: false });
  console.log("Screenshot tabel tersimpan:", tabelPathBrain);

  // 4. Buka Modal Edit
  console.log("4. Membuka Modal Edit Penugasan SDM...");
  const editButtons = page.locator('button[title*="Ubah"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(800);

    const editPathBrain = path.join(brainDir, "screenshot_sdm_modal_edit.png");
    const editPathAssets = path.join(assetsDir, "screenshot_sdm_modal_edit.png");
    await page.screenshot({ path: editPathBrain, fullPage: false });
    await page.screenshot({ path: editPathAssets, fullPage: false });
    console.log("Screenshot modal edit tersimpan:", editPathBrain);

    const closeBtn = page.locator('button:has-text("Batal")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Safety Confirmation Dialog Hapus
  console.log("5. Membuka Safety Confirmation Dialog Hapus Penugasan SDM...");
  const deleteButtons = page.locator('button[title*="Hapus"]');
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(800);

    const deletePathBrain = path.join(brainDir, "screenshot_sdm_delete_dialog.png");
    const deletePathAssets = path.join(assetsDir, "screenshot_sdm_delete_dialog.png");
    await page.screenshot({ path: deletePathBrain, fullPage: false });
    await page.screenshot({ path: deletePathAssets, fullPage: false });
    console.log("Screenshot dialog hapus tersimpan:", deletePathBrain);

    const cancelDeleteBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelDeleteBtn.isVisible()) {
      await cancelDeleteBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Tambah Surat Tugas & Personil
  console.log("6. Membuka Modal Tambah Surat Tugas & Personil...");
  const tambahBtn = page.locator('button:has-text("Tambah Surat Tugas (SDM)")').first();
  if (await tambahBtn.isVisible()) {
    await tambahBtn.click();
    await page.waitForTimeout(800);

    const tambahPathBrain = path.join(brainDir, "screenshot_sdm_modal_tambah.png");
    const tambahPathAssets = path.join(assetsDir, "screenshot_sdm_modal_tambah.png");
    await page.screenshot({ path: tambahPathBrain, fullPage: false });
    await page.screenshot({ path: tambahPathAssets, fullPage: false });
    console.log("Screenshot modal tambah tersimpan:", tambahPathBrain);

    const cancelTambahBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelTambahBtn.isVisible()) {
      await cancelTambahBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 7. Navigasi ke Pilar 2: Tertib Penyelenggaraan
  console.log("7. Navigasi ke /pengawasan/tertib-penyelenggaraan/perencanaan/sdm...");
  await page.goto("http://localhost:3000/pengawasan/tertib-penyelenggaraan/perencanaan/sdm", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const tpPathBrain = path.join(brainDir, "screenshot_sdm_penyelenggaraan.png");
  const tpPathAssets = path.join(assetsDir, "screenshot_sdm_penyelenggaraan.png");
  await page.screenshot({ path: tpPathBrain, fullPage: false });
  await page.screenshot({ path: tpPathAssets, fullPage: false });
  console.log("Screenshot SDM pilar 2 tersimpan:", tpPathBrain);

  await browser.close();
  console.log("Semua pengujian dan tangkapan layar fitur SDM pengawasan selesai!");
}

main().catch(console.error);
