from __future__ import annotations

import calendar
import csv
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PYTHON = sys.executable
SNAPSHOT_PREFIX = "window.__REDVEIL_PAYLOAD__ = "
SEOUL_DATA_VIEW_URL = "https://data.seoul.go.kr/dataList/dataView.do"
STORE_ZIP_URL = (
    "https://www.data.go.kr/cmm/cmm/fileDownload.do?"
    "atchFileId=FILE_000000003632420&fileDetailSn=1&insertDataPrcus=N"
)
MIN_SALES_ROWS = 10_000
MIN_POPULATION_ROWS = 1_000
MIN_ATTRACTOR_ROWS = 500
MIN_STORE_BYTES = 50_000_000


def read_snapshot_payload() -> dict[str, object]:
    js_path = PROJECT_ROOT / "app" / "site" / "website_payload.js"
    text = js_path.read_text(encoding="utf-8-sig").strip()
    if not text.startswith(SNAPSHOT_PREFIX):
        raise ValueError(f"Unexpected payload prefix in {js_path}")
    raw = text[len(SNAPSHOT_PREFIX) :]
    if raw.endswith(";"):
        raw = raw[:-1]
    return json.loads(raw)


def yyyymm(value: object) -> str:
    raw = str(value)
    return raw.replace(".", "") if "." in raw else raw


def reconstruct_transaction_snapshot(payload: dict[str, object]) -> None:
    processed_dir = PROJECT_ROOT / "data" / "processed"
    raw_dir = PROJECT_ROOT / "data" / "raw" / "molit_commercial_sales"
    processed_dir.mkdir(parents=True, exist_ok=True)
    raw_dir.mkdir(parents=True, exist_ok=True)

    score_rows: list[dict[str, object]] = []
    history_rows: list[dict[str, object]] = []
    districts = payload.get("districts", [])
    if not isinstance(districts, list):
        raise ValueError("Payload districts must be a list.")

    for district in districts:
        if not isinstance(district, dict):
            continue
        history = district.get("history") or []
        latest = history[-1] if isinstance(history, list) and history else {}
        score_rows.append(
            {
                "deal_year_month": yyyymm(latest.get("month") or payload.get("site", {}).get("latestMonth")),
                "district_code": str(district.get("code", "")).zfill(5),
                "district_name_kr": district.get("name"),
                "overall_transaction_risk_score": district.get("transactionRiskScore"),
                "price_burden_risk_score": district.get("priceBurdenRiskScore"),
                "liquidity_risk_score": district.get("liquidityRiskScore"),
                "volatility_risk_score": district.get("volatilityRiskScore"),
                "low_sample_flag": district.get("lowSampleFlag", False),
                "sample_reliability": {
                    "높음": "High",
                    "보통": "Medium",
                    "낮음": "Low",
                }.get(str(district.get("sampleReliability")), district.get("sampleReliability")),
                "risk_summary": district.get("riskSummary", ""),
            }
        )

        if isinstance(history, list):
            for item in history:
                if not isinstance(item, dict):
                    continue
                history_rows.append(
                    {
                        "deal_year_month": yyyymm(item.get("month")),
                        "district_code": str(district.get("code", "")).zfill(5),
                        "district_name_kr": district.get("name"),
                        "transaction_count": item.get("transactionCount", 0),
                        "median_deal_amount_10k_krw": "",
                        "median_price_per_sqm_10k_krw": item.get("medianPricePerSqm", 0),
                        "price_growth_6m_pct": item.get("priceGrowth6mPct", 0),
                        "transaction_drop_vs_6m_pct": item.get("transactionDropVs6mPct", 0),
                    }
                )

    write_dict_csv(processed_dir / "seoul_transaction_risk_scores.csv", score_rows)
    write_dict_csv(processed_dir / "seoul_transaction_risk_history.csv", history_rows)

    transaction_count = int(payload.get("summary", {}).get("transactionCount", 0))
    with (raw_dir / "seoul_commercial_sales.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["snapshot_row_id"])
        writer.writeheader()
        for row_id in range(1, transaction_count + 1):
            writer.writerow({"snapshot_row_id": row_id})


def write_dict_csv(path: Path, rows: list[dict[str, object]], encoding: str = "utf-8-sig") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(rows[0].keys()) if rows else []
    with path.open("w", newline="", encoding=encoding) as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def parse_seoul_data_view(text: str) -> tuple[int, list[dict[str, str]]]:
    total_match = re.search(r"totalCount:\s*(\d+)", text)
    total_count = int(total_match.group(1)) if total_match else 0
    start = text.find("list:[")
    end = text.rfind("]")
    if start < 0 or end < 0 or end <= start:
        return total_count, []

    body = text[start + len("list:[") : end].strip()
    if body.endswith(","):
        body = body[:-1]
    if not body:
        return total_count, []

    records: list[dict[str, str]] = []
    for raw_record in re.split(r"\},\{", body):
        raw_record = raw_record.strip().strip("{}")
        fields = dict(re.findall(r"([A-Z0-9_]+):\"([^\"]*)\"", raw_record))
        if fields:
            records.append(fields)
    return total_count, records


def fetch_url_text(url: str, timeout: int = 120, attempts: int = 3) -> str:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "redveil-data-updater"})
            return urllib.request.urlopen(request, timeout=timeout).read().decode("utf-8", "replace")
        except Exception as error:  # pragma: no cover - network retry guard
            last_error = error
            if attempt == attempts:
                break
            time.sleep(2 * attempt)
    raise RuntimeError(f"Failed to fetch {url}") from last_error


def fetch_seoul_records(inf_id: str, quarter: str, page_size: int = 100) -> list[dict[str, str]]:
    page_no = 1
    records_by_ronum: dict[str, dict[str, str]] = {}
    total_count = None
    empty_or_duplicate_pages = 0
    while total_count is None or len(records_by_ronum) < total_count:
        params = {
            "onepagerow": str(page_size),
            "srvType": "S",
            "infId": inf_id,
            "serviceKind": "0",
            "pageNo": str(page_no),
            "gridTotalCnt": "",
            "ssUserId": "SAMPLE_VIEW",
            "strWhere": "",
            "strOrderby": "STDR_YYQU_CD DESC",
            "filterCol": "STDR_YYQU_CD",
            "txtFilter": quarter,
            "browser1": "chrome",
            "version": "120",
        }
        url = f"{SEOUL_DATA_VIEW_URL}?{urllib.parse.urlencode(params)}"
        text = fetch_url_text(url)
        total_count, page_records = parse_seoul_data_view(text)
        before_count = len(records_by_ronum)
        for record in page_records:
            ronum = record.get("RONUM")
            if ronum:
                records_by_ronum[ronum] = record
        if page_no == 1 or page_no % 20 == 0 or len(records_by_ronum) >= total_count:
            print(f"Fetched {inf_id} page {page_no}: {len(records_by_ronum)}/{total_count}")
        if not page_records:
            break
        if len(records_by_ronum) == before_count:
            empty_or_duplicate_pages += 1
        else:
            empty_or_duplicate_pages = 0
        if empty_or_duplicate_pages >= 3:
            break
        page_no += 1
    return [records_by_ronum[key] for key in sorted(records_by_ronum, key=lambda item: int(item))]


def latest_seoul_quarter(inf_id: str) -> str:
    params = {
        "onepagerow": "3000",
        "srvType": "S",
        "infId": inf_id,
        "serviceKind": "0",
        "pageNo": "1",
        "gridTotalCnt": "",
        "ssUserId": "SAMPLE_VIEW",
        "strWhere": "",
        "strOrderby": "STDR_YYQU_CD DESC",
        "filterCol": "",
        "txtFilter": "",
        "browser1": "chrome",
        "version": "120",
    }
    url = f"{SEOUL_DATA_VIEW_URL}?{urllib.parse.urlencode(params)}"
    text = fetch_url_text(url)
    quarters = re.findall(r'STDR_YYQU_CD:\"(\d+)\"', text)
    if not quarters:
        raise ValueError(f"Could not detect latest quarter for {inf_id}")
    return max(quarters)


def write_projected_csv(
    path: Path,
    records: list[dict[str, str]],
    source_columns: list[str],
    encoding: str = "cp949",
) -> None:
    rows = [{column: record.get(column, "") for column in source_columns} for record in records]
    write_dict_csv(path, rows, encoding=encoding)


def download_store_zip(zip_path: Path) -> None:
    if zip_path.exists() and zip_path.stat().st_size > 100_000_000:
        return

    zip_path.parent.mkdir(parents=True, exist_ok=True)
    store_zip_url = os.environ.get("REDVEIL_STORE_ZIP_URL", STORE_ZIP_URL)
    curl_path = shutil.which("curl.exe") or shutil.which("curl")
    if curl_path:
        subprocess.run(
            [
                curl_path,
                "-L",
                "--retry",
                "5",
                "--retry-delay",
                "5",
                "--output",
                str(zip_path),
                store_zip_url,
            ],
            check=True,
        )
        return

    request = urllib.request.Request(store_zip_url, headers={"User-Agent": "Mozilla/5.0"})
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            with urllib.request.urlopen(request, timeout=300) as response, zip_path.open("wb") as handle:
                shutil.copyfileobj(response, handle)
            return
        except Exception as error:  # pragma: no cover - network retry guard
            last_error = error
            time.sleep(attempt * 5)
    raise RuntimeError("Failed to download store-info ZIP") from last_error


def store_snapshot_date_from_name(name: str) -> str:
    match = re.search(r"(20\d{2})(\d{2})(\d{2})?", name)
    if not match:
        raise ValueError(f"Could not detect store-info snapshot date from {name}")
    year, month, day = match.groups()
    if not day:
        day = f"{calendar.monthrange(int(year), int(month))[1]:02d}"
    return f"{year}{month}{day}"


def extract_seoul_store_csv(zip_path: Path, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive:
        seoul_names = [
            name
            for name in archive.namelist()
            if "서울" in Path(name).name and name.lower().endswith(".csv")
        ]
        if not seoul_names:
            raise FileNotFoundError("Seoul CSV was not found in the store-info ZIP.")
        seoul_names.sort(key=store_snapshot_date_from_name, reverse=True)
        snapshot_date = store_snapshot_date_from_name(seoul_names[0])
        output_path = output_dir / f"seoul_store_info_{snapshot_date}.csv"
        with archive.open(seoul_names[0]) as source, output_path.open("wb") as target:
            shutil.copyfileobj(source, target)
    if output_path.stat().st_size < MIN_STORE_BYTES:
        raise ValueError(f"Store-info CSV looks too small: {output_path} ({output_path.stat().st_size} bytes)")
    return output_path


def assert_minimum_rows(name: str, rows: list[dict[str, str]], minimum: int) -> None:
    if len(rows) < minimum:
        raise ValueError(f"{name} returned {len(rows):,} rows, below safety floor {minimum:,}.")


def run_pipeline(script_name: str, *args: str) -> None:
    command = [PYTHON, str(PROJECT_ROOT / "src" / "redveil" / "pipelines" / script_name), *args]
    subprocess.run(command, cwd=str(PROJECT_ROOT), check=True)


def run_repo_script(script_name: str, *args: str) -> None:
    command = [PYTHON, str(PROJECT_ROOT / "scripts" / script_name), *args]
    subprocess.run(command, cwd=str(PROJECT_ROOT), check=True)


def main() -> int:
    payload = read_snapshot_payload()
    reconstruct_transaction_snapshot(payload)

    raw_root = PROJECT_ROOT / "data" / "external" / "raw"
    store_dir = raw_root / "seoul_store_info"
    latest_quarter = latest_seoul_quarter("OA-15572")

    sales_records = fetch_seoul_records("OA-15572", latest_quarter)
    population_records = fetch_seoul_records("OA-15568", latest_quarter)
    attractor_records = fetch_seoul_records("OA-15581", latest_quarter)
    assert_minimum_rows("sales", sales_records, MIN_SALES_ROWS)
    assert_minimum_rows("population", population_records, MIN_POPULATION_ROWS)
    assert_minimum_rows("attractors", attractor_records, MIN_ATTRACTOR_ROWS)

    write_projected_csv(
        raw_root / "seoul_sales_latest.csv",
        sales_records,
        [
            "STDR_YYQU_CD",
            "TRDAR_SE_CD",
            "TRDAR_SE_CD_NM",
            "TRDAR_CD",
            "TRDAR_CD_NM",
            "SVC_INDUTY_CD",
            "SVC_INDUTY_CD_NM",
            "THSMON_SELNG_AMT",
            "THSMON_SELNG_CO",
        ],
    )
    write_projected_csv(
        raw_root / "seoul_floating_population_latest.csv",
        population_records,
        [
            "STDR_YYQU_CD",
            "TRDAR_SE_CD",
            "TRDAR_SE_CD_NM",
            "TRDAR_CD",
            "TRDAR_CD_NM",
            "TOT_FLPOP_CO",
        ],
    )
    write_projected_csv(
        raw_root / "seoul_attractors_hinterland_latest.csv",
        attractor_records,
        [
            "STDR_YYQU_CD",
            "TRDAR_SE_CD",
            "TRDAR_SE_CD_NM",
            "TRDAR_CD",
            "TRDAR_CD_NM",
            "VIATR_FCLTY_CO",
            "PBLOFC_CO",
            "BANK_CO",
            "GEHSPT_CO",
            "GNRL_HSPTL_CO",
            "PARMACY_CO",
            "BUS_TRMINL_CO",
            "SUBWAY_STATN_CO",
            "BUS_STTN_CO",
        ],
    )

    store_zip = store_dir / "store_info_latest.zip"
    download_store_zip(store_zip)
    store_csv = extract_seoul_store_csv(store_zip, store_dir)

    run_pipeline(
        "prepare_external_market_data.py",
        "--store-input",
        str(store_csv),
    )
    run_pipeline("build_redveil_outputs.py")
    run_pipeline("build_case_study_materials.py")
    run_pipeline("export_website_payload.py")
    run_repo_script("sync_public_data_docs.py")

    print(
        json.dumps(
            {
                "seoulMarketQuarter": latest_quarter,
                "salesRows": len(sales_records),
                "populationRows": len(population_records),
                "attractorRows": len(attractor_records),
                "storeFile": str(store_csv),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
