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
      {
        label: "거래 원천",
        value: formatNumber(bootstrap.summary.transactionCount, "건"),
        caption: "최근 12개월",
      },
      {
        label: "구 커버리지",
        value: formatNumber(bootstrap.summary.districtCount, "개"),
        caption: "서울 전체",
      },
      {
        label: "행정동 범위",
        value: formatNumber(bootstrap.summary.adminDongCount, "개"),
        caption: "상권 구조 반영",
      },
      {
        label: "저표본 경고",
        value: formatNumber(bootstrap.summary.lowSampleDistrictCount, "개"),
        caption: "신뢰도 플래그",
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

    document.getElementById("module-grid").innerHTML = content.modules
      .slice(0, 3)
      .map(
        (item) => `
      <article class="stack-card compact-stack">
        <span class="metric-pill">Action</span>
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
  } catch (error) {
    renderError(error);
  }
})();
