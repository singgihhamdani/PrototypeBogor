import { test, expect } from '../fixtures/auth.fixture';

/**
 * Suite 1: Smoke & Route Health Testing (Sanity Check)
 * Target: Memastikan semua rute utama SIJAKON dapat diakses, responsif, dan bebas error konsol.
 */

test.describe('Suite 1: Smoke & Route Health Testing', () => {
  test('1.1. Halaman Beranda Publik (Landing Page) terbuka normal dengan metadata resmi', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Verifikasi Title & Branding
    await expect(page).toHaveTitle(/SIJAKON/i);
    await expect(page.locator('text=Dinas Pekerjaan Umum').first()).toBeVisible();

    // Pastikan tidak ada unhandled JavaScript crash
    const fatalErrors = consoleErrors.filter(
      (err) => err.includes('TypeError') || err.includes('ReferenceError') || err.includes('hydration')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('1.2. Halaman Login terbuka dengan form login & pemilih role demo', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('button', { name: /Masuk ke Dashboard|Masuk/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Super Admin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tim Pengawas/i })).toBeVisible();
  });

  test('1.3. Akses Seluruh Rute Dashboard Utama sebagai Super Admin (Zero Crash Check)', async ({ superAdminPage }) => {
    const routesToTest = [
      { path: '/dashboard', title: 'Dashboard' },
      { path: '/bujk', title: 'BUJK' },
      { path: '/paket-pekerjaan', title: 'Paket' },
      { path: '/pengawasan', title: 'Pengawasan' },
      { path: '/pengawasan/tertib-usaha/perencanaan', title: 'Perencanaan' },
      { path: '/pengawasan/tertib-usaha/pelaksanaan', title: 'Pelaksanaan' },
      { path: '/pengawasan/tertib-usaha/rekomendasi', title: 'Rekomendasi' },
      { path: '/pengawasan/tertib-usaha/pelaporan', title: 'Pelaporan' },
      { path: '/pengawasan/tertib-penyelenggaraan', title: 'Penyelenggaraan' },
      { path: '/pengawasan/tertib-pemanfaatan', title: 'Pemanfaatan' },
      { path: '/pelatihan', title: 'Pelatihan' },
      { path: '/pelaporan', title: 'Pelaporan' },
      { path: '/kecelakaan', title: 'Kecelakaan' },
      { path: '/regulasi', title: 'Regulasi' },
      { path: '/profil-opd', title: 'OPD' },
      { path: '/webgis', title: 'WebGIS' },
      { path: '/pengaturan', title: 'Pengaturan' },
    ];

    for (const route of routesToTest) {
      const response = await superAdminPage.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(
        response?.status(),
        `Gagal mengakses rute ${route.path}, status: ${response?.status()}`
      ).toBeLessThan(400);

      // Verifikasi halaman me-render konten dasar (bukan halaman 404 / error)
      await expect(superAdminPage.locator('body')).not.toContainText('404 - Halaman Tidak Ditemukan');
      await expect(superAdminPage.locator('body')).not.toContainText('Application error');
    }
  });

  test('1.4. Tampilan Responsif Mobile Viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Header mobile harus tampil rapi tanpa overflow horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // Toleransi subpixel 2px
  });
});
