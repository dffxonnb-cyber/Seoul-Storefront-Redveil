# Redveil v2 Plan

## v2 goal

Redveil v2 is a separate dashboard experiment for a commercial-grade Seoul storefront risk intelligence product. The goal is to make the first screen feel like an operator console: Seoul risk map first, clear risk index second, and candidate comparison close enough to support a buy, hold, or compare decision.

## Difference between v1 and v2

- v1 remains the stable portfolio-ready public website and current user flow.
- v2 is an isolated experiment under `app/site/v2/` and should not redesign, rename, or overwrite v1 pages.
- v1 emphasizes page-by-page product storytelling and task entry points.
- v2 emphasizes a dark SaaS dashboard, signal monitoring, map-centered analysis, and faster candidate triage.
- v1 can continue to host the proven Review, Diagnosis, Compare, and District Report flows while v2 tests a dashboard shell around those flows.

## 12-week roadmap

| Week | Focus | Outcome |
| --- | --- | --- |
| 1 | Static dashboard scaffold | `/v2/` homepage with sidebar, top status bar, risk map, score, top signal, candidate rows, and workflow links. |
| 2 | Data contract audit | Define the stable v2 payload shape for district scores, candidate rows, trend deltas, and signal explanations. |
| 3 | Map model | Convert abstract nodes into a reusable district map component with selected, high, watch, and low states. |
| 4 | Risk index logic | Document score weighting and show why a district is high risk in plain Korean. |
| 5 | Candidate comparison | Add sortable candidate rows for risk score, rent delta, liquidity, and competition density. |
| 6 | Property detail bridge | Link selected map districts and candidate rows into the existing v1 review workflow without breaking v1. |
| 7 | Diagnosis bridge | Pre-fill the v1 diagnosis page from v2 state when query parameters are available. |
| 8 | District report bridge | Add district-level deep links and preserve direct access to the v1 district report. |
| 9 | Responsive QA | Verify 390px mobile, tablet, laptop, and 1440px desktop layouts without horizontal overflow. |
| 10 | Accessibility QA | Review keyboard navigation, landmarks, contrast, aria labels, and reduced-motion behavior. |
| 11 | Portfolio polish | Tighten copy, visual hierarchy, screenshots, and README references for a portfolio reviewer. |
| 12 | v2 decision gate | Decide whether v2 stays experimental, becomes the default homepage, or graduates selected components into v1. |

## Screen priority

1. Dashboard homepage at `app/site/v2/index.html`.
2. Seoul risk map and district selection states.
3. Overall risk index and top signal explanation.
4. Candidate comparison rows.
5. Workflow cards that bridge to v1 Review, Diagnosis, Compare, and District Report pages.
6. Later detail screens only after the homepage dashboard proves useful.

## Design system principles

- Use a deep black and navy intelligence UI as the base.
- Reserve red for high-risk, alert, selected, active, and CTA states.
- Keep borders thin with `rgba(255,255,255,0.08)` to `rgba(255,255,255,0.12)`.
- Prefer dense dashboard panels over landing-page sections.
- Keep the Seoul map as the visual center.
- Avoid external CDN dependencies so GitHub Pages remains static and portable.
- Keep v2 CSS isolated in `app/site/v2/redveil-v2.css`.
- Support mobile by collapsing navigation and stacking panels into one column.

## v1 safety rule

v1 must not be broken, overwritten, or visually redesigned by v2 work. Existing files such as `app/site/index.html`, `app/site/review.html`, `app/site/assessment.html`, `app/site/compare.html`, `app/site/districts.html`, and `app/site/styles.css` should stay untouched unless a future task explicitly requires a compatibility fix.

## First implementation scope

The first implementation creates a static GitHub Pages friendly dashboard scaffold:

- `app/site/v2/index.html`
- `app/site/v2/redveil-v2.css`
- `app/site/v2/redveil-v2.js`
- `docs/REDVEIL_V2_PLAN.md`

The page loads `../website_payload.js` when available, safely falls back to Korean sample data, renders candidate comparison rows through JavaScript, and links workflow cards back to the existing v1 pages.

## Map-first update

The next v2 iteration promotes the Seoul risk map from a decorative panel to the primary dashboard surface. The v2 homepage should render all 25 Seoul districts as an SVG cartogram, keep district selection connected to the risk index and top signal panels, and use the existing v1 flows only as linked workflow destinations.

V2 map direction shifted from district-only cartogram to district plus urban grid risk scan layer.

The homepage layout should now prioritize a premium map-first command center: slimmer navigation, compact header copy, a dominant Seoul risk map, connected signal panels, and quieter workflow links.

The visual system polish pass should improve scale, typography, panel depth, and candidate-table clarity without changing the v1 flow or adding external map dependencies.

The command-center redesign pass should make the v2 homepage visibly different from the earlier admin-like dashboard by emphasizing a larger map screen, product rail, connected intelligence column, and ranking-style candidate module.

The map focus system pass should keep the command-center layout stable while making the Seoul map feel like a live risk scan surface: deterministic hotspots, selected-district target ring/crosshair/halo, clearer boundaries, a muted Han River anchor, and selected-district intelligence labels in the right-side panels.

The real-boundary map pass uses a static `app/site/v2/data/seoul-districts.geojson` converted from the Seoul Open Data Plaza dataset `서울시 상권분석서비스(영역-자치구)`. The source Shapefile was EPSG:5181 and is converted to EPSG:4326 GeoJSON for GitHub Pages friendly SVG rendering with no external map API.

The latest v2 map direction removes the earlier cartogram, hotspot, and 500m grid experiment layers from the visible map. The dashboard now treats the real Seoul district boundary paths as the primary clickable risk map surface.
