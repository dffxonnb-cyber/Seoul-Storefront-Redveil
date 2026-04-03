from __future__ import annotations

import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_ROOT = PROJECT_ROOT / "app"
if str(APP_ROOT) not in sys.path:
    sys.path.insert(0, str(APP_ROOT))


from server import (
    bootstrap_payload,
    build_assessment,
    build_compare_payload,
    build_review_record,
    cached_payload,
    load_reviews,
    persist_review,
)


class ServerApiShapeTests(unittest.TestCase):
    def test_bootstrap_payload_has_top_districts_and_archetypes(self) -> None:
        payload = cached_payload()
        bootstrap = bootstrap_payload(payload)

        self.assertIn("summary", bootstrap)
        self.assertIn("districts", bootstrap)
        self.assertIn("topDistricts", bootstrap)
        self.assertIn("archetypes", bootstrap)
        self.assertGreater(len(bootstrap["districts"]), 0)
        self.assertGreater(len(bootstrap["topDistricts"]), 0)

    def test_compare_payload_returns_requested_districts(self) -> None:
        payload = cached_payload()
        compare = build_compare_payload(payload, ["11680", "11650"])

        self.assertEqual(compare["count"], 2)
        self.assertEqual(compare["districts"][0]["code"], "11680")

    def test_assessment_builds_custom_verdict(self) -> None:
        payload = cached_payload()
        result, status = build_assessment(
            payload,
            {
                "districtCode": "11680",
                "askingPricePerSqm": 2600,
                "holdingMonths": 24,
                "priority": "cashflow",
            },
        )

        self.assertEqual(int(status), 200)
        self.assertIn("verdict", result)
        self.assertIn("customRiskScore", result)
        self.assertIn("riskArchetype", result)
        self.assertEqual(result["districtCode"], "11680")

    def test_property_review_can_be_built_and_persisted(self) -> None:
        payload = cached_payload()
        review, status = build_review_record(
            payload,
            {
                "assetName": "테스트 상가",
                "districtCode": "11680",
                "askingPriceTotal10k": 82000,
                "exclusiveAreaSqm": 31.5,
                "holdingMonths": 36,
                "priority": "balanced",
            },
        )

        self.assertEqual(int(status), 200)
        self.assertEqual(review["assetName"], "테스트 상가")
        self.assertGreater(review["askingPricePerSqm"], 0)

        path = PROJECT_ROOT / "tests" / "_tmp_reviews.json"
        if path.exists():
            path.unlink()
        self.addCleanup(lambda: path.unlink(missing_ok=True))

        persist_review(review, path)
        saved = load_reviews(path)
        self.assertEqual(len(saved), 1)
        self.assertEqual(saved[0]["assetName"], "테스트 상가")


if __name__ == "__main__":
    unittest.main()
