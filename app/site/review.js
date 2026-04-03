(async function () {
  const { fetchJson, formatNumber, formatDateTime, renderError } = window.SiteApi;

  function renderHistory(reviews) {
    document.getElementById("review-history").innerHTML =
      reviews.length > 0
        ? reviews
            .slice(0, 6)
            .map(
              (item) => `
          <article class="review-card compact-stack">
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
          <article class="empty-card compact-stack">
            <strong>아직 저장한 검토가 없습니다.</strong>
            <p>첫 번째 매물을 입력해보세요.</p>
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
          <strong>다음 확인</strong>
          <ul class="bullet-list">${result.checks.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>
      </div>
      <div style="margin-top:14px">
        <strong>대체 후보</strong>
        <div class="three-grid" style="margin-top:12px">
          ${result.replacementCandidates
            .slice(0, 3)
            .map(
              (item, index) => `
            <article class="data-card compact-stack">
              <span class="candidate-rank">대안 ${index + 1}</span>
              <strong>${item.name}</strong>
              <p>${item.score}점</p>
            </article>
          `
            )
            .join("")}
        </div>
      </div>
      <div class="footnote-block">
        <p><strong>저장 시각</strong> ${formatDateTime(result.createdAt)}</p>
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
