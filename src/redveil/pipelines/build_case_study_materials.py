from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[3]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))


from redveil.utils.paths import project_root


@dataclass
class CaseStudy:
    district_name: str
    acquisition_risk_score: float
    acquisition_risk_grade: str
    transaction_risk_score: float
    competition_risk_score: float
    price_burden_risk_score: float
    liquidity_risk_score: float
    volatility_risk_score: float
    sample_reliability: str
    low_sample_flag: bool
    stores_per_admin_dong: float
    food_store_share: float
    latest_month: str
    latest_transaction_count: int
    latest_median_price_per_sqm_10k_krw: float
    six_month_price_change_pct: float
    six_month_transaction_change_pct: float
    primary_risk_objections: str
    risk_summary: str
    top_3_small_categories: str
    replacement_candidates: str
    candidate_why_better: str
    field_checks: str


def load_required_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Required file was not found: {path}")
    return pd.read_csv(path)


def pct_change(first: float, last: float) -> float:
    if pd.isna(first) or pd.isna(last) or first == 0:
        return 0.0
    return (float(last) / float(first) - 1.0) * 100.0


def format_pct(value: float) -> str:
    sign = "+" if value > 0 else ""
    return f"{sign}{value:.1f}%"


def build_field_checks(objections: str) -> str:
    checks: list[str] = []
    if "pricing looks stretched" in objections:
        checks.append("verify whether recent asking prices still clear at transaction levels")
    if "merchant saturation" in objections:
        checks.append("walk the main admin-dong corridors and count duplicate tenant formats")
    if "transaction pricing is unstable" in objections:
        checks.append("review large outlier trades and separate whole-building deals from strata units")
    if "transaction liquidity is weakening" in objections:
        checks.append("check whether broker inventory is rising while closed deals are slowing")
    if not checks:
        checks.append("validate recent tenant replacement velocity and broker inventory before underwriting")
    return "; ".join(checks)


def build_case_studies(
    district_df: pd.DataFrame,
    history_df: pd.DataFrame,
    candidates_df: pd.DataFrame,
    top_n: int = 3,
) -> pd.DataFrame:
    case_studies: list[CaseStudy] = []
    selected = district_df.sort_values("overall_acquisition_risk_score", ascending=False).head(top_n)

    for _, row in selected.iterrows():
        district_name = row["district_name"]
        history = history_df.loc[history_df["district_name_kr"] == district_name].sort_values(
            "deal_year_month"
        )
        last_six = history.tail(6).reset_index(drop=True)
        latest = last_six.iloc[-1]
        first = last_six.iloc[0]

        candidate_rows = candidates_df.loc[
            candidates_df["source_district_name"] == district_name
        ].sort_values("candidate_rank")
        replacement_candidates = " | ".join(candidate_rows["candidate_district_name"].head(3).tolist())
        candidate_why_better = " | ".join(candidate_rows["candidate_why_better"].head(2).tolist())

        case_studies.append(
            CaseStudy(
                district_name=district_name,
                acquisition_risk_score=float(row["overall_acquisition_risk_score"]),
                acquisition_risk_grade=str(row["acquisition_risk_grade"]),
                transaction_risk_score=float(row["overall_transaction_risk_score"]),
                competition_risk_score=float(row["competition_risk_score"]),
                price_burden_risk_score=float(row["price_burden_risk_score"]),
                liquidity_risk_score=float(row["liquidity_risk_score"]),
                volatility_risk_score=float(row["volatility_risk_score"]),
                sample_reliability=str(row.get("sample_reliability", "High")),
                low_sample_flag=bool(row.get("low_sample_flag", False)),
                stores_per_admin_dong=float(row["stores_per_admin_dong"]),
                food_store_share=float(row["food_store_share"]),
                latest_month=str(latest["deal_year_month"]),
                latest_transaction_count=int(latest["transaction_count"]),
                latest_median_price_per_sqm_10k_krw=float(latest["median_price_per_sqm_10k_krw"]),
                six_month_price_change_pct=pct_change(
                    first["median_price_per_sqm_10k_krw"],
                    latest["median_price_per_sqm_10k_krw"],
                ),
                six_month_transaction_change_pct=pct_change(
                    first["transaction_count"],
                    latest["transaction_count"],
                ),
                primary_risk_objections=str(row["primary_risk_objections"]),
                risk_summary=str(row["risk_summary"]),
                top_3_small_categories=str(row["top_3_small_categories"]),
                replacement_candidates=replacement_candidates,
                candidate_why_better=candidate_why_better,
                field_checks=build_field_checks(str(row["primary_risk_objections"])),
            )
        )

    return pd.DataFrame([case.__dict__ for case in case_studies])


def build_markdown(case_df: pd.DataFrame) -> str:
    lines = [
        "# Case Studies",
        "",
        "Three high-risk districts were selected from the latest district acquisition risk output.",
        "Each memo is grounded in transaction risk, merchant saturation, and replacement-candidate logic.",
        "",
    ]

    for idx, row in enumerate(case_df.itertuples(index=False), start=1):
        lines.extend(
            [
                f"## {idx}. {row.district_name}",
                "",
                f"- Verdict: `{row.acquisition_risk_grade}` ({row.acquisition_risk_score:.1f})",
                f"- Core objections: {row.primary_risk_objections}",
                f"- Latest month: `{row.latest_month}` with {row.latest_transaction_count} trades and a median `sqm` price of {row.latest_median_price_per_sqm_10k_krw:.1f} (10k KRW)",
                f"- Six-month price change: {format_pct(row.six_month_price_change_pct)}",
                f"- Six-month transaction change: {format_pct(row.six_month_transaction_change_pct)}",
                f"- Saturation signal: {row.stores_per_admin_dong:.1f} stores per admin-dong, food-store share {row.food_store_share:.1%}",
                f"- Sample reliability: `{row.sample_reliability}`",
                f"- Dominant categories: {row.top_3_small_categories}",
                f"- Why the model flagged it: {row.risk_summary}",
                f"- Lower-risk substitutes: {row.replacement_candidates}",
                f"- Why substitutes look better: {row.candidate_why_better}",
                f"- Field checks before underwriting: {row.field_checks}",
                "",
            ]
        )

    return "\n".join(lines)


def main() -> int:
    root = project_root()
    district_path = root / "data" / "redveil" / "seoul_district_acquisition_risk.csv"
    history_path = root / "data" / "processed" / "seoul_transaction_risk_history.csv"
    candidates_path = root / "data" / "redveil" / "seoul_replacement_candidates.csv"

    district_df = load_required_csv(district_path)
    history_df = load_required_csv(history_path)
    candidates_df = load_required_csv(candidates_path)

    case_df = build_case_studies(district_df, history_df, candidates_df, top_n=3)

    output_csv = root / "data" / "processed" / "case_study_snapshots.csv"
    output_md = root / "docs" / "CASE_STUDIES.md"
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    output_md.parent.mkdir(parents=True, exist_ok=True)

    case_df.to_csv(output_csv, index=False, encoding="utf-8-sig")
    output_md.write_text(build_markdown(case_df), encoding="utf-8")

    print(f"Saved {output_csv.name}")
    print(f"Saved {output_md.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
