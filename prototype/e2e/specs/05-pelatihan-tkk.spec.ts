import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 05: Pelatihan & Sertifikasi Tenaga Kerja Konstruksi (TKK)', () => {

  test('5.1 Tab navigation between Program Pelatihan, Database TKK, and Verifikasi e-Certificate', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pelatihan');
    await expect(superAdminPage.locator('h1')).toContainText('Pelatihan & Sertifikasi Tenaga Kerja Konstruksi');

    // Default tab is Program Pelatihan & Bimtek
    await expect(superAdminPage.getByRole('button', { name: /Program Pelatihan & Bimtek/i })).toBeVisible();

    // 1. Switch to Database TKK Tersertifikasi
    const tkkTab = superAdminPage.getByRole('button', { name: /Database TKK Tersertifikasi/i });
    await expect(tkkTab).toBeVisible();
    await tkkTab.click();

    // Verify search input and table header in TKK tab
    await expect(superAdminPage.getByPlaceholder(/Cari berdasarkan nama TKK/i)).toBeVisible();
    await expect(superAdminPage.locator('table thead')).toContainText('NAMA & NIK');
    await expect(superAdminPage.locator('table thead')).toContainText('BADAN USAHA / BUJK');

    // 2. Switch to Verifikasi e-Certificate QR
    const certTab = superAdminPage.getByRole('button', { name: /Verifikasi e-Certificate QR/i });
    await expect(certTab).toBeVisible();
    await certTab.click();

    // Verify QR certificate validator UI
    await expect(superAdminPage.getByText(/Verifikasi Keaslian e-Certificate TKK/i)).toBeVisible();
    await expect(superAdminPage.getByPlaceholder(/Masukkan No\. Sertifikat/i)).toBeVisible();
    await expect(superAdminPage.getByRole('button', { name: /Cek Validasi/i })).toBeVisible();

    // 3. Switch back to Program Pelatihan & Bimtek
    const progTab = superAdminPage.getByRole('button', { name: /Program Pelatihan & Bimtek/i });
    await progTab.click();
    await expect(superAdminPage.getByRole('button', { name: /Buka Pelatihan Baru/i })).toBeVisible();
  });

  test('5.2 Real-time search filter in Database TKK Tersertifikasi', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pelatihan');
    await superAdminPage.getByRole('button', { name: /Database TKK Tersertifikasi/i }).click();

    const searchInput = superAdminPage.getByPlaceholder(/Cari berdasarkan nama TKK/i);
    await expect(searchInput).toBeVisible();

    // Get initial row count
    const rows = superAdminPage.locator('table tbody tr');
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Extract first participant's name
    const firstName = await rows.first().locator('td').first().locator('p').first().innerText();
    expect(firstName.trim().length).toBeGreaterThan(0);

    // Search with first participant's name
    await searchInput.fill(firstName.trim());
    await superAdminPage.waitForTimeout(300);

    // All visible rows should match the search
    const filteredRows = superAdminPage.locator('table tbody tr');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    await expect(filteredRows.first()).toContainText(firstName.trim());

    // Search nonexistent keyword
    await searchInput.fill('ZZZ_NONEXISTENT_KEYWORD_XYZ_999');
    await superAdminPage.waitForTimeout(300);
    await expect(superAdminPage.getByText(/Belum ada peserta pelatihan yang terdaftar atau lulus/i)).toBeVisible();

    // Reset search
    await searchInput.fill('');
    await superAdminPage.waitForTimeout(300);
    expect(await superAdminPage.locator('table tbody tr').count()).toBe(initialCount);
  });

  test('5.3 Salinan e-Certificate TKK modal preview and verification details', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pelatihan');
    await superAdminPage.getByRole('button', { name: /Database TKK Tersertifikasi/i }).click();

    // Find a "Lihat" button for e-sertifikat
    const viewCertBtn = superAdminPage.getByRole('button', { name: /Lihat/i }).first();
    await expect(viewCertBtn).toBeVisible();
    await viewCertBtn.click();

    // Modal Salinan e-Certificate appears
    const certModal = superAdminPage.locator('text=Salinan e-Certificate TKK').locator('xpath=ancestor::div[contains(@style, "position: fixed") or contains(@style, "background-color: rgb(255, 255, 255)")]').first();
    await expect(superAdminPage.getByText(/Salinan e-Certificate TKK/i)).toBeVisible();
    await expect(superAdminPage.getByText(/Nama Tenaga Kerja:/i)).toBeVisible();
    await expect(superAdminPage.getByText(/Nomor Registrasi Sertifikat:/i)).toBeVisible();
    await expect(superAdminPage.getByRole('button', { name: /Unduh e-Certificate \(PDF\)/i })).toBeVisible();

    // Close certificate modal
    const closeBtn = superAdminPage.locator('button:has(svg.lucide-x)').first();
    await closeBtn.click();
    await expect(superAdminPage.getByText(/Salinan e-Certificate TKK/i)).not.toBeVisible();
  });

  test('5.4 Buka Pelatihan Baru modal creates a new agenda and updates grid', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pelatihan');

    // Click "Buka Pelatihan Baru"
    await superAdminPage.getByRole('button', { name: /Buka Pelatihan Baru/i }).click();
    await expect(superAdminPage.getByText(/Buka Kegiatan Pelatihan & Bimtek Baru/i)).toBeVisible();

    const testTitle = 'Bimtek K3 Konstruksi SMKK Baru';

    // Fill form
    await superAdminPage.locator('input[placeholder*="Bimbingan Teknis K3"]').fill(testTitle);
    await superAdminPage.locator('input[placeholder*="Nama Instruktur"]').fill('Dr. Ir. Penguji E2E, MT');

    // Wait for alert dialog and submit
    const dialogPromise = superAdminPage.waitForEvent('dialog');
    await superAdminPage.getByRole('button', { name: /Simpan Agenda Pelatihan/i }).click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Agenda pelatihan baru');
    await dialog.accept();

    // Modal closes and grid is active
    await expect(superAdminPage.getByText(/Buka Kegiatan Pelatihan & Bimtek Baru/i)).not.toBeVisible();
    await expect(superAdminPage.locator('h3').first()).toBeVisible();
  });

  test('5.5 Daftarkan Peserta modal registers participant to a training', async ({ superAdminPage }) => {
    superAdminPage.on('dialog', async dialog => {
      await dialog.accept();
    });

    await superAdminPage.goto('/pelatihan');

    // Locate first training card with "Daftarkan Peserta" button
    const registerBtn = superAdminPage.getByRole('button', { name: /Daftarkan Peserta/i }).first();
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();

    // Modal appears
    await expect(superAdminPage.getByText(/Daftarkan Peserta TKK/i)).toBeVisible();

    const nik = `3201${Date.now().toString().slice(-12)}`;
    const name = `Peserta E2E ${Date.now().toString().slice(-4)}`;
    const bujk = 'PT Panca Konstruksi Mandiri';

    await superAdminPage.getByPlaceholder(/16 digit NIK peserta/i).fill(nik);
    await superAdminPage.getByPlaceholder(/Nama sesuai KTP/i).fill(name);
    await superAdminPage.getByPlaceholder(/Contoh: PT Bangun Jaya/i).fill(bujk);

    await superAdminPage.locator('form').getByRole('button', { name: 'Daftarkan Peserta' }).click();

    // Verify modal closes
    await expect(superAdminPage.getByText(/Daftarkan Peserta TKK/i)).not.toBeVisible();
  });

});
