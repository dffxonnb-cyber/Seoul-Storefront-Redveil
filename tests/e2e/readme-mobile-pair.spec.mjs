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
  await page.addStyleTag({
    content: `
      .v2-mobile-bar { position: static !important; top: auto !important; }
      .v2-topbar,
      .v2-hero-panel,
      .v2-side-stack,
      .v2-candidates-panel,
      .v2-workflow-panel,
      .v2-limitations-panel { display: none !important; }
      .v2-dashboard { display: block !important; }
      .v2-map-panel { margin: 0 !important; }
    `,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  await page.screenshot({
    path: "test-results/readme-mobile-map.png",
    fullPage: false,
  });

  await page.goto("/v2/districts.html?district=11650");
  await expect(page.locator("#v2-report-title")).toContainText("서초구");
  await page.addStyleTag({
    content: `
      .v2-mobile-bar { position: static !important; top: auto !important; }
      .v2-topbar,
      .v2-report-summary,
      .v2-report-score,
      .v2-report-factors,
      .v2-report-pause,
      .v2-report-alternatives,
      .v2-report-fallback { display: none !important; }
      .v2-report-layout { display: block !important; }
      .v2-report-memo,
      .v2-report-limitations { margin: 0 0 10px !important; }
    `,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  await page.screenshot({
    path: "test-results/readme-mobile-report.png",
    fullPage: false,
  });
});
