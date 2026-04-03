(function () {
  const { payload, formatNumber } = window.RedveilV2 || {};
  if (!payload) return;

  const { site, summary, content, demandFragility, adminDongSaturation } = payload;
  document.getElementById("data-latest-month").textContent = site.latestMonth;

  document.getElementById("data-source-grid").innerHTML = (content.dataSources || [])
    .map(
      (item) => `
        <article class="panel section-block">
          <div class="section-head">
            <div>
              <p class="section-label">${item.window}</p>
              <h2>${item.name}</h2>
            </div>
          </div>
          <p class="section-copy">${item.role}</p>
        </article>
      `
    )
    .join("");

  document.getElementById("data-summary-grid").innerHTML = [
    ["거래 원천", formatNumber(summary.transactionCount, "건")],
    ["구 커버리지", formatNumber(summary.districtCount, "개")],
    ["행정동 범위", formatNumber(summary.adminDongCount, "개")],
    ["수요 취약 상권", formatNumber(summary.tradeAreaCount, "개")],
  ]
    .map(
      ([label, value]) => `
        <article class="panel section-block">
          <span class="card-label">${label}</span>
          <h2>${value}</h2>
        </article>
      `
    )
    .join("");

  document.getElementById("demand-table").innerHTML = (demandFragility || [])
    .slice(0, 8)
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.type}</td>
          <td>${formatNumber(item.riskScore, "점")} · ${item.riskGrade}</td>
          <td>${item.objection}</td>
        </tr>
      `
    )
    .join("");

  document.getElementById("admin-table").innerHTML = (adminDongSaturation || [])
    .slice(0, 8)
    .map(
      (item) => `
        <tr>
          <td>${item.districtName} ${item.name}</td>
          <td>${formatNumber(item.totalStoreCount)}</td>
          <td>${formatNumber(item.foodStoreSharePct, "%")}</td>
          <td>${item.topCategories}</td>
        </tr>
      `
    )
    .join("");

  document.getElementById("faq-list").innerHTML = (content.faq || [])
    .map((item) => `<article><strong>${item.question}</strong><p>${item.answer}</p></article>`)
    .join("");

  document.getElementById("glossary-list").innerHTML = (content.glossary || [])
    .map((item) => `<article><strong>${item.term}</strong><p>${item.definition}</p></article>`)
    .join("");
})();
