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
  test(`V2 매물 검토 그룹 제목은 ${viewport.name}에서 카드 내부 첫 행으로 표시된다`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const runtimeErrors = watchRuntimeErrors(page);

    await page.goto("/v2/review.html?district=11530");

    const groups = page.locator(".review-form-group");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0).locator(":scope > legend")).toHaveText("빠른 검토 필수");
    await expect(groups.nth(1).locator(":scope > legend")).toHaveText("선택 입력");

    const expectedHeadings = ["빠른 검토 필수", "선택 입력"];

    for (let index = 0; index < 2; index += 1) {
      const group = groups.nth(index);
      const legend = group.locator(":scope > legend");
      const firstField = group.locator(":scope > .field").first();

      const groupBox = await group.boundingBox();
      const fieldBox = await firstField.boundingBox();

      expect(groupBox).not.toBeNull();
      expect(fieldBox).not.toBeNull();
      expect(fieldBox.y).toBeGreaterThanOrEqual(groupBox.y + 48);

      const styles = await group.evaluate((element) => {
        const before = getComputedStyle(element, "::before");
        const legendElement = element.querySelector("legend");
        const legendStyle = getComputedStyle(legendElement);
        return {
          headingContent: before.content,
          headingDisplay: before.display,
          headingBorderBottomWidth: before.borderBottomWidth,
          headingGridColumnStart: before.gridColumnStart,
          headingGridColumnEnd: before.gridColumnEnd,
          legendPosition: legendStyle.position,
          legendWidth: legendStyle.width,
          legendHeight: legendStyle.height,
          legendOverflow: legendStyle.overflow,
        };
      });

      expect(styles.headingContent).toContain(expectedHeadings[index]);
      expect(styles.headingDisplay).toBe("block");
      expect(styles.headingBorderBottomWidth).toBe("1px");
      expect(styles.headingGridColumnStart).toBe("1");
      expect(styles.headingGridColumnEnd).toBe("-1");
      expect(styles.legendPosition).toBe("absolute");
      expect(styles.legendWidth).toBe("1px");
      expect(styles.legendHeight).toBe("1px");
      expect(styles.legendOverflow).toBe("hidden");
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
