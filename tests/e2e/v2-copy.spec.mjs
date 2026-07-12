import { expect, test } from "@playwright/test";

const v2Pages = [
  { name: "지도 홈", path: "/v2/index.html?district=11650" },
  { name: "매물 검토", path: "/v2/review.html?district=11650" },
  { name: "3분 진단", path: "/v2/assessment.html?district=11650" },
  { name: "후보 비교", path: "/v2/compare.html?a=11650&b=11530&c=11680" },
  { name: "구별 리포트", path: "/v2/districts.html?district=11650" },
];

const forbiddenUserCopy = [
  "서울 상가 리스크 인텔리전스",
  "운영 모드",
  "판단 모드",
  "설계 중인 근거",
  "스크리닝",
  "프로토타입",
  "페이로드",
  "리스크 payload",
  "decision artifact",
  "Professional Review Handoff",
  "Hold-first Output",
  "Hold Decision Memo",
  "Hold Signal Result",
  "Hold Signal Score",
  "Risk Signals",
  "Decision Cue",
  "Review Baseline",
  "Why Compare",
  "TXT export",
  "TXT 저장",
];

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test("V2 다섯 화면은 사용자 문구를 한국어 제품 용어로 통일한다", async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto("/index.html");
  await page.evaluate(() => window.localStorage.clear());

  for (const item of v2Pages) {
    await page.goto(item.path);
    await expect(page.locator(".v2-shell")).toBeVisible();

    if (item.name === "매물 검토") {
      await page.locator("#admin-dong-name").fill("서초동");
      await page.locator("#asking-price-total").fill("92000");
      await page.locator("#target-tenant").fill("카페");
      await page.locator("#asset-name").fill("문구 검수 매물");
      await page.getByRole("button", { name: "보류 메모 생성" }).click();
    }

    const snapshot = await page.evaluate(() => {
      const attributes = [...document.querySelectorAll("[aria-label], [aria-description], [title], [placeholder], meta[content]")]
        .flatMap((element) => ["aria-label", "aria-description", "title", "placeholder", "content"]
          .map((attribute) => element.getAttribute(attribute) || ""));
      return `${document.documentElement.textContent || ""}\n${attributes.join("\n")}`;
    });

    for (const term of forbiddenUserCopy) {
      expect(snapshot, `${item.name}에 내부·영문 표현이 남아 있음: ${term}`).not.toContain(term);
    }
    expect(snapshot).toContain("현재 작업");
    expect(snapshot).toContain("서울 상가 리스크 분석");
  }

  expect(runtimeErrors).toEqual([]);
});

test("V2 지도와 구별 리포트는 개발자용 표현을 사용자 안내로 바꾼다", async ({ page }) => {
  await page.goto("/v2/index.html?district=11650");
  await expect(page.getByText("추가 확인이 필요한 항목", { exact: true })).toBeVisible();
  await expect(page.locator("body")).toContainText("1차 검토 신호");
  await expect(page.locator("body")).toContainText("분석 시제품");

  await page.goto("/v2/districts.html?district=11650");
  await expect(page.locator("body")).toContainText("연결된 분석 데이터에서 확인되는 위험 점수만 표시합니다.");
  await expect(page.locator("body")).toContainText("자치구 분석 데이터를 불러오지 못했습니다.");
});

test("V2 복사와 텍스트 파일 저장 문구도 한국어로 정규화한다", async ({ page }) => {
  await page.goto("/v2/compare.html?a=11650&b=11530&c=11680");

  const source = [
    "Comparison Memo",
    "Professional review handoff checklist:",
    "- Check vacancy possibility",
    "Claim boundary:",
    "- This checklist is a pause-first decision artifact for re-checking, comparison baseline review, and professional review handoff.",
    "- It does not replace legal, tax, financial, brokerage, or on-site professional review.",
  ].join("\n");

  const normalized = await page.evaluate((text) => window.RedveilV2Copy.normalizeText(text), source);
  expect(normalized).toContain("비교 메모");
  expect(normalized).toContain("전문가 검토 준비 항목:");
  expect(normalized).toContain("공실 가능성 확인");
  expect(normalized).toContain("활용 범위:");
  expect(normalized).toContain("판단 기록");
  expect(normalized).not.toContain("Comparison Memo");
  expect(normalized).not.toContain("decision artifact");

  const blobText = await page.evaluate(async (text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    return blob.text();
  }, source);
  expect(blobText).toBe(normalized);
});
