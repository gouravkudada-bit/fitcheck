import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/durga/.gemini/antigravity-ide/brain/3fc288aa-6f21-443c-8dfe-895e85024762';

async function runE2E() {
  console.log('--- Starting End-to-End Test with Chrome Headless ---');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 920, deviceScaleFactor: 2 });

  try {
    // 1. Navigate to FitCheck
    console.log('1. Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_1_landing.png'), fullPage: true });
    console.log('-> Captured screenshot_1_landing.png');

    // 2. Click Sign In
    console.log('2. Clicking Sign In button...');
    await page.waitForSelector('.header-signin-btn');
    await page.click('.header-signin-btn');
    await new Promise(r => setTimeout(r, 600));

    // 3. Click Continue with Google
    console.log('3. Authenticating with Google...');
    await page.waitForSelector('.google-signin-btn');
    await page.click('.google-signin-btn');
    await new Promise(r => setTimeout(r, 800));

    // Verify user profile badge
    await page.waitForSelector('.user-profile-badge');
    console.log('-> Successfully logged in as Alex Fashion');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_2_signed_in.png'), fullPage: true });
    console.log('-> Captured screenshot_2_signed_in.png');

    // 4. Load outfit photo via demo shortcut or file input
    console.log('4. Loading outfit photo...');
    await page.waitForSelector('#try-demo-outfit-btn');
    await page.click('#try-demo-outfit-btn');
    await page.waitForSelector('.preview-container');
    console.log('-> Outfit photo preview loaded');

    // 5. Select occasion 'Date'
    console.log('5. Selecting occasion: Date...');
    const occasionPills = await page.$$('.occasion-pill');
    for (const pill of occasionPills) {
      const text = await page.evaluate(el => el.textContent, pill);
      if (text.includes('Date')) {
        await pill.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 400));

    // 6. Click 'Check My Fit'
    console.log('6. Clicking Check My Fit...');
    await page.waitForSelector('#check-my-fit-btn');
    await page.click('#check-my-fit-btn');

    // 7. Wait for rating results card
    console.log('7. Waiting for AI rating and suggestions to complete...');
    await page.waitForSelector('#fitcheck-results-card', { timeout: 15000 });
    const scoreVal = await page.$eval('#fit-score-value', el => el.textContent);
    console.log(`-> Rating received: ${scoreVal} / 10`);

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_3_outfit_evaluated.png'), fullPage: true });
    console.log('-> Captured screenshot_3_outfit_evaluated.png');

    // 8. Navigate to 'My History'
    console.log('8. Navigating to My History tab...');
    const tabs = await page.$$('.nav-tab-btn');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('My History')) {
        await tab.click();
        break;
      }
    }

    // 9. Verify History card rendered
    console.log('9. Verifying history card...');
    await page.waitForSelector('.history-card');
    console.log('-> Found history card in My History list');

    // 10. Click on history card to expand suggestions drawer
    console.log('10. Expanding suggestions on history card...');
    await page.click('.history-card-main');
    await page.waitForSelector('.history-suggestions-drawer');
    console.log('-> Suggestions drawer expanded successfully');

    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_4_my_history.png'), fullPage: true });
    console.log('-> Captured screenshot_4_my_history.png');

    console.log('\n--- ALL END-TO-END STEPS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Error during E2E test:', err);
  } finally {
    await browser.close();
  }
}

runE2E();
