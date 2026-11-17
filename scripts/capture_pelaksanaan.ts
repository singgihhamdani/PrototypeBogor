import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capturePelaksanaan() {
  const artifactDir = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Login terlebih dahulu sebagai Super Admin / Admin Bidang
  console.log("1. Melakukan login demo...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  // Klik tombol Masuk ke Dashboard Dinas
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  await loginBtn.click();
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Login berhasil, URL sekarang:", page.url());

  // 2. Navigasi ke Pelaksanaan Pengawasan (Tertib Usaha)
  console.log("2. Navigasi ke Pelaksanaan Pengawasan (Tertib Usaha)...");
  await page.goto("http://localhost:3000/pengawasan/tertib-usaha/pelaksanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama & Tabel (Urutan Terkini, Standar SIPJAKI SIMAK 1)
  console.log("3. Mengambil screenshot tabel utama pengawasan...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_pelaksanaan_tabel.png");
  const tableShotDocs = path.join(docsDir, "screenshot_pelaksanaan_tabel.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel:", tableShotArtifact);

  // 4. Buka Modal Edit
  console.log("4. Membuka modal Edit Pengawasan...");
  const editButtons = page.locator('button[title="Ubah Data Pengawasan"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    const editShotArtifact = path.join(artifactDir, "screenshot_pelaksanaan_edit_modal.png");
    const editShotDocs = path.join(docsDir, "screenshot_pelaksanaan_edit_modal.png");
    await page.screenshot({ path: editShotArtifact });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan modal Edit:", editShotArtifact);

    // Tutup modal edit
    const closeBtn = page.locator('button:has-text("Batal")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Dialog Hapus
  console.log("5. Membuka dialog Konfirmasi Hapus Pengawasan...");
  const deleteButtons = page.locator('button[title="Hapus Data Pengawasan"]');
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    const deleteShotArtifact = path.join(artifactDir, "screenshot_pelaksanaan_delete_dialog.png");
    const deleteShotDocs = path.join(docsDir, "screenshot_pelaksanaan_delete_dialog.png");
    await page.screenshot({ path: deleteShotArtifact });
    fs.copyFileSync(deleteShotArtifact, deleteShotDocs);
    console.log("Tersimpan dialog Hapus:", deleteShotArtifact);
  }

  await browser.close();
  console.log("🎉 Pengambilan seluruh screenshot Pelaksanaan Pengawasan berhasil tuntas!");
}

capturePelaksanaan().catch((err) => {
  console.error("Gagal menangkap screenshot:", err);
  process.exit(1);
});
