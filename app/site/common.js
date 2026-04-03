(function () {
  const STORAGE_KEY = "storefront-red-team-reviews";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getPayload() {
    return window.__RED_TEAM_PAYLOAD__ || null;
  }

  function getDistrictByCode(code) {
    const payload = getPayload();
    return payload?.districts?.find((item) => item.code === code) || null;
  }

  function latestPricePerSqm(district) {
    const history = district?.history || [];
    if (!history.length) return 0;
    return Number(history[history.length - 1].medianPricePerSqm || 0);
  }

  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveReviews(reviews) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }

  function buildBootstrap(payload) {
    return {
      site: payload.site,
      summary: payload.summary,
      archetypes: payload.archetypes,
      districts: payload.districts.map((item) => ({
        code: item.code,
        name: item.name,
        riskScore: item.riskScore,
        riskGrade: item.riskGrade,
        riskArchetype: item.riskArchetype,
        sampleReliability: item.sampleReliability,
        lowSampleFlag: item.lowSampleFlag,
      })),
      topDistricts: payload.districts.slice(0, 5),
    };
  }

  function buildComparePayload(payload, codes) {
    const selected = codes
      .map((code) => payload.districts.find((item) => item.code === code))
      .filter(Boolean);
    return { districts: selected, count: selected.length };
  }

  function buildAssessment(payload, body) {
    const district = getDistrictByCode(String(body.districtCode || "").trim());
    if (!district) {
      throw new Error("District not found");
    }

    const askingPricePerSqm = Number(body.askingPricePerSqm || 0);
    const holdingMonths = Number(body.holdingMonths || 36);
    const priority = String(body.priority || "balanced");

    const districtPrice = latestPricePerSqm(district);
    let premiumPct = 0;
    if (districtPrice > 0 && askingPricePerSqm > 0) {
      premiumPct = (askingPricePerSqm / districtPrice - 1) * 100;
    }

    let customScore = Number(district.riskScore);
    if (askingPricePerSqm > 0) {
      if (premiumPct >= 25) customScore += 9;
      else if (premiumPct >= 10) customScore += 5;
      else if (premiumPct <= -10) customScore -= 4;
    }

    if (priority === "cashflow") customScore += Number(district.priceBurdenRiskScore) * 0.08;
    else if (priority === "growth") customScore += Number(district.volatilityRiskScore) * 0.04;
    else customScore += Number(district.competitionRiskScore) * 0.03;

    if (holdingMonths <= 24) customScore += Number(district.liquidityRiskScore) * 0.08;
    else if (holdingMonths >= 60) customScore -= 2;

    customScore = Math.max(0, Math.min(100, Math.round(customScore * 10) / 10));

    let verdict = "추가 검토 가능";
    if (customScore >= 75) verdict = "매입 보류";
    else if (customScore >= 60) verdict = "강한 비교 필요";
    else if (customScore >= 45) verdict = "보수 검토";

    const summary =
      askingPricePerSqm > 0 && districtPrice > 0
        ? `입력한 가격선은 최근 ${district.name} 중위 체결선 대비 ${premiumPct >= 0 ? "+" : ""}${premiumPct.toFixed(1)}%입니다.`
        : "가격선을 입력하지 않아 현재 구 리스크를 기준으로 판단했습니다.";

    const reasons = [...(district.objections || [])];
    if (premiumPct >= 25) reasons.unshift("입력한 매입가가 최근 구 평균 체결선보다 크게 높습니다.");
    else if (premiumPct <= -10) reasons.unshift("가격선은 낮지만 다른 리스크 축은 그대로 남아 있습니다.");
    reasons.unshift(district.decisionQuestion || "이 구를 지금 사도 되는지 먼저 다시 물어봐야 합니다.");

    const checks = [...(district.reviewChecklist || [])];
    if (holdingMonths <= 24) checks.unshift("보유 기간이 짧다면 최근 거래 회전 속도를 더 엄격하게 보세요.");
    if (district.lowSampleFlag) checks.unshift("최근 거래 표본이 적어 인근 대체 구와 병행 비교가 필요합니다.");

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

  function buildReviewRecord(payload, body) {
    if (!body.assetName || !body.districtCode) {
      throw new Error("assetName and districtCode are required");
    }
    const totalPrice = Number(body.askingPriceTotal10k || 0);
    const area = Number(body.exclusiveAreaSqm || 0);
    let askingPricePerSqm = Number(body.askingPricePerSqm || 0);
    if (askingPricePerSqm <= 0 && totalPrice > 0 && area > 0) {
      askingPricePerSqm = totalPrice / area;
    }

    const assessment = buildAssessment(payload, {
      districtCode: body.districtCode,
      askingPricePerSqm,
      holdingMonths: Number(body.holdingMonths || 36),
      priority: String(body.priority || "balanced"),
    });

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

  async function localApi(url, options = {}) {
    const payload = getPayload();
    if (!payload) throw new Error("Static payload was not loaded.");

    const parsed = new URL(url, window.location.origin);
    const path = parsed.pathname;
    const method = String(options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};

    if (method === "GET") {
      if (path === "/api/bootstrap") return buildBootstrap(payload);
      if (path === "/api/summary") return clone(payload.summary);
      if (path === "/api/case-studies") return clone(payload.caseStudies);
      if (path === "/api/demand-fragility") return clone(payload.demandFragility);
      if (path === "/api/admin-dongs") return clone(payload.adminDongSaturation);
      if (path === "/api/methodology") return clone(payload.methodology);
      if (path === "/api/content") return clone(payload.content);
      if (path === "/api/site") return clone(payload.site);
      if (path === "/api/archetypes") return clone(payload.archetypes);
      if (path === "/api/reviews") return loadReviews();
      if (path === "/api/districts") return clone(payload.districts);
      if (path.startsWith("/api/districts/")) {
        const code = path.split("/").pop();
        const district = getDistrictByCode(code);
        if (!district) throw new Error("District not found");
        return clone(district);
      }
      if (path === "/api/compare") {
        const codes = (parsed.searchParams.get("codes") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        return buildComparePayload(payload, codes);
      }
    }

    if (method === "POST") {
      if (path === "/api/assessment") return buildAssessment(payload, body);
      if (path === "/api/reviews") {
        const review = buildReviewRecord(payload, body);
        const reviews = loadReviews();
        reviews.unshift(review);
        saveReviews(reviews.slice(0, 24));
        return review;
      }
    }

    throw new Error(`Unsupported static endpoint: ${method} ${path}`);
  }

  window.SiteApi = {
    async fetchJson(url, options = {}) {
      if (getPayload() && url.startsWith("/api/")) {
        return localApi(url, options);
      }
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${url} (${response.status})`);
      }
      return response.json();
    },
    formatNumber(value, suffix = "") {
      return `${Number(value || 0).toLocaleString("ko-KR")}${suffix}`;
    },
    formatPercent(value) {
      return `${Number(value || 0).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%`;
    },
    formatDateTime(value) {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString("ko-KR", { hour12: false });
    },
    setActiveNav() {
      const page = document.body.dataset.page;
      document.querySelectorAll(".site-nav a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        const name = href.replace("./", "").replace(".html", "") || "index";
        const normalized = name === "index" ? "home" : name;
        link.classList.toggle("is-active", normalized === page);
      });
    },
    ensureReviewNav() {
      const nav = document.querySelector(".site-nav");
      if (!nav || nav.querySelector('a[href="./review.html"]')) return;
      const anchor = document.createElement("a");
      anchor.href = "./review.html";
      anchor.textContent = "내 매물 검토";
      const assessmentLink = nav.querySelector('a[href="./assessment.html"]');
      if (assessmentLink) nav.insertBefore(anchor, assessmentLink);
      else nav.appendChild(anchor);
    },
    drawLineChart(targetId, points, valueKey, color) {
      const svg = document.getElementById(targetId);
      if (!svg || !points.length) {
        if (svg) svg.innerHTML = "";
        return;
      }
      const width = 420;
      const height = 180;
      const paddingX = 28;
      const paddingY = 24;
      const values = points.map((item) => Number(item[valueKey]));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      const stepX = points.length === 1 ? 0 : (width - paddingX * 2) / (points.length - 1);
      const coords = points.map((item, index) => ({
        x: paddingX + stepX * index,
        y: height - paddingY - ((Number(item[valueKey]) - min) / range) * (height - paddingY * 2),
        label: item.month,
      }));
      const pathData = coords
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
        .join(" ");
      const areaData = `${pathData} L ${coords[coords.length - 1].x.toFixed(1)} ${height - paddingY} L ${coords[0].x.toFixed(1)} ${height - paddingY} Z`;
      const xLabels = coords
        .map((point, index) => {
          const visible = index === 0 || index === coords.length - 1 || index === Math.floor(coords.length / 2);
          return visible
            ? `<text x="${point.x}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#7b685e">${point.label}</text>`
            : "";
        })
        .join("");
      const dots = coords
        .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${color}"></circle>`)
        .join("");

      svg.innerHTML = `
        <defs>
          <linearGradient id="${targetId}-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.28"></stop>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.03"></stop>
          </linearGradient>
        </defs>
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(43,26,18,0.12)" />
        <path d="${areaData}" fill="url(#${targetId}-fill)"></path>
        <path d="${pathData}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
        ${dots}
        ${xLabels}
      `;
    },
    renderError(error) {
      document.body.innerHTML = `
        <main style="padding:40px;font-family:'IBM Plex Sans KR',sans-serif">
          <h1>사이트를 불러오지 못했습니다.</h1>
          <p>정적 payload 파일 또는 로컬 서버가 정상적으로 로드됐는지 확인해 주세요.</p>
          <pre>${error.message}</pre>
        </main>
      `;
    },
  };

  window.SiteApi.ensureReviewNav();
  window.SiteApi.setActiveNav();
})();
