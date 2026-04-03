from __future__ import annotations

import argparse
import os
import sys
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable

import pandas as pd
import requests


PROJECT_ROOT = Path(__file__).resolve().parents[3]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from redveil.utils.paths import project_root


API_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcNrgTrade/getRTMSDataSvcNrgTrade"
DEFAULT_NUM_ROWS = 1000

SEOUL_DISTRICT_CODES = {
    "11110": "Jongno-gu",
    "11140": "Jung-gu",
    "11170": "Yongsan-gu",
    "11200": "Seongdong-gu",
    "11215": "Gwangjin-gu",
    "11230": "Dongdaemun-gu",
    "11260": "Jungnang-gu",
    "11290": "Seongbuk-gu",
    "11305": "Gangbuk-gu",
    "11320": "Dobong-gu",
    "11350": "Nowon-gu",
    "11380": "Eunpyeong-gu",
    "11410": "Seodaemun-gu",
    "11440": "Mapo-gu",
    "11470": "Yangcheon-gu",
    "11500": "Gangseo-gu",
    "11530": "Guro-gu",
    "11545": "Geumcheon-gu",
    "11560": "Yeongdeungpo-gu",
    "11590": "Dongjak-gu",
    "11620": "Gwanak-gu",
    "11650": "Seocho-gu",
    "11680": "Gangnam-gu",
    "11710": "Songpa-gu",
    "11740": "Gangdong-gu",
}


@dataclass
class ApiResponse:
    items: list[dict[str, str]]
    total_count: int
    num_rows: int
    page_no: int


def parse_args() -> argparse.Namespace:
    root = project_root()
    parser = argparse.ArgumentParser(
        description="Collect Seoul commercial real-estate transactions from the MOLIT API."
    )
    parser.add_argument(
        "--service-key",
        default=os.getenv("PUBLIC_DATA_API_KEY"),
        help="Data.go.kr encoding service key. Falls back to PUBLIC_DATA_API_KEY.",
    )
    parser.add_argument(
        "--months-back",
        type=int,
        default=12,
        help="Number of months to collect, counting backward from --end-month.",
    )
    parser.add_argument(
        "--end-month",
        help="Last month to include in YYYYMM. Defaults to the previous calendar month.",
    )
    parser.add_argument(
        "--sleep-seconds",
        type=float,
        default=0.15,
        help="Pause between API calls to reduce throttling risk.",
    )
    parser.add_argument(
        "--raw-output",
        default=str(root / "data" / "raw" / "molit_commercial_sales" / "seoul_commercial_sales.csv"),
        help="Path for the row-level CSV export.",
    )
    parser.add_argument(
        "--summary-output",
        default=str(root / "data" / "processed" / "seoul_commercial_sales_monthly_summary.csv"),
        help="Path for the monthly district summary CSV export.",
    )
    return parser.parse_args()


def previous_month(reference: date | None = None) -> str:
    reference = reference or date.today()
    year = reference.year
    month = reference.month - 1
    if month == 0:
        year -= 1
        month = 12
    return f"{year}{month:02d}"


def build_month_range(end_month: str, months_back: int) -> list[str]:
    if len(end_month) != 6 or not end_month.isdigit():
        raise ValueError("--end-month must be in YYYYMM format.")
    if months_back < 1:
        raise ValueError("--months-back must be at least 1.")

    year = int(end_month[:4])
    month = int(end_month[4:])
    months: list[str] = []
    for _ in range(months_back):
        months.append(f"{year}{month:02d}")
        month -= 1
        if month == 0:
            year -= 1
            month = 12

    months.reverse()
    return months


def text_or_blank(node: ET.Element | None, tag_name: str) -> str:
    if node is None:
        return ""
    child = node.find(tag_name)
    return child.text.strip() if child is not None and child.text else ""


def parse_xml_response(xml_text: str) -> ApiResponse:
    root = ET.fromstring(xml_text)
    header = root.find("header")
    result_code = text_or_blank(header, "resultCode")
    result_msg = text_or_blank(header, "resultMsg")

    if result_code not in {"00", "000"}:
        raise RuntimeError(f"API error {result_code}: {result_msg}")

    body = root.find("body")
    items_parent = body.find("items") if body is not None else None
    item_nodes = items_parent.findall("item") if items_parent is not None else []
    items: list[dict[str, str]] = []

    for item_node in item_nodes:
        record: dict[str, str] = {}
        for child in item_node:
            record[child.tag] = child.text.strip() if child.text else ""
        items.append(record)

    total_count = int(text_or_blank(body, "totalCount") or 0)
    num_rows = int(text_or_blank(body, "numOfRows") or 0)
    page_no = int(text_or_blank(body, "pageNo") or 1)
    return ApiResponse(items=items, total_count=total_count, num_rows=num_rows, page_no=page_no)


def fetch_page(
    session: requests.Session,
    service_key: str,
    lawd_cd: str,
    deal_ymd: str,
    page_no: int = 1,
    num_rows: int = DEFAULT_NUM_ROWS,
    timeout: int = 30,
) -> ApiResponse:
    params = {
        "serviceKey": service_key,
        "LAWD_CD": lawd_cd,
        "DEAL_YMD": deal_ymd,
        "pageNo": page_no,
        "numOfRows": num_rows,
    }
    response = session.get(API_URL, params=params, timeout=timeout)
    response.raise_for_status()
    return parse_xml_response(response.text)


def fetch_all_pages(
    session: requests.Session,
    service_key: str,
    lawd_cd: str,
    deal_ymd: str,
    sleep_seconds: float,
) -> list[dict[str, str]]:
    first_page = fetch_page(session, service_key, lawd_cd, deal_ymd, page_no=1)
    records = list(first_page.items)

    if first_page.total_count <= first_page.num_rows:
        return records

    total_pages = (first_page.total_count + first_page.num_rows - 1) // first_page.num_rows
    for page_no in range(2, total_pages + 1):
        time.sleep(sleep_seconds)
        next_page = fetch_page(session, service_key, lawd_cd, deal_ymd, page_no=page_no)
        records.extend(next_page.items)

    return records


def to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(",", "", regex=False).str.strip(),
        errors="coerce",
    )


def prepare_dataframe(records: Iterable[dict[str, str]]) -> pd.DataFrame:
    df = pd.DataFrame(records)
    if df.empty:
        return df

    df["deal_amount_10k_krw"] = to_numeric(df["dealAmount"])
    df["building_area_sqm"] = to_numeric(df["buildingAr"])
    df["land_area_sqm"] = to_numeric(df["plottageAr"])
    df["floor_num"] = to_numeric(df["floor"])
    df["build_year_num"] = to_numeric(df["buildYear"])
    df["deal_year_month"] = (
        df["dealYear"].astype(str).str.zfill(4) + df["dealMonth"].astype(str).str.zfill(2)
    )
    df["deal_date"] = pd.to_datetime(
        df["dealYear"].astype(str).str.zfill(4)
        + "-"
        + df["dealMonth"].astype(str).str.zfill(2)
        + "-"
        + df["dealDay"].astype(str).str.zfill(2),
        errors="coerce",
    )
    df["price_per_sqm_10k_krw"] = df["deal_amount_10k_krw"] / df["building_area_sqm"]
    df["district_code"] = df["sggCd"].astype(str).str.zfill(5)
    df["district_name_kr"] = df["sggNm"]
    df["district_name_en"] = df["district_code"].map(SEOUL_DISTRICT_CODES)

    ordered_columns = [
        "district_code",
        "district_name_kr",
        "district_name_en",
        "deal_year_month",
        "deal_date",
        "sggNm",
        "umdNm",
        "buildingType",
        "buildingUse",
        "landUse",
        "dealAmount",
        "deal_amount_10k_krw",
        "buildingAr",
        "building_area_sqm",
        "plottageAr",
        "land_area_sqm",
        "price_per_sqm_10k_krw",
        "floor",
        "floor_num",
        "buildYear",
        "build_year_num",
        "jibun",
        "shareDealingType",
        "cdealType",
        "cdealDay",
        "dealingGbn",
        "estateAgentSggNm",
        "slerGbn",
        "buyerGbn",
    ]
    extra_columns = [col for col in df.columns if col not in ordered_columns]
    return df[ordered_columns + extra_columns]


def build_summary(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df

    summary = (
        df.groupby(
            ["deal_year_month", "district_code", "district_name_kr", "district_name_en"],
            dropna=False,
        )
        .agg(
            transaction_count=("deal_amount_10k_krw", "size"),
            median_deal_amount_10k_krw=("deal_amount_10k_krw", "median"),
            mean_deal_amount_10k_krw=("deal_amount_10k_krw", "mean"),
            median_price_per_sqm_10k_krw=("price_per_sqm_10k_krw", "median"),
            mean_price_per_sqm_10k_krw=("price_per_sqm_10k_krw", "mean"),
            median_building_area_sqm=("building_area_sqm", "median"),
            median_build_year=("build_year_num", "median"),
        )
        .reset_index()
        .sort_values(["deal_year_month", "district_code"])
    )

    summary["transaction_count"] = summary["transaction_count"].astype(int)
    return summary


def ensure_parent(path_str: str) -> Path:
    path = Path(path_str).resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def main() -> int:
    args = parse_args()
    service_key = args.service_key
    if not service_key:
        print("Missing service key. Pass --service-key or set PUBLIC_DATA_API_KEY.", file=sys.stderr)
        return 1

    end_month = args.end_month or previous_month()
    target_months = build_month_range(end_month=end_month, months_back=args.months_back)
    all_records: list[dict[str, str]] = []
    success_calls = 0
    failed_calls = 0
    failure_examples: list[str] = []

    session = requests.Session()
    session.headers.update({"User-Agent": "commercial-investment-risk/0.1"})

    print(f"Collecting Seoul commercial sales for months: {', '.join(target_months)}")
    for month in target_months:
        for district_code, district_name in SEOUL_DISTRICT_CODES.items():
            print(f"[fetch] {month} {district_code} {district_name}")
            try:
                records = fetch_all_pages(
                    session=session,
                    service_key=service_key,
                    lawd_cd=district_code,
                    deal_ymd=month,
                    sleep_seconds=args.sleep_seconds,
                )
            except Exception as exc:
                failed_calls += 1
                if len(failure_examples) < 5:
                    failure_examples.append(f"{month} {district_code} {district_name}: {exc}")
                print(f"  -> failed: {exc}", file=sys.stderr)
                continue

            success_calls += 1
            for record in records:
                record["requested_month"] = month
                record["requested_district_code"] = district_code
                record["requested_district_name_en"] = district_name

            print(f"  -> {len(records)} rows")
            all_records.extend(records)
            time.sleep(args.sleep_seconds)

    raw_df = prepare_dataframe(all_records)
    summary_df = build_summary(raw_df)

    print(
        f"Fetch summary: success={success_calls}, failed={failed_calls}, collected_rows={len(raw_df):,}"
    )

    if raw_df.empty:
        print(
            "No transaction rows were collected. Skipping CSV export because every request failed or "
            "the API returned no usable data.",
            file=sys.stderr,
        )
        if failure_examples:
            print("Sample failures:", file=sys.stderr)
            for failure in failure_examples:
                print(f"  - {failure}", file=sys.stderr)
            print(
                "Check that the exact API is approved in data.go.kr and that you are using the "
                "'일반 인증키(Encoding)' value.",
                file=sys.stderr,
            )
        return 2

    raw_output_path = ensure_parent(args.raw_output)
    summary_output_path = ensure_parent(args.summary_output)
    raw_df.to_csv(raw_output_path, index=False, encoding="utf-8-sig")
    summary_df.to_csv(summary_output_path, index=False, encoding="utf-8-sig")

    print(f"Saved raw rows: {len(raw_df):,} -> {raw_output_path}")
    print(f"Saved summary rows: {len(summary_df):,} -> {summary_output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
