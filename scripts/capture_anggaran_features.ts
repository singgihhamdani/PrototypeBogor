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
  await page.waitForTimeout(1000);

  // 2. Navigasi ke Halaman Perencanaan Anggaran Pengawasan (Tertib Usaha)
  console.log("2. Navigasi ke /pengawasan/tertib-usaha/perencanaan/anggaran...");
  await page.goto("http://localhost:3000/pengawasan/tertib-usaha/perencanaan/anggaran", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 3. Screenshot 1: Tabel Anggaran Pengawasan (Tanpa RKA Dinas PUPR, Tanpa Realisasi/Serapan, Kolom DOKUMEN, Default Sort Terkini DESC)
  console.log("3. Mengambil screenshot 1: Tabel Anggaran Pengawasan Terkini DESC...");
  const tabelPathBrain = path.join(brainDir, "screenshot_anggaran_tabel_terkini.png");
  const tabelPathAssets = path.join(assetsDir, "screenshot_anggaran_tabel_terkini.png");
  await page.screenshot({ path: tabelPathBrain, fullPage: false });
  await page.screenshot({ path: tabelPathAssets, fullPage: false });
  console.log("Screenshot tabel tersimpan:", tabelPathBrain);

  // 4. Screenshot 2: Buka Modal Edit pada Baris Pertama
  console.log("4. Membuka Modal Edit Pos Anggaran...");
  const editButtons = page.locator("button[title='Ubah Alokasi Anggaran']");
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(800);
    const editPathBrain = path.join(brainDir, "screenshot_anggaran_modal_edit.png");
    const editPathAssets = path.join(assetsDir, "screenshot_anggaran_modal_edit.png");
    await page.screenshot({ path: editPathBrain, fullPage: false });
    await page.screenshot({ path: editPathAssets, fullPage: false });
    console.log("Screenshot modal edit tersimpan:", editPathBrain);

    // Tutup modal edit
    const cancelBtn = page.locator("button:has-text('Batal')");
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Screenshot 3: Buka Safety Confirmation Dialog Hapus
  console.log("5. Membuka Safety Confirmation Dialog Hapus Pos Anggaran...");
  const deleteButtons = page.locator("button[title='Hapus Pos Anggaran']");
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(600);
    const delPathBrain = path.join(brainDir, "screenshot_anggaran_delete_dialog.png");
    const delPathAssets = path.join(assetsDir, "screenshot_anggaran_delete_dialog.png");
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

  // 6. Screenshot 4: Buka Modal Tambah Pos Anggaran Baru
  console.log("6. Membuka Modal Tambah Pos Anggaran Baru...");
  const addBtn = page.locator("button:has-text('Tambah Pos Anggaran')");
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(800);
    const addPathBrain = path.join(brainDir, "screenshot_anggaran_modal_tambah.png");
    const addPathAssets = path.join(assetsDir, "screenshot_anggaran_modal_tambah.png");
    await page.screenshot({ path: addPathBrain, fullPage: false });
    await page.screenshot({ path: addPathAssets, fullPage: false });
    console.log("Screenshot modal tambah tersimpan:", addPathBrain);

    const closeAddBtn = page.locator("button:has-text('Batal')");
    if (await closeAddBtn.isVisible()) {
      await closeAddBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 7. Screenshot 5: Navigasi ke Anggaran Pengawasan Tertib Penyelenggaraan
  console.log("7. Navigasi ke /pengawasan/tertib-penyelenggaraan/perencanaan/anggaran...");
  await page.goto("http://localhost:3000/pengawasan/tertib-penyelenggaraan/perencanaan/anggaran", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const pilar2PathBrain = path.join(brainDir, "screenshot_anggaran_penyelenggaraan.png");
  const pilar2PathAssets = path.join(assetsDir, "screenshot_anggaran_penyelenggaraan.png");
  await page.screenshot({ path: pilar2PathBrain, fullPage: false });
  await page.screenshot({ path: pilar2PathAssets, fullPage: false });
  console.log("Screenshot anggaran pilar 2 tersimpan:", pilar2PathBrain);

  await browser.close();
  console.log("Semua pengujian dan tangkapan layar fitur anggaran pengawasan selesai!");
}

main().catch((err) => {
  console.error("Gagal mengeksekusi screenshot:", err);
  process.exit(1);
});
