import { test, expect } from '@playwright/test';

test.describe('Audio Processing Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should upload and process audio file', async ({ page }) => {
    // Upload file
    await page.setInputFiles('input[type="file"]', 'test-files/sample.wav');
    
    // Wait for upload to complete
    await expect(page.getByText('Upload complete')).toBeVisible();
    
    // Start processing
    await page.click('button:has-text("Start Processing")');
    
    // Wait for processing to complete
    await expect(page.getByText('Processing complete')).toBeVisible();
    
    // Verify waveform is visible
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should handle multiple file processing', async ({ page }) => {
    // Upload multiple files
    await page.setInputFiles('input[type="file"]', [
      'test-files/sample1.wav',
      'test-files/sample2.wav'
    ]);
    
    // Verify batch processing UI
    await expect(page.getByText('2 files selected')).toBeVisible();
    
    // Start batch processing
    await page.click('button:has-text("Process All")');
    
    // Wait for all files to be processed
    await expect(page.getByText('All files processed')).toBeVisible();
  });

  test('should export in different formats', async ({ page }) => {
    // Upload and process a file first
    await page.setInputFiles('input[type="file"]', 'test-files/sample.wav');
    await page.click('button:has-text("Start Processing")');
    await expect(page.getByText('Processing complete')).toBeVisible();
    
    // Test different export formats
    const formats = ['WAV', 'MP3', 'FLAC'];
    for (const format of formats) {
      await page.click(`button:has-text("Export as ${format}")`);
      await expect(page.getByText(`Exported as ${format}`)).toBeVisible();
    }
  });
});