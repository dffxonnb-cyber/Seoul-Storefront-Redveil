(function () {
  const {
    payload,
    formatNumber,
    riskTone,
    drawLineChart,
    polishCopy,
    reliabilityInfo,
    benchmarkInfo,
    renderReliabilityBadges,
  } = window.RedveilV2 || {};
  if (!payload) return;

  const state = {
    districts: payload.districts || [],
    selectedCode: payload.districts?.[0]?.code || null,
    mapFeatures: [],
    mapGeometryLoaded: false,
  };

  const mapCells = [
    ["11320", "도봉구", 394, 74, 50, 42],
    ["11350", "노원구", 486, 102, 57, 48],
    ["11305", "강북구", 320, 128, 58, 47],
    ["11380", "은평구", 212, 164, 68, 55],
    ["11290", "성북구", 386, 174, 62, 52],
    ["11260", "중랑구", 516, 190, 58, 48],
    ["11110", "종로구", 296, 230, 64, 50],
    ["11410", "서대문구", 196, 258, 60, 48],
    ["11230", "동대문구", 424, 250, 58, 48],
    ["11140", "중구", 314, 300, 52, 43],
    ["11200", "성동구", 424, 318, 58, 47],
    ["11215", "광진구", 532, 310, 58, 48],
    ["11440", "마포구", 172, 334, 70, 50],
    ["11170", "용산구", 302, 378, 65, 50],
    ["11560", "영등포구", 162, 414, 66, 49],
    ["11500", "강서구", 58, 382, 74, 54],
    ["11470", "양천구", 82, 462, 58, 45],
    ["11530", "구로구", 182, 492, 60, 46],
    ["11545", "금천구", 258, 498, 54, 42],
    ["11590", "동작구", 294, 444, 58, 45],
    ["11620", "관악구", 370, 492, 68, 47],
    ["11650", "서초구", 444, 430, 78, 58],
    ["11680", "강남구", 540, 408, 70, 53],
    ["11710", "송파구", 632, 380, 66, 50],
    ["11740", "강동구", 686, 300, 60, 48],
  ].map(([code, name, x, y, rx, ry]) => ({ code, name, x, y, rx, ry }));

  const byCode = () => new Map(state.districts.map((district) => [district.code, district]));

async function loadDistrictGeometry() {
  try {
    const response = await fetch("./assets/seoul-districts.geojson");
    if (!response.ok) {
      throw new Error(`District geometry request failed: ${response.status}`);
    }

    const geojson = await response.json();
    const features = Array.isArray(geojson.features) ? geojson.features : [];

    state.mapFeatures = features;
    state.mapGeometryLoaded = features.length > 0;

    console.info(`[Redveil] Seoul district geometry loaded: ${features.length} features`);
  } catch (error) {
    state.mapFeatures = [];
    state.mapGeometryLoaded = false;
    console.warn("[Redveil] District geometry load failed. Falling back to abstract risk map.", error);
  }
}

function featureDistrictCode(feature) {
  const props = feature?.properties || {};
  return props.code || props.SIG_CD || props.sig_cd || props.adm_cd || props.ADM_CD || null;
}

function featureDistrictName(feature) {
  const props = feature?.properties || {};
  return props.name || props.SIG_KOR_NM || props.sig_kor_nm || props.adm_nm || props.ADM_NM || null;
}

function districtFromFeature(feature) {
  const code = featureDistrictCode(feature);
  const name = featureDistrictName(feature);

  const byCodeMatch = state.districts.find((item) => String(item.code) === String(code));
  if (byCodeMatch) return byCodeMatch;

  const byNameMatch = state.districts.find((item) => String(item.name) === String(name));
  return byNameMatch || null;
}

function matchedGeometryCount() {
  return state.mapFeatures.filter((feature) => districtFromFeature(feature)).length;
}

document.getElementById("district-coverage").textContent = `${state.districts.length}개 구`;

  function visibleDistricts(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return state.districts;
    return state.districts.filter((item) => item.name.includes(trimmed));
  }

  function riskTier(score) {
    const value = Number(score || 0);
    if (value >= 60) return "high";
    if (value >= 45) return "watch";
    return "low";
  }

  function riskTierLabel(score) {
    const tier = riskTier(score);
    if (tier === "high") return "High risk zone";
    if (tier === "watch") return "Watch zone";
    return "Low risk zone";
  }

  function shortDistrictName(name) {
    return String(name || "").replace(/구$/, "");
  }

  function hexPoints({ x, y, rx, ry }) {
    return [
      [x - rx * 0.6, y - ry],
      [x + rx * 0.55, y - ry * 0.86],
      [x + rx, y],
      [x + rx * 0.42, y + ry],
      [x - rx * 0.58, y + ry * 0.82],
      [x - rx, y - ry * 0.12],
    ]
      .map((point) => point.map((value) => value.toFixed(1)).join(","))
      .join(" ");
  }

  function selectDistrict(code) {
    if (!code || !state.districts.some((item) => item.code === code)) return;
    state.selectedCode = code;
    renderList(document.getElementById("district-search").value);
    renderDetail();
  }

  function renderList(query = "") {
    const items = visibleDistricts(query);
    document.getElementById("district-list").innerHTML = items
      .map((item) => {
        const score = Number(item.riskScore || 0);
        return `
          <button class="district-select-button ${item.code === state.selectedCode ? "is-active" : ""}" data-code="${item.code}" data-tier="${riskTier(score)}">
            <strong>${item.name}</strong>
            <span>${formatNumber(score, "점")} · ${item.riskGrade}</span>
            <span>${item.riskArchetype}</span>
            <span class="selector-score-line" aria-hidden="true"><i style="width:${Math.max(6, score)}%"></i></span>
          </button>
        `;
      })
      .join("");

    document.querySelectorAll(".district-select-button").forEach((button) => {
      button.addEventListener("click", () => selectDistrict(button.dataset.code));
    });
  }

  function currentDistrict() {
    return state.districts.find((item) => item.code === state.selectedCode) || state.districts[0];
  }

  function districtByName(name) {
    return state.districts.find((item) => item.name === name);
  }

  function riskFactors(detail) {
    return [
      [
        "가격 부담",
        detail.priceBurdenRiskScore,
        "같은 권역 대비 매입 가격선이 앞서 있는지 확인합니다.",
        "권역 비교 기준",
      ],
      [
        "거래 유동성",
        detail.liquidityRiskScore,
        "팔고 싶을 때 바로 빠져나올 수 있는 시장인지 점검합니다.",
        "최근 12개월 거래 표본",
      ],
      [
        "가격 변동성",
        detail.volatilityRiskScore,
        "최근 몇 건이 전체 시장을 왜곡한 이상 거래인지 살펴봅니다.",
        "체결 레벨 분리 기준",
      ],
      [
        "상권 과밀",
        detail.competitionRiskScore,
        "같은 형식의 점포가 얼마나 중복되어 있는지 확인합니다.",
        "행정동 점포 밀도 기준",
      ],
    ]
      .map(([label, value, question, helper]) => ({ label, value: Number(value || 0), question, helper }))
      .sort((left, right) => right.value - left.value);
  }

  function compactReasonLabel(value) {
    const text = String(value || "");
    if (text.includes("가격") && text.includes("부담")) return "가격 부담";
    if (text.includes("과밀") || text.includes("점포")) return "점포 과밀";
    if (text.includes("변동")) return "가격 변동성";
    if (text.includes("유동") || text.includes("거래")) return "거래 유동성";
    if (text.includes("표본")) return "표본 주의";
    if (text.includes("복합") || text.includes("한 가지")) return "복합 점검";
    return text.length > 18 ? `${text.slice(0, 18)}...` : text;
  }

  function districtJudgment(detail) {
    const source = detail.objections?.[0] || detail.riskSummary || detail.decisionQuestion || detail.recommendedAction;
    const polished = polishCopy(source || detail.archetypeSummary || detail.memo);
    if (!polished) return "매물 단위 조건과 대체 후보를 함께 비교해야 합니다.";
    return /[.!?。]$/.test(polished) ? polished : `${polished}.`;
  }

  function replacementNames(detail) {
    return (detail.replacementCandidates || [])
      .slice(0, 3)
      .map((item) => (typeof item === "string" ? item : item.name))
      .filter(Boolean);
  }

  function updateDistrictActionLinks(detail) {
  const reviewLink = document.getElementById("district-review-link");
  const compareLink = document.getElementById("district-compare-link");

  if (!detail) return;

  if (reviewLink) {
    reviewLink.href = `./review.html?district=${encodeURIComponent(detail.code)}`;
  }

  if (compareLink) {
    const replacements = replacementNames(detail)
      .map((name) => districtByName(name)?.code)
      .filter(Boolean)
      .slice(0, 2);

    const params = new URLSearchParams();
    params.set("a", detail.code);

    if (replacements[0]) params.set("b", replacements[0]);
    if (replacements[1]) params.set("c", replacements[1]);

    compareLink.href = `./compare.html?${params.toString()}`;
  }
}

  function collectCoordinates(geometry) {
  const points = [];

  function walk(value) {
    if (!Array.isArray(value)) return;

    const isPoint =
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number";

    if (isPoint) {
      points.push(value);
      return;
    }

    value.forEach(walk);
  }

  walk(geometry?.coordinates);
  return points;
}

function geometryBounds(features) {
  const points = [];

  features.forEach((feature) => {
    points.push(...collectCoordinates(feature.geometry));
  });

  if (!points.length) {
    return null;
  }

  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

  function createProjector(bounds) {
  const width = 760;
  const height = 520;
  const padding = 28;

  const scaleX = (width - padding * 2) / (bounds.maxX - bounds.minX);
  const scaleY = (height - padding * 2) / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY);

  const mapWidth = (bounds.maxX - bounds.minX) * scale;
  const mapHeight = (bounds.maxY - bounds.minY) * scale;

  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return ([lng, lat]) => {
    const x = offsetX + (lng - bounds.minX) * scale;
    const y = height - (offsetY + (lat - bounds.minY) * scale);
    return [x, y];
  };
}

  function ringToPath(ring, project) {
    return (
      ring
        .map((point, index) => {
          const[x, y] = project(point);
          return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ")+ " z"
    );
  }

  function geometryToPath(geometry, project) {
    if (!geometry) return "";

    if (geometry.type === "Polygon") {
      return geometry.coordinates.map((ring) => ringToPath(ring, project)).join(" ");
    }

    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates
        .flatMap((polygon) => polygon.map((ring) => ringToPath(ring, project)))
        .join(" ");
    }


    return "";
  }

  function renderRiskMap(detail) {
  const svg = document.getElementById("seoul-risk-map");
  if (!svg || !detail) return;

  if (!state.mapGeometryLoaded || !state.mapFeatures.length) {
    renderFallbackRiskMap(detail);
    return;
  }

  const bounds = geometryBounds(state.mapFeatures);
  if (!bounds) {
    renderFallbackRiskMap(detail);
    return;
  }

  const project = createProjector(bounds);

  const paths = state.mapFeatures
    .map((feature) => {
      const district = districtFromFeature(feature);
      if (!district) return "";

      const score = Number(district.riskScore || 0);
      const tier = riskTier(score);
      const selectedClass = district.code === detail.code ? " is-selected" : "";
      const path = geometryToPath(feature.geometry, project);

      return `
        <path
          class="seoul-district-path tier-${tier}${selectedClass}"
          d="${path}"
          data-code="${district.code}"
          tabindex="0"
          role="button"
          aria-label="${district.name} ${formatNumber(score, "점")}"
        >
          <title>${district.name} · ${formatNumber(score, "점")} · ${district.riskGrade}</title>
        </path>
      `;
    })
    .join("");

  svg.innerHTML = `
    <defs>
      <filter id="selected-boundary-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur"></feGaussianBlur>
        <feMerge>
          <feMergeNode in="blur"></feMergeNode>
          <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
      <radialGradient id="boundary-map-glow" cx="50%" cy="48%" r="58%">
        <stop offset="0%" stop-color="#ff3347" stop-opacity="0.13"></stop>
        <stop offset="60%" stop-color="#ff3347" stop-opacity="0.04"></stop>
        <stop offset="100%" stop-color="#ff3347" stop-opacity="0"></stop>
      </radialGradient>
    </defs>
    <rect class="map-core-glow" x="0" y="0" width="760" height="520" fill="url(#boundary-map-glow)"></rect>
    <g class="seoul-boundary-map">
      ${paths}
    </g>
  `;

  svg.querySelectorAll(".seoul-district-path").forEach((node) => {
    node.addEventListener("click", () => selectDistrict(node.dataset.code));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectDistrict(node.dataset.code);
      }
    });
  });

  document.getElementById("seoul-map-district").textContent = detail.name;
  document.getElementById("seoul-map-zone").textContent = riskTierLabel(detail.riskScore);
  document.getElementById("seoul-map-score").textContent = formatNumber(detail.riskScore, "점");
}

  function renderFallbackRiskMap(detail) {
    const svg = document.getElementById("seoul-risk-map");
    if (!svg || !detail) return;

    const districts = byCode();
    const selectedCell = mapCells.find((cell) => cell.code === detail.code) || mapCells[0];
    const nodes = mapCells
      .map((cell) => {
        const item = districts.get(cell.code);
        const score = Number(item?.riskScore || 0);
        const tier = riskTier(score);
        const selectedClass = cell.code === detail.code ? " is-selected" : "";
        const opacity = Math.min(0.82, 0.24 + score / 120).toFixed(2);
        return `
          <g class="seoul-map-node tier-${tier}${selectedClass}" data-code="${cell.code}" tabindex="0" role="button" aria-label="${item?.name || cell.name} ${formatNumber(score, "점")}">
            <polygon points="${hexPoints(cell)}" style="--node-opacity:${opacity}"></polygon>
            <text x="${cell.x}" y="${cell.y + 4}" text-anchor="middle">${shortDistrictName(item?.name || cell.name)}</text>
          </g>
        `;
      })
      .join("");

    svg.innerHTML = `
      <defs>
        <filter id="selected-risk-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="8" result="blur"></feGaussianBlur>
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 1  0 0 0 0 0.08  0 0 0 0 0.16  0 0 0 0.75 0"></feColorMatrix>
          <feMerge>
            <feMergeNode></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <radialGradient id="map-core-glow" cx="50%" cy="48%" r="58%">
          <stop offset="0%" stop-color="#ff3347" stop-opacity="0.18"></stop>
          <stop offset="55%" stop-color="#ff3347" stop-opacity="0.045"></stop>
          <stop offset="100%" stop-color="#ff3347" stop-opacity="0"></stop>
        </radialGradient>
      </defs>
      <rect class="map-core-glow" x="0" y="0" width="760" height="520" fill="url(#map-core-glow)"></rect>
      <path class="map-river" d="M48 334 C142 296 218 328 302 306 C390 282 456 328 540 292 C615 260 678 260 724 232"></path>
      <g class="map-axis-lines" aria-hidden="true">
        <path d="M104 120 L668 430"></path>
        <path d="M156 478 L626 84"></path>
        <path d="M54 404 L708 116"></path>
      </g>
      <g class="seoul-map-nodes">${nodes}</g>
      <g class="map-target" aria-hidden="true">
        <circle cx="${selectedCell.x}" cy="${selectedCell.y}" r="${Math.max(selectedCell.rx, selectedCell.ry) + 18}"></circle>
        <line x1="${selectedCell.x - 34}" y1="${selectedCell.y}" x2="${selectedCell.x - 10}" y2="${selectedCell.y}"></line>
        <line x1="${selectedCell.x + 10}" y1="${selectedCell.y}" x2="${selectedCell.x + 34}" y2="${selectedCell.y}"></line>
        <line x1="${selectedCell.x}" y1="${selectedCell.y - 34}" x2="${selectedCell.x}" y2="${selectedCell.y - 10}"></line>
        <line x1="${selectedCell.x}" y1="${selectedCell.y + 10}" x2="${selectedCell.x}" y2="${selectedCell.y + 34}"></line>
      </g>
    `;

    svg.querySelectorAll(".seoul-map-node").forEach((node) => {
      node.addEventListener("click", () => selectDistrict(node.dataset.code));
      node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectDistrict(node.dataset.code);
        }
      });
    });

    document.getElementById("seoul-map-district").textContent = detail.name;
    document.getElementById("seoul-map-zone").textContent = riskTierLabel(detail.riskScore);
    document.getElementById("seoul-map-score").textContent = formatNumber(detail.riskScore, "점");
  }

  function renderSignalConsole(detail, reliability, benchmark) {
    const factors = riskFactors(detail);
    const primary = factors[0];
    const secondary = factors[1] || factors[0];
    const pauseReasons = (detail.objections && detail.objections.length ? detail.objections : factors.map((item) => item.label)).slice(0, 2);

    document.getElementById("district-drilldown").innerHTML = `
      <div class="signal-console-stack">
        <article class="signal-primary-card">
          <span class="result-label">Primary Signal</span>
          <div>
            <strong>${primary.label}</strong>
            <em>${formatNumber(primary.value, "점")}</em>
          </div>
          <p>${polishCopy(primary.question)}</p>
          <div class="signal-strength-line"><span style="width:${Math.max(8, primary.value)}%"></span></div>
        </article>
        <div class="signal-console-grid">
          <article class="signal-row">
            <span>Secondary Signal</span>
            <strong>${secondary.label}</strong>
            <p>${secondary.helper}</p>
          </article>
          <article class="signal-row">
            <span>Risk Trigger</span>
            <strong>${compactReasonLabel(polishCopy(pauseReasons[0] || primary.label))}</strong>
            <p>${benchmark?.label || riskTierLabel(detail.riskScore)}</p>
          </article>
          <article class="signal-row signal-row-wide">
            <span>Recommended Action</span>
            <strong>${detail.recommendedAction || detail.decisionQuestion}</strong>
            <p>${polishCopy(detail.archetypeSummary || detail.memo)}</p>
          </article>
        </div>
        <div class="signal-factor-bars">
          ${factors
            .map(
              (factor) => `
                <div class="signal-mini-bar">
                  <span>${factor.label}</span>
                  <i><b style="width:${Math.max(8, factor.value)}%"></b></i>
                  <em>${formatNumber(factor.value, "점")}</em>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="console-chip-row">
          <span>${reliability.level}</span>
          <span>${reliability.sampleCount ? `표본 ${formatNumber(reliability.sampleCount, "건", 0)}` : "표본 확인 필요"}</span>
          <span>${benchmark?.detail || "서울 기준 비교"}</span>
        </div>
        ${typeof renderReliabilityBadges === "function" ? renderReliabilityBadges(detail, { includeNote: false }) : ""}
      </div>
    `;
  }

  function renderReplacementCandidates(detail) {
    const candidates = detail.replacementCandidates || [];
    document.getElementById("replacement-candidates").innerHTML = candidates.length
      ? candidates
          .map((item) => {
            const matched = districtByName(item.name);
            const score = Number(item.score || matched?.riskScore || 0);
            const gap = Number(detail.riskScore || 0) - score;
            return `
              <article class="replacement-candidate-card" data-tier="${riskTier(score)}" style="--candidate-score:${Math.max(8, Math.min(92, score))}%">
                <div class="candidate-map-spark" aria-hidden="true">
                  <span></span>
                  <i></i>
                  <small>${formatNumber(score, "점")}</small>
                </div>
                <div>
                  <header>
                    <strong>${item.name}</strong>
                    <em>${formatNumber(score, "점")}</em>
                  </header>
                  <p>${polishCopy(item.whyBetter || "현재 선택 구보다 낮은 리스크 축을 비교할 후보입니다.")}</p>
                  <span class="candidate-compare">${gap > 0 ? `선택 구보다 ${formatNumber(gap, "점")} 낮음` : "별도 조건 비교"}</span>
                </div>
              </article>
            `;
          })
          .join("") +
        `
          <section class="replacement-summary-strip">
            <span class="result-label">Compare Next</span>
            <p>같은 예산대에서 가격 부담, 거래 유동성, 상권 과밀 신호를 함께 낮춰 볼 수 있는 구를 우선 비교합니다.</p>
          </section>
        `
      : `<article class="replacement-candidate-card" style="--candidate-score:36%"><div class="candidate-map-spark" aria-hidden="true"><span></span><i></i><small>대기</small></div><div><header><strong>대체 후보 없음</strong></header><p>현재 조건에서는 바로 제시할 대체 구가 없습니다.</p></div></article>`;
  }

  function renderDetail() {
    const detail = currentDistrict();
    if (!detail) return;

    document.getElementById("detail-name").textContent = detail.name;
    document.getElementById("detail-type").textContent = detail.riskArchetype;
    const gradeEl = document.getElementById("detail-grade");
    gradeEl.textContent = detail.riskGrade;
    gradeEl.className = `risk-level-badge ${typeof riskTone === "function" ? riskTone(detail.riskScore) : ""}`;
    document.getElementById("detail-score").textContent = formatNumber(detail.riskScore, "점");
    const reliability = reliabilityInfo(detail);
    const benchmark =
      typeof benchmarkInfo === "function"
        ? benchmarkInfo(detail.riskScore, detail)
        : {
            label: "서울 25개 구 기준 고위험 구간",
            detail: "서울 평균 대비 높은 가격 부담",
          };
    const pauseReasons = (detail.objections && detail.objections.length ? detail.objections : riskFactors(detail).map((item) => item.label)).slice(0, 3);
    const alternatives = replacementNames(detail);

    renderRiskMap(detail);
    updateDistrictActionLinks(detail);

    document.getElementById("district-context-chips").innerHTML = [benchmark.label, benchmark.detail]
      .filter(Boolean)
      .map((item) => `<span>${item}</span>`)
      .join("");

    document.getElementById("detail-judgment").textContent = districtJudgment(detail);
    document.getElementById("detail-pause-reasons").innerHTML = pauseReasons
      .map((item) => `<span>${compactReasonLabel(polishCopy(item))}</span>`)
      .join("");
    document.getElementById("detail-alternative-pills").innerHTML = alternatives.length
      ? alternatives.map((name) => `<span>${name}</span>`).join("")
      : `<span class="is-muted">현장 확인 우선</span>`;

    document.getElementById("detail-summary-grid").innerHTML = [
      ["데이터 신뢰도", reliability.level],
      ["기반 표본", reliability.sampleCount ? formatNumber(reliability.sampleCount, "건", 0) : "확인 필요"],
      ["음식업 비중", formatNumber(detail.foodStoreSharePct, "%")],
      ["행정동당 점포", formatNumber(detail.storesPerAdminDong)],
    ]
      .map(
        ([label, value]) => `
          <article class="stat-card">
            <span class="card-label">${label}</span>
            <strong>${value}</strong>
          </article>
        `
      )
      .join("");

    renderSignalConsole(detail, reliability, benchmark);

    document.getElementById("detail-metrics").innerHTML = [
      ["총 리스크", detail.riskScore],
      ["가격 부담", detail.priceBurdenRiskScore],
      ["거래 유동성", detail.liquidityRiskScore],
      ["변동성", detail.volatilityRiskScore],
      ["상권 경쟁", detail.competitionRiskScore],
    ]
      .map(
        ([label, value]) => `
          <div class="metric-row">
            <header>
              <span>${label}</span>
              <span>${formatNumber(value, "점")}</span>
            </header>
            <div class="progress-track"><span style="width:${Math.max(8, Number(value || 0))}%"></span></div>
          </div>
        `
      )
      .join("");

    document.getElementById("detail-checks").innerHTML = (detail.reviewChecklist || [])
      .map((item) => `<article><strong>Field Check</strong><p>${polishCopy(item)}</p></article>`)
      .join("");

    document.getElementById("detail-objections").innerHTML = (detail.objections || [])
      .slice(0, 4)
      .map(
        (item, index) => `
          <article class="objection-row">
            <strong>${String(index + 1).padStart(2, "0")}</strong>
            <p>${polishCopy(item)}</p>
          </article>
        `
      )
      .join("");

    renderReplacementCandidates(detail);

    drawLineChart("price-chart", detail.history || [], "medianPricePerSqm", "#df5a3a");
    drawLineChart("volume-chart", detail.history || [], "transactionCount", "#79c1bc");
  }

  async function init() {
  await loadDistrictGeometry();

  if (state.mapGeometryLoaded) {
    console.info(`[Redveil] Seoul district geometry matched: ${matchedGeometryCount()} / ${state.mapFeatures.length}`);
  }

  renderList();
  renderDetail();
}

document.getElementById("district-search").addEventListener("input", (event) => {
  const items = visibleDistricts(event.target.value);
  if (!items.find((item) => item.code === state.selectedCode) && items[0]) {
    state.selectedCode = items[0].code;
    renderDetail();
  }
  renderList(event.target.value);
});

init();
})();