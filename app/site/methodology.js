(function () {
  const { payload } = window.RedveilV2 || {};
  if (!payload) return;

  const { site, content, methodology } = payload;
  const summary = payload.summary || {};
  const caseStudies = payload.caseStudies || [];

  document.getElementById("problem-statement").textContent = `${methodology.problemStatement} ${site.timeCaveat} ${site.sampleCaveat}`;

  function render(target, items, label) {
    document.getElementById(target).innerHTML = items
      .map((item) => {
        if (typeof item === "string") return `<article><strong>${label}</strong><p>${item}</p></article>`;
        if (Array.isArray(item)) return `<article><strong>${item[0]}</strong><p>${item[1]}</p></article>`;
        return `<article><strong>${item.title || item.term}</strong><p>${item.body || item.definition || item.description}</p></article>`;
      })
      .join("");
  }

  const validationItems = [
    {
      title: "표본 범위 점검",
      body: `최근 거래 ${summary.transactionCount.toLocaleString("ko-KR")}건, ${summary.districtCount}개 구, ${summary.adminDongCount}개 행정동, ${summary.tradeAreaCount}개 상권 범위를 함께 봅니다.`,
    },
    {
      title: "저표본 경고 분리",
      body: `표본이 얇은 ${summary.lowSampleDistrictCount}개 구는 동일한 점수라도 신뢰도 경고를 같이 남깁니다.`,
    },
    {
      title: "축별 설명 가능성",
      body: "가격 부담, 거래 유동성, 변동성, 상권 과밀 축을 따로 남겨 왜 이 점수가 나왔는지 분해해서 읽을 수 있게 했습니다.",
    },
    {
      title: "케이스 역검증",
      body: `상위 위험 케이스 ${summary.caseStudyCount}개는 최근 거래 수, 가격 변화, 거래 변화, 현장 체크 항목까지 묶어서 다시 검토합니다.`,
    },
  ];

  const verificationItems = caseStudies.slice(0, 3).map((item) => ({
    title: `${item.name} ${item.riskScore}점 · ${item.riskArchetype}`,
    body: `최근 6개월 가격 ${item.sixMonthPriceChangePct}% 변화, 거래 ${item.sixMonthTransactionChangePct}% 변화. 현장에서는 ${item.fieldChecks?.[0] || "체결 강도와 업종 밀도를 추가 확인"}를 먼저 봅니다.`,
  }));

  render("validation-list", validationItems, "Validation");
  render("verification-list", verificationItems, "Case");
  render("principles-list", content.principles || [], "Principle");
  render("pillars-list", methodology.pillars || [], "Pillar");
  render("outputs-list", methodology.outputs || [], "Output");
  render("blueprint-list", content.serviceBlueprint || [], "Flow");
  render("architecture-list", content.architecture || [], "Architecture");
  render("roadmap-list", content.roadmap || [], "Roadmap");
  render("limitations-list", content.limitations || [], "주의");
  render("glossary-list", content.glossary || [], "용어");
})();
