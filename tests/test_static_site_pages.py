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
        self.assertIn('href="./districts.html"', v2_html)
        self.assertIn('id="selected-district-report-link"', v2_html)
        self.assertIn('href="./redveil-v2-mobile.css', v2_html)
        self.assertIn('href="./redveil-v2-shell.css', v2_html)
        self.assertIn('src="./redveil-v2-shell.js', v2_html)
        self.assertIn('data-v2-view="map"', v2_html)
        self.assertEqual(geojson["type"], "FeatureCollection")
        self.assertEqual(len(geojson["features"]), 25)
        self.assertEqual(len({feature["properties"]["code"] for feature in geojson["features"]}), 25)

    def test_v2_pages_share_sidebar_shell(self) -> None:
        v2_root = SITE_ROOT / "v2"
        pages = {
            "index.html": "map",
            "review.html": "review",
            "assessment.html": "assessment",
            "compare.html": "compare",
            "districts.html": "districts",
        }

        for page, view in pages.items():
            with self.subTest(page=page):
                html = (v2_root / page).read_text(encoding="utf-8")
                self.assertIn(f'data-v2-view="{view}"', html)
                self.assertIn('id="v2-sidebar"', html)
                self.assertIn('data-v2-menu-open', html)
                self.assertIn('data-v2-menu-close', html)
                self.assertIn('data-v2-menu-backdrop', html)
                self.assertEqual(html.count('data-v2-nav="'), 5)
                self.assertIn('href="./redveil-v2-shell.css', html)
                self.assertIn('src="./redveil-v2-shell.js', html)

    def test_v2_review_reuses_existing_review_logic_inside_v2_shell(self) -> None:
        review_html = (SITE_ROOT / "v2" / "review.html").read_text(encoding="utf-8")

        self.assertIn('src="../website_payload.js"', review_html)
        self.assertIn('src="../common.js"', review_html)
        self.assertIn('src="../review.js"', review_html)
        self.assertIn('src="./redveil-v2-review.js', review_html)
        self.assertIn('href="./redveil-v2-feature.css', review_html)
        self.assertIn('id="review-form"', review_html)
        self.assertIn('id="review-district-code"', review_html)
        self.assertIn('id="review-result"', review_html)
        self.assertIn('id="review-history"', review_html)
        self.assertNotIn('<nav class="topnav"', review_html)
        self.assertNotIn("Saved Reviews", review_html)
        self.assertNotIn("Local archive", review_html)

    def test_v2_assessment_reuses_existing_assessment_logic_inside_v2_shell(self) -> None:
        assessment_html = (SITE_ROOT / "v2" / "assessment.html").read_text(encoding="utf-8")

        self.assertIn('src="../website_payload.js"', assessment_html)
        self.assertIn('src="../common.js"', assessment_html)
        self.assertIn('src="../assessment.js"', assessment_html)
        self.assertIn('src="./redveil-v2-assessment.js', assessment_html)
        self.assertIn('href="./redveil-v2-feature.css', assessment_html)
        self.assertIn('href="./redveil-v2-assessment.css', assessment_html)
        self.assertIn('id="assessment-form"', assessment_html)
        self.assertIn('id="district-code"', assessment_html)
        self.assertIn('id="assessment-result"', assessment_html)
        self.assertNotIn('<nav class="topnav"', assessment_html)
        self.assertNotIn("3-Minute Diagnosis", assessment_html)
        self.assertNotIn("Quick Risk Check", assessment_html)

    def test_v2_compare_reuses_existing_compare_logic_inside_v2_shell(self) -> None:
        compare_html = (SITE_ROOT / "v2" / "compare.html").read_text(encoding="utf-8")

        self.assertIn('src="../website_payload.js"', compare_html)
        self.assertIn('src="../common.js"', compare_html)
        self.assertIn('src="../compare.js"', compare_html)
        self.assertIn('src="../compare-minimap.js"', compare_html)
        self.assertIn('src="./redveil-v2-compare.js', compare_html)
        self.assertIn('href="./redveil-v2-feature.css', compare_html)
        self.assertIn('href="./redveil-v2-compare.css', compare_html)
        self.assertIn('id="compare-a"', compare_html)
        self.assertIn('id="compare-b"', compare_html)
        self.assertIn('id="compare-c"', compare_html)
        self.assertIn('id="compare-run"', compare_html)
        self.assertIn('id="compare-grid"', compare_html)
        self.assertIn('id="compare-memo"', compare_html)
        self.assertNotIn('<nav class="topnav"', compare_html)
        self.assertNotIn("Candidate Compare", compare_html)
        self.assertNotIn("Alternative Candidates", compare_html)

    def test_v2_district_report_keeps_required_mounts_and_scripts(self) -> None:
        report_html = (SITE_ROOT / "v2" / "districts.html").read_text(encoding="utf-8")

        self.assertIn('src="../website_payload.js"', report_html)
        self.assertIn('src="./redveil-v2-districts.js"', report_html)
        self.assertIn('id="v2-report-factor-grid"', report_html)
        self.assertIn('id="v2-report-alternative-list"', report_html)
        self.assertIn('href="./districts.html"', report_html)
        self.assertIn("자치구 리스크 리포트", report_html)
        self.assertNotIn("DISTRICT RISK REPORT", report_html)
        self.assertNotIn("V1 구별 리포트", report_html)

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
            "review.html": ["추천 전에 보류 사유", "review-example-list", "보류 메모 생성"],
            "assessment.html": ["3-Minute Diagnosis", "보류 신호 진단 실행", "assessment-form"],
            "compare.html": ["Candidate Compare", "보류 기준으로 비교", "compare-run"],
            "districts.html": ["District Report", "District Selector", "Replacement Candidates"],
            "v2/index.html": ["레드베일 V2 지도 대시보드", "서울 리스크 지도", "선택 자치구"],
            "v2/review.html": ["매물 검토", "추천 전에 보류 사유", "보류 메모 생성"],
            "v2/assessment.html": ["3분 진단", "보류 신호 진단 실행", "assessment-form"],
            "v2/compare.html": ["후보 비교", "보류 기준으로 비교", "compare-run"],
            "v2/districts.html": ["자치구 리스크 리포트", "핵심 위험 요인", "결정 메모"],
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
            SITE_ROOT / "v2" / "review.html",
            SITE_ROOT / "v2" / "assessment.html",
            SITE_ROOT / "v2" / "compare.html",
            SITE_ROOT / "v2" / "redveil-v2.js",
            SITE_ROOT / "v2" / "redveil-v2-shell.js",
            SITE_ROOT / "v2" / "redveil-v2-review.js",
            SITE_ROOT / "v2" / "redveil-v2-assessment.js",
            SITE_ROOT / "v2" / "redveil-v2-compare.js",
            SITE_ROOT / "v2" / "districts.html",
            SITE_ROOT / "v2" / "redveil-v2-districts.js",
        ]
        mojibake_markers = ("占", "챙", "횄", "횂", "筌", "揶", "野", "癰")

        for path in files:
            with self.subTest(path=path.name):
                text = path.read_text(encoding="utf-8")
                for marker in mojibake_markers:
                    self.assertNotIn(marker, text)

    def test_readme_packages_v2_as_the_representative_product(self) -> None:
        readme = (PROJECT_ROOT / "README.md").read_text(encoding="utf-8")
        evidence = PROJECT_ROOT / "docs" / "evidence"
        screenshots = [
            "redveil-v2-desktop-home-2026-07-12.png",
            "redveil-v2-mobile-home-2026-07-12.png",
            "redveil-v2-property-review-2026-07-12.png",
            "redveil-v2-assessment-2026-07-12.png",
            "redveil-v2-candidate-compare-2026-07-12.png",
            "redveil-v2-district-report-2026-07-12.png",
        ]

        self.assertIn("# Redveil V2", readme)
        self.assertIn("Seoul-Storefront-Redveil/v2/", readme)
        self.assertIn("V1 Legacy", readme)
        self.assertIn("v2-release-2026-07-12.md", readme)
        self.assertTrue((evidence / "v2-release-2026-07-12.md").exists())
        for screenshot in screenshots:
            with self.subTest(screenshot=screenshot):
                self.assertIn(screenshot, readme + (evidence / "README.md").read_text(encoding="utf-8"))
                self.assertTrue((evidence / screenshot).exists())

    def test_risk_validation_doc_is_linked(self) -> None:
        doc_path = PROJECT_ROOT / "docs" / "RISK_VALIDATION.md"
        readme = (PROJECT_ROOT / "README.md").read_text(encoding="utf-8")
        docs_index = (PROJECT_ROOT / "docs" / "README.md").read_text(encoding="utf-8")

        self.assertTrue(doc_path.exists())
        self.assertIn("RISK_VALIDATION.md", readme)
        self.assertIn("RISK_VALIDATION.md", docs_index)


if __name__ == "__main__":
    unittest.main()
