import { expect, test } from "@playwright/test";

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => window.localStorage.clear());
});

test("V2 선택 자치구는 모든 화면과 직접 재진입에서 유지된다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);

  await page.goto("/v2/index.html");
  await expect(page.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);
  await page.locator('.v2-map-district[data-code="11530"]').click();
  await expect(page.locator("#map-selected-name")).toHaveText("구로구");
  await expect(page).toHaveURL(/\/v2\/index\.html\?district=11530/);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("redveil-selected-district"))).toBe("11530");

  await page.goto("/v2/review.html");
  await expect(page).toHaveURL(/\/v2\/review\.html\?district=11530/);
  await expect(page.locator("#review-district-code")).toHaveValue("11530");
  await expect(page.locator("#v2-review-selected-district")).toContainText("구로구");

  await page.goto("/v2/assessment.html");
  await expect(page).toHaveURL(/\/v2\/assessment\.html\?district=11530/);
  await expect(page.locator("#district-code")).toHaveValue("11530");
  await expect(page.locator("#v2-assessment-selected-district")).toContainText("구로구");

  await page.goto("/v2/compare.html");
  await expect(page).toHaveURL(/\/v2\/compare\.html\?a=11530/);
  await expect(page.locator("#compare-a")).toHaveValue("11530");
  await expect(page.locator("#v2-compare-selection-status")).toContainText("구로구");

  await page.goto("/v2/districts.html");
  await expect(page).toHaveURL(/\/v2\/districts\.html\?district=11530/);
  await expect(page.locator("#v2-report-district-name")).toHaveText("구로구");

  await page.goto("/v2/index.html");
  await expect(page).toHaveURL(/\/v2\/index\.html\?district=11530/);
  await expect(page.locator("#map-selected-name")).toHaveText("구로구");
  await expect(page.locator('.v2-map-district[data-code="11530"]')).toHaveAttribute("aria-pressed", "true");

  expect(runtimeErrors).toEqual([]);
});

test("V2의 잘못된 자치구 쿼리는 최근 유효 선택으로 복구된다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/v2/index.html");
  await page.evaluate(() => window.localStorage.setItem("redveil-selected-district", "11650"));

  await page.goto("/v2/compare.html?a=not-a-district");
  await expect(page).toHaveURL(/a=11650/);
  await expect(page.locator("#compare-a")).toHaveValue("11650");
  await expect(page.locator("#v2-compare-selection-status")).toContainText("서초구");

  await page.goto("/v2/districts.html?district=99999");
  await expect(page).toHaveURL(/district=11650/);
  await expect(page.locator("#v2-report-district-name")).toHaveText("서초구");

  expect(runtimeErrors).toEqual([]);
});
