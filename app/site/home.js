(function () {
  const payload = window.__REDVEIL_PAYLOAD__ || {};
  const { polishCopy } = window.RedveilV2 || {};
  const districts = [...(payload.districts || [])]
    .filter((district) => district && district.code)
    .sort((left, right) => Number(right.riskScore || 0) - Number(left.riskScore || 0));

  const DISTRICT_NAMES = {
    "11110": "종로구",
    "11140": "중구",
    "11170": "용산구",
    "11200": "성동구",
    "11215": "광진구",
    "11230": "동대문구",
    "11260": "중랑구",
    "11290": "성북구",
    "11305": "강북구",
    "11320": "도봉구",
    "11350": "노원구",
    "11380": "은평구",
    "11410": "서대문구",
    "11440": "마포구",
    "11470": "양천구",
    "11500": "강서구",
    "11530": "구로구",
    "11545": "금천구",
    "11560": "영등포구",
    "11590": "동작구",
    "11620": "관악구",
    "11650": "서초구",
    "11680": "강남구",
    "11710": "송파구",
    "11740": "강동구",
  };

  const fallbackDistrict = {
    code: "11650",
    name: "서초구",
    riskScore: 0,
    riskGrade: "데이터 확인 필요",
    priceBurdenRiskScore: 0,
    liquidityRiskScore: 0,
    competitionRiskScore: 0,
    volatilityRiskScore: 0,
    transactionRiskScore: 0,
    riskSummary: "리스크 payload를 불러온 뒤 해석을 확인할 수 있습니다.",
    replacementCandidates: [],
  };

  const target = districts[0] || fallbackDistrict;

  function $(id) {
    return document.getElementById(id);
  }

  function formatNumber(value, suffix = "", digits = 0) {
    const numeric = Number(value || 0);
    return `${numeric.toLocaleString("ko-KR", { maximumFractionDigits: digits })}${suffix}`;
  }

  function cleanCopy(value) {
    const source = typeof polishCopy === "function" ? polishCopy(value) : String(value || "");
    return source
      .replace(/더 안전한 대체 구/g, "리스크를 낮춰 볼 대체 구")
      .replace(/더 안전한 구/g, "리스크를 낮춰 볼 구")
      .replace(/대체 구 추천/g, "대체 구 비교")
      .replace(/좋은 구를 추천/g, "좋은 구를 고르는");
  }

  function districtName(district) {
    return district?.name || DISTRICT_NAMES[String(district?.code || "")] || "선택한 서울 자치구";
  }

  function riskLevel(score, grade) {
    if (grade) return grade;
    const numeric = Number(score || 0);
    if (numeric >= 70) return "고위험 보류";
    if (numeric >= 50) return "검토 필요";
    return "관찰";
  }

  function factorItems(district) {
    return [
      {
        label: "가격 부담",
        score: Number(district.priceBurdenRiskScore || 0),
        note: "인근 거래선과 비교해 매입 가격이 앞서 있는지 확인합니다.",
      },
      {
        label: "거래 유동성",
        score: Number(district.liquidityRiskScore || district.transactionRiskScore || 0),
        note: "거래 흐름이 얇거나 둔화해 회수 판단이 어려운지 살핍니다.",
      },
      {
        label: "상권 과밀",
        score: Number(district.competitionRiskScore || 0),
        note: "상업 공급과 업종 경쟁 압력이 과도한지 점검합니다.",
      },
      {
        label: "가격 변동성",
        score: Number(district.volatilityRiskScore || 0),
        note: "최근 체결 가격이 불안정해 재확인이 필요한지 보여줍니다.",
      },
    ].sort((left, right) => right.score - left.score);
  }

  function renderHero() {
    if ($("hero-score")) $("hero-score").textContent = formatNumber(target.riskScore, "", 1);
    if ($("hero-district")) $("hero-district").textContent = districtName(target);
    if ($("hero-risk-level")) $("hero-risk-level").textContent = `${riskLevel(target.riskScore, target.riskGrade)} · 스크리닝 신호`;
    if ($("hero-summary")) {
      $("hero-summary").textContent =
        cleanCopy(target.riskSummary || `${districtName(target)}의 가격, 거래 흐름, 과밀도, 변동성을 매입 전 다시 확인하세요.`);
    }
    if ($("hero-signals")) {
      $("hero-signals").innerHTML = factorItems(target)
        .slice(0, 3)
        .map(
          (item) => `
            <article>
              <span>${item.label}</span>
              <strong>${formatNumber(item.score, "", 1)}</strong>
              <p>${item.note}</p>
            </article>
          `
        )
        .join("");
    }
  }

  function renderWorkflow() {
    const steps = [
      ["01", "후보 확인", "관심 구와 매물 맥락을 정하고 검토를 시작합니다.", "./districts.html", "구별 신호 보기"],
      ["02", "리스크 진단", "가격선과 보유 기간을 입력해 빠르게 걸러냅니다.", "./assessment.html", "3분 진단하기"],
      ["03", "보류 사유 확인", "핵심 반대 근거와 추가 확인 항목을 읽습니다.", "./review.html", "매물 검토하기"],
      ["04", "대체 후보 비교", "같은 기준으로 더 낮은 리스크 후보를 붙여 봅니다.", "./compare.html", "후보 비교하기"],
      ["05", "검토 메모 남기기", "결론과 다음 확인 질문을 기록합니다.", "./review.html", "검토 메모 만들기"],
    ];

    if ($("entry-grid")) {
      $("entry-grid").innerHTML = steps
        .map(
          ([index, title, body, href, action]) => `
            <a class="redveil-workflow-card" href="${href}">
              <span>${index}</span>
              <strong>${title}</strong>
              <p>${body}</p>
              <em>${action} →</em>
            </a>
          `
        )
        .join("");
    }
  }

  function renderOverview() {
    const summary = payload.summary || {};
    const items = [
      ["실거래 데이터", formatNumber(summary.transactionCount || 12074), "공개 검토용 최근 거래 표본"],
      ["서울 자치구", formatNumber(summary.districtCount || 25), "같은 규칙으로 비교하는 범위"],
      ["상권 신호", formatNumber(summary.tradeAreaCount || 1520), "상권 과밀·수요 판단 기반"],
      ["판단 모드", "보류", "매입 전 추가 검토 우선"],
    ];

    if ($("risk-overview")) {
      $("risk-overview").innerHTML = items
        .map(
          ([label, value, note]) => `
            <article>
              <span>${label}</span>
              <strong>${value}</strong>
              <p>${note}</p>
            </article>
          `
        )
        .join("");
    }
  }

  function renderPauseReasons() {
    const sourceReasons = Array.isArray(target.objections) && target.objections.length
      ? target.objections
      : factorItems(target).slice(0, 4).map((item) => `${item.label} ${formatNumber(item.score, "점", 1)}: ${item.note}`);

    if ($("pause-reason-list")) {
      $("pause-reason-list").innerHTML = sourceReasons.map((reason) => `<li>${cleanCopy(reason)}</li>`).join("");
    }
  }

  function renderDistricts() {
    if (!$("district-signal-grid")) return;

    $("district-signal-grid").innerHTML = (districts.length ? districts : [fallbackDistrict])
      .slice(0, 4)
      .map(
        (district) => `
          <a href="./districts.html">
            <span>${riskLevel(district.riskScore, district.riskGrade)}</span>
            <strong>${districtName(district)}</strong>
            <p>리스크 점수 ${formatNumber(district.riskScore, "/100", 1)}</p>
          </a>
        `
      )
      .join("");
  }

  function renderAlternatives() {
    const payloadAlternatives = [...districts]
      .filter((district) => district.code !== target.code)
      .sort((left, right) => Number(left.riskScore || 0) - Number(right.riskScore || 0))
      .slice(0, 3)
      .map((district, index) => ({
        rank: index + 1,
        name: districtName(district),
        score: district.riskScore,
        whyBetter: "현재 후보와 같은 기준으로 세부 리스크 신호를 비교하세요.",
      }));
    const alternatives = Array.isArray(target.replacementCandidates) && target.replacementCandidates.length
      ? target.replacementCandidates.slice(0, 3)
      : payloadAlternatives.length
        ? payloadAlternatives
        : [{ rank: 1, name: "대체 후보 데이터 확인 필요", whyBetter: "구별 리포트에서 비교 가능한 데이터를 먼저 확인하세요." }];

    if ($("alternative-list")) {
      $("alternative-list").innerHTML = alternatives
        .map(
          (candidate, index) => `
            <a href="./compare.html">
              <span>0${candidate.rank || index + 1}</span>
              <div>
                <strong>${candidate.name}</strong>
                <p>${cleanCopy(candidate.whyBetter || "현재 후보와 같은 기준으로 리스크를 비교하세요.")}</p>
              </div>
              ${candidate.score !== undefined ? `<em>${formatNumber(candidate.score, "점", 1)}</em>` : ""}
            </a>
          `
        )
        .join("");
    }
  }

  function renderFactors() {
    if (!$("factor-list")) return;

    $("factor-list").innerHTML = factorItems(target)
      .map(
        (item) => `
          <article>
            <div>
              <strong>${item.label}</strong>
              <span>${formatNumber(item.score, "/100", 1)}</span>
            </div>
            <div class="redveil-factor-bar" aria-hidden="true">
              <i style="width:${Math.max(6, Math.min(100, item.score))}%"></i>
            </div>
            <p>${item.note}</p>
          </article>
        `
      )
      .join("");
  }

  function renderMemo() {
    const memoPoints = Array.isArray(target.reviewChecklist) && target.reviewChecklist.length
      ? target.reviewChecklist.slice(0, 4)
      : [
          "인지도가 높은 자치구를 자동으로 더 낮은 리스크라고 판단하지 마세요.",
          "호가를 수용하기 전 최근 유사 실거래를 다시 확인하세요.",
          "같은 기준으로 최소 두 개 대체 자치구를 비교하세요.",
          "실제 매입 결정 전 전문가 검토와 현장 확인을 진행하세요.",
        ];

    if ($("decision-mode") && target.recommendedAction) $("decision-mode").textContent = cleanCopy(target.recommendedAction);
    if ($("memo-points")) {
      $("memo-points").innerHTML = memoPoints.map((point) => `<li>${cleanCopy(point)}</li>`).join("");
    }
  }

  function renderCases() {
    const cases = Array.isArray(payload.validationCases) && payload.validationCases.length
      ? payload.validationCases.slice(0, 3)
      : [
          { label: "위험 후보", assetName: "고위험 매입 후보", summary: "가격 부담과 최근 거래 변동이 큰 사례입니다." },
          { label: "애매 후보", assetName: "강한 비교 필요 후보", summary: "유동성과 과밀도를 대체 후보와 비교해야 하는 사례입니다." },
          { label: "보수 검토 후보", assetName: "추가 검토 가능 후보", summary: "점수가 낮아도 현장 조건을 별도 확인해야 하는 사례입니다." },
        ];

    if ($("scenario-case-grid")) {
      $("scenario-case-grid").innerHTML = cases
        .map(
          (item) => `
            <article class="scenario-case-card">
              <div class="scenario-case-head">
                <span class="scenario-case-label">V1 예시 · ${item.label}</span>
                <strong>${item.assetName || item.title}</strong>
              </div>
              <p>${cleanCopy(item.summary)}</p>
              <div class="scenario-action-line">
                <span>다음 확인</span>
                <p>${cleanCopy(item.nextAction || "보류 사유를 비교하고 검토 질문을 기록합니다.")}</p>
              </div>
              <a class="redveil-case-link" href="./assessment.html">이 흐름으로 진단하기 →</a>
            </article>
          `
        )
        .join("");
    }
  }

  renderHero();
  renderWorkflow();
  renderOverview();
  renderPauseReasons();
  renderDistricts();
  renderAlternatives();
  renderFactors();
  renderMemo();
  renderCases();
})();
