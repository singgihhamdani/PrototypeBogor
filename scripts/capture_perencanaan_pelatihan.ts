import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capturePerencanaanPelatihan() {
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

  // 2. Navigasi ke Perencanaan Pelatihan & Sertifikasi TKK
  console.log("2. Navigasi ke Perencanaan Pelatihan & Sertifikasi...");
  await page.goto("http://localhost:3000/pelatihan/perencanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Halaman Utama (3 Kartu Informasi, Filter, Table Toolbar, & Tabel 9 Kolom)
  console.log("3. Mengambil screenshot tabel utama Perencanaan Pelatihan (9 Kolom Standar SIPJAKI)...");
  const tableShotArtifact = path.join(artifactDir, "screenshot_perencanaan_pelatihan_tabel_9_kolom.png");
  const tableShotDocs = path.join(docsDir, "screenshot_perencanaan_pelatihan_tabel_9_kolom.png");
  await page.screenshot({ path: tableShotArtifact, fullPage: false });
  fs.copyFileSync(tableShotArtifact, tableShotDocs);
  console.log("Tersimpan tabel Perencanaan Pelatihan:", tableShotArtifact);

  // 4. Buka Modal Tambah Data
  console.log("4. Membuka modal Tambah Data Perencanaan...");
  const addBtn = page.locator('button:has-text("TAMBAH DATA")');
  if (await addBtn.count() > 0) {
    await addBtn.first().click();
    await page.waitForTimeout(1000);
    const addShotArtifact = path.join(artifactDir, "screenshot_perencanaan_pelatihan_add_modal.png");
    const addShotDocs = path.join(docsDir, "screenshot_perencanaan_pelatihan_add_modal.png");
    await page.screenshot({ path: addShotArtifact });
    fs.copyFileSync(addShotArtifact, addShotDocs);
    console.log("Tersimpan modal Tambah Perencanaan:", addShotArtifact);

    // Tutup modal tambah
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Buka Modal Dokumen KAK ("Lihat")
  console.log("5. Membuka modal Dokumen KAK (Tombol Lihat)...");
  const docButtons = page.locator('button:has-text("Lihat")');
  if (await docButtons.count() > 0) {
    await docButtons.first().click();
    await page.waitForTimeout(1000);
    const docShotArtifact = path.join(artifactDir, "screenshot_perencanaan_pelatihan_doc_modal.png");
    const docShotDocs = path.join(docsDir, "screenshot_perencanaan_pelatihan_doc_modal.png");
    await page.screenshot({ path: docShotArtifact });
    fs.copyFileSync(docShotArtifact, docShotDocs);
    console.log("Tersimpan modal Dokumen KAK:", docShotArtifact);

    // Tutup modal dokumen
    const closeBtn = page.locator('button:has-text("Tutup Pratinjau")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6. Buka Modal Edit Perencanaan (Pensil Kuning)
  console.log("6. Membuka modal Edit Perencanaan (Pensil Kuning)...");
  const editButtons = page.locator('button[title="Ubah Data Perencanaan"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    const editShotArtifact = path.join(artifactDir, "screenshot_perencanaan_pelatihan_edit_modal.png");
    const editShotDocs = path.join(docsDir, "screenshot_perencanaan_pelatihan_edit_modal.png");
    await page.screenshot({ path: editShotArtifact });
    fs.copyFileSync(editShotArtifact, editShotDocs);
    console.log("Tersimpan modal Edit Perencanaan:", editShotArtifact);

    // Tutup modal edit
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 7. Buka Dialog Hapus Data Perencanaan (Tempat Sampah Merah)
  console.log("7. Membuka dialog Hapus Data Perencanaan...");
  const deleteButtons = page.locator('button[title="Hapus Data Perencanaan"]');
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    const deleteShotArtifact = path.join(artifactDir, "screenshot_perencanaan_pelatihan_delete_dialog.png");
    const deleteShotDocs = path.join(docsDir, "screenshot_perencanaan_pelatihan_delete_dialog.png");
    await page.screenshot({ path: deleteShotArtifact });
    fs.copyFileSync(deleteShotArtifact, deleteShotDocs);
    console.log("Tersimpan dialog Hapus Perencanaan:", deleteShotArtifact);

    // Tutup dialog hapus
    const cancelBtn = page.locator('button:has-text("Batal")').last();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  await browser.close();
  console.log("Semua screenshot Perencanaan Pelatihan selesai diambil!");
}

capturePerencanaanPelatihan().catch((err) => {
  console.error("Gagal capture Perencanaan Pelatihan:", err);
  process.exit(1);
});
