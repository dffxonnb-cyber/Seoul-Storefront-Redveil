(function () {
  const { payload, formatNumber, riskTone, loadReviews, buildAssessment, drawLineChart } = window.RedveilV2 || {};

  if (!payload) {
    document.body.innerHTML = `
      <main style="padding:40px;color:#f4efe7;background:#08121d;font-family:'IBM Plex Sans KR',sans-serif">
        <h1>payload를 불러오지 못했습니다.</h1>
        <p><code>./website_payload.js</code> 경로가 유효한지 확인하세요.</p>
      </main>
    `;
    return;
  }

  const districts = payload.districts || [];
  const summary = payload.summary || {};
  const content = payload.content || {};
  const methodology = payload.methodology || {};
  const caseStudies = payload.caseStudies || [];
  const highestRiskDistrict =
    districts.find((item) => item.name === summary?.highestRiskDistrict?.name) || districts[0] || null;

  const toolCards = [
    {
      label: "01",
      title: "내 매물 검토",
      description: "검토 중인 상가를 저장하고 리스크 메모를 남기는 메인 진입점입니다.",
      meta: "입력: 매물명, 구, 가격, 보유 기간",
      href: "./review.html",
      linkLabel: "매물 메모 열기",
    },
    {
      label: "02",
      title: "3분 진단",
      description: "구, 가격선, 보유 기간만으로 빠른 보류 신호를 확인합니다.",
      meta: "출력: 보류 여부, 리스크 유형, 체크리스트",
      href: "./assessment.html",
      linkLabel: "빠른 진단 실행",
    },
    {
      label: "03",
      title: "후보 비교",
      description: "같은 예산 안에서 더 안전한 대체 구를 붙여 보는 비교 화면입니다.",
      meta: "출력: 점수 비교, 유형 비교, 대안 탐색",
      href: "./compare.html",
      linkLabel: "대체 구 비교",
    },
    {
      label: "04",
      title: "구별 리포트",
      description: "구 단위 리스크 점수, 추세, 메모를 하나의 리포트로 정리합니다.",
      meta: "출력: 구 리포트, 추세 차트, 메모",
      href: "./districts.html",
      linkLabel: "전체 리포트 보기",
    },
    {
      label: "05",
      title: "케이스 스터디",
      description: "상위 위험 구를 실제 검토 논리와 현장 체크 포인트로 풀어냅니다.",
      meta: "출력: 리스크 해석, 교차 확인 포인트",
      href: "./cases.html",
      linkLabel: "케이스 읽기",
    },
    {
      label: "06",
      title: "방법론과 데이터",
      description: "점수가 어떻게 만들어지고 어디까지 믿어야 하는지 확인합니다.",
      meta: "출력: 모델 축, 데이터 범위, 한계",
      href: "./methodology.html",
      linkLabel: "방법론 보기",
    },
  ];

  function renderHero() {
    document.getElementById("hero-description").textContent =
      "Redveil은 서울 소형 상가 매입 전에 가격 부담, 거래 둔화, 상권 과밀, 변동성 신호를 먼저 보여주는 판단용 웹사이트입니다.";
    document.getElementById("hero-caveat").textContent =
      `${payload.site.timeCaveat} ${payload.site.sampleCaveat}`;

    document.getElementById("hero-metrics").innerHTML = [
      ["거래 원천", formatNumber(summary.transactionCount, "건")],
      ["비교 구", formatNumber(summary.districtCount, "개")],
      ["행정동 반영", formatNumber(summary.adminDongCount, "개")],
      ["상권 범위", formatNumber(summary.tradeAreaCount, "개")],
    ]
      .map(
        ([label, value]) => `
          <article class="metric-card">
            <span>${label}</span>
            <strong>${value}</strong>
          </article>
        `
      )
      .join("");
  }

  function renderTools() {
    document.getElementById("tool-grid").innerHTML = toolCards
      .map(
        (item) => `
          <article class="tool-card">
            <span class="card-label">${item.label}</span>
            <strong>${item.title}</strong>
            <p>${item.description}</p>
            <p class="card-meta">${item.meta}</p>
            <a class="tool-link" href="${item.href}">${item.linkLabel}</a>
          </article>
        `
      )
      .join("");
  }

  function renderArchetypes() {
    document.getElementById("archetype-grid").innerHTML = (payload.archetypes || [])
      .slice(0, 4)
      .map(
        (item) => `
          <article class="archetype-card">
            <span class="card-label">${item.count}개 구</span>
            <strong>${item.name}</strong>
            <p>${item.description}</p>
            <p class="card-meta">예시: ${(item.examples || []).join(", ")}</p>
          </article>
        `
      )
      .join("");
  }

  function renderEvidence() {
    document.getElementById("evidence-grid").innerHTML = (content.trustSignals || [])
      .map(
        (item) => `
          <article class="evidence-card">
            <strong>${item.title}</strong>
            <p>${item.body}</p>
          </article>
        `
      )
      .join("");
  }

  function renderDistricts() {
    document.getElementById("district-grid").innerHTML = districts
      .slice(0, 6)
      .map(
        (item, index) => `
          <article class="district-card">
            <div class="district-score-row">
              <span class="rank-pill">#${index + 1}</span>
              <span class="tone-pill ${riskTone(item.riskScore)}">${item.riskGrade}</span>
            </div>
            <strong>${item.name}</strong>
            <p>${item.riskArchetype}</p>
            <div class="district-meta-row">
              <span class="card-meta">총 리스크</span>
              <strong>${formatNumber(item.riskScore, "점")}</strong>
            </div>
            <div class="risk-bar"><span style="width:${Math.max(8, item.riskScore)}%"></span></div>
            <ul class="district-list">
              ${(item.objections || [])
                .slice(0, 2)
                .map((reason) => `<li>${reason}</li>`)
                .join("")}
            </ul>
          </article>
        `
      )
      .join("");
  }

  function renderCases() {
    document.getElementById("case-grid").innerHTML = caseStudies
      .slice(0, 3)
      .map(
        (item) => `
          <article class="case-card">
            <span class="card-label">${item.riskArchetype}</span>
            <strong>${item.name}</strong>
            <p>${item.riskScore}점 · ${item.riskGrade}</p>
            <p>${item.riskSummary}</p>
            <div class="case-tags">
              <span class="chip">6개월 가격변화 ${formatNumber(item.sixMonthPriceChangePct, "%")}</span>
              <span class="chip">최근 거래 ${formatNumber(item.latestTransactionCount, "건")}</span>
            </div>
            <ul class="case-list">
              ${(item.fieldChecks || [])
                .slice(0, 2)
                .map((check) => `<li>${check}</li>`)
                .join("")}
            </ul>
          </article>
        `
      )
      .join("");
  }

  function renderMemo() {
    const reviews = loadReviews().slice(0, 2);
    if (!highestRiskDistrict) return;

    document.getElementById("memo-card").innerHTML = `
      <span class="card-label">Sample Memo / ${highestRiskDistrict.name}</span>
      <strong>${highestRiskDistrict.riskArchetype}</strong>
      <p>${highestRiskDistrict.memo}</p>
      <div class="memo-chips">
        ${(highestRiskDistrict.replacementCandidates || [])
          .slice(0, 3)
          .map((item) => `<span class="chip">대체 후보 ${item.name}</span>`)
          .join("")}
      </div>
    `;

    document.getElementById("recent-review-grid").innerHTML =
      reviews.length > 0
        ? reviews
            .map(
              (item) => `
                <article class="review-mini">
                  <span class="card-label">Saved Review</span>
                  <strong>${item.assetName}</strong>
                  <p>${item.districtName} · ${item.verdict}</p>
                  <p>${formatNumber(item.customRiskScore, "점")} · ${item.riskArchetype}</p>
                </article>
              `
            )
            .join("")
        : `
          <article class="review-mini">
            <span class="card-label">Saved Review</span>
            <strong>아직 저장된 검토가 없습니다.</strong>
            <p>내 매물 검토에서 결과를 저장하면 여기에도 즉시 반영됩니다.</p>
          </article>
        `;
  }

  function renderEvidenceStack() {
    document.getElementById("source-list").innerHTML = (content.dataSources || [])
      .map(
        (item) => `
          <article class="source-card">
            <span class="card-label">${item.window}</span>
            <strong>${item.name}</strong>
            <p>${item.role}</p>
          </article>
        `
      )
      .join("");

    const principleItems = [
      ...(content.principles || []),
      ...(methodology.pillars || []).map((item) => ({ title: "Model Pillar", body: item })),
    ].slice(0, 6);

    document.getElementById("principle-list").innerHTML = principleItems
      .map(
        (item) => `
          <article class="principle-card">
            <span class="card-label">${item.title}</span>
            <p>${item.body}</p>
          </article>
        `
      )
      .join("");
  }

  function updateSpotlight(districtCode) {
    const district = districts.find((item) => item.code === districtCode) || highestRiskDistrict;
    if (!district) return;

    const spotlightGrade = document.getElementById("spotlight-grade");
    document.getElementById("spotlight-name").textContent = district.name;
    document.getElementById("spotlight-summary").textContent = district.riskArchetype;
    spotlightGrade.textContent = district.riskGrade;
    spotlightGrade.className = `signal-pill ${riskTone(district.riskScore)}`;

    drawLineChart("spotlight-chart", district.history || [], "medianPricePerSqm", "#ff6f49");

    document.getElementById("spotlight-stats").innerHTML = [
      ["총 리스크", formatNumber(district.riskScore, "점")],
      ["가격 부담", formatNumber(district.priceBurdenRiskScore, "점")],
      ["유동성", formatNumber(district.liquidityRiskScore, "점")],
      ["상권 과밀", formatNumber(district.competitionRiskScore, "점")],
    ]
      .map(
        ([label, value]) => `
          <article class="console-stat">
            <span>${label}</span>
            <strong>${value}</strong>
          </article>
        `
      )
      .join("");
  }

  function renderProbeResult(result) {
    const probeResult = document.getElementById("probe-result");
    if (!result) {
      probeResult.innerHTML = `
        <span class="result-label">Simulation</span>
        <h3>결과를 만들 수 없습니다.</h3>
        <p class="result-copy">구를 다시 선택하고 조건을 확인하세요.</p>
      `;
      return;
    }

    const tone = riskTone(result.score);
    probeResult.innerHTML = `
      <div class="result-meta">
        <span class="result-label">Simulation Result</span>
        <span class="tone-pill ${tone}">${result.verdict}</span>
      </div>
      <h3>${result.district.name}</h3>
      <span class="result-score">${formatNumber(result.score, "점")}</span>
      <p class="result-copy">${result.summary}</p>
      <div class="result-grid">
        <div>
          <span class="result-label">왜 멈춰야 하나</span>
          <ul class="result-list">
            ${result.reasons.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        <div>
          <span class="result-label">바로 확인할 것</span>
          <ul class="result-list">
            ${result.checks.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="chip-row">
        ${result.replacements.map((item) => `<span class="chip">대체 후보 ${item.name}</span>`).join("")}
      </div>
    `;
  }

  function bindProbe() {
    const districtSelect = document.getElementById("probe-district");
    districtSelect.innerHTML = districts
      .map((item) => `<option value="${item.code}">${item.name}</option>`)
      .join("");

    const defaultCode = highestRiskDistrict?.code || districts[0]?.code || "";
    districtSelect.value = defaultCode;
    updateSpotlight(defaultCode);
    const initial = buildAssessment({
        districtCode: defaultCode,
        holdingMonths: 36,
        priority: "balanced",
      });
    renderProbeResult(
      initial
        ? {
            district: initial.baseDistrict,
            verdict: initial.verdict,
            score: initial.customRiskScore,
            summary: initial.summary,
            reasons: initial.reasons,
            checks: initial.checks,
            replacements: initial.replacementCandidates,
          }
        : null
    );

    districtSelect.addEventListener("change", () => {
      updateSpotlight(districtSelect.value);
    });

    document.getElementById("probe-form").addEventListener("submit", (event) => {
      event.preventDefault();

      const result = buildAssessment({
        districtCode: districtSelect.value,
        askingPricePerSqm: document.getElementById("probe-price").value,
        holdingMonths: document.getElementById("probe-holding").value,
        priority: document.getElementById("probe-priority").value,
      });

      updateSpotlight(districtSelect.value);
      renderProbeResult(
        result
          ? {
              district: result.baseDistrict,
              verdict: result.verdict,
              score: result.customRiskScore,
              summary: result.summary,
              reasons: result.reasons,
              checks: result.checks,
              replacements: result.replacementCandidates,
            }
          : null
      );
    });
  }

  renderHero();
  renderTools();
  renderArchetypes();
  renderEvidence();
  renderDistricts();
  renderCases();
  renderMemo();
  renderEvidenceStack();
  bindProbe();
})();
