(async function () {
  const { fetchJson, formatNumber, formatDateTime, renderError } = window.SiteApi;

  function renderHistory(reviews) {
    document.getElementById("review-history").innerHTML =
      reviews.length > 0
        ? reviews
            .slice(0, 6)
            .map(
              (item) => `
          <article class="review-card">
            <span class="metric-pill">${item.verdict}</span>
            <strong>${item.assetName}</strong>
            <p>${item.districtName}${item.adminDongName ? ` · ${item.adminDongName}` : ""}</p>
            <p>${item.customRiskScore}점 · ${item.riskArchetype}</p>
            <p>${item.askingPriceTotal10k ? `${formatNumber(item.askingPriceTotal10k, "만원")} · ` : ""}${formatDateTime(item.createdAt)}</p>
          </article>
        `
            )
            .join("")
        : `
          <article class="empty-card">
            <strong>아직 저장된 매물 검토가 없습니다.</strong>
            <p>첫 번째 매물을 입력해 레드팀 메모를 저장해 보세요.</p>
          </article>
        `;
  }

  function renderResult(result) {
    document.getElementById("review-result").innerHTML = `
      <div class="section-head">
        <p class="eyebrow">Saved Output</p>
        <h2>${result.assetName} · ${result.verdict}</h2>
      </div>
      <div class="two-column">
        <article class="data-card">
          <span class="metric-pill">커스텀 리스크 점수</span>
          <strong class="metric-value">${result.customRiskScore}점</strong>
          <p>${result.summary}</p>
        </article>
        <article class="data-card">
          <span class="metric-pill">리스크 유형</span>
          <strong>${result.riskArchetype}</strong>
          <p>${result.recommendedAction}</p>
        </article>
      </div>
      <div class="two-column" style="margin-top:14px">
        <article class="data-card">
          <strong>핵심 반대 근거</strong>
          <ul class="bullet-list">${result.reasons.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
        <article class="data-card">
          <strong>다음 확인 항목</strong>
          <ul class="bullet-list">${result.checks.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      </div>
      <div style="margin-top:14px">
        <strong>먼저 비교할 대체 구</strong>
        <div class="three-grid" style="margin-top:12px">
          ${result.replacementCandidates
            .map(
              (item, index) => `
            <article class="data-card">
              <span class="candidate-rank">대안 ${index + 1}</span>
              <strong>${item.name}</strong>
              <p>${item.score}점</p>
              <p>${item.whyBetter}</p>
            </article>
          `
            )
            .join("")}
        </div>
      </div>
      <div class="footnote-block">
        <p><strong>저장 시각</strong> ${formatDateTime(result.createdAt)}</p>
        <p><strong>저장 ID</strong> ${result.id}</p>
      </div>
    `;
  }

  try {
    const [bootstrap, reviews] = await Promise.all([fetchJson("/api/bootstrap"), fetchJson("/api/reviews")]);
    document.getElementById("review-district-code").innerHTML = bootstrap.districts
      .map((item) => `<option value="${item.code}">${item.name}</option>`)
      .join("");
    renderHistory(reviews);

    document.getElementById("review-form").addEventListener("submit", async (event) => {
      event.preventDefault();

      const body = {
        assetName: document.getElementById("asset-name").value.trim(),
        districtCode: document.getElementById("review-district-code").value,
        adminDongName: document.getElementById("admin-dong-name").value.trim(),
        askingPriceTotal10k: Number(document.getElementById("asking-price-total").value || 0),
        exclusiveAreaSqm: Number(document.getElementById("exclusive-area").value || 0),
        holdingMonths: Number(document.getElementById("review-holding-months").value || 36),
        priority: document.getElementById("review-priority").value,
        targetTenant: document.getElementById("target-tenant").value.trim(),
        memo: document.getElementById("review-memo").value.trim(),
      };

      const result = await fetchJson("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      renderResult(result);
      renderHistory(await fetchJson("/api/reviews"));
    });
  } catch (error) {
    renderError(error);
  }
})();
