(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  const DISTRICT_CELLS = [
    { code: "11320", name: "도봉구", x: 394, y: 74, rx: 50, ry: 42, fallbackScore: 42, archetype: "외곽 안정형" },
    { code: "11350", name: "노원구", x: 486, y: 102, rx: 57, ry: 48, fallbackScore: 38, archetype: "주거권 수요형" },
    { code: "11305", name: "강북구", x: 320, y: 128, rx: 58, ry: 47, fallbackScore: 46, archetype: "저가 진입형" },
    { code: "11380", name: "은평구", x: 212, y: 164, rx: 68, ry: 55, fallbackScore: 43, archetype: "생활권 안정형" },
    { code: "11290", name: "성북구", x: 386, y: 174, rx: 62, ry: 52, fallbackScore: 48, archetype: "생활권 혼합형" },
    { code: "11260", name: "중랑구", x: 516, y: 190, rx: 58, ry: 48, fallbackScore: 44, archetype: "동북권 회복형" },
    { code: "11110", name: "종로구", x: 296, y: 230, rx: 64, ry: 50, fallbackScore: 63, archetype: "관광 수요 변동형" },
    { code: "11410", name: "서대문구", x: 196, y: 258, rx: 60, ry: 48, fallbackScore: 51, archetype: "대학가 수요형" },
    { code: "11230", name: "동대문구", x: 424, y: 250, rx: 58, ry: 48, fallbackScore: 56, archetype: "도매권 전환형" },
    { code: "11140", name: "중구", x: 314, y: 300, rx: 52, ry: 43, fallbackScore: 66, archetype: "도심 고가형" },
    { code: "11200", name: "성동구", x: 424, y: 318, rx: 58, ry: 47, fallbackScore: 61, archetype: "핫플레이스 과열형" },
    { code: "11215", name: "광진구", x: 532, y: 310, rx: 58, ry: 48, fallbackScore: 49, archetype: "생활상권 혼합형" },
    { code: "11440", name: "마포구", x: 172, y: 334, rx: 70, ry: 50, fallbackScore: 58, archetype: "상권 전환형" },
    { code: "11170", name: "용산구", x: 302, y: 378, rx: 65, ry: 50, fallbackScore: 64, archetype: "개발 기대형" },
    { code: "11560", name: "영등포구", x: 162, y: 414, rx: 66, ry: 49, fallbackScore: 53, archetype: "업무권 혼합형" },
    { code: "11500", name: "강서구", x: 58, y: 382, rx: 74, ry: 54, fallbackScore: 41, archetype: "서남권 안정형" },
    { code: "11470", name: "양천구", x: 82, y: 462, rx: 58, ry: 45, fallbackScore: 37, archetype: "주거권 방어형" },
    { code: "11530", name: "구로구", x: 182, y: 492, rx: 60, ry: 46, fallbackScore: 35, archetype: "저위험 대체형" },
    { code: "11545", name: "금천구", x: 258, y: 498, rx: 54, ry: 42, fallbackScore: 39, archetype: "대체 후보형" },
    { code: "11590", name: "동작구", x: 294, y: 444, rx: 58, ry: 45, fallbackScore: 47, archetype: "역세권 선별형" },
    { code: "11620", name: "관악구", x: 370, y: 492, rx: 68, ry: 47, fallbackScore: 45, archetype: "청년 수요형" },
    { code: "11650", name: "서초구", x: 444, y: 430, rx: 78, ry: 58, fallbackScore: 76, archetype: "고가 선행형" },
    { code: "11680", name: "강남구", x: 540, y: 408, rx: 70, ry: 53, fallbackScore: 72, archetype: "고가 과열형" },
    { code: "11710", name: "송파구", x: 632, y: 380, rx: 66, ry: 50, fallbackScore: 57, archetype: "대형 생활권형" },
    { code: "11740", name: "강동구", x: 686, y: 300, rx: 60, ry: 48, fallbackScore: 50, archetype: "동남권 확장형" },
  ];

  const state = {
    districts: [],
    selectedCode: null,
  };

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function hasReadableKorean(value) {
    return /[가-힣]/.test(String(value || ""));
  }

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getAvailablePayload() {
    const candidates = [
      window.__REDVEIL_PAYLOAD__,
      window.REDVEIL_PAYLOAD,
      window.RedveilPayload,
      window.RedveilV2 && window.RedveilV2.payload,
    ];

    return candidates.find(isPlainObject) || {};
  }

  function riskTier(score) {
    const value = toNumber(score);
    if (value >= 65) return "high";
    if (value >= 45) return "watch";
    return "low";
  }

  function riskStatus(score) {
    const tier = riskTier(score);
    if (tier === "high") return "High";
    if (tier === "watch") return "Watch";
    return "Low";
  }

  function riskGrade(score) {
    const tier = riskTier(score);
    if (tier === "high") return "높음";
    if (tier === "watch") return "주의";
    return "낮음";
  }

  function toneClass(statusOrScore) {
    const status = typeof statusOrScore === "number" ? riskStatus(statusOrScore) : String(statusOrScore || "");
    const normalized = status.toLowerCase();
    if (normalized.includes("high") || normalized.includes("높") || normalized.includes("위험")) return "is-high";
    if (normalized.includes("watch") || normalized.includes("주의")) return "is-watch";
    return "is-low";
  }

  function shortDistrictName(name) {
    return String(name || "").replace(/구$/, "");
  }

  function buildRiskSummary(detail) {
    const score = toNumber(detail.riskScore);
    if (score >= 65) {
      return `${detail.name}은 ${detail.riskArchetype} 신호가 강합니다. 가격 부담, 거래 유동성, 경쟁 밀도를 함께 재확인한 뒤 매입 여부를 판단해야 합니다.`;
    }
    if (score >= 45) {
      return `${detail.name}은 일부 위험 신호가 겹치는 주의 구간입니다. 임대료 조건과 대체 후보를 함께 비교하는 접근이 안전합니다.`;
    }
    return `${detail.name}은 현재 지도 기준 낮은 위험 구간입니다. 다만 개별 매물의 가격 프리미엄과 최근 거래 표본은 별도로 확인해야 합니다.`;
  }

  function buildTopSignalCopy(detail) {
    const score = toNumber(detail.riskScore);
    if (score >= 65) {
      return `${detail.riskArchetype} 패턴이 가장 강하게 관측됩니다. 매입 전 보류 사유와 대체 상권을 먼저 비교하세요.`;
    }
    if (score >= 45) {
      return `${detail.riskArchetype} 신호가 관측됩니다. 가격 부담과 거래 회전성을 한 번 더 확인하면 판단이 선명해집니다.`;
    }
    return `${detail.riskArchetype}에 가까운 낮은 위험 구간입니다. 후보로 유지하되 표본 신뢰도와 현장 임대 조건을 확인하세요.`;
  }

  function payloadDistrictByCode(payload) {
    const districts = Array.isArray(payload.districts) ? payload.districts : [];
    return new Map(
      districts
        .filter(isPlainObject)
        .map((district) => [String(district.code || ""), district])
        .filter(([code]) => Boolean(code))
    );
  }

  function normalizeDistrict(cell, payloadDistrict) {
    const score = clamp(toNumber(payloadDistrict?.riskScore, cell.fallbackScore), 0, 100);
    const readableSummary =
      hasReadableKorean(payloadDistrict?.riskSummary) && String(payloadDistrict.riskSummary).length <= 180
        ? String(payloadDistrict.riskSummary)
        : "";
    const readableGrade = hasReadableKorean(payloadDistrict?.riskGrade) ? String(payloadDistrict.riskGrade) : riskGrade(score);
    const readableArchetype = hasReadableKorean(payloadDistrict?.riskArchetype)
      ? String(payloadDistrict.riskArchetype)
      : cell.archetype;

    const detail = {
      ...cell,
      riskScore: Math.round(score),
      riskGrade: readableGrade,
      riskArchetype: readableArchetype,
      raw: payloadDistrict || {},
    };
    detail.riskSummary = readableSummary || buildRiskSummary(detail);
    detail.topSignalCopy = buildTopSignalCopy(detail);
    detail.tier = riskTier(detail.riskScore);
    detail.status = riskStatus(detail.riskScore);
    return detail;
  }

  function buildDistricts(payload) {
    const districtMap = payloadDistrictByCode(payload);
    return DISTRICT_CELLS.map((cell) => normalizeDistrict(cell, districtMap.get(cell.code)));
  }

  function selectInitialDistrict() {
    return state.districts.reduce((highest, item) => {
      if (!highest) return item;
      return toNumber(item.riskScore) > toNumber(highest.riskScore) ? item : highest;
    }, null);
  }

  function currentDistrict() {
    return state.districts.find((item) => item.code === state.selectedCode) || selectInitialDistrict() || state.districts[0];
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = String(value);
  }

  function setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        element.setAttribute(key, String(value));
      }
    });
    return element;
  }

  function svgElement(tagName, attributes = {}) {
    return setAttributes(document.createElementNS(SVG_NS, tagName), attributes);
  }

  function districtCodeSeed(code) {
    return String(code || "")
      .split("")
      .reduce((total, char) => total + char.charCodeAt(0), 0);
  }

  function cellPoints(cell) {
    const { x, y, rx, ry } = cell;
    const seed = districtCodeSeed(cell.code);
    const wobble = [
      [((seed % 5) - 2) * 0.016, ((seed % 7) - 3) * 0.012],
      [((seed % 3) - 1) * 0.018, ((seed % 11) - 5) * 0.007],
      [((seed % 13) - 6) * 0.008, ((seed % 5) - 2) * 0.014],
      [((seed % 7) - 3) * 0.012, ((seed % 3) - 1) * 0.018],
      [((seed % 11) - 5) * 0.007, ((seed % 13) - 6) * 0.008],
      [((seed % 5) - 2) * 0.014, ((seed % 7) - 3) * 0.012],
      [((seed % 3) - 1) * 0.018, ((seed % 11) - 5) * 0.007],
      [((seed % 13) - 6) * 0.008, ((seed % 5) - 2) * 0.014],
    ];
    const basePoints = [
      [x - rx * 0.78, y - ry * 0.94],
      [x - rx * 0.04, y - ry * 1.06],
      [x + rx * 0.72, y - ry * 0.76],
      [x + rx * 0.98, y - ry * 0.04],
      [x + rx * 0.54, y + ry * 0.82],
      [x - rx * 0.18, y + ry * 1.02],
      [x - rx * 0.86, y + ry * 0.54],
      [x - rx * 1.02, y - ry * 0.16],
    ]
      .map(([pointX, pointY], index) => [pointX + rx * wobble[index][0], pointY + ry * wobble[index][1]]);

    return basePoints
      .map((point) => point.map((value) => value.toFixed(1)).join(","))
      .join(" ");
  }

  function isInSeoulFootprint(x, y, districts) {
    return districts.some((district) => {
      const dx = (x - district.x) / (district.rx * 1.18);
      const dy = (y - district.y) / (district.ry * 1.12);
      return dx * dx + dy * dy <= 1;
    });
  }

  function distanceToDistrict(x, y, district) {
    const dx = (x - district.x) / Math.max(1, district.rx);
    const dy = (y - district.y) / Math.max(1, district.ry);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function gridRiskScore(x, y, selectedDistrict, districts) {
    let weightedScore = 0;
    let totalWeight = 0;

    districts.forEach((district) => {
      const distance = distanceToDistrict(x, y, district);
      const weight = 1 / Math.pow(distance + 0.78, 2.2);
      weightedScore += toNumber(district.riskScore) * weight;
      totalWeight += weight;
    });

    const baseScore = totalWeight > 0 ? weightedScore / totalWeight : 45;
    const selectedDistance = selectedDistrict ? distanceToDistrict(x, y, selectedDistrict) : 3;
    const selectedEmphasis = Math.max(0, 1 - selectedDistance / 2.35) * 6;
    const scanTexture = Math.sin(x * 0.031 + y * 0.017) * 2.2 + Math.cos(x * 0.013 - y * 0.023) * 1.6;
    return clamp(baseScore + selectedEmphasis + scanTexture, 0, 100);
  }

  function renderGridRiskLayer(svg, selectedDistrict, districts) {
    const layer = svgElement("g", {
      class: "v2-grid-risk-layer",
      "aria-label": "500m risk scan layer",
    });
    const cellSize = 14;
    const step = 18;

    for (let y = 48; y <= 512; y += step) {
      for (let x = 32; x <= 728; x += step) {
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        if (!isInSeoulFootprint(centerX, centerY, districts)) continue;

        const selectedDistance = selectedDistrict ? distanceToDistrict(centerX, centerY, selectedDistrict) : 3;
        const seed = (Math.floor(x / step) * 17 + Math.floor(y / step) * 23) % 19;
        if (seed === 0 && selectedDistance > 1.35) continue;

        const score = gridRiskScore(centerX, centerY, selectedDistrict, districts);
        const tier = riskTier(score);
        const opacity = clamp(0.15 + score / 190 + Math.max(0, 1.1 - selectedDistance) * 0.12, 0.18, 0.55);
        const rect = svgElement("rect", {
          class: `v2-grid-cell is-${tier}${selectedDistance <= 1.05 ? " is-selected-near" : ""}`,
          x,
          y,
          width: cellSize,
          height: cellSize,
          rx: "2",
          "data-grid-risk": Math.round(score),
          style: `--grid-opacity:${opacity.toFixed(2)}`,
        });
        layer.appendChild(rect);
      }
    }

    svg.appendChild(layer);
  }

  function renderMapDetails(svg) {
    svg.appendChild(
      svgElement("path", {
        class: "v2-map-river",
        d: "M36 344 C134 294 216 336 302 306 C396 274 454 326 544 288 C620 258 684 254 732 226",
      })
    );

    const roadLines = svgElement("g", { class: "v2-map-road-lines", "aria-hidden": "true" });
    [
      "M58 392 C150 350 230 374 326 332 C420 292 514 302 706 246",
      "M126 118 C214 176 296 216 368 292 C446 374 536 410 664 438",
      "M106 494 C176 430 248 402 344 356 C456 302 540 250 646 132",
    ].forEach((d) => {
      roadLines.appendChild(svgElement("path", { d }));
    });
    svg.appendChild(roadLines);

    const scanLines = svgElement("g", { class: "v2-map-scan-lines", "aria-hidden": "true" });
    ["M92 126 H690", "M56 260 H722", "M74 432 H674", "M132 68 V502", "M308 46 V514", "M512 60 V488"].forEach((d) => {
      scanLines.appendChild(svgElement("path", { d }));
    });
    svg.appendChild(scanLines);

    const labels = svgElement("g", { class: "v2-map-scan-label", "aria-hidden": "true" });
    const label = svgElement("text", { x: "34", y: "38" });
    label.textContent = "500m risk scan layer";
    const coordinate = svgElement("text", { x: "588", y: "504" });
    coordinate.textContent = "SEOUL GRID / VISUAL MODEL";
    labels.append(label, coordinate);
    svg.appendChild(labels);
  }

  function renderMapBackground(svg) {
    const defs = svgElement("defs");
    const gridPattern = svgElement("pattern", {
      id: "v2-map-grid",
      width: "38",
      height: "38",
      patternUnits: "userSpaceOnUse",
    });
    gridPattern.appendChild(svgElement("path", { d: "M38 0 H0 V38", class: "v2-map-grid-path" }));

    const glow = svgElement("radialGradient", { id: "v2-map-core", cx: "52%", cy: "48%", r: "62%" });
    glow.appendChild(svgElement("stop", { offset: "0%", "stop-color": "#ff3347", "stop-opacity": "0.14" }));
    glow.appendChild(svgElement("stop", { offset: "58%", "stop-color": "#ff3347", "stop-opacity": "0.035" }));
    glow.appendChild(svgElement("stop", { offset: "100%", "stop-color": "#ff3347", "stop-opacity": "0" }));

    defs.append(gridPattern, glow);
    svg.appendChild(defs);
    svg.appendChild(svgElement("desc", { id: "v2-map-desc" }));
    svg.querySelector("#v2-map-desc").textContent = "서울 25개 자치구의 상가 매입 리스크를 카토그램으로 표현한 SVG 지도입니다.";
    svg.appendChild(svgElement("rect", { class: "v2-map-grid-fill", x: "0", y: "0", width: "760", height: "540" }));
    svg.appendChild(svgElement("rect", { class: "v2-map-core", x: "0", y: "0", width: "760", height: "540" }));
  }

  function renderMapTarget(svg, detail) {
    const group = svgElement("g", { class: "v2-map-target", "aria-hidden": "true" });
    const radius = Math.max(detail.rx, detail.ry) + 13;
    group.appendChild(svgElement("circle", { cx: detail.x, cy: detail.y, r: radius }));
    group.appendChild(svgElement("line", { x1: detail.x - radius - 18, y1: detail.y, x2: detail.x - radius + 7, y2: detail.y }));
    group.appendChild(svgElement("line", { x1: detail.x + radius - 7, y1: detail.y, x2: detail.x + radius + 18, y2: detail.y }));
    group.appendChild(svgElement("line", { x1: detail.x, y1: detail.y - radius - 18, x2: detail.x, y2: detail.y - radius + 7 }));
    group.appendChild(svgElement("line", { x1: detail.x, y1: detail.y + radius - 7, x2: detail.x, y2: detail.y + radius + 18 }));
    svg.appendChild(group);
  }

  function renderRiskMap() {
    const svg = document.querySelector("[data-v2-risk-map]");
    const selected = currentDistrict();
    if (!svg || !selected) return;

    svg.replaceChildren();
    svg.setAttribute("aria-describedby", "v2-map-desc");
    renderMapBackground(svg);
    renderGridRiskLayer(svg, selected, state.districts);
    renderMapDetails(svg);

    const cellsGroup = svgElement("g", { class: "v2-map-cells" });
    state.districts.forEach((detail) => {
      const group = svgElement("g", {
        class: `v2-map-cell is-${detail.tier}${detail.code === selected.code ? " is-selected" : ""}`,
        "data-code": detail.code,
        role: "button",
        tabindex: "0",
        focusable: "true",
        "aria-label": `${detail.name} 리스크 ${detail.riskScore}점, ${riskStatus(detail.riskScore)} 구간`,
      });
      const polygon = svgElement("polygon", { points: cellPoints(detail) });
      const label = svgElement("text", {
        class: "v2-map-cell-label",
        x: detail.x,
        y: detail.y - 2,
        "text-anchor": "middle",
      });
      label.textContent = shortDistrictName(detail.name);

      const score = svgElement("text", {
        class: "v2-map-cell-score",
        x: detail.x,
        y: detail.y + 17,
        "text-anchor": "middle",
      });
      score.textContent = String(detail.riskScore);

      group.append(polygon, label, score);
      group.addEventListener("click", () => selectDistrict(detail.code));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectDistrict(detail.code);
        }
      });
      cellsGroup.appendChild(group);
    });

    svg.appendChild(cellsGroup);
    renderMapTarget(svg, selected);
  }

  function normalizeRentDelta(value, fallback) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return `${value > 0 ? "+" : ""}${Math.round(value)}%`;
    }
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
    return fallback;
  }

  function normalizeCandidate(item, index) {
    if (!isPlainObject(item)) return null;

    const districtName = item.districtName || item.name || item.district || item.title;
    if (!hasReadableKorean(districtName)) return null;

    const riskScore = clamp(toNumber(item.riskScore ?? item.score ?? item.risk_index, 50), 0, 100);
    return {
      rank: toNumber(item.rank, index + 1),
      districtName: String(districtName),
      riskScore: Math.round(riskScore),
      status: riskStatus(riskScore),
      rentDelta: normalizeRentDelta(item.rentDelta ?? item.rentDeltaPct ?? item.rent_delta, index === 0 ? "-12%" : index === 1 ? "-8%" : "-5%"),
      note: String(item.note || item.whyBetter || item.reason || "대체 후보 조건 확인"),
    };
  }

  function fallbackCandidatesFor(detail) {
    const selectedScore = toNumber(detail.riskScore);
    return state.districts
      .filter((candidate) => candidate.code !== detail.code)
      .sort((left, right) => toNumber(left.riskScore) - toNumber(right.riskScore))
      .slice(0, 3)
      .map((candidate, index) => {
        const scoreGap = Math.max(4, Math.round((selectedScore - toNumber(candidate.riskScore)) / 2));
        return {
          rank: index + 1,
          districtName: candidate.name,
          riskScore: candidate.riskScore,
          status: riskStatus(candidate.riskScore),
          rentDelta: `-${Math.min(28, scoreGap + 6)}%`,
          note: `${candidate.riskArchetype} · 위험 점수 ${scoreGap}p 완화 가능`,
        };
      });
  }

  function candidatesForDistrict(detail) {
    const rawCandidates = Array.isArray(detail.raw?.replacementCandidates) ? detail.raw.replacementCandidates : [];
    const normalized = rawCandidates.map(normalizeCandidate).filter(Boolean).slice(0, 3);
    if (normalized.length >= 3) return normalized;
    return fallbackCandidatesFor(detail);
  }

  function appendTextElement(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function renderCandidates(candidates) {
    const list = document.querySelector("[data-candidate-list]");
    if (!list) return;

    const safeCandidates = Array.isArray(candidates) && candidates.length ? candidates.slice(0, 3) : [];
    const fragment = document.createDocumentFragment();
    const header = document.createElement("div");
    header.className = "v2-candidate-header";
    ["Rank", "District", "Signal Summary", "Score", "Status", "Delta"].forEach((label) => {
      appendTextElement(header, "span", "", label);
    });
    fragment.appendChild(header);

    safeCandidates.forEach((candidate, index) => {
      const normalized = normalizeCandidate(candidate, index) || candidate;
      const status = riskStatus(normalized.riskScore);
      const tone = toneClass(status);
      const row = document.createElement("article");
      row.className = `v2-candidate-row ${tone}`;
      row.setAttribute(
        "aria-label",
        `${normalized.rank}순위 ${normalized.districtName}, 리스크 ${normalized.riskScore}, 상태 ${status}, 임대료 차이 ${normalized.rentDelta}`
      );

      appendTextElement(row, "span", "v2-candidate-rank", String(normalized.rank).padStart(2, "0"));

      const nameCell = document.createElement("div");
      nameCell.className = "v2-candidate-name";
      nameCell.textContent = normalized.districtName;
      row.appendChild(nameCell);
      appendTextElement(row, "span", "v2-candidate-signal", normalized.note);

      appendTextElement(row, "strong", "v2-candidate-score", String(normalized.riskScore));
      appendTextElement(row, "span", `v2-candidate-status ${tone}`, status);
      appendTextElement(row, "span", "v2-candidate-rent", normalized.rentDelta);

      fragment.appendChild(row);
    });

    list.replaceChildren(fragment);
  }

  function renderSelectedDistrict() {
    const detail = currentDistrict();
    if (!detail) return;

    setText("#selected-node-label", `${detail.name} · ${riskStatus(detail.riskScore)} · ${detail.riskScore}`);
    setText("#overall-risk-score", detail.riskScore);
    setText("#overall-risk-summary", detail.riskSummary);
    setText("#top-signal-district", `${detail.name} · ${detail.riskArchetype}`);
    setText("#top-signal-copy", detail.topSignalCopy);

    const meter = document.querySelector("[data-risk-meter]");
    if (meter) meter.style.width = `${clamp(detail.riskScore, 0, 100)}%`;

    renderCandidates(candidatesForDistrict(detail));
  }

  function selectDistrict(code) {
    if (!state.districts.some((item) => item.code === code)) return;
    state.selectedCode = code;
    renderRiskMap();
    renderSelectedDistrict();
  }

  function safeRender() {
    try {
      const payload = getAvailablePayload();
      state.districts = buildDistricts(payload);
      state.selectedCode = selectInitialDistrict()?.code || DISTRICT_CELLS[0].code;
      renderRiskMap();
      renderSelectedDistrict();
    } catch (error) {
      console.warn("[Redveil v2] Dashboard enhancement skipped.", error);

      try {
        state.districts = buildDistricts({});
        state.selectedCode = selectInitialDistrict()?.code || DISTRICT_CELLS[0].code;
        renderRiskMap();
        renderSelectedDistrict();
      } catch (fallbackError) {
        console.warn("[Redveil v2] Fallback render failed.", fallbackError);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeRender, { once: true });
  } else {
    safeRender();
  }
})();
