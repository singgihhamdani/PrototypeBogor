import { test, expect } from '../fixtures/auth.fixture';

/**
 * Suite 3: Modul Pengawasan Jasa Konstruksi (Permen PUPR No. 1/2023)
 * Menguji alur Perencanaan, Pelaksanaan SIMAK 1 (checklist & live score), Verifikasi, dan BAP.
 */

test.describe('Suite 3: Modul Pengawasan Jasa Konstruksi (SIMAK 1, 2, 3)', () => {
  test('3.1. Halaman Perencanaan Pengawasan menampilkan matrik target pengawasan', async ({ pengawasPage }) => {
    await pengawasPage.goto('/pengawasan/tertib-usaha/perencanaan');

    // Heading modul dan ringkasan target perencanaan harus tampil
    await expect(pengawasPage.locator('h1, h2').first()).toBeVisible();
    await expect(pengawasPage.locator('body')).not.toContainText('404 - Halaman Tidak Ditemukan');
  });

  test('3.2. Input Audit SIMAK Baru → Kalkulasi Live Scoring Kepatuhan → Simpan Audit', async ({ pengawasPage }) => {
    await pengawasPage.goto('/pengawasan/tertib-usaha/pelaksanaan');

    // Buka modal audit SIMAK
    const createBtn = pengawasPage.getByRole('button', { name: /Buat Audit SIMAK Baru/i });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const modal = pengawasPage.locator('[role="dialog"], .responsive-modal-container').first();
    await expect(modal).toBeVisible();

    // ── VERIFIKASI KALKULASI REAL-TIME SKOR KEPATUHAN ──
    // Skor awal (default) harus terbaca (misal 80%)
    await expect(modal.locator('text=%').first()).toBeVisible();

    // Isi formulir objek pemeriksaan
    const uniqueObjek = `Audit Mutu Beton Proyek Uji ${Date.now()}`;
    const objekInput = modal.locator('input[placeholder*="Audit Mutu"]').first();
    await objekInput.fill(uniqueObjek);

    const bujkInput = modal.locator('input[placeholder*="Badan Usaha"], input[required]').nth(1);
    await bujkInput.fill('PT Bogor Bangun Perkasa');

    // Klik indikator yang masih 'Tidak Sesuai' agar skor menjadi 100% (Tertib Penuh)
    const tidakSesuaiBtn = modal.locator('text=Tidak Sesuai').first();
    if (await tidakSesuaiBtn.isVisible()) {
      await tidakSesuaiBtn.click();
    }

    // Skor harus ter-kalkulasi menjadi 100% (Status: Tertib)
    await expect(modal.locator('text=100%').first()).toBeVisible();
    await expect(modal.locator('text=Status: Tertib').first()).toBeVisible();

    // Simpan audit
    const submitBtn = modal.getByRole('button', { name: /Simpan & Terbitkan/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // ── POST-ACTION VERIFICATION ──
    // Modal tertutup
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Objek pemeriksaan yang baru dibuat muncul di tabel audit
    await expect(pengawasPage.locator(`text=${uniqueObjek}`).first()).toBeVisible();
  });

  test('3.3. Pelaksanaan Pengawasan SIMAK 2 & SIMAK 3 dapat diakses tanpa crash', async ({ pengawasPage }) => {
    // Tertib Penyelenggaraan (SIMAK 2)
    const resSimak2 = await pengawasPage.goto('/pengawasan/tertib-penyelenggaraan');
    expect(resSimak2?.status()).toBeLessThan(400);
    await expect(pengawasPage.locator('h1, h2').first()).toBeVisible();

    // Tertib Pemanfaatan (SIMAK 3)
    const resSimak3 = await pengawasPage.goto('/pengawasan/tertib-pemanfaatan');
    expect(resSimak3?.status()).toBeLessThan(400);
    await expect(pengawasPage.locator('h1, h2').first()).toBeVisible();
  });
});
