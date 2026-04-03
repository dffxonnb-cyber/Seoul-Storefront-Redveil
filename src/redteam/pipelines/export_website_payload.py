from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[3]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from redteam.utils.paths import project_root


GRADE_KR = {
    "Low": "낮음",
    "Moderate": "보통",
    "High": "높음",
    "Very High": "매우 높음",
}

RELIABILITY_KR = {
    "High": "높음",
    "Medium": "보통",
    "Low": "낮음",
}

PHRASE_KR = {
    "pricing looks stretched relative to district peers": "같은 권역 대비 매입 가격 부담이 큽니다",
    "merchant saturation is elevated": "상권 내 점포 과밀도가 높습니다",
    "recent transaction pricing is unstable": "최근 실거래 가격 변동성이 큽니다",
    "transaction liquidity is weakening": "거래 유동성이 약해지고 있습니다",
    "the latest storefront transaction sample is thin": "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다",
    "no single risk pillar dominates, but the district still requires case-specific review": "한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다",
    "sales efficiency versus foot traffic is weak": "유동인구 대비 매출 효율이 낮습니다",
    "floating demand appears thin relative to the number of active service categories": "업종 수에 비해 유효 수요가 얇습니다",
    "average sales value per transaction is weak": "건당 매출 규모가 약합니다",
    "service mix breadth is narrow for a resilient trade area": "업종 구성이 좁아 회복 탄력이 약합니다",
    "the area relies on a low floating-population denominator, so demand evidence is unstable": "유동인구 표본이 작아 수요 해석이 불안정합니다",
    "demand signals are not flashing red, but the area still needs district-level acquisition context": "수요 지표만으로는 충분하지 않아 구 단위 매입 맥락이 필요합니다",
    "lower overall acquisition risk": "총 매입 리스크가 더 낮습니다",
    "stronger transaction liquidity": "거래 유동성이 더 안정적입니다",
    "lighter merchant saturation": "상권 과밀도가 더 낮습니다",
    "better peer balance across current risk pillars": "리스크 축 간 균형이 더 좋습니다",
    "verify whether recent asking prices still clear at transaction levels": "현재 호가가 최근 실거래 레벨에서 실제로 체결되는지 확인하세요",
    "walk the main admin-dong corridors and count duplicate tenant formats": "핵심 행정동 골목을 돌며 중복 업종 밀도를 직접 확인하세요",
    "review large outlier trades and separate whole-building deals from strata units": "대형 이상 거래와 집합상가 거래를 구분해서 다시 보세요",
    "check whether broker inventory is rising while closed deals are slowing": "중개 매물은 늘고 실제 체결은 줄고 있는지 점검하세요",
    "validate recent tenant replacement velocity and broker inventory before underwriting": "최종 검토 전 임차인 교체 속도와 중개 재고를 확인하세요",
}


def load_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Required file was not found: {path}")
    return pd.read_csv(path)


def to_float(value: object, default: float = 0.0) -> float:
    if pd.isna(value):
        return default
    return float(value)


def to_int(value: object, default: int = 0) -> int:
    if pd.isna(value):
        return default
    return int(float(value))


def format_month(value: object) -> str:
    raw = str(value)
    if len(raw) == 6 and raw.isdigit():
        return f"{raw[:4]}.{raw[4:]}"
    return raw


def split_phrases(text: object) -> list[str]:
    if pd.isna(text):
        return []
    return [part.strip() for part in str(text).split(";") if part.strip()]


def translate_phrase(text: str) -> str:
    translated = text.strip()
    for source, target in PHRASE_KR.items():
        translated = translated.replace(source, target)
    return translated


def risk_grade_kr(grade: object) -> str:
    return GRADE_KR.get(str(grade), str(grade))


def reliability_kr(value: object) -> str:
    return RELIABILITY_KR.get(str(value), str(value))


def build_korean_summary(row: pd.Series) -> str:
    parts: list[str] = []
    if to_float(row.get("price_burden_risk_score")) >= 80:
        parts.append(
            f"가격 부담 점수 {to_float(row.get('price_burden_risk_score')):.1f}점으로 상위권입니다"
        )
    if to_float(row.get("liquidity_risk_score")) >= 70:
        parts.append(
            f"거래 유동성 점수 {to_float(row.get('liquidity_risk_score')):.1f}점으로 단기 회전이 불리합니다"
        )
    if to_float(row.get("competition_risk_score")) >= 70:
        parts.append(
            f"상권 과밀 점수 {to_float(row.get('competition_risk_score')):.1f}점으로 경쟁 압박이 큽니다"
        )
    if to_float(row.get("volatility_risk_score")) >= 70:
        parts.append("최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다")
    if bool(row.get("low_sample_flag", False)):
        parts.append("최근 표본이 적어 현장 검증 비중을 높여야 합니다")
    if not parts:
        parts.append("즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다")
    return " / ".join(parts[:3])


def build_risk_archetype(row: pd.Series) -> dict[str, str]:
    price = to_float(row.get("price_burden_risk_score"))
    liquidity = to_float(row.get("liquidity_risk_score"))
    competition = to_float(row.get("competition_risk_score"))
    volatility = to_float(row.get("volatility_risk_score"))

    if price >= 85 and volatility >= 70:
        return {
            "label": "고가 선행형",
            "summary": "가격이 먼저 뛰고 변동성도 큰 유형입니다. 중개사 설명보다 최근 체결 레벨 확인이 우선입니다.",
            "question": "호가가 최근 거래선보다 앞서 있는지 먼저 확인해야 합니다.",
            "action": "실거래 3건 이상 재확인 후 대체 구와 가격선을 비교하세요.",
        }
    if liquidity >= 70:
        return {
            "label": "거래 둔화형",
            "summary": "매물은 보이지만 거래가 얇아지는 유형입니다. 단기 회전과 매도 유동성이 약할 수 있습니다.",
            "question": "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검해야 합니다.",
            "action": "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
        }
    if competition >= 70:
        return {
            "label": "과밀 경쟁형",
            "summary": "입지는 익숙하지만 이미 상권 과밀이 높은 유형입니다. 임차인 교체 속도가 수익을 좌우합니다.",
            "question": "같은 형식의 점포가 얼마나 중복되어 있는지 확인해야 합니다.",
            "action": "핵심 행정동을 돌며 중복 업종과 공실 교체 패턴을 직접 확인하세요.",
        }
    if volatility >= 70:
        return {
            "label": "가격 변동형",
            "summary": "가격 레벨은 버틸 수 있어도 최근 체결선이 불안정한 유형입니다.",
            "question": "최근 몇 건이 전체 시장을 왜곡한 이상 거래인지 살펴봐야 합니다.",
            "action": "대형 거래와 집합상가 거래를 분리해 재해석하세요.",
        }
    return {
        "label": "복합 점검형",
        "summary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
        "question": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
        "action": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
    }


def build_review_checklist(row: pd.Series, archetype: dict[str, str]) -> list[str]:
    checklist = [
        archetype["action"],
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요.",
    ]
    if bool(row.get("low_sample_flag", False)):
        checklist.insert(0, "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.")
    return checklist[:4]


def build_red_team_memo_kr(row: pd.Series, replacement_names: list[str], archetype: dict[str, str]) -> str:
    replacements = ", ".join(replacement_names) if replacement_names else "대체 후보 없음"
    sample_line = ""
    if bool(row.get("low_sample_flag", False)):
        sample_line = " 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다."
    return (
        f"{row['district_name']}는 {to_float(row['overall_acquisition_risk_score']):.1f}점,"
        f" '{risk_grade_kr(row['acquisition_risk_grade'])}' 구간입니다. "
        f"현재 이 구의 대표 유형은 '{archetype['label']}'이며, "
        f"핵심 반대 근거는 {', '.join(translate_phrase(part) for part in split_phrases(row['primary_red_team_objections'])[:3])}입니다. "
        f"지금 바로 매입 결정을 내리기보다 {replacements}를 먼저 비교하는 것이 안전합니다.{sample_line}"
    )


def build_summary_metrics(
    acquisition_df: pd.DataFrame,
    raw_sales_df: pd.DataFrame,
    demand_df: pd.DataFrame,
    admin_dong_df: pd.DataFrame,
    case_df: pd.DataFrame,
) -> dict[str, object]:
    latest_month = format_month(acquisition_df["deal_year_month"].max())
    low_sample_count = int(acquisition_df["low_sample_flag"].astype(str).str.lower().eq("true").sum())
    top_row = acquisition_df.sort_values("overall_acquisition_risk_score", ascending=False).iloc[0]
    return {
        "latestMonth": latest_month,
        "transactionCount": len(raw_sales_df),
        "districtCount": int(acquisition_df["district_code"].nunique()),
        "tradeAreaCount": int(demand_df["trade_area_code"].nunique()),
        "adminDongCount": int(admin_dong_df["admin_dong_code"].nunique()),
        "lowSampleDistrictCount": low_sample_count,
        "caseStudyCount": len(case_df),
        "highestRiskDistrict": {
            "name": str(top_row["district_name"]),
            "score": round(to_float(top_row["overall_acquisition_risk_score"]), 1),
            "grade": risk_grade_kr(top_row["acquisition_risk_grade"]),
        },
    }


def build_district_payload(
    acquisition_df: pd.DataFrame,
    memo_df: pd.DataFrame,
    candidates_df: pd.DataFrame,
    history_df: pd.DataFrame,
) -> list[dict[str, object]]:
    acquisition_df = acquisition_df.copy()
    memo_df = memo_df.copy()
    candidates_df = candidates_df.copy()
    history_df = history_df.copy()

    acquisition_df["district_code"] = acquisition_df["district_code"].astype(str).str.zfill(5)
    memo_df["district_code"] = memo_df["district_code"].astype(str).str.zfill(5)
    candidates_df["source_district_code"] = candidates_df["source_district_code"].astype(str).str.zfill(5)
    history_df["district_code"] = history_df["district_code"].astype(str).str.zfill(5)

    memo_map = memo_df.set_index("district_code")
    candidates_grouped = candidates_df.groupby("source_district_code", dropna=False)
    history_grouped = history_df.groupby("district_code", dropna=False)

    districts: list[dict[str, object]] = []
    for row in acquisition_df.sort_values("overall_acquisition_risk_score", ascending=False).itertuples(index=False):
        district_code = str(row.district_code).zfill(5)
        candidate_rows = (
            candidates_grouped.get_group(district_code).sort_values("candidate_rank")
            if district_code in candidates_grouped.groups
            else pd.DataFrame()
        )
        replacement_candidates = [
            {
                "rank": to_int(candidate.candidate_rank),
                "name": str(candidate.candidate_district_name),
                "score": round(to_float(candidate.candidate_acquisition_risk_score), 1),
                "liquidityScore": round(to_float(candidate.candidate_liquidity_risk_score), 1),
                "competitionScore": round(to_float(candidate.candidate_competition_risk_score), 1),
                "whyBetter": ", ".join(
                    translate_phrase(part) for part in split_phrases(candidate.candidate_why_better)
                ),
            }
            for candidate in candidate_rows.itertuples(index=False)
        ]

        history_rows = (
            history_grouped.get_group(district_code).sort_values("deal_year_month")
            if district_code in history_grouped.groups
            else pd.DataFrame()
        )
        history = [
            {
                "month": format_month(item.deal_year_month),
                "transactionCount": to_int(item.transaction_count),
                "medianPricePerSqm": round(to_float(item.median_price_per_sqm_10k_krw), 1),
                "priceGrowth6mPct": round(to_float(item.price_growth_6m_pct), 1),
                "transactionDropVs6mPct": round(to_float(item.transaction_drop_vs_6m_pct), 1),
            }
            for item in history_rows.itertuples(index=False)
        ]

        row_series = pd.Series(row._asdict())
        archetype = build_risk_archetype(row_series)
        memo_text = ""
        if district_code in memo_map.index:
            memo_row = pd.Series(memo_map.loc[district_code])
            memo_text = build_red_team_memo_kr(
                memo_row,
                [candidate["name"] for candidate in replacement_candidates],
                archetype,
            )

        districts.append(
            {
                "code": district_code,
                "name": str(row.district_name),
                "riskScore": round(to_float(row.overall_acquisition_risk_score), 1),
                "riskGrade": risk_grade_kr(row.acquisition_risk_grade),
                "transactionRiskScore": round(to_float(row.overall_transaction_risk_score), 1),
                "priceBurdenRiskScore": round(to_float(row.price_burden_risk_score), 1),
                "liquidityRiskScore": round(to_float(row.liquidity_risk_score), 1),
                "volatilityRiskScore": round(to_float(row.volatility_risk_score), 1),
                "competitionRiskScore": round(to_float(row.competition_risk_score), 1),
                "competitionRiskGrade": risk_grade_kr(row.competition_risk_grade),
                "sampleReliability": reliability_kr(row.sample_reliability),
                "lowSampleFlag": str(row.low_sample_flag).lower() == "true",
                "foodStoreSharePct": round(to_float(row.food_store_share) * 100, 1),
                "storesPerAdminDong": round(to_float(row.stores_per_admin_dong), 1),
                "topCategories": str(row.top_3_small_categories),
                "objections": [translate_phrase(part) for part in split_phrases(row.primary_red_team_objections)],
                "riskSummary": build_korean_summary(row_series),
                "memo": memo_text,
                "riskArchetype": archetype["label"],
                "archetypeSummary": archetype["summary"],
                "decisionQuestion": archetype["question"],
                "recommendedAction": archetype["action"],
                "reviewChecklist": build_review_checklist(row_series, archetype),
                "replacementCandidates": replacement_candidates,
                "history": history,
            }
        )

    return districts


def build_case_study_payload(case_df: pd.DataFrame, districts: list[dict[str, object]]) -> list[dict[str, object]]:
    district_map = {item["name"]: item for item in districts}
    payload: list[dict[str, object]] = []
    for row in case_df.itertuples(index=False):
        district = district_map.get(str(row.district_name))
        payload.append(
            {
                "name": str(row.district_name),
                "riskScore": round(to_float(row.acquisition_risk_score), 1),
                "riskGrade": risk_grade_kr(row.acquisition_risk_grade),
                "transactionRiskScore": round(to_float(row.transaction_risk_score), 1),
                "competitionRiskScore": round(to_float(row.competition_risk_score), 1),
                "priceBurdenRiskScore": round(to_float(row.price_burden_risk_score), 1),
                "liquidityRiskScore": round(to_float(row.liquidity_risk_score), 1),
                "volatilityRiskScore": round(to_float(row.volatility_risk_score), 1),
                "sampleReliability": reliability_kr(row.sample_reliability),
                "lowSampleFlag": str(row.low_sample_flag).lower() == "true",
                "latestMonth": format_month(row.latest_month),
                "latestTransactionCount": to_int(row.latest_transaction_count),
                "latestMedianPricePerSqm": round(to_float(row.latest_median_price_per_sqm_10k_krw), 1),
                "sixMonthPriceChangePct": round(to_float(row.six_month_price_change_pct), 1),
                "sixMonthTransactionChangePct": round(to_float(row.six_month_transaction_change_pct), 1),
                "objections": [translate_phrase(part) for part in split_phrases(row.primary_red_team_objections)],
                "riskSummary": translate_phrase(str(row.risk_summary)),
                "topCategories": str(row.top_3_small_categories),
                "replacementCandidates": [item.strip() for item in str(row.replacement_candidates).split("|") if item.strip()],
                "fieldChecks": [translate_phrase(part) for part in split_phrases(str(row.field_checks))],
                "riskArchetype": district["riskArchetype"] if district else "복합 점검형",
            }
        )
    return payload


def build_demand_payload(demand_df: pd.DataFrame, top_n: int = 12) -> list[dict[str, object]]:
    top_df = demand_df.sort_values("demand_fragility_risk_score", ascending=False).head(top_n)
    return [
        {
            "name": str(row.trade_area_name),
            "type": str(row.trade_area_type_name),
            "quarter": str(row.quarter_code),
            "riskScore": round(to_float(row.demand_fragility_risk_score), 1),
            "riskGrade": risk_grade_kr(row.demand_fragility_grade),
            "floatingPopulation": round(to_float(row.floating_population), 0),
            "salesAmount": to_int(row.total_sales_amount),
            "serviceCount": to_int(row.unique_service_count),
            "objection": translate_phrase(str(row.red_team_objection)),
        }
        for row in top_df.itertuples(index=False)
    ]


def build_admin_dong_payload(admin_dong_df: pd.DataFrame, top_n: int = 12) -> list[dict[str, object]]:
    top_df = admin_dong_df.sort_values("total_store_count", ascending=False).head(top_n)
    return [
        {
            "districtName": str(row.district_name),
            "name": str(row.admin_dong_name),
            "totalStoreCount": to_int(row.total_store_count),
            "foodStoreSharePct": round(to_float(row.food_store_share) * 100, 1),
            "categoryCount": to_int(row.unique_small_category_count),
            "topCategories": str(row.top_3_small_categories),
        }
        for row in top_df.itertuples(index=False)
    ]


def build_archetype_payload(districts: list[dict[str, object]]) -> list[dict[str, object]]:
    counter = Counter(item["riskArchetype"] for item in districts)
    examples_map: dict[str, list[str]] = {}
    for district in districts:
        examples = examples_map.setdefault(district["riskArchetype"], [])
        if len(examples) < 3:
            examples.append(district["name"])

    archetype_copy = {
        "고가 선행형": "가격이 먼저 뛰어 실제 체결선보다 기대 호가가 앞서는 구간입니다.",
        "거래 둔화형": "매도·매수 회전이 느려져 단기 보유 전략에 불리한 구간입니다.",
        "과밀 경쟁형": "이미 유사 업종이 많아 임차인 유지력이 수익률을 좌우하는 구간입니다.",
        "가격 변동형": "거래는 되더라도 가격선이 불안정해 해석 오류가 생기기 쉬운 구간입니다.",
        "복합 점검형": "한 축보다는 여러 축이 중간 수준으로 겹쳐 개별 매물 검토가 중요한 구간입니다.",
    }

    return [
        {
            "name": name,
            "count": counter[name],
            "description": archetype_copy.get(name, ""),
            "examples": examples_map.get(name, []),
        }
        for name, _ in counter.most_common()
    ]


def build_content(summary: dict[str, object], latest_month: str) -> dict[str, object]:
    return {
        "thesis": {
            "headline": "좋아 보이는 구를 추천하는 대신, 지금 사면 안 되는 근거를 먼저 보여줍니다.",
            "body": "서울 소형 상가 투자 판단은 아직도 입지 서사와 중개사 설명에 크게 의존합니다. 이 서비스는 그 반대편에서 출발합니다. 가격이 이미 선행했는지, 거래가 둔화되고 있는지, 상권이 과밀한지, 수요가 실제로 버틸 수 있는지부터 묻습니다.",
        },
        "northStar": {
            "title": "잘못된 매입을 줄이는 의사결정 도구",
            "body": "이 서비스의 목표는 좋은 매물을 대신 골라주는 것이 아니라, 사지 말아야 할 순간을 더 빨리 포착하게 만드는 것입니다.",
        },
        "personas": [
            {
                "title": "개인 투자자",
                "description": "3억~15억 사이 소형 상가를 검토하는 개인 투자자입니다. 현장 답사 전에 빠른 1차 반대 논리가 필요합니다.",
            },
            {
                "title": "중개 실무자",
                "description": "고객에게 단순 추천 대신 반대 근거와 대체 지역을 함께 제시해야 하는 실무자입니다.",
            },
            {
                "title": "분석형 PM/애널리스트",
                "description": "공공 데이터 기반 판단 엔진을 제품으로 연결하는 방식을 확인하려는 사용자입니다.",
            },
        ],
        "useCases": [
            {
                "title": "현장 답사 전 1차 거르기",
                "description": "검토 중인 매물을 입력하고 3분 안에 보류·비교·추가 검토 여부를 판단합니다.",
            },
            {
                "title": "중개사 제안 검증",
                "description": "중개사가 추천한 구를 리스크 유형과 최근 거래 흐름으로 다시 검증합니다.",
            },
            {
                "title": "대체 후보 탐색",
                "description": "같은 예산 안에서 리스크가 한 단계 낮은 대체 구를 찾습니다.",
            },
        ],
        "principles": [
            {"title": "Objection-first", "body": "장점보다 반대 근거를 먼저 보여줍니다."},
            {"title": "Explainable", "body": "모든 점수는 보이는 지표와 연결됩니다."},
            {"title": "Comparable", "body": "대체 후보가 있어야 경고가 실제 의사결정으로 이어집니다."},
            {"title": "Actionable", "body": "경고는 현장 검증 체크리스트로 이어져야 합니다."},
        ],
        "modules": [
            {"title": "내 매물 검토", "body": "검토 중인 매물을 저장하고 개인화 진단 결과를 기록합니다."},
            {"title": "3분 진단", "body": "보유 기간, 가격선, 우선순위를 반영한 빠른 매입 판단을 제공합니다."},
            {"title": "후보 비교", "body": "2~3개 구를 같은 프레임에서 비교해 대체 선택지를 보여줍니다."},
            {"title": "구 리포트", "body": "구별 메모, 하위 점수, 최근 12개월 추세를 한 번에 읽습니다."},
        ],
        "decisionStages": [
            {"title": "1차 필터링", "body": "매물 등록 후 보류·비교·추가 검토 중 무엇이 맞는지 즉시 결정합니다."},
            {"title": "현장 검증", "body": "리스크 유형에 맞는 체크리스트로 현장 답사 질문을 좁힙니다."},
            {"title": "대체 검토", "body": "같은 예산에서 더 안전한 대체 구를 병행 비교합니다."},
            {"title": "최종 메모", "body": "매입 여부를 문장형 메모로 남기고 다음 액션을 기록합니다."},
        ],
        "trustSignals": [
            {
                "title": "실거래 12,074건 기반",
                "body": f"{latest_month} 기준 최근 12개월 서울 상업업무용 실거래를 집계했습니다.",
            },
            {
                "title": "25개 구 전수 커버",
                "body": "구 단위 리스크와 대체 후보를 전부 같은 규칙으로 계산했습니다.",
            },
            {
                "title": "행정동 428개·상권 1,570개",
                "body": "행정동 과밀도와 상권 수요 취약 신호를 병행 추적합니다.",
            },
            {
                "title": "저표본 경고 명시",
                "body": f"최근 표본이 얇은 {summary['lowSampleDistrictCount']}개 구는 신뢰도 경고를 붙였습니다.",
            },
        ],
        "serviceBlueprint": [
            "유입: 구 검색이나 매물 등록에서 서비스 시작",
            "진단: 가격·유동성·과밀·변동성 기반 1차 판정 제공",
            "검증: 유형별 체크리스트와 최근 거래 추세 확인",
            "비교: 더 안전한 대체 구와 병행 검토",
            "기록: 검토 결과를 저장하고 다음 액션으로 연결",
        ],
        "roadmap": [
            "1단계: 구 리포트와 빠른 진단을 연결하는 매물 검토 흐름 구축",
            "2단계: 저장된 검토 이력과 현장 메모를 붙여 실제 워크플로우화",
            "3단계: 행정동·상권 레벨 추천과 공유용 리포트 출력 기능 추가",
        ],
        "faq": [
            {
                "question": "이 서비스가 좋은 구를 추천해주나요?",
                "answer": "아닙니다. 먼저 매입을 멈춰야 할 이유를 보여주고, 그 다음에 비교 가능한 대체 구를 제시합니다.",
            },
            {
                "question": "개별 건물의 정확한 수익률을 예측하나요?",
                "answer": "아닙니다. 이 서비스는 매입 전 1차 진단과 비교 판단을 위한 도구이며, 임대차·건물 상태는 별도 검증이 필요합니다.",
            },
            {
                "question": "왜 수요 데이터와 거래 데이터 시점이 다르나요?",
                "answer": "거래는 2025.04~2026.03, 상권 수요 데이터는 2024 스냅샷을 사용했습니다. 서비스와 문서에 시점 차이를 명시했습니다.",
            },
        ],
        "dataSources": [
            {
                "name": "국토교통부 상업업무용 실거래가",
                "role": "최근 12개월 가격 부담, 유동성, 변동성 산출",
                "window": "2025.04~2026.03",
            },
            {
                "name": "서울시 상권분석서비스(추정매출·길단위인구)",
                "role": "상권 수요 취약성 신호와 매출 효율 분석",
                "window": "2024",
            },
            {
                "name": "소상공인시장진흥공단 상가(상권)정보",
                "role": "행정동 점포 밀도와 과밀 경쟁도 계산",
                "window": "2025.12 기준 파일",
            },
        ],
        "limitations": [
            "개별 건물의 임대차 조건, 공실 기간, 관리 상태는 포함하지 않았습니다.",
            "수요 데이터와 거래 데이터의 시점이 완전히 일치하지 않습니다.",
            "현재는 서울 구 단위를 중심으로 매입 판단을 지원합니다.",
        ],
        "glossary": [
            {"term": "매입 리스크", "definition": "가격 부담, 거래 유동성, 가격 변동성, 상권 과밀을 합친 종합 경고 점수입니다."},
            {"term": "저표본 경고", "definition": "최근 거래 표본이 얇아 해석 안정성이 낮은 구에 부여하는 경고입니다."},
            {"term": "대체 후보", "definition": "같은 프레임에서 비교했을 때 리스크가 유의미하게 낮은 구입니다."},
        ],
        "architecture": [
            "Python 파이프라인이 실거래·상권 데이터를 가공합니다.",
            "정리된 CSV를 웹사이트 payload로 변환합니다.",
            "Python 백엔드가 JSON API와 정적 페이지를 함께 서빙합니다.",
            "프론트엔드는 매물 검토·비교·리포트 탐색을 분리된 페이지로 제공합니다.",
        ],
    }


def build_methodology() -> dict[str, object]:
    return {
        "problemStatement": "이 서비스는 서울 소형 상가 투자 판단에서 반복되는 실패 패턴, 즉 가격 서사에 먼저 설득되고 반대 근거를 늦게 확인하는 문제를 해결하려고 합니다.",
        "pillars": [
            "가격 부담: 같은 구의 최근 체결 가격선 대비 부담이 큰가",
            "거래 유동성: 최근 거래 수가 줄며 회전이 둔화되는가",
            "가격 변동성: 일부 이상 거래가 가격선을 왜곡하는가",
            "상권 과밀: 이미 유사 업종과 점포 밀도가 높아 경쟁 압박이 큰가",
        ],
        "outputs": [
            "구 단위 종합 리스크 점수",
            "리스크 유형(고가 선행형·거래 둔화형 등)",
            "문장형 레드팀 메모",
            "대체 구 추천",
            "현장 검증 체크리스트",
        ],
    }


def build_payload(root: Path) -> dict[str, object]:
    acquisition_df = load_csv(root / "data" / "red_team" / "seoul_district_acquisition_risk.csv")
    memo_df = load_csv(root / "data" / "red_team" / "seoul_district_red_team_memo.csv")
    candidates_df = load_csv(root / "data" / "red_team" / "seoul_replacement_candidates.csv")
    demand_df = load_csv(root / "data" / "red_team" / "seoul_trade_area_demand_fragility.csv")
    case_df = load_csv(root / "data" / "processed" / "case_study_snapshots.csv")
    raw_sales_df = load_csv(root / "data" / "raw" / "molit_commercial_sales" / "seoul_commercial_sales.csv")
    history_df = load_csv(root / "data" / "processed" / "seoul_transaction_risk_history.csv")
    admin_dong_df = load_csv(root / "data" / "external" / "processed" / "seoul_store_competition_by_admin_dong.csv")

    latest_month = format_month(acquisition_df["deal_year_month"].max())
    districts = build_district_payload(acquisition_df, memo_df, candidates_df, history_df)
    summary = build_summary_metrics(acquisition_df, raw_sales_df, demand_df, admin_dong_df, case_df)

    return {
        "site": {
            "title": "서울 상가 투자 레드팀",
            "subtitle": "매물 검토 전에 사지 말아야 할 이유를 먼저 보여주는 서울 상가 매입 판단 서비스",
            "latestMonth": latest_month,
            "timeCaveat": "거래 데이터는 2025.04~2026.03, 상권 수요 데이터는 2024 스냅샷입니다.",
            "sampleCaveat": "최근 거래 표본이 얇은 구는 신뢰도 경고를 함께 표시합니다.",
            "primaryCta": {"label": "내 매물 검토 시작", "href": "./review.html"},
            "secondaryCta": {"label": "3분 진단 체험", "href": "./assessment.html"},
        },
        "summary": summary,
        "districts": districts,
        "caseStudies": build_case_study_payload(case_df, districts),
        "demandFragility": build_demand_payload(demand_df),
        "adminDongSaturation": build_admin_dong_payload(admin_dong_df),
        "archetypes": build_archetype_payload(districts),
        "content": build_content(summary, latest_month),
        "methodology": build_methodology(),
    }


def main() -> None:
    root = project_root()
    payload = build_payload(root)
    output_dir = root / "data" / "website"
    output_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / "website_payload.json"
    js_path = output_dir / "website_payload.js"

    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    js_path.write_text(
        f"window.__RED_TEAM_PAYLOAD__ = {json.dumps(payload, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"Saved website payload to {json_path}")


if __name__ == "__main__":
    main()
