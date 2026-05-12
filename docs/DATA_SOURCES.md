# Redveil Data Sources

Redveil combines three public-data families. The raw files under `data/` are intentionally excluded from Git, so this page is the update checklist for rebuilding the dataset locally.

## Source Links

| Use in Redveil | Official Dataset | Provider | Current Access Notes |
| --- | --- | --- | --- |
| Commercial real-estate transaction prices | [국토교통부_상업업무용 부동산 매매 실거래가 자료](https://www.data.go.kr/data/15126463/openapi.do) | 국토교통부 / 공공데이터포털 | REST XML OpenAPI. Query by legal-dong code first 5 digits and contract year-month. Requires data.go.kr service key. |
| Estimated sales and trade-area demand | [서울시 상권분석서비스(추정매출-상권)](https://data.seoul.go.kr/dataList/OA-15572/S/1/datasetView.do) and related Seoul commercial-district datasets | 서울특별시, 서울신용보증재단 / 서울 열린데이터광장 | Quarterly data. Related datasets include 추정매출, 길단위인구, 집객시설, 점포, and 영역 tables. |
| Floating population by trade area | [서울시 상권분석서비스(길단위인구-상권)](https://data.seoul.go.kr/dataList/OA-15568/S/1/datasetView.do) and related 길단위인구 datasets | 서울특별시, 서울신용보증재단 / 서울 열린데이터광장 | Quarterly data. Use the matching 행정동/상권/자치구 scope for the processing target. |
| Attractor/facility counts by trade-area hinterland | [서울시 상권분석서비스(집객시설-상권배후지)](https://data.seoul.go.kr/dataList/OA-15581/S/1/datasetView.do) | 서울특별시, 서울신용보증재단 / 서울 열린데이터광장 | Quarterly data. Used as supporting structural context for trade-area demand signals. |
| Commercial district data catalog and download guide | [서울시 상권분석서비스 제공정보 PDF](https://golmok.seoul.go.kr/images/seoul_info.pdf) | 서울시 상권분석서비스 | Confirms quarterly cadence, update timing, downloadable formats, and dataset families. |
| Store competition and merchant density | [소상공인시장진흥공단_상가(상권)정보](https://www.data.go.kr/data/15083033/fileData.do) | 소상공인시장진흥공단 / 공공데이터포털 | CSV file dataset. Quarterly update. Current page exposes nationwide active-store records including store name, category, address, longitude, and latitude. |

## Local File Mapping

| Local Input | Built From | Consumed By |
| --- | --- | --- |
| `data/raw/molit_commercial_sales/seoul_commercial_sales.csv` | MOLIT commercial real-estate transaction OpenAPI | `build_transaction_risk_scores.py` |
| `data/processed/seoul_commercial_sales_monthly_summary.csv` | MOLIT collector summary output | `build_transaction_risk_scores.py` |
| `data/external/raw/seoul_sales_latest.csv` | Seoul commercial-district estimated sales | `prepare_external_market_data.py` |
| `data/external/raw/seoul_floating_population_latest.csv` | Seoul commercial-district floating population | `prepare_external_market_data.py` |
| `data/external/raw/seoul_attractors_hinterland_latest.csv` | Seoul commercial-district attractor/facility data | `prepare_external_market_data.py` |
| `data/external/raw/seoul_store_info/seoul_store_info_YYYYMMDD.csv` | 소상공인시장진흥공단 store information CSV | `prepare_external_market_data.py` |
| `data/external/raw/seoul_trade_area_dong/seoul_trade_area_dong.dbf` | Seoul commercial-district area/admin-dong shape bundle | `prepare_external_market_data.py` |

## Update Checklist

### Automated public refresh

The scheduled workflow [Refresh Public Data](../.github/workflows/refresh-public-data.yml) runs quarterly and can also be started manually from GitHub Actions. It:

1. Refreshes the MOLIT transaction window when `PUBLIC_DATA_API_KEY` is available; otherwise reconstructs the public-safe transaction snapshot from `app/site/website_payload.js`.
2. Downloads the latest Seoul Open Data commercial-district tables for 추정매출, 길단위인구, and 집객시설.
3. Downloads the current 소상공인 상가정보 ZIP, extracts the Seoul CSV, and detects the file month from the archive name.
4. Rebuilds Redveil outputs, `app/site/website_payload.js`, `docs/CASE_STUDIES.md`, and the coverage/date notes in this documentation set.
5. Runs unit tests and the CI-safe site smoke check.
6. Opens a pull request only when tracked public artifacts changed.

If the repository secret `PUBLIC_DATA_API_KEY` is configured, step 1 collects the latest 12-month MOLIT transaction window through the official OpenAPI before rebuilding transaction risk scores. Without that secret, the workflow intentionally falls back to the tracked public-safe transaction snapshot so Seoul commercial-district refreshes can still run.

The workflow intentionally opens a PR instead of pushing directly to `main`, because a data refresh can change ranking, case-study examples, and visible risk scores.

### Required user-owned secret

To enable full transaction-data automation, the repository owner must add one GitHub Actions secret:

- Name: `PUBLIC_DATA_API_KEY`
- Value: the data.go.kr `Encoding` service key approved for `국토교통부_상업업무용 부동산 매매 실거래가 자료`
- GitHub path: repository `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Codex can wire the workflow and code, but it cannot create or view a private data.go.kr key unless the repository owner provides it.

### Full local rebuild

1. Issue or refresh a data.go.kr service key for the MOLIT OpenAPI.
2. Collect the latest commercial transaction window:

```bash
python src/redveil/pipelines/collect_molit_commercial_sales.py --months-back 12 --end-month YYYYMM
```

3. Download the latest Seoul commercial-district files from 서울 열린데이터광장. Keep the same scopes used by the pipeline: estimated sales, floating population, attractor/facility data, and admin-dong/trade-area boundary reference.
4. Download the latest `소상공인시장진흥공단_상가(상권)정보` CSV and place the Seoul file under `data/external/raw/seoul_store_info/`.
5. Rebuild derived outputs:

```bash
python src/redveil/pipelines/build_transaction_risk_scores.py
python src/redveil/pipelines/prepare_external_market_data.py
python src/redveil/pipelines/build_redveil_outputs.py
python src/redveil/pipelines/build_case_study_materials.py
python src/redveil/pipelines/export_website_payload.py
```

6. Re-run verification:

```bash
python -m unittest discover -s tests -p "test_*.py"
python scripts/check_site_smoke.py
python scripts/check_review_e2e.py
python scripts/check_service_flows_e2e.py
python scripts/check_responsive_pages.py
```

## Notes

- `scripts/update_latest_public_data.py` can rebuild the public-safe local inputs when the MOLIT transaction snapshot is already present in `app/site/website_payload.js`.
- Set `PUBLIC_DATA_API_KEY` to the data.go.kr encoding service key to let `scripts/update_latest_public_data.py` refresh the MOLIT transaction window automatically.
- The current public payload uses transaction data from `2025.04~2026.03`, Seoul commercial-district demand data from `2025년 4분기`, and store competition data from the `2026.03.31 기준 파일`.
- The MOLIT collector currently calls `https://apis.data.go.kr/1613000/RTMSDataSvcNrgTrade/getRTMSDataSvcNrgTrade`. The official listing is now easiest to find through the public-data page linked above, so verify the endpoint in the OpenAPI spec before a fresh rebuild.
- Seoul commercial-district pages are split by metric and spatial scope. Match the pipeline input names rather than downloading every related dataset.
