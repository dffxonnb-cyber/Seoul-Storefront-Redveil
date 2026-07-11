(() => {
  const body = document.body;
  if (!body || body.dataset.page !== "redveil-v2") return;

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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("v2-nav-open")) {
      setExpanded(false, true);
    }
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncViewport);
  } else {
    mobileQuery.addListener(syncViewport);
  }

  syncViewport();
})();
