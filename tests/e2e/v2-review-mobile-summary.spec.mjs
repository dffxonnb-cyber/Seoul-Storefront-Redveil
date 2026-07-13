import { expect, test } from "@playwright/test";

const phoneViewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

for (const viewport of phoneViewports) {
  test(`V2 매물 검토 요약 카드는 ${viewport.width}px에서 2열과 전체 폭 카드로 압축된다`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/v2/review.html?district=11530");

    const grid = page.locator(".review-status-grid");
    const cards = grid.locator(".review-status-card");
    await expect(cards).toHaveCount(3);

    const gridBox = await grid.boundingBox();
    const boxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      })
    );

    expect(gridBox).not.toBeNull();
    expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThanOrEqual(1);
    expect(boxes[0].right).toBeLessThan(boxes[1].left);
    expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(1);
    expect(boxes[2].top).toBeGreaterThanOrEqual(Math.max(boxes[0].bottom, boxes[1].bottom));
    expect(Math.abs(boxes[2].left - gridBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxes[2].width - gridBox.width)).toBeLessThanOrEqual(1);

    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(-1);
      expect(box.right).toBeLessThanOrEqual(viewport.width + 1);
    }
  });
}

test("V2 매물 검토 요약 카드는 태블릿에서 기존 1열 흐름을 유지한다", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/v2/review.html?district=11530");

  const boxes = await page.locator(".review-status-card").evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top, bottom: rect.bottom, width: rect.width };
    })
  );

  expect(boxes).toHaveLength(3);
  expect(Math.abs(boxes[0].left - boxes[1].left)).toBeLessThanOrEqual(1);
  expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(1);
  expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
  expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[1].bottom);
});
