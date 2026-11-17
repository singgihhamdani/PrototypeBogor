import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1150 },
    deviceScaleFactor: 1.25
  });
  const page = await context.newPage();

  const brainDir = path.resolve("C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617");
  const assetsDir = path.resolve("docs/assets/screenshots");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log("1. Melakukan login demo via /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => {});
  }
  await page.waitForTimeout(1000);
  console.log("Login berhasil, URL sekarang:", page.url());

  // 2. Go to /pengawasan/tertib-penyelenggaraan/rekomendasi
  console.log("2. Navigasi ke /pengawasan/tertib-penyelenggaraan/rekomendasi...");
  await page.goto("http://localhost:3000/pengawasan/tertib-penyelenggaraan/rekomendasi", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 3. Screenshot Tabel & Komponen Target vs Realisasi
  console.log("3. Mengambil screenshot Tabel Rekomendasi (Default Paket Terkini DESC & Target vs Realisasi)...");
  const tabelPathBrain = path.join(brainDir, "screenshot_rekomendasi_tabel_terkini.png");
  const tabelPathAssets = path.join(assetsDir, "screenshot_rekomendasi_tabel_terkini.png");
  await page.screenshot({ path: tabelPathBrain, fullPage: false });
  await page.screenshot({ path: tabelPathAssets, fullPage: false });
  console.log("Screenshot tabel tersimpan:", tabelPathBrain);

  // 4. Buka Modal Edit pada baris pertama (Tombol Kuning)
  console.log("4. Membuka Modal Edit Rekomendasi...");
  const editButtons = page.locator("button[title='Edit Data Rekomendasi & Status Tindak Lanjut']");
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(800);
    const editPathBrain = path.join(brainDir, "screenshot_rekomendasi_modal_edit.png");
    const editPathAssets = path.join(assetsDir, "screenshot_rekomendasi_modal_edit.png");
    await page.screenshot({ path: editPathBrain, fullPage: false });
    await page.screenshot({ path: editPathAssets, fullPage: false });
    console.log("Screenshot modal edit tersimpan:", editPathBrain);

    // Tutup modal edit
    const closeBtn = page.locator("button:has-text('Batal')");
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Safety Confirmation Dialog Hapus (Tombol Merah)
  console.log("5. Membuka Safety Confirmation Dialog Hapus...");
  const deleteButtons = page.locator("button[title='Hapus Rekomendasi Pengawasan']");
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(600);
    const delPathBrain = path.join(brainDir, "screenshot_rekomendasi_delete_dialog.png");
    const delPathAssets = path.join(assetsDir, "screenshot_rekomendasi_delete_dialog.png");
    await page.screenshot({ path: delPathBrain, fullPage: false });
    await page.screenshot({ path: delPathAssets, fullPage: false });
    console.log("Screenshot dialog hapus tersimpan:", delPathBrain);

    // Batal hapus
    const cancelDelBtn = page.locator("button:has-text('Batal')");
    if (await cancelDelBtn.isVisible()) {
      await cancelDelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Terbitkan Rekomendasi Baru
  console.log("6. Membuka Modal Terbitkan Surat Rekomendasi Baru...");
  const createBtn = page.locator("button:has-text('Terbitkan Surat Rekomendasi')");
  if (await createBtn.isVisible()) {
    await createBtn.click();
    await page.waitForTimeout(800);
    const createPathBrain = path.join(brainDir, "screenshot_rekomendasi_modal_terbitkan.png");
    const createPathAssets = path.join(assetsDir, "screenshot_rekomendasi_modal_terbitkan.png");
    await page.screenshot({ path: createPathBrain, fullPage: false });
    await page.screenshot({ path: createPathAssets, fullPage: false });
    console.log("Screenshot modal terbitkan tersimpan:", createPathBrain);

    const closeCreateBtn = page.locator("button:has-text('Batal')");
    if (await closeCreateBtn.isVisible()) {
      await closeCreateBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 7. Navigasi ke Ringkasan Modul (/pengawasan/tertib-penyelenggaraan) untuk screenshot Target vs Realisasi Makro
  console.log("7. Navigasi ke Ringkasan Modul /pengawasan/tertib-penyelenggaraan...");
  await page.goto("http://localhost:3000/pengawasan/tertib-penyelenggaraan", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const overviewPathBrain = path.join(brainDir, "screenshot_overview_target_realisasi.png");
  const overviewPathAssets = path.join(assetsDir, "screenshot_overview_target_realisasi.png");
  await page.screenshot({ path: overviewPathBrain, fullPage: false });
  await page.screenshot({ path: overviewPathAssets, fullPage: false });
  console.log("Screenshot ringkasan modul tersimpan:", overviewPathBrain);

  console.log("Semua screenshot sukses diambil!");
  await browser.close();
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
