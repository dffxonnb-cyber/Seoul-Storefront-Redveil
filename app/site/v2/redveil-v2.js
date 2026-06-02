(function () {
  "use strict";

  const fallbackModel = {
    riskScore: 72,
    riskSummary: "가격 부담과 거래 유동성 약화가 함께 감지되어 즉시 매입보다 후보 비교가 우선입니다.",
    topSignalDistrict: "강남구 신사동",
    topSignalCopy: "높은 임대료 수준, 경쟁 밀도, 최근 거래 변동성이 동시에 상승해 매입 전 보류 사유가 분명합니다.",
    selectedDistrict: "강남구",
    candidates: [
      {
        rank: 1,
        districtName: "성수동 연무장길",
        riskScore: 68,
        status: "High",
        rentDelta: "+18%",
        note: "경쟁 밀도 상승",
      },
      {
        rank: 2,
        districtName: "합정동 카페거리",
        riskScore: 54,
        status: "Watch",
        rentDelta: "+7%",
        note: "임대료 재확인",
      },
      {
        rank: 3,
        districtName: "문래동 공업가로",
        riskScore: 38,
        status: "Low",
        rentDelta: "-11%",
        note: "거래 표본 확인",
      },
    ],
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

  function statusFromScore(score) {
    if (score >= 62) return "High";
    if (score >= 45) return "Watch";
    return "Low";
  }

  function toneClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized.includes("high") || normalized.includes("위험")) return "is-high";
    if (normalized.includes("watch") || normalized.includes("주의")) return "is-watch";
    return "is-low";
  }

  function getAvailablePayload() {
    const candidates = [
      window.RedveilPayload,
      window.REDVEIL_PAYLOAD,
      window.RedveilV2 && window.RedveilV2.payload,
      window.__REDVEIL_PAYLOAD__,
    ];

    return candidates.find(isPlainObject) || {};
  }

  function normalizeCandidate(item, index) {
    if (!isPlainObject(item)) return null;

    const districtName = item.districtName || item.name || item.district || item.title;
    if (!hasReadableKorean(districtName)) return null;

    const riskScore = clamp(toNumber(item.riskScore ?? item.score ?? item.risk_index, fallbackModel.candidates[index]?.riskScore), 0, 100);
    const status = item.status || item.riskStatus || item.riskGrade || statusFromScore(riskScore);
    const rentDelta = item.rentDelta || item.rentDeltaPct || item.rent_delta || fallbackModel.candidates[index]?.rentDelta || "-";

    return {
      rank: toNumber(item.rank, index + 1),
      districtName: String(districtName),
      riskScore: Math.round(riskScore),
      status: String(statusFromScore(riskScore) || status),
      rentDelta: String(rentDelta),
      note: String(item.note || item.whyBetter || fallbackModel.candidates[index]?.note || "후보 조건 확인"),
    };
  }

  function extractPayloadCandidates(payload) {
    const directCandidates = Array.isArray(payload.candidates)
      ? payload.candidates
      : Array.isArray(payload.replacementCandidates)
        ? payload.replacementCandidates
        : [];

    const fromDirect = directCandidates.map(normalizeCandidate).filter(Boolean);
    if (fromDirect.length >= 3) return fromDirect.slice(0, 3);

    const districts = Array.isArray(payload.districts) ? payload.districts : [];
    const fromDistricts = districts
      .filter(isPlainObject)
      .filter((item) => hasReadableKorean(item.name || item.districtName))
      .sort((a, b) => toNumber(b.riskScore ?? b.score) - toNumber(a.riskScore ?? a.score))
      .slice(0, 3)
      .map((item, index) =>
        normalizeCandidate(
          {
            rank: index + 1,
            districtName: item.name || item.districtName,
            riskScore: item.riskScore ?? item.score,
            status: item.riskGrade,
            rentDelta: fallbackModel.candidates[index]?.rentDelta,
            note: item.riskSummary || item.memo,
          },
          index
        )
      )
      .filter(Boolean);

    return fromDistricts.length >= 3 ? fromDistricts : fallbackModel.candidates;
  }

  function buildModel(payload) {
    const summary = isPlainObject(payload.summary) ? payload.summary : {};
    const highestRiskDistrict = isPlainObject(summary.highestRiskDistrict) ? summary.highestRiskDistrict : {};
    const highestName = highestRiskDistrict.name || summary.highestRiskDistrictName;
    const highestScore = toNumber(highestRiskDistrict.score ?? summary.highestRiskScore, fallbackModel.riskScore);
    const readableHighestName = hasReadableKorean(highestName) ? String(highestName) : fallbackModel.selectedDistrict;
    const candidates = extractPayloadCandidates(payload);
    const leadCandidate = candidates[0] || fallbackModel.candidates[0];
    const riskScore = clamp(toNumber(leadCandidate.riskScore, highestScore), 0, 100);

    return {
      riskScore: Math.round(riskScore),
      riskSummary:
        hasReadableKorean(summary.riskSummary) && String(summary.riskSummary).length < 160
          ? String(summary.riskSummary)
          : fallbackModel.riskSummary,
      topSignalDistrict: readableHighestName === fallbackModel.selectedDistrict ? fallbackModel.topSignalDistrict : readableHighestName,
      topSignalCopy: fallbackModel.topSignalCopy,
      selectedDistrict: readableHighestName,
      candidates,
    };
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = String(value);
  }

  function renderRiskIndex(model) {
    const score = clamp(toNumber(model.riskScore, fallbackModel.riskScore), 0, 100);
    setText("#overall-risk-score", Math.round(score));
    setText("#overall-risk-summary", model.riskSummary || fallbackModel.riskSummary);

    const meter = document.querySelector("[data-risk-meter]");
    if (meter) meter.style.width = `${score}%`;
  }

  function renderTopSignal(model) {
    setText("#top-signal-district", model.topSignalDistrict || fallbackModel.topSignalDistrict);
    setText("#top-signal-copy", model.topSignalCopy || fallbackModel.topSignalCopy);
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

    const safeCandidates = Array.isArray(candidates) && candidates.length ? candidates.slice(0, 3) : fallbackModel.candidates;
    const fragment = document.createDocumentFragment();

    safeCandidates.forEach((candidate, index) => {
      const normalized = normalizeCandidate(candidate, index) || fallbackModel.candidates[index] || fallbackModel.candidates[0];
      const status = statusFromScore(normalized.riskScore);
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
      appendTextElement(nameCell, "span", "v2-candidate-sub", normalized.note);
      row.appendChild(nameCell);

      appendTextElement(row, "strong", "v2-candidate-score", String(normalized.riskScore));
      appendTextElement(row, "span", `v2-candidate-status ${tone}`, status);
      appendTextElement(row, "span", "v2-candidate-rent", normalized.rentDelta);

      fragment.appendChild(row);
    });

    list.replaceChildren(fragment);
  }

  function updateSelectedNode(node) {
    if (!node) return;

    const nodes = document.querySelectorAll("[data-risk-node]");
    nodes.forEach((item) => {
      const isSelected = item === node;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    const label = document.querySelector("#selected-node-label");
    if (label) {
      label.textContent = `${node.dataset.district || "선택 구역"} · ${node.dataset.risk || "Watch"} · ${node.dataset.score || "-"}`;
    }
  }

  function enhanceRiskMap(model) {
    const nodes = Array.from(document.querySelectorAll("[data-risk-node]"));
    if (!nodes.length) return;

    nodes.forEach((node) => {
      node.addEventListener("click", () => updateSelectedNode(node));
    });

    const preferred = nodes.find((node) => String(model.selectedDistrict || "").includes(node.dataset.district || ""));
    updateSelectedNode(preferred || nodes.find((node) => node.classList.contains("is-selected")) || nodes[0]);
  }

  function safeRender() {
    try {
      const payload = getAvailablePayload();
      const model = buildModel(payload);
      renderRiskIndex(model);
      renderTopSignal(model);
      renderCandidates(model.candidates);
      enhanceRiskMap(model);
    } catch (error) {
      console.warn("[Redveil v2] Dashboard enhancement skipped.", error);

      try {
        renderRiskIndex(fallbackModel);
        renderTopSignal(fallbackModel);
        renderCandidates(fallbackModel.candidates);
        enhanceRiskMap(fallbackModel);
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
