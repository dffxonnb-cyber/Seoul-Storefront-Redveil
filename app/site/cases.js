(async function () {
  const { fetchJson, formatNumber, renderError } = window.SiteApi;

  try {
    const cases = await fetchJson("/api/case-studies");
    document.getElementById("case-study-grid").innerHTML = cases.map((item, index) => `
      <article class="case-card">
        <span class="candidate-rank">Case ${index + 1}</span>
        <h2>${item.name}</h2>
        <span class="score-badge">${item.riskScore}점 · ${item.riskGrade}</span>
        <p>${item.objections.join(" · ")}</p>
        <ul class="bullet-list">
          <li>최근 월: ${item.latestMonth}</li>
          <li>최근 거래 건수: ${formatNumber(item.latestTransactionCount, "건")}</li>
          <li>면적당 중위 거래가: ${formatNumber(item.latestMedianPricePerSqm)} 만원/㎡</li>
          <li>6개월 가격 변화: ${item.sixMonthPriceChangePct}%</li>
          <li>6개월 거래 변화: ${item.sixMonthTransactionChangePct}%</li>
          <li>상위 업종: ${item.topCategories}</li>
        </ul>
        <p>${item.riskSummary}</p>
        <p><strong>현장 체크</strong></p>
        <ul class="bullet-list">${item.fieldChecks.map((check) => `<li>${check}</li>`).join("")}</ul>
      </article>
    `).join("");
  } catch (error) {
    renderError(error);
  }
})();
