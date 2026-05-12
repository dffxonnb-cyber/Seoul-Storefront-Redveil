from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import tempfile
import textwrap
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SERVER_SCRIPT = PROJECT_ROOT / "app" / "server.py"


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def fetch(base_url: str, path: str, timeout: float = 3.0) -> str:
    request = Request(f"{base_url}{path}", headers={"User-Agent": "redveil-review-e2e"})
    with urlopen(request, timeout=timeout) as response:
        if int(response.status) != 200:
            raise AssertionError(f"{path} returned HTTP {response.status}")
        return response.read().decode("utf-8")


def wait_for_server(base_url: str, process: subprocess.Popen[bytes]) -> None:
    deadline = time.monotonic() + 30
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f"server exited early with code {process.returncode}")
        try:
            fetch(base_url, "/review.html", timeout=1.5)
            return
        except (ConnectionError, TimeoutError, URLError, AssertionError) as exc:
            last_error = exc
            time.sleep(0.25)
    raise TimeoutError(f"server did not become ready: {last_error}")


def existing_path(value: str | Path | None) -> Path | None:
    if not value:
        return None
    path = Path(value)
    return path if path.exists() else None


def find_node() -> Path:
    candidates = [
        existing_path(os.environ.get("NODE")),
        existing_path(shutil.which("node")),
        Path.home() / ".cache" / "codex-runtimes" / "codex-primary-runtime" / "dependencies" / "node" / "bin" / "node.exe",
        Path.home() / ".cache" / "codex-runtimes" / "codex-primary-runtime" / "dependencies" / "node" / "bin" / "node",
    ]
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate
    raise RuntimeError("Node.js was not found. Install Node.js or set NODE to the executable path.")


def find_chrome() -> Path:
    candidates = [
        existing_path(os.environ.get("CHROME_PATH")),
        existing_path(os.environ.get("PLAYWRIGHT_CHROME_PATH")),
        existing_path(shutil.which("google-chrome")),
        existing_path(shutil.which("chrome")),
        existing_path(shutil.which("chromium")),
        existing_path(shutil.which("chromium-browser")),
        existing_path(shutil.which("msedge")),
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files/Microsoft/Edge/Application/msedge.exe"),
        Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
        Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
        Path("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
        Path("/usr/bin/google-chrome"),
        Path("/usr/bin/chromium"),
        Path("/usr/bin/chromium-browser"),
    ]
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate
    raise RuntimeError("Chrome/Edge was not found. Install Chrome or set CHROME_PATH.")


def playwright_module_dirs(node_path: Path) -> list[str]:
    raw_dirs: list[str] = []
    for env_name in ("PLAYWRIGHT_NODE_MODULES", "NODE_PATH"):
        value = os.environ.get(env_name)
        if value:
            raw_dirs.extend(value.split(os.pathsep))

    candidates = [
        PROJECT_ROOT / "node_modules",
        node_path.parent.parent / "node_modules",
        Path.home() / ".cache" / "codex-runtimes" / "codex-primary-runtime" / "dependencies" / "node" / "node_modules",
        *[Path(item) for item in raw_dirs if item],
    ]

    module_dirs: list[str] = []
    for candidate in candidates:
        if (candidate / "playwright").exists():
            module_dirs.append(str(candidate))
    if module_dirs:
        return list(dict.fromkeys(module_dirs))
    raise RuntimeError(
        "Playwright was not found. Run `npm install playwright` in the project, "
        "or set PLAYWRIGHT_NODE_MODULES/NODE_PATH to a node_modules directory that contains Playwright."
    )


def e2e_script() -> str:
    return textwrap.dedent(
        r"""
        const { chromium } = require("playwright");

        const baseUrl = process.env.REDVEIL_BASE_URL;
        const chromePath = process.env.REDVEIL_CHROME_PATH;
        if (!baseUrl) throw new Error("REDVEIL_BASE_URL is required");
        if (!chromePath) throw new Error("REDVEIL_CHROME_PATH is required");

        function assert(condition, message) {
          if (!condition) throw new Error(message);
        }

        (async () => {
          const brokenTextPattern = /[\uFFFD]|\uC392\uC758|\uF98D|\u5A9B|\u5BC3|\u8E42|\u907A|\u63F4/;
          const browser = await chromium.launch({ headless: true, executablePath: chromePath });
          const context = await browser.newContext({
            viewport: { width: 1440, height: 1100 },
            locale: "ko-KR",
          });
          const page = await context.newPage();
          const consoleMessages = [];
          const pageErrors = [];

          page.on("console", (message) => {
            if (["error", "warning"].includes(message.type())) {
              consoleMessages.push(`${message.type()}: ${message.text()}`);
            }
          });
          page.on("pageerror", (error) => pageErrors.push(error.message));

          async function bodyTextHasBrokenMarkers() {
            const bodyText = await page.locator("body").innerText({ timeout: 5000 });
            return brokenTextPattern.test(bodyText);
          }

          await page.goto(`${baseUrl}/review.html`, { waitUntil: "networkidle" });
          await page.evaluate(() => localStorage.clear());
          await page.reload({ waitUntil: "networkidle" });

          await page.locator("#review-example-list .review-example-button").first().click();
          const formState = await page.evaluate(() => ({
            districtCode: document.querySelector("#review-district-code")?.value || "",
            adminDongName: document.querySelector("#admin-dong-name")?.value || "",
            askingPriceTotal: document.querySelector("#asking-price-total")?.value || "",
            targetTenant: document.querySelector("#target-tenant")?.value || "",
            assetName: document.querySelector("#asset-name")?.value || "",
            area: document.querySelector("#exclusive-area")?.value || "",
            priority: document.querySelector("#review-priority")?.value || "",
          }));
          assert(formState.districtCode, "example did not fill district");
          assert(formState.adminDongName, "example did not fill admin dong");
          assert(Number(formState.askingPriceTotal) > 0, "example did not fill asking price");
          assert(formState.targetTenant, "example did not fill target tenant");
          assert(formState.assetName, "example did not fill asset name");

          await page.locator('#review-form button[type="submit"]').click();
          await page.locator("#review-result .review-result-memo").waitFor({ state: "visible", timeout: 5000 });
          await page.locator("#review-history .review-entry").first().waitFor({ state: "visible", timeout: 5000 });

          const firstResult = await page.evaluate(() => {
            const reviews = JSON.parse(localStorage.getItem("redveil-reviews") || "[]");
            const first = reviews[0] || null;
            return {
              reviewCount: reviews.length,
              first,
              countText: document.querySelector("#review-count")?.textContent?.trim() || "",
              resultText: document.querySelector("#review-result")?.innerText || "",
              historyText: document.querySelector("#review-history")?.innerText || "",
            };
          });
          assert(firstResult.reviewCount === 1, `expected one saved review, got ${firstResult.reviewCount}`);
          assert(firstResult.first?.assetName, "saved review has no assetName");
          assert(Number(firstResult.first?.customRiskScore) > 0, "saved review has no custom risk score");
          assert(firstResult.countText.includes("1"), "review count did not update");
          assert(firstResult.resultText.includes(firstResult.first.assetName), "result card does not include saved asset");
          assert(firstResult.historyText.includes(firstResult.first.assetName), "history does not include saved asset");

          await page.locator("[data-review-id]").first().click();
          await page.locator("#review-result .review-result-memo").waitFor({ state: "visible", timeout: 5000 });
          const replayText = await page.locator("#review-result").innerText({ timeout: 5000 });
          assert(replayText.includes(firstResult.first.assetName), "history replay did not restore saved result");

          await page.reload({ waitUntil: "networkidle" });
          await page.locator("#review-history .review-entry").first().waitFor({ state: "visible", timeout: 5000 });
          const persisted = await page.evaluate(() => {
            const reviews = JSON.parse(localStorage.getItem("redveil-reviews") || "[]");
            return {
              reviewCount: reviews.length,
              firstAssetName: reviews[0]?.assetName || "",
              historyText: document.querySelector("#review-history")?.innerText || "",
            };
          });
          assert(persisted.reviewCount === 1, "saved review did not persist after reload");
          assert(persisted.historyText.includes(persisted.firstAssetName), "persisted review is not visible after reload");
          assert(!(await bodyTextHasBrokenMarkers()), "review flow rendered broken text markers");
          assert(consoleMessages.length === 0, `console warnings/errors: ${consoleMessages.join(" | ")}`);
          assert(pageErrors.length === 0, `page errors: ${pageErrors.join(" | ")}`);

          await browser.close();
          console.log(
            JSON.stringify(
              {
                savedReview: {
                  assetName: firstResult.first.assetName,
                  districtName: firstResult.first.districtName,
                  verdict: firstResult.first.verdict,
                  customRiskScore: firstResult.first.customRiskScore,
                },
                formState,
                persistedReviewCount: persisted.reviewCount,
                consoleMessages,
                pageErrors,
              },
              null,
              2
            )
          );
        })().catch(async (error) => {
          console.error(error?.stack || error);
          process.exitCode = 1;
        });
        """
    )


def run_browser_e2e(base_url: str) -> None:
    node_path = find_node()
    chrome_path = find_chrome()
    module_dirs = playwright_module_dirs(node_path)

    with tempfile.TemporaryDirectory(prefix="redveil-review-e2e-") as temp_dir:
        script_path = Path(temp_dir) / "check_review_e2e.cjs"
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
        print(f"Redveil review browser E2E passed at {base_url}")
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
