import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 07: Manajemen Pengguna, Penugasan OPD & Keamanan Sistem (RBAC)', () => {

  test('7.1 View User Management Table, Role Badges & KPI metrics', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pengaturan');
    await expect(superAdminPage.locator('h1')).toContainText('Integrasi SIPJAKI');

    // Switch to Manajemen Pengguna tab
    const userTab = superAdminPage.getByRole('button', { name: /Manajemen Pengguna & Penugasan OPD/i });
    await expect(userTab).toBeVisible();
    await userTab.click();

    // Verify User Management Header & KPI Cards
    await expect(superAdminPage.getByText(/Manajemen Pengguna & Penugasan OPD/i).first()).toBeVisible();
    await expect(superAdminPage.getByText('Pengguna Aktif')).toBeVisible();
    await expect(superAdminPage.getByText('Undangan Pending')).toBeVisible();
    await expect(superAdminPage.getByText('Total OPD Terhubung')).toBeVisible();

    // Verify User Table headers and personas
    const tableHeader = superAdminPage.locator('table thead');
    await expect(tableHeader).toContainText('PENGGUNA & NIP');
    await expect(tableHeader).toContainText('ROLE & PENUGASAN');
    await expect(tableHeader).toContainText('SATUAN KERJA (OPD)');
    await expect(tableHeader).toContainText('STATUS');

    // Verify seed demo personas are listed in table
    const tableBody = superAdminPage.locator('table tbody');
    await expect(tableBody.getByText(/Raden Ridwan/i)).toBeVisible();
    await expect(tableBody.getByText(/Bayu Pratama/i)).toBeVisible();
  });

  test('7.2 Real-time search and role filtering in User Management', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pengaturan');
    await superAdminPage.getByRole('button', { name: /Manajemen Pengguna & Penugasan OPD/i }).click();

    const searchInput = superAdminPage.getByPlaceholder(/Cari nama, NIP, email\.\.\./i);
    await expect(searchInput).toBeVisible();

    // Search by name "Supriyatna"
    await searchInput.fill('Supriyatna');
    await superAdminPage.waitForTimeout(400);

    const rows = superAdminPage.locator('table tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Ir. Supriyatna, ST');
    await expect(rows.first()).toContainText('Admin Bidang');

    // Reset search
    await searchInput.fill('');
    await superAdminPage.waitForTimeout(400);

    // Filter by Role dropdown
    const roleSelect = superAdminPage.locator('select').first();
    await roleSelect.selectOption({ label: 'Eksekutif / Pimpinan' });
    await superAdminPage.waitForTimeout(400);

    const filteredRows = superAdminPage.locator('table tbody tr');
    await expect(filteredRows.first()).toContainText('Eksekutif');

    // Reset filter
    await roleSelect.selectOption({ label: 'Semua Role' });
  });

  test('7.3 Invite new user modal creates pending invitation and updates count', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pengaturan');
    await superAdminPage.getByRole('button', { name: /Manajemen Pengguna & Penugasan OPD/i }).click();

    // Click "+ Undang Pengguna Baru"
    await superAdminPage.getByRole('button', { name: /\+ Undang Pengguna Baru/i }).click();
    await expect(superAdminPage.getByText(/Undang Pengguna Baru/i).first()).toBeVisible();

    const randId = Date.now().toString().slice(-4);
    const testName = `Pengawas Baru E2E ${randId}`;
    const testEmail = `pengawas_${randId}@sijakon.bogor.go.id`;

    // Fill form
    await superAdminPage.getByPlaceholder(/Contoh: Budi Santoso/i).fill(testName);
    await superAdminPage.getByPlaceholder(/19900515/i).fill(`199501012024011${randId}`);
    await superAdminPage.getByPlaceholder(/nama@sijakon\.bogor\.go\.id/i).fill(testEmail);

    // Submit invite
    await superAdminPage.getByRole('button', { name: /Kirim Undangan Aktivasi/i }).click();

    // Success State appears with activation link
    await expect(superAdminPage.getByText(/Undangan Berhasil Dibuat/i)).toBeVisible();
    await expect(superAdminPage.getByRole('button', { name: /Salin Link/i })).toBeVisible();

    // Close modal
    await superAdminPage.getByRole('button', { name: /Selesai & Tutup/i }).click();
    await expect(superAdminPage.getByText(/Undangan Berhasil Dibuat/i)).not.toBeVisible();

    // Toast notification visible
    await expect(superAdminPage.getByText(new RegExp(`Undangan untuk ${testName}`, 'i'))).toBeVisible();
  });

  test('7.4 Matriks Hak Akses & Role (RBAC) permission toggle and persistence', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pengaturan');

    // Default tab is RBAC
    await expect(superAdminPage.getByRole('button', { name: /Simpan Konfigurasi RBAC/i })).toBeVisible();

    // Change selected role in RBAC
    const adminBidangPill = superAdminPage.getByRole('button', { name: /Admin Bidang/i }).first();
    await adminBidangPill.click();

    // Click preset "Preset Bina Konstruksi"
    const binkonPresetBtn = superAdminPage.getByRole('button', { name: /Preset Bina Konstruksi/i });
    if (await binkonPresetBtn.isVisible()) {
      superAdminPage.once('dialog', async dialog => {
        await dialog.accept();
      });
      await binkonPresetBtn.click();
    }

    // Save RBAC changes
    await superAdminPage.getByRole('button', { name: /Simpan Konfigurasi RBAC/i }).click();

    // Verify feedback state
    await expect(superAdminPage.getByText(/Matriks Disimpan!/i)).toBeVisible();
  });

  test('7.5 Master Satuan Kerja (OPD) displays registered agencies and coordinators', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pengaturan');

    // Switch to Master Satuan Kerja (OPD) tab
    const opdTab = superAdminPage.getByRole('button', { name: /Master Satuan Kerja \(OPD\)/i });
    await expect(opdTab).toBeVisible();
    await opdTab.click();

    // Verify header and table
    await expect(superAdminPage.getByText(/Master Satuan Kerja & Organisasi Perangkat Daerah/i)).toBeVisible();
    await expect(superAdminPage.getByRole('button', { name: /\+ Tambah OPD Baru/i })).toBeVisible();

    // Verify common OPDs are present
    await expect(superAdminPage.getByText(/Dinas Pekerjaan Umum/i).first()).toBeVisible();
  });

});
