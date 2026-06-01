import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = "https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil";

const timestamp = Date.now();

const shots = [
  {
    filename: "redveil-home.png",
    url: `${baseUrl}/index.html?shot=${timestamp}`,
    waitFor: "body[data-page='home']",
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

await fs.mkdir("docs/images", { recursive: true });

const browser = await chromium.launch();

const page = await browser.newPage({
  viewport: {
    width: 1440,
    height: 920,
  },
  deviceScaleFactor: 1,
});

for (const shot of shots) {
  console.log(`Capturing ${shot.filename}...`);

  await page.goto(shot.url, {
    waitUntil: "networkidle",
  });

  await page.waitForSelector(shot.waitFor);
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: `docs/images/${shot.filename}`,
    fullPage: false,
  });

  console.log(`Saved docs/images/${shot.filename}`);
}

await browser.close();

console.log("All README screenshots captured.");
