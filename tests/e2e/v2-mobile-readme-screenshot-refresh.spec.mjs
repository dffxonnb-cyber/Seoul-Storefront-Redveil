import { expect, test } from "@playwright/test";

const captureEnabled = process.env.CAPTURE_V2_MOBILE_README === "1";
const output = (name) => `test-results/v2-mobile-readme-refresh/${name}.png`;

test.skip(!captureEnabled, "Mobile README screenshots are generated only by the refresh workflow.");

async function openMobileHome(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto("/index.html");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/v2/index.html?district=11530");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#map-selected-name")).toHaveText("구로구");
  await expect(page.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);
}

test("capture refreshed mobile home full-page options", async ({ page }) => {
  await openMobileHome(page, 390, 844);
  await page.screenshot({
    path: output("redveil-v2-mobile-home-fullpage-390"),
    fullPage: true,
  });

  await openMobileHome(page, 430, 900);
  await page.evaluate(() => {
    document.documentElement.style.zoom = "0.9";
  });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: output("redveil-v2-mobile-home-fullpage-430"),
    fullPage: true,
  });
});
