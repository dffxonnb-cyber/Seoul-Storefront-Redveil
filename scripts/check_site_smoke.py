from __future__ import annotations

import json
import socket
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SERVER_SCRIPT = PROJECT_ROOT / "app" / "server.py"
PAYLOAD_PREFIX = "window.__REDVEIL_PAYLOAD__ = "
OLD_LOCAL_PATH_MARKERS = (
    "C:" + "\\Users\\a0109",
    "/Users/" + "a0109",
    "commercial_" + "investment_risk",
)


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def fetch_text(base_url: str, path: str, timeout: float = 5.0) -> str:
    request = Request(f"{base_url}{path}", headers={"User-Agent": "redveil-smoke-check"})
    with urlopen(request, timeout=timeout) as response:
        status = int(response.status)
        if status != 200:
            raise AssertionError(f"{path} returned HTTP {status}")
        return response.read().decode("utf-8")


def fetch_json(base_url: str, path: str) -> dict[str, Any]:
    return json.loads(fetch_text(base_url, path))


def post_json(base_url: str, path: str, body: dict[str, Any]) -> dict[str, Any]:
    encoded = json.dumps(body).encode("utf-8")
    request = Request(
        f"{base_url}{path}",
        data=encoded,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "redveil-smoke-check",
        },
        method="POST",
    )
    with urlopen(request, timeout=5.0) as response:
        status = int(response.status)
        if status != 200:
            raise AssertionError(f"{path} returned HTTP {status}")
        return json.loads(response.read().decode("utf-8"))


def wait_for_server(base_url: str, process: subprocess.Popen[bytes]) -> None:
    deadline = time.monotonic() + 30
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f"server exited early with code {process.returncode}")
        try:
            fetch_text(base_url, "/index.html", timeout=1.5)
            return
        except (ConnectionError, TimeoutError, URLError, AssertionError) as exc:
            last_error = exc
            time.sleep(0.25)
    raise TimeoutError(f"server did not become ready: {last_error}")


def assert_contains(text: str, needles: tuple[str, ...], label: str) -> None:
    missing = [needle for needle in needles if needle not in text]
    if missing:
        raise AssertionError(f"{label} is missing expected markers: {', '.join(missing)}")


def assert_no_old_paths(text: str, label: str) -> None:
    found = [marker for marker in OLD_LOCAL_PATH_MARKERS if marker in text]
    if found:
        raise AssertionError(f"{label} still contains local path markers: {', '.join(found)}")


def parse_site_payload(script_text: str) -> dict[str, Any]:
    stripped = script_text.lstrip("\ufeff")
    if not stripped.startswith(PAYLOAD_PREFIX):
        raise AssertionError("website_payload.js does not expose window.__REDVEIL_PAYLOAD__")
    json_text = stripped[len(PAYLOAD_PREFIX) :].strip()
    if json_text.endswith(";"):
        json_text = json_text[:-1]
    return json.loads(json_text)


def check_pages(base_url: str) -> None:
    expected_pages = {
        "/index.html": ("scenario-case-grid", "home.js", "website_payload.js"),
        "/review.html": ("review-example-list", "review.js", "website_payload.js"),
        "/assessment.html": ("assessment.js", "district-code", "assessment-result"),
        "/compare.html": ("compare.js", "compare-grid", "compare-run"),
        "/districts.html": ("districts.js", "district-list", "detail-score"),
    }
    for path, markers in expected_pages.items():
        text = fetch_text(base_url, path)
        assert_contains(text, markers, path)
        assert_no_old_paths(text, path)
    print(f"checked {len(expected_pages)} HTML pages")


def check_payload(base_url: str) -> None:
    payload_script = fetch_text(base_url, "/website_payload.js")
    assert_no_old_paths(payload_script, "/website_payload.js")
    payload = parse_site_payload(payload_script)

    review_examples = payload.get("reviewExamples")
    validation_cases = payload.get("validationCases")
    content_cases = payload.get("content", {}).get("validationCases")
    if not isinstance(review_examples, list) or len(review_examples) != 3:
        raise AssertionError("payload.reviewExamples must include exactly 3 fixed examples")
    if not isinstance(validation_cases, list) or len(validation_cases) != 3:
        raise AssertionError("payload.validationCases must include exactly 3 fixed cases")
    if not isinstance(content_cases, list) or len(content_cases) != 3:
        raise AssertionError("payload.content.validationCases must include exactly 3 cases")

    labels = {str(item.get("label", "")) for item in review_examples}
    required_labels = {"위험 후보", "애매 후보", "보수 검토 후보"}
    if labels != required_labels:
        raise AssertionError(f"unexpected review example labels: {sorted(labels)}")
    print("checked website payload examples")


def check_api(base_url: str) -> None:
    bootstrap = fetch_json(base_url, "/api/bootstrap")
    if len(bootstrap.get("districts", [])) != 25:
        raise AssertionError("/api/bootstrap must expose 25 districts")
    if len(bootstrap.get("topDistricts", [])) != 5:
        raise AssertionError("/api/bootstrap must expose 5 top districts")

    content = fetch_json(base_url, "/api/content")
    if len(content.get("validationCases", [])) != 3:
        raise AssertionError("/api/content must expose 3 validation cases")

    assessment = post_json(
        base_url,
        "/api/assessment",
        {
            "districtCode": "11650",
            "askingPricePerSqm": 2600,
            "holdingMonths": 36,
            "priority": "balanced",
        },
    )
    for key in ("districtName", "verdict", "customRiskScore", "riskArchetype", "recommendedAction"):
        if key not in assessment:
            raise AssertionError(f"/api/assessment response is missing {key}")
    print("checked API bootstrap/content/assessment")


def main() -> int:
    port = find_free_port()
    base_url = f"http://127.0.0.1:{port}"
    process = subprocess.Popen(
        [sys.executable, str(SERVER_SCRIPT), "--host", "127.0.0.1", "--port", str(port)],
        cwd=str(PROJECT_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )

    try:
        wait_for_server(base_url, process)
        check_pages(base_url)
        check_payload(base_url)
        check_api(base_url)
        print(f"Redveil site smoke check passed at {base_url}")
        return 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
        if process.returncode not in (0, None, -15, 1):
            stderr = process.stderr.read().decode("utf-8", errors="replace") if process.stderr else ""
            if stderr:
                print(stderr, file=sys.stderr)


if __name__ == "__main__":
    raise SystemExit(main())
