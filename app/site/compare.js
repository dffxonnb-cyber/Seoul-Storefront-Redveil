(async function () {
  const { fetchJson, renderError } = window.SiteApi;

  function optionHtml(districts) {
    return districts.map((item) => `<option value="${item.code}">${item.name}</option>`).join("");
  }

  function renderCompare(districts) {
    document.getElementById("compare-grid").innerHTML = districts
      .map(
        (item) => `
      <article class="section-card compact-stack">
        <span class="score-badge">${item.riskScore}점 · ${item.riskGrade}</span>
        <h2>${item.name}</h2>
        <p>${item.riskArchetype}</p>
        <ul class="bullet-list">
          <li>가격 부담 ${item.priceBurdenRiskScore}점</li>
          <li>유동성 ${item.liquidityRiskScore}점</li>
          <li>변동성 ${item.volatilityRiskScore}점</li>
          <li>경쟁 ${item.competitionRiskScore}점</li>
        </ul>
        <ul class="bullet-list">${item.objections.slice(0, 3).map((objection) => `<li>${objection}</li>`).join("")}</ul>
      </article>
    `
      )
      .join("");
  }

  try {
    const bootstrap = await fetchJson("/api/bootstrap");
    const districts = bootstrap.districts;
    document.getElementById("compare-a").innerHTML = optionHtml(districts);
    document.getElementById("compare-b").innerHTML = optionHtml(districts);
    document.getElementById("compare-c").innerHTML = optionHtml(districts);
    if (districts[1]) document.getElementById("compare-b").value = districts[1].code;
    if (districts[2]) document.getElementById("compare-c").value = districts[2].code;

    async function runCompare() {
      const codes = [
        document.getElementById("compare-a").value,
        document.getElementById("compare-b").value,
        document.getElementById("compare-c").value,
      ].filter(Boolean);
      const uniqueCodes = [...new Set(codes)];
      const data = await fetchJson(`/api/compare?codes=${uniqueCodes.join(",")}`);
      renderCompare(data.districts);
    }

    document.getElementById("compare-run").addEventListener("click", runCompare);
    runCompare();
  } catch (error) {
    renderError(error);
  }
})();
