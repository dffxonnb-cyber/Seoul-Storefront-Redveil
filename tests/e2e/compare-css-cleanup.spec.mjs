import { expect, test } from "@playwright/test";

test("compare page applies corrected styles and restrained crimson accents", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/compare.html?a=11620&b=11650&c=11680");

  await expect(page.locator(".compare-card")).toHaveCount(3);
  await expect(page.locator(".candidate-district-map.is-ready")).toHaveCount(3);
  await expect(page.locator(".decision-memo-row.is-primary")).toBeVisible();
  await expect(page.locator(".metric-scoreline span").first()).toBeVisible();

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
    const metricScore = styleOf(".metric-scoreline span");
    const metricBar = styleOf(".metric-mini-row .progress-track span");
    const rankPill = styleOf(".compare-card .rank-pill");
    const highSignal = styleOf(".risk-signal-card.tone-high");
    const highSignalValue = styleOf(".risk-signal-card.tone-high strong");
    const compareButton = styleOf("#compare-run");
    const candidateMap = styleOf(".candidate-district-map:not(.is-amber):not(.is-cool)");

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
      metricScoreColor: metricScore.color,
      metricScoreShadow: metricScore.textShadow,
      metricBarBackground: metricBar.backgroundImage,
      rankPillColor: rankPill.color,
      rankPillBorder: rankPill.borderTopColor,
      highSignalBorder: highSignal.borderTopColor,
      highSignalValueColor: highSignalValue.color,
      compareButtonBackground: compareButton.backgroundImage,
      mapAccent: candidateMap.getPropertyValue("--map-accent").trim(),
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
  expect(computed.primaryMemoBorder).toBe("rgba(196, 63, 82, 0.2)");
  expect(computed.memoStrongSize).toBe("14px");

  expect(computed.metricScoreColor).toBe("rgba(244, 246, 250, 0.95)");
  expect(computed.metricScoreShadow).toBe("none");
  expect(computed.metricBarBackground).toContain("rgb(196, 63, 82)");
  expect(computed.rankPillColor).toBe("rgb(212, 90, 107)");
  expect(computed.rankPillBorder).toBe("rgba(196, 63, 82, 0.2)");
  expect(computed.highSignalBorder).toBe("rgba(196, 63, 82, 0.2)");
  expect(computed.highSignalValueColor).toBe("rgba(244, 246, 250, 0.95)");
  expect(computed.compareButtonBackground).toContain("rgb(173, 48, 69)");
  expect(computed.mapAccent).toBe("#c43f52");
});
