import { Page, Locator, expect } from '@playwright/test';

/**
 * Utilitas Assertion State, Post-Action Verification, & Badge Check
 */

export async function parseNumericValue(locator: Locator): Promise<number> {
  const text = await locator.textContent();
  if (!text) return 0;
  const cleaned = text.replace(/[^\d.-]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export async function assertCounterIncrement(
  locator: Locator,
  initialValue: number,
  expectedIncrement: number = 1
) {
  await expect(async () => {
    const currentVal = await parseNumericValue(locator);
    expect(currentVal).toBe(initialValue + expectedIncrement);
  }).toPass({ timeout: 5000 });
}

export async function assertBadgeStatus(
  badgeLocator: Locator,
  expectedText: string | RegExp,
  colorTone?: 'green' | 'yellow' | 'red' | 'blue'
) {
  await expect(badgeLocator).toBeVisible();
  await expect(badgeLocator).toContainText(expectedText);

  if (colorTone) {
    const styles = await badgeLocator.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        bg: computed.backgroundColor,
        color: computed.color,
      };
    });

    if (colorTone === 'green') {
      // Hijau tidak boleh dominan merah
      expect(styles.bg).not.toMatch(/^rgb\(\s*(?:2[0-5][0-9]|1[5-9][0-9])\s*,\s*[0-9]{1,2}\s*,\s*[0-9]{1,2}/);
    } else if (colorTone === 'red') {
      // Merah
      expect(styles.bg).toMatch(/rgb\(/);
    }
  }
}

export async function assertPersistedAfterReload(
  page: Page,
  assertionFn: () => Promise<void>
) {
  // Verifikasi kondisi awal
  await assertionFn();

  // Reload halaman (simulasi F5)
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Verifikasi ulang bahwa state tidak hilang setelah reload
  await assertionFn();
}
