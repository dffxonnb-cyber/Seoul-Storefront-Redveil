(() => {
  "use strict";

  const body = document.body;
  if (!body || !body.dataset.v2View) return;

  const DISTRICT_STORAGE_KEY = "redveil-selected-district";
  const REVIEW_STORAGE_KEY = "redveil-reviews";
  const STORAGE_PROBE_KEY = "redveil-storage-probe";
  const currentView = body.dataset.v2View || "map";
  const pageLabels = {
    map: "지도 홈",
    review: "매물 검토",
    assessment: "3분 진단",
    compare: "후보 비교",
    districts: "구별 리포트",
  };

  const sidebar = document.querySelector(".v2-sidebar");
  const menuButton = document.querySelector("[data-v2-menu-open]");
  const closeButton = document.querySelector("[data-v2-menu-close]");
  const backdrop = document.querySelector("[data-v2-menu-backdrop]");
  const workspace = document.querySelector(".v2-workspace");
  const mobileQuery = window.matchMedia("(max-width: 820px)");
  let pendingMapRestoreCode = "";
  let mapRestoreFinished = false;
  let storageBlocked = false;

  function ensureSupportAssets() {
    [
      ["redveil-v2-responsive", "./redveil-v2-responsive.css?v=20260712-responsive-matrix"],
      ["redveil-v2-feature-responsive", "./redveil-v2-feature-responsive.css?v=20260712-feature-matrix"],
      ["redveil-v2-resilience", "./redveil-v2-resilience.css?v=20260712-resilience-states"],
    ].forEach(([id, href]) => {
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  ensureSupportAssets();

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
      // The browser may protect the clipboard method. The visible copy remains normalized.
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
      // Text export remains available even when Blob wrapping is restricted.
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

  function ensureNoticeHost() {
    let host = document.getElementById("v2-system-notices");
    if (host || !workspace) return host;

    host = document.createElement("section");
    host.id = "v2-system-notices";
    host.className = "v2-system-notices";
    host.setAttribute("aria-label", "화면 상태 안내");
    host.setAttribute("aria-live", "polite");

    const topbar = workspace.querySelector(".v2-topbar");
    workspace.insertBefore(host, topbar || workspace.firstChild);
    return host;
  }

  function clearNotice(id) {
    document.querySelector(`[data-v2-notice-id="${id}"]`)?.remove();
  }

  function showNotice({
    id,
    tone = "info",
    title,
    message,
    actionLabel = "",
    onAction = null,
    dismissible = true,
  }) {
    const host = ensureNoticeHost();
    if (!host || !id) return null;

    clearNotice(id);
    const notice = document.createElement("article");
    notice.className = `v2-system-notice is-${tone}`;
    notice.dataset.v2NoticeId = id;
    notice.setAttribute("role", tone === "error" ? "alert" : "status");

    const copy = document.createElement("div");
    copy.className = "v2-system-notice-copy";
    const label = document.createElement("span");
    label.textContent = tone === "error" ? "연결 확인" : tone === "warning" ? "복구 안내" : tone === "loading" ? "불러오는 중" : "상태 안내";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    copy.append(label, heading, paragraph);

    const actions = document.createElement("div");
    actions.className = "v2-system-notice-actions";
    if (actionLabel && typeof onAction === "function") {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "v2-system-notice-action";
      action.textContent = actionLabel;
      action.addEventListener("click", onAction);
      actions.appendChild(action);
    }
    if (dismissible) {
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "v2-system-notice-dismiss";
      dismiss.textContent = "닫기";
      dismiss.setAttribute("aria-label", `${title} 안내 닫기`);
      dismiss.addEventListener("click", () => clearNotice(id));
      actions.appendChild(dismiss);
    }

    notice.append(copy, actions);
    host.appendChild(notice);
    normalizeSubtree(notice);
    return notice;
  }

  function reloadPage() {
    window.location.reload();
  }

  function payload() {
    const candidates = [
      window.__REDVEIL_PAYLOAD__,
      window.REDVEIL_PAYLOAD,
      window.RedveilPayload,
      window.RedveilV2?.payload,
    ];
    return candidates.find((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate)) || {};
  }

  function districts() {
    const items = payload().districts;
    return Array.isArray(items)
      ? items.filter((district) => district && district.code && district.name)
      : [];
  }

  function validDistrictCode(value) {
    return districts().some((district) => String(district.code) === String(value || ""));
  }

  function districtName(code) {
    return districts().find((district) => String(district.code) === String(code || ""))?.name || "";
  }

  function codeForName(name) {
    return districts().find((district) => String(district.name) === String(name || "").trim())?.code || "";
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      storageBlocked = true;
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (_error) {
      storageBlocked = true;
      return false;
    }
  }

  function safeStorageRemove(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (_error) {
      storageBlocked = true;
      return false;
    }
  }

  function storageWritable() {
    try {
      window.localStorage.setItem(STORAGE_PROBE_KEY, "1");
      window.localStorage.removeItem(STORAGE_PROBE_KEY);
      return true;
    } catch (_error) {
      storageBlocked = true;
      return false;
    }
  }

  function storedDistrictCode() {
    const stored = safeStorageGet(DISTRICT_STORAGE_KEY) || "";
    return validDistrictCode(stored) ? stored : "";
  }

  function rawRequestedDistrict() {
    const params = new URLSearchParams(window.location.search);
    const names = currentView === "compare"
      ? ["a", "district"]
      : ["district", "code", "districtCode", "a"];
    for (const name of names) {
      if (params.has(name)) return { name, value: params.get(name) || "" };
    }
    return { name: currentView === "compare" ? "a" : "district", value: "" };
  }

  function pageDistrictCode() {
    const requested = rawRequestedDistrict().value;
    return validDistrictCode(requested) ? requested : "";
  }

  function saveDistrictCode(code) {
    if (!validDistrictCode(code)) return;
    safeStorageSet(DISTRICT_STORAGE_KEY, String(code));
  }

  function syncCurrentUrl(code) {
    if (!validDistrictCode(code)) return;
    const parameter = currentView === "compare" ? "a" : "district";
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("districtCode");
    if (currentView !== "compare") url.searchParams.delete("a");
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
    if (currentView === "map") restoreMapSelection(code);
  }

  function validateStoredDistrict() {
    const raw = safeStorageGet(DISTRICT_STORAGE_KEY) || "";
    if (!raw || !districts().length || validDistrictCode(raw)) return;
    safeStorageRemove(DISTRICT_STORAGE_KEY);
    showNotice({
      id: "stored-district-recovered",
      tone: "warning",
      title: "저장된 선택 정보를 초기화했습니다",
      message: "이전에 저장된 자치구 정보가 현재 데이터와 맞지 않아 안전하게 지웠습니다.",
    });
  }

  function recoverInvalidQuery() {
    if (!districts().length) return "";
    const requested = rawRequestedDistrict();
    if (!requested.value || validDistrictCode(requested.value)) return pageDistrictCode();

    const fallback = storedDistrictCode() || String(districts()[0]?.code || "");
    const url = new URL(window.location.href);
    ["district", "code", "districtCode", "a"].forEach((name) => url.searchParams.delete(name));
    if (fallback) url.searchParams.set(currentView === "compare" ? "a" : "district", fallback);

    if (currentView === "compare") {
      ["b", "c"].forEach((name) => {
        const value = url.searchParams.get(name);
        if (value && !validDistrictCode(value)) url.searchParams.delete(name);
      });
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    showNotice({
      id: "invalid-district-recovered",
      tone: "warning",
      title: "선택 자치구를 복구했습니다",
      message: fallback
        ? `주소의 자치구 코드를 확인할 수 없어 ${districtName(fallback)} 기준으로 다시 열었습니다.`
        : "주소의 자치구 코드를 확인할 수 없어 기본 화면으로 다시 열었습니다.",
    });
    return fallback;
  }

  function validateReviewStorage() {
    if (currentView !== "review") return;
    const raw = safeStorageGet(REVIEW_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Review storage must be an array");
    } catch (_error) {
      safeStorageRemove(REVIEW_STORAGE_KEY);
      showNotice({
        id: "review-storage-recovered",
        tone: "warning",
        title: "저장된 검토 내역을 초기화했습니다",
        message: "기기 내 검토 내역을 읽을 수 없어 손상된 저장값을 지우고 빈 목록으로 복구했습니다.",
      });
    }
  }

  function disableControls(rootSelector, message) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    root.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = true;
      control.setAttribute("aria-disabled", "true");
      if (message) control.title = message;
    });
  }

  function handleStorageAvailability() {
    if (storageWritable()) return;
    showNotice({
      id: "storage-unavailable",
      tone: currentView === "review" ? "error" : "warning",
      title: "기기 내 저장을 사용할 수 없습니다",
      message: currentView === "review"
        ? "현재 브라우저에서는 검토 내역을 저장할 수 없습니다. 저장 권한을 허용한 뒤 다시 불러오세요."
        : "현재 선택은 확인할 수 있지만 새로고침 뒤에는 유지되지 않을 수 있습니다.",
      actionLabel: "다시 불러오기",
      onAction: reloadPage,
    });
    if (currentView === "review") {
      document.querySelectorAll("#review-form button[type='submit']").forEach((button) => {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
      });
    }
  }

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

  function featureDataReady() {
    if (!districts().length) return false;
    if (currentView === "review") return document.querySelectorAll("#review-district-code option").length >= 25;
    if (currentView === "assessment") return document.querySelectorAll("#district-code option").length >= 25;
    if (currentView === "compare") return document.querySelectorAll("#compare-a option").length >= 25;
    if (currentView === "districts") return !document.getElementById("v2-report-fallback")?.hidden === false
      ? false
      : true;
    return true;
  }

  function checkHealth(attempt = 0) {
    body.classList.remove("v2-is-loading");
    clearNotice("page-loading");

    if (!districts().length) {
      showNotice({
        id: "analysis-data-unavailable",
        tone: "error",
        title: "분석 데이터를 불러오지 못했습니다",
        message: "네트워크 연결과 배포 파일 상태를 확인한 뒤 화면을 다시 불러오세요.",
        actionLabel: "다시 불러오기",
        onAction: reloadPage,
        dismissible: false,
      });
      if (currentView === "review") disableControls("#review-form", "분석 데이터를 먼저 불러와야 합니다.");
      if (currentView === "assessment") disableControls("#assessment-form", "분석 데이터를 먼저 불러와야 합니다.");
      if (currentView === "compare") disableControls(".v2-compare-selector-panel", "분석 데이터를 먼저 불러와야 합니다.");
      return;
    }

    clearNotice("analysis-data-unavailable");

    if (currentView !== "map" && !featureDataReady()) {
      showNotice({
        id: "feature-data-empty",
        tone: "error",
        title: "화면 데이터를 준비하지 못했습니다",
        message: "자치구 선택 항목이나 결과 영역이 비어 있습니다. 다시 불러온 뒤에도 계속되면 배포 파일을 확인하세요.",
        actionLabel: "다시 불러오기",
        onAction: reloadPage,
      });
    } else {
      clearNotice("feature-data-empty");
    }

    if (currentView === "map" && attempt > 0) {
      const boundaryCount = document.querySelectorAll("[data-v2-risk-map] .v2-map-district").length;
      if (boundaryCount < 25) {
        showNotice({
          id: "boundary-map-unavailable",
          tone: "warning",
          title: "경계 지도를 불러오지 못했습니다",
          message: "자치구 경계 선택은 잠시 사용할 수 없습니다. 오른쪽 리스크 요약은 연결된 분석 데이터 기준으로 계속 확인할 수 있습니다.",
          actionLabel: "다시 불러오기",
          onAction: reloadPage,
        });
      } else {
        clearNotice("boundary-map-unavailable");
      }
    }

    if (currentView === "districts") {
      const fallback = document.getElementById("v2-report-fallback");
      if (fallback && !fallback.hidden) {
        showNotice({
          id: "district-report-unavailable",
          tone: "error",
          title: "자치구 리포트를 불러오지 못했습니다",
          message: "선택 자치구의 상세 분석 데이터가 없습니다. 지도 홈으로 돌아가 다른 자치구를 선택하거나 다시 불러오세요.",
          actionLabel: "다시 불러오기",
          onAction: reloadPage,
        });
      } else {
        clearNotice("district-report-unavailable");
      }
    }
  }

  installCopyBoundary();
  normalizeSubtree(document.documentElement);
  ensureNoticeHost();
  body.classList.add("v2-is-loading");

  const loadingTimer = window.setTimeout(() => {
    showNotice({
      id: "page-loading",
      tone: "loading",
      title: "분석 화면을 준비하고 있습니다",
      message: "자치구 데이터와 저장 상태를 확인하는 중입니다.",
      dismissible: false,
    });
  }, 350);

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
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  document.querySelectorAll("[data-v2-current-title]").forEach((node) => {
    node.textContent = pageLabels[currentView] || "Redveil V2";
  });

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

  validateStoredDistrict();
  validateReviewStorage();
  handleStorageAvailability();

  const recoveredCode = recoverInvalidQuery();
  decorateV2Links();
  const queryCode = recoveredCode || pageDistrictCode();
  const initialCode = queryCode || storedDistrictCode();
  if (initialCode) {
    if (currentView === "map") pendingMapRestoreCode = initialCode;
    syncDistrictCode(initialCode, !queryCode);
    restoreCurrentView(initialCode);
    window.setTimeout(() => restoreCurrentView(initialCode), 0);
  }
  syncViewport();

  window.RedveilV2State = Object.freeze({
    showNotice,
    clearNotice,
    checkNow: () => checkHealth(2),
  });

  window.addEventListener("load", () => {
    window.clearTimeout(loadingTimer);
    checkHealth(0);
    window.setTimeout(() => checkHealth(1), 700);
    window.setTimeout(() => checkHealth(2), 1800);
  }, { once: true });
})();
