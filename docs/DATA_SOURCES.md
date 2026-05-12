# Redveil Data Sources

Redveil combines three public-data families. The raw files under `data/` are intentionally excluded from Git, so this page is the update checklist for rebuilding the dataset locally.

## Source Links

| Use in Redveil | Official Dataset | Provider | Current Access Notes |
| --- | --- | --- | --- |
| Commercial real-estate transaction prices | [국토교통부_상업업무용 부동산 매매 실거래가 자료](https://www.data.go.kr/data/15126463/openapi.do) | 국토교통부 / 공공데이터포털 | REST XML OpenAPI. Query by legal-dong code first 5 digits and contract year-month. Requires data.go.kr service key. |
| Estimated sales and trade-area demand | [서울시 상권분석서비스(추정매출-서울시)](https://data.seoul.go.kr/dataList/OA-22177/A/1/datasetView.do) and related Seoul commercial-district datasets | 서울특별시, 서울신용보증재단 / 서울 열린데이터광장 | Quarterly data. Related datasets include 추정매출, 길단위인구, 집객시설, 점포, and 영역 tables. |
| Floating population by district/trade area | [서울시 상권분석서비스(길단위인구-자치구)](https://data.seoul.go.kr/dataList/OA-22179/S/1/datasetView.do?tab=A) and related 길단위인구 datasets | 서울특별시, 서울신용보증재단 / 서울 열린데이터광장 | Quarterly data. Use the matching 행정동/상권/자치구 scope for the processing target. |
| Commercial district data catalog and download guide | [서울시 상권분석서비스 제공정보 PDF](https://golmok.seoul.go.kr/images/seoul_info.pdf) | 서울시 상권분석서비스 | Confirms quarterly cadence, update timing, downloadable formats, and dataset families. |
| Store competition and merchant density | [소상공인시장진흥공단_상가(상권)정보](https://www.data.go.kr/data/15083033/fileData.do) | 소상공인시장진흥공단 / 공공데이터포털 | CSV file dataset. Quarterly update. Current page exposes nationwide active-store records including store name, category, address, longitude, and latitude. |

## Local File Mapping

| Local Input | Built From | Consumed By |
| --- | --- | --- |
| `data/raw/molit_commercial_sales/seoul_commercial_sales.csv` | MOLIT commercial real-estate transaction OpenAPI | `build_transaction_risk_scores.py` |
| `data/processed/seoul_commercial_sales_monthly_summary.csv` | MOLIT collector summary output | `build_transaction_risk_scores.py` |
| `data/external/raw/seoul_sales_2024.csv` | Seoul commercial-district estimated sales | `prepare_external_market_data.py` |
| `data/external/raw/seoul_floating_population.csv` | Seoul commercial-district floating population | `prepare_external_market_data.py` |
| `data/external/raw/seoul_attractors_hinterland.csv` | Seoul commercial-district attractor/facility data | `prepare_external_market_data.py` |
| `data/external/raw/seoul_store_info/seoul_store_info_YYYYMM.csv` | 소상공인시장진흥공단 store information CSV | `prepare_external_market_data.py` |
| `data/external/raw/seoul_trade_area_dong/seoul_trade_area_dong.dbf` | Seoul commercial-district area/admin-dong shape bundle | `prepare_external_market_data.py` |

## Update Checklist

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

- The current public payload uses transaction data from `2025.04~2026.03` and Seoul commercial-district demand data from a `2024` snapshot.
- The MOLIT collector currently calls `https://apis.data.go.kr/1613000/RTMSDataSvcNrgTrade/getRTMSDataSvcNrgTrade`. The official listing is now easiest to find through the public-data page linked above, so verify the endpoint in the OpenAPI spec before a fresh rebuild.
- Seoul commercial-district pages are split by metric and spatial scope. Match the pipeline input names rather than downloading every related dataset.
