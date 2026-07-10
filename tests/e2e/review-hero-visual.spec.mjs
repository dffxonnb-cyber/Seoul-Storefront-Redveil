import { expect, test } from "@playwright/test";

const reviewFixtures = [
  {
    id: "visual-review-1",
    createdAt: "2026-07-10T07:00:00.000Z",
    assetName: "검증용 매물 A",
    districtCode: "11530",
    districtName: "구로구",
    adminDongName: "구로동",
    targetTenant: "카페",
    customRiskScore: 72,
    verdict: "매입 보류",
    riskArchetype: "가격 부담형",
    summary: "브라우저 시각 검증을 위한 저장 검토입니다.",
  },
  {
    id: "visual-review-2",
    createdAt: "2026-07-10T06:00:00.000Z",
    assetName: "검증용 매물 B",
    districtCode: "11680",
    districtName: "강남구",
    adminDongName: "역삼동",
    targetTenant: "근린생활",
    customRiskScore: 68,
    verdict: "강한 비교 필요",
    riskArchetype: "고가 선행형",
    summary: "카드 숫자와 레이아웃을 함께 검증합니다.",
  },
];

test("review hero renders three aligned minimal status cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((reviews) => {
    localStorage.setItem("redveil-reviews", JSON.stringify(reviews));
  }, reviewFixtures);

  await page.goto("/review.html");

  const hero = page.locator(".review-subhero");
  const cards = page.locator(".review-status-card");
  await expect(hero).toBeVisible();
  await expect(cards).toHaveCount(3);
  await expect(page.locator("#review-count")).toHaveText("2건");
  await expect(cards.nth(0).locator(".compact-note")).toHaveText("Local archive");
  await expect(cards.nth(1).locator(".compact-note")).toHaveText("보류 판단 우선");
  await expect(cards.nth(2).locator(".compact-note")).toHaveText("구별 리스크 기준");

  const boxes = await cards.evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })
  );

  expect(Math.max(...boxes.map((box) => box.y)) - Math.min(...boxes.map((box) => box.y))).toBeLessThan(2);
  expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width);
  expect(boxes[2].x).toBeGreaterThan(boxes[1].x + boxes[1].width);
  expect(Math.min(...boxes.map((box) => box.width))).toBeGreaterThan(180);
  expect(Math.min(...boxes.map((box) => box.height))).toBeGreaterThanOrEqual(145);
  expect(Math.max(...boxes.map((box) => box.height))).toBeLessThanOrEqual(175);
  expect(Math.max(...boxes.map((box) => box.height)) - Math.min(...boxes.map((box) => box.height))).toBeLessThan(2);

  const overflow = await cards.evaluateAll((items) =>
    items.flatMap((item) =>
      Array.from(item.querySelectorAll(".card-label, strong, .compact-note")).map((element) => ({
        text: element.textContent,
        horizontal: element.scrollWidth - element.clientWidth,
        vertical: element.scrollHeight - element.clientHeight,
      }))
    )
  );
  expect(overflow.every((item) => item.horizontal <= 1 && item.vertical <= 1)).toBeTruthy();

  await hero.screenshot({ path: "test-results/review-hero-redesign.png" });
});
