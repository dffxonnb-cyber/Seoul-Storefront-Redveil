import { expect, test } from "@playwright/test";

const pages = [
  { path: "/v2/index.html", view: "map", label: "지도 홈" },
  { path: "/v2/districts.html?district=11650", view: "districts", label: "구별 리포트" },
];

for (const item of pages) {
  test(`V2 ${item.label}은 공통 사이드바와 현재 화면 상태를 유지한다`, async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(item.path);

    await expect(page.locator("body")).toHaveAttribute("data-v2-view", item.view);
    await expect(page.locator('.v2-side-nav a[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator(`.v2-side-nav a[data-v2-nav="${item.view}"]`)).toHaveClass(/is-active/);
    await expect(page.locator(".v2-topbar-nav")).toHaveCount(0);
    await expect(page.locator('link[href*="redveil-v2-shell.css"]')).toHaveCount(1);
    await expect(page.locator('script[src*="redveil-v2-shell.js"]')).toHaveCount(1);
  });
}

test("V2 모바일 메뉴는 왼쪽 드로어로 열리고 닫힌다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/v2/index.html");

  const menuButton = page.locator("[data-v2-menu-open]");
  const sidebar = page.locator("#v2-sidebar");

  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("[data-v2-current-title]")).toHaveText("지도 홈");

  await menuButton.click();
  await expect(page.locator("body")).toHaveClass(/v2-nav-open/);
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator('.v2-side-nav a[data-v2-nav="map"]')).toHaveClass(/is-active/);

  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/v2-nav-open/);
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar).toHaveAttribute("aria-hidden", "true");

  const widths = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);
});
