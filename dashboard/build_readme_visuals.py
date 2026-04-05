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


def rect(x: int, y: int, w: int, h: int, cls: str = "", rx: int = 24) -> str:
    class_attr = f' class="{cls}"' if cls else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"{class_attr} />'


def line(x1: int, y1: int, x2: int, y2: int, color: str = "#e9ddd0") -> str:
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="1" />'


def text(x: int, y: int, content: str, cls: str = "", anchor: str | None = None) -> str:
    class_attr = f' class="{cls}"' if cls else ""
    anchor_attr = f' text-anchor="{anchor}"' if anchor else ""
    return f'<text x="{x}" y="{y}"{class_attr}{anchor_attr}>{escape(content)}</text>'


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
        return "Very High"
    if score >= 60:
        return "High"
    if score >= 45:
        return "Watch"
    return "Low"


def objection_labels(raw: str) -> list[str]:
    labels: list[str] = []
    text_lower = raw.lower()
    if "pricing" in text_lower:
        labels.append("High price")
    if "merchant saturation" in text_lower:
        labels.append("Dense merchants")
    if "transaction pricing" in text_lower or "liquidity" in text_lower:
        labels.append("Thin liquidity")
    if "sales efficiency" in text_lower:
        labels.append("Weak sales")
    if "service mix" in text_lower:
        labels.append("Narrow mix")
    if not labels:
        labels.append("Risk signal")
    return labels[:3]


def top_category_short(raw: str) -> str:
    parts = [item.strip() for item in raw.split("|") if item.strip()]
    return " / ".join(parts[:2])


def build_style() -> str:
    return """
    <style>
      .bg { fill: #f6efe6; }
      .panel { fill: #fffaf5; stroke: #e2d3c4; stroke-width: 2; }
      .soft { fill: #f0e6da; }
      .title { font: 700 34px 'Segoe UI', sans-serif; fill: #1f2733; }
      .subtitle { font: 500 18px 'Segoe UI', sans-serif; fill: #66707c; }
      .section { font: 700 24px 'Segoe UI', sans-serif; fill: #1f2733; }
      .label { font: 600 14px 'Segoe UI', sans-serif; fill: #6b7380; }
      .metric { font: 700 34px 'Segoe UI', sans-serif; fill: #1f2733; }
      .name { font: 700 20px 'Segoe UI', sans-serif; fill: #1f2733; }
      .body { font: 500 16px 'Segoe UI', sans-serif; fill: #46505b; }
      .small { font: 500 13px 'Segoe UI', sans-serif; fill: #66707c; }
      .score { font: 700 28px 'Segoe UI', sans-serif; fill: #1f2733; }
      .chipText { font: 700 13px 'Segoe UI', sans-serif; fill: #1f2733; }
    </style>
    """


def build_hero_svg() -> str:
    districts = read_csv(DATA_ROOT / "seoul_district_acquisition_risk.csv")
    replacements = read_csv(DATA_ROOT / "seoul_replacement_candidates.csv")
    memos = read_csv(DATA_ROOT / "seoul_district_risk_memo.csv")

    districts = sorted(
        districts, key=lambda row: float(row["overall_acquisition_risk_score"]), reverse=True
    )
    top_cards = districts[:3]
    table_rows = districts[:5]
    featured = districts[0]
    featured_memo = next(row for row in memos if row["district_code"] == featured["district_code"])
    featured_replacements = [
        row for row in replacements if row["source_district_code"] == featured["district_code"]
    ][:3]

    stats = [
        ("Transactions", "12,074", "#d4572d"),
        ("Districts", "25", "#2c6c7f"),
        ("Admin-dongs", "428", "#c99624"),
        ("Trade areas", "1,570", "#8b4f81"),
    ]

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="980" viewBox="0 0 1600 980" fill="none">',
        build_style(),
        rect(0, 0, 1600, 980, "bg", 0),
        text(64, 72, "Redveil", "title"),
        text(64, 106, "Acquisition risk review for Seoul storefronts", "subtitle"),
    ]

    for idx, (label, value, color) in enumerate(stats):
        x = 64 + idx * 368
        parts.append(rect(x, 144, 350, 102, "panel", 24))
        parts.append(f'<circle cx="{x + 24}" cy="173" r="8" fill="{color}" />')
        parts.append(text(x + 46, 180, label, "label"))
        parts.append(text(x + 22, 222, value, "metric"))

    parts.append(rect(64, 286, 1472, 622, "panel", 30))
    parts.append(text(96, 332, "Top risk districts", "section"))
    parts.append(text(1120, 332, "Replacement candidates", "section"))

    card_width = 314
    for idx, row in enumerate(top_cards):
        x = 96 + idx * (card_width + 24)
        y = 372
        score = float(row["overall_acquisition_risk_score"])
        color = score_color(score)
        parts.append(rect(x, y, card_width, 188, "panel", 24))
        parts.append(f'<rect x="{x + 22}" y="{y + 22}" width="72" height="10" rx="5" fill="{color}" />')
        parts.append(text(x + 22, y + 64, row["district_name"], "name"))
        parts.append(text(x + 22, y + 108, f"{score:.1f}", "metric"))
        parts.append(text(x + 118, y + 106, grade_label(score), "label"))
        labels = objection_labels(row["primary_risk_objections"])
        for chip_idx, chip in enumerate(labels):
            chip_y = y + 132 + chip_idx * 20
            parts.append(rect(x + 22, chip_y, 124, 16, "soft", 8))
            parts.append(text(x + 34, chip_y + 12, chip, "small"))

    # Short leaderboard
    parts.append(rect(96, 590, 640, 278, "panel", 24))
    parts.append(text(120, 630, "Risk queue", "section"))
    max_score = float(table_rows[0]["overall_acquisition_risk_score"])
    for idx, row in enumerate(table_rows):
        y = 676 + idx * 34
        score = float(row["overall_acquisition_risk_score"])
        width = int((score / max_score) * 220)
        parts.append(text(120, y, row["district_name"], "body"))
        parts.append(text(260, y, f"{score:.1f}", "body"))
        parts.append(f'<rect x="330" y="{y - 12}" width="220" height="10" rx="5" fill="#efe7dd" />')
        parts.append(f'<rect x="330" y="{y - 12}" width="{width}" height="10" rx="5" fill="{score_color(score)}" />')
        parts.append(text(572, y, grade_label(score), "small"))

    # Featured memo
    parts.append(rect(774, 372, 338, 236, "panel", 24))
    parts.append(text(798, 410, f"Memo · {featured['district_name']}", "section"))
    parts.append(text(798, 448, f"Overall {float(featured['overall_acquisition_risk_score']):.1f}", "metric"))
    axis_rows = [
        ("Price", float(featured["price_burden_risk_score"])),
        ("Liquidity", float(featured["liquidity_risk_score"])),
        ("Competition", float(featured["competition_risk_score"])),
        ("Volatility", float(featured["volatility_risk_score"])),
    ]
    for idx, (label, value) in enumerate(axis_rows):
        y = 486 + idx * 28
        bar = int((value / 100) * 170)
        parts.append(text(798, y, label, "small"))
        parts.append(f'<rect x="890" y="{y - 10}" width="170" height="10" rx="5" fill="#efe7dd" />')
        parts.append(f'<rect x="890" y="{y - 10}" width="{bar}" height="10" rx="5" fill="{score_color(value)}" />')
        parts.append(text(1078, y, f"{value:.1f}", "small", "end"))

    # Replacement candidates panel
    parts.append(rect(1128, 372, 384, 496, "panel", 24))
    parts.append(text(1152, 410, featured["district_name"], "name"))
    parts.append(text(1228, 410, "→ lower-risk options", "label"))
    for idx, row in enumerate(featured_replacements):
        y = 468 + idx * 112
        score = float(row["candidate_acquisition_risk_score"])
        parts.append(text(1152, y, row["candidate_district_name"], "name"))
        parts.append(text(1420, y, f"{score:.1f}", "score", "end"))
        parts.append(text(1152, y + 28, row["candidate_why_better"].split(";")[0].strip(), "body"))
        parts.append(line(1152, y + 48, 1488, y + 48))
        parts.append(text(1152, y + 78, f"Liquidity {float(row['candidate_liquidity_risk_score']):.1f}", "small"))
        parts.append(text(1292, y + 78, f"Competition {float(row['candidate_competition_risk_score']):.1f}", "small"))

    parts.append("</svg>")
    return "".join(parts)


def build_evidence_svg() -> str:
    demand_rows = read_csv(DATA_ROOT / "seoul_trade_area_demand_fragility.csv")
    saturation_rows = read_csv(EXT_ROOT / "seoul_store_competition_by_admin_dong.csv")

    demand_rows = sorted(
        demand_rows, key=lambda row: float(row["demand_fragility_risk_score"]), reverse=True
    )[:5]
    saturation_rows = sorted(
        saturation_rows, key=lambda row: int(float(row["total_store_count"])), reverse=True
    )[:5]

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">',
        build_style(),
        rect(0, 0, 1600, 900, "bg", 0),
        text(64, 72, "Evidence boards", "title"),
        text(64, 106, "Demand fragility and admin-dong saturation in one glance", "subtitle"),
        rect(64, 146, 710, 694, "panel", 30),
        rect(826, 146, 710, 694, "panel", 30),
        text(96, 190, "Demand fragility", "section"),
        text(858, 190, "Admin-dong saturation", "section"),
    ]

    max_demand = max(float(row["demand_fragility_risk_score"]) for row in demand_rows)
    for idx, row in enumerate(demand_rows):
        y = 256 + idx * 110
        score = float(row["demand_fragility_risk_score"])
        parts.append(text(96, y, row["trade_area_name"], "name"))
        parts.append(text(96, y + 26, row["trade_area_type_name"], "small"))
        parts.append(text(312, y, f"{score:.1f}", "score"))
        parts.append(text(390, y, grade_label(score), "small"))
        width = int((score / max_demand) * 240)
        parts.append(f'<rect x="96" y="{y + 42}" width="240" height="12" rx="6" fill="#efe7dd" />')
        parts.append(f'<rect x="96" y="{y + 42}" width="{width}" height="12" rx="6" fill="{score_color(score)}" />')
        parts.append(text(372, y + 26, f"Sales/traffic {float(row['sales_efficiency_risk_score']):.1f}", "small"))
        parts.append(text(372, y + 48, f"Ticket size {float(row['ticket_size_risk_score']):.1f}", "small"))
        parts.append(text(372, y + 70, f"Service breadth {float(row['service_breadth_risk_score']):.1f}", "small"))
        if idx < len(demand_rows) - 1:
            parts.append(line(96, y + 88, 742, y + 88))

    max_store = max(int(float(row["total_store_count"])) for row in saturation_rows)
    for idx, row in enumerate(saturation_rows):
        y = 256 + idx * 110
        stores = int(float(row["total_store_count"]))
        width = int((stores / max_store) * 250)
        parts.append(text(858, y, row["admin_dong_name"], "name"))
        parts.append(text(1042, y, row["district_name"], "small"))
        parts.append(text(858, y + 26, f"Stores {stores:,}", "body"))
        parts.append(text(1010, y + 26, f"Food share {float(row['food_store_share']) * 100:.1f}%", "body"))
        parts.append(f'<rect x="858" y="{y + 42}" width="250" height="12" rx="6" fill="#efe7dd" />')
        parts.append(f'<rect x="858" y="{y + 42}" width="{width}" height="12" rx="6" fill="#2c6c7f" />')
        parts.append(text(1140, y + 18, top_category_short(row["top_3_small_categories"]), "small"))
        parts.append(text(1140, y + 44, f"HHI {float(row['small_category_hhi']):.2f}", "small"))
        if idx < len(saturation_rows) - 1:
            parts.append(line(858, y + 88, 1504, y + 88))

    parts.append("</svg>")
    return "".join(parts)


def main() -> None:
    (ROOT / "README_HERO.svg").write_text(build_hero_svg(), encoding="utf-8")
    (ROOT / "README_EVIDENCE.svg").write_text(build_evidence_svg(), encoding="utf-8")


if __name__ == "__main__":
    main()
