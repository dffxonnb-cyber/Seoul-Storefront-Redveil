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

test("V2 지도에서 선택한 구를 V2 3분 진단으로 이어간다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/v2/index.html");
  await expect(page.locator("[data-v2-risk-map] .v2-map-district")).toHaveCount(25);

  await page.locator('.v2-map-district[data-code="11530"]').click();
  await expect(page.locator("#map-selected-name")).toHaveText("구로구");

  const assessmentNavigation = page.locator('[data-v2-nav="assessment"]');
  await expect(assessmentNavigation).toHaveAttribute("href", /\.\/assessment\.html\?district=11530/);
  await assessmentNavigation.click();

  await expect(page).toHaveURL(/\/v2\/assessment\.html\?district=11530/);
  await expect(page.locator("body")).toHaveAttribute("data-v2-view", "assessment");
  await expect(page.locator('[data-v2-nav="assessment"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#district-code")).toHaveValue("11530");
  await expect(page.locator("#v2-assessment-selected-district")).toContainText("구로구");
  expect(runtimeErrors).toEqual([]);
});

test("V2 3분 진단은 기존 계산 기능과 한국어 결과 문구를 유지한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/v2/assessment.html?district=11650");

  await expect(page.locator("#district-code")).toHaveValue("11650");
  await page.locator("#asking-price").fill("3100");
  await page.locator("#holding-months").fill("48");
  await page.locator("#priority").selectOption("balanced");
  await page.getByRole("button", { name: "보류 신호 진단 실행" }).click();

  await expect(page.locator("#assessment-result h2")).toContainText("서초구");
  await expect(page.locator("#assessment-result")).toContainText("보류 신호 점수");
  await expect(page.locator("#assessment-result")).not.toContainText("Hold Signal Score");
  await expect(page.locator(".topnav")).toHaveCount(0);
  await expect(page).toHaveURL(/district=11650/);
  expect(runtimeErrors).toEqual([]);
});

test("V2 모바일 3분 진단은 드로어와 본문이 화면 너비를 넘지 않는다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/v2/assessment.html?district=11530");

  await expect(page.locator(".v2-mobile-bar")).toBeVisible();
  await expect(page.locator("#v2-sidebar")).toHaveAttribute("aria-hidden", "true");
  await page.locator("[data-v2-menu-open]").click();
  await expect(page.locator("body")).toHaveClass(/v2-nav-open/);
  await expect(page.locator('[data-v2-nav="assessment"]')).toHaveAttribute("aria-current", "page");
  await page.locator("[data-v2-menu-close]").click();
  await expect(page.locator("body")).not.toHaveClass(/v2-nav-open/);

  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.innerWidth + 1);

  for (const selector of [
    ".v2-assessment-hero",
    ".v2-assessment-input-panel",
    ".v2-assessment-insight-grid",
    ".v2-assessment-result-panel",
  ]) {
    const box = await page.locator(selector).boundingBox();
    expect(box, `${selector} should have a rendered box`).not.toBeNull();
    expect(box.x, `${selector} should not escape left`).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, `${selector} should not escape right`).toBeLessThanOrEqual(391);
  }
  expect(runtimeErrors).toEqual([]);
});
