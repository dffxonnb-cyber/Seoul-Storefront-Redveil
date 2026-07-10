import { expect, test } from "@playwright/test";

const canonicalDistrictCodes = [
  "11110",
  "11140",
  "11170",
  "11200",
  "11215",
  "11230",
  "11260",
  "11290",
  "11305",
  "11320",
  "11350",
  "11380",
  "11410",
  "11440",
  "11470",
  "11500",
  "11530",
  "11545",
  "11560",
  "11590",
  "11620",
  "11650",
  "11680",
  "11710",
  "11740",
];

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

test("3분 진단은 선택 구를 계산하고 새로고침 뒤에도 유지한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/assessment.html?district=11530");

  await expect(page.locator('link[href*="forms.css"]')).toHaveCount(1);
  await expect(page.locator("#district-code")).toHaveValue("11530");
  await expect(page.locator("#assessment-result h2")).toContainText("구로구");

  await page.locator("#district-code").selectOption("11680");
  await page.getByRole("button", { name: "보류 신호 진단 실행" }).click();

  await expect(page).toHaveURL(/district=11680/);
  await expect(page.locator("#assessment-result h2")).toContainText("강남구");
  await expect(page.locator('.topnav a[href*="districts.html"]')).toHaveAttribute("href", /district=11680/);

  const selectTheme = await page.locator("#district-code").evaluate((select) => {
    const option = select.querySelector("option");
    return {
      colorScheme: getComputedStyle(select).colorScheme,
      optionColor: option ? getComputedStyle(option).color : "",
      optionBackground: option ? getComputedStyle(option).backgroundColor : "",
    };
  });
  expect(selectTheme.colorScheme).toContain("dark");
  expect(selectTheme.optionColor).toBe("rgb(244, 245, 247)");
  expect(selectTheme.optionBackground).toBe("rgb(8, 10, 15)");

  await page.reload();
  await expect(page.locator("#district-code")).toHaveValue("11680");
  expect(runtimeErrors).toEqual([]);
});

test("후보 비교는 중복 구를 막고 유효한 변경을 즉시 반영한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/compare.html?a=11530&b=11680&c=11140");

  await expect(page.locator("#compare-grid .compare-card")).toHaveCount(3);
  await page.locator("#compare-b").selectOption("11530");
  await expect(page.locator("#compare-selection-message")).toContainText("서로 다른 구");
  await expect(page.locator("#compare-b")).toHaveAttribute("aria-invalid", "true");

  await page.getByRole("button", { name: /보류 기준으로 비교/ }).click();
  await expect(page.locator("#compare-selection-message")).toContainText("최소 2개 이상의 서로 다른 구");

  await page.locator("#compare-b").selectOption("11680");
  await expect(page).toHaveURL(/b=11680/);
  await expect(page.locator("#compare-grid")).toContainText("구로구");
  await expect(page.locator("#compare-grid")).toContainText("강남구");
  await expect(page.locator("#compare-grid")).toContainText("중구");
  expect(runtimeErrors).toEqual([]);
});

test("매물 검토는 사용자 입력을 HTML로 실행하지 않는다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  let dialogOpened = false;
  page.on("dialog", async (dialog) => {
    dialogOpened = true;
    await dialog.dismiss();
  });

  await page.goto("/review.html?district=11530");
  await expect(page.locator("#review-district-code")).toHaveValue("11530");

  await page.locator("#admin-dong-name").fill("구로동");
  await page.locator("#asking-price-total").fill("85000");
  await page.locator("#target-tenant").fill("카페");
  await page.locator("#asset-name").fill('<img src=x onerror="alert(1)">');
  await page.getByRole("button", { name: "보류 메모 생성" }).click();

  await expect(page.locator("#review-result")).toContainText("구로구");
  await expect(page.locator("#review-result")).toContainText('<img src=x onerror="alert(1)">');
  await expect(page.locator('#review-result img[src="x"]')).toHaveCount(0);
  expect(dialogOpened).toBe(false);
  expect(runtimeErrors).toEqual([]);
});

test("배포용 GeoJSON은 서울 25개 자치구의 현재 코드를 사용한다", async ({ request }) => {
  const response = await request.get("/assets/seoul-districts.geojson");
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  const codes = payload.features.map((feature) => String(feature.properties.code)).sort();
  const names = new Set(payload.features.map((feature) => feature.properties.name));

  expect(codes).toEqual([...canonicalDistrictCodes].sort());
  expect(names.size).toBe(25);
});
