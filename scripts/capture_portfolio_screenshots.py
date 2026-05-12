from __future__ import annotations

import os
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path

from check_review_e2e import (
    PROJECT_ROOT,
    SERVER_SCRIPT,
    find_chrome,
    find_free_port,
    find_node,
    playwright_module_dirs,
    wait_for_server,
)


OUTPUT_DIR = PROJECT_ROOT / "docs" / "assets" / "portfolio"


def capture_script() -> str:
    return textwrap.dedent(
        r"""
        const fs = require("fs");
        const path = require("path");
        const { chromium } = require("playwright");

        const baseUrl = process.env.REDVEIL_BASE_URL;
        const chromePath = process.env.REDVEIL_CHROME_PATH;
        const outputDir = process.env.REDVEIL_SCREENSHOT_DIR;
        if (!baseUrl) throw new Error("REDVEIL_BASE_URL is required");
        if (!chromePath) throw new Error("REDVEIL_CHROME_PATH is required");
        if (!outputDir) throw new Error("REDVEIL_SCREENSHOT_DIR is required");

        function assert(condition, message) {
          if (!condition) throw new Error(message);
        }

        async function optionByText(page, selector, text, fallbackIndex = 0) {
          return page.evaluate(
            ({ selector, text, fallbackIndex }) => {
              const options = [...document.querySelector(selector).options];
              return options.find((item) => item.textContent.includes(text))?.value || options[fallbackIndex]?.value || "";
            },
            { selector, text, fallbackIndex }
          );
        }

        async function capture(page, filename, selector) {
          await page.locator(selector).first().waitFor({ state: "visible", timeout: 5000 });
          await page.screenshot({
            path: path.join(outputDir, filename),
            fullPage: false,
          });
        }

        (async () => {
          fs.mkdirSync(outputDir, { recursive: true });
          const browser = await chromium.launch({ headless: true, executablePath: chromePath });
          const context = await browser.newContext({
            viewport: { width: 1440, height: 1100 },
            locale: "ko-KR",
            deviceScaleFactor: 1,
          });
          const page = await context.newPage();

          await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle" });
          await capture(page, "01-home.png", ".homepage-hero");

          await page.goto(`${baseUrl}/review.html`, { waitUntil: "networkidle" });
          await page.evaluate(() => localStorage.clear());
          await page.reload({ waitUntil: "networkidle" });
          await page.locator("#review-example-list .review-example-button").first().click();
          await page.locator('#review-form button[type="submit"]').click();
          await page.locator("#review-result .review-result-memo").waitFor({ state: "visible", timeout: 5000 });
          await page.locator("#review-result").scrollIntoViewIfNeeded();
          await capture(page, "02-review-saved-result.png", "#review-result");

          await page.goto(`${baseUrl}/assessment.html`, { waitUntil: "networkidle" });
          const seochoCode = await optionByText(page, "#district-code", "서초구");
          assert(seochoCode, "No Seocho option on assessment page");
          await page.selectOption("#district-code", seochoCode);
          await page.fill("#asking-price", "2600");
          await page.fill("#holding-months", "24");
          await page.selectOption("#priority", "balanced");
          await page.locator('#assessment-form button[type="submit"]').click();
          await page.locator("#assessment-result .diagnosis-result-card").waitFor({ state: "visible", timeout: 5000 });
          await page.locator("#assessment-result").scrollIntoViewIfNeeded();
          await capture(page, "03-assessment-result.png", "#assessment-result");

          await page.goto(`${baseUrl}/compare.html`, { waitUntil: "networkidle" });
          await page.selectOption("#compare-a", await optionByText(page, "#compare-a", "서초구"));
          await page.selectOption("#compare-b", await optionByText(page, "#compare-b", "송파구", 1));
          await page.selectOption("#compare-c", await optionByText(page, "#compare-c", "구로구", 2));
          await page.locator("#compare-run").click();
          await page.locator("#compare-grid .compare-card").first().waitFor({ state: "visible", timeout: 5000 });
          await capture(page, "04-candidate-compare.png", "#compare-grid");

          await page.goto(`${baseUrl}/districts.html`, { waitUntil: "networkidle" });
          await page.fill("#district-search", "서초");
          await page.locator("#district-list button", { hasText: "서초구" }).first().click();
          await page.waitForFunction(() => document.querySelector("#detail-name")?.textContent?.includes("서초구"));
          await capture(page, "05-district-report.png", ".selected-district-card");

          await browser.close();
          console.log(
            JSON.stringify(
              {
                outputDir,
                files: [
                  "01-home.png",
                  "02-review-saved-result.png",
                  "03-assessment-result.png",
                  "04-candidate-compare.png",
                  "05-district-report.png",
                ],
              },
              null,
              2
            )
          );
        })().catch((error) => {
          console.error(error?.stack || error);
          process.exitCode = 1;
        });
        """
    )


def run_capture(base_url: str) -> None:
    node_path = find_node()
    chrome_path = find_chrome()
    module_dirs = playwright_module_dirs(node_path)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="redveil-portfolio-shots-") as temp_dir:
        script_path = Path(temp_dir) / "capture_portfolio_screenshots.cjs"
        script_path.write_text(capture_script(), encoding="utf-8")
        env = os.environ.copy()
        env["NODE_PATH"] = os.pathsep.join(module_dirs)
        env["REDVEIL_BASE_URL"] = base_url
        env["REDVEIL_CHROME_PATH"] = str(chrome_path)
        env["REDVEIL_SCREENSHOT_DIR"] = str(OUTPUT_DIR)
        result = subprocess.run(
            [str(node_path), str(script_path)],
            cwd=str(PROJECT_ROOT),
            env=env,
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            timeout=90,
        )
    if result.returncode != 0:
        if (result.stdout or "").strip():
            print(result.stdout.strip())
        if (result.stderr or "").strip():
            print(result.stderr.strip(), file=sys.stderr)
        raise SystemExit(result.returncode)
    print((result.stdout or "").strip())


def main() -> int:
    port = find_free_port()
    base_url = f"http://127.0.0.1:{port}"
    process = subprocess.Popen(
        [sys.executable, str(SERVER_SCRIPT), "--host", "127.0.0.1", "--port", str(port)],
        cwd=str(PROJECT_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        wait_for_server(base_url, process)
        run_capture(base_url)
        print(f"Redveil portfolio screenshots captured in {OUTPUT_DIR}")
        return 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)


if __name__ == "__main__":
    raise SystemExit(main())
