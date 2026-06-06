(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const MAP_WIDTH = 760;
  const MAP_HEIGHT = 540;
  const MAP_PADDING = { top: 34, right: 42, bottom: 34, left: 42 };
  const BOUNDARY_DATA_URL = "./data/seoul-districts.geojson";

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
    mapProject: null,
    boundarySource: null,
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
    if (tier === "high") return "고위험";
    if (tier === "watch") return "관찰";
    return "낮음";
  }

  function riskGrade(score) {
    const tier = riskTier(score);
    if (tier === "high") return "고위험";
    if (tier === "watch") return "관찰";
    return "낮음";
  }

  function toneClass(statusOrScore) {
    const status = typeof statusOrScore === "number" ? riskStatus(statusOrScore) : String(statusOrScore || "");
    const normalized = status.toLowerCase();
    if (normalized.includes("high") || normalized.includes("높") || normalized.includes("위험")) return "is-high";
    if (normalized.includes("watch") || normalized.includes("주의") || normalized.includes("관찰")) return "is-watch";
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
    const dataAvailable = isPlainObject(payloadDistrict) && payloadDistrict.riskScore !== undefined;
    const score = dataAvailable ? clamp(toNumber(payloadDistrict.riskScore), 0, 100) : 0;
    const readableSummary =
      hasReadableKorean(payloadDistrict?.riskSummary) && String(payloadDistrict.riskSummary).length <= 180
        ? String(payloadDistrict.riskSummary)
        : "";
    const readableGrade = dataAvailable
      ? hasReadableKorean(payloadDistrict?.riskGrade) ? String(payloadDistrict.riskGrade) : riskGrade(score)
      : "데이터 확인 필요";
    const readableArchetype = dataAvailable && hasReadableKorean(payloadDistrict?.riskArchetype)
      ? String(payloadDistrict.riskArchetype)
      : dataAvailable ? cell.archetype : "데이터 연결 필요";

    const detail = {
      ...cell,
      riskScore: Math.round(score),
      riskGrade: readableGrade,
      riskArchetype: readableArchetype,
      dataAvailable,
      raw: payloadDistrict || {},
    };
    detail.riskSummary = dataAvailable
      ? readableSummary || buildRiskSummary(detail)
      : "리스크 payload를 연결한 뒤 자치구 점수와 해석을 확인할 수 있습니다.";
    detail.topSignalCopy = dataAvailable
      ? buildTopSignalCopy(detail)
      : "현재 자치구의 리스크 신호를 불러오지 못했습니다. 데이터 연결 상태를 먼저 확인하세요.";
    detail.tier = dataAvailable ? riskTier(detail.riskScore) : "unavailable";
    detail.status = dataAvailable ? riskStatus(detail.riskScore) : "데이터 확인 필요";
    return detail;
  }

  function buildDistricts(payload) {
    const districtMap = payloadDistrictByCode(payload);
    return DISTRICT_CELLS.map((cell) => normalizeDistrict(cell, districtMap.get(cell.code)));
  }

  function featureRings(feature) {
    const geometry = feature && feature.geometry;
    if (!geometry || !Array.isArray(geometry.coordinates)) return [];
    if (geometry.type === "Polygon") return geometry.coordinates.filter(Array.isArray);
    if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((polygon) => polygon.filter(Array.isArray));
    return [];
  }

  function forEachCoordinate(features, callback) {
    features.forEach((feature) => {
      featureRings(feature).forEach((ring) => {
        ring.forEach((coordinate) => {
          if (Array.isArray(coordinate) && coordinate.length >= 2) callback(toNumber(coordinate[0]), toNumber(coordinate[1]));
        });
      });
    });
  }

  function createBoundaryProjection(features) {
    const coordinates = [];
    forEachCoordinate(features, (lon, lat) => coordinates.push([lon, lat]));
    if (!coordinates.length) return null;

    const meanLat = coordinates.reduce((sum, item) => sum + item[1], 0) / coordinates.length;
    const lonScale = Math.cos((meanLat * Math.PI) / 180);
    const projected = coordinates.map(([lon, lat]) => [lon * lonScale, lat]);
    const minX = Math.min(...projected.map((item) => item[0]));
    const maxX = Math.max(...projected.map((item) => item[0]));
    const minY = Math.min(...projected.map((item) => item[1]));
    const maxY = Math.max(...projected.map((item) => item[1]));
    const availableWidth = MAP_WIDTH - MAP_PADDING.left - MAP_PADDING.right;
    const availableHeight = MAP_HEIGHT - MAP_PADDING.top - MAP_PADDING.bottom;
    const scale = Math.min(availableWidth / Math.max(maxX - minX, 0.0001), availableHeight / Math.max(maxY - minY, 0.0001));
    const mapWidth = (maxX - minX) * scale;
    const mapHeight = (maxY - minY) * scale;
    const offsetX = MAP_PADDING.left + (availableWidth - mapWidth) / 2;
    const offsetY = MAP_PADDING.top + (availableHeight - mapHeight) / 2;

    return function project(lon, lat) {
      const x = (lon * lonScale - minX) * scale + offsetX;
      const y = (maxY - lat) * scale + offsetY;
      return [x, y];
    };
  }

  function pathFromRings(rings) {
    return rings
      .map((ring) => {
        if (!ring.length) return "";
        const [firstX, firstY] = ring[0];
        const points = ring.slice(1).map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`);
        return `M${firstX.toFixed(1)} ${firstY.toFixed(1)} ${points.join(" ")} Z`;
      })
      .join(" ");
  }

  function projectedBounds(rings) {
    const points = rings.flat();
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };
  }

  function projectBoundaryGeoJson(geojson) {
    const features = Array.isArray(geojson?.features) ? geojson.features : [];
    const project = createBoundaryProjection(features);
    if (!project) return null;

    const boundaries = new Map();
    features.forEach((feature) => {
      const properties = isPlainObject(feature.properties) ? feature.properties : {};
      const code = String(properties.code || properties.SIGNGU_CD || "");
      if (!code) return;

      const rings = featureRings(feature)
        .map((ring) =>
          ring
            .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2)
            .map((coordinate) => project(toNumber(coordinate[0]), toNumber(coordinate[1])))
        )
        .filter((ring) => ring.length >= 3);
      if (!rings.length) return;

      const bounds = projectedBounds(rings);
      const centroidSource = Array.isArray(properties.centroid) ? properties.centroid : null;
      const centroid = centroidSource
        ? project(toNumber(centroidSource[0]), toNumber(centroidSource[1]))
        : [(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2];
      boundaries.set(code, {
        code,
        name: properties.name || properties.SIGNGU_NM,
        rings,
        path: pathFromRings(rings),
        x: centroid[0],
        y: centroid[1],
        rx: clamp((bounds.maxX - bounds.minX) / 2, 20, 92),
        ry: clamp((bounds.maxY - bounds.minY) / 2, 18, 78),
        bounds,
      });
    });

    return { boundaries, project };
  }

  function applyBoundaryGeometry(districts, geojson) {
    const projected = projectBoundaryGeoJson(geojson);
    if (!projected || projected.boundaries.size < 25) {
      state.mapProject = null;
      state.boundarySource = null;
      return districts;
    }

    state.mapProject = projected.project;
    state.boundarySource = geojson.source || {};
    return districts.map((district) => {
      const boundary = projected.boundaries.get(district.code);
      if (!boundary) return district;
      return {
        ...district,
        name: hasReadableKorean(boundary.name) ? boundary.name : district.name,
        x: boundary.x,
        y: boundary.y,
        rx: boundary.rx,
        ry: boundary.ry,
        boundaryPath: boundary.path,
        boundaryRings: boundary.rings,
        boundaryBounds: boundary.bounds,
      };
    });
  }

  async function loadBoundaryGeoJson() {
    if (typeof window.fetch !== "function") return null;
    try {
      const response = await window.fetch(BOUNDARY_DATA_URL);
      if (!response.ok) return null;
      const geojson = await response.json();
      if (!isPlainObject(geojson) || !Array.isArray(geojson.features)) return null;
      return geojson;
    } catch (error) {
      console.warn("[Redveil v2] Boundary GeoJSON unavailable.", error);
      return null;
    }
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

  function renderMapBackground(svg) {
    const defs = svgElement("defs");
    const glow = svgElement("radialGradient", { id: "v2-map-core", cx: "52%", cy: "48%", r: "62%" });
    glow.appendChild(svgElement("stop", { offset: "0%", "stop-color": "#ff3347", "stop-opacity": "0.075" }));
    glow.appendChild(svgElement("stop", { offset: "58%", "stop-color": "#ff3347", "stop-opacity": "0.022" }));
    glow.appendChild(svgElement("stop", { offset: "100%", "stop-color": "#ff3347", "stop-opacity": "0" }));

    const focusBlur = svgElement("filter", {
      id: "v2-focus-blur",
      x: "-30%",
      y: "-30%",
      width: "160%",
      height: "160%",
    });
    focusBlur.appendChild(svgElement("feGaussianBlur", { stdDeviation: "8" }));

    defs.append(glow, focusBlur);
    svg.appendChild(defs);
    svg.appendChild(svgElement("desc", { id: "v2-map-desc" }));
    svg.querySelector("#v2-map-desc").textContent = state.mapProject
      ? "서울 25개 자치구 실제 경계를 기반으로 상가 매입 리스크를 표현한 SVG 지도입니다."
      : "서울 25개 자치구의 상가 매입 리스크를 카토그램으로 표현한 SVG 지도입니다.";
    svg.appendChild(svgElement("rect", { class: "v2-map-core", x: "0", y: "0", width: MAP_WIDTH, height: MAP_HEIGHT }));
  }

  function renderMapTarget(svg, detail) {
    if (!detail.boundaryPath) return;

    const group = svgElement("g", { class: "v2-map-target", "aria-hidden": "true" });
    const radius = Math.max(detail.rx, detail.ry) + 15;
    group.appendChild(svgElement("circle", { class: "v2-map-focus-halo", cx: detail.x, cy: detail.y, r: radius + 34 }));
    group.appendChild(svgElement("circle", { class: "v2-map-focus-ring is-outer", cx: detail.x, cy: detail.y, r: radius + 21 }));
    group.appendChild(svgElement("circle", { class: "v2-map-focus-ring", cx: detail.x, cy: detail.y, r: radius }));
    group.appendChild(svgElement("path", { class: "v2-selected-district-boundary", d: detail.boundaryPath }));

    const crosshair = svgElement("g", { class: "v2-map-crosshair" });
    crosshair.appendChild(svgElement("line", { x1: detail.x - radius - 40, y1: detail.y, x2: detail.x - radius + 5, y2: detail.y }));
    crosshair.appendChild(svgElement("line", { x1: detail.x + radius - 5, y1: detail.y, x2: detail.x + radius + 40, y2: detail.y }));
    crosshair.appendChild(svgElement("line", { x1: detail.x, y1: detail.y - radius - 40, x2: detail.x, y2: detail.y - radius + 5 }));
    crosshair.appendChild(svgElement("line", { x1: detail.x, y1: detail.y + radius - 5, x2: detail.x, y2: detail.y + radius + 40 }));
    group.appendChild(crosshair);
    group.appendChild(svgElement("circle", { class: "v2-map-focus-core", cx: detail.x, cy: detail.y, r: "3.2" }));
    svg.appendChild(group);
  }

  function renderRiskMap() {
    const svg = document.querySelector("[data-v2-risk-map]");
    const selected = currentDistrict();
    if (!svg || !selected) return;

    svg.replaceChildren();
    svg.setAttribute("aria-describedby", "v2-map-desc");
    renderMapBackground(svg);

    const districtsGroup = svgElement("g", { class: "v2-map-districts" });
    state.districts.filter((detail) => detail.boundaryPath).forEach((detail) => {
      const group = svgElement("g", {
        class: `v2-map-district is-${detail.tier}${detail.code === selected.code ? " is-selected" : ""}`,
        "data-code": detail.code,
        role: "button",
        tabindex: "0",
        focusable: "true",
        "aria-pressed": detail.code === selected.code ? "true" : "false",
        "aria-label": detail.dataAvailable
          ? `${detail.name} 리스크 ${detail.riskScore}점, ${riskStatus(detail.riskScore)} 구간`
          : `${detail.name} 리스크 데이터 확인 필요`,
      });
      const shape = svgElement("path", { d: detail.boundaryPath });
      const label = svgElement("text", {
        class: "v2-map-district-label",
        x: detail.x,
        y: detail.y - 2,
        "text-anchor": "middle",
      });
      label.textContent = shortDistrictName(detail.name);

      const score = svgElement("text", {
        class: "v2-map-district-score",
        x: detail.x,
        y: detail.y + 17,
        "text-anchor": "middle",
      });
      score.textContent = detail.dataAvailable ? String(detail.riskScore) : "--";

      group.append(shape, label, score);
      group.addEventListener("click", () => selectDistrict(detail.code));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectDistrict(detail.code, true);
          return;
        }
        if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          const currentIndex = state.districts.findIndex((item) => item.code === detail.code);
          const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
          const nextIndex = (currentIndex + direction + state.districts.length) % state.districts.length;
          selectDistrict(state.districts[nextIndex].code, true);
        }
      });
      districtsGroup.appendChild(group);
    });

    if (!districtsGroup.childNodes.length) {
      const message = svgElement("text", {
        class: "v2-map-unavailable",
        x: MAP_WIDTH / 2,
        y: MAP_HEIGHT / 2,
        "text-anchor": "middle",
      });
      message.textContent = "서울 경계 지도를 불러오지 못했습니다.";
      svg.appendChild(message);
      return;
    }

    svg.appendChild(districtsGroup);
    renderMapTarget(svg, selected);
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
      scoreDelta: toNumber(item.scoreDelta, 0),
      note: String(item.note || item.whyBetter || item.reason || "대체 후보 조건 확인"),
    };
  }

  function fallbackCandidatesFor(detail) {
    const selectedScore = toNumber(detail.riskScore);
    return state.districts
      .filter((candidate) => candidate.code !== detail.code && candidate.dataAvailable)
      .sort((left, right) => toNumber(left.riskScore) - toNumber(right.riskScore))
      .slice(0, 3)
      .map((candidate, index) => {
        const scoreDelta = Math.round(toNumber(candidate.riskScore) - selectedScore);
        const comparison = scoreDelta < 0
          ? `선택 구보다 총 리스크가 ${Math.abs(scoreDelta)}점 낮습니다.`
          : scoreDelta > 0
            ? `선택 구보다 총 리스크가 ${scoreDelta}점 높지만 비교 기준으로 확인할 수 있습니다.`
            : "선택 구와 총 리스크 점수가 같은 비교 기준 후보입니다.";
        return {
          rank: index + 1,
          districtName: candidate.name,
          riskScore: candidate.riskScore,
          status: riskStatus(candidate.riskScore),
          scoreDelta,
          note: `${candidate.riskArchetype} · ${comparison}`,
        };
      });
  }

  function candidatesForDistrict(detail) {
    if (!detail.dataAvailable) return [];
    const rawCandidates = Array.isArray(detail.raw?.replacementCandidates) ? detail.raw.replacementCandidates : [];
    const normalized = rawCandidates.map(normalizeCandidate).filter(Boolean).slice(0, 3);
    const normalizedNames = new Set(normalized.map((candidate) => candidate.districtName));
    const fallback = fallbackCandidatesFor(detail).filter((candidate) => !normalizedNames.has(candidate.districtName));
    return [...normalized, ...fallback]
      .slice(0, 3)
      .map((candidate, index) => ({
        ...candidate,
        rank: index + 1,
        scoreDelta: Math.round(toNumber(candidate.riskScore) - toNumber(detail.riskScore)),
      }));
  }

  function formatScoreDelta(value) {
    const numeric = Math.round(toNumber(value));
    if (numeric > 0) return `+${numeric}점`;
    if (numeric < 0) return `${numeric}점`;
    return "0점";
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
    if (!safeCandidates.length) {
      const empty = document.createElement("p");
      empty.className = "v2-candidate-empty";
      empty.textContent = "비교 가능한 자치구 데이터를 불러오지 못했습니다.";
      list.replaceChildren(empty);
      return;
    }
    const header = document.createElement("div");
    header.className = "v2-candidate-header";
    ["순위", "자치구", "비교 근거", "점수", "등급", "점수 격차"].forEach((label) => {
      appendTextElement(header, "span", "", label);
    });
    fragment.appendChild(header);

    safeCandidates.forEach((candidate, index) => {
      const normalized = normalizeCandidate(candidate, index) || candidate;
      const status = riskStatus(normalized.riskScore);
      const tone = toneClass(status);
      const deltaTone = toNumber(normalized.scoreDelta) <= 0 ? "is-better" : "is-higher";
      const row = document.createElement("article");
      row.className = `v2-candidate-row ${tone}`;
      row.setAttribute(
        "aria-label",
        `${normalized.rank}순위 ${normalized.districtName}, 리스크 ${normalized.riskScore}점, ${status}, 선택 구 대비 ${formatScoreDelta(normalized.scoreDelta)}`
      );

      appendTextElement(row, "span", "v2-candidate-rank", String(normalized.rank).padStart(2, "0"));

      const nameCell = document.createElement("div");
      nameCell.className = "v2-candidate-name";
      nameCell.textContent = normalized.districtName;
      row.appendChild(nameCell);
      appendTextElement(row, "span", "v2-candidate-signal", normalized.note);

      appendTextElement(row, "strong", "v2-candidate-score", String(normalized.riskScore));
      appendTextElement(row, "span", `v2-candidate-status ${tone}`, status);
      appendTextElement(row, "span", `v2-candidate-gap ${deltaTone}`, formatScoreDelta(normalized.scoreDelta));

      fragment.appendChild(row);
    });

    list.replaceChildren(fragment);
  }

  function renderSelectedDistrict() {
    const detail = currentDistrict();
    if (!detail) return;
    const score = toNumber(detail.riskScore);
    const decisionLabel = !detail.dataAvailable
      ? "데이터 확인 필요"
      : score >= 65 ? "보류 우선 검토" : score >= 45 ? "비교 후 판단" : "후보 유지";
    const decisionCopy = !detail.dataAvailable
      ? `${detail.name}의 리스크 payload를 연결한 뒤 판단 모드를 확인할 수 있습니다.`
      : score >= 65
        ? `${detail.name}은 고위험 신호가 강합니다. 매입 판단보다 가격 부담과 대체 후보 검토를 먼저 진행하세요.`
        : score >= 45
          ? `${detail.name}은 주의 구간입니다. 후보로 유지하되 임대료 조건과 거래 표본을 함께 비교하세요.`
          : `${detail.name}은 낮은 위험 구간입니다. 현장 임대 조건과 개별 매물 프리미엄을 확인하면 됩니다.`;

    const status = detail.dataAvailable ? riskStatus(detail.riskScore) : "데이터 확인 필요";
    const tone = detail.dataAvailable ? toneClass(detail.riskScore) : "is-unavailable";
    setText("#selected-node-label", detail.dataAvailable ? `${detail.name} · ${status} · ${detail.riskScore}점` : `${detail.name} · 데이터 확인 필요`);
    setText("#map-selected-name", detail.name);
    setText("#map-selected-tier", `${status} 구간`);
    setText("#map-layer-mode", state.mapProject ? "실제 경계 연결됨" : "경계 데이터 오프라인");
    setText("#selected-district-name", detail.name);
    setText("#selected-tier-badge", status);
    setText("#overall-risk-score", detail.dataAvailable ? detail.riskScore : "--");
    setText("#overall-risk-summary", detail.riskSummary);
    setText("#top-signal-district", `${detail.name} · ${detail.riskArchetype}`);
    setText("#top-signal-copy", detail.topSignalCopy);
    setText("#decision-mode-label", decisionLabel);
    setText("#decision-mode-copy", decisionCopy);

    const meter = document.querySelector("[data-risk-meter]");
    if (meter) {
      meter.style.width = `${clamp(detail.riskScore, 0, 100)}%`;
      meter.className = tone;
    }

    const tierBadge = document.querySelector("#selected-tier-badge");
    if (tierBadge) tierBadge.className = `v2-tier-badge ${tone}`;

    const reportLink = document.querySelector("#selected-district-report-link");
    if (reportLink) reportLink.href = `./districts.html?district=${encodeURIComponent(detail.code)}`;

    renderCandidates(candidatesForDistrict(detail));
  }

  function selectDistrict(code, shouldFocus = false) {
    if (!state.districts.some((item) => item.code === code)) return;
    state.selectedCode = code;
    renderRiskMap();
    renderSelectedDistrict();
    if (shouldFocus) {
      document.querySelector(`.v2-map-district[data-code="${code}"]`)?.focus();
    }
  }

  async function safeRender() {
    try {
      const payload = getAvailablePayload();
      const geojson = await loadBoundaryGeoJson();
      state.districts = geojson ? applyBoundaryGeometry(buildDistricts(payload), geojson) : buildDistricts(payload);
      state.selectedCode = selectInitialDistrict()?.code || DISTRICT_CELLS[0].code;
      setText("#v2-data-updated", payload.summary?.latestMonth ? `${payload.summary.latestMonth} 기준 데이터` : "데이터 시점 확인 필요");
      setText("#v2-boundary-status", state.mapProject ? "실제 자치구 경계 연결됨" : "경계 데이터 확인 필요");
      renderRiskMap();
      renderSelectedDistrict();
    } catch (error) {
      console.warn("[Redveil v2] Dashboard enhancement skipped.", error);

      try {
        state.districts = buildDistricts({});
        state.mapProject = null;
        state.boundarySource = null;
        state.selectedCode = selectInitialDistrict()?.code || DISTRICT_CELLS[0].code;
        setText("#v2-data-updated", "데이터 연결 확인 필요");
        setText("#v2-boundary-status", "경계 데이터 확인 필요");
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
