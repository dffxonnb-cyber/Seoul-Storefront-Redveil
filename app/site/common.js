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
      askingPricePerSqm,
      districtMedianPricePerSqm: districtPrice,
      premiumPct: Math.round(premiumPct * 10) / 10,
      priority,
      holdingMonths,
      summary,
      riskArchetype: district.riskArchetype,
      archetypeSummary: district.archetypeSummary,
      recommendedAction: district.recommendedAction,
      reasons: reasons.slice(0, 4),
      checks: checks.slice(0, 4),
      replacementCandidates: (district.replacementCandidates || []).slice(0, 3),
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
    const area = `${path} L ${coords[coords.length - 1].x.toFixed(1)} ${height - paddingY} L ${coords[0].x.toFixed(1)} ${height - paddingY} Z`;
    const labels = coords
      .map((point, index) => {
        const visible = index === 0 || index === coords.length - 1 || index === Math.floor(coords.length / 2);
        return visible
          ? `<text x="${point.x}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#8ea0b2">${point.label}</text>`
          : "";
      })
      .join("");
    const dots = coords.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${color}"></circle>`).join("");

    svg.innerHTML = `
      <defs>
        <linearGradient id="${targetId}-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"></stop>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.04"></stop>
        </linearGradient>
      </defs>
      <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(255,255,255,0.10)" />
      <path d="${area}" fill="url(#${targetId}-fill)"></path>
      <path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
      ${dots}
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
      link.classList.toggle("is-active", page === target);
    });
  }

  window.RedveilV2 = {
    payload,
    formatNumber,
    formatDateTime,
    riskTone,
    loadReviews,
    buildAssessment,
    createReviewRecord,
    persistReview,
    drawLineChart,
    setActiveNav,
  };

  setActiveNav();
})();
