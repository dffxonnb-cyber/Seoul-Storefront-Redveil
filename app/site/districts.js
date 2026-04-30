(function () {
  const {
    payload,
    formatNumber,
    riskTone,
    drawLineChart,
    polishCopy,
    reliabilityInfo,
    renderReliabilityBadges,
    renderBenchmarkLine,
    renderRiskOverlap,
  } = window.RedveilV2 || {};
  if (!payload) return;

  const state = {
    districts: payload.districts || [],
    selectedCode: payload.districts?.[0]?.code || null,
  };

  document.getElementById("district-coverage").textContent = `${state.districts.length}개 구`;

  function visibleDistricts(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return state.districts;
    return state.districts.filter((item) => item.name.includes(trimmed));
  }

  function renderList(query = "") {
    const items = visibleDistricts(query);
    document.getElementById("district-list").innerHTML = items
      .map(
        (item) => `
          <button class="district-select-button ${item.code === state.selectedCode ? "is-active" : ""}" data-code="${item.code}">
            <strong>${item.name}</strong>
            <span>${formatNumber(item.riskScore, "점")} · ${item.riskGrade}</span>
            <span>${item.riskArchetype}</span>
          </button>
        `
      )
      .join("");

    document.querySelectorAll(".district-select-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCode = button.dataset.code;
        renderList(document.getElementById("district-search").value);
        renderDetail();
      });
    });
  }

  function currentDistrict() {
    return state.districts.find((item) => item.code === state.selectedCode) || state.districts[0];
  }

  function riskFactors(detail) {
    return [
      [
        "가격 부담",
        detail.priceBurdenRiskScore,
        "같은 권역 대비 매입 가격선이 앞서 있는지 확인합니다.",
        "권역 비교 기준",
      ],
      [
        "거래 유동성",
        detail.liquidityRiskScore,
        "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검합니다.",
        "최근 12개월 거래 표본",
      ],
      [
        "가격 변동성",
        detail.volatilityRiskScore,
        "최근 몇 건이 전체 시장을 왜곡한 이상 거래인지 살펴봅니다.",
        "체결 레벨 분리 기준",
      ],
      [
        "상권 과밀",
        detail.competitionRiskScore,
        "같은 형식의 점포가 얼마나 중복되어 있는지 확인합니다.",
        "행정동 점포 밀도 기준",
      ],
    ]
      .map(([label, value, question, helper]) => ({ label, value: Number(value || 0), question, helper }))
      .sort((left, right) => right.value - left.value);
  }

  function compactReasonLabel(value) {
    const text = String(value || "");
    if (text.includes("가격") && text.includes("부담")) return "가격 부담";
    if (text.includes("과밀") || text.includes("점포")) return "점포 과밀";
    if (text.includes("변동")) return "가격 변동성";
    if (text.includes("유동") || text.includes("거래")) return "거래 유동성";
    if (text.includes("표본")) return "표본 주의";
    if (text.includes("복합") || text.includes("한 가지")) return "복합 점검";
    return text.length > 18 ? `${text.slice(0, 18)}...` : text;
  }

  function districtJudgment(detail) {
    const source = detail.objections?.[0] || detail.riskSummary || detail.decisionQuestion || detail.recommendedAction;
    const polished = polishCopy(source || detail.archetypeSummary || detail.memo);
    if (!polished) return "매물 단위 조건과 대체 후보를 함께 비교해야 합니다.";
    return /[.!?。]$/.test(polished) ? polished : `${polished}.`;
  }

  function replacementNames(detail) {
    return (detail.replacementCandidates || [])
      .slice(0, 3)
      .map((item) => (typeof item === "string" ? item : item.name))
      .filter(Boolean);
  }

  function renderDetail() {
    const detail = currentDistrict();
    if (!detail) return;

    document.getElementById("detail-name").textContent = detail.name;
    document.getElementById("detail-type").textContent = detail.riskArchetype;
    const gradeEl = document.getElementById("detail-grade");
    gradeEl.textContent = detail.riskGrade;
    gradeEl.className = `risk-level-badge ${typeof riskTone === "function" ? riskTone(detail.riskScore) : ""}`;
    document.getElementById("detail-score").textContent = formatNumber(detail.riskScore, "점");
    const reliability = reliabilityInfo(detail);
    const pauseReasons = (detail.objections && detail.objections.length ? detail.objections : riskFactors(detail).map((item) => item.label)).slice(0, 3);
    const alternatives = replacementNames(detail);

    document.getElementById("detail-judgment").textContent = districtJudgment(detail);
    document.getElementById("detail-pause-reasons").innerHTML = pauseReasons
      .map((item) => `<span>${compactReasonLabel(polishCopy(item))}</span>`)
      .join("");
    document.getElementById("detail-alternative-pills").innerHTML = alternatives.length
      ? alternatives.map((name) => `<span>${name}</span>`).join("")
      : `<span class="is-muted">현장 확인 우선</span>`;

    document.getElementById("detail-summary-grid").innerHTML = [
      ["데이터 신뢰도", reliability.level],
      ["기반 표본", reliability.sampleCount ? formatNumber(reliability.sampleCount, "건", 0) : "확인 필요"],
      ["음식업 비중", formatNumber(detail.foodStoreSharePct, "%")],
      ["행정동당 점포", formatNumber(detail.storesPerAdminDong)],
    ]
      .map(
        ([label, value]) => `
          <article class="stat-card">
            <span class="card-label">${label}</span>
            <strong>${value}</strong>
          </article>
        `
      )
      .join("");

    document.getElementById("district-drilldown").innerHTML = `
      <article class="district-drilldown-lead">
        <span class="result-label">Pause Trigger</span>
        <strong>${detail.decisionQuestion || detail.recommendedAction}</strong>
        <p>${polishCopy(detail.archetypeSummary || detail.memo)}</p>
        ${renderBenchmarkLine(detail.riskScore, detail)}
        ${renderReliabilityBadges(detail, { includeNote: true })}
      </article>
      ${renderRiskOverlap(detail)}
      <div class="district-factor-list">
        ${riskFactors(detail)
          .slice(0, 4)
          .map(
            (factor, index) => `
              <article class="${index === 0 ? "is-primary" : ""}">
                <div>
                  <span class="district-factor-axis">${factor.label}</span>
                  <strong>${polishCopy(factor.question)}</strong>
                  <span class="district-factor-meta">${factor.helper}</span>
                </div>
                <em>${formatNumber(factor.value, "점")}</em>
              </article>
            `
          )
          .join("")}
      </div>
    `;

    document.getElementById("detail-metrics").innerHTML = [
      ["총 리스크", detail.riskScore],
      ["가격 부담", detail.priceBurdenRiskScore],
      ["거래 유동성", detail.liquidityRiskScore],
      ["변동성", detail.volatilityRiskScore],
      ["상권 경쟁", detail.competitionRiskScore],
    ]
      .map(
        ([label, value]) => `
          <div class="metric-row">
            <header>
              <span>${label}</span>
              <span>${formatNumber(value, "점")}</span>
            </header>
            <div class="progress-track"><span style="width:${Math.max(8, Number(value || 0))}%"></span></div>
          </div>
        `
      )
      .join("");

    document.getElementById("detail-checks").innerHTML = (detail.reviewChecklist || [])
      .map((item) => `<article><strong>확인</strong><p>${polishCopy(item)}</p></article>`)
      .join("");

    document.getElementById("detail-objections").innerHTML = (detail.objections || [])
      .slice(0, 4)
      .map(
        (item, index) => `
          <article class="objection-row">
            <strong>${String(index + 1).padStart(2, "0")}</strong>
            <p>${polishCopy(item)}</p>
          </article>
        `
      )
      .join("");

    document.getElementById("replacement-candidates").innerHTML =
      detail.replacementCandidates && detail.replacementCandidates.length
        ? detail.replacementCandidates
            .map(
              (item) => `
                <article>
                  <strong>${item.name}</strong>
                  <p>${formatNumber(item.score, "점")} · 추가 검토 후보입니다. ${polishCopy(item.whyBetter)}</p>
                </article>
              `
            )
            .join("") +
          `
            <section class="replacement-summary-strip">
              <span class="result-label">비교 기준</span>
              <p>같은 예산대에서 가격 부담, 거래 유동성, 상권 과밀 신호를 함께 낮춰 볼 수 있는 구를 우선 비교합니다.</p>
            </section>
          `
        : `<article><strong>대체 후보 없음</strong><p>현재 조건에서는 바로 제시할 대체 구가 없습니다.</p></article>`;

    drawLineChart("price-chart", detail.history || [], "medianPricePerSqm", "#df5a3a");
    drawLineChart("volume-chart", detail.history || [], "transactionCount", "#79c1bc");
  }

  renderList();
  renderDetail();

  document.getElementById("district-search").addEventListener("input", (event) => {
    const items = visibleDistricts(event.target.value);
    if (!items.find((item) => item.code === state.selectedCode) && items[0]) {
      state.selectedCode = items[0].code;
      renderDetail();
    }
    renderList(event.target.value);
  });
})();
