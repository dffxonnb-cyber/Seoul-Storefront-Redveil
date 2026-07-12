import { expect, test } from "@playwright/test";

test("V2 desktop home keeps the map, candidates, and workflow in a continuous reading column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/v2/index.html?district=11650");
  await page.waitForLoadState("networkidle");

  await expect(page.locator(".v2-map-panel")).toBeVisible();
  await expect(page.locator(".v2-candidate-panel")).toBeVisible();
  await expect(page.locator(".v2-workflow-panel")).toBeVisible();
  await expect(page.locator(".v2-side-stack")).toBeVisible();

  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        left: box.left,
        width: box.width,
        height: box.height,
      };
    };

    return {
      areas: getComputedStyle(document.querySelector(".v2-dashboard")).gridTemplateAreas,
      map: rect(".v2-map-panel"),
      candidates: rect(".v2-candidate-panel"),
      workflow: rect(".v2-workflow-panel"),
      side: rect(".v2-side-stack"),
      mapCanvasHeight: document.querySelector(".v2-map-canvas")?.getBoundingClientRect().height ?? 0,
    };
  });

  expect(layout.areas).toContain('"map side"');
  expect(layout.areas).toContain('"candidates side"');
  expect(layout.areas).toContain('"workflow side"');

  expect(layout.map).not.toBeNull();
  expect(layout.candidates).not.toBeNull();
  expect(layout.workflow).not.toBeNull();
  expect(layout.side).not.toBeNull();

  expect(Math.abs(layout.side.top - layout.map.top)).toBeLessThanOrEqual(2);
  expect(Math.abs(layout.candidates.left - layout.map.left)).toBeLessThanOrEqual(2);
  expect(Math.abs(layout.candidates.width - layout.map.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(layout.workflow.left - layout.map.left)).toBeLessThanOrEqual(2);
  expect(Math.abs(layout.workflow.width - layout.map.width)).toBeLessThanOrEqual(2);

  const mapToCandidatesGap = layout.candidates.top - layout.map.bottom;
  const candidatesToWorkflowGap = layout.workflow.top - layout.candidates.bottom;
  expect(mapToCandidatesGap).toBeGreaterThanOrEqual(10);
  expect(mapToCandidatesGap).toBeLessThanOrEqual(18);
  expect(candidatesToWorkflowGap).toBeGreaterThanOrEqual(10);
  expect(candidatesToWorkflowGap).toBeLessThanOrEqual(18);
  expect(layout.mapCanvasHeight).toBeGreaterThanOrEqual(615);
  expect(layout.mapCanvasHeight).toBeLessThanOrEqual(625);
});
