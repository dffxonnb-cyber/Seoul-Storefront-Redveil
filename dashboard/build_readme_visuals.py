from __future__ import annotations

import csv
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_ROOT = ROOT.parent / "data" / "redveil"
EXT_ROOT = ROOT.parent / "data" / "external" / "processed"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def score_color(score: float) -> str:
    if score >= 75:
        return "#d4572d"
    if score >= 60:
        return "#c99624"
    if score >= 45:
        return "#2c6c7f"
    return "#4e7f5d"


def grade_label(score: float) -> str:
    if score >= 75:
        return "매우 높음"
    if score >= 60:
        return "높음"
    if score >= 45:
        return "주의"
    return "낮음"


def shorten(text: str, limit: int) -> str:
    text = " ".join(text.replace(";", "; ").split())
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def wrap_svg_text(text: str, limit: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) <= limit:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def rect(x: int, y: int, w: int, h: int, cls: str = "", rx: int = 24) -> str:
    class_attr = f' class="{cls}"' if cls else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"{class_attr} />'


def text(x: int, y: int, content: str, cls: str = "", anchor: str | None = None) -> str:
    class_attr = f' class="{cls}"' if cls else ""
    anchor_attr = f' text-anchor="{anchor}"' if anchor else ""
    return f'<text x="{x}" y="{y}"{class_attr}{anchor_attr}>{escape(content)}</text>'


def tspan_line(dy: int, content: str) -> str:
    return f'<tspan x="0" dy="{dy}">{escape(content)}</tspan>'


def build_hero_svg() -> str:
    districts = read_csv(DATA_ROOT / "seoul_district_acquisition_risk.csv")
    replacements = read_csv(DATA_ROOT / "seoul_replacement_candidates.csv")
    memos = read_csv(DATA_ROOT / "seoul_district_risk_memo.csv")

    districts = sorted(
        districts, key=lambda row: float(row["overall_acquisition_risk_score"]), reverse=True
    )
    top_districts = districts[:6]
    featured = top_districts[0]
    featured_code = featured["district_code"]
    featured_replacements = [
        row for row in replacements if row["source_district_code"] == featured_code
    ][:3]
    featured_memo = next(row for row in memos if row["district_code"] == featured_code)

    stats = [
        ("거래 원천 데이터", "12,074건", "#d4572d"),
        ("비교 구 수", "25개", "#2c6c7f"),
        ("행정동 커버", "428개", "#c99624"),
        ("분석 상권 수", "1,570개", "#8b4f81"),
    ]

    objections = [
        item.strip()
        for item in featured_memo["primary_risk_objections"].split(";")
        if item.strip()
    ][:3]

    width = 1600
    height = 980
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none">',
        """
        <style>
          .bg { fill: #f6efe6; }
          .panel { fill: #fffaf5; stroke: #e2d3c4; stroke-width: 2; }
          .chip { fill: #fff4ee; stroke: #f2c8b5; stroke-width: 1.5; }
          .title { font: 700 34px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .subtitle { font: 500 18px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #66707c; }
          .h2 { font: 700 26px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .label { font: 600 15px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #66707c; }
          .metric { font: 700 34px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .body { font: 500 16px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #46505b; }
          .small { font: 500 14px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #66707c; }
          .strong { font: 700 16px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .score { font: 700 28px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .rank { font: 700 20px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
        </style>
        """,
        rect(0, 0, width, height, "bg", 0),
        text(64, 72, "Redveil", "title"),
        text(64, 108, "서울 소형 상가 매입 전에 보류 사유를 먼저 보여주는 리스크 판별 서비스", "subtitle"),
    ]

    card_y = 148
    card_w = 344
    card_gap = 18
    for i, (label, value, color) in enumerate(stats):
        x = 64 + i * (card_w + card_gap)
        parts.append(rect(x, card_y, card_w, 110, "panel", 24))
        parts.append(f'<circle cx="{x + 26}" cy="{card_y + 30}" r="8" fill="{color}" />')
        parts.append(text(x + 48, card_y + 38, label, "label"))
        parts.append(text(x + 22, card_y + 82, value, "metric"))

    # Top district risk board
    parts.append(rect(64, 292, 760, 616, "panel", 30))
    parts.append(text(96, 340, "상위 위험 구와 점수", "h2"))
    parts.append(text(96, 368, "전체 리스크 점수가 높은 구를 먼저 보여줍니다.", "small"))

    max_score = max(float(row["overall_acquisition_risk_score"]) for row in top_districts)
    for idx, row in enumerate(top_districts):
        y = 420 + idx * 76
        score = float(row["overall_acquisition_risk_score"])
        color = score_color(score)
        bar_w = int((score / max_score) * 430)
        parts.append(text(96, y + 10, row["district_name"], "strong"))
        parts.append(text(210, y + 10, f"{score:.1f}", "score"))
        parts.append(text(298, y + 10, grade_label(score), "small"))
        parts.append(rect(96, y + 24, 520, 14, rx=7, cls=""))
        parts.append(
            f'<rect x="96" y="{y + 24}" width="520" height="14" rx="7" fill="#efe7dd" />'
        )
        parts.append(
            f'<rect x="96" y="{y + 24}" width="{bar_w}" height="14" rx="7" fill="{color}" />'
        )
        summary_lines = wrap_svg_text(shorten(row["risk_summary"], 72), 36)
        for line_index, line in enumerate(summary_lines[:2]):
            parts.append(text(96, y + 58 + line_index * 18, line, "body"))

    # Featured memo panel
    parts.append(rect(852, 292, 684, 300, "panel", 30))
    parts.append(text(884, 340, f"대표 검토 메모 · {featured['district_name']}", "h2"))
    parts.append(text(884, 370, "점수 축과 보류 사유를 한 화면에서 읽게 구성했습니다.", "small"))
    parts.append(text(884, 430, f"{float(featured['overall_acquisition_risk_score']):.1f}", "metric"))
    parts.append(text(974, 430, grade_label(float(featured["overall_acquisition_risk_score"])), "label"))

    axis_rows = [
        ("가격 부담", float(featured["price_burden_risk_score"])),
        ("유동성", float(featured["liquidity_risk_score"])),
        ("상권 과밀", float(featured["competition_risk_score"])),
        ("변동성", float(featured["volatility_risk_score"])),
    ]
    for idx, (label, value) in enumerate(axis_rows):
        y = 462 + idx * 28
        bar_w = int((value / 100) * 250)
        parts.append(text(884, y, label, "small"))
        parts.append(f'<rect x="972" y="{y - 12}" width="250" height="12" rx="6" fill="#efe7dd" />')
        parts.append(
            f'<rect x="972" y="{y - 12}" width="{bar_w}" height="12" rx="6" fill="{score_color(value)}" />'
        )
        parts.append(text(1238, y, f"{value:.1f}", "small", "end"))

    chip_y = 545
    chip_x = 884
    for item in objections:
        chip_w = min(270, max(130, len(item) * 11))
        parts.append(rect(chip_x, chip_y, chip_w, 40, "chip", 20))
        parts.append(text(chip_x + 18, chip_y + 26, shorten(item, 24), "body"))
        chip_x += chip_w + 12

    # Replacement panel
    parts.append(rect(852, 620, 684, 288, "panel", 30))
    parts.append(text(884, 668, "대체 후보", "h2"))
    parts.append(text(884, 696, "같은 검토 흐름에서 바로 비교할 수 있는 후보 구입니다.", "small"))
    for idx, row in enumerate(featured_replacements):
        y = 746 + idx * 54
        parts.append(text(884, y, f"{idx + 1}", "rank"))
        parts.append(text(930, y, row["candidate_district_name"], "strong"))
        parts.append(text(1040, y, f"{float(row['candidate_acquisition_risk_score']):.1f}", "score"))
        why = row["candidate_why_better"].replace("lower overall acquisition risk", "총 리스크가 더 낮음")
        why = why.replace("stronger transaction liquidity", "유동성이 더 안정적")
        why = why.replace("lighter merchant saturation", "상권 과밀 부담이 더 낮음")
        lines = wrap_svg_text(why, 28)
        for line_idx, line in enumerate(lines[:2]):
            parts.append(text(1136, y - 10 + line_idx * 18, line, "body"))
        if idx < len(featured_replacements) - 1:
            parts.append(f'<line x1="884" y1="{y + 22}" x2="1500" y2="{y + 22}" stroke="#ede2d6" />')

    parts.append(
        text(
            64,
            946,
            "README 기준 첫 화면에서 서비스 목적, 핵심 수치, 위험 구, 대체 후보까지 한 번에 보이도록 재구성했습니다.",
            "small",
        )
    )
    parts.append("</svg>")
    return "".join(parts)


def build_evidence_svg() -> str:
    demand_rows = read_csv(DATA_ROOT / "seoul_trade_area_demand_fragility.csv")
    saturation_rows = read_csv(EXT_ROOT / "seoul_store_competition_by_admin_dong.csv")

    demand_rows = sorted(
        demand_rows, key=lambda row: float(row["demand_fragility_risk_score"]), reverse=True
    )[:6]
    saturation_rows = sorted(
        saturation_rows, key=lambda row: int(float(row["total_store_count"])), reverse=True
    )[:6]

    width = 1600
    height = 920
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none">',
        """
        <style>
          .bg { fill: #f6efe6; }
          .panel { fill: #fffaf5; stroke: #e2d3c4; stroke-width: 2; }
          .title { font: 700 34px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .subtitle { font: 500 18px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #66707c; }
          .h2 { font: 700 26px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .body { font: 500 16px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #46505b; }
          .small { font: 500 14px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #66707c; }
          .strong { font: 700 16px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
          .score { font: 700 24px 'Segoe UI', 'Apple SD Gothic Neo', sans-serif; fill: #1f2733; }
        </style>
        """,
        rect(0, 0, width, height, "bg", 0),
        text(64, 72, "점수의 근거가 어떻게 보이는가", "title"),
        text(64, 108, "수요 취약 상권과 행정동 과밀도를 분리해 보여주고, 최종 판단은 매물 검토 화면으로 연결합니다.", "subtitle"),
        rect(64, 150, 710, 690, "panel", 30),
        rect(826, 150, 710, 690, "panel", 30),
        text(96, 198, "수요 취약 상권", "h2"),
        text(96, 226, "거래 효율, 객단가, 업종 폭이 약한 상권을 먼저 보여줍니다.", "small"),
        text(858, 198, "행정동 과밀 구간", "h2"),
        text(858, 226, "점포 밀도와 업종 집중도가 높은 행정동을 바로 확인할 수 있습니다.", "small"),
    ]

    max_demand = max(float(row["demand_fragility_risk_score"]) for row in demand_rows)
    for idx, row in enumerate(demand_rows):
        y = 280 + idx * 88
        score = float(row["demand_fragility_risk_score"])
        bar_w = int((score / max_demand) * 290)
        parts.append(text(96, y, row["trade_area_name"], "strong"))
        parts.append(text(96, y + 24, row["trade_area_type_name"], "small"))
        parts.append(text(300, y, f"{score:.1f}", "score"))
        parts.append(text(368, y, grade_label(score), "small"))
        parts.append(f'<rect x="96" y="{y + 36}" width="300" height="12" rx="6" fill="#efe7dd" />')
        parts.append(
            f'<rect x="96" y="{y + 36}" width="{bar_w}" height="12" rx="6" fill="{score_color(score)}" />'
        )
        objection = shorten(row["risk_objection"], 54)
        for line_idx, line in enumerate(wrap_svg_text(objection, 34)[:2]):
            parts.append(text(420, y + 6 + line_idx * 18, line, "body"))

    max_store = max(int(float(row["total_store_count"])) for row in saturation_rows)
    for idx, row in enumerate(saturation_rows):
        y = 280 + idx * 88
        stores = int(float(row["total_store_count"]))
        share = float(row["food_store_share"]) * 100
        bar_w = int((stores / max_store) * 280)
        parts.append(text(858, y, row["admin_dong_name"], "strong"))
        parts.append(text(970, y, row["district_name"], "small"))
        parts.append(text(858, y + 24, f"점포 {stores:,}개", "body"))
        parts.append(text(970, y + 24, f"음식점 비중 {share:.1f}%", "body"))
        parts.append(f'<rect x="858" y="{y + 36}" width="280" height="12" rx="6" fill="#efe7dd" />')
        parts.append(
            f'<rect x="858" y="{y + 36}" width="{bar_w}" height="12" rx="6" fill="#2c6c7f" />'
        )
        top_categories = shorten(row["top_3_small_categories"], 42)
        parts.append(text(1162, y + 6, top_categories, "body"))

    parts.append(rect(64, 856, 1472, 38, "panel", 18))
    parts.append(
        text(
            92,
            880,
            "README에서는 보기 좋은 합성보다 실제 데이터 기반 근거 보드를 먼저 보여주도록 바꿨습니다.",
            "body",
        )
    )
    parts.append("</svg>")
    return "".join(parts)


def main() -> None:
    (ROOT / "README_HERO.svg").write_text(build_hero_svg(), encoding="utf-8")
    (ROOT / "README_EVIDENCE.svg").write_text(build_evidence_svg(), encoding="utf-8")


if __name__ == "__main__":
    main()
