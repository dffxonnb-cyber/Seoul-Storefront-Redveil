(function () {
  const payload = window.__REDVEIL_PAYLOAD__ || {};
  const districts = [...(payload.districts || [])]
    .filter((district) => district && district.code)
    .sort((left, right) => Number(right.riskScore || 0) - Number(left.riskScore || 0));

  const DISTRICT_NAMES = {
    "11110": "Jongno-gu",
    "11140": "Jung-gu",
    "11170": "Yongsan-gu",
    "11200": "Seongdong-gu",
    "11215": "Gwangjin-gu",
    "11230": "Dongdaemun-gu",
    "11260": "Jungnang-gu",
    "11290": "Seongbuk-gu",
    "11305": "Gangbuk-gu",
    "11320": "Dobong-gu",
    "11350": "Nowon-gu",
    "11380": "Eunpyeong-gu",
    "11410": "Seodaemun-gu",
    "11440": "Mapo-gu",
    "11470": "Yangcheon-gu",
    "11500": "Gangseo-gu",
    "11530": "Guro-gu",
    "11545": "Geumcheon-gu",
    "11560": "Yeongdeungpo-gu",
    "11590": "Dongjak-gu",
    "11620": "Gwanak-gu",
    "11650": "Seocho-gu",
    "11680": "Gangnam-gu",
    "11710": "Songpa-gu",
    "11740": "Gangdong-gu",
  };

  const fallbackDistrict = {
    code: "11650",
    riskScore: 78,
    riskGrade: "High caution",
    priceBurdenRiskScore: 86,
    liquidityRiskScore: 64,
    competitionRiskScore: 72,
    volatilityRiskScore: 68,
    transactionRiskScore: 74,
    replacementCandidates: [],
  };

  const target = districts[0] || fallbackDistrict;

  function $(id) {
    return document.getElementById(id);
  }

  function formatNumber(value, suffix = "", digits = 0) {
    const numeric = Number(value || 0);
    return `${numeric.toLocaleString("en-US", { maximumFractionDigits: digits })}${suffix}`;
  }

  function districtName(district) {
    return DISTRICT_NAMES[String(district?.code || "")] || "Selected Seoul district";
  }

  function riskLevel(score) {
    const numeric = Number(score || 0);
    if (numeric >= 70) return "High caution";
    if (numeric >= 50) return "Review";
    return "Monitor";
  }

  function factorItems(district) {
    return [
      {
        label: "Price burden",
        score: Number(district.priceBurdenRiskScore || 0),
        note: "Checks whether the purchase price looks stretched against nearby transaction levels.",
      },
      {
        label: "Liquidity risk",
        score: Number(district.liquidityRiskScore || district.transactionRiskScore || 0),
        note: "Flags thin or slowing transaction flow before assuming an easy exit.",
      },
      {
        label: "Competition density",
        score: Number(district.competitionRiskScore || 0),
        note: "Looks for crowded commercial supply and category pressure.",
      },
      {
        label: "Volatility",
        score: Number(district.volatilityRiskScore || 0),
        note: "Highlights unstable recent deal levels that need manual verification.",
      },
    ].sort((left, right) => right.score - left.score);
  }

  function renderHero() {
    if ($("hero-score")) $("hero-score").textContent = formatNumber(target.riskScore);
    if ($("hero-district")) $("hero-district").textContent = districtName(target);
    if ($("hero-summary")) {
      $("hero-summary").textContent =
        `${riskLevel(target.riskScore)} mode: price, liquidity, competition, and volatility are reviewed before any purchase-positive interpretation.`;
    }
    if ($("hero-signals")) {
      $("hero-signals").innerHTML = factorItems(target)
        .slice(0, 3)
        .map(
          (item) => `
            <article>
              <span>${item.label}</span>
              <strong>${formatNumber(item.score)}</strong>
              <p>${item.note}</p>
            </article>
          `
        )
        .join("");
    }
  }

  function renderWorkflow() {
    const steps = [
      ["01", "Orient", "Understand Redveil as a pause-first review tool, not a recommendation engine."],
      ["02", "Select", "Choose a district or storefront scenario and anchor the review in one decision context."],
      ["03", "Diagnose", "Read the risk summary, key caution signals, and factor breakdown."],
      ["04", "Compare", "Review alternative districts before treating the original candidate as acceptable."],
      ["05", "Memo", "Document why the purchase should be paused, reviewed, or escalated for professional checks."],
    ];

    if ($("entry-grid")) {
      $("entry-grid").innerHTML = steps
        .map(
          ([index, title, body]) => `
            <article class="redveil-workflow-card">
              <span>${index}</span>
              <strong>${title}</strong>
              <p>${body}</p>
            </article>
          `
        )
        .join("");
    }
  }

  function renderOverview() {
    const summary = payload.summary || {};
    const items = [
      ["Transactions", formatNumber(summary.transactionCount || 12074), "Public-safe transaction sample"],
      ["Districts", formatNumber(summary.districtCount || 25), "Seoul district coverage"],
      ["Trade areas", formatNumber(summary.tradeAreaCount || 1520), "Commercial-area signal base"],
      ["Decision mode", "Pause", "Review before purchase"],
    ];

    if ($("risk-overview")) {
      $("risk-overview").innerHTML = items
        .map(
          ([label, value, note]) => `
            <article>
              <span>${label}</span>
              <strong>${value}</strong>
              <p>${note}</p>
            </article>
          `
        )
        .join("");
    }
  }

  function renderPauseReasons() {
    const reasons = factorItems(target)
      .slice(0, 4)
      .map((item) => `${item.label}: ${item.note}`);

    if ($("pause-reason-list")) {
      $("pause-reason-list").innerHTML = reasons.map((reason) => `<li>${reason}</li>`).join("");
    }
  }

  function renderDistricts() {
    if (!$("district-signal-grid")) return;

    $("district-signal-grid").innerHTML = (districts.length ? districts : [fallbackDistrict])
      .slice(0, 4)
      .map(
        (district) => `
          <article>
            <span>${riskLevel(district.riskScore)}</span>
            <strong>${districtName(district)}</strong>
            <p>${formatNumber(district.riskScore)}/100 risk score</p>
          </article>
        `
      )
      .join("");
  }

  function renderAlternatives() {
    const alternatives = [
      ["Seongdong-gu", "Compare price pressure against a younger commercial demand profile."],
      ["Mapo-gu", "Check whether liquidity and tenant-mix assumptions are less fragile."],
      ["Yongsan-gu", "Review if a lower risk score still fits the buyer's operating thesis."],
    ];

    if ($("alternative-list")) {
      $("alternative-list").innerHTML = alternatives
        .map(
          ([name, note], index) => `
            <article>
              <span>0${index + 1}</span>
              <div>
                <strong>${name}</strong>
                <p>${note}</p>
              </div>
            </article>
          `
        )
        .join("");
    }
  }

  function renderFactors() {
    if (!$("factor-list")) return;

    $("factor-list").innerHTML = factorItems(target)
      .map(
        (item) => `
          <article>
            <div>
              <strong>${item.label}</strong>
              <span>${formatNumber(item.score)}/100</span>
            </div>
            <div class="redveil-factor-bar" aria-hidden="true">
              <i style="width:${Math.max(6, Math.min(100, item.score))}%"></i>
            </div>
            <p>${item.note}</p>
          </article>
        `
      )
      .join("");
  }

  function renderMemo() {
    const memoPoints = [
      "Do not treat a high-visibility district as automatically safer.",
      "Ask for recent comparable transactions before accepting the asking price.",
      "Compare at least two alternative districts with the same criteria.",
      "Escalate to professional review before any real purchase decision.",
    ];

    if ($("memo-points")) {
      $("memo-points").innerHTML = memoPoints.map((point) => `<li>${point}</li>`).join("");
    }
  }

  function renderCases() {
    const cases = [
      ["High caution candidate", "Large price burden and unstable recent deals make the purchase thesis fragile."],
      ["Ambiguous candidate", "Some signals are acceptable, but liquidity and competition need comparison."],
      ["Conservative review", "The score is moderate, yet field checks and lease terms still decide the outcome."],
    ];

    if ($("scenario-case-grid")) {
      $("scenario-case-grid").innerHTML = cases
        .map(
          ([title, body]) => `
            <article class="scenario-case-card">
              <div class="scenario-case-head">
                <span class="scenario-case-label">V1 Example</span>
                <strong>${title}</strong>
              </div>
              <p>${body}</p>
              <div class="scenario-action-line">
                <span>Next action</span>
                <p>Pause, compare, and document the review question.</p>
              </div>
            </article>
          `
        )
        .join("");
    }
  }

  renderHero();
  renderWorkflow();
  renderOverview();
  renderPauseReasons();
  renderDistricts();
  renderAlternatives();
  renderFactors();
  renderMemo();
  renderCases();
})();
