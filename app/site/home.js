(function () {
  const { payload, formatNumber, riskTone, loadReviews, drawLineChart } = window.RedveilV2 || {};

  if (!payload) {
    document.body.innerHTML = `
      <main style="padding:40px;color:#1f1714;background:#fbf8f4;font-family:'SUIT','Pretendard','Noto Sans KR',system-ui,-apple-system,BlinkMacSystemFont,sans-serif">
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
      meta: "매물명, 구, 가격 입력",
      input: "매물명, 구, 희망 가격",
      output: "리스크 점수, 보류 메모, 저장 기록",
      href: "./review.html",
      label: "매물 검토 페이지 열기",
    },
    {
      index: "02",
      title: "3분 진단",
      body: "구와 희망 보유 기간만 넣고, 지금 보류해야 하는지 빠르게 확인합니다.",
      meta: "판정, 리스크 유형, 체크리스트",
      input: "구, 평당가, 보유 기간",
      output: "즉시 판정, 리스크 유형, 체크리스트",
      href: "./assessment.html",
      label: "3분 진단 시작하기",
    },
    {
      index: "03",
      title: "후보 비교",
      body: "비슷한 후보를 같은 기준선에서 놓고 더 나은 대안을 고릅니다.",
      meta: "점수 차이, 대체 후보 탐색",
      input: "후보 2~3개 선택",
      output: "점수 차이, 대체 후보, 비교 메모",
      href: "./compare.html",
      label: "후보 비교 화면 열기",
    },
  ];

  function renderHero() {
    if (!highestRiskDistrict) return;

    const chartType = document.getElementById("hero-preview-type");
    const chartSvg = document.getElementById("hero-preview-chart");
    const polishedObjections = (highestRiskDistrict.objections || []).slice(0, 3).map(polishObjection);

    document.getElementById("hero-description").textContent =
      "서울 소형 상가 매입 전, 가격 부담·거래 둔화·상권 과밀 신호를 먼저 확인해 보류 여부와 추가 검토 지점을 정리합니다.";
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
          <article class="homepage-entry">
            <span class="homepage-entry-index">${item.index}</span>
            <div>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </div>
            <div class="entry-io">
              <p><strong>입력</strong>${item.input}</p>
              <p><strong>출력</strong>${item.output}</p>
            </div>
            <div class="homepage-entry-meta">
              <span>${item.meta}</span>
              <a class="homepage-action-button homepage-entry-link" href="${item.href}">${item.label}</a>
            </div>
          </article>
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
      `${feature.riskArchetype} 유형으로 분류됐고, 최근 6개월 가격은 ${formatNumber(feature.sixMonthPriceChangePct, "%")} 움직였고 거래는 ${formatNumber(feature.sixMonthTransactionChangePct, "%")} 변했습니다. 가장 먼저 확인할 항목은 ${feature.objections?.[0] || feature.riskSummary} 입니다.`;

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
