from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from functools import lru_cache
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from redteam.pipelines.export_website_payload import build_payload


SITE_DIR = PROJECT_ROOT / "app" / "site"
SNAPSHOT_PATH = PROJECT_ROOT / "data" / "website" / "website_payload.json"
REVIEW_STORE_PATH = PROJECT_ROOT / "data" / "app" / "property_reviews.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the Korean storefront red-team website.")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind the local web server.")
    parser.add_argument("--port", default=8030, type=int, help="Port to bind the local web server.")
    return parser.parse_args()


@lru_cache(maxsize=1)
def cached_payload() -> dict[str, object]:
    payload = build_payload(PROJECT_ROOT)
    SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
    SNAPSHOT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def bootstrap_payload(payload: dict[str, object]) -> dict[str, object]:
    districts = payload["districts"]
    return {
        "site": payload["site"],
        "summary": payload["summary"],
        "archetypes": payload["archetypes"],
        "districts": [
            {
                "code": item["code"],
                "name": item["name"],
                "riskScore": item["riskScore"],
                "riskGrade": item["riskGrade"],
                "riskArchetype": item["riskArchetype"],
                "sampleReliability": item["sampleReliability"],
                "lowSampleFlag": item["lowSampleFlag"],
            }
            for item in districts
        ],
        "topDistricts": districts[:5],
    }


def district_by_code(payload: dict[str, object], code: str) -> dict[str, object] | None:
    return next((item for item in payload["districts"] if item["code"] == code), None)


def latest_price_per_sqm(district: dict[str, object]) -> float:
    history = district.get("history", [])
    if not history:
        return 0.0
    return float(history[-1].get("medianPricePerSqm", 0.0))


def ensure_review_store(path: Path = REVIEW_STORE_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text("[]", encoding="utf-8")


def load_reviews(path: Path = REVIEW_STORE_PATH) -> list[dict[str, object]]:
    ensure_review_store(path)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    if not isinstance(data, list):
        return []
    return data


def save_reviews(reviews: list[dict[str, object]], path: Path = REVIEW_STORE_PATH) -> None:
    ensure_review_store(path)
    path.write_text(json.dumps(reviews, ensure_ascii=False, indent=2), encoding="utf-8")


def build_compare_payload(payload: dict[str, object], codes: list[str]) -> dict[str, object]:
    selected = [district_by_code(payload, code) for code in codes]
    districts = [item for item in selected if item is not None]
    return {
        "districts": districts,
        "count": len(districts),
    }


def build_assessment(payload: dict[str, object], body: dict[str, object]) -> tuple[dict[str, object], HTTPStatus]:
    district_code = str(body.get("districtCode", "")).strip()
    district = district_by_code(payload, district_code)
    if district is None:
        return {"error": "District not found"}, HTTPStatus.NOT_FOUND

    asking_price_per_sqm = float(body.get("askingPricePerSqm", 0) or 0)
    holding_months = int(body.get("holdingMonths", 36) or 36)
    priority = str(body.get("priority", "balanced") or "balanced")

    district_price = latest_price_per_sqm(district)
    premium_pct = 0.0
    if district_price > 0 and asking_price_per_sqm > 0:
        premium_pct = (asking_price_per_sqm / district_price - 1.0) * 100.0

    custom_score = float(district["riskScore"])
    if asking_price_per_sqm > 0:
        if premium_pct >= 25:
            custom_score += 9
        elif premium_pct >= 10:
            custom_score += 5
        elif premium_pct <= -10:
            custom_score -= 4

    if priority == "cashflow":
        custom_score += float(district["priceBurdenRiskScore"]) * 0.08
    elif priority == "growth":
        custom_score += float(district["volatilityRiskScore"]) * 0.04
    else:
        custom_score += float(district["competitionRiskScore"]) * 0.03

    if holding_months <= 24:
        custom_score += float(district["liquidityRiskScore"]) * 0.08
    elif holding_months >= 60:
        custom_score -= 2

    custom_score = max(0.0, min(100.0, round(custom_score, 1)))

    if custom_score >= 75:
        verdict = "매입 보류"
    elif custom_score >= 60:
        verdict = "강한 비교 필요"
    elif custom_score >= 45:
        verdict = "보수 검토"
    else:
        verdict = "추가 검토 가능"

    premium_message = (
        f"입력한 가격선은 최근 {district['name']} 중위 체결선 대비 {premium_pct:+.1f}%입니다."
        if asking_price_per_sqm > 0 and district_price > 0
        else "가격선을 입력하지 않아 현재 구 리스크를 기준으로만 판단했습니다."
    )

    reasons = list(district.get("objections", []))
    if premium_pct >= 25:
        reasons.insert(0, "입력한 매입가가 최근 구 평균 체결선보다 크게 높습니다.")
    elif premium_pct <= -10:
        reasons.insert(0, "가격선은 낮지만 다른 리스크 축은 그대로 남아 있습니다.")
    reasons.insert(0, district.get("decisionQuestion", "이 구를 지금 사도 되는지 먼저 다시 물어봐야 합니다."))

    checks = list(district.get("reviewChecklist", []))
    if holding_months <= 24:
        checks.insert(0, "보유 기간이 짧다면 최근 거래 회전 속도를 더 엄격하게 보세요.")
    if district.get("lowSampleFlag"):
        checks.insert(0, "최근 거래 표본이 적어 인근 대체 구와 병행 비교가 필요합니다.")

    return (
        {
            "districtName": district["name"],
            "districtCode": district["code"],
            "verdict": verdict,
            "customRiskScore": custom_score,
            "askingPricePerSqm": asking_price_per_sqm,
            "districtMedianPricePerSqm": district_price,
            "premiumPct": round(premium_pct, 1),
            "priority": priority,
            "holdingMonths": holding_months,
            "summary": premium_message,
            "riskArchetype": district["riskArchetype"],
            "archetypeSummary": district["archetypeSummary"],
            "recommendedAction": district["recommendedAction"],
            "reasons": reasons[:4],
            "checks": checks[:4],
            "replacementCandidates": district.get("replacementCandidates", [])[:3],
            "baseDistrict": district,
        },
        HTTPStatus.OK,
    )


def build_review_record(payload: dict[str, object], body: dict[str, object]) -> tuple[dict[str, object], HTTPStatus]:
    asset_name = str(body.get("assetName", "")).strip()
    district_code = str(body.get("districtCode", "")).strip()
    if not asset_name or not district_code:
        return {"error": "assetName and districtCode are required"}, HTTPStatus.BAD_REQUEST

    total_price = float(body.get("askingPriceTotal10k", 0) or 0)
    exclusive_area = float(body.get("exclusiveAreaSqm", 0) or 0)
    asking_price_per_sqm = float(body.get("askingPricePerSqm", 0) or 0)
    if asking_price_per_sqm <= 0 and total_price > 0 and exclusive_area > 0:
        asking_price_per_sqm = total_price / exclusive_area

    assessment_body = {
        "districtCode": district_code,
        "askingPricePerSqm": asking_price_per_sqm,
        "holdingMonths": int(body.get("holdingMonths", 36) or 36),
        "priority": str(body.get("priority", "balanced") or "balanced"),
    }
    assessment, status = build_assessment(payload, assessment_body)
    if int(status) != 200:
        return assessment, status

    review = {
        "id": f"review-{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
        "createdAt": datetime.now().isoformat(timespec="seconds"),
        "assetName": asset_name,
        "districtCode": district_code,
        "districtName": assessment["districtName"],
        "adminDongName": str(body.get("adminDongName", "") or "").strip(),
        "askingPriceTotal10k": round(total_price, 1) if total_price else 0.0,
        "exclusiveAreaSqm": round(exclusive_area, 1) if exclusive_area else 0.0,
        "askingPricePerSqm": round(asking_price_per_sqm, 1) if asking_price_per_sqm else 0.0,
        "holdingMonths": assessment["holdingMonths"],
        "priority": assessment["priority"],
        "targetTenant": str(body.get("targetTenant", "") or "").strip(),
        "memo": str(body.get("memo", "") or "").strip(),
        "verdict": assessment["verdict"],
        "customRiskScore": assessment["customRiskScore"],
        "premiumPct": assessment["premiumPct"],
        "riskArchetype": assessment["riskArchetype"],
        "recommendedAction": assessment["recommendedAction"],
        "summary": assessment["summary"],
        "reasons": assessment["reasons"],
        "checks": assessment["checks"],
        "replacementCandidates": assessment["replacementCandidates"],
    }
    return review, HTTPStatus.OK


def persist_review(review: dict[str, object], path: Path = REVIEW_STORE_PATH) -> dict[str, object]:
    reviews = load_reviews(path)
    reviews.insert(0, review)
    save_reviews(reviews[:24], path)
    return review


class RedTeamRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api(parsed)
            return

        if parsed.path in {"", "/"}:
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            self.write_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)
            return

        content_length = int(self.headers.get("Content-Length", "0") or 0)
        raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            body = json.loads(raw_body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self.write_json({"error": "Invalid JSON body"}, status=HTTPStatus.BAD_REQUEST)
            return

        payload = cached_payload()
        if parsed.path == "/api/assessment":
            result, status = build_assessment(payload, body)
            self.write_json(result, status=status)
            return
        if parsed.path == "/api/reviews":
            review, status = build_review_record(payload, body)
            if int(status) != 200:
                self.write_json(review, status=status)
                return
            self.write_json(persist_review(review), status=HTTPStatus.CREATED)
            return

        self.write_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)

    def handle_api(self, parsed) -> None:
        payload = cached_payload()
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/bootstrap":
            self.write_json(bootstrap_payload(payload))
            return
        if path == "/api/summary":
            self.write_json(payload["summary"])
            return
        if path == "/api/case-studies":
            self.write_json(payload["caseStudies"])
            return
        if path == "/api/demand-fragility":
            self.write_json(payload["demandFragility"])
            return
        if path == "/api/admin-dongs":
            self.write_json(payload["adminDongSaturation"])
            return
        if path == "/api/methodology":
            self.write_json(payload["methodology"])
            return
        if path == "/api/content":
            self.write_json(payload["content"])
            return
        if path == "/api/site":
            self.write_json(payload["site"])
            return
        if path == "/api/archetypes":
            self.write_json(payload["archetypes"])
            return
        if path == "/api/reviews":
            self.write_json(load_reviews())
            return
        if path == "/api/compare":
            codes = query.get("codes", [""])[0]
            code_list = [item.strip() for item in codes.split(",") if item.strip()]
            self.write_json(build_compare_payload(payload, code_list))
            return
        if path.startswith("/api/districts/"):
            district_code = path.rsplit("/", 1)[-1]
            district = district_by_code(payload, district_code)
            if district is None:
                self.write_json({"error": "District not found"}, status=HTTPStatus.NOT_FOUND)
                return
            self.write_json(district)
            return
        if path == "/api/districts":
            self.write_json(payload["districts"])
            return

        self.write_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)

    def write_json(self, body: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main() -> int:
    args = parse_args()
    cached_payload()
    ensure_review_store()
    server = ThreadingHTTPServer((args.host, args.port), RedTeamRequestHandler)
    print(f"Serving Korean red-team site at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
