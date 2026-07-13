import { expect, test } from "@playwright/test";

const mobileViewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
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
  test(`구별 리포트는 ${viewport.width}px에서 모든 섹션을 겹침 없이 세로 배치한다`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const runtimeErrors = watchRuntimeErrors(page);

    await page.goto("/v2/districts.html?district=11650");
    await expect(page.locator("#v2-report-district-name")).toHaveText("서초구");

    const layout = page.locator(".v2-report-layout");
    const sections = layout.locator(":scope > section:not(#v2-report-fallback)");

    await expect(layout).toBeVisible();
    await expect(sections).toHaveCount(7);
    expect(await layout.evaluate((element) => getComputedStyle(element).display)).toBe("flex");

    const sectionBoxes = [];
    for (let index = 0; index < 7; index += 1) {
      const section = sections.nth(index);
      await expect(section).toBeVisible();
      const box = await section.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      sectionBoxes.push(box);
    }

    for (let index = 1; index < sectionBoxes.length; index += 1) {
      const previousBottom = sectionBoxes[index - 1].y + sectionBoxes[index - 1].height;
      expect(sectionBoxes[index].y).toBeGreaterThanOrEqual(previousBottom + 7);
    }

    const memo = page.locator(".v2-report-memo");
    const memoHead = memo.locator(":scope > .v2-panel-head");
    const question = memo.locator(":scope > .v2-report-decision-question");
    const checklist = memo.locator(":scope > .v2-report-checklist");
    const note = memo.locator(":scope > .v2-report-professional-note");

    await expect(memoHead).toBeVisible();
    await expect(question).toBeVisible();
    await expect(checklist).toBeVisible();
    await expect(checklist.locator(":scope > li")).toHaveCount(3);
    await expect(note).toBeVisible();

    const memoBox = await memo.boundingBox();
    const memoHeadBox = await memoHead.boundingBox();
    const questionBox = await question.boundingBox();
    const checklistBox = await checklist.boundingBox();
    const noteBox = await note.boundingBox();

    expect(memoBox).not.toBeNull();
    expect(memoHeadBox).not.toBeNull();
    expect(questionBox).not.toBeNull();
    expect(checklistBox).not.toBeNull();
    expect(noteBox).not.toBeNull();

    expect(questionBox.y).toBeGreaterThanOrEqual(memoHeadBox.y + memoHeadBox.height - 1);
    expect(checklistBox.y).toBeGreaterThanOrEqual(questionBox.y + questionBox.height + 7);
    expect(noteBox.y).toBeGreaterThanOrEqual(checklistBox.y + checklistBox.height + 7);
    expect(noteBox.y + noteBox.height).toBeLessThanOrEqual(memoBox.y + memoBox.height + 1);

    const limitations = page.locator(".v2-report-limitations");
    const limitationsBox = await limitations.boundingBox();
    expect(limitationsBox).not.toBeNull();
    expect(limitationsBox.y).toBeGreaterThanOrEqual(memoBox.y + memoBox.height + 7);

    const pageLayout = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    expect(pageLayout.documentWidth).toBeLessThanOrEqual(pageLayout.innerWidth + 1);
    expect(pageLayout.bodyWidth).toBeLessThanOrEqual(pageLayout.innerWidth + 1);
    expect(runtimeErrors).toEqual([]);
  });
}

test("구별 리포트 데스크톱은 기존 grid 구성을 유지한다", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/v2/districts.html?district=11650");
  await expect(page.locator("#v2-report-district-name")).toHaveText("서초구");

  const layout = page.locator(".v2-report-layout");
  await expect(layout).toBeVisible();
  expect(await layout.evaluate((element) => getComputedStyle(element).display)).toBe("grid");
});
