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

test("V2는 잘못된 자치구 주소를 유효한 기본 상태로 복구한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.evaluate(() => window.localStorage.setItem("redveil-selected-district", "broken-code"));
  await page.goto("/v2/assessment.html?district=99999");

  await expect(page.locator('link#redveil-v2-resilience')).toHaveCount(1);
  await expect(page.getByText("선택 자치구를 복구했습니다", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/district=\d{5}/);
  await expect(page.locator("#district-code")).not.toHaveValue("99999");

  const state = await page.evaluate(() => ({
    selected: document.getElementById("district-code")?.value || "",
    stored: window.localStorage.getItem("redveil-selected-district") || "",
  }));
  expect(state.selected).toMatch(/^\d{5}$/);
  expect(state.stored).toBe(state.selected);
  expect(runtimeErrors).toEqual([]);
});

test("V2 매물 검토는 손상된 저장 내역을 빈 목록으로 안전하게 복구한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.evaluate(() => window.localStorage.setItem("redveil-reviews", "{not-valid-json"));
  await page.goto("/v2/review.html?district=11650");

  await expect(page.getByText("저장된 검토 내역을 초기화했습니다", { exact: true })).toBeVisible();
  await expect(page.locator("#review-history")).toContainText("아직 저장된 검토가 없습니다");
  const stored = await page.evaluate(() => window.localStorage.getItem("redveil-reviews"));
  expect(stored).toBeNull();
  expect(runtimeErrors).toEqual([]);
});

test("V2 지도는 경계 데이터 연결 실패를 깨진 화면 대신 복구 안내로 표시한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.route("**/v2/data/seoul-districts.geojson", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
  });
  await page.goto("/v2/index.html?district=11650");

  await expect(page.getByText("경계 지도를 불러오지 못했습니다", { exact: true })).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#v2-boundary-status")).toContainText("확인 필요");
  await expect(page.locator("#selected-district-name")).not.toBeEmpty();
  const unexpectedErrors = runtimeErrors.filter((error) => !error.includes("503 (Service Unavailable)"));
  expect(unexpectedErrors).toEqual([]);
});

test("V2는 분석 데이터 파일이 없을 때 입력을 막고 다시 불러오기 안내를 제공한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.route("**/website_payload.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.__REDVEIL_PAYLOAD__ = { site: {}, summary: {}, districts: [] };",
    });
  });
  await page.goto("/v2/assessment.html");

  await expect(page.getByText("분석 데이터를 불러오지 못했습니다", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 불러오기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "보류 신호 진단 실행" })).toBeDisabled();
  expect(runtimeErrors).toEqual([]);
});

test("정상 구별 리포트는 전용 결과를 유지하고 일반 오류 안내를 노출하지 않는다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/v2/districts.html?district=11650");
  await expect(page.locator("#v2-report-district-name")).toHaveText("서초구");
  await page.waitForTimeout(900);
  await expect(page.locator('[data-v2-notice-id="feature-data-empty"]')).not.toBeVisible();
  await expect(page.locator('[data-v2-notice-id="district-report-unavailable"]')).toHaveCount(0);
  expect(runtimeErrors).toEqual([]);
});
