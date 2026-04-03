(function () {
  const { payload, formatNumber, riskTone } = window.RedveilV2 || {};
  if (!payload) return;

  const cases = payload.caseStudies || [];
  document.getElementById("case-count").textContent = `${cases.length}개`;

  document.getElementById("case-grid").innerHTML = cases
    .map(
      (item) => `
        <article class="panel section-block">
          <div class="section-head">
            <div>
              <p class="section-label">${item.latestMonth}</p>
              <h2>${item.name} · ${item.riskArchetype}</h2>
            </div>
            <span class="signal-pill ${riskTone(item.riskScore)}">${formatNumber(item.riskScore, "점")} · ${item.riskGrade}</span>
          </div>
          <div class="detail-grid">
            <div class="stacked-list">
              <article><strong>요약</strong><p>${item.riskSummary}</p></article>
              <article><strong>최근 거래</strong><p>${formatNumber(item.latestTransactionCount, "건")} · 6개월 가격 변화 ${formatNumber(item.sixMonthPriceChangePct, "%")}</p></article>
              <article><strong>상위 업종</strong><p>${item.topCategories}</p></article>
            </div>
            <div class="stacked-list">
              ${(item.objections || []).map((reason) => `<article><strong>반대 근거</strong><p>${reason}</p></article>`).join("")}
            </div>
          </div>
          <div class="evidence-pair" style="margin-top:18px">
            <div class="stacked-list">
              ${(item.fieldChecks || []).map((check) => `<article><strong>현장 확인</strong><p>${check}</p></article>`).join("")}
            </div>
            <div class="stacked-list">
              ${(item.replacementCandidates || []).length
                ? item.replacementCandidates.map((candidate) => `<article><strong>대체 후보</strong><p>${candidate}</p></article>`).join("")
                : `<article><strong>대체 후보 없음</strong><p>현재 케이스에 연결된 대체 후보가 없습니다.</p></article>`}
            </div>
          </div>
        </article>
      `
    )
    .join("");
})();
