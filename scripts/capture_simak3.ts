import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureSimak3() {
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

  // 2. Navigasi ke Pelaksanaan Tertib Pemanfaatan (SIMAK 3)
  console.log("2. Navigasi ke Pelaksanaan Tertib Pemanfaatan (SIMAK 3)...");
  await page.goto("http://localhost:3000/pengawasan/tertib-pemanfaatan/pelaksanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama & Tabel (10 Kolom Standar SIPJAKI SIMAK 3)
  console.log("3. Mengambil screenshot tabel utama SIMAK 3 (10 Kolom Standar SIPJAKI)...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_simak3_tabel.png");
  const tableShotDocs = path.join(docsDir, "screenshot_simak3_tabel.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel SIMAK 3:", tableShotArtifact);

  // 4. Buka Modal Edit Pengawasan SIMAK 3
  console.log("4. Membuka modal Edit Pengawasan SIMAK 3...");
  const editButtons = page.locator('button[title="Ubah Data Pengawasan"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    const editShotArtifact = path.join(artifactDir, "screenshot_simak3_edit_modal.png");
    const editShotDocs = path.join(docsDir, "screenshot_simak3_edit_modal.png");
    await page.screenshot({ path: editShotArtifact });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan modal Edit SIMAK 3:", editShotArtifact);

    // Tutup modal edit
    const closeBtn = page.locator('button:has-text("Batal")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Dialog Konfirmasi Hapus Data Pengawasan SIMAK 3
  console.log("5. Membuka dialog konfirmasi Hapus Data Pengawasan SIMAK 3...");
  const deleteButtons = page.locator('button[title="Hapus Data Pengawasan"]');
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    const delShotArtifact = path.join(artifactDir, "screenshot_simak3_delete_dialog.png");
    const delShotDocs = path.join(docsDir, "screenshot_simak3_delete_dialog.png");
    await page.screenshot({ path: delShotArtifact });
    fs.copyFileSync(delShotArtifact, delShotDocs);
    console.log("Tersimpan dialog Hapus SIMAK 3:", delShotArtifact);

    // Tutup dialog hapus
    const cancelDelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelDelBtn.count() > 0) {
      await cancelDelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Tambah Pengawasan SIMAK 3
  console.log("6. Membuka modal Tambah Pengawasan SIMAK 3...");
  const addBtn = page.locator('button:has-text("Tambah Pengawasan")').first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(1000);
    const addShotArtifact = path.join(artifactDir, "screenshot_simak3_add_modal.png");
    const addShotDocs = path.join(docsDir, "screenshot_simak3_add_modal.png");
    await page.screenshot({ path: addShotArtifact });
    fs.copyFileSync(addShotArtifact, addShotDocs);
    console.log("Tersimpan modal Tambah SIMAK 3:", addShotArtifact);
  }

  await browser.close();
  console.log("🎉 Seluruh screenshot SIMAK 3 berhasil diambil dan disimpan!");
}

captureSimak3().catch((err) => {
  console.error("Gagal capture SIMAK 3:", err);
  process.exit(1);
});
