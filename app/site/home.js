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

  const districts = [...(payload.districts || [])].sort((left, right) => Number(right.riskScore || 0) - Number(left.riskScore || 0));
  const summary = payload.summary || {};
  const content = payload.content || {};
  const caseStudies = payload.caseStudies || [];
  const highestRiskDistrict =
    districts.find((item) => item.name === summary?.highestRiskDistrict?.name) || districts[0] || null;

  const entries = [
    {
      index: "01",
      title: "내 매물 검토",
      body: "검토 중인 매물 하나를 잡고, 구와 가격을 기준으로 바로 메모를 남깁니다.",
      meta: "매물명, 구, 가격 입력",
      href: "./review.html",
      label: "매물 검토 페이지 열기",
    },
    {
      index: "02",
      title: "3분 진단",
      body: "구와 희망 보유 기간만 넣고, 지금 보류해야 하는지 빠르게 확인합니다.",
      meta: "판정, 리스크 유형, 체크리스트",
      href: "./assessment.html",
      label: "3분 진단 시작하기",
    },
    {
      index: "03",
      title: "후보 비교",
      body: "비슷한 후보를 같은 기준선에서 놓고 더 나은 대안을 고릅니다.",
      meta: "점수 차이, 대체 후보 탐색",
      href: "./compare.html",
      label: "후보 비교 화면 열기",
    },
  ];

  function renderHero() {
    if (!highestRiskDistrict) return;

    document.getElementById("hero-description").textContent =
      "서울 소형 상가 매입 전에 가격 부담, 거래 둔화, 변동성, 상권 과밀 신호를 먼저 확인하는 간결한 진입 화면입니다.";
    document.getElementById("hero-caveat").textContent = `${payload.site.timeCaveat} ${payload.site.sampleCaveat}`;

    document.getElementById("hero-facts").innerHTML = [
      ["거래 원천", formatNumber(summary.transactionCount, "건")],
      ["비교 구", formatNumber(summary.districtCount, "개")],
      ["행정동", formatNumber(summary.adminDongCount, "개")],
    ]
      .map(
        ([label, value]) => `
          <div>
            <dt>${label}</dt>
            <dd>${value}</dd>
          </div>
        `
      )
      .join("");

    document.getElementById("hero-preview-name").textContent = highestRiskDistrict.name;
    document.getElementById("hero-preview-type").textContent = highestRiskDistrict.riskArchetype;
    document.getElementById("hero-preview-grade").textContent = highestRiskDistrict.riskGrade;
    document.getElementById("hero-preview-grade").className = `signal-pill ${riskTone(highestRiskDistrict.riskScore)}`;
    document.getElementById("hero-preview-score").textContent = formatNumber(highestRiskDistrict.riskScore, "점");
    document.getElementById("hero-preview-summary").textContent = highestRiskDistrict.riskSummary;
    document.getElementById("hero-preview-list").innerHTML = (highestRiskDistrict.objections || [])
      .slice(0, 3)
      .map((item) => `<li>${item}</li>`)
      .join("");

    drawLineChart("hero-preview-chart", highestRiskDistrict.history || [], "medianPricePerSqm", "#c43f27");
  }

  function renderEntries() {
    document.getElementById("entry-grid").innerHTML = entries
      .map(
        (item) => `
          <article class="homepage-entry">
            <span class="homepage-entry-index">${item.index}</span>
            <div>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </div>
            <div class="homepage-entry-meta">
              <span>${item.meta}</span>
              <a href="${item.href}">${item.label}</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderReport() {
    document.getElementById("report-description").textContent =
      "홈에서는 전체 정의를 펼치지 않고, 신뢰 신호와 지금 먼저 볼 구만 짧게 보여줍니다.";

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

    document.getElementById("district-brief-list").innerHTML = districts
      .slice(0, 3)
      .map(
        (item) => `
          <article class="district-brief-item">
            <div>
              <strong>${item.name}</strong>
              <p>${item.riskArchetype}</p>
            </div>
            <span>${formatNumber(item.riskScore, "점")}</span>
          </article>
        `
      )
      .join("");

    const sources = (content.dataSources || []).slice(0, 2);
    document.getElementById("source-note").textContent = sources
      .map((item) => `${item.name} ${item.window}`)
      .join(" / ");
  }

  function renderFeature() {
    const feature = caseStudies[0] || highestRiskDistrict;
    const recent = loadReviews()[0];
    if (!feature) return;

    document.getElementById("feature-kicker").textContent = feature.latestMonth || payload.site.latestMonth || "Current";
    document.getElementById("feature-title").textContent = `${feature.name}에서 먼저 보이는 신호`;
    document.getElementById("feature-body").textContent =
      feature.memo ||
      `${feature.riskArchetype} 유형으로 분류됐고, 가장 먼저 확인할 항목은 ${feature.objections?.[0] || feature.riskSummary} 입니다.`;

    document.getElementById("recent-review").innerHTML = recent
      ? `
          <strong>${recent.assetName}</strong>
          <p>${recent.districtName} · ${recent.verdict}</p>
          <p>${formatNumber(recent.customRiskScore, "점")} · ${recent.riskArchetype}</p>
        `
      : `
          <strong>아직 저장된 검토가 없습니다.</strong>
          <p>매물 검토에서 저장한 메모가 여기에 가장 최근 순서로 표시됩니다.</p>
        `;
  }

  renderHero();
  renderEntries();
  renderReport();
  renderFeature();
})();
