(async function () {
  const { fetchJson, formatNumber, renderError } = window.SiteApi;

  try {
    const cases = await fetchJson("/api/case-studies");
    document.getElementById("case-study-grid").innerHTML = cases
      .map(
        (item, index) => `
      <article class="case-card compact-stack">
        <span class="candidate-rank">Case ${index + 1}</span>
        <h2>${item.name}</h2>
        <span class="score-badge">${item.riskScore}점 · ${item.riskGrade}</span>
        <p>${item.riskArchetype}</p>
        <ul class="bullet-list">
          <li>기준 월: ${item.latestMonth}</li>
          <li>최근 거래: ${formatNumber(item.latestTransactionCount, "건")}</li>
          <li>6개월 가격: ${item.sixMonthPriceChangePct}%</li>
        </ul>
        <p>${item.riskSummary}</p>
        <ul class="bullet-list">${item.fieldChecks.slice(0, 3).map((check) => `<li>${check}</li>`).join("")}</ul>
      </article>
    `
      )
      .join("");
  } catch (error) {
    renderError(error);
  }
})();
