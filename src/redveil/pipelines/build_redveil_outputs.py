from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[3]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from redveil.utils.paths import project_root
from redveil.utils.scoring import clip_score, percentile_rank


def parse_args() -> argparse.Namespace:
    root = project_root()
    parser = argparse.ArgumentParser(
        description="Build demand fragility scores and Redveil memo outputs."
    )
    parser.add_argument(
        "--trade-area-activity-input",
        default=str(root / "data" / "external" / "processed" / "seoul_trade_area_activity_2024.csv"),
        help="Path to processed trade-area activity data.",
    )
    parser.add_argument(
        "--district-competition-input",
        default=str(root / "data" / "external" / "processed" / "seoul_store_competition_by_district.csv"),
        help="Path to processed district competition data.",
    )
    parser.add_argument(
        "--transaction-risk-input",
        default=str(root / "data" / "processed" / "seoul_transaction_risk_scores.csv"),
        help="Path to transaction risk scores. Integrated district outputs are skipped if missing.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(root / "data" / "redveil"),
        help="Directory for Redveil outputs.",
    )
    return parser.parse_args()


def ensure_dir(path_str: str) -> Path:
    path = Path(path_str).resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def make_trade_area_objection(row: pd.Series) -> str:
    objections: list[str] = []
    if row["sales_efficiency_risk_score"] >= 75:
        objections.append("sales efficiency versus foot traffic is weak")
    if row["demand_per_service_risk_score"] >= 75:
        objections.append("floating demand appears thin relative to the number of active service categories")
    if row["ticket_size_risk_score"] >= 75:
        objections.append("average sales value per transaction is weak")
    if row["service_breadth_risk_score"] >= 75:
        objections.append("service mix breadth is narrow for a resilient trade area")
    if bool(row["low_population_flag"]):
        objections.append("the area relies on a low floating-population denominator, so demand evidence is unstable")

    if not objections:
        objections.append("demand signals are not flashing red, but the area still needs district-level acquisition context")

    return "; ".join(objections)


def build_trade_area_demand_fragility(activity_df: pd.DataFrame) -> pd.DataFrame:
    latest_quarter = activity_df["quarter_code"].max()
    latest_df = activity_df.loc[activity_df["quarter_code"] == latest_quarter].copy()

    latest_df["sales_efficiency_risk_score"] = percentile_rank(
        latest_df["sales_per_floating_population_floor_1000"], ascending=False
    )
    latest_df["ticket_size_risk_score"] = percentile_rank(
        latest_df["sales_per_transaction"], ascending=False
    )
    latest_df["demand_per_service_risk_score"] = percentile_rank(
        latest_df["floating_population_per_service"], ascending=False
    )
    latest_df["service_breadth_risk_score"] = percentile_rank(
        latest_df["unique_service_count"], ascending=False
    )
    latest_df["low_population_instability_score"] = latest_df["low_population_flag"].astype(int) * 100.0
    latest_df["demand_fragility_risk_score"] = clip_score(
        latest_df["sales_efficiency_risk_score"] * 0.35
        + latest_df["ticket_size_risk_score"] * 0.20
        + latest_df["demand_per_service_risk_score"] * 0.25
        + latest_df["service_breadth_risk_score"] * 0.10
        + latest_df["low_population_instability_score"] * 0.10
    )
    latest_df["demand_fragility_grade"] = pd.cut(
        latest_df["demand_fragility_risk_score"],
        bins=[-1, 35, 55, 75, 100],
        labels=["Low", "Moderate", "High", "Very High"],
    ).astype(str)
    latest_df["risk_objection"] = latest_df.apply(make_trade_area_objection, axis=1)

    ordered_columns = [
        "quarter_code",
        "trade_area_type_code",
        "trade_area_type_name",
        "trade_area_code",
        "trade_area_name",
        "total_sales_amount",
        "total_sales_count",
        "unique_service_count",
        "floating_population",
        "low_population_flag",
        "sales_per_floating_population_floor_1000",
        "sales_per_transaction",
        "floating_population_per_service",
        "sales_efficiency_risk_score",
        "ticket_size_risk_score",
        "demand_per_service_risk_score",
        "service_breadth_risk_score",
        "low_population_instability_score",
        "demand_fragility_risk_score",
        "demand_fragility_grade",
        "risk_objection",
    ]
    return latest_df[ordered_columns].sort_values(
        ["demand_fragility_risk_score", "trade_area_code"], ascending=[False, True]
    )


def make_district_objections(row: pd.Series) -> str:
    objections: list[str] = []
    if row["price_burden_risk_score"] >= 70:
        objections.append("pricing looks stretched relative to district peers")
    if row["liquidity_risk_score"] >= 70:
        objections.append("transaction liquidity is weakening")
    if row["competition_risk_score"] >= 70:
        objections.append("merchant saturation is elevated")
    if row["volatility_risk_score"] >= 70:
        objections.append("recent transaction pricing is unstable")
    if bool(row.get("low_sample_flag", False)):
        objections.append("the latest storefront transaction sample is thin")

    if not objections:
        objections.append("no single risk pillar dominates, but the district still requires case-specific review")

    return "; ".join(objections[:3])


def merge_district_acquisition_risk(
    transaction_df: pd.DataFrame,
    competition_df: pd.DataFrame,
) -> pd.DataFrame:
    transaction_df = transaction_df.copy()
    competition_df = competition_df.copy()
    transaction_df["district_code"] = transaction_df["district_code"].astype(str).str.zfill(5)
    competition_df["district_code"] = competition_df["district_code"].astype(str).str.zfill(5)

    merged = transaction_df.merge(
        competition_df,
        how="left",
        on="district_code",
        suffixes=("", "_competition"),
    )
    merged["district_name"] = merged["district_name_kr"].fillna(merged["district_name"])
    merged["overall_acquisition_risk_score"] = clip_score(
        merged["overall_transaction_risk_score"] * 0.55 + merged["competition_risk_score"] * 0.45
    )
    merged["acquisition_risk_grade"] = pd.cut(
        merged["overall_acquisition_risk_score"],
        bins=[-1, 35, 55, 75, 100],
        labels=["Low", "Moderate", "High", "Very High"],
    ).astype(str)
    merged["primary_risk_objections"] = merged.apply(make_district_objections, axis=1)

    ordered_columns = [
        "deal_year_month",
        "district_code",
        "district_name",
        "overall_acquisition_risk_score",
        "acquisition_risk_grade",
        "overall_transaction_risk_score",
        "price_burden_risk_score",
        "liquidity_risk_score",
        "volatility_risk_score",
        "low_sample_flag",
        "sample_reliability",
        "competition_risk_score",
        "competition_risk_grade",
        "food_store_share",
        "stores_per_admin_dong",
        "top_3_small_categories",
        "primary_risk_objections",
        "risk_summary",
    ]
    return merged[ordered_columns].sort_values(
        ["overall_acquisition_risk_score", "district_code"], ascending=[False, True]
    )


def make_candidate_reason(source_row, candidate_row) -> str:
    reasons: list[str] = []
    if candidate_row.overall_acquisition_risk_score < source_row.overall_acquisition_risk_score:
        reasons.append("lower overall acquisition risk")
    if candidate_row.liquidity_risk_score < source_row.liquidity_risk_score:
        reasons.append("stronger transaction liquidity")
    if candidate_row.competition_risk_score < source_row.competition_risk_score:
        reasons.append("lighter merchant saturation")
    return "; ".join(reasons[:3]) if reasons else "better peer balance across current risk pillars"


def safer_candidate_pool(acquisition_df: pd.DataFrame, row) -> pd.DataFrame:
    min_score_improvement = 5.0
    base_filter = (
        (acquisition_df["district_code"] != row.district_code)
        & (acquisition_df["overall_acquisition_risk_score"] <= row.overall_acquisition_risk_score - min_score_improvement)
    )

    if row.acquisition_risk_grade in {"High", "Very High"}:
        safety_filter = acquisition_df["overall_acquisition_risk_score"] <= 55
    elif row.acquisition_risk_grade == "Moderate":
        safety_filter = acquisition_df["overall_acquisition_risk_score"] <= 45
    else:
        safety_filter = acquisition_df["overall_acquisition_risk_score"] < row.overall_acquisition_risk_score

    similarity_filter = (
        ((acquisition_df["food_store_share"] - row.food_store_share).abs() <= 0.08)
        & (acquisition_df["liquidity_risk_score"] <= row.liquidity_risk_score + 10)
    )

    peers = acquisition_df.loc[base_filter & safety_filter & similarity_filter].copy()
    if peers.empty:
        peers = acquisition_df.loc[base_filter & safety_filter].copy()
    return peers


def build_replacement_candidates(acquisition_df: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    candidate_source = acquisition_df.copy()

    for row in acquisition_df.itertuples(index=False):
        peers = safer_candidate_pool(candidate_source, row)

        if peers.empty:
            continue

        peers["similarity_gap"] = (
            (peers["food_store_share"] - row.food_store_share).abs() * 100
            + (peers["competition_risk_score"] - row.competition_risk_score).abs()
            + (peers["overall_acquisition_risk_score"] - row.overall_acquisition_risk_score).abs() * 0.5
        )
        peers = peers.sort_values(["similarity_gap", "overall_acquisition_risk_score"]).head(3)

        for rank, peer in enumerate(peers.itertuples(index=False), start=1):
            rows.append(
                {
                    "source_district_code": row.district_code,
                    "source_district_name": row.district_name,
                    "source_acquisition_risk_score": row.overall_acquisition_risk_score,
                    "candidate_rank": rank,
                    "candidate_district_code": peer.district_code,
                    "candidate_district_name": peer.district_name,
                    "candidate_acquisition_risk_score": peer.overall_acquisition_risk_score,
                    "candidate_liquidity_risk_score": peer.liquidity_risk_score,
                    "candidate_competition_risk_score": peer.competition_risk_score,
                    "candidate_why_better": make_candidate_reason(row, peer),
                }
            )

    return pd.DataFrame(rows)


def make_risk_memo(row: pd.Series) -> str:
    replacement_text = row["replacement_candidates"]
    replacement_text = replacement_text if isinstance(replacement_text, str) and replacement_text else "no lower-risk peer was found yet"
    sample_note = ""
    if bool(row.get("low_sample_flag", False)):
        sample_note = " The latest district reading is based on a thin storefront transaction sample."
    return (
        f"{row['district_name']} posts an acquisition risk score of {row['overall_acquisition_risk_score']:.1f}. "
        f"Primary objections: {row['primary_risk_objections']}. "
        f"Replacement candidates: {replacement_text}.{sample_note}"
    )


def build_district_memo(acquisition_df: pd.DataFrame, candidates_df: pd.DataFrame) -> pd.DataFrame:
    candidate_summary = (
        candidates_df.sort_values(["source_district_code", "candidate_rank"])
        .groupby("source_district_code", dropna=False)
        .agg(replacement_candidates=("candidate_district_name", lambda s: " | ".join(s.astype(str).tolist())))
        .reset_index()
    )
    memo_df = acquisition_df.merge(
        candidate_summary,
        how="left",
        left_on="district_code",
        right_on="source_district_code",
    )
    memo_df["risk_memo"] = memo_df.apply(make_risk_memo, axis=1)
    ordered_columns = [
        "district_code",
        "district_name",
        "overall_acquisition_risk_score",
        "acquisition_risk_grade",
        "sample_reliability",
        "low_sample_flag",
        "primary_risk_objections",
        "replacement_candidates",
        "risk_memo",
    ]
    return memo_df[ordered_columns].sort_values(
        ["overall_acquisition_risk_score", "district_code"], ascending=[False, True]
    )


def main() -> int:
    args = parse_args()
    output_dir = ensure_dir(args.output_dir)

    trade_area_activity_df = pd.read_csv(Path(args.trade_area_activity_input).resolve())
    district_competition_df = pd.read_csv(Path(args.district_competition_input).resolve())
    transaction_risk_path = Path(args.transaction_risk_input).resolve()

    trade_area_demand_df = build_trade_area_demand_fragility(trade_area_activity_df)
    trade_area_demand_df.to_csv(output_dir / "seoul_trade_area_demand_fragility.csv", index=False, encoding="utf-8-sig")
    print("Saved seoul_trade_area_demand_fragility.csv")

    if transaction_risk_path.exists():
        transaction_risk_df = pd.read_csv(transaction_risk_path)
        acquisition_df = merge_district_acquisition_risk(transaction_risk_df, district_competition_df)
        candidates_df = build_replacement_candidates(acquisition_df)
        memo_df = build_district_memo(acquisition_df, candidates_df)

        acquisition_df.to_csv(output_dir / "seoul_district_acquisition_risk.csv", index=False, encoding="utf-8-sig")
        candidates_df.to_csv(output_dir / "seoul_replacement_candidates.csv", index=False, encoding="utf-8-sig")
        memo_df.to_csv(output_dir / "seoul_district_risk_memo.csv", index=False, encoding="utf-8-sig")
        print("Saved seoul_district_acquisition_risk.csv")
        print("Saved seoul_replacement_candidates.csv")
        print("Saved seoul_district_risk_memo.csv")
    else:
        print("Skipped district acquisition outputs because transaction risk input was not found.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
