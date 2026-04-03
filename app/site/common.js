(function () {
  window.SiteApi = {
    async fetchJson(url, options = {}) {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${url} (${response.status})`);
      }
      return response.json();
    },
    formatNumber(value, suffix = "") {
      return `${Number(value || 0).toLocaleString("ko-KR")}${suffix}`;
    },
    formatPercent(value) {
      return `${Number(value || 0).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%`;
    },
    formatDateTime(value) {
      if (!value) return "-";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString("ko-KR", { hour12: false });
    },
    setActiveNav() {
      const page = document.body.dataset.page;
      document.querySelectorAll(".site-nav a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        const name = href.replace("./", "").replace(".html", "") || "index";
        const normalized = name === "index" ? "home" : name;
        link.classList.toggle("is-active", normalized === page);
      });
    },
    ensureReviewNav() {
      const nav = document.querySelector(".site-nav");
      if (!nav || nav.querySelector('a[href="./review.html"]')) return;
      const anchor = document.createElement("a");
      anchor.href = "./review.html";
      anchor.textContent = "내 매물 검토";
      const assessmentLink = nav.querySelector('a[href="./assessment.html"]');
      if (assessmentLink) {
        nav.insertBefore(anchor, assessmentLink);
      } else {
        nav.appendChild(anchor);
      }
    },
    drawLineChart(targetId, points, valueKey, color) {
      const svg = document.getElementById(targetId);
      if (!svg || !points.length) {
        if (svg) svg.innerHTML = "";
        return;
      }

      const width = 420;
      const height = 180;
      const paddingX = 28;
      const paddingY = 24;
      const values = points.map((item) => Number(item[valueKey]));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      const stepX = points.length === 1 ? 0 : (width - paddingX * 2) / (points.length - 1);

      const coords = points.map((item, index) => ({
        x: paddingX + stepX * index,
        y: height - paddingY - ((Number(item[valueKey]) - min) / range) * (height - paddingY * 2),
        label: item.month,
      }));

      const pathData = coords
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
        .join(" ");
      const areaData = `${pathData} L ${coords[coords.length - 1].x.toFixed(1)} ${height - paddingY} L ${coords[0].x.toFixed(1)} ${height - paddingY} Z`;
      const xLabels = coords
        .map((point, index) => {
          const visible = index === 0 || index === coords.length - 1 || index === Math.floor(coords.length / 2);
          return visible
            ? `<text x="${point.x}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#7b685e">${point.label}</text>`
            : "";
        })
        .join("");
      const dots = coords
        .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${color}"></circle>`)
        .join("");

      svg.innerHTML = `
        <defs>
          <linearGradient id="${targetId}-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.28"></stop>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.03"></stop>
          </linearGradient>
        </defs>
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(43,26,18,0.12)" />
        <path d="${areaData}" fill="url(#${targetId}-fill)"></path>
        <path d="${pathData}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
        ${dots}
        ${xLabels}
      `;
    },
    renderError(error) {
      document.body.innerHTML = `
        <main style="padding:40px;font-family:'IBM Plex Sans KR',sans-serif">
          <h1>사이트를 불러오지 못했습니다.</h1>
          <p>로컬 서버가 실행 중인지, 주소가 맞는지 확인해 주세요.</p>
          <pre>${error.message}</pre>
        </main>
      `;
    },
  };

  window.SiteApi.ensureReviewNav();
  window.SiteApi.setActiveNav();
})();
