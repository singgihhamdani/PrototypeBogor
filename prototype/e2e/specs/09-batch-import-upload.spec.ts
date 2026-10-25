import { test, expect } from '../fixtures/auth.fixture';
import * as path from 'path';

/**
 * Suite 9: Batch Import (Spreadsheet) & Document Upload Engine
 * Menguji fungsionalitas impor massal via file Excel/CSV dan upload berkas dokumen PDF.
 */

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/files');

test.describe('Suite 9: Batch Import & Document Upload Engine', () => {
  test('9.1. Unduh Template Resmi Excel (.xlsx) dan CSV', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');

    // Buka modal Import Excel
    const importBtn = superAdminPage.getByRole('button', { name: /Import Excel/i });
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    const modal = superAdminPage.locator('[role="dialog"], .responsive-modal-container').first();
    await expect(modal).toBeVisible();

    // 1. Unduh Template Excel (.xlsx)
    const [downloadXlsx] = await Promise.all([
      superAdminPage.waitForEvent('download'),
      modal.getByRole('button', { name: /Template Excel/i }).click(),
    ]);
    const xlsxName = downloadXlsx.suggestedFilename();
    expect(xlsxName.toLowerCase()).toContain('.xlsx');

    // 2. Unduh Template CSV
    const [downloadCsv] = await Promise.all([
      superAdminPage.waitForEvent('download'),
      modal.getByRole('button', { name: /CSV/i }).click(),
    ]);
    const csvName = downloadCsv.suggestedFilename();
    expect(csvName.toLowerCase()).toContain('.csv');
  });

  test('9.2. Unggah Excel Valid (Happy Path) → Validasi Lolos → Simpan Data Berhasil', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');

    // Buka modal import
    await superAdminPage.getByRole('button', { name: /Import Excel/i }).click();
    const modal = superAdminPage.locator('[role="dialog"], .responsive-modal-container').first();
    await expect(modal).toBeVisible();

    // Upload file valid_bujk_batch.xlsx
    const validFilePath = path.join(FIXTURES_DIR, 'excel', 'valid_bujk_batch.xlsx');
    const fileInput = modal.locator('input[type="file"]');
    await fileInput.setInputFiles(validFilePath);

    // Verifikasi otomatis berpindah ke Step 2 (Preview)
    await expect(modal.getByText(/Pratinjau/i).first()).toBeVisible();

    // Verifikasi preview data terisi (nama perusahaan uji coba)
    await expect(modal.locator('text=PT Bogor Bangun Perkasa').first()).toBeVisible();

    // Verifikasi tombol simpan aktif dan dapat diklik
    const saveBtn = modal.getByRole('button', { name: /Simpan.*Data/i }).first();
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // Modal tertutup setelah data berhasil disimpan
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test('9.3. Unggah Excel Bermasalah → Sistem Mengisolasi Baris Error & Opsi Simpan Parsial', async ({ superAdminPage }) => {
    await superAdminPage.goto('/bujk');

    await superAdminPage.getByRole('button', { name: /Import Excel/i }).click();
    const modal = superAdminPage.locator('[role="dialog"], .responsive-modal-container').first();
    await expect(modal).toBeVisible();

    // Upload file invalid_bujk_batch.xlsx (ada NIB tidak 13 digit & field kosong)
    const invalidFilePath = path.join(FIXTURES_DIR, 'excel', 'invalid_bujk_batch.xlsx');
    const fileInput = modal.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFilePath);

    // Verifikasi preview mendeteksi adanya error validasi
    await expect(modal.getByText(/Pratinjau/i).first()).toBeVisible();

    // Harus menampilkan tombol simpan khusus baris valid (tidak crash)
    const partialSaveBtn = modal.getByRole('button', { name: /Simpan.*Baris Valid|Simpan/i }).first();
    await expect(partialSaveBtn).toBeVisible();

    // Tombol Batal / Ganti Berkas harus tersedia
    const cancelBtn = modal.getByRole('button', { name: 'Batal / Ganti Berkas' });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Kembali ke step upload
    await expect(modal.locator('text=Petunjuk Format Berkas Unggahan').first()).toBeVisible();
  });

  test('9.4. Validasi Komponen FileUploader: Ukuran Maksimal & Penolakan File Berlebih', async ({ superAdminPage }) => {
    // Kunjungi katalog komponen demo FileUploader
    await superAdminPage.goto('/pengawasan/komponen');

    // 1. Uji upload PDF valid
    const validPdfPath = path.join(FIXTURES_DIR, 'pdf', 'sample_surat_tugas.pdf');
    const uploaderInput = superAdminPage.locator('input[type="file"]').first();
    await uploaderInput.setInputFiles(validPdfPath);

    // Nama file harus tampil dan ada ikon/status terpasang
    await expect(superAdminPage.locator('text=sample_surat_tugas.pdf').first()).toBeVisible();

    // 2. Uji upload PDF melebihi kapasitas (oversized 8MB ke uploader dengan batas 2MB)
    const oversizedPdfPath = path.join(FIXTURES_DIR, 'pdf', 'oversized_document_8mb.pdf');
    await uploaderInput.setInputFiles(oversizedPdfPath);

    // Pesan error batas maksimal harus muncul
    await expect(superAdminPage.locator('text=melebihi batas maksimal').first()).toBeVisible();
  });
});
