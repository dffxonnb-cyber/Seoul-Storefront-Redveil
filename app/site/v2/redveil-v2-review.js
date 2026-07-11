(() => {
  const body = document.body;
  if (!body || body.dataset.v2View !== "review") return;

  const STORAGE_KEY = "redveil-selected-district";
  const districts = Array.isArray(window.__REDVEIL_PAYLOAD__?.districts)
    ? window.__REDVEIL_PAYLOAD__.districts
    : [];
  const districtSelect = document.getElementById("review-district-code");
  const districtStatus = document.getElementById("v2-review-selected-district");
  const reviewDetail = document.getElementById("review-detail");

  const translations = new Map([
    ["No History", "저장 내역 없음"],
    ["Ready", "준비됨"],
    ["Hold-first Output", "보류 우선 결과"],
    ["Hold Decision Memo", "보류 판단 메모"],
    ["Hold Memo 복사", "보류 메모 복사"],
    ["TXT export", "TXT 저장"],
    ["Professional Review Handoff", "전문가 검토 인계"],
    ["Pause reason and re-check item checklist", "보류 사유와 재확인 항목"],
    ["Review Detail", "상세 검토"],
    ["Decision Snapshot", "판단 요약"],
    ["Re-check recent transaction prices / asking prices", "최근 실거래가와 호가 재확인"],
    ["Check vacancy possibility", "공실 가능성 확인"],
    ["Check lease terms", "임대차 조건 확인"],
    ["Check rights premium / management fees", "권리금과 관리비 확인"],
    ["Check loan conditions", "대출 조건 확인"],
    ["Check same-business competition density on site", "현장 동종 업종 경쟁 밀도 확인"],
    ["Check hourly foot-traffic variation", "시간대별 유동인구 변화 확인"],
    ["Legal / tax / brokerage professional review", "법률·세무·중개 전문가 검토"],
    [
      "This decision artifact supports pause-first review and comparison baseline work. It does not replace legal, tax, financial, brokerage, or on-site professional review.",
      "이 결과물은 보류 우선 검토와 비교 기준 정리를 지원하며, 법률·세무·금융·중개·현장 전문가 검토를 대체하지 않습니다.",
    ],
    [
      "복사·저장된 메모는 매입 추천이 아니라 보류·비교·전문가 검토용 decision artifact입니다.",
      "복사·저장된 메모는 매입 추천이 아니라 보류·비교·전문가 검토를 위한 판단 기록입니다.",
    ],
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

  function routeWithDistrict(href, code, param = "district") {
    if (!code) return href;
    const url = new URL(href, window.location.href);
    url.searchParams.set(param, code);
    return `${url.pathname.split("/").pop() || "index.html"}${url.search}${url.hash}`;
  }

  function syncNavigation(code) {
    document.querySelectorAll("[data-v2-nav]").forEach((link) => {
      const view = link.dataset.v2Nav;
      const href = link.getAttribute("href") || "";
      if (!href || !code) return;

      if (view === "compare") {
        const url = new URL(href, window.location.href);
        url.searchParams.set("a", code);
        link.setAttribute("href", `${view === "compare" && href.startsWith("../") ? "../" : "./"}${url.pathname.split("/").pop()}${url.search}`);
      } else if (view !== "review" || href.includes("review.html")) {
        const prefix = href.startsWith("../") ? "../" : "./";
        link.setAttribute("href", `${prefix}${routeWithDistrict(href, code)}`);
      }
    });
  }

  function syncDistrictContext() {
    const code = currentDistrictCode();
    const name = districtName(code);

    if (districtStatus) {
      districtStatus.textContent = name ? `현재 검토 구 · ${name}` : "검토 구 선택 전";
    }

    if (code) {
      try {
        window.localStorage.setItem(STORAGE_KEY, code);
      } catch (_error) {
        // Storage is optional; the URL still keeps the selected district.
      }
      const url = new URL(window.location.href);
      url.searchParams.set("district", code);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    syncNavigation(code);
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
    translateTextNodes(document.getElementById("v2-review-main"));
    if (reviewDetail?.childElementCount) reviewDetail.hidden = false;
  }

  districtSelect?.addEventListener("change", () => {
    window.requestAnimationFrame(() => {
      syncDistrictContext();
      syncRenderedOutput();
    });
  });

  const main = document.getElementById("v2-review-main");
  if (main && window.MutationObserver) {
    const observer = new MutationObserver(() => syncRenderedOutput());
    observer.observe(main, { childList: true, subtree: true });
  }

  syncDistrictContext();
  syncRenderedOutput();
})();
