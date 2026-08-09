import { test, expect } from '@playwright/test';

test.describe('ABTalks AI Interviewer Platform E2E Flow', () => {
  test('Landing page loads and renders Hero text', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/ABTalks|Interview/i);
    await expect(page.locator('h1')).toContainText(/Enterprise AI/i);
  });

  test('Navigate to Upload Setup Page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Upload Setup');
    await expect(page.locator('h2')).toContainText(/Dataset Upload/i);
  });

  test('Navigate to Dashboard View', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Dashboard');
    await expect(page.locator('h1')).toContainText(/Analytics Dashboard/i);
  });
});
