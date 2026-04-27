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
                  <div class="review-entry-head">
                    <span class="signal-pill ${riskTone(item.customRiskScore)}">${item.verdict}</span>
                    <span class="review-entry-time">${formatDateTime(item.createdAt)}</span>
                  </div>
                  <strong>${item.assetName}</strong>
                  <p class="review-entry-meta">${item.districtName}${item.adminDongName ? ` · ${item.adminDongName}` : ""}${
                item.targetTenant ? ` · ${item.targetTenant}` : ""
              }</p>
                  <div class="review-entry-risk">
                    <span>${formatNumber(item.customRiskScore, "점")}</span>
                    <p>${item.riskArchetype}</p>
                  </div>
                  <p>${item.summary}</p>
                  <button class="homepage-action-button homepage-action-button-soft review-replay-button" type="button" data-review-id="${item.id}">
                    메모 다시 보기
                  </button>
                </article>
              `
            )
            .join("")
        : `
          <article class="review-entry review-entry-empty">
            <span class="card-label">No History</span>
            <strong>아직 저장된 검토가 없습니다.</strong>
            <p>첫 매물을 입력하면 이곳에 검토 이력이 쌓입니다.</p>
          </article>
        `;
  }

  function renderSpotlight(code) {
    const district = districts.find((item) => item.code === code);
    const chart = document.getElementById("review-spotlight-chart");

    if (!district) {
      document.getElementById("review-spotlight-name").textContent = "검토 구 선택 전";
      document.getElementById("review-spotlight-type").textContent = "지역 맥락 대기";
      document.getElementById("review-spotlight-grade").textContent = "Ready";
      document.getElementById("review-spotlight-grade").className = "signal-pill";
      chart.innerHTML = `
        <g class="chart-empty-grid">
          <line x1="34" y1="52" x2="386" y2="52"></line>
          <line x1="34" y1="92" x2="386" y2="92"></line>
          <line x1="34" y1="132" x2="386" y2="132"></line>
        </g>
        <path class="chart-empty-area" d="M 38 138 C 92 112 126 124 164 102 C 204 80 238 118 274 94 C 318 64 348 82 384 56 L 384 148 L 38 148 Z"></path>
        <path class="chart-empty-line" d="M 38 138 C 92 112 126 124 164 102 C 204 80 238 118 274 94 C 318 64 348 82 384 56"></path>
        <circle class="chart-empty-dot" cx="384" cy="56" r="4"></circle>
        <text x="50%" y="74" text-anchor="middle" class="chart-empty-title">구를 선택하면 차트가 표시됩니다</text>
        <text x="50%" y="96" text-anchor="middle" class="chart-empty-copy">최근 가격선 흐름과 리스크 신호를 함께 봅니다</text>
      `;
      document.getElementById("review-spotlight-stats").innerHTML = `
        <article class="review-context-empty">
          <strong>검토 구를 선택하면 최근 가격선 흐름과 지역 리스크 신호가 표시됩니다.</strong>
          <div class="review-context-chips">
            <span>최근 6개월</span>
            <span>가격 부담</span>
            <span>거래 둔화</span>
            <span>표본 주의</span>
          </div>
        </article>
      `;
      return;
    }

    const grade = document.getElementById("review-spotlight-grade");
    document.getElementById("review-spotlight-name").textContent = district.name;
    document.getElementById("review-spotlight-type").textContent = district.riskArchetype;
    grade.textContent = district.riskGrade;
    grade.className = `signal-pill ${riskTone(district.riskScore)}`;

    drawLineChart("review-spotlight-chart", district.history || [], "medianPricePerSqm", "#c43f27");

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
      <div class="result-card review-result-memo">
        <div class="review-result-scoreline">
          <div>
            <span class="result-label">Decision Memo</span>
            <strong>${result.verdict}</strong>
          </div>
          <span class="result-score">${formatNumber(result.customRiskScore, "점")}</span>
        </div>
        <p class="result-copy">${result.summary}</p>
        <div class="review-result-sections">
          <section>
            <span class="result-label">보류 판단</span>
            <p>${result.recommendedAction}</p>
          </section>
          <section>
            <span class="result-label">핵심 근거</span>
            <ul class="result-list">${result.reasons.map((item) => `<li>${item}</li>`).join("")}</ul>
          </section>
          <section>
            <span class="result-label">다음 확인 항목</span>
            <ul class="result-list">${result.checks.map((item) => `<li>${item}</li>`).join("")}</ul>
          </section>
          <section>
            <span class="result-label">대체 후보</span>
            <div class="chip-row">
              ${(result.replacementCandidates || [])
                .map((item) => `<span class="chip">대체 후보 ${item.name}</span>`)
                .join("") || '<span class="chip">추가 후보 없음</span>'}
            </div>
          </section>
        </div>
        <p class="compact-note">저장 시각 ${formatDateTime(result.createdAt)}</p>
      </div>
    `;
  }

  document.getElementById("review-district-code").innerHTML = `
    <option value="" selected disabled>검토 구 선택</option>
    ${districts.map((item) => `<option value="${item.code}">${item.name}</option>`).join("")}
  `;

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

  document.getElementById("review-history").addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-id]");
    if (!button) return;
    const review = loadReviews().find((item) => item.id === button.dataset.reviewId);
    if (review) renderResult(review);
  });
})();
