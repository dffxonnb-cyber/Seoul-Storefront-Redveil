(function () {
  const payload = window.RedveilV2?.payload;
  const compareGrid = document.getElementById("compare-grid");

  if (!payload || !compareGrid) return;

  const districts = payload.districts || [];
  const MAP_WIDTH = 360;
  const MAP_HEIGHT = 180;
  const MAP_PADDING = 12;
  let geometryPromise = null;
  let renderSequence = 0;

  function featureDistrictCode(feature) {
    const props = feature?.properties || {};
    return props.code || props.SIG_CD || props.sig_cd || props.adm_cd || props.ADM_CD || null;
  }

  function featureDistrictName(feature) {
    const props = feature?.properties || {};
    return props.name || props.SIG_KOR_NM || props.sig_kor_nm || props.adm_nm || props.ADM_NM || null;
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
    const points = features.flatMap((feature) => collectCoordinates(feature.geometry));
    if (!points.length) return null;

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
    const scaleX = (MAP_WIDTH - MAP_PADDING * 2) / (bounds.maxX - bounds.minX);
    const scaleY = (MAP_HEIGHT - MAP_PADDING * 2) / (bounds.maxY - bounds.minY);
    const scale = Math.min(scaleX, scaleY);
    const mapWidth = (bounds.maxX - bounds.minX) * scale;
    const mapHeight = (bounds.maxY - bounds.minY) * scale;
    const offsetX = (MAP_WIDTH - mapWidth) / 2;
    const offsetY = (MAP_HEIGHT - mapHeight) / 2;

    return ([lng, lat]) => [
      offsetX + (lng - bounds.minX) * scale,
      MAP_HEIGHT - (offsetY + (lat - bounds.minY) * scale),
    ];
  }

  function ringToPath(ring, project) {
    return `${ring
      .map((point, index) => {
        const [x, y] = project(point);
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ")} z`;
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

  function featureCenter(feature, project) {
    const projected = collectCoordinates(feature?.geometry).map(project);
    if (!projected.length) return [MAP_WIDTH / 2, MAP_HEIGHT / 2];

    const xs = projected.map((point) => point[0]);
    const ys = projected.map((point) => point[1]);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  }

  function districtForCard(card) {
    const name = card.querySelector(".candidate-title strong")?.textContent?.trim();
    return districts.find((district) => district.name === name) || null;
  }

  function featureMatchesDistrict(feature, district) {
    return (
      String(featureDistrictCode(feature)) === String(district.code) ||
      String(featureDistrictName(feature)) === String(district.name)
    );
  }

  function renderMap(panel, district, features, project, index) {
    const selectedFeature = features.find((feature) => featureMatchesDistrict(feature, district));
    if (!selectedFeature) {
      renderFallback(panel, district);
      return;
    }

    const orderedFeatures = [
      ...features.filter((feature) => feature !== selectedFeature),
      selectedFeature,
    ];
    const paths = orderedFeatures
      .map((feature) => {
        const code = featureDistrictCode(feature) || "";
        const name = featureDistrictName(feature) || "";
        const selected = feature === selectedFeature;
        return `<path class="candidate-map-district${selected ? " is-selected" : ""}" data-code="${code}" data-name="${name}" d="${geometryToPath(feature.geometry, project)}"></path>`;
      })
      .join("");
    const [markerX, markerY] = featureCenter(selectedFeature, project);
    const candidateLabel = `후보 ${String.fromCharCode(65 + index)}`;

    panel.classList.add("candidate-district-map", "is-ready");
    panel.classList.remove("is-loading", "is-fallback");
    panel.dataset.mapCode = String(district.code);
    panel.removeAttribute("aria-hidden");
    panel.setAttribute("role", "img");
    panel.setAttribute("aria-label", `${candidateLabel} ${district.name} 서울 자치구 위치 지도`);
    panel.innerHTML = `
      <svg class="candidate-map-svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" aria-hidden="true">
        <g class="candidate-map-boundaries">${paths}</g>
        <g class="candidate-map-marker" transform="translate(${markerX.toFixed(2)} ${markerY.toFixed(2)})">
          <circle class="candidate-map-marker-halo" r="12"></circle>
          <circle class="candidate-map-marker-ring" r="6"></circle>
          <circle class="candidate-map-marker-dot" r="2.6"></circle>
        </g>
      </svg>
      <div class="candidate-map-kicker">Seoul district map</div>
      <div class="candidate-map-meta">
        <span>${candidateLabel}</span>
        <strong>${district.name}</strong>
      </div>
    `;
  }

  function renderFallback(panel, district) {
    panel.classList.add("candidate-district-map", "is-fallback");
    panel.classList.remove("is-loading", "is-ready");
    panel.dataset.mapCode = String(district.code);
    panel.removeAttribute("aria-hidden");
    panel.setAttribute("role", "img");
    panel.setAttribute("aria-label", `${district.name} 지도 데이터를 불러오지 못했습니다`);
    panel.innerHTML = `
      <div class="candidate-map-fallback-mark" aria-hidden="true"></div>
      <div class="candidate-map-meta">
        <span>Map unavailable</span>
        <strong>${district.name}</strong>
      </div>
    `;
  }

  function setLoadingState() {
    compareGrid.querySelectorAll(".candidate-scan-panel").forEach((panel) => {
      panel.classList.add("candidate-district-map", "is-loading");
      panel.classList.remove("is-ready", "is-fallback");
      panel.innerHTML = `<span class="candidate-map-loading">서울 자치구 경계 불러오는 중</span>`;
    });
  }

  async function loadGeometry() {
    if (!geometryPromise) {
      geometryPromise = fetch("./assets/seoul-districts.geojson")
        .then((response) => {
          if (!response.ok) throw new Error(`GeoJSON request failed: ${response.status}`);
          return response.json();
        })
        .then((geojson) => {
          const features = Array.isArray(geojson.features) ? geojson.features : [];
          if (features.length !== 25) {
            throw new Error(`Expected 25 Seoul district features, received ${features.length}`);
          }
          return features;
        });
    }
    return geometryPromise;
  }

  async function renderAllMaps() {
    const sequence = ++renderSequence;
    setLoadingState();

    try {
      const features = await loadGeometry();
      if (sequence !== renderSequence) return;
      const bounds = geometryBounds(features);
      if (!bounds) throw new Error("Unable to calculate Seoul district geometry bounds");
      const project = createProjector(bounds);

      compareGrid.querySelectorAll(".compare-card").forEach((card, index) => {
        const panel = card.querySelector(".candidate-scan-panel");
        const district = districtForCard(card);
        if (panel && district) renderMap(panel, district, features, project, index);
      });
    } catch (error) {
      console.warn("[Redveil] Compare minimap rendering failed", error);
      compareGrid.querySelectorAll(".compare-card").forEach((card) => {
        const panel = card.querySelector(".candidate-scan-panel");
        const district = districtForCard(card);
        if (panel && district) renderFallback(panel, district);
      });
    }
  }

  const observer = new MutationObserver(() => renderAllMaps());
  observer.observe(compareGrid, { childList: true });
  renderAllMaps();
})();
