(async function () {
  const { fetchJson, formatNumber, renderError } = window.SiteApi;

  function renderAssessmentResult(result) {
    document.getElementById("assessment-result").innerHTML = `
      <div class="section-head">
        <p class="eyebrow">Assessment Result</p>
        <h2>${result.districtName} · ${result.verdict}</h2>
      </div>
      <div class="two-column">
        <article class="data-card compact-stack">
          <span class="metric-pill">리스크 점수</span>
          <strong class="metric-value">${result.customRiskScore}점</strong>
          <p>${result.summary}</p>
        </article>
        <article class="data-card compact-stack">
          <span class="metric-pill">유형</span>
          <strong>${result.riskArchetype}</strong>
          <p>${result.recommendedAction}</p>
        </article>
      </div>
      <div class="two-column" style="margin-top:14px">
        <article class="data-card compact-stack">
          <strong>핵심 근거</strong>
          <ul class="bullet-list">${result.reasons.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
        <article class="data-card compact-stack">
          <strong>바로 확인할 것</strong>
          <ul class="bullet-list">${result.checks.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      </div>
      <div class="footnote-block">
        <p><strong>구 중위 거래가</strong> ${formatNumber(result.districtMedianPricePerSqm)} 만원/㎡</p>
        <p><strong>입력 가격 프리미엄</strong> ${result.premiumPct}%</p>
      </div>
    `;
  }

  try {
    const bootstrap = await fetchJson("/api/bootstrap");
    document.getElementById("district-code").innerHTML = bootstrap.districts
      .map((item) => `<option value="${item.code}">${item.name}</option>`)
      .join("");

    document.getElementById("assessment-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const body = {
        districtCode: document.getElementById("district-code").value,
        askingPricePerSqm: Number(document.getElementById("asking-price").value || 0),
        holdingMonths: Number(document.getElementById("holding-months").value || 36),
        priority: document.getElementById("priority").value,
      };

      const result = await fetchJson("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      renderAssessmentResult(result);
    });
  } catch (error) {
    renderError(error);
  }
})();
