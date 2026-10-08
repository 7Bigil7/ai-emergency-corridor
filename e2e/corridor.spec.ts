import { test, expect } from '@playwright/test';

test.describe('AI Emergency Corridor E2E Flow', () => {
  test('loads dashboard and displays all primary telemetry and map components', async ({ page }) => {
    await page.goto('/');

    // Check title and header branding
    await expect(page).toHaveTitle(/AI Emergency Corridor/i);
    await expect(page.locator('h1')).toContainText('AI EMERGENCY CORRIDOR');
    await expect(page.getByText('SYSTEM ONLINE').first()).toBeVisible();

    // Check primary operational panels
    await expect(page.getByText('EMERGENCY RESPONSE').first()).toBeVisible();
    await expect(page.getByText('AI TRAFFIC INTELLIGENCE').first()).toBeVisible();
    await expect(page.getByText('TRAFFIC SIGNAL CONTROL').first()).toBeVisible();
    await expect(page.getByText('LIVE EVENT LOG').first()).toBeVisible();
    await expect(page.getByText('CORRIDOR STATISTICS').first()).toBeVisible();
  });

  test('executes manual corridor activation and progression', async ({ page }) => {
    await page.goto('/');

    // 1. Click Activate Emergency Corridor
    const activateBtn = page.getByRole('button', { name: /ACTIVATE EMERGENCY CORRIDOR/i }).first();
    await expect(activateBtn).toBeVisible();
    await activateBtn.click();

    // 2. Confirm Corridor Active
    await expect(page.getByText('EMERGENCY CORRIDOR ACTIVE').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /STOP EMERGENCY CORRIDOR/i })).toBeVisible();

    // 3. Click Stop Emergency Corridor
    const stopBtn = page.getByRole('button', { name: /STOP EMERGENCY CORRIDOR/i });
    await stopBtn.click();

    // 4. Confirm Aborted / Terminated State
    await expect(page.getByText('EMERGENCY CORRIDOR TERMINATED').first()).toBeVisible();
  });

  test('runs automated Demo Mode end to end at 4x speed', async ({ page }) => {
    await page.goto('/');

    // Set 4x speed
    await page.getByRole('button', { name: '4x' }).click();

    // Start Demo Mode
    const startDemoBtn = page.getByRole('button', { name: /DEMO MODE/i }).first();
    await startDemoBtn.click();

    // Verify Demo running (button shows PAUSE)
    await expect(page.getByRole('button', { name: /PAUSE/i })).toBeVisible();
  });
});
