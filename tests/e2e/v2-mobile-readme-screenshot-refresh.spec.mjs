import { expect, test } from "@playwright/test";

const captureEnabled = process.env.CAPTURE_V2_MOBILE_README === "1";
const output = (name) => `test-results/v2-mobile-readme-refresh/${name}.png`;

test.skip(!captureEnabled, "Mobile README screenshots are generated only by the refresh workflow.");

test("capture refreshed mobile home options", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/v2/index.html?district=11530");
  await page.waitForLoadState("networkidle");

  await expect(page.locator("#map-selected-name")).toHaveText("구로구");
  await expect(page.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);

  await page.screenshot({
    path: output("redveil-v2-mobile-home-top"),
    fullPage: false,
  });

  await page.setViewportSize({ width: 430, height: 1200 });
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "0.9";
  });
  await page.waitForTimeout(250);

  const flowClip = await page.evaluate(() => {
    const candidate = document.querySelector(".v2-candidate-panel");
    const box = candidate?.getBoundingClientRect();
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const height = Math.min(Math.ceil((box?.bottom || 0) + 120), documentHeight, 3000);
    return { x: 0, y: 0, width: window.innerWidth, height: Math.max(height, 1400) };
  });

  await page.screenshot({
    path: output("redveil-v2-mobile-home-flow"),
    clip: flowClip,
  });
});
