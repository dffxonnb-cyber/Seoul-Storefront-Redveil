from __future__ import annotations

import json
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = PROJECT_ROOT / "app" / "site"


class StaticSitePageTests(unittest.TestCase):
    def test_main_pages_keep_required_scripts_and_nav(self) -> None:
        pages = {
            "index.html": "home.js",
            "review.html": "review.js",
            "assessment.html": "assessment.js",
            "compare.html": "compare.js",
            "districts.html": "districts.js",
        }

        for page, page_script in pages.items():
            with self.subTest(page=page):
                html = (SITE_ROOT / page).read_text(encoding="utf-8")

                self.assertIn('<nav class="topnav"', html)
                self.assertIn('src="./website_payload.js"', html)
                self.assertIn('src="./common.js"', html)
                self.assertIn(f'src="./{page_script}"', html)

    def test_validation_case_mounts_exist(self) -> None:
        index_html = (SITE_ROOT / "index.html").read_text(encoding="utf-8")
        review_html = (SITE_ROOT / "review.html").read_text(encoding="utf-8")

        self.assertIn('id="scenario-case-grid"', index_html)
        self.assertIn('id="review-example-list"', review_html)

    def test_v2_keeps_real_boundary_map_and_product_links(self) -> None:
        v2_root = SITE_ROOT / "v2"
        v2_html = (v2_root / "index.html").read_text(encoding="utf-8")
        geojson = json.loads((v2_root / "data" / "seoul-districts.geojson").read_text(encoding="utf-8"))

        self.assertIn("data-v2-risk-map", v2_html)
        self.assertIn('src="../website_payload.js"', v2_html)
        self.assertIn('href="../review.html"', v2_html)
        self.assertIn('href="../assessment.html"', v2_html)
        self.assertIn('href="../compare.html"', v2_html)
        self.assertIn('href="../districts.html"', v2_html)
        self.assertEqual(geojson["type"], "FeatureCollection")
        self.assertEqual(len(geojson["features"]), 25)
        self.assertEqual(len({feature["properties"]["code"] for feature in geojson["features"]}), 25)

    def test_public_files_do_not_reference_old_local_user_path(self) -> None:
        files = [
            PROJECT_ROOT / "run_streamlit.ps1",
            PROJECT_ROOT / "run_streamlit.bat",
            SITE_ROOT / "index.html",
            SITE_ROOT / "review.html",
            SITE_ROOT / "home.js",
            SITE_ROOT / "review.js",
        ]

        for path in files:
            with self.subTest(path=path.name):
                text = path.read_text(encoding="utf-8")
                self.assertNotIn("C:\\Users\\a0109", text)

    def test_static_pages_keep_portfolio_copy(self) -> None:
        expected_copy = {
            "index.html": ["PAUSE-FIRST", "리스크 요약", "판단 메모"],
            "review.html": ["Risk Review Console", "review-example-list", "Generate Review Memo"],
            "assessment.html": ["3-Minute Diagnosis", "Scenario Input", "assessment-form"],
            "compare.html": ["Candidate Compare", "Select Candidates", "compare-run"],
            "districts.html": ["District Report", "District Selector", "Replacement Candidates"],
            "v2/index.html": ["REDVEIL V2 MAP DASHBOARD", "서울 리스크 지도", "선택 자치구"],
        }

        for page, phrases in expected_copy.items():
            with self.subTest(page=page):
                html = (SITE_ROOT / page).read_text(encoding="utf-8")
                for phrase in phrases:
                    self.assertIn(phrase, html)

    def test_public_site_text_has_no_mojibake_markers(self) -> None:
        files = [
            SITE_ROOT / "index.html",
            SITE_ROOT / "home.js",
            SITE_ROOT / "v2" / "index.html",
            SITE_ROOT / "v2" / "redveil-v2.js",
        ]
        mojibake_markers = ("占", "챙", "횄", "횂", "筌", "揶", "野", "癰")

        for path in files:
            with self.subTest(path=path.name):
                text = path.read_text(encoding="utf-8")
                for marker in mojibake_markers:
                    self.assertNotIn(marker, text)

    def test_risk_validation_doc_is_linked(self) -> None:
        doc_path = PROJECT_ROOT / "docs" / "RISK_VALIDATION.md"
        readme = (PROJECT_ROOT / "README.md").read_text(encoding="utf-8")
        docs_index = (PROJECT_ROOT / "docs" / "README.md").read_text(encoding="utf-8")

        self.assertTrue(doc_path.exists())
        self.assertIn("RISK_VALIDATION.md", readme)
        self.assertIn("RISK_VALIDATION.md", docs_index)


if __name__ == "__main__":
    unittest.main()
