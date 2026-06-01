import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil";
const outputDir = "docs/images";
const timestamp = Date.now();

const desktopShots = [
  {
    filename: "redveil-home.png",
    url: `${baseUrl}/index.html?shot=${timestamp}`,
    waitFor: "body",
  },
  {
    filename: "redveil-review.png",
    url: `${baseUrl}/review.html?shot=${timestamp}`,
    waitFor: "body[data-page='review']",
  },
  {
    filename: "redveil-assessment.png",
    url: `${baseUrl}/assessment.html?shot=${timestamp}`,
    waitFor: "body[data-page='assessment']",
  },
  {
    filename: "redveil-compare.png",
    url: `${baseUrl}/compare.html?shot=${timestamp}`,
    waitFor: "body[data-page='compare']",
  },
  {
    filename: "redveil-districts.png",
    url: `${baseUrl}/districts.html?shot=${timestamp}`,
    waitFor: "body[data-page='districts']",
  },
];

const mobileShots = [
  {
    filename: "redveil-home-mobile.png",
    url: `${baseUrl}/index.html?shot=${timestamp}`,
    waitFor: "body",
  },
  {
    filename: "redveil-review-mobile.png",
    url: `${baseUrl}/review.html?shot=${timestamp}`,
    waitFor: "body[data-page='review']",
  },
  {
    filename: "redveil-assessment-mobile.png",
    url: `${baseUrl}/assessment.html?shot=${timestamp}`,
    waitFor: "body[data-page='assessment']",
  },
  {
    filename: "redveil-compare-mobile.png",
    url: `${baseUrl}/compare.html?shot=${timestamp}`,
    waitFor: "body[data-page='compare']",
  },
  {
    filename: "redveil-districts-mobile.png",
    url: `${baseUrl}/districts.html?shot=${timestamp}`,
    waitFor: "body[data-page='districts']",
  },
];

async function captureShots({ browser, shots, viewport, deviceScaleFactor, isMobile = false, hasTouch = false, label }) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor,
    isMobile,
    hasTouch,
  });

  for (const shot of shots) {
    console.log(`[${label}] Capturing ${shot.filename}...`);

    await page.goto(shot.url, {
      waitUntil: "networkidle",
    });

    await page.waitForSelector(shot.waitFor, {
      timeout: 15000,
    });

    await page.waitForTimeout(1400);

    await page.screenshot({
      path: `${outputDir}/${shot.filename}`,
      fullPage: false,
    });

    console.log(`[${label}] Saved ${outputDir}/${shot.filename}`);
  }

  await page.close();
}

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

await captureShots({
  browser,
  shots: desktopShots,
  viewport: {
    width: 1440,
    height: 920,
  },
  deviceScaleFactor: 1,
  label: "desktop",
});

await captureShots({
  browser,
  shots: mobileShots,
  viewport: {
    width: 390,
    height: 844,
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  label: "mobile",
});

await browser.close();

console.log("All README screenshots captured.");