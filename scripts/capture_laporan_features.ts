import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureLaporanFeatures() {
  const artifactDir = "C:/Users/ultraman/.gemini/antigravity/brain/d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1540, height: 980 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Login demo via /login
  console.log("1. Melakukan login demo via /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("Login berhasil, URL sekarang:", page.url());
  }

  // 2. Navigasi ke Halaman Laporan Pelatihan (/pelatihan/laporan)
  console.log("2. Navigasi ke /pelatihan/laporan...");
  await page.goto("http://localhost:3000/pelatihan/laporan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Tabel 8 Kolom Baku SIPJAKI (Header EDIT, Tanpa Kolom Status, Badge KAK & BA, Default Sort DESC)
  console.log("3. Mengambil screenshot Tabel Baku SIPJAKI Laporan Pelatihan...");
  const shotTabelArtifact = path.join(artifactDir, "screenshot_laporan_tabel_baku_sipjaki.png");
  const shotTabelDocs = path.join(docsDir, "screenshot_laporan_tabel_baku_sipjaki.png");
  await page.screenshot({ path: shotTabelArtifact, fullPage: false });
  fs.copyFileSync(shotTabelArtifact, shotTabelDocs);
  console.log("Screenshot tabel tersimpan:", shotTabelArtifact);

  // 4. Tangkap Layar Modal Edit Laporan (Klik tombol Edit baris pertama)
  console.log("4. Membuka Modal Edit Laporan...");
  const editButtons = page.locator("button[title='Edit Data Laporan Pelatihan']");
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotEditArtifact = path.join(artifactDir, "screenshot_laporan_modal_edit.png");
    const shotEditDocs = path.join(docsDir, "screenshot_laporan_modal_edit.png");
    await page.screenshot({ path: shotEditArtifact, fullPage: false });
    fs.copyFileSync(shotEditArtifact, shotEditDocs);
    console.log("Screenshot modal edit tersimpan:", shotEditArtifact);

    // Tutup modal edit
    const cancelEdit = page.locator("button:has-text('Batal')").first();
    if (await cancelEdit.count() > 0) {
      await cancelEdit.click();
      await page.waitForTimeout(600);
    }
  } else {
    console.warn("Tombol edit tidak ditemukan!");
  }

  // 5. Tangkap Layar Modal Pratinjau Dokumen (Klik badge BA atau KAK baris pertama)
  console.log("5. Membuka Modal Pratinjau Dokumen (KAK & BA)...");
  await page.waitForTimeout(500);
  const docBtn = page.locator("table tbody tr").first().locator("button:has-text('BA'), button:has-text('KAK')");
  if (await docBtn.count() > 0) {
    await docBtn.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotDocArtifact = path.join(artifactDir, "screenshot_laporan_dokumen_preview.png");
    const shotDocDocs = path.join(docsDir, "screenshot_laporan_dokumen_preview.png");
    await page.screenshot({ path: shotDocArtifact, fullPage: false });
    fs.copyFileSync(shotDocArtifact, shotDocDocs);
    console.log("Screenshot modal dokumen tersimpan:", shotDocArtifact);

    // Tutup modal dokumen
    const closeDoc = page.locator("button:has-text('Tutup')").first();
    if (await closeDoc.count() > 0) {
      await closeDoc.click();
      await page.waitForTimeout(600);
    }
  } else {
    console.warn("Badge dokumen tidak ditemukan!");
  }

  // 6. Tangkap Layar Dialog Konfirmasi Hapus Laporan (Klik tombol Hapus baris pertama)
  console.log("6. Membuka Dialog Konfirmasi Hapus Laporan...");
  const deleteButtons = page.locator("button[title='Hapus Data Laporan Pelatihan']");
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotDeleteArtifact = path.join(artifactDir, "screenshot_laporan_delete_dialog.png");
    const shotDeleteDocs = path.join(docsDir, "screenshot_laporan_delete_dialog.png");
    await page.screenshot({ path: shotDeleteArtifact, fullPage: false });
    fs.copyFileSync(shotDeleteArtifact, shotDeleteDocs);
    console.log("Screenshot dialog hapus tersimpan:", shotDeleteArtifact);

    const cancelDelete = page.locator("button:has-text('Batal')").first();
    if (await cancelDelete.count() > 0) {
      await cancelDelete.click();
      await page.waitForTimeout(600);
    }
  } else {
    console.warn("Tombol hapus tidak ditemukan!");
  }

  await browser.close();
  console.log("Semua tangkapan layar fitur laporan selesai diambil!");
}

captureLaporanFeatures().catch(err => {
  console.error("Gagal menangkap layar:", err);
  process.exit(1);
});
