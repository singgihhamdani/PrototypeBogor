import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export type DemoRoleKey = 'superadmin' | 'op_binkon' | 'op_pengawas' | 'eksekutif' | 'bujk_demo' | 'peserta_demo';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/login');
    await expect(this.page).toHaveTitle(/SIJAKON/i);
  }

  /**
   * Login cepat via tombol demo 1-klik di halaman login
   */
  async loginAsDemo(roleKey: 'superadmin' | 'op_binkon' | 'op_pengawas' | 'eksekutif') {
    await this.goto();
    const roleButtonMap: Record<string, RegExp> = {
      superadmin: /Super Admin/i,
      op_binkon: /Admin Bidang/i,
      op_pengawas: /Tim Pengawas/i,
      eksekutif: /Eksekutif/i,
    };

    const roleBtn = this.page.getByRole('button', { name: roleButtonMap[roleKey] });
    await expect(roleBtn).toBeVisible();
    await roleBtn.click();

    // Klik tombol Masuk ke Dashboard Dinas
    const submitBtn = this.page.getByRole('button', { name: /Masuk ke Dashboard|Masuk/i });
    await submitBtn.click();

    // Tunggu navigasi ke dashboard
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  /**
   * Login manual dengan email & password
   */
  async loginWithCredentials(email: string, pass: string = 'demo2026') {
    await this.goto();
    const emailInput = this.page.locator('input[type="text"]').first();
    const passInput = this.page.locator('input[type="password"]');

    await emailInput.fill(email);
    await passInput.fill(pass);

    const submitBtn = this.page.getByRole('button', { name: /Masuk ke Dashboard|Masuk/i });
    await submitBtn.click();
  }

  /**
   * Helper logout
   */
  async logout() {
    // Cari tombol profil / logout di sidebar atau header
    const logoutBtn = this.page.getByRole('button', { name: /Keluar|Logout/i }).first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click();
      await this.page.waitForURL('**/login', { timeout: 10000 });
    }
  }
}
