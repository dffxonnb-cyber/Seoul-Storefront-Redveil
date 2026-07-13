import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

for (const viewport of viewports) {
  test(`V2 매물 검토 그룹 제목은 ${viewport.name}에서 카드 내부 헤더로 표시된다`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const runtimeErrors = watchRuntimeErrors(page);

    await page.goto("/v2/review.html?district=11530");

    const groups = page.locator(".review-form-group");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0).locator(":scope > legend")).toHaveText("빠른 검토 필수");
    await expect(groups.nth(1).locator(":scope > legend")).toHaveText("선택 입력");

    for (let index = 0; index < 2; index += 1) {
      const group = groups.nth(index);
      const legend = group.locator(":scope > legend");
      const firstField = group.locator(":scope > .field").first();

      const groupBox = await group.boundingBox();
      const legendBox = await legend.boundingBox();
      const fieldBox = await firstField.boundingBox();

      expect(groupBox).not.toBeNull();
      expect(legendBox).not.toBeNull();
      expect(fieldBox).not.toBeNull();

      expect(legendBox.y).toBeGreaterThanOrEqual(groupBox.y + 10);
      expect(legendBox.x).toBeGreaterThanOrEqual(groupBox.x + 10);
      expect(legendBox.x + legendBox.width).toBeLessThanOrEqual(groupBox.x + groupBox.width - 10);
      expect(fieldBox.y).toBeGreaterThanOrEqual(legendBox.y + legendBox.height + 8);

      const style = await legend.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          position: computed.position,
          borderBottomWidth: computed.borderBottomWidth,
          textTransform: computed.textTransform,
        };
      });

      expect(style.position).toBe("absolute");
      expect(style.borderBottomWidth).toBe("1px");
      expect(style.textTransform).toBe("none");
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
}
