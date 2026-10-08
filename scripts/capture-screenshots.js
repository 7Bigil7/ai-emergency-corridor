import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\viji\\.gemini\\antigravity-ide\\brain\\8555cd46-5d81-4151-9ebe-ce82964b4666';

async function run() {
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const breakpoints = [
    { name: 'breakpoint_1920x1080.png', width: 1920, height: 1080 },
    { name: 'breakpoint_1366x768.png', width: 1366, height: 768 },
    { name: 'breakpoint_820x1180.png', width: 820, height: 1180 },
    { name: 'breakpoint_390x844.png', width: 390, height: 844 },
  ];

  for (const bp of breakpoints) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const outPath = path.join(artifactDir, bp.name);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot: ${outPath} (${bp.width}x${bp.height})`);

    // Capture active corridor state at 1920x1080
    if (bp.width === 1920) {
      const startBtn = page.getByRole('button', { name: /START AI CORRIDOR ANALYSIS/i });
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(500);
        const activateBtn = page.getByRole('button', { name: /ACTIVATE EMERGENCY CORRIDOR/i });
        if (await activateBtn.isVisible()) {
          await activateBtn.click();
          await page.waitForTimeout(3000);
          const activePath = path.join(artifactDir, 'active_corridor_1920x1080.png');
          await page.screenshot({ path: activePath });
          console.log(`Saved active corridor screenshot: ${activePath}`);
        }
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('All responsive screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
