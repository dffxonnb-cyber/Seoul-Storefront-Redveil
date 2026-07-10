from __future__ import annotations

import argparse
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = PROJECT_ROOT / "app" / "site"
GEOJSON_PATH = SITE_ROOT / "assets" / "seoul-districts.geojson"
FORM_STYLESHEET = '<link rel="stylesheet" href="./forms.css?v=20260710" />'
REVIEW_HERO_STYLESHEET = '<link rel="stylesheet" href="./review-hero.css?v=20260710" />'
HTML_PATHS = (
    SITE_ROOT / "index.html",
    SITE_ROOT / "review.html",
    SITE_ROOT / "assessment.html",
    SITE_ROOT / "compare.html",
    SITE_ROOT / "districts.html",
)

CANONICAL_DISTRICT_CODES = {
    "종로구": "11110",
    "중구": "11140",
    "용산구": "11170",
    "성동구": "11200",
    "광진구": "11215",
    "동대문구": "11230",
    "중랑구": "11260",
    "성북구": "11290",
    "강북구": "11305",
    "도봉구": "11320",
    "노원구": "11350",
    "은평구": "11380",
    "서대문구": "11410",
    "마포구": "11440",
    "양천구": "11470",
    "강서구": "11500",
    "구로구": "11530",
    "금천구": "11545",
    "영등포구": "11560",
    "동작구": "11590",
    "관악구": "11620",
    "서초구": "11650",
    "강남구": "11680",
    "송파구": "11710",
    "강동구": "11740",
}


def normalized_geojson() -> tuple[dict[str, object], list[str]]:
    payload = json.loads(GEOJSON_PATH.read_text(encoding="utf-8-sig"))
    features = payload.get("features")
    if not isinstance(features, list):
        raise ValueError("GeoJSON features must be a list")

    changes: list[str] = []
    seen_names: set[str] = set()
    seen_codes: set[str] = set()

    for feature in features:
        if not isinstance(feature, dict):
            raise ValueError("Every GeoJSON feature must be an object")
        properties = feature.get("properties")
        if not isinstance(properties, dict):
            raise ValueError("Every GeoJSON feature must have properties")

        name = str(properties.get("name") or "").strip()
        expected_code = CANONICAL_DISTRICT_CODES.get(name)
        if not expected_code:
            raise ValueError(f"Unknown Seoul district in GeoJSON: {name!r}")
        if name in seen_names:
            raise ValueError(f"Duplicate Seoul district name in GeoJSON: {name}")
        if expected_code in seen_codes:
            raise ValueError(f"Duplicate canonical district code in GeoJSON: {expected_code}")

        previous_code = str(properties.get("code") or "")
        if previous_code != expected_code:
            changes.append(f"{name}: {previous_code or '-'} -> {expected_code}")
            properties["code"] = expected_code

        seen_names.add(name)
        seen_codes.add(expected_code)

    expected_names = set(CANONICAL_DISTRICT_CODES)
    if seen_names != expected_names:
        missing = sorted(expected_names - seen_names)
        extra = sorted(seen_names - expected_names)
        raise ValueError(f"GeoJSON district coverage mismatch. missing={missing}, extra={extra}")

    return payload, changes


def inject_stylesheet(path: Path, stylesheet: str, *, write: bool) -> bool:
    text = path.read_text(encoding="utf-8-sig")
    if stylesheet in text:
        return False

    marker = "</head>"
    if marker not in text:
        raise ValueError(f"Missing </head> in {path.relative_to(PROJECT_ROOT)}")

    updated = text.replace(marker, f"    {stylesheet}\n  {marker}", 1)
    if write:
        path.write_text(updated, encoding="utf-8")
    return True


def prepare(*, write: bool) -> list[str]:
    messages: list[str] = []
    payload, geojson_changes = normalized_geojson()

    if geojson_changes:
        messages.extend(f"geojson {change}" for change in geojson_changes)
        if write:
            GEOJSON_PATH.write_text(
                json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )

    for html_path in HTML_PATHS:
        if inject_stylesheet(html_path, FORM_STYLESHEET, write=write):
            messages.append(f"html add forms.css: {html_path.relative_to(PROJECT_ROOT)}")

    review_path = SITE_ROOT / "review.html"
    if inject_stylesheet(review_path, REVIEW_HERO_STYLESHEET, write=write):
        messages.append(f"html add review-hero.css: {review_path.relative_to(PROJECT_ROOT)}")

    return messages


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare Redveil static frontend assets for verification and deployment.")
    parser.add_argument("--check", action="store_true", help="Fail when the checked-out frontend still needs preparation.")
    args = parser.parse_args()

    changes = prepare(write=not args.check)
    if args.check and changes:
        print("Frontend assets are not prepared:")
        for change in changes:
            print(f"- {change}")
        return 1

    if changes:
        print(f"Prepared {len(changes)} frontend asset changes")
        for change in changes:
            print(f"- {change}")
    else:
        print("Frontend assets already prepared")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
