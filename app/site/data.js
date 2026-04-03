(async function () {
  const { fetchJson, formatNumber, renderError } = window.SiteApi;

  const dataSources = [
    { name: "국토교통부 실거래가", role: "가격, 유동성, 변동성 계산", window: "2025.04~2026.03" },
    { name: "서울시 상권분석서비스", role: "수요와 매출 구조 확인", window: "2024" },
    { name: "소상공인 상가 정보", role: "행정동 점포 구조 반영", window: "2025.12 파일" },
  ];
  const faq = [
    { q: "좋은 구를 추천해주나요?", a: "아니요. 먼저 멈춰야 할 이유를 보여줍니다." },
    { q: "점수가 수익률을 보장하나요?", a: "아니요. 1차 판단용 필터입니다." },
    { q: "데이터 시점이 모두 같나요?", a: "아니요. 시점 차이는 함께 표시합니다." },
  ];
  const glossary = [
    { term: "매입 리스크", definition: "가격, 유동성, 변동성, 경쟁을 합친 경고 점수" },
    { term: "저표본 경고", definition: "최신 거래 표본이 적어 신뢰도가 낮은 구" },
    { term: "대체 후보", definition: "같은 프레임에서 더 안전한 비교 구" },
  ];

  try {
    const summary = await fetchJson("/api/summary");

    document.getElementById("data-source-grid").innerHTML = dataSources
      .map(
        (item) => `
      <article class="section-card compact-stack">
        <span class="data-tag">${item.window}</span>
        <h2>${item.name}</h2>
        <p>${item.role}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("data-summary-grid").innerHTML = [
      ["거래 원천", formatNumber(summary.transactionCount, "건")],
      ["구 커버리지", formatNumber(summary.districtCount, "개")],
      ["행정동 범위", formatNumber(summary.adminDongCount, "개")],
      ["저표본 경고", formatNumber(summary.lowSampleDistrictCount, "개")],
    ]
      .map(
        ([label, value]) => `
      <article class="data-card compact-stack">
        <span class="metric-pill">${label}</span>
        <strong class="metric-value">${value}</strong>
      </article>
    `
      )
      .join("");

    document.getElementById("faq-list").innerHTML = faq
      .map(
        (item) => `
      <article class="faq-item compact-stack">
        <strong>${item.q}</strong>
        <p>${item.a}</p>
      </article>
    `
      )
      .join("");

    document.getElementById("glossary-list").innerHTML = glossary
      .map(
        (item) => `
      <article class="stack-card compact-stack">
        <strong>${item.term}</strong>
        <p>${item.definition}</p>
      </article>
    `
      )
      .join("");
  } catch (error) {
    renderError(error);
  }
})();
