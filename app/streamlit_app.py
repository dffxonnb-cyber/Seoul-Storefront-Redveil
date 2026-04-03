from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import streamlit as st


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))


DATA_RED_TEAM = PROJECT_ROOT / "data" / "red_team"
DATA_EXTERNAL = PROJECT_ROOT / "data" / "external" / "processed"
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"


st.set_page_config(
    page_title="Storefront Red Team",
    page_icon=":warning:",
    layout="wide",
)


@st.cache_data
def load_csv(path: Path) -> pd.DataFrame | None:
    if not path.exists():
        return None
    return pd.read_csv(path)


def format_score(value: float | int | None) -> str:
    if pd.isna(value):
        return "-"
    return f"{float(value):.1f}"


def format_pct(value: float | int | None) -> str:
    if pd.isna(value):
        return "-"
    value = float(value)
    sign = "+" if value > 0 else ""
    return f"{sign}{value:.1f}%"


def split_pipe_text(value: str | float | int | None) -> list[str]:
    if value is None or pd.isna(value):
        return []
    return [item.strip() for item in str(value).split("|") if item.strip()]


def split_semicolon_text(value: str | float | int | None) -> list[str]:
    if value is None or pd.isna(value):
        return []
    return [item.strip() for item in str(value).split(";") if item.strip()]


def show_overview(
    district_df: pd.DataFrame | None,
    demand_df: pd.DataFrame | None,
    admin_dong_df: pd.DataFrame | None,
    case_df: pd.DataFrame | None,
) -> None:
    st.title("Storefront Red Team")
    st.caption("A Seoul acquisition red-team tool for small commercial-property decisions.")

    col1, col2, col3 = st.columns(3)
    col1.metric("District memos", len(district_df) if district_df is not None else 0)
    col2.metric("Trade-area demand checks", len(demand_df) if demand_df is not None else 0)
    col3.metric("Admin-dong saturation rows", len(admin_dong_df) if admin_dong_df is not None else 0)

    st.markdown(
        """
        **Product stance**

        - Start from objections, not recommendations
        - Show why the investment thesis may be wrong
        - Compare against lower-risk peers before the user commits
        """
    )
    st.warning(
        "Transaction risk is based on storefront-oriented transactions from `2025-04` to `2026-03`, while the "
        "current trade-area demand data comes from `2024` Seoul files. Treat the combined screen as a red-team "
        "checklist, not as a same-period causal comparison."
    )

    if district_df is not None:
        st.subheader("Immediate red-team queue")
        overview_df = district_df[
            [
                "district_name",
                "overall_acquisition_risk_score",
                "acquisition_risk_grade",
                "primary_red_team_objections",
            ]
        ].sort_values("overall_acquisition_risk_score", ascending=False)
        st.dataframe(overview_df.head(7), use_container_width=True, hide_index=True)

    if case_df is not None:
        st.subheader("Current case studies")
        st.dataframe(
            case_df[
                [
                    "district_name",
                    "acquisition_risk_score",
                    "acquisition_risk_grade",
                    "replacement_candidates",
                ]
            ],
            use_container_width=True,
            hide_index=True,
        )


def show_district_red_team() -> None:
    district_df = load_csv(DATA_RED_TEAM / "seoul_district_acquisition_risk.csv")
    memo_df = load_csv(DATA_RED_TEAM / "seoul_district_red_team_memo.csv")
    candidates_df = load_csv(DATA_RED_TEAM / "seoul_replacement_candidates.csv")
    history_df = load_csv(DATA_PROCESSED / "seoul_transaction_risk_history.csv")

    st.header("District Red Team")
    if district_df is None or memo_df is None:
        st.info(
            "District acquisition memo outputs are not available yet. "
            "Run the transaction pipeline and then build_red_team_outputs.py."
        )
        return

    leaderboard_col, report_col = st.columns([0.95, 1.05])
    with leaderboard_col:
        st.subheader("Highest-Risk Districts")
        st.dataframe(
            district_df[
                [
                    "district_name",
                    "overall_acquisition_risk_score",
                    "acquisition_risk_grade",
                    "price_burden_risk_score",
                    "liquidity_risk_score",
                    "competition_risk_score",
                ]
            ].sort_values("overall_acquisition_risk_score", ascending=False),
            use_container_width=True,
            hide_index=True,
        )

    selected_district = report_col.selectbox(
        "District memo",
        district_df.sort_values("overall_acquisition_risk_score", ascending=False)["district_name"].tolist(),
    )
    memo_row = memo_df.loc[memo_df["district_name"] == selected_district].iloc[0]
    district_row = district_df.loc[district_df["district_name"] == selected_district].iloc[0]
    objections = split_semicolon_text(memo_row["primary_red_team_objections"])

    with report_col:
        st.subheader(f"{selected_district} acquisition memo")
        score_col1, score_col2, score_col3, score_col4 = st.columns(4)
        score_col1.metric("Overall risk", format_score(district_row["overall_acquisition_risk_score"]))
        score_col2.metric("Transaction risk", format_score(district_row["overall_transaction_risk_score"]))
        score_col3.metric("Competition risk", format_score(district_row["competition_risk_score"]))
        score_col4.metric("Grade", district_row["acquisition_risk_grade"])

        if bool(memo_row["low_sample_flag"]):
            st.warning(
                f"{selected_district} has a `{memo_row['sample_reliability']}` reliability flag because the latest "
                "storefront transaction month is based on a thin sample."
            )

        st.markdown("**Red-team memo**")
        st.write(memo_row["red_team_memo"])

        st.markdown("**Top objections**")
        if objections:
            for objection in objections:
                st.write(f"- {objection}")
        else:
            st.write("- no single dominant objection was generated")

        evidence_col, action_col = st.columns([1.1, 0.9])
        with evidence_col:
            st.markdown("**Risk evidence**")
            evidence_df = pd.DataFrame(
                [
                    {"pillar": "Price burden", "score": district_row["price_burden_risk_score"]},
                    {"pillar": "Liquidity", "score": district_row["liquidity_risk_score"]},
                    {"pillar": "Volatility", "score": district_row["volatility_risk_score"]},
                    {"pillar": "Competition", "score": district_row["competition_risk_score"]},
                    {"pillar": "Sample reliability", "score": district_row["sample_reliability"]},
                ]
            )
            st.dataframe(evidence_df, use_container_width=True, hide_index=True)

            st.markdown("**Merchant structure**")
            st.write(district_row["top_3_small_categories"])

        with action_col:
            st.markdown("**Field checklist**")
            for item in objections:
                if "pricing" in item:
                    st.write("- ask brokers for recent closed-deal comps, not only current asking prices")
                elif "saturation" in item:
                    st.write("- walk the busiest admin-dong strips and count duplicate tenant formats")
                elif "unstable" in item:
                    st.write("- separate large building trades from strata-unit trades before underwriting")
                elif "liquidity" in item:
                    st.write("- check whether listing inventory is rising faster than closed transactions")
            if not objections:
                st.write("- review tenant replacement speed and closed-deal depth before bidding")

        if history_df is not None:
            district_history = history_df.loc[
                history_df["district_name_kr"] == selected_district
            ].sort_values("deal_year_month")
            if not district_history.empty:
                st.markdown("**Recent transaction history**")
                st.dataframe(
                    district_history[
                        [
                            "deal_year_month",
                            "transaction_count",
                            "median_price_per_sqm_10k_krw",
                            "mean_price_per_sqm_10k_krw",
                        ]
                    ].tail(6),
                    use_container_width=True,
                    hide_index=True,
                )

        if candidates_df is not None:
            candidate_rows = candidates_df.loc[candidates_df["source_district_name"] == selected_district]
            if not candidate_rows.empty:
                st.markdown("**Replacement candidates**")
                st.dataframe(
                    candidate_rows[
                        [
                            "candidate_rank",
                            "candidate_district_name",
                            "candidate_acquisition_risk_score",
                            "candidate_why_better",
                        ]
                    ],
                    use_container_width=True,
                    hide_index=True,
                )


def show_case_studies() -> None:
    case_df = load_csv(DATA_PROCESSED / "case_study_snapshots.csv")
    if case_df is None:
        st.header("Case Studies")
        st.info("Case-study artifacts are not available yet. Run build_case_study_materials.py first.")
        return

    st.header("Case Studies")
    st.caption("Three manual review candidates generated from the latest district acquisition output.")

    selected_district = st.selectbox(
        "Case study district",
        case_df.sort_values("acquisition_risk_score", ascending=False)["district_name"].tolist(),
    )
    row = case_df.loc[case_df["district_name"] == selected_district].iloc[0]

    top_col1, top_col2, top_col3 = st.columns(3)
    top_col1.metric("Acquisition risk", format_score(row["acquisition_risk_score"]))
    top_col2.metric("6m price change", format_pct(row["six_month_price_change_pct"]))
    top_col3.metric("6m transaction change", format_pct(row["six_month_transaction_change_pct"]))

    if bool(row["low_sample_flag"]):
        st.warning(
            f"{selected_district} is a `{row['sample_reliability']}` reliability case because the latest storefront "
            "transaction month has a thin sample."
        )

    st.markdown("**Why this district is a strong case study**")
    st.write(row["risk_summary"])

    left, right = st.columns([1.0, 1.0])
    with left:
        st.markdown("**Primary objections**")
        for item in split_semicolon_text(row["primary_red_team_objections"]):
            st.write(f"- {item}")

        st.markdown("**Merchant structure**")
        st.write(row["top_3_small_categories"])

    with right:
        st.markdown("**Replacement candidates**")
        for item in split_pipe_text(row["replacement_candidates"]):
            st.write(f"- {item}")

        st.markdown("**Why the replacements are safer**")
        for item in split_pipe_text(row["candidate_why_better"]):
            st.write(f"- {item}")

    st.markdown("**Field checks before underwriting**")
    for item in split_semicolon_text(row["field_checks"]):
        st.write(f"- {item}")


def show_trade_area_demand() -> None:
    demand_df = load_csv(DATA_RED_TEAM / "seoul_trade_area_demand_fragility.csv")
    st.header("Trade-Area Demand Fragility")
    if demand_df is None:
        st.warning("Demand fragility output was not found.")
        return

    st.info(
        "Demand fragility is based on the latest quarter available in the current Seoul trade-area files "
        "(`2024 Q4` in this workspace). Compare it with transaction risk as a structural signal, not a same-month read."
    )

    col1, col2 = st.columns([0.7, 0.3])
    with col2:
        trade_area_type = st.multiselect(
            "Trade-area type",
            sorted(demand_df["trade_area_type_name"].dropna().unique().tolist()),
            default=[],
        )
        grade_filter = st.multiselect(
            "Risk grade",
            ["Very High", "High", "Moderate", "Low"],
            default=["Very High", "High"],
        )

    filtered = demand_df.copy()
    if trade_area_type:
        filtered = filtered.loc[filtered["trade_area_type_name"].isin(trade_area_type)]
    if grade_filter:
        filtered = filtered.loc[filtered["demand_fragility_grade"].isin(grade_filter)]

    with col1:
        st.dataframe(
            filtered[
                [
                    "trade_area_type_name",
                    "trade_area_name",
                    "demand_fragility_risk_score",
                    "demand_fragility_grade",
                    "sales_per_floating_population_floor_1000",
                    "sales_per_transaction",
                    "red_team_objection",
                ]
            ].sort_values("demand_fragility_risk_score", ascending=False),
            use_container_width=True,
            hide_index=True,
        )


def show_admin_dong_saturation() -> None:
    dong_df = load_csv(DATA_EXTERNAL / "seoul_store_competition_by_admin_dong.csv")
    district_df = load_csv(DATA_EXTERNAL / "seoul_store_competition_by_district.csv")
    st.header("Admin-Dong Saturation")

    if dong_df is None or district_df is None:
        st.warning("Competition outputs were not found.")
        return

    district_name = st.selectbox(
        "District",
        district_df.sort_values("competition_risk_score", ascending=False)["district_name"].tolist(),
    )
    district_meta = district_df.loc[district_df["district_name"] == district_name].iloc[0]
    district_dong_df = dong_df.loc[dong_df["district_name"] == district_name].sort_values(
        "total_store_count",
        ascending=False,
    )

    col1, col2, col3 = st.columns(3)
    col1.metric("Competition risk", format_score(district_meta["competition_risk_score"]))
    col2.metric("Food-store share", f"{district_meta['food_store_share']:.1%}")
    col3.metric("Stores per admin dong", format_score(district_meta["stores_per_admin_dong"]))

    st.dataframe(
        district_dong_df[
            ["admin_dong_name", "total_store_count", "food_store_share", "top_3_small_categories"]
        ],
        use_container_width=True,
        hide_index=True,
    )


def main() -> None:
    district_df = load_csv(DATA_RED_TEAM / "seoul_district_acquisition_risk.csv")
    demand_df = load_csv(DATA_RED_TEAM / "seoul_trade_area_demand_fragility.csv")
    admin_dong_df = load_csv(DATA_EXTERNAL / "seoul_store_competition_by_admin_dong.csv")
    case_df = load_csv(DATA_PROCESSED / "case_study_snapshots.csv")

    overview_tab, district_tab, case_tab, demand_tab, dong_tab = st.tabs(
        ["Overview", "District Red Team", "Case Studies", "Demand Fragility", "Admin-Dong Saturation"]
    )
    with overview_tab:
        show_overview(district_df, demand_df, admin_dong_df, case_df)
    with district_tab:
        show_district_red_team()
    with case_tab:
        show_case_studies()
    with demand_tab:
        show_trade_area_demand()
    with dong_tab:
        show_admin_dong_saturation()


if __name__ == "__main__":
    main()
