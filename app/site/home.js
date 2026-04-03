(function () {
  const { payload, formatNumber, riskTone, loadReviews, drawLineChart } = window.RedveilV2 || {};

  if (!payload) {
    document.body.innerHTML = `
      <main style="padding:40px;color:#1f1714;background:#fbf8f4;font-family:'IBM Plex Sans KR',sans-serif">
        <h1>payload를 불러오지 못했습니다.</h1>
        <p><code>./website_payload.js</code> 경로가 유효한지 확인하세요.</p>
      </main>
    `;
    return;
  }

  const districts = payload.districts || [];
  const summary = payload.summary || {};
  const content = payload.content || {};
  const caseStudies = payload.caseStudies || [];
  const highestRiskDistrict =
    districts.find((item) => item.name === summary?.highestRiskDistrict?.name) || districts[0] || null;

  const entries = [
    {
      title: "내 매물 검토",
      body: "검토 중인 매물을 저장하고 메모를 남깁니다.",
      meta: "매물명, 구, 가격 입력",
      href: "./review.html",
      label: "검토 시작",
    },
    {
      title: "3분 진단",
      body: "구와 가격선으로 빠른 보류 신호를 봅니다.",
      meta: "판정, 유형, 체크리스트",
      href: "./assessment.html",
      label: "빠른 진단",
    },
    {
      title: "후보 비교",
      body: "대체 후보를 같은 기준으로 비교합니다.",
      meta: "점수 차이와 대안 탐색",
      href: "./compare.html",
      label: "후보 비교",
    },
  ];

  function renderHero() {
    if (!highestRiskDistrict) return;

    document.getElementById("hero-description").textContent =
      "서울 소형 상가 매입 전에 가격 부담, 거래 둔화, 상권 과밀 신호를 먼저 보여주는 판단용 홈페이지입니다.";
    document.getElementById("hero-caveat").textContent =
      `${payload.site.timeCaveat} ${payload.site.sampleCaveat}`;

    document.getElementById("hero-preview-name").textContent = highestRiskDistrict.name;
    document.getElementById("hero-preview-type").textContent = highestRiskDistrict.riskArchetype;
    document.getElementById("hero-preview-grade").textContent = highestRiskDistrict.riskGrade;
    document.getElementById("hero-preview-grade").className = `signal-pill ${riskTone(highestRiskDistrict.riskScore)}`;
    document.getElementById("hero-preview-score").textContent = `${formatNumber(highestRiskDistrict.riskScore, "점")} / ${highestRiskDistrict.riskArchetype}`;
    document.getElementById("hero-preview-summary").textContent = highestRiskDistrict.riskSummary;
    document.getElementById("hero-preview-list").innerHTML = (highestRiskDistrict.objections || [])
      .slice(0, 3)
      .map((item) => `<li>${item}</li>`)
      .join("");

    drawLineChart("hero-preview-chart", highestRiskDistrict.history || [], "medianPricePerSqm", "#c43f27");
  }

  function renderMetrics() {
    document.getElementById("hero-metrics").innerHTML = [
      ["거래 원천", formatNumber(summary.transactionCount, "건")],
      ["비교 구", formatNumber(summary.districtCount, "개")],
      ["행정동", formatNumber(summary.adminDongCount, "개")],
      ["상권 범위", formatNumber(summary.tradeAreaCount, "개")],
    ]
      .map(
        ([label, value]) => `
          <div class="stat-line">
            <span>${label}</span>
            <strong>${value}</strong>
          </div>
        `
      )
      .join("");
  }

  function renderEntries() {
    document.getElementById("entry-grid").innerHTML = entries
      .map(
        (item) => `
          <article class="entry-block">
            <h3>${item.title}</h3>
            <p>${item.body}</p>
            <span>${item.meta}</span>
            <a href="${item.href}">${item.label}</a>
          </article>
        `
      )
      .join("");
  }

  function renderReport() {
    document.getElementById("report-description").textContent =
      "전체 데이터는 뒤쪽에서 짧은 리포트처럼 읽게 구성했습니다. 상위 위험 구와 데이터 범위를 먼저 훑고, 필요할 때 세부 페이지로 이동하면 됩니다.";

    document.getElementById("evidence-list").innerHTML = (content.trustSignals || [])
      .slice(0, 3)
      .map(
        (item) => `
          <article>
            <strong>${item.title}</strong>
            <p>${item.body}</p>
          </article>
        `
      )
      .join("");

    document.getElementById("source-list").innerHTML = (content.dataSources || [])
      .slice(0, 3)
      .map(
        (item) => `
          <div>
            <span>${item.name}</span>
            <p>${item.window} · ${item.role}</p>
          </div>
        `
      )
      .join("");

    document.getElementById("district-table-body").innerHTML = districts
      .slice(0, 5)
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${formatNumber(item.riskScore, "점")}</td>
            <td>${item.riskArchetype}</td>
            <td>${(item.objections || [item.riskSummary])[0]}</td>
          </tr>
        `
      )
      .join("");
  }

  function renderFeature() {
    const feature = caseStudies[0] || highestRiskDistrict;
    const recent = loadReviews()[0];
    if (!feature) return;

    document.getElementById("feature-kicker").textContent = feature.latestMonth || "Sample Note";
    document.getElementById("feature-title").textContent = `${feature.name} · ${feature.riskArchetype}`;
    document.getElementById("feature-body").textContent = feature.memo || feature.riskSummary;
    document.getElementById("feature-chips").innerHTML = [
      `총 리스크 ${formatNumber(feature.riskScore, "점")}`,
      feature.riskGrade || "",
      feature.replacementCandidates?.[0]?.name ? `대체 후보 ${feature.replacementCandidates[0].name}` : "",
    ]
      .filter(Boolean)
      .map((item) => `<span>${item}</span>`)
      .join("");

    document.getElementById("recent-review").innerHTML = recent
      ? `
          <strong>${recent.assetName}</strong>
          <p>${recent.districtName} · ${recent.verdict}</p>
          <p>${formatNumber(recent.customRiskScore, "점")} · ${recent.riskArchetype}</p>
        `
      : `
          <strong>아직 저장된 검토가 없습니다.</strong>
          <p>매물 검토를 저장하면 최근 메모가 여기에 표시됩니다.</p>
        `;
  }

  renderHero();
  renderMetrics();
  renderEntries();
  renderReport();
  renderFeature();
})();
