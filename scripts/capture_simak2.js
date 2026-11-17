const { chromium } = require("../prototype/node_modules/playwright");
const path = require("path");
const fs = require("fs");

async function captureSimak2() {
  const artifactDir = "C:\\Users\\ultraman\\.gemini\\antigravity\\brain\\d9da67b7-89d2-44a4-84d6-870caf820617";
  const docsDir = path.resolve(__dirname, "../docs/assets/screenshots");

  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1550, height: 980 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Login
  console.log("1. Melakukan login demo...");
  await page.goto("http://localhost:3000/login?redirect=/pengawasan/tertib-penyelenggaraan/pelaksanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")').first();
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await page.waitForURL("**/pengawasan/tertib-penyelenggaraan/pelaksanaan", { timeout: 15000 });
  }
  console.log("Login berhasil, URL:", page.url());
  await page.waitForTimeout(2000);

  // 2. Screenshot Overview (4 Summary Cards + Carousel Tabs)
  console.log("2. Mengambil screenshot Overview SIMAK 2...");
  const overviewPath = path.join(artifactDir, "screenshot_simak2_overview_cards.png");
  await page.screenshot({ path: overviewPath });
  fs.copyFileSync(overviewPath, path.join(docsDir, "screenshot_simak2_overview_cards.png"));
  console.log("Tersimpan overview SIMAK 2:", overviewPath);

  // 3. Tab 2.a (Pemenuhan Standar K4 - Kolom NAMA SKPD & NOMOR KONTRAK)
  console.log("3. Mengambil screenshot Tab 2.a...");
  const tab2a = page.locator('button').filter({ hasText: /^2\.a/ }).first();
  if (await tab2a.count() > 0) {
    await tab2a.click();
    await page.waitForTimeout(1500);
    const table = page.locator('table').first();
    if (await table.count() > 0) {
      await table.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const tab2aPath = path.join(artifactDir, "screenshot_simak2_tab_2a_skpd.png");
    await page.screenshot({ path: tab2aPath });
    fs.copyFileSync(tab2aPath, path.join(docsDir, "screenshot_simak2_tab_2a_skpd.png"));
    console.log("Tersimpan Tab 2.a:", tab2aPath);
  }

  // 4. Tab 2.b (Insidental APBD - Kolom NAMA SATUAN KERJA)
  console.log("4. Mengambil screenshot Tab 2.b...");
  const tab2b = page.locator('button').filter({ hasText: /^2\.b/ }).first();
  if (await tab2b.count() > 0) {
    await tab2b.click();
    await page.waitForTimeout(1500);
    const table = page.locator('table').first();
    if (await table.count() > 0) {
      await table.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const tab2bPath = path.join(artifactDir, "screenshot_simak2_tab_2b_satker.png");
    await page.screenshot({ path: tab2bPath });
    fs.copyFileSync(tab2bPath, path.join(docsDir, "screenshot_simak2_tab_2b_satker.png"));
    console.log("Tersimpan Tab 2.b:", tab2bPath);
  }

  // 5. Tab 2.d (Insidental Non APBD - Kolom NOMOR PERJANJIAN & NAMA PEMILIK PEKERJAAN)
  console.log("5. Mengambil screenshot Tab 2.d...");
  const tab2d = page.locator('button').filter({ hasText: /^2\.d/ }).first();
  if (await tab2d.count() > 0) {
    await tab2d.click();
    await page.waitForTimeout(1500);
    const table = page.locator('table').first();
    if (await table.count() > 0) {
      await table.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const tab2dPath = path.join(artifactDir, "screenshot_simak2_tab_2d_perjanjian.png");
    await page.screenshot({ path: tab2dPath });
    fs.copyFileSync(tab2dPath, path.join(docsDir, "screenshot_simak2_tab_2d_perjanjian.png"));
    console.log("Tersimpan Tab 2.d:", tab2dPath);
  }

  // 6. Buka Modal Detail Pratinjau Dokumen (Kop Surat Resmi, Identitas Proyek, dan Tabel 6 Indikator Pengawasan Teknis)
  console.log("6. Membuka modal Pratinjau Dokumen Pengawasan (Tabel 6 Indikator 5 Kolom)...");
  const tabSemua = page.locator('button').filter({ hasText: /Semua/ }).first();
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

    // Tutup modal pratinjau dokumen dengan Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }

  // 7. Buka Modal Tambah Pengawasan SIMAK 2
  console.log("7. Membuka modal Tambah Pengawasan SIMAK 2...");
  const addBtn = page.locator('button:has-text("Tambah Pengawasan")').first();
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(1500);
    const addPath = path.join(artifactDir, "screenshot_simak2_modal_tambah.png");
    await page.screenshot({ path: addPath });
    fs.copyFileSync(addPath, path.join(docsDir, "screenshot_simak2_modal_tambah.png"));
    console.log("Tersimpan Modal Tambah SIMAK 2:", addPath);

    // Tutup modal tambah
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }

  // 8. Buka Modal Ubah / Edit Pengawasan SIMAK 2
  console.log("8. Membuka modal Edit Pengawasan SIMAK 2...");
  const editBtn = page.locator('button[title="Ubah Data Pengawasan"]').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    const editPath = path.join(artifactDir, "screenshot_simak2_modal_edit.png");
    await page.screenshot({ path: editPath });
    fs.copyFileSync(editPath, path.join(docsDir, "screenshot_simak2_modal_edit.png"));
    console.log("Tersimpan Modal Edit SIMAK 2:", editPath);

    // Tutup modal edit
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  await browser.close();
  console.log("🎉 Seluruh screenshot visual SIMAK 2 berhasil diambil dan disimpan!");
}

captureSimak2().catch((err) => {
  console.error("Gagal capture screenshot SIMAK 2:", err);
  process.exit(1);
});
