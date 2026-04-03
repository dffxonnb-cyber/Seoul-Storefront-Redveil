from __future__ import annotations

import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))


from redteam.pipelines.export_website_payload import build_payload


class WebsitePayloadTests(unittest.TestCase):
    def test_build_payload_contains_service_content(self) -> None:
        payload = build_payload(PROJECT_ROOT)

        self.assertEqual(payload["site"]["title"], "서울 상가 투자 레드팀")
        self.assertGreater(len(payload["districts"]), 0)
        self.assertIn("summary", payload)
        self.assertIn("caseStudies", payload)
        self.assertIn("demandFragility", payload)
        self.assertIn("archetypes", payload)

    def test_district_payload_has_archetype_and_checklist(self) -> None:
        payload = build_payload(PROJECT_ROOT)
        district = payload["districts"][0]

        self.assertIn("riskArchetype", district)
        self.assertIn("recommendedAction", district)
        self.assertIn("reviewChecklist", district)
        self.assertGreater(len(district["reviewChecklist"]), 0)

    def test_content_includes_modules_and_trust_signals(self) -> None:
        payload = build_payload(PROJECT_ROOT)
        content = payload["content"]

        self.assertIn("modules", content)
        self.assertIn("decisionStages", content)
        self.assertIn("trustSignals", content)
        self.assertGreaterEqual(len(content["modules"]), 4)


if __name__ == "__main__":
    unittest.main()
