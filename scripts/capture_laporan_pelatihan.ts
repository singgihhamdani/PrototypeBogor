import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureLaporanPelatihan() {
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

  // 2. Navigasi ke Laporan Pelatihan & Sertifikasi TKK
  console.log("2. Navigasi ke Laporan Pelatihan & Sertifikasi...");
  await page.goto("http://localhost:3000/pelatihan/laporan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama (3 Kartu Informasi, Filter, Table Toolbar, & Tabel 11 Kolom)
  console.log("3. Mengambil screenshot tabel utama Laporan Pelatihan (11 Kolom Standar SIPJAKI)...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_laporan_pelatihan_tabel_11_kolom.png");
  const tableShotDocs = path.join(docsDir, "screenshot_laporan_pelatihan_tabel_11_kolom.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel Laporan Pelatihan:", tableShotArtifact);

  // 4. Buka Modal Tambah Data
  console.log("4. Membuka modal Tambah Data Laporan...");
  const addBtn = page.locator('button:has-text("TAMBAH DATA")');
  if (await addBtn.count() > 0) {
    await addBtn.first().click();
    await page.waitForTimeout(1000);
    const addShotArtifact = path.join(artifactDir, "screenshot_laporan_pelatihan_add_modal.png");
    const addShotDocs = path.join(docsDir, "screenshot_laporan_pelatihan_add_modal.png");
    await page.screenshot({ path: addShotArtifact });
    fs.copyFileSync(addShotArtifact, addShotDocs);
    console.log("Tersimpan modal Tambah Laporan:", addShotArtifact);

    // Tutup modal tambah
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Modal Dokumen Berita Acara ("Lihat")
  console.log("5. Membuka modal Dokumen Berita Acara (Tombol Lihat)...");
  const docButtons = page.locator('button:has-text("Lihat")');
  if (await docButtons.count() > 0) {
    await docButtons.first().click();
    await page.waitForTimeout(1000);
    const docShotArtifact = path.join(artifactDir, "screenshot_laporan_pelatihan_doc_modal.png");
    const docShotDocs = path.join(docsDir, "screenshot_laporan_pelatihan_doc_modal.png");
    await page.screenshot({ path: docShotArtifact });
    fs.copyFileSync(docShotArtifact, docShotDocs);
    console.log("Tersimpan modal Dokumen Berita Acara:", docShotArtifact);

    // Tutup modal dokumen
    const closeDocBtn = page.locator('button:has-text("Tutup")').first();
    if (await closeDocBtn.count() > 0) {
      await closeDocBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Edit Data (Tombol Pensil Kuning)
  console.log("6. Membuka modal Edit Data Laporan...");
  const editButtons = page.locator('button[title*="Ubah"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    const editShotArtifact = path.join(artifactDir, "screenshot_laporan_pelatihan_edit_modal.png");
    const editShotDocs = path.join(docsDir, "screenshot_laporan_pelatihan_edit_modal.png");
    await page.screenshot({ path: editShotArtifact });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan modal Edit Laporan:", editShotArtifact);

    // Tutup modal edit
    const cancelEditBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelEditBtn.count() > 0) {
      await cancelEditBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 7. Buka Dialog Konfirmasi Hapus (Tombol Tempat Sampah Merah)
  console.log("7. Membuka dialog Konfirmasi Hapus Laporan...");
  const deleteButtons = page.locator('button[title*="Hapus"]');
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    const delShotArtifact = path.join(artifactDir, "screenshot_laporan_pelatihan_delete_dialog.png");
    const delShotDocs = path.join(docsDir, "screenshot_laporan_pelatihan_delete_dialog.png");
    await page.screenshot({ path: delShotArtifact });
    fs.copyFileSync(delShotArtifact, delShotDocs);
    console.log("Tersimpan dialog Hapus Laporan:", delShotArtifact);

    // Tutup dialog hapus
    const cancelDelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelDelBtn.count() > 0) {
      await cancelDelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  console.log("Selesai menangkap seluruh screenshot Laporan Pelatihan TKK!");
}

captureLaporanPelatihan().catch(err => {
  console.error("Gagal capture laporan pelatihan:", err);
  process.exit(1);
});
