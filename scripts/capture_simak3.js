const { chromium } = require("../prototype/node_modules/playwright");
const path = require("path");
const fs = require("fs");

async function captureSimak3() {
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
  await page.goto("http://localhost:3000/login?redirect=/pengawasan/tertib-pemanfaatan/pelaksanaan", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  const loginBtn = page.locator('button:has-text("Masuk ke Dashboard Dinas")').first();
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await page.waitForURL("**/pengawasan/tertib-pemanfaatan/pelaksanaan", { timeout: 15000 });
  }
  console.log("Login berhasil, URL:", page.url());
  await page.waitForTimeout(2000);

  // 2. Screenshot Overview (4 Summary Cards + Carousel Tabs + Tabel 10 Kolom Baku)
  console.log("2. Mengambil screenshot Overview SIMAK 3...");
  const overviewPath = path.join(artifactDir, "screenshot_simak3_overview_cards.png");
  await page.screenshot({ path: overviewPath });
  fs.copyFileSync(overviewPath, path.join(docsDir, "screenshot_simak3_overview_cards.png"));
  console.log("Tersimpan overview SIMAK 3:", overviewPath);

  // 3. Tab Daftar Simak 3 (Scrolled to Table)
  console.log("3. Mengambil screenshot Tab Daftar Simak 3 & Tabel 10 Kolom Baku...");
  const tabSimak3 = page.locator('button').filter({ hasText: /Daftar Simak 3/ }).first();
  if (await tabSimak3.count() > 0) {
    await tabSimak3.click();
    await page.waitForTimeout(1500);
    const table = page.locator('table').first();
    if (await table.count() > 0) {
      await table.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const tabSimak3Path = path.join(artifactDir, "screenshot_simak3_tab_10kolom.png");
    await page.screenshot({ path: tabSimak3Path });
    fs.copyFileSync(tabSimak3Path, path.join(docsDir, "screenshot_simak3_tab_10kolom.png"));
    console.log("Tersimpan Tab Simak 3:", tabSimak3Path);
  }

  // 4. Buka Modal Detail Pratinjau Dokumen Pengawasan (Kop Resmi + Identitas Bangunan + Tabel 4 Indikator 5 Kolom)
  console.log("4. Membuka modal Pratinjau Dokumen Pengawasan SIMAK 3...");
  const detailBtn = page.locator('button[title="Lihat Pratinjau Dokumen Pengawasan"]').first();
  if (await detailBtn.count() > 0) {
    await detailBtn.click();
    await page.waitForTimeout(1500);
    const docPath = path.join(artifactDir, "screenshot_simak3_modal_pratinjau_dokumen.png");
    await page.screenshot({ path: docPath });
    fs.copyFileSync(docPath, path.join(docsDir, "screenshot_simak3_modal_pratinjau_dokumen.png"));
    console.log("Tersimpan Modal Pratinjau Dokumen:", docPath);

    // Tutup modal pratinjau dokumen dengan Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }

  // 5. Buka Modal Tambah Simak 3 (+ Tambah Simak 3)
  console.log("5. Membuka modal Tambah Simak 3...");
  const addBtn = page.locator('button:has-text("Tambah Simak 3")').first();
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(1500);
    const addPath = path.join(artifactDir, "screenshot_simak3_modal_tambah.png");
    await page.screenshot({ path: addPath });
    fs.copyFileSync(addPath, path.join(docsDir, "screenshot_simak3_modal_tambah.png"));
    console.log("Tersimpan Modal Tambah SIMAK 3:", addPath);

    // Tutup modal tambah
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }

  // 6. Buka Modal Ubah / Edit Pengawasan SIMAK 3
  console.log("6. Membuka modal Edit Pengawasan SIMAK 3...");
  const editBtn = page.locator('button[title="Ubah Data Pengawasan"]').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(1500);
    const editPath = path.join(artifactDir, "screenshot_simak3_modal_edit.png");
    await page.screenshot({ path: editPath });
    fs.copyFileSync(editPath, path.join(docsDir, "screenshot_simak3_modal_edit.png"));
    console.log("Tersimpan Modal Edit SIMAK 3:", editPath);

    // Tutup modal edit
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  await browser.close();
  console.log("🎉 Seluruh screenshot visual SIMAK 3 berhasil diambil dan disimpan!");
}

captureSimak3().catch((err) => {
  console.error("Gagal capture screenshot SIMAK 3:", err);
  process.exit(1);
});
