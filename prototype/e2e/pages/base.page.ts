import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object Model (POM)
 * Menyediakan utilitas umum: navigasi, deteksi toast, modal, dan pengecekan konsol error.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForToast(regexOrText?: RegExp | string) {
    const toast = this.page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 10000 });
    if (regexOrText) {
      await expect(toast).toContainText(regexOrText);
    }
    return toast;
  }

  async closeToastIfPresent() {
    const closeBtn = this.page.locator('[role="alert"] button').first();
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click().catch(() => {});
    }
  }

  async waitForModalOpen() {
    const modal = this.page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    return modal;
  }

  async waitForModalClose() {
    const modal = this.page.locator('[role="dialog"]').first();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Monitor error di konsol browser (menangkap unhandled exception, syntax error, dll.)
   */
  setupConsoleErrorMonitor(): string[] {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Abaikan warning analitik atau ekstensi browser pihak ketiga jika ada
        if (!text.includes('favicon') && !text.includes('chrome-extension')) {
          errors.push(text);
        }
      }
    });
    this.page.on('pageerror', (err) => {
      errors.push(`PageError: ${err.message}`);
    });
    return errors;
  }
}
