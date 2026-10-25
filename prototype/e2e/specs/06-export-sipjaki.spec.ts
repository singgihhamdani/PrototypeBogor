import { test, expect } from '../fixtures/auth.fixture';
import fs from 'fs';

test.describe('Suite 06: Ekspor Dokumen & Standar SIPJAKI Kementerian PUPR', () => {

  test('6.1 Export Master Data BUJK to SIPJAKI formatted Excel (.xlsx)', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');
    await expect(superAdminPage.locator('h1')).toContainText('BUJK Kabupaten Bogor');

    // Trigger download on "Export SIPJAKI"
    const [download] = await Promise.all([
      superAdminPage.waitForEvent('download'),
      superAdminPage.getByRole('button', { name: /Export SIPJAKI/i }).click(),
    ]);

    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toContain('Data_BUJK');
    expect(suggestedName.endsWith('.xlsx')).toBe(true);

    // Verify downloaded file is a non-empty Excel document
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(1500); // Standard formatted xlsx with headers & styling
    }
  });

  test('6.2 Export Pelatihan & TKK data to SIPJAKI formatted Excel (.xlsx)', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pelatihan');
    await expect(superAdminPage.locator('h1')).toContainText('Pelatihan & Sertifikasi Tenaga Kerja Konstruksi');

    const [download] = await Promise.all([
      superAdminPage.waitForEvent('download'),
      superAdminPage.getByRole('button', { name: /Export SIPJAKI/i }).click(),
    ]);

    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toContain('Pelatihan');
    expect(suggestedName.endsWith('.xlsx')).toBe(true);

    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(1500);
    }
  });

  test('6.3 Export Paket Pekerjaan Konstruksi to SIPJAKI formatted Excel (.xlsx)', async ({ superAdminPage }) => {
    await superAdminPage.goto('/paket-pekerjaan');
    await expect(superAdminPage.locator('h1')).toContainText('Paket Pekerjaan Konstruksi');

    const [download] = await Promise.all([
      superAdminPage.waitForEvent('download'),
      superAdminPage.getByRole('button', { name: /Export SIPJAKI/i }).click(),
    ]);

    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toContain('Paket_Pekerjaan');
    expect(suggestedName.endsWith('.xlsx')).toBe(true);

    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(1500);
    }
  });

  test('6.4 Download official SIPJAKI integration template from Settings hub', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pengaturan');
    await expect(superAdminPage.locator('h1')).toContainText('Integrasi SIPJAKI');

    // Switch to Standar & Template tab
    const templateTab = superAdminPage.getByRole('button', { name: /Standar & Template Integrasi SIPJAKI/i });
    await expect(templateTab).toBeVisible();
    await templateTab.click();

    // Verify template cards exist
    await expect(superAdminPage.getByText(/Standar Format & Template Resmi SIPJAKI/i)).toBeVisible();

    // Download first available template (e.g. BUJK or Paket Pekerjaan)
    const downloadTemplateBtn = superAdminPage.getByRole('button', { name: /Unduh Template \(\.xlsx\)/i }).first();
    await expect(downloadTemplateBtn).toBeVisible();

    const [download] = await Promise.all([
      superAdminPage.waitForEvent('download'),
      downloadTemplateBtn.click(),
    ]);

    const suggestedName = download.suggestedFilename();
    expect(suggestedName.endsWith('.xlsx')).toBe(true);

    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(1000);
    }
  });

  test('6.5 Verify Audit Trail logs data operations in Riwayat Data', async ({ superAdminPage }) => {
    await superAdminPage.goto('/pengaturan/riwayat-data');
    await expect(superAdminPage.locator('h1')).toContainText('Riwayat Pertukaran Data & Integrasi SIPJAKI');

    // Verify KPI summary widgets are visible
    await expect(superAdminPage.getByText('Total Transaksi Data')).toBeVisible();
    await expect(superAdminPage.getByText('Ekspor Format SIPJAKI', { exact: true })).toBeVisible();
    await expect(superAdminPage.getByText('Impor Spreadsheet', { exact: true })).toBeVisible();

    // Verify data table is present
    await expect(superAdminPage.locator('table thead')).toContainText('WAKTU & ID LOG');
    await expect(superAdminPage.locator('table thead')).toContainText('TIPE OPERASI');
  });

});
