(() => {
  const body = document.body;
  if (!body || !body.dataset.v2View) return;

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
  const mobileQuery = window.matchMedia("(max-width: 760px)");

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
    const code = params.get("district") || params.get("a") || "";
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

  function normalizeFeatureHref(view, originalHref) {
    if (view === "review" || /(?:^|\/)review\.html(?:[?#]|$)/.test(originalHref)) return "./review.html";
    if (view === "assessment" || /(?:^|\/)assessment\.html(?:[?#]|$)/.test(originalHref)) return "./assessment.html";
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
        '[data-v2-nav], [data-v2-district-link], a[href*="review.html"], a[href*="assessment.html"]'
      )
      .forEach((link) => updateLink(link, code));
  }

  function syncDistrictCode(code) {
    if (!validDistrictCode(code)) return;
    saveDistrictCode(code);
    decorateV2Links(code);
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
      syncDistrictCode(target.value);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("v2-nav-open")) {
      setExpanded(false, true);
    }
  });

  const selectedName = document.getElementById("map-selected-name");
  if (selectedName && window.MutationObserver) {
    const syncMapSelection = () => syncDistrictCode(codeForName(selectedName.textContent));
    const observer = new MutationObserver(syncMapSelection);
    observer.observe(selectedName, { childList: true, characterData: true, subtree: true });
    window.setTimeout(syncMapSelection, 0);
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncViewport);
  } else {
    mobileQuery.addListener(syncViewport);
  }

  decorateV2Links();
  const initialCode = pageDistrictCode() || storedDistrictCode();
  if (initialCode) syncDistrictCode(initialCode);
  syncViewport();
})();
