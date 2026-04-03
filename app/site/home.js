(async function () {
  const { fetchJson, formatNumber, formatDateTime, renderError } = window.SiteApi;

  try {
    const [bootstrap, content, reviews] = await Promise.all([
      fetchJson("/api/bootstrap"),
      fetchJson("/api/content"),
      fetchJson("/api/reviews"),
    ]);

    document.getElementById("hero-title").textContent = bootstrap.site.title;
    document.getElementById("hero-subtitle").textContent = bootstrap.site.subtitle;
    document.getElementById("hero-highest-name").textContent = bootstrap.summary.highestRiskDistrict.name;
    document.getElementById("hero-highest-score").textContent =
      `${bootstrap.summary.highestRiskDistrict.score}점 · ${bootstrap.summary.highestRiskDistrict.grade}`;
    document.getElementById("hero-caveat").textContent =
      `${bootstrap.site.timeCaveat} ${bootstrap.site.sampleCaveat}`;
    document.getElementById("hero-primary-cta").textContent = bootstrap.site.primaryCta.label;
    document.getElementById("hero-primary-cta").setAttribute("href", bootstrap.site.primaryCta.href);
    document.getElementById("hero-secondary-cta").textContent = bootstrap.site.secondaryCta.label;
    document.getElementById("hero-secondary-cta").setAttribute("href", bootstrap.site.secondaryCta.href);

    document.getElementById("summary-grid").innerHTML = [
      {
        label: "실거래 원천 건수",
        value: formatNumber(bootstrap.summary.transactionCount, "건"),
        caption: `${bootstrap.summary.latestMonth} 기준 최근 12개월`,
      },
      {
        label: "구 커버리지",
        value: formatNumber(bootstrap.summary.districtCount, "개"),
        caption: "서울 25개 구 전수 분석",
      },
      {
        label: "행정동 커버리지",
        value: formatNumber(bootstrap.summary.adminDongCount, "개"),
        caption: "상권 과밀도 참고 단위",
      },
      {
        label: "케이스 스터디",
        value: formatNumber(bootstrap.summary.caseStudyCount, "개"),
        caption: "상위 위험 구 심층 해석",
      },
    ]
      .map(
        (item) => `
      <article class="section-card">
        <span class="metric-pill">${item.label}</span>
        <strong class="metric-value">${item.value}</strong>
        <p>${item.caption}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("thesis-headline").textContent = content.thesis.headline;
    document.getElementById("thesis-body").textContent = content.thesis.body;
    document.getElementById("northstar-title").textContent = content.northStar.title;
    document.getElementById("northstar-body").textContent = content.northStar.body;

    document.getElementById("module-grid").innerHTML = content.modules
      .map(
        (item) => `
      <article class="stack-card">
        <span class="metric-pill">Module</span>
        <strong>${item.title}</strong>
        <p>${item.body}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("persona-grid").innerHTML = content.personas
      .map(
        (item) => `
      <article class="stack-card">
        <strong>${item.title}</strong>
        <p>${item.description}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("decision-stage-grid").innerHTML = content.decisionStages
      .map(
        (item) => `
      <article class="journey-step">
        <span class="candidate-rank">${item.title}</span>
        <p>${item.body}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("archetype-grid").innerHTML = bootstrap.archetypes
      .map(
        (item) => `
      <article class="data-card">
        <span class="metric-pill">${item.count}개 구</span>
        <strong>${item.name}</strong>
        <p>${item.description}</p>
        <p class="chip-row">${item.examples.map((name) => `<span class="mini-chip">${name}</span>`).join("")}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("trust-grid").innerHTML = content.trustSignals
      .map(
        (item) => `
      <article class="stack-card">
        <strong>${item.title}</strong>
        <p>${item.body}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("leaderboard-grid").innerHTML = bootstrap.topDistricts
      .map(
        (item, index) => `
      <article class="leaderboard-card">
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
          <article class="review-card compact">
            <strong>${item.assetName}</strong>
            <p>${item.districtName} · ${item.verdict}</p>
            <p>${item.customRiskScore}점 · ${item.riskArchetype}</p>
            <p>${formatDateTime(item.createdAt)}</p>
          </article>
        `
            )
            .join("")
        : `
          <article class="empty-card">
            <strong>아직 저장된 매물 검토가 없습니다.</strong>
            <p>내 매물 검토 페이지에서 첫 번째 검토를 저장해 보세요.</p>
          </article>
        `;

    document.getElementById("faq-list").innerHTML = content.faq
      .map(
        (item) => `
      <article class="faq-item">
        <strong>${item.question}</strong>
        <p>${item.answer}</p>
      </article>
    `
      )
      .join("");
  } catch (error) {
    renderError(error);
  }
})();
