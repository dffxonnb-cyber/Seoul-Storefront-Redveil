(async function () {
  const { fetchJson, formatNumber, renderError } = window.SiteApi;

  try {
    const [content, summary] = await Promise.all([
      fetchJson("/api/content"),
      fetchJson("/api/summary"),
    ]);

    document.getElementById("data-source-grid").innerHTML = content.dataSources.map((item) => `
      <article class="section-card">
        <span class="data-tag">${item.window}</span>
        <h2>${item.name}</h2>
        <p>${item.role}</p>
      </article>
    `).join("");

    document.getElementById("data-summary-grid").innerHTML = [
      ["거래 원천 건수", formatNumber(summary.transactionCount, "건")],
      ["구 커버리지", formatNumber(summary.districtCount, "개")],
      ["행정동 커버리지", formatNumber(summary.adminDongCount, "개")],
      ["저표본 경고 구", formatNumber(summary.lowSampleDistrictCount, "개")],
    ].map(([label, value]) => `
      <article class="data-card">
        <span class="metric-pill">${label}</span>
        <strong class="metric-value">${value}</strong>
      </article>
    `).join("");

    document.getElementById("faq-list").innerHTML = content.faq.map((item) => `
      <article class="faq-item">
        <strong>${item.question}</strong>
        <p>${item.answer}</p>
      </article>
    `).join("");

    document.getElementById("glossary-list").innerHTML = content.glossary.map((item) => `
      <article class="stack-card">
        <strong>${item.term}</strong>
        <p>${item.definition}</p>
      </article>
    `).join("");
  } catch (error) {
    renderError(error);
  }
})();
