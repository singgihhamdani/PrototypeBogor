import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureSimak2() {
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

  // 2. Navigasi ke Pelaksanaan Tertib Penyelenggaraan (SIMAK 2)
  console.log("2. Navigasi ke Pelaksanaan Tertib Penyelenggaraan (SIMAK 2)...");
  await page.goto("http://localhost:3000/pengawasan/tertib-penyelenggaraan/pelaksanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  // 3. Screenshot Overview (4 Summary Cards + Carousel Tabs + Tabel Semua)
  console.log("3. Mengambil screenshot Overview SIMAK 2...");
  const overviewPath = path.join(artifactDir, "screenshot_simak2_overview_cards.png");
  await page.screenshot({ path: overviewPath });
  fs.copyFileSync(overviewPath, path.join(docsDir, "screenshot_simak2_overview_cards.png"));
  console.log("Tersimpan overview SIMAK 2:", overviewPath);

  // 4. Klik Tab 2.a (Pemenuhan Standar K4 - Kolom NAMA SKPD & NOMOR KONTRAK)
  console.log("4. Mengambil screenshot Tab 2.a...");
  const tab2a = page.locator('button:has-text("2.a")').first();
  if (await tab2a.count() > 0) {
    await tab2a.click();
    await page.waitForTimeout(1500);
    const tab2aPath = path.join(artifactDir, "screenshot_simak2_tab_2a_skpd.png");
    await page.screenshot({ path: tab2aPath });
    fs.copyFileSync(tab2aPath, path.join(docsDir, "screenshot_simak2_tab_2a_skpd.png"));
    console.log("Tersimpan Tab 2.a:", tab2aPath);
  }

  // 5. Klik Tab 2.b (Insidental APBD - Kolom NAMA SATUAN KERJA)
  console.log("5. Mengambil screenshot Tab 2.b...");
  const tab2b = page.locator('button:has-text("2.b")').first();
  if (await tab2b.count() > 0) {
    await tab2b.click();
    await page.waitForTimeout(1500);
    const tab2bPath = path.join(artifactDir, "screenshot_simak2_tab_2b_satker.png");
    await page.screenshot({ path: tab2bPath });
    fs.copyFileSync(tab2bPath, path.join(docsDir, "screenshot_simak2_tab_2b_satker.png"));
    console.log("Tersimpan Tab 2.b:", tab2bPath);
  }

  // 6. Klik Tab 2.d (Insidental Non APBD - Kolom NOMOR PERJANJIAN & NAMA PEMILIK PEKERJAAN)
  console.log("6. Mengambil screenshot Tab 2.d...");
  const tab2d = page.locator('button:has-text("2.d")').first();
  if (await tab2d.count() > 0) {
    await tab2d.click();
    await page.waitForTimeout(1500);
    const tab2dPath = path.join(artifactDir, "screenshot_simak2_tab_2d_perjanjian.png");
    await page.screenshot({ path: tab2dPath });
    fs.copyFileSync(tab2dPath, path.join(docsDir, "screenshot_simak2_tab_2d_perjanjian.png"));
    console.log("Tersimpan Tab 2.d:", tab2dPath);
  }

  // 7. Buka Modal Detail Pratinjau Dokumen (Kop Surat + 6 Lingkup Indikator 5 Kolom)
  console.log("7. Membuka modal Pratinjau Dokumen Pengawasan (Tabel 6 Indikator 5 Kolom)...");
  // Kembali ke tab Semua atau 2.a agar data terlihat jelas
  const tabSemua = page.locator('button:has-text("Semua")').first();
  if (await tabSemua.count() > 0) {
    await tabSemua.click();
    await page.waitForTimeout(1000);
  }
  
  const detailBtn = page.locator('button[title="Lihat Pratinjau Dokumen Pengawasan"]').first();
  if (await detailBtn.count() > 0) {
    await detailBtn.click();
    await page.waitForTimeout(1500);
    const docPath = path.join(artifactDir, "screenshot_simak2_modal_pratinjau_dokumen.png");
    await page.screenshot({ path: docPath });
    fs.copyFileSync(docPath, path.join(docsDir, "screenshot_simak2_modal_pratinjau_dokumen.png"));
    console.log("Tersimpan Modal Pratinjau Dokumen:", docPath);

    // Tutup modal pratinjau dokumen
    const closeBtn = page.locator('button:has-text("Tutup")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 8. Buka Modal Tambah Pengawasan SIMAK 2
  console.log("8. Membuka modal Tambah Pengawasan SIMAK 2...");
  const addBtn = page.locator('button:has-text("Tambah Pengawasan")').first();
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(1000);
    const addPath = path.join(artifactDir, "screenshot_simak2_modal_tambah.png");
    await page.screenshot({ path: addPath });
    fs.copyFileSync(addPath, path.join(docsDir, "screenshot_simak2_modal_tambah.png"));
    console.log("Tersimpan Modal Tambah SIMAK 2:", addPath);
  }

  await browser.close();
  console.log("🎉 Seluruh screenshot visual SIMAK 2 berhasil diambil dan disimpan!");
}

captureSimak2().catch((err) => {
  console.error("Gagal capture screenshot SIMAK 2:", err);
  process.exit(1);
});
