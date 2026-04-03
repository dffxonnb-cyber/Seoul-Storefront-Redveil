(async function () {
  const { fetchJson, formatNumber, formatDateTime, renderError } = window.SiteApi;

  const copy = {
    thesis: {
      headline: "좋아 보이는 이유보다, 멈춰야 할 신호를 먼저 봅니다.",
      body: "매입 전 핵심 리스크를 빠르게 거르는 판단 도구입니다.",
    },
    northStar: {
      title: "잘못된 매입을 줄이는 첫 필터",
      body: "추천보다 보류 판단을 더 빠르게 만드는 것이 목표입니다.",
    },
    modules: [
      { title: "내 매물 검토", body: "매물 기준으로 바로 저장" },
      { title: "3분 진단", body: "빠른 보류 신호 확인" },
      { title: "후보 비교", body: "같은 예산 안의 대안 탐색" },
    ],
    personas: [
      { title: "개인 투자자", body: "현장 방문 전 1차 판단이 필요한 사용자" },
      { title: "중개 실무자", body: "반대 근거와 대체 구를 함께 봐야 하는 사용자" },
      { title: "분석형 의사결정자", body: "숫자를 빠르게 판단으로 연결하려는 사용자" },
    ],
    stages: [
      { title: "1차 필터", body: "보류인지 비교인지 먼저 판단" },
      { title: "현장 검증", body: "체크리스트로 다시 확인" },
      { title: "대체 검토", body: "더 안전한 구와 비교" },
      { title: "최종 메모", body: "결론과 다음 행동 저장" },
    ],
    trust: [],
    faq: [
      { q: "좋은 구를 추천해주나요?", a: "아니요. 먼저 멈춰야 할 이유를 보여줍니다." },
      { q: "이 점수가 수익률을 보장하나요?", a: "아니요. 1차 판단용 필터입니다." },
      { q: "데이터 시점이 완전히 같나요?", a: "아니요. 시점 차이는 각 화면에서 함께 표시합니다." },
    ],
  };

  try {
    const [bootstrap, reviews] = await Promise.all([fetchJson("/api/bootstrap"), fetchJson("/api/reviews")]);

    copy.trust = [
      { title: "실거래 기반", body: `${bootstrap.summary.transactionCount.toLocaleString("ko-KR")}건 반영` },
      { title: "구 전체 비교", body: `${bootstrap.summary.districtCount}개 구 커버` },
      { title: "행정동 반영", body: `${bootstrap.summary.adminDongCount}개 범위` },
      { title: "저표본 경고", body: `${bootstrap.summary.lowSampleDistrictCount}개 구 표시` },
    ];

    document.getElementById("hero-title").textContent = bootstrap.site.title;
    document.getElementById("hero-subtitle").textContent = bootstrap.site.subtitle;
    document.getElementById("hero-highest-name").textContent = bootstrap.summary.highestRiskDistrict.name;
    document.getElementById("hero-highest-score").textContent =
      `${bootstrap.summary.highestRiskDistrict.score}점 · ${bootstrap.summary.highestRiskDistrict.grade}`;
    document.getElementById("hero-transaction-count").textContent = formatNumber(
      bootstrap.summary.transactionCount,
      "건"
    );
    document.getElementById("hero-case-count").textContent = formatNumber(
      bootstrap.summary.caseStudyCount,
      "개"
    );
    document.getElementById("hero-primary-cta").textContent = bootstrap.site.primaryCta.label;
    document.getElementById("hero-primary-cta").setAttribute("href", bootstrap.site.primaryCta.href);
    document.getElementById("hero-secondary-cta").textContent = bootstrap.site.secondaryCta.label;
    document.getElementById("hero-secondary-cta").setAttribute("href", bootstrap.site.secondaryCta.href);

    document.getElementById("summary-grid").innerHTML = [
      ["거래 원천", formatNumber(bootstrap.summary.transactionCount, "건"), "최근 12개월"],
      ["구 커버리지", formatNumber(bootstrap.summary.districtCount, "개"), "서울 전체"],
      ["행정동 범위", formatNumber(bootstrap.summary.adminDongCount, "개"), "상권 구조 반영"],
      ["케이스", formatNumber(bootstrap.summary.caseStudyCount, "개"), "상위 위험 구 해석"],
    ]
      .map(
        ([label, value, caption]) => `
      <article class="section-card compact-stack">
        <span class="metric-pill">${label}</span>
        <strong class="metric-value">${value}</strong>
        <p>${caption}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("thesis-headline").textContent = copy.thesis.headline;
    document.getElementById("thesis-body").textContent = copy.thesis.body;
    document.getElementById("northstar-title").textContent = copy.northStar.title;
    document.getElementById("northstar-body").textContent = copy.northStar.body;

    document.getElementById("module-grid").innerHTML = copy.modules
      .map(
        (item) => `
      <article class="stack-card compact-stack">
        <span class="metric-pill">Module</span>
        <strong>${item.title}</strong>
        <p>${item.body}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("persona-grid").innerHTML = copy.personas
      .map(
        (item) => `
      <article class="stack-card compact-stack">
        <strong>${item.title}</strong>
        <p>${item.body}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("decision-stage-grid").innerHTML = copy.stages
      .map(
        (item) => `
      <article class="journey-step compact-stack">
        <span class="candidate-rank">${item.title}</span>
        <p>${item.body}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("archetype-grid").innerHTML = bootstrap.archetypes
      .map(
        (item) => `
      <article class="data-card compact-stack">
        <span class="metric-pill">${item.count}개 구</span>
        <strong>${item.name}</strong>
        <p>${item.description}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("trust-grid").innerHTML = copy.trust
      .map(
        (item) => `
      <article class="stack-card compact-stack">
        <strong>${item.title}</strong>
        <p>${item.body}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("leaderboard-grid").innerHTML = bootstrap.topDistricts
      .map(
        (item, index) => `
      <article class="leaderboard-card compact-stack">
        <span class="candidate-rank">#${index + 1}</span>
        <strong>${item.name}</strong>
        <p>${item.riskScore}점 · ${item.riskGrade}</p>
        <p>${item.riskArchetype}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("recent-reviews").innerHTML =
      reviews.length > 0
        ? reviews
            .slice(0, 3)
            .map(
              (item) => `
          <article class="review-card compact-stack">
            <strong>${item.assetName}</strong>
            <p>${item.districtName} · ${item.verdict}</p>
            <p>${item.customRiskScore}점 · ${item.riskArchetype}</p>
            <p>${formatDateTime(item.createdAt)}</p>
          </article>
        `
            )
            .join("")
        : `
          <article class="empty-card compact-stack">
            <strong>아직 저장한 검토가 없습니다.</strong>
            <p>내 매물 검토에서 첫 번째 판단을 저장해보세요.</p>
          </article>
        `;

    document.getElementById("faq-list").innerHTML = copy.faq
      .map(
        (item) => `
      <article class="faq-item compact-stack">
        <strong>${item.q}</strong>
        <p>${item.a}</p>
      </article>
    `
      )
      .join("");
  } catch (error) {
    renderError(error);
  }
})();
