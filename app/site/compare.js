(function () {
  const {
    payload,
    formatNumber,
    riskTone,
    renderReliabilityBadges,
    renderBenchmarkLine,
  } = window.RedveilV2 || {};

  if (!payload) return;

  const districts = payload.districts || [];
  document.getElementById("compare-coverage").textContent = `${districts.length}개 구`;

  function validDistrictCode(code) {
    return districts.some((item) => String(item.code) === String(code));
  }

  function getInitialCompareParams() {
    const params = new URLSearchParams(window.location.search);

    return {
      a: validDistrictCode(params.get("a")) ? params.get("a") : "",
      b: validDistrictCode(params.get("b")) ? params.get("b") : "",
      c: validDistrictCode(params.get("c")) ? params.get("c") : "",
    };
  }

  function optionHtml() {
    return districts.map((item) => `<option value="${item.code}">${item.name}</option>`).join("");
  }

  const compareA = document.getElementById("compare-a");
  const compareB = document.getElementById("compare-b");
  const compareC = document.getElementById("compare-c");
  const initialCompareParams = getInitialCompareParams();

  compareA.innerHTML = optionHtml();
  compareB.innerHTML = optionHtml();
  compareC.innerHTML = optionHtml();

  if (initialCompareParams.a) {
    compareA.value = initialCompareParams.a;
  }

  if (initialCompareParams.b) {
    compareB.value = initialCompareParams.b;
  } else if (districts[1]) {
    compareB.value = districts[1].code;
  }

  if (initialCompareParams.c) {
    compareC.value = initialCompareParams.c;
  } else if (districts[2]) {
    compareC.value = districts[2].code;
  }

  function selectedDistricts() {
    const codes = [
      document.getElementById("compare-a").value,
      document.getElementById("compare-b").value,
      document.getElementById("compare-c").value,
    ].filter(Boolean);
    const uniqueCodes = [...new Set(codes)];
    return uniqueCodes
      .map((code) => districts.find((item) => item.code === code))
      .filter(Boolean);
  }

  function candidateLabel(item, items) {
    const index = items.indexOf(item);
    return `후보 ${String.fromCharCode(65 + Math.max(0, index))}`;
  }

  function signedDelta(value) {
    const rounded = Math.abs(Number(value || 0)).toFixed(1);
    if (Math.abs(Number(value || 0)) < 0.05) return "0.0점";
    return `${Number(value) > 0 ? "+" : "-"}${rounded}점`;
  }

  function topRiskFactors(item, limit = 2) {
    return [
      { label: "가격 부담", value: Number(item.priceBurdenRiskScore || 0) },
      { label: "상권 과밀", value: Number(item.competitionRiskScore || 0) },
      { label: "가격 변동성", value: Number(item.volatilityRiskScore || 0) },
      { label: "유동성", value: Number(item.liquidityRiskScore || 0) },
    ]
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  function riskSignalItems(item) {
    return [
      {
        label: "가격 부담",
        value: formatNumber(item.priceBurdenRiskScore, "점"),
        phrase: Number(item.priceBurdenRiskScore || 0) >= 75 ? "상위권 · 매입가 보수 검토" : "가격선 재확인",
        score: Number(item.priceBurdenRiskScore || 0),
      },
      {
        label: "상권 과밀",
        value: formatNumber(item.competitionRiskScore, "점"),
        phrase: Number(item.competitionRiskScore || 0) >= 70 ? "경쟁 압박 큼" : "중복 업종 확인",
        score: Number(item.competitionRiskScore || 0),
      },
      {
        label: "가격 변동성",
        value: Number(item.volatilityRiskScore || 0) >= 70 ? "최근 확대" : "안정권",
        phrase: Number(item.volatilityRiskScore || 0) >= 70 ? "체결 레벨 재확인 필요" : "표본 추세 확인",
        score: Number(item.volatilityRiskScore || 0),
      },
      {
        label: "유동성",
        value: formatNumber(item.liquidityRiskScore, "점"),
        phrase: Number(item.liquidityRiskScore || 0) >= 60 ? "거래 회전 둔화" : "회전 리스크 낮음",
        score: Number(item.liquidityRiskScore || 0),
      },
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function renderRiskSignals(item) {
    return `
      <section class="risk-signal-board" aria-label="${item.name} 리스크 신호">
        <span class="result-label">Risk Signals</span>
        <div class="risk-signal-grid">
          ${riskSignalItems(item)
            .map(
              (signal) => `
                <article class="risk-signal-card ${riskTone(signal.score)}">
                  <span>${signal.label}</span>
                  <strong>${signal.value}</strong>
                  <p>${signal.phrase}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

    function renderCandidateScan(index) {
    const tone = index === 0 ? "is-red" : index === 1 ? "is-amber" : "is-cool";

    return `
      <div class="candidate-scan-panel ${tone}" aria-hidden="true">
        <div class="scan-grid"></div>
        <div class="scan-road scan-road-a"></div>
        <div class="scan-road scan-road-b"></div>
        <div class="scan-core"></div>
        <span class="scan-building b1"></span>
        <span class="scan-building b2"></span>
        <span class="scan-building b3"></span>
        <span class="scan-building b4"></span>
        <span class="scan-building b5"></span>
      </div>
    `;
  }

  function decisionCue(item) {
    const factors = topRiskFactors(item, 2).map((factor) => factor.label).join(" · ");
    if (Number(item.riskScore || 0) >= 70) return `${factors} 중첩으로 우선 보류 검토`;
    if (Number(item.riskScore || 0) >= 60) return `${factors} 기준으로 가격선 재확인`;
    return `${factors} 확인 후 조건부 검토`;
  }

  function renderCards(items) {
    document.getElementById("compare-grid").innerHTML = items
      .map(
        (item, index) => `
          <article class="compare-card ${index === 0 ? "selected-card" : ""}">
            <div class="compare-card-head">
              <span class="rank-pill">${candidateLabel(item, items)}</span>
              <span class="tone-pill ${riskTone(item.riskScore)}">${item.riskGrade}</span>
            </div>
            <div class="candidate-title">
              <strong>${item.name}</strong>
              <p>${item.riskArchetype}</p>
            </div>
            ${renderCandidateScan(index)}
            ${renderBenchmarkLine(item.riskScore, item)}
            ${renderReliabilityBadges(item)}
            ${renderRiskSignals(item)}
            <div class="decision-cue">
              <span>Decision Cue</span>
              <p>${decisionCue(item)}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderMetrics(items) {
    const metricDefs = [
      ["총 리스크", "riskScore", "가격 부담과 과밀도가 동시에 높습니다."],
      ["가격 부담", "priceBurdenRiskScore", "매입가 기준선을 보수적으로 다시 봐야 합니다."],
      ["유동성", "liquidityRiskScore", "거래 회전 리스크와 보유 기간을 함께 확인해야 합니다."],
    ];

    document.getElementById("compare-metrics").innerHTML = metricDefs
      .map(([label, key, defaultReason]) => {
        const highest = [...items].sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))[0];
        const reason =
          key === "riskScore"
            ? `${topRiskFactors(highest, 2)
                .map((factor) => factor.label)
                .join(" · ")} 동시 상승이 핵심입니다.`
            : defaultReason;
        return `
          <article class="metric-compare-card">
            <span class="result-label">${label}</span>
            <strong>${candidateLabel(highest, items)}가 가장 높음</strong>
            <div class="metric-scoreline">
              <span>${formatNumber(highest[key], "점")}</span>
              <em>${highest.name}</em>
            </div>
            <p>${reason}</p>
            <div class="metric-mini-bars">
              ${items
                .map(
                  (item) => `
                    <div class="metric-mini-row">
                      <span>${candidateLabel(item, items)} · ${item.name}</span>
                      <strong>${formatNumber(item[key], "점")}</strong>
                      <div class="progress-track"><span style="width:${Math.max(8, Number(item[key] || 0))}%"></span></div>
                    </div>
                  `
                )
                .join("")}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderRecommendation(items) {
    const current = items[0];
    const best = [...items].sort((a, b) => Number(a.riskScore) - Number(b.riskScore))[0];
    const highest = [...items].sort((a, b) => Number(b.riskScore) - Number(a.riskScore))[0];
    const base = best === current && highest ? highest : current;
    const baseLabel = best === current ? `${candidateLabel(base, items)} 대비` : "A 후보 대비";
    const deltas = [
      {
        label: "총 리스크",
        value: signedDelta(Number(best.riskScore || 0) - Number(base.riskScore || 0)),
        phrase: Number(best.riskScore || 0) <= Number(base.riskScore || 0) ? "부담 완화" : "추가 확인",
      },
      {
        label: "가격 부담",
        value: signedDelta(Number(best.priceBurdenRiskScore || 0) - Number(base.priceBurdenRiskScore || 0)),
        phrase: Number(best.priceBurdenRiskScore || 0) <= Number(base.priceBurdenRiskScore || 0) ? "가격선 완화" : "호가 재확인",
      },
      {
        label: "유동성",
        value: signedDelta(Number(best.liquidityRiskScore || 0) - Number(base.liquidityRiskScore || 0)),
        phrase: Number(best.liquidityRiskScore || 0) <= Number(base.liquidityRiskScore || 0) ? "회전 리스크 낮음" : "보유 기간 확인",
      },
    ];

    document.getElementById("compare-recommendation").innerHTML = `
      <article class="alternative-board">
        <div class="alternative-hero">
          <span class="result-label">Review Baseline</span>
          <strong>${best.name}</strong>
          <p>${formatNumber(best.riskScore, "점")} · ${best.riskArchetype}</p>
        </div>
        <div class="risk-delta-grid" aria-label="${baseLabel} 리스크 차이">
          ${deltas
            .map(
              (delta) => `
                <div class="risk-delta-card">
                  <span>${delta.label}</span>
                  <strong>${delta.value}</strong>
                  <p>${delta.phrase}</p>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="alternative-support-grid">
          <section>
            <span class="result-label">Why Compare</span>
            <ul class="compact-checklist">
              <li>총 리스크를 ${baseLabel} 낮춰 비교할 수 있음</li>
              <li>가격 부담과 유동성 축을 같은 기준으로 재비교</li>
              <li>보류 후보의 초과 위험을 숫자로 분리</li>
            </ul>
          </section>
          <section>
            <span class="result-label">확인 필요</span>
            <ul class="compact-checklist">
              <li>최근 체결가 확인</li>
              <li>상권 과밀도 확인</li>
              <li>공실 가능성 확인</li>
            </ul>
          </section>
        </div>
      </article>
    `;
  }

    function safeFilename(value) {
    return String(value || "redveil-comparison")
      .trim()
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 80);
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function buildComparisonMemoText(items) {
    const sorted = [...items].sort((a, b) => Number(a.riskScore) - Number(b.riskScore));
    const safest = sorted[0];
    const riskiest = sorted[sorted.length - 1];

    const biggestGap = [
      ["가격 부담", "priceBurdenRiskScore"],
      ["거래 유동성", "liquidityRiskScore"],
      ["가격 변동성", "volatilityRiskScore"],
      ["상권 과밀", "competitionRiskScore"],
    ]
      .map(([label, key]) => {
        const values = items.map((item) => Number(item[key] || 0));
        return { label, gap: Math.max(...values) - Math.min(...values) };
      })
      .sort((a, b) => b.gap - a.gap)[0];

    const caution =
      Number(riskiest?.riskScore || 0) >= 70
        ? "매입 보류"
        : Number(riskiest?.riskScore || 0) >= 60
          ? "강한 비교 필요"
          : "추가 검토";

    return [
      "Comparison Memo",
      "",
      "후보 조합:",
      ...items.map(
        (item) =>
          `- ${candidateLabel(item, items)} · ${item.name}: ${formatNumber(item.riskScore, "점")} · ${item.riskArchetype}`
      ),
      "",
      `가장 보수적으로 볼 후보: ${candidateLabel(riskiest, items)} · ${riskiest.name} · ${caution}`,
      `가장 낮은 리스크 후보: ${candidateLabel(safest, items)} · ${safest.name} · ${formatNumber(safest.riskScore, "점")}`,
      `가장 큰 차이를 만든 리스크 축: ${biggestGap.label} · ${formatNumber(biggestGap.gap, "점")}`,
      "",
      "다음 액션:",
      `- ${riskiest.name} 후보는 최근 체결가, 공실률, 임대 조건, 동일 업종 과밀도를 재확인합니다.`,
      `- ${safest.name} 후보를 기준선으로 두고 초과 위험만 다시 비교합니다.`,
      "- 현장 확인 전에는 어떤 후보도 매입 기준 후보로 확정하지 않습니다.",
      "",
      "Claim boundary:",
      "- 이 비교 메모는 매입 추천이나 수익률 예측이 아니라 보류·비교·전문가 검토를 위한 decision artifact입니다.",
      "- 실제 결정에는 최근 실거래, 공실, 임대 조건, 권리금, 대출 조건, 법률·세무·중개 전문가 검토가 필요합니다.",
    ].join("\n");
  }

  async function copyComparisonMemo(items, button) {
    const memo = buildComparisonMemoText(items);

    try {
      await navigator.clipboard.writeText(memo);
      if (button) {
        const originalText = button.textContent;
        button.textContent = "복사 완료";
        setTimeout(() => {
          button.textContent = originalText;
        }, 1400);
      }
    } catch (error) {
      console.warn("Comparison memo copy failed", error);
      window.prompt("복사할 메모입니다. Ctrl+C로 복사하세요.", memo);
    }
  }

  function exportComparisonMemo(items, button) {
    const memo = buildComparisonMemoText(items);
    const filename = `redveil-comparison-memo-${safeFilename(items.map((item) => item.name).join("-vs-"))}.txt`;

    downloadTextFile(filename, memo);

    if (button) {
      const originalText = button.textContent;
      button.textContent = "TXT 저장됨";
      setTimeout(() => {
        button.textContent = originalText;
      }, 1400);
    }
  }

  function renderDecisionMemo(items) {
    const sorted = [...items].sort((a, b) => Number(a.riskScore) - Number(b.riskScore));
    const safest = sorted[0];
    const riskiest = sorted[sorted.length - 1];

    const biggestGap = [
      ["가격 부담", "priceBurdenRiskScore"],
      ["거래 유동성", "liquidityRiskScore"],
      ["가격 변동성", "volatilityRiskScore"],
      ["상권 과밀", "competitionRiskScore"],
    ]
      .map(([label, key]) => {
        const values = items.map((item) => Number(item[key] || 0));
        return { label, key, gap: Math.max(...values) - Math.min(...values) };
      })
      .sort((a, b) => b.gap - a.gap)[0];

    const caution =
      Number(riskiest?.riskScore || 0) >= 70
        ? "매입 보류"
        : Number(riskiest?.riskScore || 0) >= 60
          ? "강한 비교 필요"
          : "추가 검토";

    const mainFactors = topRiskFactors(riskiest, 2)
      .map((factor) => factor.label)
      .join(" · ");

    document.getElementById("compare-memo").innerHTML = `
      <div class="decision-memo-board">
        <article class="decision-memo-row is-primary">
          <span>보류 판단</span>
          <strong>${candidateLabel(riskiest, items)} 우선 ${caution}</strong>
          <p>${riskiest.name} 후보는 ${formatNumber(riskiest.riskScore, "점")}으로 현재 조합에서 가장 보수적으로 봐야 합니다.</p>
        </article>
        <article class="decision-memo-row">
          <span>핵심 이유</span>
          <strong>${mainFactors} 동시 확인</strong>
          <p>${biggestGap.label} 격차가 ${formatNumber(biggestGap.gap, "점")}으로 가장 커 후보 판단을 가릅니다.</p>
        </article>
        <article class="decision-memo-row">
          <span>재확인 항목</span>
          <strong>최근 체결가 · 공실률 · 유동인구</strong>
          <p>현장 확인 전에는 ${riskiest.name} 후보를 기준 후보로 확정하지 않습니다.</p>
        </article>
        <article class="decision-memo-row">
          <span>다음 액션</span>
          <strong>${safest.name} 기준으로 가격선 재비교</strong>
          <p>낮은 리스크 후보를 기준선으로 두고 초과 위험만 다시 검토합니다.</p>
        </article>
      </div>
      <div class="review-export-actions">
        <button class="button button-secondary" type="button" data-comparison-memo-copy>
          Comparison Memo 복사
        </button>
        <button class="button button-secondary" type="button" data-comparison-memo-export>
          TXT export
        </button>
        <p class="compact-note">복사·저장된 비교 메모는 매입 추천이 아니라 보류·비교·전문가 검토용 decision artifact입니다.</p>
      </div>
    `;
  }

  function runCompare() {
    const items = selectedDistricts();
    renderCards(items);
    renderMetrics(items);
    renderRecommendation(items);
    renderDecisionMemo(items);
  }

  document.getElementById("compare-run").addEventListener("click", runCompare);

  document.getElementById("compare-memo")?.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-comparison-memo-copy]");
    const exportButton = event.target.closest("[data-comparison-memo-export]");
    const items = selectedDistricts();

    if (copyButton) {
      copyComparisonMemo(items, copyButton);
      return;
    }

    if (exportButton) {
      exportComparisonMemo(items, exportButton);
    }
  });

  runCompare();
})();
