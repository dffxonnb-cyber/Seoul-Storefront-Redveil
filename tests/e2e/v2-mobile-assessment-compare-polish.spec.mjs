import { expect, test } from "@playwright/test";

const mobileViewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

for (const viewport of mobileViewports) {
  test(`3분 진단 Hero는 ${viewport.width}px에서 요청한 두 줄을 유지한다`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const runtimeErrors = watchRuntimeErrors(page);

    await page.goto("/v2/assessment.html?district=11530");

    const heading = page.locator(".v2-assessment-hero-copy h1");
    const lines = heading.locator(".v2-assessment-hero-line");

    await expect(heading).toBeVisible();
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toHaveText("매입 전, 3분 안에 보류");
    await expect(lines.nth(1)).toHaveText("신호를 먼저 확인합니다.");

    const boxes = [await lines.nth(0).boundingBox(), await lines.nth(1).boundingBox()];
    expect(boxes[0]).not.toBeNull();
    expect(boxes[1]).not.toBeNull();
    expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 2);

    const metrics = await lines.evaluateAll((elements) =>
      elements.map((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return {
          display: getComputedStyle(element).display,
          lineFragments: range.getClientRects().length,
        };
      })
    );

    for (const metric of metrics) {
      expect(metric.display).toBe("block");
      expect(metric.lineFragments).toBe(1);
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

  test(`후보 비교 리스크 신호는 ${viewport.width}px에서 한 행 3칸을 유지한다`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const runtimeErrors = watchRuntimeErrors(page);

    await page.goto("/v2/compare.html?a=11650&b=11530&c=11710");

    const compareCards = page.locator(".compare-card");
    await expect(compareCards).toHaveCount(3);

    for (let cardIndex = 0; cardIndex < 3; cardIndex += 1) {
      const grid = compareCards.nth(cardIndex).locator(".risk-signal-grid");
      const signals = grid.locator(":scope > .risk-signal-card");

      await expect(grid).toBeVisible();
      await expect(signals).toHaveCount(3);

      const boxes = [];
      for (let signalIndex = 0; signalIndex < 3; signalIndex += 1) {
        const box = await signals.nth(signalIndex).boundingBox();
        expect(box).not.toBeNull();
        boxes.push(box);
      }

      expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(1);
      expect(Math.abs(boxes[1].y - boxes[2].y)).toBeLessThanOrEqual(1);
      expect(boxes[0].x).toBeLessThan(boxes[1].x);
      expect(boxes[1].x).toBeLessThan(boxes[2].x);
      expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(2);
      expect(Math.abs(boxes[1].width - boxes[2].width)).toBeLessThanOrEqual(2);

      const gridBox = await grid.boundingBox();
      expect(gridBox).not.toBeNull();
      expect(boxes[0].x).toBeGreaterThanOrEqual(gridBox.x - 1);
      expect(boxes[2].x + boxes[2].width).toBeLessThanOrEqual(gridBox.x + gridBox.width + 1);
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

test("데스크톱에서는 페이지별 기존 배치를 유지한다", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/v2/assessment.html?district=11530");
  const assessmentLines = page.locator(".v2-assessment-hero-line");
  await expect(assessmentLines).toHaveCount(2);
  expect(await assessmentLines.nth(0).evaluate((element) => getComputedStyle(element).display)).toBe("inline");
  expect(await assessmentLines.nth(1).evaluate((element) => getComputedStyle(element).display)).toBe("inline");

  await page.goto("/v2/compare.html?a=11650&b=11530&c=11710");
  const desktopSignals = page.locator(".compare-card").first().locator(".risk-signal-card");
  await expect(desktopSignals).toHaveCount(3);
  const firstBox = await desktopSignals.nth(0).boundingBox();
  const secondBox = await desktopSignals.nth(1).boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 2);
});
