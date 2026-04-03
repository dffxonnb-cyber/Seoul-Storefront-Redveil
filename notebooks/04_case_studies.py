# %%
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"
DATA_RED_TEAM = PROJECT_ROOT / "data" / "red_team"


def load_csv(name: str) -> pd.DataFrame:
    return pd.read_csv(DATA_PROCESSED / name)


case_df = load_csv("case_study_snapshots.csv")
history_df = pd.read_csv(DATA_PROCESSED / "seoul_transaction_risk_history.csv")
memo_df = pd.read_csv(DATA_RED_TEAM / "seoul_district_red_team_memo.csv")


# %%
case_df[
    [
        "district_name",
        "acquisition_risk_score",
        "acquisition_risk_grade",
        "six_month_price_change_pct",
        "six_month_transaction_change_pct",
        "replacement_candidates",
    ]
].sort_values("acquisition_risk_score", ascending=False)


# %%
selected_district = "서초구"

case_df.loc[
    case_df["district_name"] == selected_district,
    [
        "district_name",
        "primary_red_team_objections",
        "risk_summary",
        "top_3_small_categories",
        "candidate_why_better",
        "field_checks",
    ],
]


# %%
history_df.loc[history_df["district_name_kr"] == selected_district].sort_values(
    "deal_year_month"
)[
    [
        "deal_year_month",
        "transaction_count",
        "median_price_per_sqm_10k_krw",
        "mean_price_per_sqm_10k_krw",
    ]
].tail(12)


# %%
memo_df.loc[memo_df["district_name"] == selected_district]
