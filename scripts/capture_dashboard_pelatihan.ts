import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureDashboardPelatihan() {
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

  // 2. Navigasi ke Dashboard Pelatihan SIPJAKI (10 Kolom)
  console.log("2. Navigasi ke Dashboard Pelatihan SIPJAKI...");
  await page.goto("http://localhost:3000/sipjaki/pelatihan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama (2 Kartu Informasi, Filter, Table Toolbar, & Tabel 10 Kolom)
  console.log("3. Mengambil screenshot tabel utama Dashboard Pelatihan (10 Kolom Standar SIPJAKI)...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_pelatihan_tabel_10_kolom.png");
  const tableShotDocs = path.join(docsDir, "screenshot_pelatihan_tabel_10_kolom.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel Pelatihan:", tableShotArtifact);

  // 4. Buka Modal Tambah Pelatihan
  console.log("4. Membuka modal Tambah Pelatihan...");
  const addBtn = page.locator('button:has-text("TAMBAH PELATIHAN")');
  if (await addBtn.count() > 0) {
    await addBtn.first().click();
    await page.waitForTimeout(1000);
    const addShotArtifact = path.join(artifactDir, "screenshot_pelatihan_add_modal.png");
    const addShotDocs = path.join(docsDir, "screenshot_pelatihan_add_modal.png");
    await page.screenshot({ path: addShotArtifact });
    fs.copyFileSync(addShotArtifact, addShotDocs);
    console.log("Tersimpan modal Tambah Pelatihan:", addShotArtifact);

    // Tutup modal tambah
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Modal Detail Pelatihan (Ikon Mata Biru)
  console.log("5. Membuka modal Detail Pelatihan (Mata Biru)...");
  const detailButtons = page.locator('button[title="Lihat Detail Pelatihan"]');
  if (await detailButtons.count() > 0) {
    await detailButtons.first().click();
    await page.waitForTimeout(1000);
    const detailShotArtifact = path.join(artifactDir, "screenshot_pelatihan_detail_modal.png");
    const detailShotDocs = path.join(docsDir, "screenshot_pelatihan_detail_modal.png");
    await page.screenshot({ path: detailShotArtifact });
    fs.copyFileSync(detailShotArtifact, detailShotDocs);
    console.log("Tersimpan modal Detail Pelatihan:", detailShotArtifact);

    // Tutup modal detail
    const closeBtn = page.locator('button:has-text("Tutup Rincian")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Edit Pelatihan (Ikon Pensil Kuning)
  console.log("6. Membuka modal Edit Pelatihan (Pensil Kuning)...");
  const editButtons = page.locator('button[title="Edit Kegiatan Pelatihan"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    const editShotArtifact = path.join(artifactDir, "screenshot_pelatihan_edit_modal.png");
    const editShotDocs = path.join(docsDir, "screenshot_pelatihan_edit_modal.png");
    await page.screenshot({ path: editShotArtifact });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan modal Edit Pelatihan:", editShotArtifact);

    // Tutup modal edit
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 7. Pilih beberapa baris (Checkbox) dan Buka Dialog Hapus Terpilih
  console.log("7. Memilih baris dengan checkbox dan membuka dialog Hapus Terpilih...");
  const rowCheckboxes = page.locator('table tbody tr input[type="checkbox"]');
  const count = await rowCheckboxes.count();
  if (count >= 2) {
    await rowCheckboxes.nth(0).check();
    await rowCheckboxes.nth(1).check();
    await page.waitForTimeout(500);

    const bulkDeleteBtn = page.locator('button:has-text("HAPUS TERPILIH")');
    if (await bulkDeleteBtn.count() > 0) {
      await bulkDeleteBtn.first().click();
      await page.waitForTimeout(1000);
      const bulkShotArtifact = path.join(artifactDir, "screenshot_pelatihan_bulk_delete_dialog.png");
      const bulkShotDocs = path.join(docsDir, "screenshot_pelatihan_bulk_delete_dialog.png");
      await page.screenshot({ path: bulkShotArtifact });
      fs.copyFileSync(bulkShotArtifact, bulkShotDocs);
      console.log("Tersimpan dialog Hapus Terpilih:", bulkShotArtifact);

      // Batal dialog
      const cancelBtn = page.locator('button:has-text("Batal")').last();
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }

  await browser.close();
  console.log("Semua screenshot Dashboard Pelatihan selesai diambil!");
}

captureDashboardPelatihan().catch((err) => {
  console.error("Gagal capture Dashboard Pelatihan:", err);
  process.exit(1);
});
