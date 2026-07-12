import { expect, test } from "@playwright/test";

const output = (name) => `test-results/v2-portfolio/${name}.png`;

async function clearState(page) {
  await page.goto("/index.html");
  await page.evaluate(() => window.localStorage.clear());
}

test("V2 portfolio release screenshots", async ({ page }) => {
  await clearState(page);

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/v2/index.html?district=11650");
  await expect(page.locator("#map-selected-name")).toHaveText("서초구");
  await expect(page.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);
  await page.screenshot({ path: output("redveil-v2-desktop-home-2026-07-12"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/v2/index.html?district=11650");
  await expect(page.locator("#map-selected-name")).toHaveText("서초구");
  await page.screenshot({ path: output("redveil-v2-mobile-home-2026-07-12"), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/v2/review.html?district=11650");
  await page.locator("#admin-dong-name").fill("서초동");
  await page.locator("#asking-price-total").fill("92000");
  await page.locator("#exclusive-area-sqm").fill("43");
  await page.locator("#target-tenant").fill("카페");
  await page.locator("#asset-name").fill("서초동 검토 매물");
  await page.getByRole("button", { name: "보류 메모 생성" }).click();
  await expect(page.locator("#review-result")).toContainText("보류 판단 메모");
  await page.screenshot({ path: output("redveil-v2-property-review-2026-07-12"), fullPage: true });

  await page.goto("/v2/assessment.html?district=11650");
  await page.locator("#asking-price-per-sqm").fill("2350");
  await page.locator("#holding-months").fill("36");
  await page.getByRole("button", { name: "보류 신호 진단 실행" }).click();
  await expect(page.locator("#assessment-result")).toContainText("서초구");
  await page.screenshot({ path: output("redveil-v2-assessment-2026-07-12"), fullPage: true });

  await page.goto("/v2/compare.html?a=11650&b=11530&c=11680");
  await expect(page.locator("#compare-grid .compare-card")).toHaveCount(3);
  await page.screenshot({ path: output("redveil-v2-candidate-compare-2026-07-12"), fullPage: true });

  await page.goto("/v2/districts.html?district=11650");
  await expect(page.locator("#v2-report-district-name")).toHaveText("서초구");
  await page.screenshot({ path: output("redveil-v2-district-report-2026-07-12"), fullPage: true });
});
