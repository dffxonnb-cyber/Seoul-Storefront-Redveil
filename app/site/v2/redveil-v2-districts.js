(function () {
  "use strict";

  const FACTORS = [
    {
      key: "priceBurdenRiskScore",
      label: "가격 부담",
      description: "같은 권역 대비 매입 가격선이 앞서 있는지 확인하는 신호입니다.",
    },
    {
      key: "liquidityRiskScore",
      label: "거래 유동성",
      description: "매도 시 거래 회전이 느려질 가능성을 확인하는 신호입니다.",
    },
    {
      key: "competitionRiskScore",
      label: "상권 과밀",
      description: "유사 점포와 업종 경쟁 압박을 확인하는 신호입니다.",
    },
    {
      key: "volatilityRiskScore",
      label: "가격 변동성",
      description: "최근 체결 가격선의 흔들림을 확인하는 신호입니다.",
    },
    {
      key: "transactionRiskScore",
      label: "거래 데이터 신호",
      description: "최근 거래 흐름과 표본 상태를 함께 확인하는 신호입니다.",
    },
  ];

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function payload() {
    return [
      window.__REDVEIL_PAYLOAD__,
      window.REDVEIL_PAYLOAD,
      window.RedveilPayload,
      window.RedveilV2 && window.RedveilV2.payload,
    ].find(isObject);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function clamp(value) {
    return Math.min(100, Math.max(0, number(value) || 0));
  }

  function formatScore(value) {
    const parsed = number(value);
    return parsed === null ? "데이터 확인 필요" : parsed.toFixed(1).replace(/\.0$/, "");
  }

  function tone(score) {
    const value = number(score) || 0;
    if (value >= 65) return "is-high";
    if (value >= 45) return "is-watch";
    return "is-low";
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = String(value ?? "");
  }

  function requestedCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("district") || params.get("code") || params.get("districtCode") || "";
  }

  function selectedDistrict(districts) {
    const code = requestedCode();
    const matched = districts.find((district) => String(district.code) === String(code));
    if (matched) return matched;
    return [...districts].sort((left, right) => (number(right.riskScore) || 0) - (number(left.riskScore) || 0))[0];
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function showFallback() {
    document.querySelectorAll(".v2-report-layout > section:not(#v2-report-fallback)").forEach((section) => {
      section.hidden = true;
    });
    const fallback = document.querySelector("#v2-report-fallback");
    if (fallback) fallback.hidden = false;
    setText("#v2-report-topbar-title", "데이터 확인 필요");
    setText("#v2-report-data-updated", "데이터 연결 확인 필요");
  }

  function renderFactors(detail) {
    const container = document.querySelector("#v2-report-factor-grid");
    if (!container) return;
    const fragment = document.createDocumentFragment();

    FACTORS.forEach((factor) => {
      const value = number(detail[factor.key]);
      const card = createElement("article", "v2-report-factor-card");
      const head = createElement("div", "v2-report-factor-head");
      head.append(createElement("strong", "", factor.label), createElement("span", "", formatScore(value)));

      const bar = createElement("div", "v2-report-factor-bar");
      const fill = createElement("span", tone(value));
      fill.style.width = `${value === null ? 0 : clamp(value)}%`;
      bar.appendChild(fill);

      card.append(head, bar, createElement("p", "", value === null ? "데이터 확인 필요" : factor.description));
      fragment.appendChild(card);
    });

    container.replaceChildren(fragment);
  }

  function fallbackPauseReasons(detail) {
    return FACTORS
      .map((factor) => ({ ...factor, value: number(detail[factor.key]) }))
      .filter((factor) => factor.value !== null)
      .sort((left, right) => right.value - left.value)
      .slice(0, 3)
      .map((factor) => `${factor.label} 점수 ${formatScore(factor.value)}점입니다. ${factor.description}`);
  }

  function renderPauseReasons(detail) {
    const list = document.querySelector("#v2-report-pause-list");
    if (!list) return;
    const source = Array.isArray(detail.objections) && detail.objections.length
      ? detail.objections.slice(0, 3)
      : fallbackPauseReasons(detail);
    const reasons = source.length ? source : ["자치구별 위험 요인 데이터를 추가로 확인해야 합니다."];

    list.replaceChildren(
      ...reasons.map((reason, index) => {
        const item = createElement("li", "");
        item.append(createElement("span", "", String(index + 1).padStart(2, "0")), createElement("p", "", reason));
        return item;
      })
    );
  }

  function normalizeCandidates(detail, districts) {
    const byName = new Map(districts.map((district) => [district.name, district]));
    const raw = Array.isArray(detail.replacementCandidates) ? detail.replacementCandidates : [];
    const normalized = raw
      .map((candidate) => {
        const source = typeof candidate === "string" ? { name: candidate } : candidate;
        if (!isObject(source) || !source.name) return null;
        const matched = byName.get(source.name);
        return {
          code: String(matched?.code || source.code || ""),
          name: String(source.name),
          score: number(source.score ?? matched?.riskScore),
          whyBetter: String(source.whyBetter || "선택 자치구와 같은 기준으로 비교할 후보입니다."),
        };
      })
      .filter(Boolean);

    const names = new Set(normalized.map((candidate) => candidate.name));
    const fallback = districts
      .filter((candidate) => candidate.code !== detail.code && !names.has(candidate.name))
      .sort((left, right) => (number(left.riskScore) || 100) - (number(right.riskScore) || 100))
      .map((candidate) => ({
        code: String(candidate.code || ""),
        name: String(candidate.name || ""),
        score: number(candidate.riskScore),
        whyBetter: "총 리스크가 더 낮은 비교 후보입니다.",
      }));

    return [...normalized, ...fallback].slice(0, 3);
  }

  function renderAlternatives(detail, districts) {
    const container = document.querySelector("#v2-report-alternative-list");
    if (!container) return;
    const selectedScore = number(detail.riskScore);
    const candidates = normalizeCandidates(detail, districts);

    if (!candidates.length) {
      container.replaceChildren(createElement("p", "v2-candidate-empty", "비교 가능한 자치구 데이터를 확인하지 못했습니다."));
      return;
    }

    container.replaceChildren(
      ...candidates.map((candidate, index) => {
        const card = createElement("a", `v2-report-alternative-card ${tone(candidate.score)}`);
        card.href = candidate.code ? `./districts.html?district=${encodeURIComponent(candidate.code)}` : "./districts.html";
        const delta = selectedScore !== null && candidate.score !== null ? selectedScore - candidate.score : null;

        const rank = createElement("span", "v2-report-alternative-rank", String(index + 1).padStart(2, "0"));
        const copy = createElement("div", "v2-report-alternative-copy");
        copy.append(createElement("strong", "", candidate.name), createElement("p", "", candidate.whyBetter));
        const score = createElement("div", "v2-report-alternative-score");
        score.append(
          createElement("strong", "", formatScore(candidate.score)),
          createElement("span", "", delta === null ? "격차 확인 필요" : `선택 구보다 ${Math.abs(delta).toFixed(1).replace(/\.0$/, "")}점 ${delta >= 0 ? "낮음" : "높음"}`)
        );
        card.append(rank, copy, score);
        return card;
      })
    );
  }

  function renderChecklist(detail) {
    const list = document.querySelector("#v2-report-checklist");
    if (!list) return;
    const source = Array.isArray(detail.reviewChecklist) && detail.reviewChecklist.length
      ? detail.reviewChecklist.slice(0, 4)
      : [
          "최신 실거래와 현재 호가의 차이를 확인하세요.",
          "핵심 상권의 공실과 임차인 교체 속도를 현장에서 확인하세요.",
          "계약 조건은 법률·세무·부동산 전문가와 함께 검토하세요.",
        ];
    list.replaceChildren(...source.map((item) => createElement("li", "", item)));
  }

  function render(detail, sourcePayload, districts) {
    const score = number(detail.riskScore);
    const scoreTone = tone(score);
    const latestMonth = sourcePayload.summary?.latestMonth || sourcePayload.site?.latestMonth || "데이터 시점 확인 필요";
    const summary = detail.riskSummary || detail.memo || "선택 자치구의 위험 요인을 추가로 확인해야 합니다.";

    document.title = `Redveil V2 | ${detail.name} 리스크 리포트`;
    setText("#v2-report-district-name", detail.name);
    setText("#v2-report-topbar-title", `${detail.name} 상세 리스크 리포트`);
    setText("#v2-report-data-updated", `${latestMonth} 기준 데이터`);
    setText("#v2-report-period", `${latestMonth} 기준`);
    setText("#v2-report-summary", summary);
    setText("#v2-report-grade", detail.riskGrade || "등급 확인 필요");
    setText("#v2-report-score", formatScore(score));
    setText("#v2-report-archetype", detail.riskArchetype || "데이터 확인 필요");
    setText("#v2-report-reliability", detail.sampleReliability || "데이터 확인 필요");
    setText("#v2-report-decision-question", detail.decisionQuestion || detail.recommendedAction || summary);

    const grade = document.querySelector("#v2-report-grade");
    if (grade) grade.className = `v2-tier-badge ${scoreTone}`;
    const meter = document.querySelector("#v2-report-score-meter");
    if (meter) {
      meter.className = scoreTone;
      meter.style.width = `${score === null ? 0 : clamp(score)}%`;
    }

    renderFactors(detail);
    renderPauseReasons(detail);
    renderAlternatives(detail, districts);
    renderChecklist(detail);
  }

  function init() {
    const sourcePayload = payload();
    const districts = Array.isArray(sourcePayload?.districts)
      ? sourcePayload.districts.filter((district) => isObject(district) && district.code && district.name)
      : [];
    if (!sourcePayload || !districts.length) {
      showFallback();
      return;
    }

    const detail = selectedDistrict(districts);
    if (!detail) {
      showFallback();
      return;
    }
    render(detail, sourcePayload, districts);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
