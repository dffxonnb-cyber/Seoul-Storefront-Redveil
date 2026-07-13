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
  test(`V2 홈 핵심 지표는 ${viewport.width}px에서 한 행 3열을 유지한다`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const runtimeErrors = watchRuntimeErrors(page);

    await page.goto("/v2/index.html?district=11530");

    const strip = page.locator(".v2-mission-strip");
    const cards = strip.locator(":scope > div");

    await expect(strip).toBeVisible();
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(2).locator("dt")).toHaveText("판단 기준");
    await expect(cards.nth(2).locator("dd")).toHaveText("보류 우선");

    const boxes = [];
    for (let index = 0; index < 3; index += 1) {
      const box = await cards.nth(index).boundingBox();
      expect(box).not.toBeNull();
      boxes.push(box);
    }

    const topTolerance = 1;
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(topTolerance);
    expect(Math.abs(boxes[1].y - boxes[2].y)).toBeLessThanOrEqual(topTolerance);

    expect(boxes[0].x).toBeLessThan(boxes[1].x);
    expect(boxes[1].x).toBeLessThan(boxes[2].x);

    const widthTolerance = 2;
    expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThanOrEqual(widthTolerance);
    expect(Math.abs(boxes[1].width - boxes[2].width)).toBeLessThanOrEqual(widthTolerance);

    const stripBox = await strip.boundingBox();
    expect(stripBox).not.toBeNull();
    expect(boxes[0].x).toBeGreaterThanOrEqual(stripBox.x - 1);
    expect(boxes[2].x + boxes[2].width).toBeLessThanOrEqual(stripBox.x + stripBox.width + 1);

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

test("V2 홈 데스크톱 구조는 유지된다", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/v2/index.html?district=11530");

  const hero = page.locator(".v2-hero-panel");
  const cards = page.locator(".v2-mission-strip > div");

  await expect(hero).toBeVisible();
  await expect(cards).toHaveCount(3);

  const columns = await hero.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(columns.split(" ").length).toBeGreaterThanOrEqual(3);
});
