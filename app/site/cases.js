(function () {
  const { payload, formatNumber, riskTone } = window.RedveilV2 || {};
  if (!payload) return;

  const cases = payload.caseStudies || [];
  document.getElementById("case-count").textContent = `${cases.length}개`;

  document.getElementById("featured-case-list").innerHTML = cases
    .slice(0, 2)
    .map(
      (item) => `
        <article>
          <strong>${item.name} · ${formatNumber(item.riskScore, "점")} · ${item.riskArchetype}</strong>
          <p>최근 6개월 가격 ${formatNumber(item.sixMonthPriceChangePct, "%")} 변화, 거래 ${formatNumber(item.sixMonthTransactionChangePct, "%")} 변화. 핵심 보류 사유는 ${item.objections?.[0] || item.riskSummary} 입니다.</p>
        </article>
      `
    )
    .join("");

  document.getElementById("case-validation-list").innerHTML = [
    {
      title: "숫자와 메모를 함께 확인",
      body: "리스크 점수만 두지 않고 가격 변화, 거래 변화, 반대 근거, 현장 체크를 한 카드 안에 같이 둡니다.",
    },
    {
      title: "대체 후보까지 함께 확인",
      body: "보류 사유만 끝내지 않고, 실제로 다시 볼 만한 대체 구를 함께 붙여 워크플로우를 닫습니다.",
    },
    {
      title: "현장 확인 질문으로 연결",
      body: "체결 강도, 업종 밀도, 이상 거래 구분처럼 현장에서 다시 확인할 질문을 케이스마다 남깁니다.",
    },
  ]
    .map((item) => `<article><strong>${item.title}</strong><p>${item.body}</p></article>`)
    .join("");

  document.getElementById("case-grid").innerHTML = cases
    .map(
      (item) => `
        <article class="panel section-block">
          <div class="section-head">
            <div>
              <p class="section-label">${item.latestMonth}</p>
              <h2>${item.name} · ${item.riskArchetype}</h2>
            </div>
            <span class="signal-pill ${riskTone(item.riskScore)}">${formatNumber(item.riskScore, "점")} · ${item.riskGrade}</span>
          </div>
          <div class="detail-grid">
            <div class="stacked-list">
              <article><strong>요약</strong><p>${item.riskSummary}</p></article>
              <article><strong>최근 거래</strong><p>${formatNumber(item.latestTransactionCount, "건")} · 6개월 가격 변화 ${formatNumber(item.sixMonthPriceChangePct, "%")} · 6개월 거래 변화 ${formatNumber(item.sixMonthTransactionChangePct, "%")}</p></article>
              <article><strong>상위 업종</strong><p>${item.topCategories}</p></article>
            </div>
            <div class="stacked-list">
              ${(item.objections || []).map((reason) => `<article><strong>반대 근거</strong><p>${reason}</p></article>`).join("")}
            </div>
          </div>
          <div class="evidence-pair" style="margin-top:18px">
            <div class="stacked-list">
              ${(item.fieldChecks || []).map((check) => `<article><strong>현장 확인</strong><p>${check}</p></article>`).join("")}
            </div>
            <div class="stacked-list">
              ${(item.replacementCandidates || []).length
                ? item.replacementCandidates.map((candidate) => `<article><strong>대체 후보</strong><p>${candidate}</p></article>`).join("")
                : `<article><strong>대체 후보 없음</strong><p>현재 케이스에 연결된 대체 후보가 없습니다.</p></article>`}
            </div>
          </div>
        </article>
      `
    )
    .join("");
})();
