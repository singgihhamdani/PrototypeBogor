import { chromium } from "u:/Project/ciptabintar/prototype/node_modules/@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function captureSipjakiBeritaFeatures() {
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

  // 2. Navigasi ke Halaman Berita & Pelaporan Pengawasan SIPJAKI (/berita)
  console.log("2. Navigasi ke /berita...");
  await page.goto("http://localhost:3000/berita", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 3. Tangkap Layar Tabel CMS Berita (Default Riwayat Pelaporan Pengawasan Terkini DESC, Kolom EDIT, Light Surface Header)
  console.log("3. Mengambil screenshot Tabel CMS Berita & Pengawasan (Default Riwayat Pengawasan Terkini DESC, Kolom EDIT)...");
  const shotTabelArtifact = path.join(artifactDir, "screenshot_sipjaki_berita_tabel_terkini.png");
  const shotTabelDocs = path.join(docsDir, "screenshot_sipjaki_berita_tabel_terkini.png");
  await page.screenshot({ path: shotTabelArtifact, fullPage: false });
  fs.copyFileSync(shotTabelArtifact, shotTabelDocs);
  console.log("Screenshot tabel tersimpan:", shotTabelArtifact);

  // 4. Tangkap Layar Modal Tulis Berita Baru (Thumbnail, PDF Laporan, & Mini WYSIWYG Toolbar)
  console.log("4. Membuka Modal Tulis Berita Baru...");
  const createBtn = page.locator("button:has-text('+ TULIS BERITA BARU')");
  if (await createBtn.count() > 0) {
    await createBtn.click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotCreateArtifact = path.join(artifactDir, "screenshot_sipjaki_berita_modal_tulis.png");
    const shotCreateDocs = path.join(docsDir, "screenshot_sipjaki_berita_modal_tulis.png");
    await page.screenshot({ path: shotCreateArtifact, fullPage: false });
    fs.copyFileSync(shotCreateArtifact, shotCreateDocs);
    console.log("Screenshot modal tulis baru tersimpan:", shotCreateArtifact);

    // Tutup modal tulis baru
    const cancelBtn = page.locator("button:has-text('Batal')").first();
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // 5. Tangkap Layar Modal Edit Berita (Klik tombol Edit kuning pada baris pertama)
  console.log("5. Membuka Modal Edit Berita...");
  const editButtons = page.locator("button[title*='Ubah / Edit Data'], table tbody tr button:has-text('Edit')");
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotEditArtifact = path.join(artifactDir, "screenshot_sipjaki_berita_modal_edit.png");
    const shotEditDocs = path.join(docsDir, "screenshot_sipjaki_berita_modal_edit.png");
    await page.screenshot({ path: shotEditArtifact, fullPage: false });
    fs.copyFileSync(shotEditArtifact, shotEditDocs);
    console.log("Screenshot modal edit tersimpan:", shotEditArtifact);

    // Tutup modal edit
    const cancelEdit = page.locator("button:has-text('Batal')").first();
    if (await cancelEdit.count() > 0) {
      await cancelEdit.click();
      await page.waitForTimeout(600);
    }
  }

  // 6. Tangkap Layar Dialog Konfirmasi Hapus Berita (Klik tombol Hapus merah pada baris pertama)
  console.log("6. Membuka Dialog Konfirmasi Hapus Berita...");
  const deleteButtons = page.locator("button[title*='Hapus'], table tbody tr button:has-text('Hapus')");
  if (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    const shotDeleteArtifact = path.join(artifactDir, "screenshot_sipjaki_berita_delete_dialog.png");
    const shotDeleteDocs = path.join(docsDir, "screenshot_sipjaki_berita_delete_dialog.png");
    await page.screenshot({ path: shotDeleteArtifact, fullPage: false });
    fs.copyFileSync(shotDeleteArtifact, shotDeleteDocs);
    console.log("Screenshot dialog hapus tersimpan:", shotDeleteArtifact);

    // Tutup dialog hapus
    const cancelDel = page.locator("button:has-text('Batal')").first();
    if (await cancelDel.count() > 0) {
      await cancelDel.click();
      await page.waitForTimeout(600);
    }
  }

  // 7. Tangkap Layar Pratinjau Portal Warta Publik
  console.log("7. Beralih ke Tab Pratinjau Portal Warta Publik...");
  const portalTab = page.locator("button:has-text('Pratinjau Portal Warta Publik')");
  if (await portalTab.count() > 0) {
    await portalTab.click();
    await page.waitForTimeout(1000);

    const shotPortalArtifact = path.join(artifactDir, "screenshot_sipjaki_berita_portal_view.png");
    const shotPortalDocs = path.join(docsDir, "screenshot_sipjaki_berita_portal_view.png");
    await page.screenshot({ path: shotPortalArtifact, fullPage: false });
    fs.copyFileSync(shotPortalArtifact, shotPortalDocs);
    console.log("Screenshot portal publik tersimpan:", shotPortalArtifact);
  }

  await browser.close();
  console.log("Seluruh screenshot fitur SIPJAKI Berita & Pengawasan sukses diambil!");
}

captureSipjakiBeritaFeatures().catch(console.error);
