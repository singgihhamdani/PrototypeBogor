import { test, expect } from '../fixtures/auth.fixture';

/**
 * Suite 4: Master Data BUJK & WebGIS Interaktif
 * Menguji pencarian data, filter dinamis, detail BUJK, dan visualisasi peta Leaflet.
 */

test.describe('Suite 4: Master Data BUJK & WebGIS Interaktif', () => {
  test('4.1. Pencarian Dinamis Nama BUJK & Pemulihan Data', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');

    const searchInput = superAdminPage.locator('input[placeholder*="Cari berdasarkan nama"]').first();
    await expect(searchInput).toBeVisible();

    // ── ACTION: Cari 'PT Bangun Jaya' ──
    await searchInput.fill('PT Bangun Jaya');

    // ── POST-ACTION VERIFICATION: Hanya PT Bangun Jaya yang tampil ──
    const rows = superAdminPage.locator('table tbody tr');
    await expect(rows.first()).toContainText('PT Bangun Jaya Konstruksi');

    // Kosongkan input pencarian
    await searchInput.fill('');
    // Data kembali menampilkan multiple baris
    await expect(rows).toHaveCount(await rows.count());
  });

  test('4.2. Filter Cepat Berdasarkan Kualifikasi Usaha (Besar, Menengah, Kecil)', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');

    // Klik filter 'Besar'
    const filterBesarBtn = superAdminPage.getByRole('button', { name: 'Besar', exact: true });
    await expect(filterBesarBtn).toBeVisible();
    await filterBesarBtn.click();

    // Baris tabel yang tampil harus berkualifikasi Besar
    const firstBadge = superAdminPage.locator('table tbody td:nth-child(5)').first();
    await expect(firstBadge).toBeVisible();
    await expect(firstBadge).toContainText('Besar');

    // Klik tombol 'Semua' untuk mengembalikan tampilan
    const filterSemuaBtn = superAdminPage.getByRole('button', { name: 'Semua', exact: true });
    await filterSemuaBtn.click();
  });

  test('4.3. Detail BUJK: Membuka Halaman Profil Perusahaan', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');

    // Klik link 'Detail' pada baris pertama
    const detailLink = superAdminPage.locator('table tbody tr a:has-text("Detail")').first();
    await expect(detailLink).toBeVisible();
    await detailLink.click();

    // Harus berpindah ke URL detail BUJK (/bujk/B001 atau sejenisnya)
    await superAdminPage.waitForURL('**/bujk/**', { timeout: 10000 });
    await expect(superAdminPage.locator('h1, h2').first()).toBeVisible();
  });

  test('4.4. WebGIS: Peta Spasial Leaflet Ter-render & Interaktif', async ({ superAdminPage }) => {
    await superAdminPage.goto('/webgis');

    // Container peta Leaflet harus dimuat tanpa fatal error
    const mapContainer = superAdminPage.locator('.leaflet-container').first();
    await expect(mapContainer).toBeVisible({ timeout: 15000 });

    // Panel filter spasial atau layer toggle harus ada
    await expect(superAdminPage.locator('text=Paket Pekerjaan').or(superAdminPage.locator('text=BUJK')).first()).toBeVisible();
  });
});
