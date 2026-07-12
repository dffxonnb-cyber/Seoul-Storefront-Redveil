import { expect, test } from "@playwright/test";

const captureEnabled = process.env.CAPTURE_V2_README_LAYOUT === "1";
const evidence = (name) => `docs/evidence/${name}.png`;

test.skip(!captureEnabled, "README presentation visuals are generated only by the documentation workflow.");

test("capture focused high-DPI README visuals", async ({ browser }) => {
  const desktopContext = await browser.newContext({
    viewport: { width: 1600, height: 1500 },
    deviceScaleFactor: 2,
  });
  const desktop = await desktopContext.newPage();
  await desktop.goto("/index.html");
  await desktop.evaluate(() => window.localStorage.clear());
  await desktop.goto("/v2/index.html?district=11530");
  await desktop.waitForLoadState("networkidle");
  await expect(desktop.locator("#map-selected-name")).toHaveText("구로구");
  await expect(desktop.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);
  await desktop.evaluate(() => {
    document.documentElement.style.zoom = "0.78";
  });
  await desktop.waitForTimeout(300);

  await desktop.screenshot({
    path: evidence("redveil-v2-readme-hero"),
    clip: { x: 105, y: 10, width: 1385, height: 1000 },
    animations: "disabled",
  });
  await desktop.screenshot({
    path: evidence("redveil-v2-readme-map-focus"),
    clip: { x: 265, y: 280, width: 910, height: 825 },
    animations: "disabled",
  });
  await desktop.screenshot({
    path: evidence("redveil-v2-readme-risk-focus"),
    clip: { x: 1180, y: 280, width: 315, height: 750 },
    animations: "disabled",
  });
  await desktopContext.close();

  const compareContext = await browser.newContext({
    viewport: { width: 1440, height: 1800 },
    deviceScaleFactor: 2,
  });
  const compare = await compareContext.newPage();
  await compare.goto("/v2/compare.html?a=11650&b=11530&c=11680");
  await compare.waitForLoadState("networkidle");
  await expect(compare.locator("#compare-grid .compare-card")).toHaveCount(3);
  await compare.screenshot({
    path: evidence("redveil-v2-readme-compare-focus"),
    clip: { x: 185, y: 390, width: 1240, height: 1260 },
    animations: "disabled",
  });
  await compareContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 1200 },
    deviceScaleFactor: 2,
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto("/index.html");
  await mobile.evaluate(() => window.localStorage.clear());
  await mobile.goto("/v2/index.html?district=11530");
  await mobile.waitForLoadState("networkidle");
  await expect(mobile.locator("#map-selected-name")).toHaveText("구로구");
  await expect(mobile.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);
  await mobile.screenshot({
    path: evidence("redveil-v2-readme-mobile-focus"),
    fullPage: false,
    animations: "disabled",
  });
  await mobileContext.close();
});
