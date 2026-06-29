(function () {
  const payload = window.__REDVEIL_PAYLOAD__;
  const STORAGE_KEY = "redveil-reviews";

  function formatNumber(value, suffix = "", maximumFractionDigits = 1) {
    return `${Number(value || 0).toLocaleString("ko-KR", { maximumFractionDigits })}${suffix}`;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("ko-KR", { hour12: false });
  }

  function latestPricePerSqm(district) {
    const history = district?.history || [];
    if (!history.length) return 0;
    return Number(history[history.length - 1]?.medianPricePerSqm || 0);
  }

  function riskTone(score) {
    if (score >= 70) return "tone-high";
    if (score >= 50) return "tone-mid";
    return "tone-low";
  }

  function polishCopy(value) {
    const noCandidateUnsafe = new RegExp("대체 후보 없음" + "를 먼저 비교하는 것이 안전" + "합니다\\.", "g");
    const candidateUnsafe = new RegExp(
      "지금 바로 매입 결정을 내리기보다 ([^.]+?)" + "를 먼저 비교하는 것이 안전" + "합니다\\.",
      "g"
    );
    return String(value || "")
      .replace(/\s+(부터|를|을|은|는|이|가|에|에서|로|으로)(?=[\s.,!?]|$)/g, "$1")
      .replace(/(큽니다)입니다/g, "$1")
      .replace(/([가-힣]+(?:합니다|습니다|됩니다|입니다))입니다/g, "$1")
      .replace(noCandidateUnsafe, "현재 조건에서는 별도 대체 후보가 없어 현장 확인을 우선하세요.")
      .replace(candidateUnsafe, "바로 매입을 결정하기보다 $1 등 대체 후보를 먼저 비교하세요.")
      .replace(new RegExp("것이 안전" + "합니다", "g"), "것이 보수적입니다");
  }

  function recentTransactionSample(district) {
    return (district?.history || []).reduce((total, item) => total + Number(item.transactionCount || 0), 0);
  }

  function reliabilityInfo(district) {
    const sampleCount = recentTransactionSample(district);
    const isLowSample = Boolean(district?.lowSampleFlag) || (sampleCount > 0 && sampleCount < 36);
    const level = isLowSample ? "저표본 주의" : sampleCount >= 120 ? "높음" : "보통";

    return {
      level,
      sampleCount,
      isLowSample,
      label: isLowSample ? "저표본 주의" : `데이터 신뢰도 ${level}`,
      sampleLabel: sampleCount > 0 ? `기반 표본 ${formatNumber(sampleCount, "건", 0)}` : "기반 표본 확인 필요",
      windowLabel: "최근 12개월 거래 표본",
      note: isLowSample
        ? "표본이 적은 구는 신뢰도 경고를 함께 표시합니다."
        : "최근 12개월 거래 표본 기준으로 해석합니다.",
    };
  }

  function benchmarkInfo(score, district) {
    const numericScore = Number(score || district?.riskScore || 0);
    let label = "서울 25개 구 기준 관찰 구간";
    if (numericScore >= 70) label = "서울 25개 구 기준 고위험 구간";
    else if (numericScore >= 60) label = "동일 구 평균 대비 주의 구간";

    let detail = "기준선보다 높은 리스크 신호";
    if (Number(district?.priceBurdenRiskScore || 0) >= 70) {
      detail = "서울 평균 대비 높은 가격 부담";
    } else if (Number(district?.liquidityRiskScore || 0) >= 60 || Number(district?.transactionRiskScore || 0) >= 60) {
      detail = "거래 유동성은 서울 평균보다 약함";
    } else if (numericScore < 60) {
      detail = "개별 매물 조건과 동일 구 평균을 함께 확인";
    }

    return { label, detail };
  }

  function riskOverlapInfo(district) {
    const categories = [
      {
        label: "가격 부담",
        score: Number(district?.priceBurdenRiskScore || 0),
        active: Number(district?.priceBurdenRiskScore || 0) >= 60,
      },
      {
        label: "거래 둔화",
        score: Math.max(Number(district?.transactionRiskScore || 0), Number(district?.liquidityRiskScore || 0)),
        active: Number(district?.transactionRiskScore || 0) >= 60 || Number(district?.liquidityRiskScore || 0) >= 60,
      },
      {
        label: "상권 과밀",
        score: Number(district?.competitionRiskScore || 0),
        active: Number(district?.competitionRiskScore || 0) >= 60,
      },
      {
        label: "수요 취약",
        score: Number(district?.liquidityRiskScore || 0),
        active: Number(district?.liquidityRiskScore || 0) >= 70 && Number(district?.transactionRiskScore || 0) >= 60,
      },
    ];
    const activeLabels = categories.filter((item) => item.active).map((item) => item.label);

    let sentence = "뚜렷한 중첩 신호는 낮지만, 동일 구 평균과 개별 매물 조건을 함께 확인하세요.";
    if (activeLabels.includes("가격 부담") && activeLabels.includes("거래 둔화")) {
      sentence = "가격 부담과 거래 둔화 신호가 함께 나타나는 중첩 리스크 구간입니다.";
    } else if (activeLabels.includes("가격 부담") && activeLabels.includes("상권 과밀")) {
      sentence = "가격 부담에 상권 과밀 신호가 겹쳐 임차 수요와 퇴거 조건을 함께 확인해야 합니다.";
    } else if (activeLabels.includes("거래 둔화") && activeLabels.includes("수요 취약")) {
      sentence = "거래 흐름이 얇고 수요 취약 신호가 겹쳐 진입보다 보류 검토가 우선입니다.";
    } else if (activeLabels.length >= 2) {
      sentence = `${activeLabels.slice(0, 2).join(" · ")} 신호가 함께 나타나 추가 확인이 필요한 구간입니다.`;
    } else if (activeLabels.length === 1) {
      sentence = `${activeLabels[0]} 신호가 기준선보다 높아 추가 확인이 필요합니다.`;
    }

    return { categories, activeLabels, sentence };
  }

  function alternativeRationale(district, result) {
    const overlap = riskOverlapInfo(district);
    const riskText = overlap.activeLabels.length ? overlap.activeLabels.slice(0, 2).join(" · ") : "핵심 리스크";
    const firstCandidate = (result?.replacementCandidates || district?.replacementCandidates || [])[0];
    const districtName = result?.districtName || district?.name || "해당 구";

    return {
      holdReason: `${districtName}은 ${riskText} 신호가 기준선보다 높아 보류 검토가 필요합니다.`,
      offsetBasis: "대체 후보는 같은 기준에서 가격 부담, 거래 유동성, 상권 과밀 신호를 다시 비교하는 기준점입니다.",
      candidateReason: firstCandidate
        ? `${firstCandidate.name}은 추가 검토 후보로, ${polishCopy(
            firstCandidate.whyBetter || "가격 부담과 거래 둔화 신호를 일부 상쇄할 수 있는지 확인합니다."
          )}`
        : "추가 검토 후보는 가격 부담, 거래 둔화, 상권 과밀 신호를 상쇄할 수 있는지를 기준으로 좁힙니다.",
    };
  }

﻿function riskLevelFor(score) {
const numericScore = Number(score || 0);
if (numericScore >= 75) return "high";
if (numericScore >= 60) return "medium";
if (numericScore >= 45) return "watch";
return "low";
}

function riskLevelLabel(level) {
const labels = {
high: "매입 보류",
medium: "강한 비교 필요",
watch: "보수 검토",
low: "추가 검토 가능",
};
return labels[level] || labels.low;
}

function buildRiskExplanation(district, result = {}) {
const score = Number(result.customRiskScore || district?.riskScore || 0);
const level = riskLevelFor(score);
const overlap = riskOverlapInfo(district);
const candidates = result.replacementCandidates || district?.replacementCandidates || [];

```
const mainReasons = [
  district?.decisionQuestion,
  ...(result.reasons || []),
  overlap.sentence,
]
  .filter(Boolean)
  .map(polishCopy)
  .slice(0, 4);

const verifiedSignals = [
  "실거래 기반 가격 부담",
  "최근 12개월 거래 표본",
  "구 단위 리스크 점수",
  ...(overlap.activeLabels || []).map((label) => String(label) + " 신호"),
]
  .filter(Boolean)
  .slice(0, 5);

const designingSignals = [
  "행정동 단위 세부 상권 보정",
  "업종별 생존율 추정",
  "시간대별 유동인구 보정",
  "개별 임대 조건 반영",
];

const alternatives = candidates.slice(0, 3).map((candidate) => ({
  name: candidate.name,
  reason: polishCopy(candidate.whyBetter || "가격 부담과 거래 흐름을 다시 비교할 후보입니다."),
}));

return {
  riskLevel: level,
  riskLevelLabel: riskLevelLabel(level),
  riskScore: Math.round(score * 10) / 10,
  mainReasons,
  verifiedSignals,
  designingSignals,
  alternatives,
  summary: polishCopy(
    result.summary ||
      district?.archetypeSummary ||
      "현재 구 리스크와 개별 매물 조건을 함께 확인해야 합니다."
  ),
  claimBoundary: [
    "서울 구 단위 공공·실거래 기반 리스크 해석입니다.",
    "개별 점포의 실제 매출, 임대 조건, 권리금, 현장 유동인구를 보장하지 않습니다.",
    "추천보다 보류 사유와 비교 기준을 먼저 제시합니다.",
  ],
};
```

}


  function renderReliabilityBadges(district, options = {}) {
    const info = reliabilityInfo(district);
    const className = options.className ? ` ${options.className}` : "";
    return `
      <div class="interpretation-strip${className}">
        <span class="interpretation-badge ${info.isLowSample ? "is-caution" : ""}">${info.label}</span>
        <span class="interpretation-badge">${info.windowLabel}</span>
        <span class="interpretation-badge">${info.sampleLabel}</span>
      </div>
      ${options.includeNote ? `<p class="interpretation-note">${info.note}</p>` : ""}
    `;
  }

  function renderBenchmarkLine(score, district) {
    const benchmark = benchmarkInfo(score, district);
    return `
      <div class="benchmark-line">
        <strong>${benchmark.label}</strong>
        <span>${benchmark.detail}</span>
      </div>
    `;
  }

  function renderRiskOverlap(district, options = {}) {
    const overlap = riskOverlapInfo(district);
    const compactClass = options.compact ? " risk-overlap-compact" : "";
    return `
      <section class="risk-overlap-block${compactClass}">
        <span class="result-label">리스크 중첩 해석</span>
        <div class="risk-chip-list">
          ${overlap.categories
            .map((item) => `<span class="risk-chip ${item.active ? "is-active" : ""}">${item.label}</span>`)
            .join("")}
        </div>
        <p>${overlap.sentence}</p>
      </section>
    `;
  }

  function renderAlternativeRationale(district, result, options = {}) {
    const rationale = alternativeRationale(district, result);
    const compactClass = options.compact ? " alternative-rationale-compact" : "";
    return `
      <section class="alternative-rationale${compactClass}">
        <span class="result-label">대체 후보 선정 이유</span>
        <div class="rationale-grid">
          <article>
            <strong>보류 사유</strong>
            <p>${rationale.holdReason}</p>
          </article>
          <article>
            <strong>상쇄 기준</strong>
            <p>${rationale.offsetBasis}</p>
          </article>
          <article>
            <strong>대체 후보 선정 이유</strong>
            <p>${rationale.candidateReason}</p>
          </article>
        </div>
      </section>
    `;
  }

  function loadReviews() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveReviews(reviews) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }

  function buildAssessment(body) {
    const districts = payload?.districts || [];
    const district = districts.find((item) => item.code === String(body.districtCode || "").trim());
    if (!district) return null;

    const askingPricePerSqm = Number(body.askingPricePerSqm || 0);
    const holdingMonths = Number(body.holdingMonths || 36);
    const priority = String(body.priority || "balanced");
    const districtPrice = latestPricePerSqm(district);

    let premiumPct = 0;
    if (districtPrice > 0 && askingPricePerSqm > 0) {
      premiumPct = (askingPricePerSqm / districtPrice - 1) * 100;
    }

    let customScore = Number(district.riskScore || 0);
    if (askingPricePerSqm > 0) {
      if (premiumPct >= 25) customScore += 9;
      else if (premiumPct >= 10) customScore += 5;
      else if (premiumPct <= -10) customScore -= 4;
    }

    if (priority === "cashflow") customScore += Number(district.priceBurdenRiskScore || 0) * 0.08;
    else if (priority === "growth") customScore += Number(district.volatilityRiskScore || 0) * 0.04;
    else customScore += Number(district.competitionRiskScore || 0) * 0.03;

    if (holdingMonths <= 24) customScore += Number(district.liquidityRiskScore || 0) * 0.08;
    else if (holdingMonths >= 60) customScore -= 2;

    customScore = Math.max(0, Math.min(100, Math.round(customScore * 10) / 10));

    let verdict = "추가 검토 가능";
    if (customScore >= 75) verdict = "매입 보류";
    else if (customScore >= 60) verdict = "강한 비교 필요";
    else if (customScore >= 45) verdict = "보수 검토";

    const summary =
      askingPricePerSqm > 0 && districtPrice > 0
        ? `입력 가격선은 최근 ${district.name} 체결선 대비 ${premiumPct >= 0 ? "+" : ""}${premiumPct.toFixed(1)}%입니다.`
        : "가격선을 넣지 않아 현재 구 리스크를 기준으로 판단했습니다.";

    const reasons = [...(district.objections || [])];
    if (premiumPct >= 25) reasons.unshift("입력한 매입가가 최근 체결선보다 크게 앞서 있습니다.");
    else if (premiumPct <= -10) reasons.unshift("가격선은 낮지만 구 전체 리스크 축은 그대로 남아 있습니다.");
    reasons.unshift(district.decisionQuestion || "지금 사도 되는지 먼저 다시 물어봐야 합니다.");

    const checks = [...(district.reviewChecklist || [])];
    if (holdingMonths <= 24) checks.unshift("보유 기간이 짧다면 최근 거래 회전 속도를 더 엄격하게 보세요.");
    if (district.lowSampleFlag) checks.unshift("최근 거래 표본이 얇아 인근 대체 구와 병행 비교가 필요합니다.");

    return {
      districtName: district.name,
      districtCode: district.code,
      verdict,
      customRiskScore: customScore,
      riskExplanation: buildRiskExplanation(district, {
        customRiskScore: customScore,
        summary,
        reasons,
        replacementCandidates: district.replacementCandidates || [],
      }),
      askingPricePerSqm,
      districtMedianPricePerSqm: districtPrice,
      premiumPct: Math.round(premiumPct * 10) / 10,
      priority,
      holdingMonths,
      summary: polishCopy(summary),
      riskArchetype: district.riskArchetype,
      archetypeSummary: polishCopy(district.archetypeSummary),
      recommendedAction: polishCopy(district.recommendedAction),
      reasons: reasons.slice(0, 4).map(polishCopy),
      checks: checks.slice(0, 4).map(polishCopy),
      replacementCandidates: (district.replacementCandidates || [])
        .slice(0, 3)
        .map((item) => ({ ...item, whyBetter: polishCopy(item.whyBetter) })),
      baseDistrict: district,
    };
  }

  function createReviewRecord(body) {
    if (!body.assetName || !body.districtCode) return null;
    const totalPrice = Number(body.askingPriceTotal10k || 0);
    const area = Number(body.exclusiveAreaSqm || 0);
    let askingPricePerSqm = Number(body.askingPricePerSqm || 0);
    if (askingPricePerSqm <= 0 && totalPrice > 0 && area > 0) {
      askingPricePerSqm = totalPrice / area;
    }

    const assessment = buildAssessment({
      districtCode: body.districtCode,
      askingPricePerSqm,
      holdingMonths: Number(body.holdingMonths || 36),
      priority: String(body.priority || "balanced"),
    });
    if (!assessment) return null;

    return {
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
      assetName: String(body.assetName || "").trim(),
      districtCode: assessment.districtCode,
      districtName: assessment.districtName,
      adminDongName: String(body.adminDongName || "").trim(),
      askingPriceTotal10k: totalPrice ? Math.round(totalPrice * 10) / 10 : 0,
      exclusiveAreaSqm: area ? Math.round(area * 10) / 10 : 0,
      askingPricePerSqm: askingPricePerSqm ? Math.round(askingPricePerSqm * 10) / 10 : 0,
      holdingMonths: assessment.holdingMonths,
      priority: assessment.priority,
      targetTenant: String(body.targetTenant || "").trim(),
      memo: String(body.memo || "").trim(),
      verdict: assessment.verdict,
      customRiskScore: assessment.customRiskScore,
      riskExplanation: assessment.riskExplanation,
      premiumPct: assessment.premiumPct,
      riskArchetype: assessment.riskArchetype,
      recommendedAction: assessment.recommendedAction,
      summary: assessment.summary,
      reasons: assessment.reasons,
      checks: assessment.checks,
      replacementCandidates: assessment.replacementCandidates,
    };
  }

  function persistReview(record) {
    const reviews = loadReviews();
    reviews.unshift(record);
    saveReviews(reviews.slice(0, 24));
    return record;
  }

    function drawLineChart(targetId, points, key, color) {
    const svg = document.getElementById(targetId);
    if (!svg || !points?.length) return;

    const width = 420;
    const height = 180;
    const paddingX = 28;
    const paddingY = 22;
    const values = points.map((item) => Number(item[key] || 0));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = points.length === 1 ? 0 : (width - paddingX * 2) / (points.length - 1);

    const coords = points.map((item, index) => ({
      x: paddingX + stepX * index,
      y: height - paddingY - ((Number(item[key] || 0) - min) / range) * (height - paddingY * 2),
      label: item.month,
    }));

    const path = coords
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(" ");

    const labels = coords
      .map((point, index) => {
        const visible = index === 0 || index === coords.length - 1 || index === Math.floor(coords.length / 2);
        return visible
          ? `<text class="chart-axis-label" x="${point.x}" y="${height - 8}" text-anchor="middle">${point.label}</text>`
          : "";
      })
      .join("");

    const gridLines = [0.25, 0.5, 0.75]
      .map((ratio) => {
        const y = paddingY + (height - paddingY * 2) * ratio;
        return `<line x1="${paddingX}" y1="${y.toFixed(1)}" x2="${width - paddingX}" y2="${y.toFixed(1)}" class="chart-grid-line"></line>`;
      })
      .join("");

    const lastPoint = coords[coords.length - 1];
    const lastDot = `<circle class="chart-last-dot" cx="${lastPoint.x}" cy="${lastPoint.y}" r="4.2" fill="${color}"></circle>`;

    svg.innerHTML = `
      ${gridLines}
      <line class="chart-axis-line" x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" />
      <path class="chart-line-path" d="${path}" fill="none" stroke="${color}"></path>
      ${lastDot}
      ${labels}
    `;
  }

  function setActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll(".topnav a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const normalized = href.replace("./", "").replace(".html", "") || "index";
      const target = normalized === "index" ? "home" : normalized;
      const isActive = page === target;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.RedveilV2 = {
    payload,
    formatNumber,
    formatDateTime,
    riskTone,
    riskLevelFor,
    riskLevelLabel,
    buildRiskExplanation,
    polishCopy,
    reliabilityInfo,
    benchmarkInfo,
    riskOverlapInfo,
    alternativeRationale,
    renderReliabilityBadges,
    renderBenchmarkLine,
    renderRiskOverlap,
    renderAlternativeRationale,
    loadReviews,
    buildAssessment,
    createReviewRecord,
    persistReview,
    drawLineChart,
    setActiveNav,
  };

  setActiveNav();
})();
