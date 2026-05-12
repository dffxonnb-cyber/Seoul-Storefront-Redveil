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


def e2e_script() -> str:
    return textwrap.dedent(
        r"""
        const { chromium } = require("playwright");

        const baseUrl = process.env.REDVEIL_BASE_URL;
        const chromePath = process.env.REDVEIL_CHROME_PATH;
        if (!baseUrl) throw new Error("REDVEIL_BASE_URL is required");
        if (!chromePath) throw new Error("REDVEIL_CHROME_PATH is required");

        const brokenTextPattern = /[\uFFFD]|\uC392\uC758|\uF98D|\u5A9B|\u5BC3|\u8E42|\u907A|\u63F4/;
        const verdictPattern = /(매입 보류|강한 비교 필요|보수 검토|추가 검토 가능)/;

        function assert(condition, message) {
          if (!condition) throw new Error(message);
        }

        (async () => {
          const browser = await chromium.launch({ headless: true, executablePath: chromePath });
          const context = await browser.newContext({
            viewport: { width: 1440, height: 1100 },
            locale: "ko-KR",
          });
          const page = await context.newPage();
          const consoleMessages = [];
          const pageErrors = [];
          const flowResults = {};

          page.on("console", (message) => {
            if (["error", "warning"].includes(message.type())) {
              consoleMessages.push(`${message.type()}: ${message.text()}`);
            }
          });
          page.on("pageerror", (error) => pageErrors.push(error.message));

          async function assertCleanBody(label) {
            const bodyText = await page.locator("body").innerText({ timeout: 5000 });
            assert(!brokenTextPattern.test(bodyText), `${label} rendered broken text markers`);
          }

          async function optionByText(selector, text, fallbackIndex = 0) {
            return page.evaluate(
              ({ selector, text, fallbackIndex }) => {
                const options = [...document.querySelector(selector).options];
                return options.find((item) => item.textContent.includes(text))?.value || options[fallbackIndex]?.value || "";
              },
              { selector, text, fallbackIndex }
            );
          }

          await page.goto(`${baseUrl}/assessment.html`, { waitUntil: "networkidle" });
          const seochoCode = await optionByText("#district-code", "서초구");
          assert(seochoCode, "assessment page has no Seocho option");
          await page.selectOption("#district-code", seochoCode);
          await page.fill("#asking-price", "2600");
          await page.fill("#holding-months", "24");
          await page.selectOption("#priority", "balanced");
          await page.locator('#assessment-form button[type="submit"]').click();
          await page.locator("#assessment-result .diagnosis-result-card").waitFor({ state: "visible", timeout: 5000 });
          const assessmentText = await page.locator("#assessment-result").innerText({ timeout: 5000 });
          assert(assessmentText.includes("서초구"), "assessment result does not include selected district");
          assert(verdictPattern.test(assessmentText), "assessment result does not include a verdict");
          flowResults.assessment = {
            district: "서초구",
            result: assessmentText.split("\n").slice(0, 4).join(" | "),
          };
          await assertCleanBody("assessment");

          await page.goto(`${baseUrl}/compare.html`, { waitUntil: "networkidle" });
          const compareCodes = {
            a: await optionByText("#compare-a", "서초구"),
            b: await optionByText("#compare-b", "송파구", 1),
            c: await optionByText("#compare-c", "구로구", 2),
          };
          assert(compareCodes.a && compareCodes.b && compareCodes.c, "compare page could not select three districts");
          await page.selectOption("#compare-a", compareCodes.a);
          await page.selectOption("#compare-b", compareCodes.b);
          await page.selectOption("#compare-c", compareCodes.c);
          await page.locator("#compare-run").click();
          await page.locator("#compare-grid .compare-card").first().waitFor({ state: "visible", timeout: 5000 });
          await page.locator("#compare-recommendation").waitFor({ state: "visible", timeout: 5000 });
          const compareState = await page.evaluate(() => ({
            cardCount: document.querySelectorAll("#compare-grid .compare-card").length,
            metricCount: document.querySelectorAll("#compare-metrics .metric-compare-card").length,
            recommendationText: document.querySelector("#compare-recommendation")?.innerText || "",
            memoText: document.querySelector("#compare-memo")?.innerText || "",
          }));
          assert(compareState.cardCount >= 2, "compare flow rendered fewer than two cards");
          assert(compareState.metricCount >= 3, "compare flow rendered too few metric cards");
          assert(compareState.recommendationText.length > 20, "compare recommendation is empty");
          assert(compareState.memoText.length > 20, "compare memo is empty");
          flowResults.compare = compareState;
          await assertCleanBody("compare");

          await page.goto(`${baseUrl}/districts.html`, { waitUntil: "networkidle" });
          await page.fill("#district-search", "서초");
          await page.locator("#district-list button", { hasText: "서초구" }).first().click();
          await page.waitForFunction(() => document.querySelector("#detail-name")?.textContent?.includes("서초구"));
          const districtState = await page.evaluate(() => ({
            name: document.querySelector("#detail-name")?.textContent?.trim() || "",
            score: document.querySelector("#detail-score")?.textContent?.trim() || "",
            metricCount: document.querySelectorAll("#detail-metrics > *").length,
            replacementCount: document.querySelectorAll("#replacement-candidates > *").length,
            checklistCount: document.querySelectorAll("#detail-checks > *").length,
          }));
          assert(districtState.name === "서초구", "district flow did not select Seocho");
          assert(/\d/.test(districtState.score), "district detail score is missing");
          assert(districtState.metricCount >= 3, "district metrics are missing");
          assert(districtState.checklistCount >= 1, "district checklist is missing");
          flowResults.districts = districtState;
          await assertCleanBody("districts");

          assert(consoleMessages.length === 0, `console warnings/errors: ${consoleMessages.join(" | ")}`);
          assert(pageErrors.length === 0, `page errors: ${pageErrors.join(" | ")}`);

          await browser.close();
          console.log(JSON.stringify({ flowResults, consoleMessages, pageErrors }, null, 2));
        })().catch((error) => {
          console.error(error?.stack || error);
          process.exitCode = 1;
        });
        """
    )


def run_browser_e2e(base_url: str) -> None:
    node_path = find_node()
    chrome_path = find_chrome()
    module_dirs = playwright_module_dirs(node_path)

    with tempfile.TemporaryDirectory(prefix="redveil-service-flows-e2e-") as temp_dir:
        script_path = Path(temp_dir) / "check_service_flows_e2e.cjs"
        script_path.write_text(e2e_script(), encoding="utf-8")
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
            timeout=60,
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
        run_browser_e2e(base_url)
        print(f"Redveil service flows browser E2E passed at {base_url}")
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
