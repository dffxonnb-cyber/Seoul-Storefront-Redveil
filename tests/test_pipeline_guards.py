from __future__ import annotations

import sys
import unittest
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))


from redveil.pipelines.build_redveil_outputs import build_replacement_candidates
from redveil.pipelines.build_transaction_risk_scores import build_latest_scores, build_summary_from_raw
from redveil.pipelines.collect_molit_commercial_sales import parse_xml_response


class PipelineGuardsTest(unittest.TestCase):
    def test_parse_xml_response_accepts_success_code_000(self) -> None:
        xml_text = """
        <response>
          <header>
            <resultCode>000</resultCode>
            <resultMsg>OK</resultMsg>
          </header>
          <body>
            <items>
              <item>
                <sggCd>11680</sggCd>
                <sggNm>강남구</sggNm>
                <dealAmount>10,000</dealAmount>
              </item>
            </items>
            <totalCount>1</totalCount>
            <numOfRows>10</numOfRows>
            <pageNo>1</pageNo>
          </body>
        </response>
        """

        response = parse_xml_response(xml_text)

        self.assertEqual(response.total_count, 1)
        self.assertEqual(len(response.items), 1)
        self.assertEqual(response.items[0]["sggNm"], "강남구")

    def test_build_summary_from_raw_filters_to_storefront_uses(self) -> None:
        raw_df = pd.DataFrame(
            [
                {
                    "deal_year_month": "202603",
                    "district_code": "11110",
                    "district_name_kr": "종로구",
                    "district_name_en": "Jongno-gu",
                    "buildingUse": "제1종근린생활",
                    "deal_amount_10k_krw": 10000,
                    "price_per_sqm_10k_krw": 100,
                    "building_area_sqm": 100,
                    "build_year_num": 2000,
                },
                {
                    "deal_year_month": "202603",
                    "district_code": "11110",
                    "district_name_kr": "종로구",
                    "district_name_en": "Jongno-gu",
                    "buildingUse": "업무",
                    "deal_amount_10k_krw": 5000,
                    "price_per_sqm_10k_krw": 50,
                    "building_area_sqm": 100,
                    "build_year_num": 2001,
                },
                {
                    "deal_year_month": "202603",
                    "district_code": "11140",
                    "district_name_kr": "중구",
                    "district_name_en": "Jung-gu",
                    "buildingUse": "업무",
                    "deal_amount_10k_krw": 7000,
                    "price_per_sqm_10k_krw": 70,
                    "building_area_sqm": 100,
                    "build_year_num": 2002,
                },
            ]
        )

        summary_df = build_summary_from_raw(raw_df, ("제1종근린생활", "제2종근린생활", "판매"))

        jongno = summary_df.loc[summary_df["district_code"] == "11110"].iloc[0]
        jung = summary_df.loc[summary_df["district_code"] == "11140"].iloc[0]

        self.assertEqual(jongno["transaction_count"], 1)
        self.assertEqual(jongno["median_deal_amount_10k_krw"], 10000)
        self.assertEqual(jung["transaction_count"], 0)
        self.assertTrue(pd.isna(jung["median_deal_amount_10k_krw"]))

    def test_replacement_candidates_require_meaningfully_safer_scores(self) -> None:
        acquisition_df = pd.DataFrame(
            [
                {
                    "district_code": "A",
                    "district_name": "서초구",
                    "overall_acquisition_risk_score": 80.0,
                    "acquisition_risk_grade": "Very High",
                    "liquidity_risk_score": 60.0,
                    "competition_risk_score": 70.0,
                    "food_store_share": 0.20,
                },
                {
                    "district_code": "B",
                    "district_name": "강남구",
                    "overall_acquisition_risk_score": 72.0,
                    "acquisition_risk_grade": "High",
                    "liquidity_risk_score": 55.0,
                    "competition_risk_score": 68.0,
                    "food_store_share": 0.21,
                },
                {
                    "district_code": "C",
                    "district_name": "은평구",
                    "overall_acquisition_risk_score": 50.0,
                    "acquisition_risk_grade": "Moderate",
                    "liquidity_risk_score": 45.0,
                    "competition_risk_score": 40.0,
                    "food_store_share": 0.19,
                },
            ]
        )

        candidates_df = build_replacement_candidates(acquisition_df)
        source_candidates = candidates_df.loc[candidates_df["source_district_code"] == "A"]

        self.assertEqual(source_candidates["candidate_district_name"].tolist(), ["은평구"])

    def test_build_latest_scores_adds_low_sample_flag(self) -> None:
        history_df = pd.DataFrame(
            [
                {
                    "deal_year_month": "202603",
                    "district_code": "11110",
                    "district_name_kr": "종로구",
                    "district_name_en": "Jongno-gu",
                    "transaction_count": 3,
                    "median_deal_amount_10k_krw": 10000,
                    "median_price_per_sqm_10k_krw": 100,
                    "price_growth_3m_pct": 5,
                    "price_growth_6m_pct": 10,
                    "transaction_drop_vs_6m_pct": -20,
                    "price_volatility_6m": 5,
                },
                {
                    "deal_year_month": "202603",
                    "district_code": "11140",
                    "district_name_kr": "중구",
                    "district_name_en": "Jung-gu",
                    "transaction_count": 25,
                    "median_deal_amount_10k_krw": 12000,
                    "median_price_per_sqm_10k_krw": 120,
                    "price_growth_3m_pct": 6,
                    "price_growth_6m_pct": 11,
                    "transaction_drop_vs_6m_pct": -10,
                    "price_volatility_6m": 6,
                },
            ]
        )

        score_df = build_latest_scores(history_df, low_sample_threshold=10)

        jongno = score_df.loc[score_df["district_code"] == "11110"].iloc[0]
        jung = score_df.loc[score_df["district_code"] == "11140"].iloc[0]

        self.assertTrue(bool(jongno["low_sample_flag"]))
        self.assertEqual(jongno["sample_reliability"], "Low")
        self.assertFalse(bool(jung["low_sample_flag"]))


if __name__ == "__main__":
    unittest.main()
