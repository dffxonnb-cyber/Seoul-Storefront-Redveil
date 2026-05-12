from __future__ import annotations

import json
import os
from dataclasses import dataclass
from urllib.request import Request, urlopen


DEFAULT_PUBLIC_URL = "https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/"
PAYLOAD_PREFIX = "window.__REDVEIL_PAYLOAD__ = "
OLD_LOCAL_PATH_MARKERS = (
    "C:" + "\\Users\\a0109",
    "/Users/" + "a0109",
    "commercial_" + "investment_risk",
)


@dataclass(frozen=True)
class PublicPage:
    path: str
    markers: tuple[str, ...]


PAGES = (
    PublicPage("index.html", ("Redveil", "website_payload.js", "home.js")),
    PublicPage("review.html", ("Redveil", "review-form", "review.js")),
    PublicPage("assessment.html", ("Redveil", "assessment-form", "assessment.js")),
    PublicPage("compare.html", ("Redveil", "compare-run", "compare.js")),
    PublicPage("districts.html", ("Redveil", "district-list", "districts.js")),
)

LATEST_LOCAL_MARKERS = {
    "index.html": ("scenario-case-grid",),
    "review.html": ("review-example-list",),
}


def public_base_url() -> str:
    raw = os.environ.get("REDVEIL_PUBLIC_URL", DEFAULT_PUBLIC_URL).strip()
    return raw if raw.endswith("/") else f"{raw}/"


def fetch_text(url: str, timeout: float = 15.0) -> str:
    request = Request(url, headers={"User-Agent": "redveil-public-site-check"})
    with urlopen(request, timeout=timeout) as response:
        status = int(response.status)
        if status != 200:
            raise AssertionError(f"{url} returned HTTP {status}")
        return response.read().decode("utf-8")


def assert_no_old_paths(text: str, label: str) -> None:
    found = [marker for marker in OLD_LOCAL_PATH_MARKERS if marker in text]
    if found:
        raise AssertionError(f"{label} still contains local path markers: {', '.join(found)}")


def parse_payload(script_text: str) -> dict[str, object]:
    stripped = script_text.lstrip("\ufeff").strip()
    if not stripped.startswith(PAYLOAD_PREFIX):
        raise AssertionError("website_payload.js does not expose window.__REDVEIL_PAYLOAD__")
    json_text = stripped[len(PAYLOAD_PREFIX) :].strip()
    if json_text.endswith(";"):
        json_text = json_text[:-1]
    return json.loads(json_text)


def main() -> int:
    base_url = public_base_url()
    checked_pages: list[str] = []
    warnings: list[str] = []

    for page in PAGES:
        url = f"{base_url}{page.path}"
        text = fetch_text(url)
        missing = [marker for marker in page.markers if marker not in text]
        if missing:
            raise AssertionError(f"{url} is missing expected markers: {', '.join(missing)}")
        optional_missing = [
            marker for marker in LATEST_LOCAL_MARKERS.get(page.path, ()) if marker not in text
        ]
        if optional_missing:
            warnings.append(
                f"{page.path} is reachable but appears older than the latest local build: missing {', '.join(optional_missing)}"
            )
        assert_no_old_paths(text, url)
        checked_pages.append(page.path)

    payload_script = fetch_text(f"{base_url}website_payload.js")
    assert_no_old_paths(payload_script, f"{base_url}website_payload.js")
    payload = parse_payload(payload_script)

    review_examples = payload.get("reviewExamples")
    validation_cases = payload.get("validationCases")
    content_cases = payload.get("content", {}).get("validationCases") if isinstance(payload.get("content"), dict) else None
    deployed_has_current_examples = (
        isinstance(review_examples, list)
        and len(review_examples) == 3
        and isinstance(validation_cases, list)
        and len(validation_cases) == 3
        and isinstance(content_cases, list)
        and len(content_cases) == 3
    )
    if not deployed_has_current_examples:
        warnings.append(
            "public payload is reachable but does not yet expose the latest 3 fixed validation/review examples"
        )

    summary = {
        "baseUrl": base_url,
        "checkedPages": checked_pages,
        "districtCount": len(payload.get("districts", [])) if isinstance(payload.get("districts"), list) else 0,
        "hasCurrentFixedExamples": deployed_has_current_examples,
        "warnings": warnings,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"Redveil public site check passed for {base_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
