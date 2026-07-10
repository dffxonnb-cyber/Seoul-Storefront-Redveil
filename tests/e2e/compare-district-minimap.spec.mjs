import { expect, test } from "@playwright/test";

const candidates = [
  { code: "11620", name: "관악구" },
  { code: "11650", name: "서초구" },
  { code: "11680", name: "강남구" },
];

test("compare cards render actual Seoul district boundaries and selected districts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1180 });
  await page.goto("/compare.html?a=11620&b=11650&c=11680");

  const cards = page.locator("#compare-grid .compare-card");
  const maps = page.locator("#compare-grid .candidate-district-map.is-ready");

  await expect(cards).toHaveCount(3);
  await expect(maps).toHaveCount(3);

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const card = cards.nth(index);
    const map = maps.nth(index);

    await expect(card.locator(".candidate-title strong")).toHaveText(candidate.name);
    await expect(map).toHaveAttribute("data-map-code", candidate.code);
    await expect(map.locator(".candidate-map-district")).toHaveCount(25);
    await expect(map.locator(`.candidate-map-district.is-selected[data-code="${candidate.code}"]`)).toHaveCount(1);
    await expect(map.locator(".candidate-map-meta strong")).toHaveText(candidate.name);
    await expect(map.locator(".candidate-map-marker-dot")).toHaveCount(1);
  }

  await page.locator("#compare-grid").screenshot({ path: "test-results/compare-district-minimaps.png" });
});

test("district minimap updates when a comparison candidate changes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/compare.html?a=11620&b=11650&c=11680");

  const firstMap = page.locator("#compare-grid .candidate-district-map").first();
  await expect(firstMap).toHaveAttribute("data-map-code", "11620");

  await page.locator("#compare-a").selectOption("11530");
  await page.locator("#compare-run").click();

  await expect(firstMap).toHaveAttribute("data-map-code", "11530");
  await expect(firstMap.locator('.candidate-map-district.is-selected[data-code="11530"]')).toHaveCount(1);
  await expect(firstMap.locator(".candidate-map-meta strong")).toHaveText("구로구");
});
