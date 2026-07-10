import { expect, test } from "@playwright/test";

test("compare page applies corrected legacy styles", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/compare.html?a=11620&b=11650&c=11680");

  await expect(page.locator(".compare-card")).toHaveCount(3);
  await expect(page.locator(".candidate-district-map.is-ready")).toHaveCount(3);
  await expect(page.locator(".decision-memo-row.is-primary")).toBeVisible();

  const computed = await page.evaluate(() => {
    const styleOf = (selector) => getComputedStyle(document.querySelector(selector));
    const hero = styleOf(".service-subhero");
    const heading = styleOf(".subhero-copy h2");
    const intro = styleOf(".subhero-copy > div:first-child > p:not(.section-label)");
    const benchmark = styleOf(".benchmark-line");
    const benchmarkStrong = styleOf(".benchmark-line strong");
    const board = styleOf(".risk-signal-board");
    const signalNote = styleOf(".risk-signal-card p");
    const memo = styleOf(".compare-memo-card");
    const primaryMemo = styleOf(".decision-memo-row.is-primary");
    const memoStrong = styleOf(".decision-memo-row strong");

    return {
      heroBackground: hero.backgroundImage,
      headingSize: parseFloat(heading.fontSize),
      introColor: intro.color,
      benchmarkPadding: [benchmark.paddingTop, benchmark.paddingRight, benchmark.paddingBottom, benchmark.paddingLeft],
      benchmarkStrongColor: benchmarkStrong.color,
      boardDisplay: board.display,
      boardGap: board.gap,
      signalMarginTop: signalNote.marginTop,
      signalFontSize: signalNote.fontSize,
      memoPosition: memo.position,
      memoOverflow: memo.overflow,
      primaryMemoBorder: primaryMemo.borderTopColor,
      memoStrongSize: memoStrong.fontSize,
    };
  });

  expect(computed.heroBackground).toContain("radial-gradient");
  expect(computed.headingSize).toBeGreaterThanOrEqual(30);
  expect(computed.introColor).toBe("rgba(210, 216, 230, 0.72)");
  expect(computed.benchmarkPadding).toEqual(["12px", "13px", "12px", "13px"]);
  expect(computed.benchmarkStrongColor).toBe("rgba(245, 247, 252, 0.92)");
  expect(computed.boardDisplay).toBe("grid");
  expect(computed.boardGap).toBe("9px");
  expect(computed.signalMarginTop).toBe("8px");
  expect(computed.signalFontSize).toBe("12px");
  expect(computed.memoPosition).toBe("relative");
  expect(computed.memoOverflow).toBe("hidden");
  expect(computed.primaryMemoBorder).toBe("rgba(255, 54, 80, 0.28)");
  expect(computed.memoStrongSize).toBe("14px");
});
