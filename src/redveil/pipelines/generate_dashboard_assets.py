from __future__ import annotations

import math
import textwrap
from pathlib import Path

import pandas as pd
from PIL import Image, ImageDraw, ImageFont


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DASHBOARD_DIR = PROJECT_ROOT / "dashboard"
DATA_REDVEIL = PROJECT_ROOT / "data" / "redveil"
DATA_EXTERNAL = PROJECT_ROOT / "data" / "external" / "processed"
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"

WIDTH = 1600
HEIGHT = 900
BG = "#F4F1EA"
PANEL = "#FFFDF8"
INK = "#15202B"
MUTED = "#5B6570"
ACCENT = "#C95A2E"
ACCENT_2 = "#1E4E5F"
ACCENT_3 = "#B88D2B"
LINE = "#D9D1C7"
WARN = "#F7D9C4"
GOOD = "#DDEFE5"


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                Path("C:/Windows/Fonts/malgunbd.ttf"),
                Path("C:/Windows/Fonts/arialbd.ttf"),
            ]
        )
    candidates.extend(
        [
            Path("C:/Windows/Fonts/malgun.ttf"),
            Path("C:/Windows/Fonts/arial.ttf"),
        ]
    )
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


FONT_H1 = get_font(42, bold=True)
FONT_H2 = get_font(28, bold=True)
FONT_H3 = get_font(22, bold=True)
FONT_BODY = get_font(18)
FONT_SMALL = get_font(15)
FONT_METRIC = get_font(34, bold=True)


def create_canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)
    return image, draw


def draw_round_box(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str, outline: str = LINE, radius: int = 24, width: int = 2) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_text_block(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    width: int,
    font: ImageFont.ImageFont,
    fill: str = INK,
    line_gap: int = 6,
) -> int:
    wrapped = textwrap.wrap(str(text), width=max(12, width // max(font.size // 2, 8)))
    current_y = y
    for line in wrapped:
        draw.text((x, current_y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, current_y), line, font=font)
        current_y = bbox[3] + line_gap
    return current_y


def draw_metric_card(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, value: str, subtitle: str, accent: str) -> None:
    draw_round_box(draw, box, fill=PANEL)
    x1, y1, x2, y2 = box
    draw.rounded_rectangle((x1 + 18, y1 + 18, x1 + 74, y1 + 74), radius=18, fill=accent)
    draw.text((x1 + 96, y1 + 22), title, font=FONT_SMALL, fill=MUTED)
    draw.text((x1 + 96, y1 + 54), value, font=FONT_METRIC, fill=INK)
    draw_text_block(draw, subtitle, x1 + 24, y1 + 118, (x2 - x1) - 48, FONT_SMALL, fill=MUTED)


def draw_bar_rows(
    draw: ImageDraw.ImageDraw,
    rows: list[tuple[str, float]],
    box: tuple[int, int, int, int],
    accent: str = ACCENT,
    max_value: float | None = None,
    value_fmt: str = "{:.1f}",
) -> None:
    x1, y1, x2, y2 = box
    draw_round_box(draw, box, fill=PANEL)
    max_value = max_value or max(value for _, value in rows) if rows else 1
    current_y = y1 + 28
    for label, value in rows:
        draw.text((x1 + 24, current_y), label, font=FONT_BODY, fill=INK)
        value_text = value_fmt.format(value)
        bbox = draw.textbbox((0, 0), value_text, font=FONT_SMALL)
        draw.text((x2 - 24 - (bbox[2] - bbox[0]), current_y + 2), value_text, font=FONT_SMALL, fill=MUTED)
        bar_y = current_y + 30
        draw.rounded_rectangle((x1 + 24, bar_y, x2 - 24, bar_y + 18), radius=9, fill="#ECE6DD")
        bar_width = int((x2 - x1 - 48) * (value / max_value)) if max_value else 0
        draw.rounded_rectangle((x1 + 24, bar_y, x1 + 24 + max(8, bar_width), bar_y + 18), radius=9, fill=accent)
        current_y = bar_y + 42


def draw_table(
    draw: ImageDraw.ImageDraw,
    headers: list[str],
    rows: list[list[str]],
    box: tuple[int, int, int, int],
    column_widths: list[int],
) -> None:
    x1, y1, x2, y2 = box
    draw_round_box(draw, box, fill=PANEL)
    current_x = x1 + 20
    current_y = y1 + 18
    for idx, header in enumerate(headers):
        draw.text((current_x, current_y), header, font=FONT_SMALL, fill=MUTED)
        current_x += column_widths[idx]
    draw.line((x1 + 18, current_y + 28, x2 - 18, current_y + 28), fill=LINE, width=2)
    current_y += 42
    for row in rows:
        current_x = x1 + 20
        row_height = 0
        for idx, cell in enumerate(row):
            cell_y = draw_text_block(draw, str(cell), current_x, current_y, column_widths[idx] - 14, FONT_SMALL)
            row_height = max(row_height, cell_y - current_y)
            current_x += column_widths[idx]
        current_y += row_height + 14
        if current_y < y2 - 16:
            draw.line((x1 + 18, current_y, x2 - 18, current_y), fill="#EEE7DE", width=1)
            current_y += 10


def save_image(image: Image.Image, filename: str) -> None:
    DASHBOARD_DIR.mkdir(parents=True, exist_ok=True)
    image.save(DASHBOARD_DIR / filename, format="PNG")


def load_data() -> dict[str, pd.DataFrame]:
    return {
        "risk": pd.read_csv(DATA_REDVEIL / "seoul_district_acquisition_risk.csv"),
        "memo": pd.read_csv(DATA_REDVEIL / "seoul_district_risk_memo.csv"),
        "cand": pd.read_csv(DATA_REDVEIL / "seoul_replacement_candidates.csv"),
        "case": pd.read_csv(DATA_PROCESSED / "case_study_snapshots.csv"),
        "demand": pd.read_csv(DATA_REDVEIL / "seoul_trade_area_demand_fragility.csv"),
        "dong": pd.read_csv(DATA_EXTERNAL / "seoul_store_competition_by_admin_dong.csv"),
        "kpi": pd.read_csv(DATA_PROCESSED / "case_study_snapshots.csv"),
        "trans": pd.read_csv(DATA_PROCESSED / "seoul_transaction_risk_scores.csv"),
    }


def make_overview_png(data: dict[str, pd.DataFrame]) -> None:
    risk = data["risk"]
    case_df = data["case"]
    image, draw = create_canvas()
    draw.text((60, 44), "Redveil", font=FONT_H1, fill=INK)
    draw.text((60, 100), "Acquisition objections before commitment", font=FONT_BODY, fill=MUTED)

    metrics = [
        ("Transactions", "12,074", "Storefront-oriented raw transactions collected from 2025-04 to 2026-03.", ACCENT),
        ("District Risk", "25", "District-level acquisition memos available in the latest snapshot.", ACCENT_2),
        ("Admin-Dongs", "428", "Admin-dong saturation coverage from the processed store information file.", ACCENT_3),
        ("Low Sample", f"{int(risk['low_sample_flag'].sum())}", "Districts with thin latest-month storefront trade samples.", "#8C4B7D"),
    ]
    x = 60
    for title, value, subtitle, accent in metrics:
        draw_metric_card(draw, (x, 150, x + 350, 290), title, value, subtitle, accent)
        x += 370

    draw_round_box(draw, (60, 330, 760, 820), fill=PANEL)
    draw.text((88, 356), "Immediate Risk Queue", font=FONT_H2, fill=INK)
    top_rows = risk.sort_values("overall_acquisition_risk_score", ascending=False).head(6)
    row_y = 414
    for row in top_rows.itertuples(index=False):
        draw.rounded_rectangle((88, row_y, 732, row_y + 52), radius=16, fill="#F8F3EC")
        draw.text((108, row_y + 12), row.district_name, font=FONT_BODY, fill=INK)
        draw.text((270, row_y + 12), f"{row.overall_acquisition_risk_score:.1f}", font=FONT_H3, fill=ACCENT)
        draw.text((370, row_y + 14), row.acquisition_risk_grade, font=FONT_SMALL, fill=MUTED)
        draw_text_block(draw, row.primary_risk_objections, 480, row_y + 10, 230, FONT_SMALL, fill=MUTED, line_gap=2)
        row_y += 64

    draw_round_box(draw, (800, 330, 1540, 820), fill=PANEL)
    draw.text((828, 356), "Case Studies and Caveats", font=FONT_H2, fill=INK)
    draw.rounded_rectangle((828, 404, 1510, 484), radius=18, fill=WARN)
    draw_text_block(
        draw,
        "Transaction risk uses 2025-04 to 2026-03 storefront trades. Demand fragility still uses 2024 Seoul trade-area files, so the product should be read as a risk-review screen rather than a same-period causal model.",
        850,
        424,
        630,
        FONT_BODY,
        fill=INK,
        line_gap=4,
    )
    card_y = 520
    for row in case_df.itertuples(index=False):
        draw.rounded_rectangle((828, card_y, 1510, card_y + 86), radius=18, fill="#F8F3EC")
        draw.text((850, card_y + 12), row.district_name, font=FONT_H3, fill=INK)
        draw.text((1010, card_y + 14), f"{row.acquisition_risk_score:.1f}", font=FONT_H3, fill=ACCENT_2)
        draw.text((1100, card_y + 16), row.acquisition_risk_grade, font=FONT_SMALL, fill=MUTED)
        draw_text_block(draw, row.replacement_candidates, 1240, card_y + 12, 230, FONT_SMALL, fill=MUTED, line_gap=2)
        draw_text_block(draw, row.risk_summary, 850, card_y + 44, 600, FONT_SMALL, fill=MUTED, line_gap=2)
        card_y += 100

    save_image(image, "01_overview.png")


def make_district_risk_review_png(data: dict[str, pd.DataFrame]) -> None:
    risk = data["risk"]
    memo = data["memo"]
    cand = data["cand"]
    target = "서초구"
    risk_row = risk.loc[risk["district_name"] == target].iloc[0]
    memo_row = memo.loc[memo["district_name"] == target].iloc[0]
    cand_rows = cand.loc[cand["source_district_name"] == target].sort_values("candidate_rank")

    image, draw = create_canvas()
    draw.text((60, 44), "District Risk Review", font=FONT_H1, fill=INK)
    draw.text((60, 100), f"Focused memo for {target}", font=FONT_BODY, fill=MUTED)

    metric_cards = [
        ("Overall", f"{risk_row['overall_acquisition_risk_score']:.1f}", risk_row["acquisition_risk_grade"], ACCENT),
        ("Transaction", f"{risk_row['overall_transaction_risk_score']:.1f}", f"sample {risk_row['sample_reliability']}", ACCENT_2),
        ("Competition", f"{risk_row['competition_risk_score']:.1f}", risk_row["competition_risk_grade"], ACCENT_3),
    ]
    x = 60
    for title, value, subtitle, accent in metric_cards:
        draw_metric_card(draw, (x, 150, x + 300, 285), title, value, subtitle, accent)
        x += 320

    draw_round_box(draw, (60, 320, 840, 820), fill=PANEL)
    draw.text((88, 350), "Risk Memo", font=FONT_H2, fill=INK)
    draw_text_block(draw, memo_row["risk_memo"], 88, 402, 700, FONT_BODY, fill=INK, line_gap=6)
    draw.text((88, 520), "Objections", font=FONT_H3, fill=INK)
    objection_y = 558
    for objection in str(memo_row["primary_risk_objections"]).split("; "):
        draw.rounded_rectangle((88, objection_y, 808, objection_y + 50), radius=16, fill="#F8F3EC")
        draw_text_block(draw, objection, 110, objection_y + 14, 660, FONT_SMALL, fill=INK, line_gap=2)
        objection_y += 64
    draw.text((88, 760), "Top merchant categories", font=FONT_H3, fill=INK)
    draw_text_block(draw, risk_row["top_3_small_categories"], 88, 792, 690, FONT_SMALL, fill=MUTED, line_gap=2)

    draw_bar_rows(
        draw,
        [
            ("Price burden", float(risk_row["price_burden_risk_score"])),
            ("Liquidity", float(risk_row["liquidity_risk_score"])),
            ("Volatility", float(risk_row["volatility_risk_score"])),
            ("Competition", float(risk_row["competition_risk_score"])),
        ],
        (880, 150, 1540, 470),
        accent=ACCENT,
    )

    draw_table(
        draw,
        ["Rank", "Candidate", "Score", "Why better"],
        [
            [str(int(row.candidate_rank)), row.candidate_district_name, f"{row.candidate_acquisition_risk_score:.1f}", row.candidate_why_better]
            for row in cand_rows.itertuples(index=False)
        ],
        (880, 500, 1540, 820),
        [80, 120, 90, 320],
    )
    draw.text((902, 526), "Replacement Candidates", font=FONT_H2, fill=INK)

    save_image(image, "02_district_risk_review.png")


def make_case_study_png(data: dict[str, pd.DataFrame]) -> None:
    case_df = data["case"]
    image, draw = create_canvas()
    draw.text((60, 44), "Case Studies", font=FONT_H1, fill=INK)
    draw.text((60, 100), "Three portfolio-ready narratives generated from the latest risk snapshot", font=FONT_BODY, fill=MUTED)

    cards = [(60, 160, 500, 780), (540, 160, 980, 780), (1020, 160, 1460, 780)]
    accents = [ACCENT, ACCENT_2, ACCENT_3]
    for idx, row in enumerate(case_df.itertuples(index=False)):
        x1, y1, x2, y2 = cards[idx]
        draw_round_box(draw, (x1, y1, x2, y2), fill=PANEL)
        draw.rounded_rectangle((x1 + 26, y1 + 24, x1 + 140, y1 + 70), radius=18, fill=accents[idx])
        draw.text((x1 + 42, y1 + 34), row.district_name, font=FONT_H3, fill="white")
        draw.text((x1 + 26, y1 + 98), f"Risk {row.acquisition_risk_score:.1f}", font=FONT_METRIC, fill=INK)
        draw.text((x1 + 26, y1 + 148), row.acquisition_risk_grade, font=FONT_SMALL, fill=MUTED)
        draw.text((x1 + 26, y1 + 190), f"6m price {row.six_month_price_change_pct:+.1f}%", font=FONT_BODY, fill=INK)
        draw.text((x1 + 26, y1 + 224), f"6m volume {row.six_month_transaction_change_pct:+.1f}%", font=FONT_BODY, fill=INK)
        draw.text((x1 + 26, y1 + 266), f"Reliability {row.sample_reliability}", font=FONT_BODY, fill=INK)
        draw.text((x1 + 26, y1 + 316), "Summary", font=FONT_H3, fill=INK)
        y = draw_text_block(draw, row.risk_summary, x1 + 26, y1 + 350, 370, FONT_SMALL, fill=MUTED, line_gap=3)
        draw.text((x1 + 26, y + 18), "Replacements", font=FONT_H3, fill=INK)
        y = draw_text_block(draw, row.replacement_candidates, x1 + 26, y + 52, 370, FONT_SMALL, fill=INK, line_gap=3)
        draw.text((x1 + 26, y + 18), "Field checks", font=FONT_H3, fill=INK)
        draw_text_block(draw, row.field_checks, x1 + 26, y + 52, 370, FONT_SMALL, fill=MUTED, line_gap=3)

    save_image(image, "03_case_study.png")


def make_demand_fragility_png(data: dict[str, pd.DataFrame]) -> None:
    demand = data["demand"].sort_values("demand_fragility_risk_score", ascending=False).head(8)
    image, draw = create_canvas()
    draw.text((60, 44), "Demand Fragility", font=FONT_H1, fill=INK)
    draw.text((60, 100), "Latest available Seoul trade-area signal: 2024 Q4", font=FONT_BODY, fill=MUTED)
    draw.rounded_rectangle((60, 140, 1540, 220), radius=20, fill=WARN)
    draw_text_block(
        draw,
        "This view comes from 2024 trade-area demand files. Use it to understand structural weakness in sales efficiency, ticket size, and service breadth, not to claim same-month alignment with 2026 transaction risk.",
        84,
        164,
        1410,
        FONT_BODY,
        fill=INK,
        line_gap=4,
    )
    rows = [
        [
            row.trade_area_type_name,
            row.trade_area_name,
            f"{row.demand_fragility_risk_score:.1f}",
            row.demand_fragility_grade,
            row.risk_objection,
        ]
        for row in demand.itertuples(index=False)
    ]
    draw_table(
        draw,
        ["Type", "Trade area", "Score", "Grade", "Objection"],
        rows,
        (60, 260, 1540, 820),
        [140, 280, 90, 110, 760],
    )
    save_image(image, "04_demand_fragility.png")


def make_admin_dong_png(data: dict[str, pd.DataFrame]) -> None:
    dong = data["dong"]
    district = "강남구"
    dong_df = dong.loc[dong["district_name"] == district].sort_values("total_store_count", ascending=False).head(8)
    image, draw = create_canvas()
    draw.text((60, 44), "Admin-Dong Saturation", font=FONT_H1, fill=INK)
    draw.text((60, 100), f"{district} corridor density and merchant clustering", font=FONT_BODY, fill=MUTED)
    draw_bar_rows(
        draw,
        [(row.admin_dong_name, float(row.total_store_count)) for row in dong_df.itertuples(index=False)],
        (60, 160, 780, 820),
        accent=ACCENT_2,
        value_fmt="{:.0f}",
    )
    draw_table(
        draw,
        ["Admin-dong", "Stores", "Food share", "Top categories"],
        [
            [
                row.admin_dong_name,
                str(int(row.total_store_count)),
                f"{row.food_store_share:.1%}",
                row.top_3_small_categories,
            ]
            for row in dong_df.itertuples(index=False)
        ],
        (820, 160, 1540, 820),
        [150, 90, 110, 320],
    )
    draw.text((842, 186), "Top saturated dong pockets", font=FONT_H2, fill=INK)
    save_image(image, "05_admin_dong_saturation.png")


def write_dashboard_links() -> None:
    content = """# Dashboard Links

Local PNG assets generated from the current project snapshot:

- [01_overview.png](/Users/a0109/.jupyter/01_projects/retail_marketing/commercial_investment_risk/dashboard/01_overview.png)
- [02_district_risk_review.png](/Users/a0109/.jupyter/01_projects/retail_marketing/commercial_investment_risk/dashboard/02_district_risk_review.png)
- [03_case_study.png](/Users/a0109/.jupyter/01_projects/retail_marketing/commercial_investment_risk/dashboard/03_case_study.png)
- [04_demand_fragility.png](/Users/a0109/.jupyter/01_projects/retail_marketing/commercial_investment_risk/dashboard/04_demand_fragility.png)
- [05_admin_dong_saturation.png](/Users/a0109/.jupyter/01_projects/retail_marketing/commercial_investment_risk/dashboard/05_admin_dong_saturation.png)
"""
    (DASHBOARD_DIR / "dashboard_links.md").write_text(content, encoding="utf-8")


def main() -> int:
    data = load_data()
    make_overview_png(data)
    make_district_risk_review_png(data)
    make_case_study_png(data)
    make_demand_fragility_png(data)
    make_admin_dong_png(data)
    write_dashboard_links()
    print("Saved dashboard PNG assets and links.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
