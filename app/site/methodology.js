(function () {
  const { payload } = window.RedveilV2 || {};
  if (!payload) return;

  const { site, content, methodology } = payload;

  document.getElementById("problem-statement").textContent = `${methodology.problemStatement} ${site.timeCaveat} ${site.sampleCaveat}`;

  function render(target, items, label) {
    document.getElementById(target).innerHTML = items
      .map((item) => {
        if (typeof item === "string") return `<article><strong>${label}</strong><p>${item}</p></article>`;
        if (Array.isArray(item)) return `<article><strong>${item[0]}</strong><p>${item[1]}</p></article>`;
        return `<article><strong>${item.title || item.term}</strong><p>${item.body || item.definition || item.description}</p></article>`;
      })
      .join("");
  }

  render("principles-list", content.principles || [], "Principle");
  render("pillars-list", methodology.pillars || [], "Pillar");
  render("outputs-list", methodology.outputs || [], "Output");
  render("blueprint-list", content.serviceBlueprint || [], "Flow");
  render("architecture-list", content.architecture || [], "Architecture");
  render("roadmap-list", content.roadmap || [], "Roadmap");
  render("limitations-list", content.limitations || [], "주의");
  render("glossary-list", content.glossary || [], "용어");
})();
