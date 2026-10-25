import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * POM Helper untuk interaksi dengan BatchImportModal
 */
export class BatchImportModalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get modalDialog(): Locator {
    return this.page.locator('[role="dialog"]').first();
  }

  get fileInput(): Locator {
    return this.page.locator('input[type="file"]').first();
  }

  get previewTable(): Locator {
    return this.page.locator('table').first();
  }

  get commitButton(): Locator {
    return this.page.getByRole('button', { name: /Simpan.*Data|Simpan/i }).first();
  }

  get downloadTemplateButton(): Locator {
    return this.page.getByRole('button', { name: /Unduh Template/i }).first();
  }

  /**
   * Buka modal import via tombol di halaman
   */
  async openImportModal(triggerButtonText: RegExp = /Import Batch|Unggah Excel/i) {
    const btn = this.page.getByRole('button', { name: triggerButtonText }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(this.modalDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Unggah file ke modal
   */
  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  /**
   * Unduh template file dan verifikasi nama filenya
   */
  async downloadTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadTemplateButton.click();
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename.toLowerCase()).toContain(format);
    return download;
  }

  /**
   * Komit data yang ada di preview
   */
  async commitData() {
    await expect(this.commitButton).toBeEnabled();
    await this.commitButton.click();
    await this.waitForModalClose();
  }
}
