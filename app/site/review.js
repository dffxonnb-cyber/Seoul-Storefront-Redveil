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

  function districtForRecord(record) {
    return districts.find((item) => item.code === record.districtCode) || null;
  }

  function latestHistoryValue(district, key) {
    const history = district?.history || [];
    return Number(history[history.length - 1]?.[key] || 0);
  }

  function riskFactors(district) {
    if (!district) return [];
    return [
      ["총 리스크", district.riskScore],
      ["가격 부담", district.priceBurdenRiskScore],
      ["거래 유동성", district.liquidityRiskScore],
      ["가격 변동성", district.volatilityRiskScore],
      ["상권 과밀", district.competitionRiskScore],
    ]
      .map(([label, value]) => ({ label, value: Number(value || 0) }))
      .sort((left, right) => right.value - left.value);
  }

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

  function renderReviewDetail(result) {
    const district = districtForRecord(result);
    const marketPrice = latestHistoryValue(district, "medianPricePerSqm");
    const askingPrice = Number(result.askingPricePerSqm || 0);
    const premium = marketPrice > 0 && askingPrice > 0 ? (askingPrice / marketPrice - 1) * 100 : Number(result.premiumPct || 0);
    const factors = riskFactors(district).slice(0, 3);
    const detail = document.getElementById("review-detail");
    if (!detail) return;

    detail.innerHTML = `
      <div class="section-head">
        <div>
          <p class="section-label">Review Detail</p>
          <h2>${result.assetName} 상세 판단 리포트</h2>
          <p class="section-copy">${result.districtName} 리스크 맥락과 입력 가격선을 함께 다시 봅니다.</p>
        </div>
        <span class="signal-pill ${riskTone(result.customRiskScore)}">${result.verdict}</span>
      </div>

      <div class="review-detail-grid">
        <article class="review-detail-hero">
          <span class="result-label">Decision Snapshot</span>
          <strong>${formatNumber(result.customRiskScore, "점")} · ${result.riskArchetype}</strong>
          <p>${result.summary}</p>
          <div class="review-detail-kpis">
            <div>
              <span>입력 가격선</span>
              <strong>${askingPrice ? formatNumber(askingPrice, "만원/㎡") : "미입력"}</strong>
            </div>
            <div>
              <span>구 기준선</span>
              <strong>${marketPrice ? formatNumber(marketPrice, "만원/㎡") : "확인 필요"}</strong>
            </div>
            <div>
              <span>기준선 대비</span>
              <strong>${askingPrice && marketPrice ? `${premium >= 0 ? "+" : ""}${premium.toFixed(1)}%` : "보류"}</strong>
            </div>
          </div>
        </article>

        <article class="review-detail-chart-card">
          <div class="chart-head">
            <strong>${result.districtName} 최근 가격선</strong>
            <span>입력 매물 비교</span>
          </div>
          <svg id="review-detail-price-chart" viewBox="0 0 420 180" aria-label="저장 매물 가격선 비교"></svg>
        </article>
      </div>

      <div class="review-detail-sections">
        <section>
          <span class="result-label">핵심 위험 축</span>
          ${factors
            .map(
              (factor) => `
                <div class="review-detail-factor">
                  <header><strong>${factor.label}</strong><span>${formatNumber(factor.value, "점")}</span></header>
                  <div class="progress-track"><span style="width:${Math.max(8, factor.value)}%"></span></div>
                </div>
              `
            )
            .join("")}
        </section>
        <section>
          <span class="result-label">다음 확인 항목</span>
          <ul class="result-list">${(result.checks || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        </section>
        <section>
          <span class="result-label">대체 후보</span>
          <div class="review-detail-candidates">
            ${(result.replacementCandidates || [])
              .map(
                (item) => `
                  <article>
                    <strong>${item.name}</strong>
                    <p>${formatNumber(item.score, "점")} · ${item.whyBetter || "총 리스크가 더 낮습니다"}</p>
                  </article>
                `
              )
              .join("") || "<article><strong>대체 후보 없음</strong><p>현재 조건에서는 별도 후보가 표시되지 않았습니다.</p></article>"}
          </div>
        </section>
      </div>
    `;

    if (district?.history?.length) {
      drawLineChart("review-detail-price-chart", district.history || [], "medianPricePerSqm", "#c43f27");
    }
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
    renderReviewDetail(record);
    renderHistory();
  });

  document.getElementById("review-history").addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-id]");
    if (!button) return;
    const review = loadReviews().find((item) => item.id === button.dataset.reviewId);
    if (review) {
      renderResult(review);
      renderReviewDetail(review);
      document.getElementById("review-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
