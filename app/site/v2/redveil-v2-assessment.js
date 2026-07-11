(() => {
  const body = document.body;
  if (!body || body.dataset.v2View !== "assessment") return;

  const STORAGE_KEY = "redveil-selected-district";
  const districts = Array.isArray(window.__REDVEIL_PAYLOAD__?.districts)
    ? window.__REDVEIL_PAYLOAD__.districts
    : [];
  const districtSelect = document.getElementById("district-code");
  const districtStatus = document.getElementById("v2-assessment-selected-district");
  const periodStatus = document.getElementById("v2-assessment-period");
  const main = document.getElementById("v2-assessment-main");

  const translations = new Map([
    ["Hold Signal Result", "보류 신호 결과"],
    ["Hold Signal Score", "보류 신호 점수"],
    ["Scenario Input", "진단 조건"],
    ["District Snapshot", "자치구 현황"],
    ["Risk Breakdown", "리스크 구성"],
  ]);

  function validDistrictCode(value) {
    return districts.some((district) => String(district.code) === String(value || ""));
  }

  function districtName(code) {
    return districts.find((district) => String(district.code) === String(code || ""))?.name || "";
  }

  function currentDistrictCode() {
    const selected = districtSelect?.value || "";
    if (validDistrictCode(selected)) return selected;

    const queryCode = new URLSearchParams(window.location.search).get("district") || "";
    if (validDistrictCode(queryCode)) return queryCode;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) || "";
      return validDistrictCode(stored) ? stored : "";
    } catch (_error) {
      return "";
    }
  }

  function syncStatus() {
    const code = currentDistrictCode();
    const name = districtName(code);
    const latestMonth = window.__REDVEIL_PAYLOAD__?.site?.latestMonth || window.__REDVEIL_PAYLOAD__?.summary?.latestMonth || "";

    if (districtStatus) {
      districtStatus.textContent = name ? `현재 진단 구 · ${name}` : "진단 구 선택 전";
    }
    if (periodStatus) {
      periodStatus.textContent = latestMonth ? `${latestMonth} 기준 데이터` : "데이터 시점 확인 필요";
    }

    if (!code) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (_error) {
      // URL state remains available when storage is unavailable.
    }

    const url = new URL(window.location.href);
    url.searchParams.set("district", code);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
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
    translateTextNodes(main);
    syncStatus();
  }

  districtSelect?.addEventListener("change", () => {
    window.requestAnimationFrame(syncRenderedOutput);
  });

  document.getElementById("assessment-form")?.addEventListener("submit", () => {
    window.requestAnimationFrame(syncRenderedOutput);
  });

  if (main && window.MutationObserver) {
    const observer = new MutationObserver(() => translateTextNodes(main));
    observer.observe(main, { childList: true, subtree: true });
  }

  syncRenderedOutput();
})();
