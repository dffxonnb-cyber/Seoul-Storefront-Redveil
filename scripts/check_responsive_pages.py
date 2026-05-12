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


def responsive_script() -> str:
    return textwrap.dedent(
        r"""
        const { chromium } = require("playwright");

        const baseUrl = process.env.REDVEIL_BASE_URL;
        const chromePath = process.env.REDVEIL_CHROME_PATH;
        if (!baseUrl) throw new Error("REDVEIL_BASE_URL is required");
        if (!chromePath) throw new Error("REDVEIL_CHROME_PATH is required");

        const brokenTextPattern = /[\uFFFD]|\uC392\uC758|\uF98D|\u5A9B|\u5BC3|\u8E42|\u907A|\u63F4/;
        const viewports = [
          { label: "mobile", width: 390, height: 844 },
          { label: "tablet", width: 768, height: 1024 },
          { label: "desktop", width: 1440, height: 1100 },
        ];
        const pages = [
          { path: "/index.html", selector: ".hero-title" },
          { path: "/review.html", selector: "#review-form" },
          { path: "/assessment.html", selector: "#assessment-form" },
          { path: "/compare.html", selector: "#compare-run" },
          { path: "/districts.html", selector: "#district-list" },
        ];

        function assert(condition, message) {
          if (!condition) throw new Error(message);
        }

        (async () => {
          let browser;
          const consoleMessages = [];
          const pageErrors = [];
          const checks = [];

          try {
            browser = await chromium.launch({ headless: true, executablePath: chromePath });
            for (const viewport of viewports) {
              const context = await browser.newContext({
                viewport: { width: viewport.width, height: viewport.height },
                locale: "ko-KR",
              });
              await context.route(/https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)\//, (route) =>
                route.fulfill({ status: 200, contentType: "text/css", body: "" })
              );
              for (const item of pages) {
                const page = await context.newPage();
                page.on("console", (message) => {
                  if (["error", "warning"].includes(message.type())) {
                    consoleMessages.push(`${viewport.label} ${message.type()}: ${message.text()}`);
                  }
                });
                page.on("pageerror", (error) => pageErrors.push(`${viewport.label}: ${error.message}`));
                await page.goto(`${baseUrl}${item.path}`, { waitUntil: "commit", timeout: 15000 });
                await page.locator(item.selector).first().waitFor({ state: "visible", timeout: 5000 });
                const metrics = await page.evaluate(() => {
                  const visibleButtons = [...document.querySelectorAll("button, .button, .homepage-action-button")]
                    .filter((element) => {
                      const rect = element.getBoundingClientRect();
                      return rect.width > 0 && rect.height > 0;
                    })
                    .map((element) => {
                      const rect = element.getBoundingClientRect();
                      return {
                        text: element.textContent.trim().replace(/\s+/g, " ").slice(0, 80),
                        width: rect.width,
                        height: rect.height,
                        scrollWidth: element.scrollWidth,
                        clientWidth: element.clientWidth,
                      };
                    });
                  return {
                    viewportWidth: window.innerWidth,
                    documentWidth: document.documentElement.scrollWidth,
                    bodyWidth: document.body.scrollWidth,
                    bodyText: document.body.innerText,
                    crampedButtons: visibleButtons.filter((element) => element.scrollWidth > element.clientWidth + 3),
                  };
                });
                assert(
                  metrics.documentWidth <= metrics.viewportWidth + 4,
                  `${viewport.label} ${item.path} has horizontal overflow: ${metrics.documentWidth} > ${metrics.viewportWidth}`
                );
                assert(!brokenTextPattern.test(metrics.bodyText), `${viewport.label} ${item.path} has broken text markers`);
                assert(
                  metrics.crampedButtons.length === 0,
                  `${viewport.label} ${item.path} has cramped buttons: ${JSON.stringify(metrics.crampedButtons.slice(0, 3))}`
                );
                checks.push({
                  viewport: viewport.label,
                  path: item.path,
                  documentWidth: metrics.documentWidth,
                  viewportWidth: metrics.viewportWidth,
                });
                await page.close();
              }
              await context.close();
            }

            assert(consoleMessages.length === 0, `console warnings/errors: ${consoleMessages.join(" | ")}`);
            assert(pageErrors.length === 0, `page errors: ${pageErrors.join(" | ")}`);

            console.log(JSON.stringify({ checks, consoleMessages, pageErrors }, null, 2));
          } finally {
            if (browser) await browser.close();
          }
        })().catch((error) => {
          console.error(error?.stack || error);
          process.exitCode = 1;
        });
        """
    )


def run_responsive_check(base_url: str) -> None:
    node_path = find_node()
    chrome_path = find_chrome()
    module_dirs = playwright_module_dirs(node_path)

    with tempfile.TemporaryDirectory(prefix="redveil-responsive-") as temp_dir:
        script_path = Path(temp_dir) / "check_responsive_pages.cjs"
        script_path.write_text(responsive_script(), encoding="utf-8")
        env = os.environ.copy()
        env["NODE_PATH"] = os.pathsep.join(module_dirs)
        env["REDVEIL_BASE_URL"] = base_url
        env["REDVEIL_CHROME_PATH"] = str(chrome_path)
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
        run_responsive_check(base_url)
        print(f"Redveil responsive browser check passed at {base_url}")
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
