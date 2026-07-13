import { expect, test } from "@playwright/test";

const viewport = { width: 390, height: 844 };

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

test("capture README mobile map and district report", async ({ page }) => {
  await page.setViewportSize(viewport);

  await page.goto("/v2/index.html?district=11650");
  await expect(page.locator("#map-selected-name")).toContainText("서초구");
  await page.locator(".v2-map-panel").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -72));
  await settle(page);
  await page.screenshot({
    path: "test-results/readme-mobile-map.png",
    fullPage: false,
  });

  await page.goto("/v2/districts.html?district=11650");
  await expect(page.locator("#v2-report-title")).toContainText("서초구");
  await page.locator(".v2-report-memo").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -72));
  await settle(page);
  await page.screenshot({
    path: "test-results/readme-mobile-report.png",
    fullPage: false,
  });
});
