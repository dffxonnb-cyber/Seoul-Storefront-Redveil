window.__RED_TEAM_PAYLOAD__ = {
  "site": {
    "title": "Redveil",
    "subtitle": "서울 소형 상가 매입 리스크 판별 서비스",
    "tagline": "Uncover hidden risks before acquisition.",
    "latestMonth": "2026.03",
    "timeCaveat": "거래 데이터는 2025.04~2026.03, 상권 수요 데이터는 2024 스냅샷입니다.",
    "sampleCaveat": "최근 거래 표본이 얇은 구는 신뢰도 경고를 함께 표시합니다.",
    "primaryCta": {
      "label": "내 매물 검토 시작",
      "href": "./review.html"
    },
    "secondaryCta": {
      "label": "3분 진단 체험",
      "href": "./assessment.html"
    }
  },
  "summary": {
    "latestMonth": "2026.03",
    "transactionCount": 12074,
    "districtCount": 25,
    "tradeAreaCount": 1570,
    "adminDongCount": 428,
    "lowSampleDistrictCount": 8,
    "caseStudyCount": 3,
    "highestRiskDistrict": {
      "name": "서초구",
      "score": 78.9,
      "grade": "매우 높음"
    }
  },
  "districts": [
    {
      "code": "11650",
      "name": "서초구",
      "riskScore": 78.9,
      "riskGrade": "매우 높음",
      "transactionRiskScore": 85.2,
      "priceBurdenRiskScore": 98.6,
      "liquidityRiskScore": 52.9,
      "volatilityRiskScore": 100.0,
      "competitionRiskScore": 71.2,
      "competitionRiskGrade": "높음",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 17.1,
      "storesPerAdminDong": 2160.7,
      "topCategories": "경영 컨설팅업:2710 | 변호사:2678 | 부동산 중개/대리업:2094",
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "상권 내 점포 과밀도가 높습니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "가격 부담 점수 98.6점으로 상위권입니다 / 상권 과밀 점수 71.2점으로 경쟁 압박이 큽니다 / 최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "서초구는 78.9점, '매우 높음' 구간입니다. 현재 이 구의 대표 유형은 '고가 선행형'이며, 핵심 반대 근거는 같은 권역 대비 매입 가격 부담이 큽니다, 상권 내 점포 과밀도가 높습니다, 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 금천구, 관악구, 양천구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "고가 선행형",
      "archetypeSummary": "가격이 먼저 뛰고 변동성도 큰 유형입니다. 중개사 설명보다 최근 체결 레벨 확인이 우선입니다.",
      "decisionQuestion": "호가가 최근 거래선보다 앞서 있는지 먼저 확인해야 합니다.",
      "recommendedAction": "실거래 3건 이상 재확인 후 대체 구와 가격선을 비교하세요.",
      "reviewChecklist": [
        "실거래 3건 이상 재확인 후 대체 구와 가격선을 비교하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "금천구",
          "score": 50.2,
          "liquidityScore": 64.2,
          "competitionScore": 53.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "양천구",
          "score": 54.5,
          "liquidityScore": 64.8,
          "competitionScore": 47.2,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 42,
          "medianPricePerSqm": 1137.8,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 30,
          "medianPricePerSqm": 1273.7,
          "priceGrowth6mPct": 5.6,
          "transactionDropVs6mPct": -16.7
        },
        {
          "month": "2025.06",
          "transactionCount": 56,
          "medianPricePerSqm": 1388.6,
          "priceGrowth6mPct": 9.6,
          "transactionDropVs6mPct": 31.3
        },
        {
          "month": "2025.07",
          "transactionCount": 49,
          "medianPricePerSqm": 1585.9,
          "priceGrowth6mPct": 17.8,
          "transactionDropVs6mPct": 10.7
        },
        {
          "month": "2025.08",
          "transactionCount": 55,
          "medianPricePerSqm": 1127.3,
          "priceGrowth6mPct": -13.5,
          "transactionDropVs6mPct": 18.5
        },
        {
          "month": "2025.09",
          "transactionCount": 58,
          "medianPricePerSqm": 1980.6,
          "priceGrowth6mPct": 39.9,
          "transactionDropVs6mPct": 20.0
        },
        {
          "month": "2025.10",
          "transactionCount": 45,
          "medianPricePerSqm": 1236.7,
          "priceGrowth6mPct": -13.6,
          "transactionDropVs6mPct": -7.8
        },
        {
          "month": "2025.11",
          "transactionCount": 92,
          "medianPricePerSqm": 684.3,
          "priceGrowth6mPct": -48.7,
          "transactionDropVs6mPct": 55.5
        },
        {
          "month": "2025.12",
          "transactionCount": 52,
          "medianPricePerSqm": 1198.2,
          "priceGrowth6mPct": -8.0,
          "transactionDropVs6mPct": -11.1
        },
        {
          "month": "2026.01",
          "transactionCount": 49,
          "medianPricePerSqm": 691.3,
          "priceGrowth6mPct": -40.0,
          "transactionDropVs6mPct": -16.2
        },
        {
          "month": "2026.02",
          "transactionCount": 26,
          "medianPricePerSqm": 1291.7,
          "priceGrowth6mPct": 9.4,
          "transactionDropVs6mPct": -51.6
        },
        {
          "month": "2026.03",
          "transactionCount": 21,
          "medianPricePerSqm": 2633.1,
          "priceGrowth6mPct": 104.2,
          "transactionDropVs6mPct": -55.8
        }
      ]
    },
    {
      "code": "11680",
      "name": "강남구",
      "riskScore": 71.8,
      "riskGrade": "높음",
      "transactionRiskScore": 68.0,
      "priceBurdenRiskScore": 93.2,
      "liquidityRiskScore": 20.6,
      "volatilityRiskScore": 76.0,
      "competitionRiskScore": 76.4,
      "competitionRiskGrade": "매우 높음",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 19.3,
      "storesPerAdminDong": 2914.7,
      "topCategories": "경영 컨설팅업:5736 | 부동산 중개/대리업:3665 | 광고 대행업:3322",
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "상권 내 점포 과밀도가 높습니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "가격 부담 점수 93.2점으로 상위권입니다 / 상권 과밀 점수 76.4점으로 경쟁 압박이 큽니다 / 최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "강남구는 71.8점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '고가 선행형'이며, 핵심 반대 근거는 같은 권역 대비 매입 가격 부담이 큽니다, 상권 내 점포 과밀도가 높습니다, 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 구로구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "고가 선행형",
      "archetypeSummary": "가격이 먼저 뛰고 변동성도 큰 유형입니다. 중개사 설명보다 최근 체결 레벨 확인이 우선입니다.",
      "decisionQuestion": "호가가 최근 거래선보다 앞서 있는지 먼저 확인해야 합니다.",
      "recommendedAction": "실거래 3건 이상 재확인 후 대체 구와 가격선을 비교하세요.",
      "reviewChecklist": [
        "실거래 3건 이상 재확인 후 대체 구와 가격선을 비교하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "구로구",
          "score": 27.6,
          "liquidityScore": 21.8,
          "competitionScore": 33.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 82,
          "medianPricePerSqm": 1789.8,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 58,
          "medianPricePerSqm": 1639.3,
          "priceGrowth6mPct": -4.4,
          "transactionDropVs6mPct": -17.1
        },
        {
          "month": "2025.06",
          "transactionCount": 60,
          "medianPricePerSqm": 2104.0,
          "priceGrowth6mPct": 14.1,
          "transactionDropVs6mPct": -10.0
        },
        {
          "month": "2025.07",
          "transactionCount": 77,
          "medianPricePerSqm": 2106.6,
          "priceGrowth6mPct": 10.3,
          "transactionDropVs6mPct": 11.2
        },
        {
          "month": "2025.08",
          "transactionCount": 44,
          "medianPricePerSqm": 1852.9,
          "priceGrowth6mPct": -2.4,
          "transactionDropVs6mPct": -31.5
        },
        {
          "month": "2025.09",
          "transactionCount": 113,
          "medianPricePerSqm": 2206.6,
          "priceGrowth6mPct": 13.2,
          "transactionDropVs6mPct": 56.2
        },
        {
          "month": "2025.10",
          "transactionCount": 42,
          "medianPricePerSqm": 1253.3,
          "priceGrowth6mPct": -32.6,
          "transactionDropVs6mPct": -36.0
        },
        {
          "month": "2025.11",
          "transactionCount": 71,
          "medianPricePerSqm": 1716.7,
          "priceGrowth6mPct": -8.4,
          "transactionDropVs6mPct": 4.7
        },
        {
          "month": "2025.12",
          "transactionCount": 71,
          "medianPricePerSqm": 1645.4,
          "priceGrowth6mPct": -8.4,
          "transactionDropVs6mPct": 1.9
        },
        {
          "month": "2026.01",
          "transactionCount": 60,
          "medianPricePerSqm": 1293.3,
          "priceGrowth6mPct": -22.2,
          "transactionDropVs6mPct": -10.2
        },
        {
          "month": "2026.02",
          "transactionCount": 45,
          "medianPricePerSqm": 1749.5,
          "priceGrowth6mPct": 6.4,
          "transactionDropVs6mPct": -32.8
        },
        {
          "month": "2026.03",
          "transactionCount": 36,
          "medianPricePerSqm": 2345.1,
          "priceGrowth6mPct": 40.7,
          "transactionDropVs6mPct": -33.5
        }
      ]
    },
    {
      "code": "11140",
      "name": "중구",
      "riskScore": 70.2,
      "riskGrade": "높음",
      "transactionRiskScore": 77.5,
      "priceBurdenRiskScore": 94.8,
      "liquidityRiskScore": 41.8,
      "volatilityRiskScore": 88.0,
      "competitionRiskScore": 61.2,
      "competitionRiskGrade": "높음",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 25.1,
      "storesPerAdminDong": 1607.8,
      "topCategories": "백반/한정식:1428 | 기타 의류 소매업:1366 | 카페:1075",
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "가격 부담 점수 94.8점으로 상위권입니다 / 최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "중구는 70.2점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '고가 선행형'이며, 핵심 반대 근거는 같은 권역 대비 매입 가격 부담이 큽니다, 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 관악구, 강서구, 은평구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "고가 선행형",
      "archetypeSummary": "가격이 먼저 뛰고 변동성도 큰 유형입니다. 중개사 설명보다 최근 체결 레벨 확인이 우선입니다.",
      "decisionQuestion": "호가가 최근 거래선보다 앞서 있는지 먼저 확인해야 합니다.",
      "recommendedAction": "실거래 3건 이상 재확인 후 대체 구와 가격선을 비교하세요.",
      "reviewChecklist": [
        "실거래 3건 이상 재확인 후 대체 구와 가격선을 비교하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 57,
          "medianPricePerSqm": 946.4,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 42,
          "medianPricePerSqm": 875.4,
          "priceGrowth6mPct": -3.9,
          "transactionDropVs6mPct": -15.2
        },
        {
          "month": "2025.06",
          "transactionCount": 35,
          "medianPricePerSqm": 998.7,
          "priceGrowth6mPct": 6.2,
          "transactionDropVs6mPct": -21.6
        },
        {
          "month": "2025.07",
          "transactionCount": 67,
          "medianPricePerSqm": 1378.7,
          "priceGrowth6mPct": 31.3,
          "transactionDropVs6mPct": 33.3
        },
        {
          "month": "2025.08",
          "transactionCount": 47,
          "medianPricePerSqm": 650.4,
          "priceGrowth6mPct": -32.9,
          "transactionDropVs6mPct": -5.2
        },
        {
          "month": "2025.09",
          "transactionCount": 66,
          "medianPricePerSqm": 1142.4,
          "priceGrowth6mPct": 14.4,
          "transactionDropVs6mPct": 26.1
        },
        {
          "month": "2025.10",
          "transactionCount": 383,
          "medianPricePerSqm": 560.9,
          "priceGrowth6mPct": -40.0,
          "transactionDropVs6mPct": 259.1
        },
        {
          "month": "2025.11",
          "transactionCount": 229,
          "medianPricePerSqm": 610.1,
          "priceGrowth6mPct": -31.5,
          "transactionDropVs6mPct": 66.1
        },
        {
          "month": "2025.12",
          "transactionCount": 209,
          "medianPricePerSqm": 723.3,
          "priceGrowth6mPct": -14.3,
          "transactionDropVs6mPct": 25.3
        },
        {
          "month": "2026.01",
          "transactionCount": 56,
          "medianPricePerSqm": 728.4,
          "priceGrowth6mPct": -1.0,
          "transactionDropVs6mPct": -66.1
        },
        {
          "month": "2026.02",
          "transactionCount": 37,
          "medianPricePerSqm": 797.9,
          "priceGrowth6mPct": 4.9,
          "transactionDropVs6mPct": -77.3
        },
        {
          "month": "2026.03",
          "transactionCount": 46,
          "medianPricePerSqm": 2036.0,
          "priceGrowth6mPct": 123.9,
          "transactionDropVs6mPct": -71.2
        }
      ]
    },
    {
      "code": "11110",
      "name": "종로구",
      "riskScore": 67.6,
      "riskGrade": "높음",
      "transactionRiskScore": 60.6,
      "priceBurdenRiskScore": 70.4,
      "liquidityRiskScore": 31.3,
      "volatilityRiskScore": 80.0,
      "competitionRiskScore": 76.2,
      "competitionRiskGrade": "매우 높음",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 31.2,
      "storesPerAdminDong": 1223.8,
      "topCategories": "백반/한정식:1438 | 카페:1224 | 시계/귀금속 소매업:675",
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "상권 내 점포 과밀도가 높습니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "상권 과밀 점수 76.2점으로 경쟁 압박이 큽니다 / 최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "종로구는 67.6점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '과밀 경쟁형'이며, 핵심 반대 근거는 같은 권역 대비 매입 가격 부담이 큽니다, 상권 내 점포 과밀도가 높습니다, 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 관악구, 은평구, 강서구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "과밀 경쟁형",
      "archetypeSummary": "입지는 익숙하지만 이미 상권 과밀이 높은 유형입니다. 임차인 교체 속도가 수익을 좌우합니다.",
      "decisionQuestion": "같은 형식의 점포가 얼마나 중복되어 있는지 확인해야 합니다.",
      "recommendedAction": "핵심 행정동을 돌며 중복 업종과 공실 교체 패턴을 직접 확인하세요.",
      "reviewChecklist": [
        "핵심 행정동을 돌며 중복 업종과 공실 교체 패턴을 직접 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 41,
          "medianPricePerSqm": 1935.5,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 36,
          "medianPricePerSqm": 1052.0,
          "priceGrowth6mPct": -29.6,
          "transactionDropVs6mPct": -6.5
        },
        {
          "month": "2025.06",
          "transactionCount": 22,
          "medianPricePerSqm": 1304.1,
          "priceGrowth6mPct": -8.8,
          "transactionDropVs6mPct": -33.3
        },
        {
          "month": "2025.07",
          "transactionCount": 47,
          "medianPricePerSqm": 1391.0,
          "priceGrowth6mPct": -2.1,
          "transactionDropVs6mPct": 28.8
        },
        {
          "month": "2025.08",
          "transactionCount": 26,
          "medianPricePerSqm": 723.7,
          "priceGrowth6mPct": -43.5,
          "transactionDropVs6mPct": -24.4
        },
        {
          "month": "2025.09",
          "transactionCount": 36,
          "medianPricePerSqm": 867.6,
          "priceGrowth6mPct": -28.4,
          "transactionDropVs6mPct": 3.8
        },
        {
          "month": "2025.10",
          "transactionCount": 40,
          "medianPricePerSqm": 2059.3,
          "priceGrowth6mPct": 67.0,
          "transactionDropVs6mPct": 15.9
        },
        {
          "month": "2025.11",
          "transactionCount": 27,
          "medianPricePerSqm": 1252.6,
          "priceGrowth6mPct": -1.1,
          "transactionDropVs6mPct": -18.2
        },
        {
          "month": "2025.12",
          "transactionCount": 37,
          "medianPricePerSqm": 837.7,
          "priceGrowth6mPct": -29.5,
          "transactionDropVs6mPct": 4.2
        },
        {
          "month": "2026.01",
          "transactionCount": 30,
          "medianPricePerSqm": 1163.1,
          "priceGrowth6mPct": 1.1,
          "transactionDropVs6mPct": -8.2
        },
        {
          "month": "2026.02",
          "transactionCount": 19,
          "medianPricePerSqm": 1000.9,
          "priceGrowth6mPct": -16.4,
          "transactionDropVs6mPct": -39.7
        },
        {
          "month": "2026.03",
          "transactionCount": 21,
          "medianPricePerSqm": 1351.4,
          "priceGrowth6mPct": 5.8,
          "transactionDropVs6mPct": -27.6
        }
      ]
    },
    {
      "code": "11170",
      "name": "용산구",
      "riskScore": 64.9,
      "riskGrade": "높음",
      "transactionRiskScore": 66.2,
      "priceBurdenRiskScore": 71.2,
      "liquidityRiskScore": 46.0,
      "volatilityRiskScore": 84.0,
      "competitionRiskScore": 63.4,
      "competitionRiskGrade": "높음",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 32.2,
      "storesPerAdminDong": 981.3,
      "topCategories": "백반/한정식:939 | 카페:835 | 부동산 중개/대리업:804",
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "용산구는 64.9점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '가격 변동형'이며, 핵심 반대 근거는 같은 권역 대비 매입 가격 부담이 큽니다, 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 관악구, 은평구, 강서구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "가격 변동형",
      "archetypeSummary": "가격 레벨은 버틸 수 있어도 최근 체결선이 불안정한 유형입니다.",
      "decisionQuestion": "최근 몇 건이 전체 시장을 왜곡한 이상 거래인지 살펴봐야 합니다.",
      "recommendedAction": "대형 거래와 집합상가 거래를 분리해 재해석하세요.",
      "reviewChecklist": [
        "대형 거래와 집합상가 거래를 분리해 재해석하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 37,
          "medianPricePerSqm": 2219.1,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 79,
          "medianPricePerSqm": 1320.4,
          "priceGrowth6mPct": -25.4,
          "transactionDropVs6mPct": 36.2
        },
        {
          "month": "2025.06",
          "transactionCount": 73,
          "medianPricePerSqm": 1629.6,
          "priceGrowth6mPct": -5.4,
          "transactionDropVs6mPct": 15.9
        },
        {
          "month": "2025.07",
          "transactionCount": 49,
          "medianPricePerSqm": 1950.6,
          "priceGrowth6mPct": 9.6,
          "transactionDropVs6mPct": -17.6
        },
        {
          "month": "2025.08",
          "transactionCount": 39,
          "medianPricePerSqm": 2083.3,
          "priceGrowth6mPct": 13.2,
          "transactionDropVs6mPct": -29.6
        },
        {
          "month": "2025.09",
          "transactionCount": 39,
          "medianPricePerSqm": 2094.2,
          "priceGrowth6mPct": 11.2,
          "transactionDropVs6mPct": -25.9
        },
        {
          "month": "2025.10",
          "transactionCount": 24,
          "medianPricePerSqm": 1950.3,
          "priceGrowth6mPct": 6.1,
          "transactionDropVs6mPct": -52.5
        },
        {
          "month": "2025.11",
          "transactionCount": 58,
          "medianPricePerSqm": 2488.2,
          "priceGrowth6mPct": 22.4,
          "transactionDropVs6mPct": 23.4
        },
        {
          "month": "2025.12",
          "transactionCount": 53,
          "medianPricePerSqm": 1391.4,
          "priceGrowth6mPct": -30.2,
          "transactionDropVs6mPct": 21.4
        },
        {
          "month": "2026.01",
          "transactionCount": 58,
          "medianPricePerSqm": 2227.1,
          "priceGrowth6mPct": 9.2,
          "transactionDropVs6mPct": 28.4
        },
        {
          "month": "2026.02",
          "transactionCount": 53,
          "medianPricePerSqm": 2596.2,
          "priceGrowth6mPct": 22.2,
          "transactionDropVs6mPct": 11.6
        },
        {
          "month": "2026.03",
          "transactionCount": 22,
          "medianPricePerSqm": 1813.3,
          "priceGrowth6mPct": -12.7,
          "transactionDropVs6mPct": -50.7
        }
      ]
    },
    {
      "code": "11560",
      "name": "영등포구",
      "riskScore": 63.4,
      "riskGrade": "높음",
      "transactionRiskScore": 57.2,
      "priceBurdenRiskScore": 65.4,
      "liquidityRiskScore": 33.6,
      "volatilityRiskScore": 72.0,
      "competitionRiskScore": 71.0,
      "competitionRiskGrade": "높음",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 26.7,
      "storesPerAdminDong": 1579.9,
      "topCategories": "경영 컨설팅업:2102 | 백반/한정식:1590 | 부동산 중개/대리업:1151",
      "objections": [
        "상권 내 점포 과밀도가 높습니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "상권 과밀 점수 71.0점으로 경쟁 압박이 큽니다 / 최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "영등포구는 63.4점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '과밀 경쟁형'이며, 핵심 반대 근거는 상권 내 점포 과밀도가 높습니다, 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 관악구, 강서구, 은평구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "과밀 경쟁형",
      "archetypeSummary": "입지는 익숙하지만 이미 상권 과밀이 높은 유형입니다. 임차인 교체 속도가 수익을 좌우합니다.",
      "decisionQuestion": "같은 형식의 점포가 얼마나 중복되어 있는지 확인해야 합니다.",
      "recommendedAction": "핵심 행정동을 돌며 중복 업종과 공실 교체 패턴을 직접 확인하세요.",
      "reviewChecklist": [
        "핵심 행정동을 돌며 중복 업종과 공실 교체 패턴을 직접 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 46,
          "medianPricePerSqm": 474.3,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 51,
          "medianPricePerSqm": 725.8,
          "priceGrowth6mPct": 21.0,
          "transactionDropVs6mPct": 5.2
        },
        {
          "month": "2025.06",
          "transactionCount": 37,
          "medianPricePerSqm": 1214.4,
          "priceGrowth6mPct": 50.9,
          "transactionDropVs6mPct": -17.2
        },
        {
          "month": "2025.07",
          "transactionCount": 49,
          "medianPricePerSqm": 705.6,
          "priceGrowth6mPct": -9.5,
          "transactionDropVs6mPct": 7.1
        },
        {
          "month": "2025.08",
          "transactionCount": 76,
          "medianPricePerSqm": 1101.1,
          "priceGrowth6mPct": 30.4,
          "transactionDropVs6mPct": 46.7
        },
        {
          "month": "2025.09",
          "transactionCount": 56,
          "medianPricePerSqm": 580.2,
          "priceGrowth6mPct": -27.5,
          "transactionDropVs6mPct": 6.7
        },
        {
          "month": "2025.10",
          "transactionCount": 75,
          "medianPricePerSqm": 403.2,
          "priceGrowth6mPct": -48.9,
          "transactionDropVs6mPct": 30.8
        },
        {
          "month": "2025.11",
          "transactionCount": 64,
          "medianPricePerSqm": 747.4,
          "priceGrowth6mPct": -5.6,
          "transactionDropVs6mPct": 7.6
        },
        {
          "month": "2025.12",
          "transactionCount": 127,
          "medianPricePerSqm": 582.8,
          "priceGrowth6mPct": -15.1,
          "transactionDropVs6mPct": 70.5
        },
        {
          "month": "2026.01",
          "transactionCount": 38,
          "medianPricePerSqm": 786.3,
          "priceGrowth6mPct": 12.3,
          "transactionDropVs6mPct": -47.7
        },
        {
          "month": "2026.02",
          "transactionCount": 34,
          "medianPricePerSqm": 1267.7,
          "priceGrowth6mPct": 74.2,
          "transactionDropVs6mPct": -48.2
        },
        {
          "month": "2026.03",
          "transactionCount": 34,
          "medianPricePerSqm": 907.1,
          "priceGrowth6mPct": 15.9,
          "transactionDropVs6mPct": -45.2
        }
      ]
    },
    {
      "code": "11710",
      "name": "송파구",
      "riskScore": 62.4,
      "riskGrade": "높음",
      "transactionRiskScore": 72.0,
      "priceBurdenRiskScore": 68.8,
      "liquidityRiskScore": 61.3,
      "volatilityRiskScore": 96.0,
      "competitionRiskScore": 50.6,
      "competitionRiskGrade": "보통",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 23.9,
      "storesPerAdminDong": 1242.9,
      "topCategories": "부동산 중개/대리업:1695 | 백반/한정식:1473 | 카페:1301",
      "objections": [
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "송파구는 62.4점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '가격 변동형'이며, 핵심 반대 근거는 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 양천구, 강서구, 금천구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "가격 변동형",
      "archetypeSummary": "가격 레벨은 버틸 수 있어도 최근 체결선이 불안정한 유형입니다.",
      "decisionQuestion": "최근 몇 건이 전체 시장을 왜곡한 이상 거래인지 살펴봐야 합니다.",
      "recommendedAction": "대형 거래와 집합상가 거래를 분리해 재해석하세요.",
      "reviewChecklist": [
        "대형 거래와 집합상가 거래를 분리해 재해석하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "양천구",
          "score": 54.5,
          "liquidityScore": 64.8,
          "competitionScore": 47.2,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "금천구",
          "score": 50.2,
          "liquidityScore": 64.2,
          "competitionScore": 53.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 46,
          "medianPricePerSqm": 786.7,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 52,
          "medianPricePerSqm": 648.5,
          "priceGrowth6mPct": -9.6,
          "transactionDropVs6mPct": 6.1
        },
        {
          "month": "2025.06",
          "transactionCount": 57,
          "medianPricePerSqm": 528.6,
          "priceGrowth6mPct": -19.2,
          "transactionDropVs6mPct": 10.3
        },
        {
          "month": "2025.07",
          "transactionCount": 47,
          "medianPricePerSqm": 1112.8,
          "priceGrowth6mPct": 44.7,
          "transactionDropVs6mPct": -6.9
        },
        {
          "month": "2025.08",
          "transactionCount": 43,
          "medianPricePerSqm": 1065.9,
          "priceGrowth6mPct": 28.7,
          "transactionDropVs6mPct": -12.2
        },
        {
          "month": "2025.09",
          "transactionCount": 48,
          "medianPricePerSqm": 964.9,
          "priceGrowth6mPct": 13.3,
          "transactionDropVs6mPct": -1.7
        },
        {
          "month": "2025.10",
          "transactionCount": 41,
          "medianPricePerSqm": 2293.4,
          "priceGrowth6mPct": 108.0,
          "transactionDropVs6mPct": -14.6
        },
        {
          "month": "2025.11",
          "transactionCount": 62,
          "medianPricePerSqm": 2182.6,
          "priceGrowth6mPct": 60.7,
          "transactionDropVs6mPct": 24.8
        },
        {
          "month": "2025.12",
          "transactionCount": 62,
          "medianPricePerSqm": 922.5,
          "priceGrowth6mPct": -35.2,
          "transactionDropVs6mPct": 22.8
        },
        {
          "month": "2026.01",
          "transactionCount": 58,
          "medianPricePerSqm": 878.3,
          "priceGrowth6mPct": -36.6,
          "transactionDropVs6mPct": 10.8
        },
        {
          "month": "2026.02",
          "transactionCount": 34,
          "medianPricePerSqm": 1754.8,
          "priceGrowth6mPct": 17.0,
          "transactionDropVs6mPct": -33.1
        },
        {
          "month": "2026.03",
          "transactionCount": 17,
          "medianPricePerSqm": 1452.0,
          "priceGrowth6mPct": -8.1,
          "transactionDropVs6mPct": -62.8
        }
      ]
    },
    {
      "code": "11440",
      "name": "마포구",
      "riskScore": 62.3,
      "riskGrade": "높음",
      "transactionRiskScore": 50.4,
      "priceBurdenRiskScore": 51.6,
      "liquidityRiskScore": 68.7,
      "volatilityRiskScore": 20.0,
      "competitionRiskScore": 76.8,
      "competitionRiskGrade": "매우 높음",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 29.5,
      "storesPerAdminDong": 1905.5,
      "topCategories": "카페:1773 | 백반/한정식:1587 | 부동산 중개/대리업:1161",
      "objections": [
        "상권 내 점포 과밀도가 높습니다"
      ],
      "riskSummary": "상권 과밀 점수 76.8점으로 경쟁 압박이 큽니다",
      "memo": "마포구는 62.3점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '과밀 경쟁형'이며, 핵심 반대 근거는 상권 내 점포 과밀도가 높습니다입니다. 지금 바로 매입 결정을 내리기보다 관악구, 은평구, 강서구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "과밀 경쟁형",
      "archetypeSummary": "입지는 익숙하지만 이미 상권 과밀이 높은 유형입니다. 임차인 교체 속도가 수익을 좌우합니다.",
      "decisionQuestion": "같은 형식의 점포가 얼마나 중복되어 있는지 확인해야 합니다.",
      "recommendedAction": "핵심 행정동을 돌며 중복 업종과 공실 교체 패턴을 직접 확인하세요.",
      "reviewChecklist": [
        "핵심 행정동을 돌며 중복 업종과 공실 교체 패턴을 직접 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 37,
          "medianPricePerSqm": 903.3,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 30,
          "medianPricePerSqm": 1031.4,
          "priceGrowth6mPct": 6.6,
          "transactionDropVs6mPct": -10.4
        },
        {
          "month": "2025.06",
          "transactionCount": 23,
          "medianPricePerSqm": 1052.6,
          "priceGrowth6mPct": 5.7,
          "transactionDropVs6mPct": -23.3
        },
        {
          "month": "2025.07",
          "transactionCount": 37,
          "medianPricePerSqm": 1101.4,
          "priceGrowth6mPct": 7.7,
          "transactionDropVs6mPct": 16.5
        },
        {
          "month": "2025.08",
          "transactionCount": 43,
          "medianPricePerSqm": 907.4,
          "priceGrowth6mPct": -9.2,
          "transactionDropVs6mPct": 26.5
        },
        {
          "month": "2025.09",
          "transactionCount": 27,
          "medianPricePerSqm": 1035.7,
          "priceGrowth6mPct": 3.0,
          "transactionDropVs6mPct": -17.8
        },
        {
          "month": "2025.10",
          "transactionCount": 35,
          "medianPricePerSqm": 1204.2,
          "priceGrowth6mPct": 14.1,
          "transactionDropVs6mPct": 7.7
        },
        {
          "month": "2025.11",
          "transactionCount": 23,
          "medianPricePerSqm": 1144.0,
          "priceGrowth6mPct": 6.5,
          "transactionDropVs6mPct": -26.6
        },
        {
          "month": "2025.12",
          "transactionCount": 50,
          "medianPricePerSqm": 1107.5,
          "priceGrowth6mPct": 2.2,
          "transactionDropVs6mPct": 39.5
        },
        {
          "month": "2026.01",
          "transactionCount": 39,
          "medianPricePerSqm": 1079.5,
          "priceGrowth6mPct": -0.0,
          "transactionDropVs6mPct": 7.8
        },
        {
          "month": "2026.02",
          "transactionCount": 15,
          "medianPricePerSqm": 936.1,
          "priceGrowth6mPct": -13.7,
          "transactionDropVs6mPct": -52.4
        },
        {
          "month": "2026.03",
          "transactionCount": 13,
          "medianPricePerSqm": 889.6,
          "priceGrowth6mPct": -16.1,
          "transactionDropVs6mPct": -55.4
        }
      ]
    },
    {
      "code": "11740",
      "name": "강동구",
      "riskScore": 59.0,
      "riskGrade": "높음",
      "transactionRiskScore": 65.5,
      "priceBurdenRiskScore": 66.6,
      "liquidityRiskScore": 80.7,
      "volatilityRiskScore": 40.0,
      "competitionRiskScore": 51.0,
      "competitionRiskGrade": "보통",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 25.9,
      "storesPerAdminDong": 1002.4,
      "topCategories": "부동산 중개/대리업:1121 | 미용실:985 | 입시·교과학원:912",
      "objections": [
        "거래 유동성이 약해지고 있습니다",
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "거래 유동성 점수 80.7점으로 단기 회전이 불리합니다 / 최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "강동구는 59.0점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '거래 둔화형'이며, 핵심 반대 근거는 거래 유동성이 약해지고 있습니다, 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 강서구, 관악구, 동대문구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "거래 둔화형",
      "archetypeSummary": "매물은 보이지만 거래가 얇아지는 유형입니다. 단기 회전과 매도 유동성이 약할 수 있습니다.",
      "decisionQuestion": "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검해야 합니다.",
      "recommendedAction": "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "동대문구",
          "score": 44.0,
          "liquidityScore": 75.1,
          "competitionScore": 49.2,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 14,
          "medianPricePerSqm": 478.3,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 13,
          "medianPricePerSqm": 737.5,
          "priceGrowth6mPct": 21.3,
          "transactionDropVs6mPct": -3.7
        },
        {
          "month": "2025.06",
          "transactionCount": 17,
          "medianPricePerSqm": 940.5,
          "priceGrowth6mPct": 30.8,
          "transactionDropVs6mPct": 15.9
        },
        {
          "month": "2025.07",
          "transactionCount": 31,
          "medianPricePerSqm": 1153.9,
          "priceGrowth6mPct": 39.4,
          "transactionDropVs6mPct": 65.3
        },
        {
          "month": "2025.08",
          "transactionCount": 29,
          "medianPricePerSqm": 753.2,
          "priceGrowth6mPct": -7.3,
          "transactionDropVs6mPct": 39.4
        },
        {
          "month": "2025.09",
          "transactionCount": 21,
          "medianPricePerSqm": 795.1,
          "priceGrowth6mPct": -1.8,
          "transactionDropVs6mPct": 0.8
        },
        {
          "month": "2025.10",
          "transactionCount": 11,
          "medianPricePerSqm": 967.9,
          "priceGrowth6mPct": 8.6,
          "transactionDropVs6mPct": -45.9
        },
        {
          "month": "2025.11",
          "transactionCount": 16,
          "medianPricePerSqm": 983.3,
          "priceGrowth6mPct": 5.5,
          "transactionDropVs6mPct": -23.2
        },
        {
          "month": "2025.12",
          "transactionCount": 68,
          "medianPricePerSqm": 909.1,
          "priceGrowth6mPct": -1.9,
          "transactionDropVs6mPct": 131.8
        },
        {
          "month": "2026.01",
          "transactionCount": 24,
          "medianPricePerSqm": 691.3,
          "priceGrowth6mPct": -18.7,
          "transactionDropVs6mPct": -14.8
        },
        {
          "month": "2026.02",
          "transactionCount": 17,
          "medianPricePerSqm": 1131.7,
          "priceGrowth6mPct": 23.9,
          "transactionDropVs6mPct": -35.0
        },
        {
          "month": "2026.03",
          "transactionCount": 8,
          "medianPricePerSqm": 1083.6,
          "priceGrowth6mPct": 12.7,
          "transactionDropVs6mPct": -66.7
        }
      ]
    },
    {
      "code": "11200",
      "name": "성동구",
      "riskScore": 58.5,
      "riskGrade": "높음",
      "transactionRiskScore": 75.3,
      "priceBurdenRiskScore": 82.6,
      "liquidityRiskScore": 52.0,
      "volatilityRiskScore": 92.0,
      "competitionRiskScore": 38.0,
      "competitionRiskGrade": "보통",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 25.9,
      "storesPerAdminDong": 1013.0,
      "topCategories": "백반/한정식:912 | 부동산 중개/대리업:782 | 경영 컨설팅업:733",
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "가격 부담 점수 82.6점으로 상위권입니다 / 최근 가격 변동성이 커서 체결 레벨 재확인이 필요합니다",
      "memo": "성동구는 58.5점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '가격 변동형'이며, 핵심 반대 근거는 같은 권역 대비 매입 가격 부담이 큽니다, 최근 실거래 가격 변동성이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 강서구, 구로구, 광진구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "가격 변동형",
      "archetypeSummary": "가격 레벨은 버틸 수 있어도 최근 체결선이 불안정한 유형입니다.",
      "decisionQuestion": "최근 몇 건이 전체 시장을 왜곡한 이상 거래인지 살펴봐야 합니다.",
      "recommendedAction": "대형 거래와 집합상가 거래를 분리해 재해석하세요.",
      "reviewChecklist": [
        "대형 거래와 집합상가 거래를 분리해 재해석하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "구로구",
          "score": 27.6,
          "liquidityScore": 21.8,
          "competitionScore": 33.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 27,
          "medianPricePerSqm": 971.7,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 14,
          "medianPricePerSqm": 899.7,
          "priceGrowth6mPct": -3.8,
          "transactionDropVs6mPct": -31.7
        },
        {
          "month": "2025.06",
          "transactionCount": 20,
          "medianPricePerSqm": 1546.7,
          "priceGrowth6mPct": 35.8,
          "transactionDropVs6mPct": -1.6
        },
        {
          "month": "2025.07",
          "transactionCount": 23,
          "medianPricePerSqm": 2047.0,
          "priceGrowth6mPct": 49.8,
          "transactionDropVs6mPct": 9.5
        },
        {
          "month": "2025.08",
          "transactionCount": 25,
          "medianPricePerSqm": 739.3,
          "priceGrowth6mPct": -40.4,
          "transactionDropVs6mPct": 14.7
        },
        {
          "month": "2025.09",
          "transactionCount": 31,
          "medianPricePerSqm": 1226.6,
          "priceGrowth6mPct": -1.0,
          "transactionDropVs6mPct": 32.9
        },
        {
          "month": "2025.10",
          "transactionCount": 45,
          "medianPricePerSqm": 1387.0,
          "priceGrowth6mPct": 6.1,
          "transactionDropVs6mPct": 70.9
        },
        {
          "month": "2025.11",
          "transactionCount": 35,
          "medianPricePerSqm": 1778.7,
          "priceGrowth6mPct": 22.3,
          "transactionDropVs6mPct": 17.3
        },
        {
          "month": "2025.12",
          "transactionCount": 18,
          "medianPricePerSqm": 1921.8,
          "priceGrowth6mPct": 26.7,
          "transactionDropVs6mPct": -39.0
        },
        {
          "month": "2026.01",
          "transactionCount": 26,
          "medianPricePerSqm": 432.8,
          "priceGrowth6mPct": -65.3,
          "transactionDropVs6mPct": -13.3
        },
        {
          "month": "2026.02",
          "transactionCount": 29,
          "medianPricePerSqm": 817.3,
          "priceGrowth6mPct": -35.2,
          "transactionDropVs6mPct": -5.4
        },
        {
          "month": "2026.03",
          "transactionCount": 16,
          "medianPricePerSqm": 1732.8,
          "priceGrowth6mPct": 28.8,
          "transactionDropVs6mPct": -43.2
        }
      ]
    },
    {
      "code": "11290",
      "name": "성북구",
      "riskScore": 57.0,
      "riskGrade": "높음",
      "transactionRiskScore": 66.2,
      "priceBurdenRiskScore": 79.0,
      "liquidityRiskScore": 43.5,
      "volatilityRiskScore": 68.0,
      "competitionRiskScore": 45.8,
      "competitionRiskGrade": "보통",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 29.0,
      "storesPerAdminDong": 776.8,
      "topCategories": "미용실:813 | 백반/한정식:797 | 카페:778",
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다"
      ],
      "riskSummary": "즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다",
      "memo": "성북구는 57.0점, '높음' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 같은 권역 대비 매입 가격 부담이 큽니다입니다. 지금 바로 매입 결정을 내리기보다 관악구, 강서구, 노원구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "관악구",
          "score": 50.3,
          "liquidityScore": 39.7,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "노원구",
          "score": 35.9,
          "liquidityScore": 35.5,
          "competitionScore": 50.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 23,
          "medianPricePerSqm": 565.6,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 18,
          "medianPricePerSqm": 496.2,
          "priceGrowth6mPct": -6.5,
          "transactionDropVs6mPct": -12.2
        },
        {
          "month": "2025.06",
          "transactionCount": 13,
          "medianPricePerSqm": 624.6,
          "priceGrowth6mPct": 11.1,
          "transactionDropVs6mPct": -27.8
        },
        {
          "month": "2025.07",
          "transactionCount": 11,
          "medianPricePerSqm": 597.7,
          "priceGrowth6mPct": 4.7,
          "transactionDropVs6mPct": -32.3
        },
        {
          "month": "2025.08",
          "transactionCount": 25,
          "medianPricePerSqm": 440.9,
          "priceGrowth6mPct": -19.1,
          "transactionDropVs6mPct": 38.9
        },
        {
          "month": "2025.09",
          "transactionCount": 9,
          "medianPricePerSqm": 699.1,
          "priceGrowth6mPct": 22.5,
          "transactionDropVs6mPct": -45.5
        },
        {
          "month": "2025.10",
          "transactionCount": 11,
          "medianPricePerSqm": 596.1,
          "priceGrowth6mPct": 3.5,
          "transactionDropVs6mPct": -24.1
        },
        {
          "month": "2025.11",
          "transactionCount": 11,
          "medianPricePerSqm": 395.0,
          "priceGrowth6mPct": -29.3,
          "transactionDropVs6mPct": -17.5
        },
        {
          "month": "2025.12",
          "transactionCount": 16,
          "medianPricePerSqm": 509.8,
          "priceGrowth6mPct": -5.5,
          "transactionDropVs6mPct": 15.7
        },
        {
          "month": "2026.01",
          "transactionCount": 16,
          "medianPricePerSqm": 902.6,
          "priceGrowth6mPct": 52.8,
          "transactionDropVs6mPct": 9.1
        },
        {
          "month": "2026.02",
          "transactionCount": 24,
          "medianPricePerSqm": 528.7,
          "priceGrowth6mPct": -12.6,
          "transactionDropVs6mPct": 65.5
        },
        {
          "month": "2026.03",
          "transactionCount": 13,
          "medianPricePerSqm": 1136.6,
          "priceGrowth6mPct": 67.6,
          "transactionDropVs6mPct": -14.3
        }
      ]
    },
    {
      "code": "11470",
      "name": "양천구",
      "riskScore": 54.5,
      "riskGrade": "보통",
      "transactionRiskScore": 60.4,
      "priceBurdenRiskScore": 56.4,
      "liquidityRiskScore": 64.8,
      "volatilityRiskScore": 64.0,
      "competitionRiskScore": 47.2,
      "competitionRiskGrade": "보통",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 23.6,
      "storesPerAdminDong": 868.1,
      "topCategories": "입시·교과학원:1442 | 미용실:820 | 부동산 중개/대리업:747",
      "objections": [
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "양천구는 54.5점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 강서구, 노원구, 광진구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "노원구",
          "score": 35.9,
          "liquidityScore": 35.5,
          "competitionScore": 50.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 16,
          "medianPricePerSqm": 521.2,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 13,
          "medianPricePerSqm": 548.8,
          "priceGrowth6mPct": 2.6,
          "transactionDropVs6mPct": -10.3
        },
        {
          "month": "2025.06",
          "transactionCount": 21,
          "medianPricePerSqm": 458.6,
          "priceGrowth6mPct": -10.0,
          "transactionDropVs6mPct": 26.0
        },
        {
          "month": "2025.07",
          "transactionCount": 15,
          "medianPricePerSqm": 511.7,
          "priceGrowth6mPct": 0.3,
          "transactionDropVs6mPct": -7.7
        },
        {
          "month": "2025.08",
          "transactionCount": 26,
          "medianPricePerSqm": 848.8,
          "priceGrowth6mPct": 46.9,
          "transactionDropVs6mPct": 42.9
        },
        {
          "month": "2025.09",
          "transactionCount": 14,
          "medianPricePerSqm": 1558.0,
          "priceGrowth6mPct": 110.2,
          "transactionDropVs6mPct": -20.0
        },
        {
          "month": "2025.10",
          "transactionCount": 14,
          "medianPricePerSqm": 575.3,
          "priceGrowth6mPct": -23.3,
          "transactionDropVs6mPct": -18.4
        },
        {
          "month": "2025.11",
          "transactionCount": 11,
          "medianPricePerSqm": 764.1,
          "priceGrowth6mPct": -2.8,
          "transactionDropVs6mPct": -34.7
        },
        {
          "month": "2025.12",
          "transactionCount": 23,
          "medianPricePerSqm": 340.6,
          "priceGrowth6mPct": -55.6,
          "transactionDropVs6mPct": 34.0
        },
        {
          "month": "2026.01",
          "transactionCount": 25,
          "medianPricePerSqm": 465.8,
          "priceGrowth6mPct": -38.6,
          "transactionDropVs6mPct": 32.7
        },
        {
          "month": "2026.02",
          "transactionCount": 16,
          "medianPricePerSqm": 1059.3,
          "priceGrowth6mPct": 33.4,
          "transactionDropVs6mPct": -6.8
        },
        {
          "month": "2026.03",
          "transactionCount": 9,
          "medianPricePerSqm": 787.2,
          "priceGrowth6mPct": 18.3,
          "transactionDropVs6mPct": -44.9
        }
      ]
    },
    {
      "code": "11620",
      "name": "관악구",
      "riskScore": 50.3,
      "riskGrade": "보통",
      "transactionRiskScore": 46.5,
      "priceBurdenRiskScore": 58.0,
      "liquidityRiskScore": 39.7,
      "volatilityRiskScore": 28.0,
      "competitionRiskScore": 55.0,
      "competitionRiskGrade": "보통",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 28.4,
      "storesPerAdminDong": 918.2,
      "topCategories": "백반/한정식:975 | 미용실:971 | 부동산 중개/대리업:908",
      "objections": [
        "한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다"
      ],
      "riskSummary": "즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다",
      "memo": "관악구는 50.3점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다입니다. 지금 바로 매입 결정을 내리기보다 은평구, 강서구, 노원구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "노원구",
          "score": 35.9,
          "liquidityScore": 35.5,
          "competitionScore": 50.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 10,
          "medianPricePerSqm": 580.1,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 9,
          "medianPricePerSqm": 361.7,
          "priceGrowth6mPct": -23.2,
          "transactionDropVs6mPct": -5.3
        },
        {
          "month": "2025.06",
          "transactionCount": 13,
          "medianPricePerSqm": 440.7,
          "priceGrowth6mPct": -4.4,
          "transactionDropVs6mPct": 21.9
        },
        {
          "month": "2025.07",
          "transactionCount": 5,
          "medianPricePerSqm": 206.8,
          "priceGrowth6mPct": -47.9,
          "transactionDropVs6mPct": -45.9
        },
        {
          "month": "2025.08",
          "transactionCount": 14,
          "medianPricePerSqm": 469.5,
          "priceGrowth6mPct": 14.0,
          "transactionDropVs6mPct": 37.3
        },
        {
          "month": "2025.09",
          "transactionCount": 11,
          "medianPricePerSqm": 547.6,
          "priceGrowth6mPct": 26.1,
          "transactionDropVs6mPct": 6.5
        },
        {
          "month": "2025.10",
          "transactionCount": 14,
          "medianPricePerSqm": 374.8,
          "priceGrowth6mPct": -6.3,
          "transactionDropVs6mPct": 27.3
        },
        {
          "month": "2025.11",
          "transactionCount": 49,
          "medianPricePerSqm": 587.1,
          "priceGrowth6mPct": 34.1,
          "transactionDropVs6mPct": 177.4
        },
        {
          "month": "2025.12",
          "transactionCount": 11,
          "medianPricePerSqm": 518.6,
          "priceGrowth6mPct": 15.1,
          "transactionDropVs6mPct": -36.5
        },
        {
          "month": "2026.01",
          "transactionCount": 16,
          "medianPricePerSqm": 620.7,
          "priceGrowth6mPct": 19.4,
          "transactionDropVs6mPct": -16.5
        },
        {
          "month": "2026.02",
          "transactionCount": 46,
          "medianPricePerSqm": 586.5,
          "priceGrowth6mPct": 8.8,
          "transactionDropVs6mPct": 87.8
        },
        {
          "month": "2026.03",
          "transactionCount": 17,
          "medianPricePerSqm": 747.6,
          "priceGrowth6mPct": 30.6,
          "transactionDropVs6mPct": -33.3
        }
      ]
    },
    {
      "code": "11545",
      "name": "금천구",
      "riskScore": 50.2,
      "riskGrade": "보통",
      "transactionRiskScore": 47.6,
      "priceBurdenRiskScore": 53.4,
      "liquidityRiskScore": 64.2,
      "volatilityRiskScore": 8.0,
      "competitionRiskScore": 53.4,
      "competitionRiskGrade": "보통",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 20.3,
      "storesPerAdminDong": 1773.4,
      "topCategories": "경영 컨설팅업:1579 | 광고 대행업:1018 | 부동산 중개/대리업:737",
      "objections": [
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "금천구는 50.2점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 강서구, 은평구, 노원구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "강서구",
          "score": 44.2,
          "liquidityScore": 31.0,
          "competitionScore": 50.8,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "노원구",
          "score": 35.9,
          "liquidityScore": 35.5,
          "competitionScore": 50.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 19,
          "medianPricePerSqm": 365.3,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 27,
          "medianPricePerSqm": 831.1,
          "priceGrowth6mPct": 38.9,
          "transactionDropVs6mPct": 17.4
        },
        {
          "month": "2025.06",
          "transactionCount": 14,
          "medianPricePerSqm": 770.8,
          "priceGrowth6mPct": 17.6,
          "transactionDropVs6mPct": -30.0
        },
        {
          "month": "2025.07",
          "transactionCount": 19,
          "medianPricePerSqm": 831.1,
          "priceGrowth6mPct": 18.8,
          "transactionDropVs6mPct": -3.8
        },
        {
          "month": "2025.08",
          "transactionCount": 29,
          "medianPricePerSqm": 861.8,
          "priceGrowth6mPct": 17.7,
          "transactionDropVs6mPct": 34.3
        },
        {
          "month": "2025.09",
          "transactionCount": 14,
          "medianPricePerSqm": 866.6,
          "priceGrowth6mPct": 14.9,
          "transactionDropVs6mPct": -31.1
        },
        {
          "month": "2025.10",
          "transactionCount": 9,
          "medianPricePerSqm": 874.9,
          "priceGrowth6mPct": 4.2,
          "transactionDropVs6mPct": -51.8
        },
        {
          "month": "2025.11",
          "transactionCount": 13,
          "medianPricePerSqm": 660.8,
          "priceGrowth6mPct": -18.5,
          "transactionDropVs6mPct": -20.4
        },
        {
          "month": "2025.12",
          "transactionCount": 13,
          "medianPricePerSqm": 787.4,
          "priceGrowth6mPct": -3.2,
          "transactionDropVs6mPct": -19.6
        },
        {
          "month": "2026.01",
          "transactionCount": 16,
          "medianPricePerSqm": 885.8,
          "priceGrowth6mPct": 7.7,
          "transactionDropVs6mPct": 2.1
        },
        {
          "month": "2026.02",
          "transactionCount": 10,
          "medianPricePerSqm": 760.8,
          "priceGrowth6mPct": -5.6,
          "transactionDropVs6mPct": -20.0
        },
        {
          "month": "2026.03",
          "transactionCount": 7,
          "medianPricePerSqm": 800.1,
          "priceGrowth6mPct": 0.6,
          "transactionDropVs6mPct": -38.2
        }
      ]
    },
    {
      "code": "11590",
      "name": "동작구",
      "riskScore": 47.0,
      "riskGrade": "보통",
      "transactionRiskScore": 57.6,
      "priceBurdenRiskScore": 63.0,
      "liquidityRiskScore": 71.1,
      "volatilityRiskScore": 24.0,
      "competitionRiskScore": 34.0,
      "competitionRiskGrade": "낮음",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 27.3,
      "storesPerAdminDong": 914.9,
      "topCategories": "부동산 중개/대리업:758 | 미용실:653 | 백반/한정식:630",
      "objections": [
        "거래 유동성이 약해지고 있습니다",
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "거래 유동성 점수 71.1점으로 단기 회전이 불리합니다 / 최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "동작구는 47.0점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '거래 둔화형'이며, 핵심 반대 근거는 거래 유동성이 약해지고 있습니다, 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 도봉구, 구로구, 광진구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "거래 둔화형",
      "archetypeSummary": "매물은 보이지만 거래가 얇아지는 유형입니다. 단기 회전과 매도 유동성이 약할 수 있습니다.",
      "decisionQuestion": "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검해야 합니다.",
      "recommendedAction": "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "도봉구",
          "score": 37.0,
          "liquidityScore": 62.7,
          "competitionScore": 27.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "구로구",
          "score": 27.6,
          "liquidityScore": 21.8,
          "competitionScore": 33.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 24,
          "medianPricePerSqm": 1547.7,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 15,
          "medianPricePerSqm": 775.5,
          "priceGrowth6mPct": -33.2,
          "transactionDropVs6mPct": -23.1
        },
        {
          "month": "2025.06",
          "transactionCount": 22,
          "medianPricePerSqm": 773.7,
          "priceGrowth6mPct": -25.1,
          "transactionDropVs6mPct": 8.2
        },
        {
          "month": "2025.07",
          "transactionCount": 23,
          "medianPricePerSqm": 1340.3,
          "priceGrowth6mPct": 20.8,
          "transactionDropVs6mPct": 9.5
        },
        {
          "month": "2025.08",
          "transactionCount": 9,
          "medianPricePerSqm": 727.3,
          "priceGrowth6mPct": -29.6,
          "transactionDropVs6mPct": -51.6
        },
        {
          "month": "2025.09",
          "transactionCount": 15,
          "medianPricePerSqm": 974.3,
          "priceGrowth6mPct": -4.8,
          "transactionDropVs6mPct": -16.7
        },
        {
          "month": "2025.10",
          "transactionCount": 12,
          "medianPricePerSqm": 550.9,
          "priceGrowth6mPct": -35.7,
          "transactionDropVs6mPct": -25.0
        },
        {
          "month": "2025.11",
          "transactionCount": 8,
          "medianPricePerSqm": 669.1,
          "priceGrowth6mPct": -20.3,
          "transactionDropVs6mPct": -46.1
        },
        {
          "month": "2025.12",
          "transactionCount": 7,
          "medianPricePerSqm": 754.0,
          "priceGrowth6mPct": -9.8,
          "transactionDropVs6mPct": -43.2
        },
        {
          "month": "2026.01",
          "transactionCount": 14,
          "medianPricePerSqm": 734.5,
          "priceGrowth6mPct": -0.1,
          "transactionDropVs6mPct": 29.2
        },
        {
          "month": "2026.02",
          "transactionCount": 12,
          "medianPricePerSqm": 502.8,
          "priceGrowth6mPct": -27.9,
          "transactionDropVs6mPct": 5.9
        },
        {
          "month": "2026.03",
          "transactionCount": 6,
          "medianPricePerSqm": 817.8,
          "priceGrowth6mPct": 21.8,
          "transactionDropVs6mPct": -39.0
        }
      ]
    },
    {
      "code": "11410",
      "name": "서대문구",
      "riskScore": 45.5,
      "riskGrade": "보통",
      "transactionRiskScore": 51.7,
      "priceBurdenRiskScore": 29.0,
      "liquidityRiskScore": 100.0,
      "volatilityRiskScore": 36.0,
      "competitionRiskScore": 38.0,
      "competitionRiskGrade": "보통",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 30.0,
      "storesPerAdminDong": 973.9,
      "topCategories": "백반/한정식:751 | 카페:661 | 부동산 중개/대리업:624",
      "objections": [
        "거래 유동성이 약해지고 있습니다",
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "거래 유동성 점수 100.0점으로 단기 회전이 불리합니다 / 최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "서대문구는 45.5점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '거래 둔화형'이며, 핵심 반대 근거는 거래 유동성이 약해지고 있습니다, 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 강북구, 광진구, 도봉구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "거래 둔화형",
      "archetypeSummary": "매물은 보이지만 거래가 얇아지는 유형입니다. 단기 회전과 매도 유동성이 약할 수 있습니다.",
      "decisionQuestion": "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검해야 합니다.",
      "recommendedAction": "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "강북구",
          "score": 39.9,
          "liquidityScore": 94.2,
          "competitionScore": 41.2,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "도봉구",
          "score": 37.0,
          "liquidityScore": 62.7,
          "competitionScore": 27.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 12,
          "medianPricePerSqm": 671.5,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 6,
          "medianPricePerSqm": 547.8,
          "priceGrowth6mPct": -10.1,
          "transactionDropVs6mPct": -33.3
        },
        {
          "month": "2025.06",
          "transactionCount": 13,
          "medianPricePerSqm": 670.2,
          "priceGrowth6mPct": 6.4,
          "transactionDropVs6mPct": 25.8
        },
        {
          "month": "2025.07",
          "transactionCount": 15,
          "medianPricePerSqm": 1666.7,
          "priceGrowth6mPct": 87.5,
          "transactionDropVs6mPct": 30.4
        },
        {
          "month": "2025.08",
          "transactionCount": 11,
          "medianPricePerSqm": 459.7,
          "priceGrowth6mPct": -42.8,
          "transactionDropVs6mPct": -3.5
        },
        {
          "month": "2025.09",
          "transactionCount": 8,
          "medianPricePerSqm": 690.1,
          "priceGrowth6mPct": -12.0,
          "transactionDropVs6mPct": -26.2
        },
        {
          "month": "2025.10",
          "transactionCount": 16,
          "medianPricePerSqm": 680.3,
          "priceGrowth6mPct": -13.4,
          "transactionDropVs6mPct": 39.1
        },
        {
          "month": "2025.11",
          "transactionCount": 10,
          "medianPricePerSqm": 911.6,
          "priceGrowth6mPct": 7.7,
          "transactionDropVs6mPct": -17.8
        },
        {
          "month": "2025.12",
          "transactionCount": 20,
          "medianPricePerSqm": 665.5,
          "priceGrowth6mPct": -21.3,
          "transactionDropVs6mPct": 50.0
        },
        {
          "month": "2026.01",
          "transactionCount": 27,
          "medianPricePerSqm": 619.2,
          "priceGrowth6mPct": -7.7,
          "transactionDropVs6mPct": 76.1
        },
        {
          "month": "2026.02",
          "transactionCount": 29,
          "medianPricePerSqm": 808.4,
          "priceGrowth6mPct": 10.9,
          "transactionDropVs6mPct": 58.2
        },
        {
          "month": "2026.03",
          "transactionCount": 1,
          "medianPricePerSqm": 477.4,
          "priceGrowth6mPct": -31.2,
          "transactionDropVs6mPct": -94.2
        }
      ]
    },
    {
      "code": "11500",
      "name": "강서구",
      "riskScore": 44.2,
      "riskGrade": "보통",
      "transactionRiskScore": 38.8,
      "priceBurdenRiskScore": 41.4,
      "liquidityRiskScore": 31.0,
      "volatilityRiskScore": 44.0,
      "competitionRiskScore": 50.8,
      "competitionRiskGrade": "보통",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 26.2,
      "storesPerAdminDong": 1301.4,
      "topCategories": "부동산 중개/대리업:1280 | 백반/한정식:1258 | 미용실:1136",
      "objections": [
        "한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다"
      ],
      "riskSummary": "즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다",
      "memo": "강서구는 44.2점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다입니다. 지금 바로 매입 결정을 내리기보다 노원구, 은평구, 광진구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "노원구",
          "score": 35.9,
          "liquidityScore": 35.5,
          "competitionScore": 50.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 2,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 52,
          "medianPricePerSqm": 965.4,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 29,
          "medianPricePerSqm": 621.6,
          "priceGrowth6mPct": -21.7,
          "transactionDropVs6mPct": -28.4
        },
        {
          "month": "2025.06",
          "transactionCount": 22,
          "medianPricePerSqm": 328.9,
          "priceGrowth6mPct": -48.5,
          "transactionDropVs6mPct": -35.9
        },
        {
          "month": "2025.07",
          "transactionCount": 14,
          "medianPricePerSqm": 645.8,
          "priceGrowth6mPct": 0.8,
          "transactionDropVs6mPct": -52.1
        },
        {
          "month": "2025.08",
          "transactionCount": 20,
          "medianPricePerSqm": 407.0,
          "priceGrowth6mPct": -31.5,
          "transactionDropVs6mPct": -27.0
        },
        {
          "month": "2025.09",
          "transactionCount": 32,
          "medianPricePerSqm": 614.8,
          "priceGrowth6mPct": 2.9,
          "transactionDropVs6mPct": 13.6
        },
        {
          "month": "2025.10",
          "transactionCount": 19,
          "medianPricePerSqm": 437.3,
          "priceGrowth6mPct": -14.1,
          "transactionDropVs6mPct": -16.2
        },
        {
          "month": "2025.11",
          "transactionCount": 31,
          "medianPricePerSqm": 934.2,
          "priceGrowth6mPct": 66.4,
          "transactionDropVs6mPct": 34.8
        },
        {
          "month": "2025.12",
          "transactionCount": 30,
          "medianPricePerSqm": 563.6,
          "priceGrowth6mPct": -6.1,
          "transactionDropVs6mPct": 23.3
        },
        {
          "month": "2026.01",
          "transactionCount": 17,
          "medianPricePerSqm": 605.1,
          "priceGrowth6mPct": 1.9,
          "transactionDropVs6mPct": -31.5
        },
        {
          "month": "2026.02",
          "transactionCount": 19,
          "medianPricePerSqm": 500.0,
          "priceGrowth6mPct": -17.9,
          "transactionDropVs6mPct": -23.0
        },
        {
          "month": "2026.03",
          "transactionCount": 18,
          "medianPricePerSqm": 530.9,
          "priceGrowth6mPct": -10.8,
          "transactionDropVs6mPct": -19.4
        }
      ]
    },
    {
      "code": "11230",
      "name": "동대문구",
      "riskScore": 44.0,
      "riskGrade": "보통",
      "transactionRiskScore": 39.8,
      "priceBurdenRiskScore": 10.6,
      "liquidityRiskScore": 75.1,
      "volatilityRiskScore": 60.0,
      "competitionRiskScore": 49.2,
      "competitionRiskGrade": "보통",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 27.6,
      "storesPerAdminDong": 1042.1,
      "topCategories": "백반/한정식:1015 | 부동산 중개/대리업:820 | 미용실:699",
      "objections": [
        "거래 유동성이 약해지고 있습니다"
      ],
      "riskSummary": "거래 유동성 점수 75.1점으로 단기 회전이 불리합니다",
      "memo": "동대문구는 44.0점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '거래 둔화형'이며, 핵심 반대 근거는 거래 유동성이 약해지고 있습니다입니다. 지금 바로 매입 결정을 내리기보다 노원구, 은평구, 광진구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "거래 둔화형",
      "archetypeSummary": "매물은 보이지만 거래가 얇아지는 유형입니다. 단기 회전과 매도 유동성이 약할 수 있습니다.",
      "decisionQuestion": "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검해야 합니다.",
      "recommendedAction": "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
      "reviewChecklist": [
        "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "노원구",
          "score": 35.9,
          "liquidityScore": 35.5,
          "competitionScore": 50.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 24,
          "medianPricePerSqm": 481.8,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 28,
          "medianPricePerSqm": 714.3,
          "priceGrowth6mPct": 19.4,
          "transactionDropVs6mPct": 7.7
        },
        {
          "month": "2025.06",
          "transactionCount": 25,
          "medianPricePerSqm": 876.1,
          "priceGrowth6mPct": 26.8,
          "transactionDropVs6mPct": -2.6
        },
        {
          "month": "2025.07",
          "transactionCount": 44,
          "medianPricePerSqm": 587.7,
          "priceGrowth6mPct": -11.6,
          "transactionDropVs6mPct": 45.5
        },
        {
          "month": "2025.08",
          "transactionCount": 20,
          "medianPricePerSqm": 454.6,
          "priceGrowth6mPct": -27.0,
          "transactionDropVs6mPct": -29.1
        },
        {
          "month": "2025.09",
          "transactionCount": 28,
          "medianPricePerSqm": 189.2,
          "priceGrowth6mPct": -65.6,
          "transactionDropVs6mPct": -0.6
        },
        {
          "month": "2025.10",
          "transactionCount": 17,
          "medianPricePerSqm": 853.8,
          "priceGrowth6mPct": 39.4,
          "transactionDropVs6mPct": -37.0
        },
        {
          "month": "2025.11",
          "transactionCount": 376,
          "medianPricePerSqm": 840.3,
          "priceGrowth6mPct": 32.6,
          "transactionDropVs6mPct": 342.4
        },
        {
          "month": "2025.12",
          "transactionCount": 89,
          "medianPricePerSqm": 823.0,
          "priceGrowth6mPct": 31.7,
          "transactionDropVs6mPct": -7.0
        },
        {
          "month": "2026.01",
          "transactionCount": 37,
          "medianPricePerSqm": 771.5,
          "priceGrowth6mPct": 17.7,
          "transactionDropVs6mPct": -60.8
        },
        {
          "month": "2026.02",
          "transactionCount": 17,
          "medianPricePerSqm": 456.4,
          "priceGrowth6mPct": -30.4,
          "transactionDropVs6mPct": -81.9
        },
        {
          "month": "2026.03",
          "transactionCount": 15,
          "medianPricePerSqm": 295.8,
          "priceGrowth6mPct": -56.1,
          "transactionDropVs6mPct": -83.7
        }
      ]
    },
    {
      "code": "11260",
      "name": "중랑구",
      "riskScore": 42.6,
      "riskGrade": "보통",
      "transactionRiskScore": 45.1,
      "priceBurdenRiskScore": 24.0,
      "liquidityRiskScore": 78.3,
      "volatilityRiskScore": 48.0,
      "competitionRiskScore": 39.6,
      "competitionRiskGrade": "보통",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 28.2,
      "storesPerAdminDong": 910.7,
      "topCategories": "미용실:858 | 백반/한정식:775 | 부동산 중개/대리업:675",
      "objections": [
        "거래 유동성이 약해지고 있습니다",
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "거래 유동성 점수 78.3점으로 단기 회전이 불리합니다 / 최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "중랑구는 42.6점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '거래 둔화형'이며, 핵심 반대 근거는 거래 유동성이 약해지고 있습니다, 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 광진구, 노원구, 도봉구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "거래 둔화형",
      "archetypeSummary": "매물은 보이지만 거래가 얇아지는 유형입니다. 단기 회전과 매도 유동성이 약할 수 있습니다.",
      "decisionQuestion": "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검해야 합니다.",
      "recommendedAction": "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "노원구",
          "score": 35.9,
          "liquidityScore": 35.5,
          "competitionScore": 50.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 3,
          "name": "도봉구",
          "score": 37.0,
          "liquidityScore": 62.7,
          "competitionScore": 27.6,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 9,
          "medianPricePerSqm": 427.1,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 11,
          "medianPricePerSqm": 483.9,
          "priceGrowth6mPct": 6.2,
          "transactionDropVs6mPct": 10.0
        },
        {
          "month": "2025.06",
          "transactionCount": 14,
          "medianPricePerSqm": 595.7,
          "priceGrowth6mPct": 18.6,
          "transactionDropVs6mPct": 23.5
        },
        {
          "month": "2025.07",
          "transactionCount": 10,
          "medianPricePerSqm": 507.1,
          "priceGrowth6mPct": 0.7,
          "transactionDropVs6mPct": -9.1
        },
        {
          "month": "2025.08",
          "transactionCount": 11,
          "medianPricePerSqm": 418.4,
          "priceGrowth6mPct": -14.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.09",
          "transactionCount": 10,
          "medianPricePerSqm": 479.2,
          "priceGrowth6mPct": -1.2,
          "transactionDropVs6mPct": -7.7
        },
        {
          "month": "2025.10",
          "transactionCount": 12,
          "medianPricePerSqm": 378.9,
          "priceGrowth6mPct": -20.6,
          "transactionDropVs6mPct": 5.9
        },
        {
          "month": "2025.11",
          "transactionCount": 17,
          "medianPricePerSqm": 869.6,
          "priceGrowth6mPct": 60.6,
          "transactionDropVs6mPct": 37.8
        },
        {
          "month": "2025.12",
          "transactionCount": 14,
          "medianPricePerSqm": 538.5,
          "priceGrowth6mPct": 1.2,
          "transactionDropVs6mPct": 13.5
        },
        {
          "month": "2026.01",
          "transactionCount": 11,
          "medianPricePerSqm": 469.9,
          "priceGrowth6mPct": -10.6,
          "transactionDropVs6mPct": -12.0
        },
        {
          "month": "2026.02",
          "transactionCount": 13,
          "medianPricePerSqm": 324.9,
          "priceGrowth6mPct": -36.3,
          "transactionDropVs6mPct": 1.3
        },
        {
          "month": "2026.03",
          "transactionCount": 6,
          "medianPricePerSqm": 373.5,
          "priceGrowth6mPct": -24.2,
          "transactionDropVs6mPct": -50.7
        }
      ]
    },
    {
      "code": "11305",
      "name": "강북구",
      "riskScore": 39.9,
      "riskGrade": "보통",
      "transactionRiskScore": 38.8,
      "priceBurdenRiskScore": 14.6,
      "liquidityRiskScore": 94.2,
      "volatilityRiskScore": 16.0,
      "competitionRiskScore": 41.2,
      "competitionRiskGrade": "보통",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 29.7,
      "storesPerAdminDong": 936.5,
      "topCategories": "백반/한정식:720 | 미용실:715 | 부동산 중개/대리업:532",
      "objections": [
        "거래 유동성이 약해지고 있습니다",
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "거래 유동성 점수 94.2점으로 단기 회전이 불리합니다 / 최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "강북구는 39.9점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '거래 둔화형'이며, 핵심 반대 근거는 거래 유동성이 약해지고 있습니다, 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 광진구, 구로구, 은평구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "거래 둔화형",
      "archetypeSummary": "매물은 보이지만 거래가 얇아지는 유형입니다. 단기 회전과 매도 유동성이 약할 수 있습니다.",
      "decisionQuestion": "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검해야 합니다.",
      "recommendedAction": "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "최근 6개월 거래 수와 체결 속도를 중개 재고와 함께 확인하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "구로구",
          "score": 27.6,
          "liquidityScore": 21.8,
          "competitionScore": 33.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        },
        {
          "rank": 3,
          "name": "은평구",
          "score": 34.3,
          "liquidityScore": 15.0,
          "competitionScore": 55.0,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 13,
          "medianPricePerSqm": 487.4,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 13,
          "medianPricePerSqm": 738.4,
          "priceGrowth6mPct": 20.5,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.06",
          "transactionCount": 10,
          "medianPricePerSqm": 449.2,
          "priceGrowth6mPct": -19.5,
          "transactionDropVs6mPct": -16.7
        },
        {
          "month": "2025.07",
          "transactionCount": 6,
          "medianPricePerSqm": 513.6,
          "priceGrowth6mPct": -6.1,
          "transactionDropVs6mPct": -42.9
        },
        {
          "month": "2025.08",
          "transactionCount": 8,
          "medianPricePerSqm": 581.6,
          "priceGrowth6mPct": 5.0,
          "transactionDropVs6mPct": -20.0
        },
        {
          "month": "2025.09",
          "transactionCount": 10,
          "medianPricePerSqm": 388.2,
          "priceGrowth6mPct": -26.3,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.10",
          "transactionCount": 10,
          "medianPricePerSqm": 546.1,
          "priceGrowth6mPct": 1.8,
          "transactionDropVs6mPct": 5.3
        },
        {
          "month": "2025.11",
          "transactionCount": 13,
          "medianPricePerSqm": 538.2,
          "priceGrowth6mPct": 7.0,
          "transactionDropVs6mPct": 36.8
        },
        {
          "month": "2025.12",
          "transactionCount": 12,
          "medianPricePerSqm": 629.2,
          "priceGrowth6mPct": 18.1,
          "transactionDropVs6mPct": 22.0
        },
        {
          "month": "2026.01",
          "transactionCount": 7,
          "medianPricePerSqm": 431.5,
          "priceGrowth6mPct": -16.9,
          "transactionDropVs6mPct": -30.0
        },
        {
          "month": "2026.02",
          "transactionCount": 4,
          "medianPricePerSqm": 611.1,
          "priceGrowth6mPct": 16.6,
          "transactionDropVs6mPct": -57.1
        },
        {
          "month": "2026.03",
          "transactionCount": 2,
          "medianPricePerSqm": 338.8,
          "priceGrowth6mPct": -34.3,
          "transactionDropVs6mPct": -75.0
        }
      ]
    },
    {
      "code": "11320",
      "name": "도봉구",
      "riskScore": 37.0,
      "riskGrade": "보통",
      "transactionRiskScore": 44.7,
      "priceBurdenRiskScore": 39.0,
      "liquidityRiskScore": 62.7,
      "volatilityRiskScore": 32.0,
      "competitionRiskScore": 27.6,
      "competitionRiskGrade": "낮음",
      "sampleReliability": "낮음",
      "lowSampleFlag": true,
      "foodStoreSharePct": 26.8,
      "storesPerAdminDong": 738.5,
      "topCategories": "미용실:609 | 백반/한정식:507 | 부동산 중개/대리업:450",
      "objections": [
        "최근 상가 거래 표본이 적어 해석에 주의가 필요합니다"
      ],
      "riskSummary": "최근 표본이 적어 현장 검증 비중을 높여야 합니다",
      "memo": "도봉구는 37.0점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 최근 상가 거래 표본이 적어 해석에 주의가 필요합니다입니다. 지금 바로 매입 결정을 내리기보다 구로구, 광진구를 먼저 비교하는 것이 안전합니다. 최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "최근 거래 표본이 적어 인근 대체 구와 반드시 병행 비교하세요.",
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "구로구",
          "score": 27.6,
          "liquidityScore": 21.8,
          "competitionScore": 33.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        },
        {
          "rank": 2,
          "name": "광진구",
          "score": 31.0,
          "liquidityScore": 14.2,
          "competitionScore": 43.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 11,
          "medianPricePerSqm": 853.2,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 5,
          "medianPricePerSqm": 263.7,
          "priceGrowth6mPct": -52.8,
          "transactionDropVs6mPct": -37.5
        },
        {
          "month": "2025.06",
          "transactionCount": 14,
          "medianPricePerSqm": 227.1,
          "priceGrowth6mPct": -49.3,
          "transactionDropVs6mPct": 40.0
        },
        {
          "month": "2025.07",
          "transactionCount": 5,
          "medianPricePerSqm": 614.3,
          "priceGrowth6mPct": 25.5,
          "transactionDropVs6mPct": -42.9
        },
        {
          "month": "2025.08",
          "transactionCount": 6,
          "medianPricePerSqm": 642.6,
          "priceGrowth6mPct": 23.5,
          "transactionDropVs6mPct": -26.8
        },
        {
          "month": "2025.09",
          "transactionCount": 11,
          "medianPricePerSqm": 287.5,
          "priceGrowth6mPct": -40.3,
          "transactionDropVs6mPct": 26.9
        },
        {
          "month": "2025.10",
          "transactionCount": 12,
          "medianPricePerSqm": 503.9,
          "priceGrowth6mPct": 19.1,
          "transactionDropVs6mPct": 35.8
        },
        {
          "month": "2025.11",
          "transactionCount": 30,
          "medianPricePerSqm": 663.1,
          "priceGrowth6mPct": 35.4,
          "transactionDropVs6mPct": 130.8
        },
        {
          "month": "2025.12",
          "transactionCount": 11,
          "medianPricePerSqm": 346.0,
          "priceGrowth6mPct": -32.1,
          "transactionDropVs6mPct": -12.0
        },
        {
          "month": "2026.01",
          "transactionCount": 7,
          "medianPricePerSqm": 366.5,
          "priceGrowth6mPct": -21.7,
          "transactionDropVs6mPct": -45.5
        },
        {
          "month": "2026.02",
          "transactionCount": 10,
          "medianPricePerSqm": 335.3,
          "priceGrowth6mPct": -19.6,
          "transactionDropVs6mPct": -25.9
        },
        {
          "month": "2026.03",
          "transactionCount": 8,
          "medianPricePerSqm": 405.0,
          "priceGrowth6mPct": -7.3,
          "transactionDropVs6mPct": -38.5
        }
      ]
    },
    {
      "code": "11350",
      "name": "노원구",
      "riskScore": 35.9,
      "riskGrade": "보통",
      "transactionRiskScore": 23.8,
      "priceBurdenRiskScore": 4.0,
      "liquidityRiskScore": 35.5,
      "volatilityRiskScore": 56.0,
      "competitionRiskScore": 50.6,
      "competitionRiskGrade": "보통",
      "sampleReliability": "보통",
      "lowSampleFlag": false,
      "foodStoreSharePct": 28.1,
      "storesPerAdminDong": 811.4,
      "topCategories": "입시·교과학원:1043 | 미용실:785 | 백반/한정식:721",
      "objections": [
        "한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다"
      ],
      "riskSummary": "즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다",
      "memo": "노원구는 35.9점, '보통' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다입니다. 지금 바로 매입 결정을 내리기보다 구로구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "구로구",
          "score": 27.6,
          "liquidityScore": 21.8,
          "competitionScore": 33.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 거래 유동성이 더 안정적입니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 23,
          "medianPricePerSqm": 611.6,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 17,
          "medianPricePerSqm": 365.4,
          "priceGrowth6mPct": -25.2,
          "transactionDropVs6mPct": -15.0
        },
        {
          "month": "2025.06",
          "transactionCount": 15,
          "medianPricePerSqm": 425.3,
          "priceGrowth6mPct": -9.0,
          "transactionDropVs6mPct": -18.2
        },
        {
          "month": "2025.07",
          "transactionCount": 25,
          "medianPricePerSqm": 104.0,
          "priceGrowth6mPct": -72.4,
          "transactionDropVs6mPct": 25.0
        },
        {
          "month": "2025.08",
          "transactionCount": 9,
          "medianPricePerSqm": 295.6,
          "priceGrowth6mPct": -18.0,
          "transactionDropVs6mPct": -49.4
        },
        {
          "month": "2025.09",
          "transactionCount": 16,
          "medianPricePerSqm": 513.5,
          "priceGrowth6mPct": 33.1,
          "transactionDropVs6mPct": -8.6
        },
        {
          "month": "2025.10",
          "transactionCount": 14,
          "medianPricePerSqm": 710.6,
          "priceGrowth6mPct": 76.6,
          "transactionDropVs6mPct": -12.5
        },
        {
          "month": "2025.11",
          "transactionCount": 12,
          "medianPricePerSqm": 415.9,
          "priceGrowth6mPct": 1.2,
          "transactionDropVs6mPct": -20.9
        },
        {
          "month": "2025.12",
          "transactionCount": 7,
          "medianPricePerSqm": 514.2,
          "priceGrowth6mPct": 20.8,
          "transactionDropVs6mPct": -49.4
        },
        {
          "month": "2026.01",
          "transactionCount": 16,
          "medianPricePerSqm": 687.5,
          "priceGrowth6mPct": 31.5,
          "transactionDropVs6mPct": 29.7
        },
        {
          "month": "2026.02",
          "transactionCount": 18,
          "medianPricePerSqm": 374.0,
          "priceGrowth6mPct": -30.2,
          "transactionDropVs6mPct": 30.1
        },
        {
          "month": "2026.03",
          "transactionCount": 15,
          "medianPricePerSqm": 97.3,
          "priceGrowth6mPct": -79.2,
          "transactionDropVs6mPct": 9.8
        }
      ]
    },
    {
      "code": "11380",
      "name": "은평구",
      "riskScore": 34.3,
      "riskGrade": "낮음",
      "transactionRiskScore": 17.4,
      "priceBurdenRiskScore": 24.2,
      "liquidityRiskScore": 15.0,
      "volatilityRiskScore": 4.0,
      "competitionRiskScore": 55.0,
      "competitionRiskGrade": "보통",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 27.7,
      "storesPerAdminDong": 994.6,
      "topCategories": "부동산 중개/대리업:954 | 미용실:929 | 백반/한정식:803",
      "objections": [
        "한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다"
      ],
      "riskSummary": "즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다",
      "memo": "은평구는 34.3점, '낮음' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다입니다. 지금 바로 매입 결정을 내리기보다 구로구를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [
        {
          "rank": 1,
          "name": "구로구",
          "score": 27.6,
          "liquidityScore": 21.8,
          "competitionScore": 33.4,
          "whyBetter": "총 매입 리스크가 더 낮습니다, 상권 과밀도가 더 낮습니다"
        }
      ],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 21,
          "medianPricePerSqm": 380.3,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 20,
          "medianPricePerSqm": 564.3,
          "priceGrowth6mPct": 19.5,
          "transactionDropVs6mPct": -2.4
        },
        {
          "month": "2025.06",
          "transactionCount": 20,
          "medianPricePerSqm": 413.3,
          "priceGrowth6mPct": -8.7,
          "transactionDropVs6mPct": -1.6
        },
        {
          "month": "2025.07",
          "transactionCount": 31,
          "medianPricePerSqm": 504.9,
          "priceGrowth6mPct": 8.4,
          "transactionDropVs6mPct": 34.8
        },
        {
          "month": "2025.08",
          "transactionCount": 26,
          "medianPricePerSqm": 818.4,
          "priceGrowth6mPct": 52.6,
          "transactionDropVs6mPct": 10.2
        },
        {
          "month": "2025.09",
          "transactionCount": 28,
          "medianPricePerSqm": 671.2,
          "priceGrowth6mPct": 20.1,
          "transactionDropVs6mPct": 15.1
        },
        {
          "month": "2025.10",
          "transactionCount": 21,
          "medianPricePerSqm": 455.0,
          "priceGrowth6mPct": -20.3,
          "transactionDropVs6mPct": -13.7
        },
        {
          "month": "2025.11",
          "transactionCount": 32,
          "medianPricePerSqm": 441.0,
          "priceGrowth6mPct": -19.9,
          "transactionDropVs6mPct": 21.5
        },
        {
          "month": "2025.12",
          "transactionCount": 22,
          "medianPricePerSqm": 533.2,
          "priceGrowth6mPct": -6.6,
          "transactionDropVs6mPct": -17.5
        },
        {
          "month": "2026.01",
          "transactionCount": 15,
          "medianPricePerSqm": 442.7,
          "priceGrowth6mPct": -21.0,
          "transactionDropVs6mPct": -37.5
        },
        {
          "month": "2026.02",
          "transactionCount": 11,
          "medianPricePerSqm": 438.2,
          "priceGrowth6mPct": -11.8,
          "transactionDropVs6mPct": -48.8
        },
        {
          "month": "2026.03",
          "transactionCount": 24,
          "medianPricePerSqm": 367.1,
          "priceGrowth6mPct": -17.7,
          "transactionDropVs6mPct": 15.2
        }
      ]
    },
    {
      "code": "11215",
      "name": "광진구",
      "riskScore": 31.0,
      "riskGrade": "낮음",
      "transactionRiskScore": 20.8,
      "priceBurdenRiskScore": 12.2,
      "liquidityRiskScore": 14.2,
      "volatilityRiskScore": 52.0,
      "competitionRiskScore": 43.4,
      "competitionRiskGrade": "보통",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 27.3,
      "storesPerAdminDong": 1201.1,
      "topCategories": "백반/한정식:870 | 부동산 중개/대리업:868 | 미용실:829",
      "objections": [
        "한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다"
      ],
      "riskSummary": "즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다",
      "memo": "광진구는 31.0점, '낮음' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다입니다. 지금 바로 매입 결정을 내리기보다 대체 후보 없음를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 16,
          "medianPricePerSqm": 800.5,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 23,
          "medianPricePerSqm": 576.3,
          "priceGrowth6mPct": -16.3,
          "transactionDropVs6mPct": 17.9
        },
        {
          "month": "2025.06",
          "transactionCount": 6,
          "medianPricePerSqm": 667.5,
          "priceGrowth6mPct": -2.1,
          "transactionDropVs6mPct": -60.0
        },
        {
          "month": "2025.07",
          "transactionCount": 28,
          "medianPricePerSqm": 547.0,
          "priceGrowth6mPct": -15.6,
          "transactionDropVs6mPct": 53.4
        },
        {
          "month": "2025.08",
          "transactionCount": 17,
          "medianPricePerSqm": 45.5,
          "priceGrowth6mPct": -91.4,
          "transactionDropVs6mPct": -5.6
        },
        {
          "month": "2025.09",
          "transactionCount": 33,
          "medianPricePerSqm": 648.2,
          "priceGrowth6mPct": 18.4,
          "transactionDropVs6mPct": 61.0
        },
        {
          "month": "2025.10",
          "transactionCount": 40,
          "medianPricePerSqm": 316.2,
          "priceGrowth6mPct": -32.3,
          "transactionDropVs6mPct": 63.3
        },
        {
          "month": "2025.11",
          "transactionCount": 20,
          "medianPricePerSqm": 564.0,
          "priceGrowth6mPct": 21.4,
          "transactionDropVs6mPct": -16.7
        },
        {
          "month": "2025.12",
          "transactionCount": 25,
          "medianPricePerSqm": 45.2,
          "priceGrowth6mPct": -87.5,
          "transactionDropVs6mPct": -8.0
        },
        {
          "month": "2026.01",
          "transactionCount": 28,
          "medianPricePerSqm": 584.3,
          "priceGrowth6mPct": 59.1,
          "transactionDropVs6mPct": 3.1
        },
        {
          "month": "2026.02",
          "transactionCount": 25,
          "medianPricePerSqm": 461.2,
          "priceGrowth6mPct": 5.7,
          "transactionDropVs6mPct": -12.3
        },
        {
          "month": "2026.03",
          "transactionCount": 26,
          "medianPricePerSqm": 272.9,
          "priceGrowth6mPct": -27.0,
          "transactionDropVs6mPct": -4.9
        }
      ]
    },
    {
      "code": "11530",
      "name": "구로구",
      "riskScore": 27.6,
      "riskGrade": "낮음",
      "transactionRiskScore": 22.9,
      "priceBurdenRiskScore": 28.0,
      "liquidityRiskScore": 21.8,
      "volatilityRiskScore": 12.0,
      "competitionRiskScore": 33.4,
      "competitionRiskGrade": "낮음",
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "foodStoreSharePct": 25.5,
      "storesPerAdminDong": 1120.1,
      "topCategories": "백반/한정식:816 | 미용실:737 | 경영 컨설팅업:721",
      "objections": [
        "한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다"
      ],
      "riskSummary": "즉시 배제할 수준은 아니지만 매물 단위 검토가 필요한 구입니다",
      "memo": "구로구는 27.6점, '낮음' 구간입니다. 현재 이 구의 대표 유형은 '복합 점검형'이며, 핵심 반대 근거는 한 가지 축만 위험한 것은 아니지만 복합 검토가 필요한 구입니다입니다. 지금 바로 매입 결정을 내리기보다 대체 후보 없음를 먼저 비교하는 것이 안전합니다.",
      "riskArchetype": "복합 점검형",
      "archetypeSummary": "한 축만 위험하지는 않지만 여러 신호가 중간 수준으로 겹쳐 있는 유형입니다.",
      "decisionQuestion": "매입 결정을 서두르기보다 케이스별 검증 항목을 쌓아야 합니다.",
      "recommendedAction": "현장 답사와 대체 구 비교를 동시에 진행하세요.",
      "reviewChecklist": [
        "현장 답사와 대체 구 비교를 동시에 진행하세요.",
        "최근 3개월 호가와 실거래 차이를 현장 중개사 두 곳 이상에서 교차 확인하세요.",
        "핵심 업종이 실제로 버티는지 임차인 교체 속도와 공실 재고를 점검하세요."
      ],
      "replacementCandidates": [],
      "history": [
        {
          "month": "2025.04",
          "transactionCount": 61,
          "medianPricePerSqm": 295.1,
          "priceGrowth6mPct": 0.0,
          "transactionDropVs6mPct": 0.0
        },
        {
          "month": "2025.05",
          "transactionCount": 44,
          "medianPricePerSqm": 577.8,
          "priceGrowth6mPct": 32.4,
          "transactionDropVs6mPct": -16.2
        },
        {
          "month": "2025.06",
          "transactionCount": 37,
          "medianPricePerSqm": 528.6,
          "priceGrowth6mPct": 13.2,
          "transactionDropVs6mPct": -21.8
        },
        {
          "month": "2025.07",
          "transactionCount": 34,
          "medianPricePerSqm": 676.3,
          "priceGrowth6mPct": 30.2,
          "transactionDropVs6mPct": -22.7
        },
        {
          "month": "2025.08",
          "transactionCount": 50,
          "medianPricePerSqm": 326.5,
          "priceGrowth6mPct": -32.1,
          "transactionDropVs6mPct": 10.6
        },
        {
          "month": "2025.09",
          "transactionCount": 33,
          "medianPricePerSqm": 432.7,
          "priceGrowth6mPct": -8.5,
          "transactionDropVs6mPct": -23.6
        },
        {
          "month": "2025.10",
          "transactionCount": 15,
          "medianPricePerSqm": 437.9,
          "priceGrowth6mPct": -11.8,
          "transactionDropVs6mPct": -57.7
        },
        {
          "month": "2025.11",
          "transactionCount": 40,
          "medianPricePerSqm": 307.2,
          "priceGrowth6mPct": -32.0,
          "transactionDropVs6mPct": 14.8
        },
        {
          "month": "2025.12",
          "transactionCount": 40,
          "medianPricePerSqm": 561.4,
          "priceGrowth6mPct": 22.8,
          "transactionDropVs6mPct": 13.2
        },
        {
          "month": "2026.01",
          "transactionCount": 41,
          "medianPricePerSqm": 492.1,
          "priceGrowth6mPct": 15.4,
          "transactionDropVs6mPct": 12.3
        },
        {
          "month": "2026.02",
          "transactionCount": 32,
          "medianPricePerSqm": 559.6,
          "priceGrowth6mPct": 20.3,
          "transactionDropVs6mPct": -4.5
        },
        {
          "month": "2026.03",
          "transactionCount": 25,
          "medianPricePerSqm": 373.7,
          "priceGrowth6mPct": -17.9,
          "transactionDropVs6mPct": -22.3
        }
      ]
    }
  ],
  "caseStudies": [
    {
      "name": "서초구",
      "riskScore": 78.9,
      "riskGrade": "매우 높음",
      "transactionRiskScore": 85.2,
      "competitionRiskScore": 71.2,
      "priceBurdenRiskScore": 98.6,
      "liquidityRiskScore": 52.9,
      "volatilityRiskScore": 100.0,
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "latestMonth": "2026.03",
      "latestTransactionCount": 21,
      "latestMedianPricePerSqm": 2633.1,
      "sixMonthPriceChangePct": 112.9,
      "sixMonthTransactionChangePct": -53.3,
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "상권 내 점포 과밀도가 높습니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "price burden is elevated, with 6m price growth at 104.2%; price volatility has been high in recent months",
      "topCategories": "경영 컨설팅업:2710 | 변호사:2678 | 부동산 중개/대리업:2094",
      "replacementCandidates": [
        "금천구",
        "관악구",
        "양천구"
      ],
      "fieldChecks": [
        "현재 호가가 최근 실거래 레벨에서 실제로 체결되는지 확인하세요",
        "핵심 행정동 골목을 돌며 중복 업종 밀도를 직접 확인하세요",
        "대형 이상 거래와 집합상가 거래를 구분해서 다시 보세요"
      ],
      "riskArchetype": "고가 선행형"
    },
    {
      "name": "강남구",
      "riskScore": 71.8,
      "riskGrade": "높음",
      "transactionRiskScore": 68.0,
      "competitionRiskScore": 76.4,
      "priceBurdenRiskScore": 93.2,
      "liquidityRiskScore": 20.6,
      "volatilityRiskScore": 76.0,
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "latestMonth": "2026.03",
      "latestTransactionCount": 36,
      "latestMedianPricePerSqm": 2345.1,
      "sixMonthPriceChangePct": 87.1,
      "sixMonthTransactionChangePct": -14.3,
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "상권 내 점포 과밀도가 높습니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "price burden is elevated, with 6m price growth at 40.7%; price volatility has been high in recent months",
      "topCategories": "경영 컨설팅업:5736 | 부동산 중개/대리업:3665 | 광고 대행업:3322",
      "replacementCandidates": [
        "구로구"
      ],
      "fieldChecks": [
        "현재 호가가 최근 실거래 레벨에서 실제로 체결되는지 확인하세요",
        "핵심 행정동 골목을 돌며 중복 업종 밀도를 직접 확인하세요",
        "대형 이상 거래와 집합상가 거래를 구분해서 다시 보세요"
      ],
      "riskArchetype": "고가 선행형"
    },
    {
      "name": "중구",
      "riskScore": 70.2,
      "riskGrade": "높음",
      "transactionRiskScore": 77.5,
      "competitionRiskScore": 61.2,
      "priceBurdenRiskScore": 94.8,
      "liquidityRiskScore": 41.8,
      "volatilityRiskScore": 88.0,
      "sampleReliability": "높음",
      "lowSampleFlag": false,
      "latestMonth": "2026.03",
      "latestTransactionCount": 46,
      "latestMedianPricePerSqm": 2036.0,
      "sixMonthPriceChangePct": 263.0,
      "sixMonthTransactionChangePct": -88.0,
      "objections": [
        "같은 권역 대비 매입 가격 부담이 큽니다",
        "최근 실거래 가격 변동성이 큽니다"
      ],
      "riskSummary": "price burden is elevated, with 6m price growth at 123.9%; price volatility has been high in recent months",
      "topCategories": "백반/한정식:1428 | 기타 의류 소매업:1366 | 카페:1075",
      "replacementCandidates": [
        "관악구",
        "강서구",
        "은평구"
      ],
      "fieldChecks": [
        "현재 호가가 최근 실거래 레벨에서 실제로 체결되는지 확인하세요",
        "대형 이상 거래와 집합상가 거래를 구분해서 다시 보세요"
      ],
      "riskArchetype": "고가 선행형"
    }
  ],
  "demandFragility": [
    {
      "name": "대원종합시장",
      "type": "전통시장",
      "quarter": "20244",
      "riskScore": 81.2,
      "riskGrade": "매우 높음",
      "floatingPopulation": 49335.0,
      "salesAmount": 27477540,
      "serviceCount": 2,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 업종 수에 비해 유효 수요가 얇습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "남부종합시장",
      "type": "전통시장",
      "quarter": "20244",
      "riskScore": 80.8,
      "riskGrade": "매우 높음",
      "floatingPopulation": 33286.0,
      "salesAmount": 15253062,
      "serviceCount": 1,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "동진시장",
      "type": "전통시장",
      "quarter": "20244",
      "riskScore": 78.6,
      "riskGrade": "매우 높음",
      "floatingPopulation": 45960.0,
      "salesAmount": 5282514,
      "serviceCount": 1,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "백운시장",
      "type": "전통시장",
      "quarter": "20244",
      "riskScore": 76.1,
      "riskGrade": "매우 높음",
      "floatingPopulation": 71699.0,
      "salesAmount": 16773257,
      "serviceCount": 2,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "청담역 12번",
      "type": "골목상권",
      "quarter": "20244",
      "riskScore": 74.3,
      "riskGrade": "높음",
      "floatingPopulation": 56967.0,
      "salesAmount": 39104148,
      "serviceCount": 1,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "남태령역(서울전자고등학교)",
      "type": "골목상권",
      "quarter": "20244",
      "riskScore": 73.6,
      "riskGrade": "높음",
      "floatingPopulation": 43338.0,
      "salesAmount": 30000000,
      "serviceCount": 1,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "논현종합시장",
      "type": "전통시장",
      "quarter": "20244",
      "riskScore": 72.1,
      "riskGrade": "높음",
      "floatingPopulation": 31538.0,
      "salesAmount": 18149279,
      "serviceCount": 1,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "중암중학교",
      "type": "골목상권",
      "quarter": "20244",
      "riskScore": 71.3,
      "riskGrade": "높음",
      "floatingPopulation": 143655.0,
      "salesAmount": 35280583,
      "serviceCount": 2,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "홍제역 3번",
      "type": "골목상권",
      "quarter": "20244",
      "riskScore": 70.8,
      "riskGrade": "높음",
      "floatingPopulation": 327076.0,
      "salesAmount": 195068524,
      "serviceCount": 5,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다"
    },
    {
      "name": "송파나루역 3번",
      "type": "골목상권",
      "quarter": "20244",
      "riskScore": 70.8,
      "riskGrade": "높음",
      "floatingPopulation": 175324.0,
      "salesAmount": 156663980,
      "serviceCount": 3,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다; 업종 구성이 좁아 회복 탄력이 약합니다"
    },
    {
      "name": "화랑대철도공원",
      "type": "골목상권",
      "quarter": "20244",
      "riskScore": 70.6,
      "riskGrade": "높음",
      "floatingPopulation": 125445.0,
      "salesAmount": 377393535,
      "serviceCount": 6,
      "objection": "업종 수에 비해 유효 수요가 얇습니다; 건당 매출 규모가 약합니다"
    },
    {
      "name": "강남세브란스병원미래의학연구센터",
      "type": "골목상권",
      "quarter": "20244",
      "riskScore": 69.2,
      "riskGrade": "높음",
      "floatingPopulation": 329285.0,
      "salesAmount": 302691227,
      "serviceCount": 5,
      "objection": "유동인구 대비 매출 효율이 낮습니다; 건당 매출 규모가 약합니다"
    }
  ],
  "adminDongSaturation": [
    {
      "districtName": "강남구",
      "name": "역삼1동",
      "totalStoreCount": 13380,
      "foodStoreSharePct": 19.8,
      "categoryCount": 233,
      "topCategories": "경영 컨설팅업:1521 | 부동산 중개/대리업:855 | 광고 대행업:737"
    },
    {
      "districtName": "금천구",
      "name": "가산동",
      "totalStoreCount": 10017,
      "foodStoreSharePct": 13.8,
      "categoryCount": 222,
      "topCategories": "경영 컨설팅업:1476 | 광고 대행업:960 | 부동산 중개/대리업:429"
    },
    {
      "districtName": "마포구",
      "name": "서교동",
      "totalStoreCount": 8829,
      "foodStoreSharePct": 29.4,
      "categoryCount": 222,
      "topCategories": "카페:513 | 백반/한정식:438 | 광고 대행업:371"
    },
    {
      "districtName": "종로구",
      "name": "종로1.2.3.4가동",
      "totalStoreCount": 7912,
      "foodStoreSharePct": 29.4,
      "categoryCount": 220,
      "topCategories": "시계/귀금속 소매업:619 | 백반/한정식:575 | 여행사:441"
    },
    {
      "districtName": "서초구",
      "name": "서초3동",
      "totalStoreCount": 6845,
      "foodStoreSharePct": 15.1,
      "categoryCount": 216,
      "topCategories": "변호사:1608 | 경영 컨설팅업:494 | 법무사:393"
    },
    {
      "districtName": "영등포구",
      "name": "여의동",
      "totalStoreCount": 6422,
      "foodStoreSharePct": 31.7,
      "categoryCount": 223,
      "topCategories": "경영 컨설팅업:1170 | 백반/한정식:507 | 카페:321"
    },
    {
      "districtName": "송파구",
      "name": "문정2동",
      "totalStoreCount": 5908,
      "foodStoreSharePct": 16.1,
      "categoryCount": 216,
      "topCategories": "경영 컨설팅업:492 | 건축 설계 및 관련 서비스업:385 | 부동산 중개/대리업:302"
    },
    {
      "districtName": "강남구",
      "name": "논현2동",
      "totalStoreCount": 5267,
      "foodStoreSharePct": 20.6,
      "categoryCount": 214,
      "topCategories": "경영 컨설팅업:517 | 광고 대행업:427 | 사진촬영업:286"
    },
    {
      "districtName": "강남구",
      "name": "논현1동",
      "totalStoreCount": 5175,
      "foodStoreSharePct": 17.9,
      "categoryCount": 210,
      "topCategories": "광고 대행업:483 | 경영 컨설팅업:422 | 부동산 중개/대리업:255"
    },
    {
      "districtName": "강서구",
      "name": "가양1동",
      "totalStoreCount": 4821,
      "foodStoreSharePct": 30.4,
      "categoryCount": 219,
      "topCategories": "백반/한정식:292 | 광고 대행업:269 | 부동산 중개/대리업:259"
    },
    {
      "districtName": "강남구",
      "name": "청담동",
      "totalStoreCount": 4716,
      "foodStoreSharePct": 17.5,
      "categoryCount": 201,
      "topCategories": "경영 컨설팅업:346 | 미용실:236 | 부동산 중개/대리업:236"
    },
    {
      "districtName": "서초구",
      "name": "서초2동",
      "totalStoreCount": 4581,
      "foodStoreSharePct": 13.9,
      "categoryCount": 207,
      "topCategories": "경영 컨설팅업:636 | 광고 대행업:328 | 부동산 중개/대리업:301"
    }
  ],
  "archetypes": [
    {
      "name": "복합 점검형",
      "count": 10,
      "description": "한 축보다는 여러 축이 중간 수준으로 겹쳐 개별 매물 검토가 중요한 구간입니다.",
      "examples": [
        "성북구",
        "양천구",
        "관악구"
      ]
    },
    {
      "name": "거래 둔화형",
      "count": 6,
      "description": "매도·매수 회전이 느려져 단기 보유 전략에 불리한 구간입니다.",
      "examples": [
        "강동구",
        "동작구",
        "서대문구"
      ]
    },
    {
      "name": "고가 선행형",
      "count": 3,
      "description": "가격이 먼저 뛰어 실제 체결선보다 기대 호가가 앞서는 구간입니다.",
      "examples": [
        "서초구",
        "강남구",
        "중구"
      ]
    },
    {
      "name": "과밀 경쟁형",
      "count": 3,
      "description": "이미 유사 업종이 많아 임차인 유지력이 수익률을 좌우하는 구간입니다.",
      "examples": [
        "종로구",
        "영등포구",
        "마포구"
      ]
    },
    {
      "name": "가격 변동형",
      "count": 3,
      "description": "거래는 되더라도 가격선이 불안정해 해석 오류가 생기기 쉬운 구간입니다.",
      "examples": [
        "용산구",
        "송파구",
        "성동구"
      ]
    }
  ],
  "content": {
    "thesis": {
      "headline": "좋아 보이는 구를 추천하는 대신, 지금 사면 안 되는 근거를 먼저 보여줍니다.",
      "body": "서울 소형 상가 투자 판단은 아직도 입지 서사와 중개사 설명에 크게 의존합니다. 이 서비스는 그 반대편에서 출발합니다. 가격이 이미 선행했는지, 거래가 둔화되고 있는지, 상권이 과밀한지, 수요가 실제로 버틸 수 있는지부터 묻습니다."
    },
    "northStar": {
      "title": "잘못된 매입을 줄이는 의사결정 도구",
      "body": "이 서비스의 목표는 좋은 매물을 대신 골라주는 것이 아니라, 사지 말아야 할 순간을 더 빨리 포착하게 만드는 것입니다."
    },
    "personas": [
      {
        "title": "개인 투자자",
        "description": "3억~15억 사이 소형 상가를 검토하는 개인 투자자입니다. 현장 답사 전에 빠른 1차 반대 논리가 필요합니다."
      },
      {
        "title": "중개 실무자",
        "description": "고객에게 단순 추천 대신 반대 근거와 대체 지역을 함께 제시해야 하는 실무자입니다."
      },
      {
        "title": "분석형 PM/애널리스트",
        "description": "공공 데이터 기반 판단 엔진을 제품으로 연결하는 방식을 확인하려는 사용자입니다."
      }
    ],
    "useCases": [
      {
        "title": "현장 답사 전 1차 거르기",
        "description": "검토 중인 매물을 입력하고 3분 안에 보류·비교·추가 검토 여부를 판단합니다."
      },
      {
        "title": "중개사 제안 검증",
        "description": "중개사가 추천한 구를 리스크 유형과 최근 거래 흐름으로 다시 검증합니다."
      },
      {
        "title": "대체 후보 탐색",
        "description": "같은 예산 안에서 리스크가 한 단계 낮은 대체 구를 찾습니다."
      }
    ],
    "principles": [
      {
        "title": "Objection-first",
        "body": "장점보다 반대 근거를 먼저 보여줍니다."
      },
      {
        "title": "Explainable",
        "body": "모든 점수는 보이는 지표와 연결됩니다."
      },
      {
        "title": "Comparable",
        "body": "대체 후보가 있어야 경고가 실제 의사결정으로 이어집니다."
      },
      {
        "title": "Actionable",
        "body": "경고는 현장 검증 체크리스트로 이어져야 합니다."
      }
    ],
    "modules": [
      {
        "title": "내 매물 검토",
        "body": "검토 중인 매물을 저장하고 개인화 진단 결과를 기록합니다."
      },
      {
        "title": "3분 진단",
        "body": "보유 기간, 가격선, 우선순위를 반영한 빠른 매입 판단을 제공합니다."
      },
      {
        "title": "후보 비교",
        "body": "2~3개 구를 같은 프레임에서 비교해 대체 선택지를 보여줍니다."
      },
      {
        "title": "구 리포트",
        "body": "구별 메모, 하위 점수, 최근 12개월 추세를 한 번에 읽습니다."
      }
    ],
    "decisionStages": [
      {
        "title": "1차 필터링",
        "body": "매물 등록 후 보류·비교·추가 검토 중 무엇이 맞는지 즉시 결정합니다."
      },
      {
        "title": "현장 검증",
        "body": "리스크 유형에 맞는 체크리스트로 현장 답사 질문을 좁힙니다."
      },
      {
        "title": "대체 검토",
        "body": "같은 예산에서 더 안전한 대체 구를 병행 비교합니다."
      },
      {
        "title": "최종 메모",
        "body": "매입 여부를 문장형 메모로 남기고 다음 액션을 기록합니다."
      }
    ],
    "trustSignals": [
      {
        "title": "실거래 12,074건 기반",
        "body": "2026.03 기준 최근 12개월 서울 상업업무용 실거래를 집계했습니다."
      },
      {
        "title": "25개 구 전수 커버",
        "body": "구 단위 리스크와 대체 후보를 전부 같은 규칙으로 계산했습니다."
      },
      {
        "title": "행정동 428개·상권 1,570개",
        "body": "행정동 과밀도와 상권 수요 취약 신호를 병행 추적합니다."
      },
      {
        "title": "저표본 경고 명시",
        "body": "최근 표본이 얇은 8개 구는 신뢰도 경고를 붙였습니다."
      }
    ],
    "serviceBlueprint": [
      "유입: 구 검색이나 매물 등록에서 서비스 시작",
      "진단: 가격·유동성·과밀·변동성 기반 1차 판정 제공",
      "검증: 유형별 체크리스트와 최근 거래 추세 확인",
      "비교: 더 안전한 대체 구와 병행 검토",
      "기록: 검토 결과를 저장하고 다음 액션으로 연결"
    ],
    "roadmap": [
      "1단계: 구 리포트와 빠른 진단을 연결하는 매물 검토 흐름 구축",
      "2단계: 저장된 검토 이력과 현장 메모를 붙여 실제 워크플로우화",
      "3단계: 행정동·상권 레벨 추천과 공유용 리포트 출력 기능 추가"
    ],
    "faq": [
      {
        "question": "이 서비스가 좋은 구를 추천해주나요?",
        "answer": "아닙니다. 먼저 매입을 멈춰야 할 이유를 보여주고, 그 다음에 비교 가능한 대체 구를 제시합니다."
      },
      {
        "question": "개별 건물의 정확한 수익률을 예측하나요?",
        "answer": "아닙니다. 이 서비스는 매입 전 1차 진단과 비교 판단을 위한 도구이며, 임대차·건물 상태는 별도 검증이 필요합니다."
      },
      {
        "question": "왜 수요 데이터와 거래 데이터 시점이 다르나요?",
        "answer": "거래는 2025.04~2026.03, 상권 수요 데이터는 2024 스냅샷을 사용했습니다. 서비스와 문서에 시점 차이를 명시했습니다."
      }
    ],
    "dataSources": [
      {
        "name": "국토교통부 상업업무용 실거래가",
        "role": "최근 12개월 가격 부담, 유동성, 변동성 산출",
        "window": "2025.04~2026.03"
      },
      {
        "name": "서울시 상권분석서비스(추정매출·길단위인구)",
        "role": "상권 수요 취약성 신호와 매출 효율 분석",
        "window": "2024"
      },
      {
        "name": "소상공인시장진흥공단 상가(상권)정보",
        "role": "행정동 점포 밀도와 과밀 경쟁도 계산",
        "window": "2025.12 기준 파일"
      }
    ],
    "limitations": [
      "개별 건물의 임대차 조건, 공실 기간, 관리 상태는 포함하지 않았습니다.",
      "수요 데이터와 거래 데이터의 시점이 완전히 일치하지 않습니다.",
      "현재는 서울 구 단위를 중심으로 매입 판단을 지원합니다."
    ],
    "glossary": [
      {
        "term": "매입 리스크",
        "definition": "가격 부담, 거래 유동성, 가격 변동성, 상권 과밀을 합친 종합 경고 점수입니다."
      },
      {
        "term": "저표본 경고",
        "definition": "최근 거래 표본이 얇아 해석 안정성이 낮은 구에 부여하는 경고입니다."
      },
      {
        "term": "대체 후보",
        "definition": "같은 프레임에서 비교했을 때 리스크가 유의미하게 낮은 구입니다."
      }
    ],
    "architecture": [
      "Python 파이프라인이 실거래·상권 데이터를 가공합니다.",
      "정리된 CSV를 웹사이트 payload로 변환합니다.",
      "Python 백엔드가 JSON API와 정적 페이지를 함께 서빙합니다.",
      "프론트엔드는 매물 검토·비교·리포트 탐색을 분리된 페이지로 제공합니다."
    ]
  },
  "methodology": {
    "problemStatement": "이 서비스는 서울 소형 상가 투자 판단에서 반복되는 실패 패턴, 즉 가격 서사에 먼저 설득되고 반대 근거를 늦게 확인하는 문제를 해결하려고 합니다.",
    "pillars": [
      "가격 부담: 같은 구의 최근 체결 가격선 대비 부담이 큰가",
      "거래 유동성: 최근 거래 수가 줄며 회전이 둔화되는가",
      "가격 변동성: 일부 이상 거래가 가격선을 왜곡하는가",
      "상권 과밀: 이미 유사 업종과 점포 밀도가 높아 경쟁 압박이 큰가"
    ],
    "outputs": [
      "구 단위 종합 리스크 점수",
      "리스크 유형(고가 선행형·거래 둔화형 등)",
      "문장형 리스크 메모",
      "대체 구 추천",
      "현장 검증 체크리스트"
    ]
  }
};
