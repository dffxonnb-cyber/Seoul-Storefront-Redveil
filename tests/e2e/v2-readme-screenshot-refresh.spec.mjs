import { expect, test } from "@playwright/test";

const captureEnabled = process.env.CAPTURE_V2_README === "1";
const output = (name) => `test-results/v2-readme-refresh/${name}.png`;

test.skip(!captureEnabled, "README screenshot options are generated only by the refresh workflow.");

test("capture refreshed desktop home options", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1200 });
  await page.goto("/index.html");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/v2/index.html?district=11530");
  await page.waitForLoadState("networkidle");

  await expect(page.locator("#map-selected-name")).toHaveText("구로구");
  await expect(page.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);
  await expect(page.locator(".v2-candidate-panel")).toBeVisible();

  await page.evaluate(() => {
    document.documentElement.style.zoom = "0.82";
  });
  await page.waitForTimeout(250);

  await page.screenshot({
    path: output("redveil-v2-desktop-home-overview"),
    fullPage: false,
  });

  const flowClip = await page.evaluate(() => {
    const candidate = document.querySelector(".v2-candidate-panel");
    const box = candidate?.getBoundingClientRect();
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const height = Math.min(Math.ceil((box?.top || 0) + 250), documentHeight, 1700);
    return { x: 0, y: 0, width: window.innerWidth, height: Math.max(height, 1050) };
  });

  await page.screenshot({
    path: output("redveil-v2-desktop-home-flow"),
    clip: flowClip,
  });
});
