import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capturePaketPekerjaan() {
  const artifactDir = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1480, height: 950 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Login
  console.log("1. Melakukan login demo...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  await loginBtn.click();
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Login berhasil, URL:", page.url());

  // 2. Navigasi ke Halaman Data Paket Pekerjaan
  console.log("2. Navigasi ke Data Paket Pekerjaan (SIPJAKI 19 Kolom)...");
  await page.goto("http://localhost:3000/paket-pekerjaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama (2 Kartu Informasi, Filter Bar, & Tabel 19 Kolom)
  console.log("3. Mengambil screenshot tabel utama Paket Pekerjaan (19 Kolom Standar SIPJAKI)...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_paket_tabel_19_kolom.png");
  const tableShotDocs = path.join(docsDir, "screenshot_paket_tabel_19_kolom.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel Paket Pekerjaan:", tableShotArtifact);

  // 4. Buka Modal Edit Paket Pekerjaan
  console.log("4. Membuka modal Edit Paket Pekerjaan...");
  const editButtons = page.locator('button[title="Edit Data Paket"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    const editShotArtifact = path.join(artifactDir, "screenshot_paket_edit_modal.png");
    const editShotDocs = path.join(docsDir, "screenshot_paket_edit_modal.png");
    await page.screenshot({ path: editShotArtifact });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan modal Edit Paket Pekerjaan:", editShotArtifact);

    // Tutup modal edit
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Dialog Konfirmasi Hapus
  console.log("5. Membuka dialog Konfirmasi Hapus Paket...");
  const deleteButtons = page.locator('button[title="Hapus Paket Pekerjaan"]');
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    const deleteShotArtifact = path.join(artifactDir, "screenshot_paket_delete_dialog.png");
    const deleteShotDocs = path.join(docsDir, "screenshot_paket_delete_dialog.png");
    await page.screenshot({ path: deleteShotArtifact });
    fs.copyFileSync(deleteShotArtifact, deleteShotDocs);
    console.log("Tersimpan dialog Hapus Paket:", deleteShotArtifact);

    // Batal hapus
    const cancelDelBtn = page.locator('button:has-text("Batal")').last();
    if (await cancelDelBtn.count() > 0) {
      await cancelDelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Tambah Paket
  console.log("6. Membuka modal Tambah Paket Pekerjaan (19 Kolom)...");
  const addBtn = page.locator('button:has-text("Tambah Paket")');
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(1000);
    const addShotArtifact = path.join(artifactDir, "screenshot_paket_add_modal.png");
    const addShotDocs = path.join(docsDir, "screenshot_paket_add_modal.png");
    await page.screenshot({ path: addShotArtifact });
    fs.copyFileSync(addShotArtifact, addShotDocs);
    console.log("Tersimpan modal Tambah Paket:", addShotArtifact);

    const cancelAddBtn = page.locator('button:has-text("Batal")').last();
    if (await cancelAddBtn.count() > 0) {
      await cancelAddBtn.click();
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  console.log("Semua tangkapan layar paket pekerjaan berhasil diambil!");
}

capturePaketPekerjaan().catch(console.error);
