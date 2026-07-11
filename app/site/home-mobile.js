(function () {
  const payload = window.__REDVEIL_PAYLOAD__ || window.RedveilV2?.payload || {};
  const summary = payload.summary || {};
  const site = payload.site || {};
  const districts = Array.isArray(payload.districts) ? payload.districts : [];

  const latestMonth = document.getElementById("mobile-latest-month");
  const districtCount = document.getElementById("mobile-district-count");
  const reviewCount = document.getElementById("mobile-review-count");

  if (latestMonth) latestMonth.textContent = site.latestMonth || "-";
  if (districtCount) districtCount.textContent = `${summary.districtCount || districts.length || 25}개 구`;

  if (reviewCount) {
    try {
      const loadReviews = window.RedveilV2?.loadReviews;
      const reviews = typeof loadReviews === "function" ? loadReviews() : [];
      reviewCount.textContent = `${Array.isArray(reviews) ? reviews.length : 0}건`;
    } catch (error) {
      reviewCount.textContent = "0건";
    }
  }

  const disclosure = document.querySelector(".mobile-nav-disclosure");
  if (!disclosure) return;

  disclosure.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => disclosure.removeAttribute("open"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") disclosure.removeAttribute("open");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) disclosure.removeAttribute("open");
  });
})();