(() => {
  const body = document.body;
  if (!body || body.dataset.v2View !== "compare") return;

  const districts = Array.isArray(window.__REDVEIL_PAYLOAD__?.districts)
    ? window.__REDVEIL_PAYLOAD__.districts
    : [];
  const selectionStatus = document.getElementById("v2-compare-selection-status");
  const bestStatus = document.getElementById("v2-compare-best-status");
  const compareMain = document.getElementById("v2-compare-main");

  const translations = new Map([
    ["Risk Signals", "리스크 신호"],
    ["Decision Cue", "판단 신호"],
    ["Review Baseline", "비교 기준"],
    ["Why Compare", "비교 이유"],
    ["Comparison Memo", "비교 메모"],
    ["Comparison Memo 복사", "비교 메모 복사"],
    ["TXT export", "TXT 저장"],
    ["Professional Review Handoff", "전문가 검토 인계"],
    ["Comparison baseline re-check items", "비교 기준 재확인 항목"],
    ["Re-check recent transaction prices / asking prices", "최근 실거래가와 호가 재확인"],
    ["Check vacancy possibility", "공실 가능성 확인"],
    ["Check lease terms", "임대차 조건 확인"],
    ["Check rights premium / management fees", "권리금과 관리비 확인"],
    ["Check loan conditions", "대출 조건 확인"],
    ["Check same-business competition density on site", "현장 동종 업종 경쟁 밀도 확인"],
    ["Check hourly foot-traffic variation", "시간대별 유동인구 변화 확인"],
    ["Legal / tax / brokerage professional review", "법률·세무·중개 전문가 검토"],
    [
      "Use this decision artifact to pause, compare, and prepare a professional review handoff. It does not replace legal, tax, financial, brokerage, or on-site professional review.",
      "이 비교 결과는 보류·비교와 전문가 검토 준비를 지원하며, 법률·세무·금융·중개·현장 전문가 검토를 대체하지 않습니다.",
    ],
    [
      "복사·저장된 비교 메모는 매입 추천이 아니라 보류·비교·전문가 검토용 decision artifact입니다.",
      "복사·저장된 비교 메모는 매입 추천이 아니라 보류·비교·전문가 검토를 위한 판단 기록입니다.",
    ],
  ]);

  function districtName(code) {
    return districts.find((district) => String(district.code) === String(code || ""))?.name || "";
  }

  function selectedCodes() {
    return ["compare-a", "compare-b", "compare-c"]
      .map((id) => document.getElementById(id)?.value || "")
      .filter(Boolean);
  }

  function selectedDistricts() {
    return selectedCodes()
      .map((code) => districts.find((district) => String(district.code) === String(code)))
      .filter(Boolean);
  }

  function syncStatus() {
    const codes = selectedCodes();
    const names = codes.map(districtName).filter(Boolean);
    const uniqueNames = [...new Set(names)];

    if (selectionStatus) {
      selectionStatus.textContent = uniqueNames.length
        ? `비교 후보 ${uniqueNames.length}곳 · ${uniqueNames.join(" · ")}`
        : "후보 조합 선택 전";
    }

    if (bestStatus) {
      const items = selectedDistricts();
      const best = [...items].sort((left, right) => Number(left.riskScore || 0) - Number(right.riskScore || 0))[0];
      bestStatus.textContent = best ? `현재 낮은 리스크 · ${best.name} ${Number(best.riskScore || 0).toFixed(1)}점` : "비교 기준 계산 전";
    }
  }

  function translateTextNodes(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const original = node.nodeValue || "";
      const normalized = original.trim();
      const translated = translations.get(normalized);
      if (translated) node.nodeValue = original.replace(normalized, translated);
    });
  }

  function syncRenderedOutput() {
    translateTextNodes(compareMain);
    syncStatus();
  }

  ["compare-a", "compare-b", "compare-c"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      window.requestAnimationFrame(syncRenderedOutput);
    });
  });

  document.getElementById("compare-run")?.addEventListener("click", () => {
    window.requestAnimationFrame(syncRenderedOutput);
  });

  if (compareMain && window.MutationObserver) {
    const observer = new MutationObserver(() => syncRenderedOutput());
    observer.observe(compareMain, { childList: true, subtree: true });
  }

  syncRenderedOutput();
})();
