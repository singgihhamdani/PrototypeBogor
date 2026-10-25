import { test, expect } from '../fixtures/auth.fixture';

/**
 * Suite 2: Autentikasi & Role-Based Access Control (RBAC) Simulation
 * Menguji hak akses dan adaptasi antarmuka untuk 6 peran persona SIJAKON.
 */

test.describe('Suite 2: Autentikasi & Role-Based Access Control (RBAC)', () => {
  test('2.1. Super Admin memiliki wewenang penuh, dapat mengakses modul sistem & pengaturan', async ({ superAdminPage }) => {
    await superAdminPage.goto('/dashboard');

    // Verifikasi identitas peran aktif di header / sidebar
    await expect(superAdminPage.locator('text=Super Admin').first()).toBeVisible();

    // Akses ke halaman pengaturan sistem
    await superAdminPage.goto('/pengaturan');
    await expect(superAdminPage).toHaveURL(/.*pengaturan/);
    await expect(superAdminPage.locator('text=Pengaturan').first()).toBeVisible();
  });

  test('2.2. Admin Bidang Bina Konstruksi dapat mengakses Master BUJK dan Pelatihan TKK', async ({ binkonAdminPage }) => {
    await binkonAdminPage.goto('/dashboard');
    await expect(binkonAdminPage.locator('text=Admin Bidang').first()).toBeVisible();

    // Akses Master BUJK
    await binkonAdminPage.goto('/bujk');
    await expect(binkonAdminPage.locator('h1')).toContainText(/BUJK/i);

    // Akses Modul Pelatihan
    await binkonAdminPage.goto('/pelatihan');
    await expect(binkonAdminPage.locator('h1')).toContainText(/Pelatihan/i);
  });

  test('2.3. Tim Pengawas / Asesor Lapangan memiliki akses ke modul audit SIMAK', async ({ pengawasPage }) => {
    await pengawasPage.goto('/pengawasan/tertib-usaha/pelaksanaan');

    // Halaman pelaksanaan pengawasan SIMAK 1 dapat dibuka
    await expect(pengawasPage.locator('h1, h2').first()).toBeVisible();
    await expect(pengawasPage.locator('body')).not.toContainText('404 - Halaman Tidak Ditemukan');
  });

  test('2.4. Eksekutif / Kepala Dinas memiliki akses ke Ringkasan Dashboard Makro', async ({ eksekutifPage }) => {
    await eksekutifPage.goto('/dashboard');

    // Verifikasi identitas eksekutif
    await expect(eksekutifPage.locator('text=Eksekutif').first()).toBeVisible();

    // Metrik makro dashboard terlihat
    await expect(eksekutifPage.locator('h1')).toBeVisible();
  });

  test('2.5. Simulasi Ganti Peran Real-time via Header Quick Role Switcher', async ({ superAdminPage }) => {
    await superAdminPage.goto('/dashboard');

    // ── BEFORE: Peran aktif adalah Super Admin ──
    const roleButton = superAdminPage.locator('button[title="Ganti Simulasi Role"]').first();
    await expect(roleButton).toBeVisible();

    // ── ACTION: Klik tombol role switcher & ganti ke Tim Pengawas ──
    await roleButton.click();

    // Modal role switcher muncul
    const switcherModal = superAdminPage.locator('text=Ganti Peran Pengguna').first();
    await expect(switcherModal).toBeVisible();

    // Klik kartu Tim Pengawas
    const pengawasCard = superAdminPage.locator('text=Tim Pengawas & Asesor Lapangan').first();
    await expect(pengawasCard).toBeVisible();
    await pengawasCard.click();

    // ── POST-ACTION VERIFICATION: Peran aktif langsung berganti tanpa reload ──
    await expect(superAdminPage.locator('text=Pengawas').first()).toBeVisible();
  });
});
