(function () {
  const {
    payload,
    formatNumber,
    formatDateTime,
    riskTone,
    loadReviews,
    createReviewRecord,
    persistReview,
    drawLineChart,
  } = window.RedveilV2 || {};

  if (!payload) return;

  const districts = payload.districts || [];

  function renderHistory() {
    const reviews = loadReviews();
    document.getElementById("review-count").textContent = `${reviews.length}건`;
    document.getElementById("review-history").innerHTML =
      reviews.length > 0
        ? reviews
            .slice(0, 6)
            .map(
              (item) => `
                <article class="review-entry">
                  <span class="card-label">${item.verdict}</span>
                  <strong>${item.assetName}</strong>
                  <p>${item.districtName}${item.adminDongName ? ` · ${item.adminDongName}` : ""}</p>
                  <p>${formatNumber(item.customRiskScore, "점")} · ${item.riskArchetype}</p>
                  <p>${item.askingPriceTotal10k ? `${formatNumber(item.askingPriceTotal10k, "만원")} · ` : ""}${formatDateTime(item.createdAt)}</p>
                </article>
              `
            )
            .join("")
        : `
          <article class="review-entry">
            <span class="card-label">No History</span>
            <strong>아직 저장된 검토가 없습니다.</strong>
            <p>첫 번째 매물을 저장하면 이 영역에 기록이 쌓입니다.</p>
          </article>
        `;
  }

  function renderSpotlight(code) {
    const district = districts.find((item) => item.code === code) || districts[0];
    if (!district) return;

    const grade = document.getElementById("review-spotlight-grade");
    document.getElementById("review-spotlight-name").textContent = district.name;
    document.getElementById("review-spotlight-type").textContent = district.riskArchetype;
    grade.textContent = district.riskGrade;
    grade.className = `signal-pill ${riskTone(district.riskScore)}`;

    drawLineChart("review-spotlight-chart", district.history || [], "medianPricePerSqm", "#ff6f49");

    document.getElementById("review-spotlight-stats").innerHTML = [
      ["총 리스크", formatNumber(district.riskScore, "점")],
      ["가격 부담", formatNumber(district.priceBurdenRiskScore, "점")],
      ["유동성", formatNumber(district.liquidityRiskScore, "점")],
      ["변동성", formatNumber(district.volatilityRiskScore, "점")],
      ["경쟁", formatNumber(district.competitionRiskScore, "점")],
      ["대표 유형", district.riskArchetype],
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
  }

  function renderResult(result) {
    document.getElementById("review-result").innerHTML = `
      <div class="section-head">
        <div>
          <p class="section-label">Saved Output</p>
          <h2>${result.assetName} · ${result.verdict}</h2>
        </div>
        <span class="signal-pill ${riskTone(result.customRiskScore)}">${result.riskArchetype}</span>
      </div>
      <div class="result-card" style="margin-top:0">
        <span class="result-label">Decision Memo</span>
        <span class="result-score">${formatNumber(result.customRiskScore, "점")}</span>
        <p class="result-copy">${result.summary}</p>
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
        <p class="compact-note">저장 시각 ${formatDateTime(result.createdAt)}</p>
      </div>
    `;
  }

  document.getElementById("review-district-code").innerHTML = districts
    .map((item) => `<option value="${item.code}">${item.name}</option>`)
    .join("");

  renderHistory();
  renderSpotlight(document.getElementById("review-district-code").value);

  document.getElementById("review-district-code").addEventListener("change", (event) => {
    renderSpotlight(event.target.value);
  });

  document.getElementById("review-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const record = createReviewRecord({
      assetName: document.getElementById("asset-name").value.trim(),
      districtCode: document.getElementById("review-district-code").value,
      adminDongName: document.getElementById("admin-dong-name").value.trim(),
      askingPriceTotal10k: Number(document.getElementById("asking-price-total").value || 0),
      exclusiveAreaSqm: Number(document.getElementById("exclusive-area").value || 0),
      holdingMonths: Number(document.getElementById("review-holding-months").value || 36),
      priority: document.getElementById("review-priority").value,
      targetTenant: document.getElementById("target-tenant").value.trim(),
      memo: document.getElementById("review-memo").value.trim(),
    });

    if (!record) return;

    persistReview(record);
    renderResult(record);
    renderHistory();
  });
})();
