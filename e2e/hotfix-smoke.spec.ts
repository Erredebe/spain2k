import { expect, test } from '@playwright/test';

test('focus overlay activates keyboard routing on first click', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas');
  const overlay = page.locator('.focus-overlay');
  await expect(overlay).toBeVisible();

  await page.mouse.click(50, 50);
  await expect(overlay).toHaveCount(0);

  const activated = await page.evaluate(() => window.__SPAIN2K_RUNTIME__?.focusActivated ?? false);
  expect(activated).toBe(true);

  await page.keyboard.press('ArrowRight');
  const lastCanvasKey = await page.evaluate(() => window.__SPAIN2K_RUNTIME__?.lastCanvasKey);
  expect(lastCanvasKey).toBe('ArrowRight');
});

