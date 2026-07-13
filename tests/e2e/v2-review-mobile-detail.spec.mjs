import { expect, test } from "@playwright/test";

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test("V2 모바일 상세 판단 리포트는 다크 표면과 읽히는 KPI 대비를 유지한다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const runtimeErrors = watchRuntimeErrors(page);

  await page.goto("/v2/review.html?district=11650");
  await page.locator("#admin-dong-name").fill("서초동");
  await page.locator("#asking-price-total").fill("92000");
  await page.locator("#target-tenant").fill("카페");
  await page.locator("#asset-name").fill("서초역 역세권 코너 건물");
  await page.locator("#exclusive-area").fill("35");
  await page.getByRole("button", { name: "보류 메모 생성" }).click();

  const detail = page.locator("#review-detail");
  const hero = detail.locator(".review-detail-hero");
  const kpis = hero.locator(".review-detail-kpis > div");

  await expect(detail).toBeVisible();
  await expect(hero).toBeVisible();
  await expect(kpis).toHaveCount(3);

  const heroStyle = await hero.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundImage: style.backgroundImage,
      color: style.color,
    };
  });

  expect(heroStyle.backgroundImage).toContain("linear-gradient");
  expect(heroStyle.backgroundImage).toContain("rgba(18, 20, 29, 0.98)");
  expect(heroStyle.color).toBe("rgb(245, 247, 251)");

  const kpiStyles = await kpis.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      const label = getComputedStyle(element.querySelector("span"));
      const value = getComputedStyle(element.querySelector("strong"));
      return {
        backgroundColor: style.backgroundColor,
        labelColor: label.color,
        valueColor: value.color,
      };
    })
  );

  for (const style of kpiStyles) {
    expect(style.backgroundColor).toBe("rgba(13, 16, 24, 0.94)");
    expect(style.labelColor).toBe("rgba(172, 180, 198, 0.82)");
    expect(style.valueColor).toBe("rgb(255, 51, 71)");
  }

  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
  expect(runtimeErrors).toEqual([]);
});
