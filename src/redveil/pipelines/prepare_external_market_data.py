from __future__ import annotations

import argparse
import struct
import sys
from collections import Counter, defaultdict
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
    raw_root = root / "data" / "external" / "raw"
    processed_root = root / "data" / "external" / "processed"

    parser = argparse.ArgumentParser(
        description="Prepare downloaded Seoul market datasets and build competition risk outputs."
    )
    parser.add_argument(
        "--sales-input",
        default=str(raw_root / "seoul_sales_2024.csv"),
        help="Path to the Seoul estimated sales CSV.",
    )
    parser.add_argument(
        "--population-input",
        default=str(raw_root / "seoul_floating_population.csv"),
        help="Path to the Seoul floating population CSV.",
    )
    parser.add_argument(
        "--attractors-input",
        default=str(raw_root / "seoul_attractors_hinterland.csv"),
        help="Path to the Seoul attractor facilities CSV.",
    )
    parser.add_argument(
        "--store-input",
        default=str(raw_root / "seoul_store_info" / "seoul_store_info_202512.csv"),
        help="Path to the Seoul store information CSV.",
    )
    parser.add_argument(
        "--dong-dbf-input",
        default=str(raw_root / "seoul_trade_area_dong" / "seoul_trade_area_dong.dbf"),
        help="Path to the admin-dong DBF reference copied from the shapefile bundle.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(processed_root),
        help="Directory for processed outputs.",
    )
    return parser.parse_args()


def ensure_dir(path_str: str) -> Path:
    path = Path(path_str).resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def build_admin_dong_reference(dbf_path: Path) -> pd.DataFrame:
    fields: list[tuple[str, str, int]] = []
    rows: list[dict[str, str]] = []

    with dbf_path.open("rb") as handle:
        header = handle.read(32)
        num_records = struct.unpack("<I", header[4:8])[0]
        header_len = struct.unpack("<H", header[8:10])[0]
        record_len = struct.unpack("<H", header[10:12])[0]
        num_fields = (header_len - 33) // 32

        handle.seek(32)
        for _ in range(num_fields):
            desc = handle.read(32)
            if desc[0] == 0x0D:
                break
            fields.append(
                (
                    desc[:11].split(b"\x00", 1)[0].decode("ascii", errors="ignore"),
                    chr(desc[11]),
                    desc[16],
                )
            )

        handle.seek(header_len)
        for _ in range(num_records):
            record = handle.read(record_len)
            if not record or record[0] == 0x2A:
                continue

            row: dict[str, str] = {}
            pos = 1
            for name, _, flen in fields:
                raw = record[pos : pos + flen]
                pos += flen
                row[name] = raw.decode("utf-8", errors="ignore").strip()
            rows.append(row)

    df = pd.DataFrame(rows).rename(
        columns={
            "ADSTRD_CD": "admin_dong_code",
            "ADSTRD_NM": "admin_dong_name",
            "XCNTS_VALU": "x_coord",
            "YDNTS_VALU": "y_coord",
            "RELM_AR": "area_sqm",
        }
    )
    for col in ["x_coord", "y_coord", "area_sqm"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["admin_dong_code"] = df["admin_dong_code"].astype(str).str.zfill(8)
    return df


def build_trade_area_activity(sales_path: Path, population_path: Path) -> tuple[pd.DataFrame, pd.DataFrame]:
    sales_df = pd.read_csv(sales_path, encoding="cp949", usecols=list(range(9)))
    sales_df.columns = [
        "quarter_code",
        "trade_area_type_code",
        "trade_area_type_name",
        "trade_area_code",
        "trade_area_name",
        "service_code",
        "service_name",
        "monthly_sales_amount",
        "monthly_sales_count",
    ]

    population_df = pd.read_csv(population_path, encoding="cp949", usecols=[0, 1, 2, 3, 4, 5])
    population_df.columns = [
        "quarter_code",
        "trade_area_type_code",
        "trade_area_type_name",
        "trade_area_code",
        "trade_area_name",
        "floating_population",
    ]

    sales_agg = (
        sales_df.groupby(
            ["quarter_code", "trade_area_type_code", "trade_area_type_name", "trade_area_code", "trade_area_name"],
            dropna=False,
        )
        .agg(
            total_sales_amount=("monthly_sales_amount", "sum"),
            total_sales_count=("monthly_sales_count", "sum"),
            unique_service_count=("service_code", "nunique"),
        )
        .reset_index()
    )

    latest_quarter = sales_df["quarter_code"].max()
    latest_top_service = (
        sales_df.loc[sales_df["quarter_code"] == latest_quarter]
        .sort_values(["trade_area_code", "monthly_sales_amount", "monthly_sales_count"], ascending=[True, False, False])
        .drop_duplicates(subset=["trade_area_code"])
        .loc[:, ["quarter_code", "trade_area_code", "trade_area_name", "service_code", "service_name", "monthly_sales_amount"]]
        .rename(
            columns={
                "service_code": "top_service_code",
                "service_name": "top_service_name",
                "monthly_sales_amount": "top_service_sales_amount",
            }
        )
    )

    activity_df = sales_agg.merge(
        population_df,
        on=["quarter_code", "trade_area_type_code", "trade_area_type_name", "trade_area_code", "trade_area_name"],
        how="left",
    )
    activity_df["floating_population_floor_1000"] = activity_df["floating_population"].clip(lower=1000)
    activity_df["low_population_flag"] = activity_df["floating_population"].fillna(0) < 1000
    activity_df["sales_per_floating_population"] = (
        activity_df["total_sales_amount"] / activity_df["floating_population"]
    )
    activity_df["sales_per_floating_population_floor_1000"] = (
        activity_df["total_sales_amount"] / activity_df["floating_population_floor_1000"]
    )
    activity_df["sales_per_transaction"] = activity_df["total_sales_amount"] / activity_df["total_sales_count"]
    activity_df["floating_population_per_service"] = (
        activity_df["floating_population"] / activity_df["unique_service_count"]
    )
    return activity_df, latest_top_service


def build_attractors(attractors_path: Path) -> pd.DataFrame:
    attractors_df = pd.read_csv(
        attractors_path,
        encoding="cp949",
        usecols=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 22, 23, 24],
    )
    attractors_df.columns = [
        "quarter_code",
        "trade_area_type_code",
        "trade_area_type_name",
        "hinterland_code",
        "hinterland_name",
        "facility_count",
        "government_office_count",
        "bank_count",
        "general_hospital_count",
        "hospital_count",
        "pharmacy_count",
        "bus_terminal_count",
        "subway_station_count",
        "bus_stop_count",
    ]
    return attractors_df


def build_store_competition(store_path: Path) -> tuple[pd.DataFrame, pd.DataFrame]:
    district_totals: defaultdict[tuple[str, str], int] = defaultdict(int)
    district_food_totals: defaultdict[tuple[str, str], int] = defaultdict(int)
    district_dongs: defaultdict[tuple[str, str], set[tuple[str, str]]] = defaultdict(set)
    district_subcategory_counts: defaultdict[tuple[str, str], Counter[str]] = defaultdict(Counter)

    dong_totals: defaultdict[tuple[str, str, str, str], int] = defaultdict(int)
    dong_food_totals: defaultdict[tuple[str, str, str, str], int] = defaultdict(int)
    dong_subcategory_counts: defaultdict[tuple[str, str, str, str], Counter[str]] = defaultdict(Counter)

    reader = pd.read_csv(
        store_path,
        encoding="utf-8-sig",
        usecols=[4, 6, 8, 10, 13, 14, 15, 16],
        chunksize=200000,
    )

    for chunk in reader:
        chunk.columns = [
            "major_category_name",
            "middle_category_name",
            "small_category_name",
            "ksic_name",
            "district_code",
            "district_name",
            "admin_dong_code",
            "admin_dong_name",
        ]
        chunk["major_category_name"] = chunk["major_category_name"].fillna("Unknown")
        chunk["small_category_name"] = chunk["small_category_name"].fillna("Unknown")
        chunk["district_code"] = chunk["district_code"].astype(str).str.zfill(5)
        chunk["admin_dong_code"] = chunk["admin_dong_code"].astype(str).str.zfill(8)
        chunk["district_name"] = chunk["district_name"].fillna("Unknown")
        chunk["admin_dong_name"] = chunk["admin_dong_name"].fillna("Unknown")

        district_group = (
            chunk.groupby(["district_code", "district_name"], dropna=False)
            .agg(store_count=("small_category_name", "size"))
            .reset_index()
        )
        for row in district_group.itertuples(index=False):
            district_totals[(row.district_code, row.district_name)] += int(row.store_count)

        food_group = (
            chunk.loc[chunk["major_category_name"] == "음식"]
            .groupby(["district_code", "district_name"], dropna=False)
            .agg(store_count=("small_category_name", "size"))
            .reset_index()
        )
        for row in food_group.itertuples(index=False):
            district_food_totals[(row.district_code, row.district_name)] += int(row.store_count)

        for row in chunk[["district_code", "district_name", "admin_dong_code", "admin_dong_name"]].drop_duplicates().itertuples(index=False):
            district_dongs[(row.district_code, row.district_name)].add((row.admin_dong_code, row.admin_dong_name))

        district_subcats = (
            chunk.groupby(["district_code", "district_name", "small_category_name"], dropna=False)
            .agg(store_count=("major_category_name", "size"))
            .reset_index()
        )
        for row in district_subcats.itertuples(index=False):
            district_subcategory_counts[(row.district_code, row.district_name)][row.small_category_name] += int(row.store_count)

        dong_group = (
            chunk.groupby(["district_code", "district_name", "admin_dong_code", "admin_dong_name"], dropna=False)
            .agg(store_count=("small_category_name", "size"))
            .reset_index()
        )
        for row in dong_group.itertuples(index=False):
            dong_totals[(row.district_code, row.district_name, row.admin_dong_code, row.admin_dong_name)] += int(row.store_count)

        dong_food_group = (
            chunk.loc[chunk["major_category_name"] == "음식"]
            .groupby(["district_code", "district_name", "admin_dong_code", "admin_dong_name"], dropna=False)
            .agg(store_count=("small_category_name", "size"))
            .reset_index()
        )
        for row in dong_food_group.itertuples(index=False):
            dong_food_totals[(row.district_code, row.district_name, row.admin_dong_code, row.admin_dong_name)] += int(row.store_count)

        dong_subcats = (
            chunk.groupby(
                ["district_code", "district_name", "admin_dong_code", "admin_dong_name", "small_category_name"],
                dropna=False,
            )
            .agg(store_count=("major_category_name", "size"))
            .reset_index()
        )
        for row in dong_subcats.itertuples(index=False):
            dong_subcategory_counts[(row.district_code, row.district_name, row.admin_dong_code, row.admin_dong_name)][row.small_category_name] += int(row.store_count)

    district_rows: list[dict[str, object]] = []
    for (district_code, district_name), total_store_count in district_totals.items():
        subcats = district_subcategory_counts[(district_code, district_name)]
        top3 = subcats.most_common(3)
        top_share = (top3[0][1] / total_store_count) if top3 else 0.0
        hhi = sum((count / total_store_count) ** 2 for count in subcats.values()) * 100
        district_rows.append(
            {
                "district_code": district_code,
                "district_name": district_name,
                "total_store_count": total_store_count,
                "food_store_count": district_food_totals[(district_code, district_name)],
                "food_store_share": district_food_totals[(district_code, district_name)] / total_store_count,
                "admin_dong_count": len(district_dongs[(district_code, district_name)]),
                "stores_per_admin_dong": total_store_count / max(len(district_dongs[(district_code, district_name)]), 1),
                "unique_small_category_count": len(subcats),
                "top_small_category_share": top_share,
                "small_category_hhi": hhi,
                "top_3_small_categories": " | ".join(f"{name}:{count}" for name, count in top3),
            }
        )

    district_df = pd.DataFrame(district_rows).sort_values("district_code").reset_index(drop=True)
    district_df["saturation_score"] = percentile_rank(district_df["total_store_count"], ascending=True)
    district_df["food_specialization_score"] = percentile_rank(district_df["food_store_share"], ascending=True)
    district_df["concentration_score"] = clip_score(
        percentile_rank(district_df["top_small_category_share"], ascending=True) * 0.5
        + percentile_rank(district_df["small_category_hhi"], ascending=True) * 0.5
    )
    district_df["competition_risk_score"] = clip_score(
        district_df["saturation_score"] * 0.45
        + district_df["food_specialization_score"] * 0.25
        + district_df["concentration_score"] * 0.30
    )
    district_df["competition_risk_grade"] = pd.cut(
        district_df["competition_risk_score"],
        bins=[-1, 35, 55, 75, 100],
        labels=["Low", "Moderate", "High", "Very High"],
    ).astype(str)

    dong_rows: list[dict[str, object]] = []
    for key, total_store_count in dong_totals.items():
        district_code, district_name, admin_dong_code, admin_dong_name = key
        subcats = dong_subcategory_counts[key]
        top3 = subcats.most_common(3)
        top_share = (top3[0][1] / total_store_count) if top3 else 0.0
        hhi = sum((count / total_store_count) ** 2 for count in subcats.values()) * 100
        dong_rows.append(
            {
                "district_code": district_code,
                "district_name": district_name,
                "admin_dong_code": admin_dong_code,
                "admin_dong_name": admin_dong_name,
                "total_store_count": total_store_count,
                "food_store_count": dong_food_totals[key],
                "food_store_share": dong_food_totals[key] / total_store_count,
                "unique_small_category_count": len(subcats),
                "top_small_category_share": top_share,
                "small_category_hhi": hhi,
                "top_3_small_categories": " | ".join(f"{name}:{count}" for name, count in top3),
            }
        )

    dong_df = pd.DataFrame(dong_rows).sort_values(["district_code", "admin_dong_code"]).reset_index(drop=True)
    return district_df, dong_df


def maybe_merge_transaction_risk(root: Path, district_competition_df: pd.DataFrame) -> pd.DataFrame | None:
    transaction_path = root / "data" / "processed" / "seoul_transaction_risk_scores.csv"
    if not transaction_path.exists():
        return None

    transaction_df = pd.read_csv(transaction_path, dtype={"district_code": str})
    merged = transaction_df.merge(
        district_competition_df[
            [
                "district_code",
                "district_name",
                "competition_risk_score",
                "competition_risk_grade",
                "top_3_small_categories",
            ]
        ],
        how="left",
        on="district_code",
    )
    merged["overall_investment_risk_v1"] = clip_score(
        merged["overall_transaction_risk_score"] * 0.6 + merged["competition_risk_score"] * 0.4
    )
    merged["investment_risk_grade_v1"] = pd.cut(
        merged["overall_investment_risk_v1"],
        bins=[-1, 35, 55, 75, 100],
        labels=["Low", "Moderate", "High", "Very High"],
    ).astype(str)
    return merged


def main() -> int:
    args = parse_args()
    root = project_root()
    output_dir = ensure_dir(args.output_dir)

    dong_reference_df = build_admin_dong_reference(Path(args.dong_dbf_input).resolve())
    trade_area_activity_df, latest_top_service_df = build_trade_area_activity(
        Path(args.sales_input).resolve(),
        Path(args.population_input).resolve(),
    )
    attractors_df = build_attractors(Path(args.attractors_input).resolve())
    district_competition_df, dong_competition_df = build_store_competition(Path(args.store_input).resolve())
    dong_competition_df = dong_competition_df.merge(dong_reference_df, how="left", on="admin_dong_code")
    if "admin_dong_name_x" in dong_competition_df.columns:
        dong_competition_df = dong_competition_df.rename(columns={"admin_dong_name_x": "admin_dong_name"})
    if "admin_dong_name_y" in dong_competition_df.columns:
        dong_competition_df = dong_competition_df.drop(columns=["admin_dong_name_y"])

    investment_risk_df = maybe_merge_transaction_risk(root, district_competition_df)

    dong_reference_df.to_csv(output_dir / "seoul_admin_dong_reference.csv", index=False, encoding="utf-8-sig")
    trade_area_activity_df.to_csv(output_dir / "seoul_trade_area_activity_2024.csv", index=False, encoding="utf-8-sig")
    latest_top_service_df.to_csv(output_dir / "seoul_trade_area_top_service_latest.csv", index=False, encoding="utf-8-sig")
    attractors_df.to_csv(output_dir / "seoul_hinterland_attractors.csv", index=False, encoding="utf-8-sig")
    district_competition_df.to_csv(output_dir / "seoul_store_competition_by_district.csv", index=False, encoding="utf-8-sig")
    dong_competition_df.to_csv(output_dir / "seoul_store_competition_by_admin_dong.csv", index=False, encoding="utf-8-sig")

    if investment_risk_df is not None:
        investment_risk_df.to_csv(output_dir / "seoul_district_investment_risk_v1.csv", index=False, encoding="utf-8-sig")
        print("Saved seoul_district_investment_risk_v1.csv")
    else:
        print("Skipped integrated investment risk merge because seoul_transaction_risk_scores.csv was not found.")

    print("Saved seoul_admin_dong_reference.csv")
    print("Saved seoul_trade_area_activity_2024.csv")
    print("Saved seoul_trade_area_top_service_latest.csv")
    print("Saved seoul_hinterland_attractors.csv")
    print("Saved seoul_store_competition_by_district.csv")
    print("Saved seoul_store_competition_by_admin_dong.csv")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
