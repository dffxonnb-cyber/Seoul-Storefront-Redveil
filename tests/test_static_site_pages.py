from __future__ import annotations

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

    def test_static_pages_keep_utf8_korean_copy(self) -> None:
        expected_copy = {
            "index.html": ["서울 상가 매입 리스크 인텔리전스", "매물 검토", "구별 리포트"],
            "review.html": ["매물 검토", "검증 예시 불러오기", "저장한 검토"],
            "assessment.html": ["3분 진단", "진단 조건", "진단 실행"],
            "compare.html": ["후보 비교", "비교 실행", "메모로"],
            "districts.html": ["구별 리포트", "구 선택", "대체 후보"],
        }

        for page, phrases in expected_copy.items():
            with self.subTest(page=page):
                html = (SITE_ROOT / page).read_text(encoding="utf-8")
                for phrase in phrases:
                    self.assertIn(phrase, html)

    def test_public_site_text_has_no_mojibake_markers(self) -> None:
        files = [
            *SITE_ROOT.glob("*.html"),
            SITE_ROOT / "home.js",
            SITE_ROOT / "review.js",
            SITE_ROOT / "assessment.js",
            SITE_ROOT / "compare.js",
            SITE_ROOT / "districts.js",
            SITE_ROOT / "common.js",
        ]
        mojibake_markers = ("�", "ì", "Ã", "Â", "쒖", "留", "媛", "寃", "蹂", "遺", "援")

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
