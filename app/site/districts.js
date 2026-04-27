(function () {
  const { payload, formatNumber, riskTone, drawLineChart } = window.RedveilV2 || {};
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
      ["가격 부담", detail.priceBurdenRiskScore, "같은 권역 대비 매입 가격선이 앞서 있는지 확인합니다."],
      ["거래 유동성", detail.liquidityRiskScore, "최근 거래가 얇아졌다면 회수 가능성을 보수적으로 봅니다."],
      ["가격 변동성", detail.volatilityRiskScore, "최근 체결선이 흔들렸는지 이상 거래를 분리해 봅니다."],
      ["상권 과밀", detail.competitionRiskScore, "동일 업종이 밀집되어 임차인 교체 리스크가 커지는지 봅니다."],
    ]
      .map(([label, value, body]) => ({ label, value: Number(value || 0), body }))
      .sort((left, right) => right.value - left.value);
  }

  function renderDetail() {
    const detail = currentDistrict();
    if (!detail) return;

    document.getElementById("detail-name").textContent = `${detail.name} · ${detail.riskArchetype}`;
    document.getElementById("detail-memo").textContent = detail.memo;
    document.getElementById("detail-grade").textContent = detail.riskGrade;
    document.getElementById("detail-score").textContent = formatNumber(detail.riskScore, "점");

    document.getElementById("detail-summary-grid").innerHTML = [
      ["대표 유형", detail.riskArchetype],
      ["신뢰도", detail.sampleReliability],
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
        <p>${detail.archetypeSummary || detail.memo}</p>
      </article>
      <div class="district-factor-list">
        ${riskFactors(detail)
          .slice(0, 4)
          .map(
            (factor, index) => `
              <article class="${index === 0 ? "is-primary" : ""}">
                <div>
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <strong>${factor.label}</strong>
                  <p>${factor.body}</p>
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
      .map((item) => `<article><strong>확인</strong><p>${item}</p></article>`)
      .join("");

    document.getElementById("detail-objections").innerHTML = (detail.objections || [])
      .map((item) => `<article><strong>근거</strong><p>${item}</p></article>`)
      .join("");

    document.getElementById("replacement-candidates").innerHTML =
      detail.replacementCandidates && detail.replacementCandidates.length
        ? detail.replacementCandidates
            .map(
              (item) => `
                <article>
                  <strong>${item.name}</strong>
                  <p>${formatNumber(item.score, "점")} · ${item.whyBetter}</p>
                </article>
              `
            )
            .join("")
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
