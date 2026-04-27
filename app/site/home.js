(function () {
  const { payload, formatNumber, riskTone, loadReviews, drawLineChart } = window.RedveilV2 || {};

  if (!payload) {
    document.body.innerHTML = `
      <main style="padding:40px;color:#1f1714;background:#fbf8f4;font-family:'Wanted Sans Variable','Wanted Sans','SUIT','Pretendard','Noto Sans KR',system-ui,-apple-system,BlinkMacSystemFont,sans-serif">
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
  const featuredCaseStudy =
    caseStudies.find((item) => item.name === highestRiskDistrict?.name) || caseStudies[0] || highestRiskDistrict;

  const objectionCopyMap = new Map([
    ["같은 권역 대비 매입 가격 부담이 큽니다", "같은 권역 대비 매입가 부담이 큽니다."],
    ["상권 내 점포 과밀도가 높습니다", "상권 내 점포 과밀도가 높습니다."],
    ["최근 실거래 가격 변동성이 큽니다", "최근 실거래 가격 변동성이 확대됐습니다."],
  ]);

  function polishObjection(text) {
    if (!text) return "";
    const normalized = objectionCopyMap.get(text) || text;
    return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
  }

  const entries = [
    {
      index: "01",
      title: "내 매물 검토",
      body: "검토 중인 매물 하나를 잡고, 구와 가격을 기준으로 바로 메모를 남깁니다.",
      input: "매물명, 구, 희망 가격",
      output: "리스크 점수, 보류 메모, 저장 기록",
      href: "./review.html",
      actionLabel: "바로 검토하기",
    },
    {
      index: "02",
      title: "3분 진단",
      body: "구와 희망 보유 기간만 넣고, 지금 보류해야 하는지 빠르게 확인합니다.",
      input: "구, 평당가, 보유 기간",
      output: "즉시 판정, 리스크 유형, 체크리스트",
      href: "./assessment.html",
      actionLabel: "3분 진단하기",
    },
    {
      index: "03",
      title: "후보 비교",
      body: "비슷한 후보를 같은 기준선에서 놓고 더 나은 대안을 고릅니다.",
      input: "후보 2~3개 선택",
      output: "점수 차이, 대체 후보, 비교 메모",
      href: "./compare.html",
      actionLabel: "후보 비교하기",
    },
  ];

  const evidenceAxes = [
    {
      index: "01",
      title: "가격 부담",
      body: "같은 권역 대비 매입가 수준을 비교합니다.",
    },
    {
      index: "02",
      title: "거래 유동성",
      body: "최근 거래량 변화와 표본 두께를 함께 봅니다.",
    },
    {
      index: "03",
      title: "상권 과밀",
      body: "점포 밀도와 경쟁 압박을 확인합니다.",
    },
    {
      index: "04",
      title: "가격 변동성",
      body: "최근 체결가 흐름의 흔들림을 확인합니다.",
    },
  ];

  function renderHero() {
    if (!highestRiskDistrict) return;

    const chartType = document.getElementById("hero-preview-type");
    const chartSvg = document.getElementById("hero-preview-chart");
    const polishedObjections = (highestRiskDistrict.objections || []).slice(0, 3).map(polishObjection);

    document.getElementById("hero-description").innerHTML =
      '서울 소형 상가 매입 전, 가격 부담·거래 둔화·상권 과밀 신호를 먼저 확인해 <br class="hero-description-break" />보류 여부와 추가 검토 지점을 정리합니다.';
    document.getElementById("hero-caveat").innerHTML = `
      <span class="homepage-footnote-label">데이터 기준</span>
      <p>거래 데이터는 2025.04~2026.03, 상권 수요 데이터는 2024 스냅샷입니다. 최근 거래 표본이 적은 구는 신뢰도 경고를 함께 표시합니다.</p>
    `;

    document.getElementById("hero-facts").innerHTML = [
      ["상가 실거래", formatNumber(summary.transactionCount, "건")],
      ["분석 구역", `${formatNumber(summary.districtCount, "개")} 구`],
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

    document.getElementById("hero-impact-strip").innerHTML = [
      {
        title: "이번 달 리스크 상승 1위",
        value: highestRiskDistrict.name,
        detail: `${formatNumber(highestRiskDistrict.riskScore, "점")} · 가격 부담·상권 과밀 동시 상승`,
      },
      {
        title: "최근 6개월 거래량 감소율",
        value: formatNumber(Math.abs(Number(featuredCaseStudy?.sixMonthTransactionChangePct || 0)), "%"),
        detail: `${featuredCaseStudy?.name || highestRiskDistrict.name} 기준, 거래 유동성 약화 신호`,
      },
    ]
      .map(
        (item) => `
          <article class="impact-card">
            <span>${item.title}</span>
            <strong>${item.value}</strong>
            <p>${item.detail}</p>
          </article>
        `
      )
      .join("");

    document.getElementById("hero-preview-name").textContent = highestRiskDistrict.name;
    chartType.textContent = highestRiskDistrict.riskArchetype;
    chartType.title = "가격 상승 신호가 거래 회복보다 먼저 나타난 유형";
    chartType.setAttribute(
      "aria-label",
      `${highestRiskDistrict.riskArchetype}: 가격 상승 신호가 거래 회복보다 먼저 나타난 유형`
    );
    document.getElementById("hero-preview-grade").textContent = highestRiskDistrict.riskGrade;
    document.getElementById("hero-preview-grade").className = `signal-pill ${riskTone(highestRiskDistrict.riskScore)}`;
    document.getElementById("hero-preview-score").textContent = formatNumber(highestRiskDistrict.riskScore, "점");
    document.getElementById("hero-preview-summary").textContent = `가격 부담 ${formatNumber(
      highestRiskDistrict.priceBurdenRiskScore,
      "점"
    )}, 상권 과밀 ${formatNumber(highestRiskDistrict.competitionRiskScore, "점")}. 같은 권역 대비 매입가 부담이 크고, 최근 가격 변동성도 확대되어 체결가 재확인이 필요합니다.`;
    document.getElementById("hero-preview-list").innerHTML = polishedObjections.map((item) => `<li>${item}</li>`).join("");

    chartSvg.setAttribute("aria-label", `${highestRiskDistrict.name} 최근 ㎡당 거래가 흐름`);

    drawLineChart("hero-preview-chart", highestRiskDistrict.history || [], "medianPricePerSqm", "#c43f27");
  }

  function renderEntries() {
    document.getElementById("entry-grid").innerHTML = entries
      .map(
        (item) => `
          <a class="homepage-entry homepage-entry-card" href="${item.href}" aria-label="${item.title} 페이지 열기">
            <span class="homepage-entry-index">${item.index}</span>
            <div class="homepage-entry-head">
              <h3>${item.title}</h3>
              <span class="homepage-entry-arrow" aria-hidden="true">→</span>
            </div>
            <p class="homepage-entry-body">${item.body}</p>
            <div class="entry-chip-list">
              <span class="entry-chip"><strong>입력</strong>${item.input}</span>
              <span class="entry-chip"><strong>출력</strong>${item.output}</span>
            </div>
            <span class="homepage-entry-linkline">${item.actionLabel}</span>
          </a>
        `
      )
      .join("");
  }

  function renderReport() {
    const topFactors = [
      ["가격 부담", Number(highestRiskDistrict?.priceBurdenRiskScore || 0)],
      ["거래 둔화", Number(highestRiskDistrict?.transactionRiskScore || 0)],
      ["유동성", Number(highestRiskDistrict?.liquidityRiskScore || 0)],
      ["변동성", Number(highestRiskDistrict?.volatilityRiskScore || 0)],
      ["상권 과밀", Number(highestRiskDistrict?.competitionRiskScore || 0)],
    ].sort((left, right) => right[1] - left[1]);

    document.getElementById("report-description").textContent =
      "대표 구의 점수 근거와 표본 범위를 먼저 보고, 자세한 계산 기준은 뒤에서 확인할 수 있습니다.";

    document.getElementById("validation-lead").textContent = `${highestRiskDistrict.name}는 ${topFactors
      .slice(0, 3)
      .map(([label, score]) => `${label} ${formatNumber(score, "점")}`)
      .join(", ")}이 겹쳐 총 ${formatNumber(highestRiskDistrict.riskScore, "점")}으로 계산됩니다.`;

    document.getElementById("evidence-axis-grid").innerHTML = evidenceAxes
      .map(
        (item) => `
          <article class="evidence-axis-card">
            <span class="evidence-axis-index">${item.index}</span>
            <strong>${item.title}</strong>
            <p>${item.body}</p>
          </article>
        `
      )
      .join("");

    document.getElementById("validation-grid").innerHTML = [
      {
        title: "표본 범위",
        body: `최근 거래 ${formatNumber(summary.transactionCount, "건")}과 ${formatNumber(summary.adminDongCount, "개")} 행정동을 함께 봅니다.`,
      },
      {
        title: "저표본 경고",
        body: `${formatNumber(summary.lowSampleDistrictCount, "개")} 구는 표본이 얇다고 별도 경고를 남깁니다.`,
      },
      {
        title: "사례 확인",
        body: `${formatNumber(summary.caseStudyCount, "개")} 사례에 최근 거래 변화와 현장 체크 항목을 같이 붙였습니다.`,
      },
    ]
      .map(
        (item) => `
          <article class="validation-card">
            <strong>${item.title}</strong>
            <p>${item.body}</p>
          </article>
        `
      )
      .join("");

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

    document.getElementById("score-breakdown").innerHTML = topFactors
      .slice(0, 3)
      .map(
        ([label, score]) => `
          <div class="score-row">
            <span>${label}</span>
            <strong>${formatNumber(score, "점")}</strong>
          </div>
        `
      )
      .join("");

    const sources = (content.dataSources || []).slice(0, 2).map((item) => `${item.name} ${item.window}`).join(" / ");
    document.getElementById("source-note").innerHTML = `
      <div class="source-note-row">
        <span>거래 데이터</span>
        <strong>2025.04~2026.03</strong>
      </div>
      <div class="source-note-row">
        <span>상권 수요 데이터</span>
        <strong>2024 스냅샷</strong>
      </div>
      <div class="source-note-row">
        <span>신뢰도 안내</span>
        <strong>표본이 적은 구는 경고 표시</strong>
      </div>
      ${sources ? `<p class="source-note-meta">${sources}</p>` : ""}
    `;
  }

  function renderFeature() {
    const feature = caseStudies[0] || highestRiskDistrict;
    const recent = loadReviews()[0];
    if (!feature) return;

    document.getElementById("feature-kicker").textContent = feature.latestMonth || payload.site.latestMonth || "Current";
    document.getElementById("feature-title").textContent = `${feature.name}에서 먼저 보이는 신호`;
    document.getElementById("feature-body").textContent =
      feature.memo ||
      `${feature.riskArchetype} 유형으로 분류됐고, 최근 6개월 가격은 ${formatNumber(feature.sixMonthPriceChangePct, "%")} 움직였고 거래는 ${formatNumber(feature.sixMonthTransactionChangePct, "%")} 변했습니다. 가장 먼저 확인할 항목은 ${feature.objections?.[0] || feature.riskSummary} 입니다.`;

    document.getElementById("recent-review").innerHTML = recent
      ? `
          <div class="review-note">
            <strong>${recent.assetName}</strong>
            <p>${recent.districtName} · ${recent.verdict}</p>
            <p>${formatNumber(recent.customRiskScore, "점")} · ${recent.riskArchetype}</p>
          </div>
        `
      : `
          <div class="review-empty">
            <strong>아직 저장된 검토 메모가 없습니다.</strong>
            <p>매물 검토에서 첫 메모를 남겨보세요.</p>
          </div>
        `;
  }

  renderHero();
  renderEntries();
  renderReport();
  renderFeature();
})();
