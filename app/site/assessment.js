(function () {
  const { payload, formatNumber, riskTone, buildAssessment, drawLineChart } = window.RedveilV2 || {};

  if (!payload) return;

  const districts = payload.districts || [];
  document.getElementById("assessment-latest-month").textContent = payload.site.latestMonth || "-";
  document.getElementById("district-code").innerHTML = districts
    .map((item) => `<option value="${item.code}">${item.name}</option>`)
    .join("");

  function renderSpotlight(code) {
    const district = districts.find((item) => item.code === code) || districts[0];
    if (!district) return;
    const grade = document.getElementById("assessment-spotlight-grade");
    document.getElementById("assessment-spotlight-name").textContent = district.name;
    document.getElementById("assessment-spotlight-type").textContent = district.riskArchetype;
    grade.textContent = district.riskGrade;
    grade.className = `signal-pill ${riskTone(district.riskScore)}`;
    drawLineChart("assessment-spotlight-chart", district.history || [], "medianPricePerSqm", "#ff6f49");

    document.getElementById("assessment-progress-list").innerHTML = [
      ["총 리스크", district.riskScore],
      ["가격 부담", district.priceBurdenRiskScore],
      ["유동성", district.liquidityRiskScore],
      ["변동성", district.volatilityRiskScore],
      ["경쟁", district.competitionRiskScore],
    ]
      .map(
        ([label, value]) => `
          <article class="progress-card">
            <div class="progress-row">
              <header>
                <span>${label}</span>
                <strong>${formatNumber(value, "점")}</strong>
              </header>
              <div class="progress-track"><span style="width:${Math.max(8, Number(value || 0))}%"></span></div>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderResult(result) {
    document.getElementById("assessment-result").innerHTML = `
      <div class="section-head">
        <div>
          <p class="section-label">Assessment Result</p>
          <h2>${result.districtName} · ${result.verdict}</h2>
        </div>
        <span class="signal-pill ${riskTone(result.customRiskScore)}">${result.riskArchetype}</span>
      </div>
      <div class="result-card" style="margin-top:0">
        <span class="result-label">Risk Score</span>
        <span class="result-score">${formatNumber(result.customRiskScore, "점")}</span>
        <p class="result-copy">${result.summary}</p>
        <div class="chip-row">
          <span class="chip">구 중위 거래가 ${formatNumber(result.districtMedianPricePerSqm, "만원/㎡")}</span>
          <span class="chip">입력 가격 프리미엄 ${formatNumber(result.premiumPct, "%")}</span>
          <span class="chip">보유 기간 ${result.holdingMonths}개월</span>
        </div>
        <div class="result-grid">
          <div>
            <span class="result-label">핵심 근거</span>
            <ul class="result-list">${result.reasons.map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>
          <div>
            <span class="result-label">바로 확인할 것</span>
            <ul class="result-list">${result.checks.map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="chip-row">
          ${(result.replacementCandidates || [])
            .map((item) => `<span class="chip">대체 후보 ${item.name}</span>`)
            .join("")}
        </div>
      </div>
    `;
  }

  const initialCode = document.getElementById("district-code").value;
  renderSpotlight(initialCode);
  const initialResult = buildAssessment({ districtCode: initialCode, holdingMonths: 36, priority: "balanced" });
  if (initialResult) renderResult(initialResult);

  document.getElementById("district-code").addEventListener("change", (event) => {
    renderSpotlight(event.target.value);
  });

  document.getElementById("assessment-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const result = buildAssessment({
      districtCode: document.getElementById("district-code").value,
      askingPricePerSqm: Number(document.getElementById("asking-price").value || 0),
      holdingMonths: Number(document.getElementById("holding-months").value || 36),
      priority: document.getElementById("priority").value,
    });
    if (!result) return;
    renderSpotlight(result.districtCode);
    renderResult(result);
  });
})();
