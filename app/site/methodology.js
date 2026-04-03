(async function () {
  const { fetchJson, renderError } = window.SiteApi;

  const compact = {
    principles: [
      ["Objection-first", "장점보다 반대 근거를 먼저 봅니다."],
      ["Explainable", "점수는 보이는 지표와 연결됩니다."],
      ["Comparable", "대체 후보와 바로 비교합니다."],
      ["Actionable", "결과는 체크리스트로 이어집니다."],
    ],
    pillars: [
      "가격 부담: 최근 거래 대비 비싼가",
      "거래 유동성: 거래가 둔화되는가",
      "변동성: 가격 흐름이 흔들리는가",
      "상권 경쟁: 점포 과밀이 큰가",
    ],
    outputs: ["종합 리스크 점수", "위험 유형", "리스크 메모", "대체 후보", "현장 체크리스트"],
    architecture: [
      "Python 파이프라인으로 원천 데이터를 가공합니다.",
      "결과는 웹 payload와 로컬 API로 묶습니다.",
      "정적 페이지와 입력형 화면을 함께 운영합니다.",
    ],
    roadmap: ["행정동 수준 비교 고도화", "검토 이력 확장", "공유용 보고서 출력"],
    limitations: [
      "개별 매물 상태는 포함하지 않습니다.",
      "수요와 거래 데이터의 시점은 다릅니다.",
      "현재는 서울 구 단위 판단에 집중합니다.",
    ],
  };

  try {
    const site = await fetchJson("/api/site");
    document.getElementById("problem-statement").textContent =
      "매입 전 숨은 리스크 신호를 먼저 드러내는 판단 도구입니다.";
    document.getElementById("principles-list").innerHTML = compact.principles
      .map(([title, body]) => `<li><strong>${title}</strong> · ${body}</li>`)
      .join("");
    document.getElementById("pillars-list").innerHTML = compact.pillars.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("outputs-list").innerHTML = compact.outputs.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("architecture-list").innerHTML = compact.architecture
      .map((item) => `<li>${item}</li>`)
      .join("");
    document.getElementById("roadmap-list").innerHTML = compact.roadmap.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("limitations-grid").innerHTML = compact.limitations
      .map(
        (item) => `
      <article class="data-card compact-stack">
        <strong>주의</strong>
        <p>${item}</p>
      </article>
    `
      )
      .join("");
    document.getElementById("time-caveat").textContent = `시점 차이: ${site.timeCaveat}`;
    document.getElementById("sample-caveat").textContent = `저표본: ${site.sampleCaveat}`;
  } catch (error) {
    renderError(error);
  }
})();
