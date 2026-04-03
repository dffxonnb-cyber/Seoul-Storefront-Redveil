(async function () {
  const { fetchJson, formatNumber, drawLineChart, renderError } = window.SiteApi;
  const state = {
    districts: [],
    selectedCode: null,
    cache: new Map(),
  };

  function filteredDistricts(query) {
    if (!query.trim()) return state.districts;
    return state.districts.filter((district) => district.name.includes(query.trim()));
  }

  function renderDistrictList(query = "") {
    document.getElementById("district-list").innerHTML = filteredDistricts(query)
      .map(
        (district) => `
        <button class="district-item ${district.code === state.selectedCode ? "is-active" : ""}" data-code="${district.code}">
          <strong>${district.name}</strong>
          <span>${district.riskScore}점 · ${district.riskGrade}</span>
          <span>${district.riskArchetype} · 신뢰도 ${district.sampleReliability}</span>
        </button>
      `
      )
      .join("");

    document.querySelectorAll(".district-item").forEach((button) => {
      button.addEventListener("click", () => selectDistrict(button.dataset.code));
    });
  }

  function renderDetail(detail) {
    document.getElementById("detail-name").textContent = detail.name;
    document.getElementById("detail-memo").textContent = detail.memo;
    document.getElementById("detail-grade").textContent = detail.riskGrade;
    document.getElementById("detail-score").textContent = `${detail.riskScore}점`;

    document.getElementById("detail-metrics").innerHTML = [
      ["가격 부담", `${detail.priceBurdenRiskScore}점`],
      ["거래 유동성", `${detail.liquidityRiskScore}점`],
      ["가격 변동성", `${detail.volatilityRiskScore}점`],
      ["상권 과밀", `${detail.competitionRiskScore}점`],
      ["음식업 비중", `${detail.foodStoreSharePct}%`],
      ["행정동당 점포 수", formatNumber(detail.storesPerAdminDong)],
    ]
      .map(
        ([label, value]) => `
      <div class="mini-metric">
        <p>${label}</p>
        <strong>${value}</strong>
      </div>
    `
      )
      .join("");

    document.getElementById("detail-objections").innerHTML = detail.objections.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("detail-summary").textContent = `${detail.riskSummary} / ${detail.archetypeSummary}`;

    const notes = [
      `리스크 유형: ${detail.riskArchetype}`,
      `상위 업종: ${detail.topCategories}`,
      `추천 액션: ${detail.recommendedAction}`,
      `신뢰도: ${detail.sampleReliability}`,
    ];
    if (detail.lowSampleFlag) notes.push("최근 거래 표본이 적어 현장 검증 비중을 높여야 합니다.");
    document.getElementById("detail-notes").innerHTML = notes.map((item) => `<div class="note-pill">${item}</div>`).join("");

    const candidates = detail.replacementCandidates.length
      ? detail.replacementCandidates
      : [{ name: "대체 후보 없음", score: "-", whyBetter: "현재 조건에서는 더 안전한 후보를 찾지 못했습니다." }];
    document.getElementById("replacement-candidates").innerHTML = candidates
      .map(
        (item, index) => `
      <article class="data-card">
        <span class="candidate-rank">대안 ${index + 1}</span>
        <strong>${item.name}</strong>
        <p>${typeof item.score === "number" ? `${item.score}점` : item.score}</p>
        <p>${item.whyBetter}</p>
      </article>
    `
      )
      .join("");

    drawLineChart("price-chart", detail.history, "medianPricePerSqm", "#b14b2d");
    drawLineChart("volume-chart", detail.history, "transactionCount", "#c9983f");
  }

  async function selectDistrict(code) {
    state.selectedCode = code;
    renderDistrictList(document.getElementById("district-search").value);
    if (!state.cache.has(code)) {
      state.cache.set(code, await fetchJson(`/api/districts/${code}`));
    }
    renderDetail(state.cache.get(code));
  }

  try {
    const bootstrap = await fetchJson("/api/bootstrap");
    state.districts = bootstrap.districts;
    state.selectedCode = bootstrap.districts[0]?.code || null;
    bootstrap.topDistricts.forEach((district) => state.cache.set(district.code, district));
    renderDistrictList();
    if (state.selectedCode) await selectDistrict(state.selectedCode);

    document.getElementById("district-search").addEventListener("input", async (event) => {
      const query = event.target.value;
      const visible = filteredDistricts(query);
      if (!visible.find((item) => item.code === state.selectedCode) && visible[0]) {
        await selectDistrict(visible[0].code);
      } else {
        renderDistrictList(query);
      }
    });
  } catch (error) {
    renderError(error);
  }
})();
