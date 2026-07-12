(() => {
  const body = document.body;
  if (!body || !body.dataset.v2View) return;

  function ensureResponsiveStylesheets() {
    [
      ["redveil-v2-responsive", "./redveil-v2-responsive.css?v=20260712-responsive-matrix"],
      ["redveil-v2-feature-responsive", "./redveil-v2-feature-responsive.css?v=20260712-feature-matrix"],
    ].forEach(([id, href]) => {
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  ensureResponsiveStylesheets();

  const STORAGE_KEY = "redveil-selected-district";
  const pageLabels = {
    map: "지도 홈",
    review: "매물 검토",
    assessment: "3분 진단",
    compare: "후보 비교",
    districts: "구별 리포트",
  };

  const currentView = body.dataset.v2View || "map";
  const sidebar = document.querySelector(".v2-sidebar");
  const menuButton = document.querySelector("[data-v2-menu-open]");
  const closeButton = document.querySelector("[data-v2-menu-close]");
  const backdrop = document.querySelector("[data-v2-menu-backdrop]");
  const mobileQuery = window.matchMedia("(max-width: 820px)");
  let pendingMapRestoreCode = "";
  let mapRestoreFinished = false;

  const copyReplacements = [
    ["서울 상가 리스크 인텔리전스", "서울 상가 리스크 분석"],
    ["Professional Review Handoff", "전문가 검토 준비"],
    ["Professional review handoff checklist:", "전문가 검토 준비 항목:"],
    ["Professional review handoff checklist", "전문가 검토 준비 항목"],
    ["Pause reason and re-check item checklist", "보류 사유와 재확인 항목"],
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
      "This decision artifact supports pause-first review and comparison baseline work. It does not replace legal, tax, financial, brokerage, or on-site professional review.",
      "이 판단 기록은 보류 우선 검토와 비교 기준 정리를 지원하며, 법률·세무·금융·중개·현장 전문가 검토를 대체하지 않습니다.",
    ],
    [
      "Use this decision artifact to pause, compare, and prepare a professional review handoff. It does not replace legal, tax, financial, brokerage, or on-site professional review.",
      "이 비교 판단 기록은 보류·비교와 전문가 검토 준비를 지원하며, 법률·세무·금융·중개·현장 전문가 검토를 대체하지 않습니다.",
    ],
    [
      "This checklist is a pause-first decision artifact for re-checking, comparison baseline review, and professional review handoff.",
      "이 확인 목록은 재확인, 비교 기준 검토와 전문가 검토 준비를 위한 보류 우선 판단 기록입니다.",
    ],
    [
      "It does not replace legal, tax, financial, brokerage, or on-site professional review.",
      "법률·세무·금융·중개·현장 전문가 검토를 대체하지 않습니다.",
    ],
    ["Comparison Memo 복사", "비교 메모 복사"],
    ["Hold Memo 복사", "보류 메모 복사"],
    ["Hold-first Output", "보류 우선 결과"],
    ["Hold Decision Memo", "보류 판단 메모"],
    ["Hold Signal Result", "보류 신호 결과"],
    ["Hold Signal Score", "보류 신호 점수"],
    ["Comparison Memo", "비교 메모"],
    ["Decision Snapshot", "판단 요약"],
    ["Decision Cue", "판단 신호"],
    ["Review Detail", "상세 검토"],
    ["Review Baseline", "비교 기준"],
    ["Risk Signals", "리스크 신호"],
    ["Why Compare", "비교 이유"],
    ["Scenario Input", "진단 조건"],
    ["District Snapshot", "자치구 현황"],
    ["Risk Breakdown", "리스크 구성"],
    ["No History", "저장 내역 없음"],
    ["Ready", "준비됨"],
    ["Quick Risk Check", "빠른 리스크 진단"],
    ["Saved Reviews", "저장한 검토"],
    ["Local archive", "기기 내 저장"],
    ["First Output", "첫 결과물"],
    ["Signal Scope", "분석 범위"],
    ["District Report", "구별 리포트"],
    ["Claim boundary:", "활용 범위:"],
    ["TXT 저장됨", "파일 저장됨"],
    ["TXT export", "텍스트 파일 저장"],
    ["TXT 저장", "텍스트 파일 저장"],
    ["전문가 검토 인계", "전문가 검토 준비"],
    ["상세 리포트 모드", "상세 리포트"],
    ["설계 중인 근거", "추가 확인이 필요한 항목"],
    ["경계 데이터 오프라인", "경계 데이터 연결 필요"],
    ["다음 액션", "다음 확인"],
    ["운영 모드", "현재 작업"],
    ["판단 모드", "판단 기준"],
  ];

  function normalizeCopy(value) {
    let normalized = String(value ?? "");
    copyReplacements.forEach(([source, target]) => {
      normalized = normalized.split(source).join(target);
    });
    return normalized
      .replace(/decision artifact/gi, "판단 기록")
      .replace(/\bpayload\b/gi, "분석 데이터")
      .replace(/페이로드/g, "분석 데이터")
      .replace(/스크리닝/g, "검토")
      .replace(/프로토타입/g, "분석 시제품")
      .replace(/인텔리전스/g, "분석");
  }

  function normalizeTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const current = node.nodeValue || "";
    const next = normalizeCopy(current);
    if (next !== current) node.nodeValue = next;
  }

  const copyAttributeNames = ["aria-label", "aria-description", "title", "placeholder", "alt", "content"];

  function normalizeElementAttributes(element) {
    if (!(element instanceof Element)) return;
    copyAttributeNames.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const current = element.getAttribute(attribute) || "";
      const next = normalizeCopy(current);
      if (next !== current) element.setAttribute(attribute, next);
    });
  }

  function normalizeSubtree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      normalizeTextNode(root);
      return;
    }
    if (!(root instanceof Element) && root !== document) return;

    if (root instanceof Element) normalizeElementAttributes(root);
    const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (textWalker.nextNode()) normalizeTextNode(textWalker.currentNode);

    if (root.querySelectorAll) {
      root.querySelectorAll(copyAttributeNames.map((attribute) => `[${attribute}]`).join(",")).forEach(normalizeElementAttributes);
    }
  }

  function installCopyBoundary() {
    window.RedveilV2Copy = Object.freeze({ normalizeText: normalizeCopy });

    try {
      const clipboard = window.navigator?.clipboard;
      if (clipboard && typeof clipboard.writeText === "function" && !clipboard.writeText.__redveilNormalized) {
        const nativeWriteText = clipboard.writeText.bind(clipboard);
        const normalizedWriteText = (text) => nativeWriteText(normalizeCopy(text));
        Object.defineProperty(normalizedWriteText, "__redveilNormalized", { value: true });
        clipboard.writeText = normalizedWriteText;
      }
    } catch (_error) {
      // Clipboard normalization is optional when the browser locks the API method.
    }

    try {
      const NativeBlob = window.Blob;
      if (NativeBlob && !NativeBlob.__redveilNormalized) {
        function RedveilBlob(parts = [], options = {}) {
          const isPlainText = String(options?.type || "").toLowerCase().startsWith("text/plain");
          const normalizedParts = isPlainText
            ? Array.from(parts, (part) => (typeof part === "string" ? normalizeCopy(part) : part))
            : parts;
          return new NativeBlob(normalizedParts, options);
        }
        RedveilBlob.prototype = NativeBlob.prototype;
        Object.setPrototypeOf(RedveilBlob, NativeBlob);
        Object.defineProperty(RedveilBlob, "__redveilNormalized", { value: true });
        window.Blob = RedveilBlob;
      }
    } catch (_error) {
      // Text export still works even if Blob cannot be wrapped.
    }

    try {
      const nativePrompt = window.prompt?.bind(window);
      if (nativePrompt && !window.prompt.__redveilNormalized) {
        const normalizedPrompt = (message, defaultValue) => nativePrompt(
          normalizeCopy(message),
          typeof defaultValue === "string" ? normalizeCopy(defaultValue) : defaultValue
        );
        Object.defineProperty(normalizedPrompt, "__redveilNormalized", { value: true });
        window.prompt = normalizedPrompt;
      }
    } catch (_error) {
      // Prompt fallback remains available without normalization.
    }
  }

  function districts() {
    const payload = window.__REDVEIL_PAYLOAD__ || window.RedveilV2?.payload || {};
    return Array.isArray(payload.districts) ? payload.districts : [];
  }

  function validDistrictCode(value) {
    return districts().some((district) => String(district.code) === String(value || ""));
  }

  function codeForName(name) {
    return districts().find((district) => String(district.name) === String(name || "").trim())?.code || "";
  }

  function storedDistrictCode() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) || "";
      return validDistrictCode(stored) ? stored : "";
    } catch (_error) {
      return "";
    }
  }

  function pageDistrictCode() {
    const params = new URLSearchParams(window.location.search);
    const code = currentView === "compare"
      ? params.get("a") || params.get("district") || ""
      : params.get("district") || params.get("code") || params.get("districtCode") || params.get("a") || "";
    return validDistrictCode(code) ? code : "";
  }

  function saveDistrictCode(code) {
    if (!validDistrictCode(code)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(code));
    } catch (_error) {
      // Selection persistence is optional when storage is unavailable.
    }
  }

  function syncCurrentUrl(code) {
    if (!validDistrictCode(code)) return;
    const parameter = currentView === "compare" ? "a" : "district";
    const url = new URL(window.location.href);
    if (url.searchParams.get(parameter) === String(code)) return;
    url.searchParams.set(parameter, String(code));
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function normalizeFeatureHref(view, originalHref) {
    if (view === "review" || /(?:^|\/)review\.html(?:[?#]|$)/.test(originalHref)) return "./review.html";
    if (view === "assessment" || /(?:^|\/)assessment\.html(?:[?#]|$)/.test(originalHref)) return "./assessment.html";
    if (view === "compare" || /(?:^|\/)compare\.html(?:[?#]|$)/.test(originalHref)) return "./compare.html";
    return originalHref;
  }

  function updateLink(link, code) {
    const originalHref = link.getAttribute("href") || "";
    const view = link.dataset.v2Nav || "";
    if (!originalHref || originalHref.startsWith("#") || /^(?:https?:|mailto:|tel:)/.test(originalHref)) return;

    const href = normalizeFeatureHref(view, originalHref);
    if (href !== originalHref) link.setAttribute("href", href);
    if (!code) return;

    const prefix = href.startsWith("../") ? "../" : href.startsWith("./") ? "./" : "";
    const url = new URL(href, window.location.href);
    if (view === "compare" || url.pathname.endsWith("compare.html")) {
      url.searchParams.set("a", code);
    } else {
      url.searchParams.set("district", code);
    }
    const filename = url.pathname.split("/").pop() || "index.html";
    link.setAttribute("href", `${prefix}${filename}${url.search}${url.hash}`);
  }

  function decorateV2Links(code = pageDistrictCode() || storedDistrictCode()) {
    document
      .querySelectorAll(
        '[data-v2-nav], [data-v2-district-link], a[href*="review.html"], a[href*="assessment.html"], a[href*="compare.html"]'
      )
      .forEach((link) => updateLink(link, code));
  }

  function syncDistrictCode(code, updateUrl = false) {
    if (!validDistrictCode(code)) return;
    saveDistrictCode(code);
    decorateV2Links(code);
    if (updateUrl) syncCurrentUrl(code);
  }

  function restoreSelect(selector, code) {
    const select = document.querySelector(selector);
    if (!(select instanceof HTMLSelectElement) || !validDistrictCode(code)) return false;
    if (select.value === String(code)) return true;
    select.value = String(code);
    if (select.value !== String(code)) return false;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function restoreMapSelection(code) {
    if (currentView !== "map" || mapRestoreFinished || !validDistrictCode(code)) return;
    const target = document.querySelector(`.v2-map-district[data-code="${code}"]`);
    if (!target) return;

    mapRestoreFinished = true;
    pendingMapRestoreCode = "";
    const selectedName = document.getElementById("map-selected-name");
    const currentCode = codeForName(selectedName?.textContent);
    if (currentCode !== String(code)) {
      target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
    syncDistrictCode(code, true);
  }

  function restoreCurrentView(code) {
    if (!validDistrictCode(code)) return;
    if (currentView === "review") {
      restoreSelect("#review-district-code", code);
      return;
    }
    if (currentView === "assessment") {
      restoreSelect("#district-code", code);
      return;
    }
    if (currentView === "compare") {
      restoreSelect("#compare-a", code);
      return;
    }
    if (currentView === "map") {
      restoreMapSelection(code);
    }
  }

  installCopyBoundary();
  normalizeSubtree(document.documentElement);

  if (window.MutationObserver) {
    const copyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          normalizeTextNode(mutation.target);
          return;
        }
        if (mutation.type === "attributes") {
          normalizeElementAttributes(mutation.target);
          return;
        }
        mutation.addedNodes.forEach(normalizeSubtree);
      });
    });
    copyObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: copyAttributeNames,
    });
  }

  document.querySelectorAll("[data-v2-nav]").forEach((link) => {
    const isCurrent = link.dataset.v2Nav === currentView;
    link.classList.toggle("is-active", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll("[data-v2-current-title]").forEach((node) => {
    node.textContent = pageLabels[currentView] || "Redveil V2";
  });

  function setExpanded(expanded, returnFocus = false) {
    if (!sidebar || !mobileQuery.matches) return;

    body.classList.toggle("v2-nav-open", expanded);
    menuButton?.setAttribute("aria-expanded", String(expanded));
    sidebar.setAttribute("aria-hidden", String(!expanded));

    if (expanded) {
      sidebar.removeAttribute("inert");
      window.requestAnimationFrame(() => closeButton?.focus());
    } else {
      sidebar.setAttribute("inert", "");
      if (returnFocus) menuButton?.focus();
    }
  }

  function syncViewport() {
    if (!sidebar) return;

    if (mobileQuery.matches) {
      setExpanded(false);
    } else {
      body.classList.remove("v2-nav-open");
      menuButton?.setAttribute("aria-expanded", "false");
      sidebar.removeAttribute("aria-hidden");
      sidebar.removeAttribute("inert");
    }
  }

  menuButton?.addEventListener("click", () => setExpanded(true));
  closeButton?.addEventListener("click", () => setExpanded(false, true));
  backdrop?.addEventListener("click", () => setExpanded(false, true));

  sidebar?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileQuery.matches) setExpanded(false);
    });
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.matches("#review-district-code, #district-code, #compare-a")) {
      syncDistrictCode(target.value, true);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("v2-nav-open")) {
      setExpanded(false, true);
    }
  });

  const selectedName = document.getElementById("map-selected-name");
  if (selectedName && window.MutationObserver) {
    const syncMapSelection = () => {
      const code = codeForName(selectedName.textContent);
      if (!code) return;
      if (pendingMapRestoreCode && !mapRestoreFinished && code !== pendingMapRestoreCode) return;
      syncDistrictCode(code, true);
    };
    const observer = new MutationObserver(syncMapSelection);
    observer.observe(selectedName, { childList: true, characterData: true, subtree: true });
    window.setTimeout(syncMapSelection, 0);
  }

  const mapRoot = document.querySelector("[data-v2-risk-map]");
  if (mapRoot && window.MutationObserver) {
    const mapObserver = new MutationObserver(() => restoreMapSelection(pendingMapRestoreCode));
    mapObserver.observe(mapRoot, { childList: true, subtree: true });
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncViewport);
  } else {
    mobileQuery.addListener(syncViewport);
  }

  decorateV2Links();
  const queryCode = pageDistrictCode();
  const initialCode = queryCode || storedDistrictCode();
  if (initialCode) {
    if (currentView === "map") pendingMapRestoreCode = initialCode;
    syncDistrictCode(initialCode, !queryCode);
    restoreCurrentView(initialCode);
    window.setTimeout(() => restoreCurrentView(initialCode), 0);
  }
  syncViewport();
})();
