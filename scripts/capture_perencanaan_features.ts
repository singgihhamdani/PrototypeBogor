import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function capturePerencanaanFeatures() {
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

  // 1. Melakukan login demo via /login
  console.log("1. Melakukan login demo via /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")');
  if (await loginBtn.count() > 0) {
    await loginBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("Login berhasil, URL sekarang:", page.url());
  }

  // 2. Navigasi ke Halaman Perencanaan Pelatihan (/pelatihan/perencanaan)
  console.log("2. Navigasi ke /pelatihan/perencanaan...");
  await page.goto("http://localhost:3000/pelatihan/perencanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  // Tunggu data selesai dimuat
  await page.waitForSelector("table tbody tr td:has-text('KABUPATEN BOGOR')", { timeout: 15000 }).catch(() => {
    console.log("Tabel row tidak ditemukan dengan KABUPATEN BOGOR, melanjutkan...");
  });

  // 3. Tangkap Layar Tabel 7 Kolom Baku SIPJAKI + Header EDIT + Kolom DOKUMEN + Kolom PESERTA TKK + Default DESC
  console.log("3. Mengambil screenshot Tabel Baku SIPJAKI Perencanaan Pelatihan...");
  const shotTabelArtifact = path.join(artifactDir, "screenshot_perencanaan_tabel_baku_sipjaki.png");
  const shotTabelDocs = path.join(docsDir, "screenshot_perencanaan_tabel_baku_sipjaki.png");
  await page.screenshot({ path: shotTabelArtifact, fullPage: false });
  fs.copyFileSync(shotTabelArtifact, shotTabelDocs);
  console.log("Screenshot tabel tersimpan:", shotTabelArtifact);

  // 4. Tangkap Layar Modal Manajemen Peserta TKK (Klik tombol Peserta TKK pada baris pertama)
  console.log("4. Membuka Modal Manajemen Peserta TKK (Skema Internal & Eksternal)...");
  const pesertaBtn = page.locator("table tbody tr").first().locator("button:has-text('Peserta')");
  if (await pesertaBtn.count() > 0) {
    await pesertaBtn.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotPesertaArtifact = path.join(artifactDir, "screenshot_perencanaan_modal_peserta_skema_internal.png");
    const shotPesertaDocs = path.join(docsDir, "screenshot_perencanaan_modal_peserta_skema_internal.png");
    await page.screenshot({ path: shotPesertaArtifact, fullPage: false });
    fs.copyFileSync(shotPesertaArtifact, shotPesertaDocs);
    console.log("Screenshot modal peserta tersimpan:", shotPesertaArtifact);

    // Tutup modal peserta
    const closeBtn = page.locator("button:has-text('Tutup')").first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(600);
    }
  } else {
    console.warn("Tombol peserta tidak ditemukan!");
  }

  // 5. Tangkap Layar Modal Edit Perencanaan (Klik tombol Edit baris pertama)
  console.log("5. Membuka Modal Edit Usulan Perencanaan...");
  const editBtn = page.locator("button[title='Edit Data Usulan Perencanaan']");
  if (await editBtn.count() > 0) {
    await editBtn.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotEditArtifact = path.join(artifactDir, "screenshot_perencanaan_modal_edit.png");
    const shotEditDocs = path.join(docsDir, "screenshot_perencanaan_modal_edit.png");
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

  // 6. Tangkap Layar Dialog Konfirmasi Hapus Perencanaan (Klik tombol Hapus baris pertama)
  console.log("6. Membuka Dialog Konfirmasi Hapus Usulan Perencanaan...");
  const deleteBtn = page.locator("button[title='Hapus Data Usulan Perencanaan']");
  if (await deleteBtn.count() > 0) {
    await deleteBtn.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotDeleteArtifact = path.join(artifactDir, "screenshot_perencanaan_delete_dialog.png");
    const shotDeleteDocs = path.join(docsDir, "screenshot_perencanaan_delete_dialog.png");
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

  // 7. Tangkap Layar Portal Peserta Mandiri Eksternal (/portal/peserta)
  console.log("7. Navigasi ke /portal/peserta (Skema Eksternal ID TKK)...");
  await page.goto("http://localhost:3000/portal/peserta", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const shotPortalArtifact = path.join(artifactDir, "screenshot_perencanaan_portal_eksternal_tkk.png");
  const shotPortalDocs = path.join(docsDir, "screenshot_perencanaan_portal_eksternal_tkk.png");
  await page.screenshot({ path: shotPortalArtifact, fullPage: false });
  fs.copyFileSync(shotPortalArtifact, shotPortalDocs);
  console.log("Screenshot portal peserta tersimpan:", shotPortalArtifact);

  await browser.close();
  console.log("Seluruh screenshot fitur Perencanaan Pelatihan sukses diambil!");
}

capturePerencanaanFeatures().catch(err => {
  console.error("Gagal menangkap layar:", err);
  process.exit(1);
});
