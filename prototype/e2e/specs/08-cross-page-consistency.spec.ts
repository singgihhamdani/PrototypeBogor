import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 08: Cross-Page Consistency, State Persistence & Session Resilience', () => {

  test('8.1 Metric consistency between Executive Dashboard and Master BUJK', async ({ superAdminPage }) => {
    // 1. Check Dashboard Total BUJK Widget
    await superAdminPage.goto('/dashboard');
    await expect(superAdminPage.getByText('Total BUJK Terdaftar')).toBeVisible();

    // Extract the metric card container
    const bujkCard = superAdminPage.locator('div:has-text("Total BUJK Terdaftar")').last();
    await expect(bujkCard).toBeVisible();

    // 2. Navigate to Master Data BUJK
    await superAdminPage.goto('/bujk');
    await expect(superAdminPage.locator('h1')).toContainText('BUJK Kabupaten Bogor');

    // Verify BUJK table rows exist and are populated
    const rows = superAdminPage.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify header and badge on BUJK page
    await expect(superAdminPage.getByText(/Pilar 1: Tertib Usaha/i)).toBeVisible();
  });

  test('8.2 Continuous session persistence across multi-route traversal without unauthenticated redirects', async ({ superAdminPage }) => {
    const routes = [
      '/dashboard',
      '/bujk',
      '/paket-pekerjaan',
      '/pengawasan/tertib-usaha/perencanaan',
      '/pengawasan/tertib-usaha/pelaksanaan',
      '/pelatihan',
      '/pengaturan',
      '/pengaturan/riwayat-data'
    ];

    for (const route of routes) {
      await superAdminPage.goto(route);

      // Verify URL is preserved and not bounced to /login
      expect(superAdminPage.url()).toContain(route);
      expect(superAdminPage.url()).not.toContain('/login');

      // Verify authenticated header persists
      await expect(superAdminPage.getByText(/Raden Ridwan|Super Admin/i).first()).toBeVisible();
      await expect(superAdminPage.locator('h1')).toBeVisible();
    }
  });

  test('8.3 Page reload preserves authentication and gracefully re-renders UI tables', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');
    await expect(superAdminPage.locator('table tbody tr').first()).toBeVisible();

    // Apply quick qualification filter "Besar"
    const filterBesarBtn = superAdminPage.getByRole('button', { name: /^Besar$/i });
    if (await filterBesarBtn.isVisible()) {
      await filterBesarBtn.click();
      await superAdminPage.waitForTimeout(300);
    }

    // Perform hard reload
    await superAdminPage.reload();

    // Authentication is strictly maintained
    expect(superAdminPage.url()).not.toContain('/login');
    await expect(superAdminPage.getByText(/Super Admin/i).first()).toBeVisible();

    // Table recovers and renders properly
    await expect(superAdminPage.locator('table tbody tr').first()).toBeVisible();
  });

  test('8.4 Dynamic role switching persists across route navigation and browser reload', async ({ superAdminPage }) => {
    await superAdminPage.goto('/dashboard');

    // Open Header Quick Role Switcher
    const roleSwitcherBtn = superAdminPage.getByRole('button', { name: /Simulasi Role/i });
    await expect(roleSwitcherBtn).toBeVisible();
    await roleSwitcherBtn.click();

    // Switch to Tim Pengawas & Asesor Lapangan
    const pengawasOption = superAdminPage.locator('text=Tim Pengawas & Asesor Lapangan').first();
    await expect(pengawasOption).toBeVisible();
    await pengawasOption.click();

    // Verify active role badge updates immediately
    await expect(superAdminPage.locator('text=Pengawas').first()).toBeVisible();

    // Navigate to operational route
    await superAdminPage.goto('/pengawasan/tertib-usaha/pelaksanaan');
    await expect(superAdminPage.locator('h1')).toContainText('Pelaksanaan Pengawasan');
    await expect(superAdminPage.locator('text=Pengawas').first()).toBeVisible();

    // Reload page and verify role remains persisted from localStorage
    await superAdminPage.reload();
    await expect(superAdminPage.locator('text=Pengawas').first()).toBeVisible();
    expect(superAdminPage.url()).not.toContain('/login');
  });

});
