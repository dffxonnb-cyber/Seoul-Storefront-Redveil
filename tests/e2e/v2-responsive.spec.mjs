import { expect, test } from "@playwright/test";

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
];

const pages = [
  { view: "map", path: "/v2/index.html?district=11530", main: "#redveil-v2-main" },
  { view: "review", path: "/v2/review.html?district=11530", main: "#v2-review-main" },
  { view: "assessment", path: "/v2/assessment.html?district=11530", main: "#v2-assessment-main" },
  { view: "compare", path: "/v2/compare.html?a=11530&b=11680&c=11140", main: "#v2-compare-main" },
  { view: "districts", path: "/v2/districts.html?district=11530", main: "#v2-district-report-main" },
];

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

for (const viewport of viewports) {
  test(`V2 전체 화면은 ${viewport.width}px 뷰포트에서 잘림 없이 동작한다`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    const runtimeErrors = watchRuntimeErrors(page);

    for (const pageCase of pages) {
      await page.goto(pageCase.path);

      await expect(page.locator("#redveil-v2-responsive")).toHaveCount(1);
      await expect(page.locator("#redveil-v2-feature-responsive")).toHaveCount(1);
      await expect.poll(async () =>
        page.evaluate(() => {
          const responsive = document.getElementById("redveil-v2-responsive");
          const feature = document.getElementById("redveil-v2-feature-responsive");
          return Boolean(responsive?.sheet && feature?.sheet);
        })
      ).toBe(true);

      await expect(page.locator("body")).toHaveAttribute("data-v2-view", pageCase.view);
      await expect(page.locator(pageCase.main)).toBeVisible();
      await expect(page.locator(".v2-mobile-bar")).toBeVisible();
      await expect(page.locator("#v2-sidebar")).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator(`[data-v2-nav="${pageCase.view}"]`)).toHaveAttribute("aria-current", "page");

      const layout = await page.evaluate((mainSelector) => {
        const viewportWidth = window.innerWidth;
        const main = document.querySelector(mainSelector);
        const mainRect = main?.getBoundingClientRect();
        const candidates = main
          ? [...main.querySelectorAll("section, article, form, fieldset")]
          : [];
        const offenders = candidates
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0;
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              className: element.className || element.id || element.tagName,
              left: rect.left,
              right: rect.right,
            };
          })
          .filter((item) => item.left < -1 || item.right > viewportWidth + 1);

        const shortControls = [...document.querySelectorAll(
          `${mainSelector} button, ${mainSelector} input, ${mainSelector} select, ${mainSelector} textarea, ${mainSelector} a.v2-button, ${mainSelector} a.button, .v2-mobile-bar button`
        )]
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
          })
          .map((element) => ({
            label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 40) || element.id || element.tagName,
            height: element.getBoundingClientRect().height,
          }))
          .filter((item) => item.height < 43.5);

        const smallInputFonts = [...document.querySelectorAll(`${mainSelector} input, ${mainSelector} select, ${mainSelector} textarea`)]
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && rect.width > 0;
          })
          .map((element) => ({ id: element.id || element.tagName, size: Number.parseFloat(getComputedStyle(element).fontSize) }))
          .filter((item) => item.size < 15.9);

        const navigationHrefs = [...document.querySelectorAll("[data-v2-nav]")].map((link) => link.getAttribute("href") || "");

        return {
          viewportWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          mainRect: mainRect ? { left: mainRect.left, right: mainRect.right, width: mainRect.width } : null,
          offenders,
          shortControls,
          smallInputFonts,
          navigationHrefs,
        };
      }, pageCase.main);

      expect(layout.documentWidth, `${pageCase.view} document overflow at ${viewport.width}px`).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(layout.bodyWidth, `${pageCase.view} body overflow at ${viewport.width}px`).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(layout.mainRect, `${pageCase.view} main should render`).not.toBeNull();
      expect(layout.mainRect.left, `${pageCase.view} main escapes left`).toBeGreaterThanOrEqual(-1);
      expect(layout.mainRect.right, `${pageCase.view} main escapes right`).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(layout.offenders, `${pageCase.view} content overflow at ${viewport.width}px`).toEqual([]);
      expect(layout.shortControls, `${pageCase.view} touch targets at ${viewport.width}px`).toEqual([]);
      expect(layout.smallInputFonts, `${pageCase.view} form font size at ${viewport.width}px`).toEqual([]);
      expect(layout.navigationHrefs.some((href) => href.includes("../review.html"))).toBe(false);
      expect(layout.navigationHrefs.some((href) => href.includes("../assessment.html"))).toBe(false);
      expect(layout.navigationHrefs.some((href) => href.includes("../compare.html"))).toBe(false);

      await page.locator("[data-v2-menu-open]").click();
      await expect(page.locator("body")).toHaveClass(/v2-nav-open/);
      await expect(page.locator("#v2-sidebar")).toHaveAttribute("aria-hidden", "false");
      const sidebarBox = await page.locator("#v2-sidebar").boundingBox();
      expect(sidebarBox, `${pageCase.view} drawer should render`).not.toBeNull();
      expect(sidebarBox.x).toBeGreaterThanOrEqual(-1);
      expect(sidebarBox.x + sidebarBox.width).toBeLessThanOrEqual(viewport.width + 1);
      await page.locator("[data-v2-menu-close]").click();
      await expect(page.locator("body")).not.toHaveClass(/v2-nav-open/);
    }

    expect(runtimeErrors).toEqual([]);
  });
}
