(function () {
  const { payload, formatNumber, riskTone } = window.RedveilV2 || {};

  if (!payload) return;

  const districts = payload.districts || [];
  document.getElementById("compare-coverage").textContent = `${districts.length}개 구`;

  function optionHtml() {
    return districts.map((item) => `<option value="${item.code}">${item.name}</option>`).join("");
  }

  document.getElementById("compare-a").innerHTML = optionHtml();
  document.getElementById("compare-b").innerHTML = optionHtml();
  document.getElementById("compare-c").innerHTML = optionHtml();
  if (districts[1]) document.getElementById("compare-b").value = districts[1].code;
  if (districts[2]) document.getElementById("compare-c").value = districts[2].code;

  function selectedDistricts() {
    const codes = [
      document.getElementById("compare-a").value,
      document.getElementById("compare-b").value,
      document.getElementById("compare-c").value,
    ].filter(Boolean);
    const uniqueCodes = [...new Set(codes)];
    return uniqueCodes
      .map((code) => districts.find((item) => item.code === code))
      .filter(Boolean);
  }

  function renderCards(items) {
    document.getElementById("compare-grid").innerHTML = items
      .map(
        (item, index) => `
          <article class="compare-card ${index === 0 ? "selected-card" : ""}">
            <div class="district-score-row">
              <span class="rank-pill">후보 ${String.fromCharCode(65 + index)}</span>
              <span class="tone-pill ${riskTone(item.riskScore)}">${item.riskGrade}</span>
            </div>
            <strong>${item.name}</strong>
            <p>${item.riskArchetype}</p>
            <p>${item.riskSummary}</p>
            <div class="chip-row">
              <span class="chip">총 리스크 ${formatNumber(item.riskScore, "점")}</span>
              <span class="chip">가격 부담 ${formatNumber(item.priceBurdenRiskScore, "점")}</span>
            </div>
            <ul class="case-list">
              ${(item.objections || []).slice(0, 3).map((objection) => `<li>${objection}</li>`).join("")}
            </ul>
          </article>
        `
      )
      .join("");
  }

  function renderMetrics(items) {
    const metricDefs = [
      ["총 리스크", "riskScore"],
      ["가격 부담", "priceBurdenRiskScore"],
      ["유동성", "liquidityRiskScore"],
      ["변동성", "volatilityRiskScore"],
      ["경쟁", "competitionRiskScore"],
    ];

    document.getElementById("compare-metrics").innerHTML = metricDefs
      .map(
        ([label, key]) => `
          <article class="progress-card">
            <span class="card-label">${label}</span>
            <div class="panel-stack">
              ${items
                .map(
                  (item) => `
                    <div class="progress-row">
                      <header>
                        <span>${item.name}</span>
                        <strong>${formatNumber(item[key], "점")}</strong>
                      </header>
                      <div class="progress-track"><span style="width:${Math.max(8, Number(item[key] || 0))}%"></span></div>
                    </div>
                  `
                )
                .join("")}
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderRecommendation(items) {
    const best = [...items].sort((a, b) => Number(a.riskScore) - Number(b.riskScore))[0];
    const safestCompetition = [...items].sort((a, b) => Number(a.competitionRiskScore) - Number(b.competitionRiskScore))[0];
    const safestLiquidity = [...items].sort((a, b) => Number(a.liquidityRiskScore) - Number(b.liquidityRiskScore))[0];

    document.getElementById("compare-recommendation").innerHTML = `
      <article class="mini-compare-card selected-card">
        <span class="card-label">Lowest Total Risk</span>
        <strong>${best.name}</strong>
        <p>${formatNumber(best.riskScore, "점")} · ${best.riskArchetype}</p>
      </article>
      <article class="mini-compare-card">
        <span class="card-label">Lowest Competition</span>
        <strong>${safestCompetition.name}</strong>
        <p>${formatNumber(safestCompetition.competitionRiskScore, "점")} · 과밀 압박이 가장 낮습니다.</p>
      </article>
      <article class="mini-compare-card">
        <span class="card-label">Best Liquidity</span>
        <strong>${safestLiquidity.name}</strong>
        <p>${formatNumber(safestLiquidity.liquidityRiskScore, "점")} · 거래 회전 리스크가 가장 낮습니다.</p>
      </article>
    `;
  }

  function renderDecisionMemo(items) {
    const sorted = [...items].sort((a, b) => Number(a.riskScore) - Number(b.riskScore));
    const safest = sorted[0];
    const riskiest = sorted[sorted.length - 1];
    const biggestGap = [
      ["가격 부담", "priceBurdenRiskScore"],
      ["거래 유동성", "liquidityRiskScore"],
      ["가격 변동성", "volatilityRiskScore"],
      ["상권 과밀", "competitionRiskScore"],
    ]
      .map(([label, key]) => {
        const values = items.map((item) => Number(item[key] || 0));
        return { label, key, gap: Math.max(...values) - Math.min(...values) };
      })
      .sort((a, b) => b.gap - a.gap)[0];
    const caution = Number(riskiest?.riskScore || 0) >= 70 ? "매입 보류" : Number(riskiest?.riskScore || 0) >= 60 ? "강한 비교 필요" : "추가 검토";

    document.getElementById("compare-memo").innerHTML = `
      <div class="compare-decision-grid">
        <article class="compare-decision-summary">
          <span class="result-label">Memo Output</span>
          <strong>${safest.name}을 먼저 보고, ${riskiest.name}은 ${caution}로 둡니다.</strong>
          <p>${safest.name}은 현재 선택 조합에서 총 리스크가 가장 낮습니다. ${riskiest.name}은 ${formatNumber(
            riskiest.riskScore,
            "점"
          )}으로 가장 높아 가격선과 현장 조건을 더 보수적으로 확인해야 합니다.</p>
        </article>
        <article>
          <span class="result-label">가장 크게 갈리는 축</span>
          <strong>${biggestGap.label}</strong>
          <p>선택 후보 간 격차가 ${formatNumber(biggestGap.gap, "점")}입니다. 이 축을 중심으로 후보를 다시 좁히는 것이 좋습니다.</p>
        </article>
        <article>
          <span class="result-label">다음 액션</span>
          <strong>낮은 리스크 후보를 기준선으로 삼기</strong>
          <p>${safest.name}의 가격선과 상권 과밀도를 기준으로 나머지 후보의 초과 위험을 비교하세요.</p>
        </article>
      </div>
    `;
  }

  function runCompare() {
    const items = selectedDistricts();
    renderCards(items);
    renderMetrics(items);
    renderRecommendation(items);
    renderDecisionMemo(items);
  }

  document.getElementById("compare-run").addEventListener("click", runCompare);
  runCompare();
})();
