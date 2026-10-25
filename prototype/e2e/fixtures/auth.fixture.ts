import { test as base, Page } from '@playwright/test';
import { DEMO_USERS } from '../../src/lib/auth-types';

/**
 * Fixture Autentikasi Playwright untuk 6 Role SIJAKON Kab. Bogor
 * Menginjeksikan sesi ke localStorage sehingga pengujian tidak perlu mengulang alur login berulang kali.
 */

type AuthFixtures = {
  superAdminPage: Page;
  binkonAdminPage: Page;
  pengawasPage: Page;
  eksekutifPage: Page;
  bujkPage: Page;
  pesertaPage: Page;
};

async function createAuthenticatedPage(page: Page, demoKey: string): Promise<Page> {
  const user = DEMO_USERS[demoKey];
  if (!user) throw new Error(`Demo user "${demoKey}" tidak ditemukan di auth-types.`);

  // Inject session state ke localStorage sebelum dokumen dimuat
  await page.addInitScript((userData) => {
    window.localStorage.setItem('sijakon_user_v3', JSON.stringify(userData));
    window.localStorage.setItem('sijakon_access_token', 'demo_jwt_token_' + userData.username);
  }, user);

  return page;
}

export const test = base.extend<AuthFixtures>({
  superAdminPage: async ({ page }, use) => {
    const authPage = await createAuthenticatedPage(page, 'superadmin');
    await use(authPage);
  },

  binkonAdminPage: async ({ page }, use) => {
    const authPage = await createAuthenticatedPage(page, 'op_binkon');
    await use(authPage);
  },

  pengawasPage: async ({ page }, use) => {
    const authPage = await createAuthenticatedPage(page, 'op_pengawas');
    await use(authPage);
  },

  eksekutifPage: async ({ page }, use) => {
    const authPage = await createAuthenticatedPage(page, 'eksekutif');
    await use(authPage);
  },

  bujkPage: async ({ page }, use) => {
    const authPage = await createAuthenticatedPage(page, 'bujk_demo');
    await use(authPage);
  },

  pesertaPage: async ({ page }, use) => {
    const authPage = await createAuthenticatedPage(page, 'peserta_demo');
    await use(authPage);
  },
});

export { expect } from '@playwright/test';
