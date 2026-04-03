(async function () {
  const { fetchJson, renderError } = window.SiteApi;

  try {
    const [methodology, content, site] = await Promise.all([
      fetchJson("/api/methodology"),
      fetchJson("/api/content"),
      fetchJson("/api/site"),
    ]);

    document.getElementById("problem-statement").textContent = methodology.problemStatement;
    document.getElementById("principles-list").innerHTML = content.principles
      .map((item) => `<li><strong>${item.title}</strong> · ${item.body}</li>`)
      .join("");
    document.getElementById("pillars-list").innerHTML = methodology.pillars.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("outputs-list").innerHTML = methodology.outputs.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("architecture-list").innerHTML = content.architecture.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("roadmap-list").innerHTML = content.roadmap.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("limitations-grid").innerHTML = content.limitations
      .map(
        (item) => `
      <article class="data-card">
        <strong>주의점</strong>
        <p>${item}</p>
      </article>
    `
      )
      .join("");
    document.getElementById("time-caveat").textContent = `시점 주의: ${site.timeCaveat}`;
    document.getElementById("sample-caveat").textContent = `표본 주의: ${site.sampleCaveat}`;
  } catch (error) {
    renderError(error);
  }
})();
