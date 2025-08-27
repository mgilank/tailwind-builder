import { test, expect } from '@playwright/test';

test.describe('Drag section to canvas', () => {
  test('adds a section to empty canvas via drag-and-drop', async ({ page }) => {
    await page.goto('/');

    const sectionItem = page.getByTestId('palette-item-section');
    const canvas = page.getByTestId('canvas-root');

    // Ensure initial state shows empty canvas
    await expect(canvas.getByText('Empty canvas')).toBeVisible();

    // Create a DataTransfer and start drag on the palette item so its handler sets the payload
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await sectionItem.dispatchEvent('dragstart', { dataTransfer });
    // Move over canvas and drop
    await canvas.dispatchEvent('dragover', { dataTransfer });
    await canvas.dispatchEvent('drop', { dataTransfer });

    // Canvas should now contain a <section> element
    await expect(canvas.locator('section')).toHaveCount(1);
    // And no longer show the empty-state text
    await expect(canvas.getByText('Empty canvas')).toHaveCount(0);
  });
});

