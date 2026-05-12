from __future__ import annotations

import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PREFIX = "window.__REDVEIL_PAYLOAD__ = "


def read_payload() -> dict[str, object]:
    js_path = PROJECT_ROOT / "app" / "site" / "website_payload.js"
    text = js_path.read_text(encoding="utf-8-sig").strip()
    if not text.startswith(SNAPSHOT_PREFIX):
        raise ValueError(f"Unexpected payload prefix in {js_path}")
    raw = text[len(SNAPSHOT_PREFIX) :]
    if raw.endswith(";"):
        raw = raw[:-1]
    return json.loads(raw)


def write_if_changed(path: Path, text: str) -> None:
    original = path.read_text(encoding="utf-8")
    if original != text:
        path.write_text(text, encoding="utf-8", newline="\n")


def replace_line(text: str, pattern: str, replacement: str) -> str:
    updated, count = re.subn(pattern, replacement, text, flags=re.MULTILINE)
    if count == 0:
        raise ValueError(f"Pattern not found: {pattern}")
    return updated


def data_windows(payload: dict[str, object]) -> dict[str, str]:
    sources = payload.get("content", {}).get("dataSources", [])
    if not isinstance(sources, list):
        sources = []

    def find_window(keyword: str, fallback: str) -> str:
        for source in sources:
            if isinstance(source, dict) and keyword in str(source.get("name", "")):
                return str(source.get("window") or fallback)
        return fallback

    return {
        "transaction": find_window("실거래가", "최근 12개월"),
        "demand": find_window("상권분석서비스", "최신 공개 분기"),
        "store": find_window("상가", "최신 공개 파일"),
    }


def sync_readme(payload: dict[str, object]) -> None:
    path = PROJECT_ROOT / "README.md"
    text = path.read_text(encoding="utf-8")
    summary = payload["summary"]
    transaction_count = int(summary["transactionCount"])
    district_count = int(summary["districtCount"])
    admin_count = int(summary["adminDongCount"])
    trade_area_count = int(summary["tradeAreaCount"])

    coverage = f"서울 {district_count:,}개 구, 행정동 {admin_count:,}개, 수요 취약 상권 {trade_area_count:,}개"
    transaction = f"상업업무용 부동산 거래 원천 데이터 {transaction_count:,}건"
    reviewer_line = (
        f"| What data does it use? | {transaction_count:,} commercial transaction records, "
        f"{district_count:,} Seoul districts, {admin_count:,} admin-dongs, "
        f"and {trade_area_count:,} trade-area demand records. |"
    )

    text = replace_line(text, r"^\| What data does it use\? \| .+ \|$", reviewer_line)
    text = replace_line(text, r"^\| Coverage \| .+ \|$", f"| Coverage | {coverage} |")
    text = replace_line(text, r"^\| Transaction Data \| .+ \|$", f"| Transaction Data | {transaction} |")
    write_if_changed(path, text)


def sync_data_sources(payload: dict[str, object]) -> None:
    path = PROJECT_ROOT / "docs" / "DATA_SOURCES.md"
    text = path.read_text(encoding="utf-8")
    windows = data_windows(payload)
    replacement = (
        "- The current public payload uses transaction data from "
        f"`{windows['transaction']}`, Seoul commercial-district demand data from "
        f"`{windows['demand']}`, and store competition data from the "
        f"`{windows['store']}`."
    )
    text = replace_line(text, r"^- The current public payload uses transaction data from .+$", replacement)
    write_if_changed(path, text)


def sync_risk_validation(payload: dict[str, object]) -> None:
    path = PROJECT_ROOT / "docs" / "RISK_VALIDATION.md"
    text = path.read_text(encoding="utf-8")
    summary = payload["summary"]
    windows = data_windows(payload)
    replacements = {
        "분석 구": f"{int(summary['districtCount']):,}개 구",
        "행정동": f"{int(summary['adminDongCount']):,}개",
        "수요 취약 상권": f"{int(summary['tradeAreaCount']):,}개",
        "상업업무용 실거래": f"{int(summary['transactionCount']):,}건",
        "저표본 경고 구": f"{int(summary['lowSampleDistrictCount']):,}개",
        "케이스 스터디": f"{int(summary['caseStudyCount']):,}개",
        "거래 데이터 기간": windows["transaction"],
        "상권 수요 데이터": windows["demand"],
        "상가정보 데이터": windows["store"],
    }
    for label, value in replacements.items():
        text = replace_line(text, rf"^\| {re.escape(label)} \| .+ \|$", f"| {label} | {value} |")
    write_if_changed(path, text)


def sync_kpi_definition(payload: dict[str, object]) -> None:
    path = PROJECT_ROOT / "docs" / "KPI_DEFINITION.md"
    text = path.read_text(encoding="utf-8")
    summary = payload["summary"]
    replacement = (
        f"- 서울 {int(summary['districtCount']):,}개 구, {int(summary['adminDongCount']):,}개 행정동, "
        f"{int(summary['tradeAreaCount']):,}개 상권 취약 구간을 지속적으로 유지합니다."
    )
    text = replace_line(text, r"^- 서울 .+상권 취약 구간을 지속적으로 유지합니다\.$", replacement)
    write_if_changed(path, text)


def main() -> int:
    payload = read_payload()
    sync_readme(payload)
    sync_data_sources(payload)
    sync_risk_validation(payload)
    sync_kpi_definition(payload)
    print("Synced public data windows and coverage docs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
