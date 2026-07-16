# Verification Guide

Redveil has two reproducibility modes: public-safe verification from tracked artifacts, and a fuller raw-data rebuild when excluded local source data is available. The official reviewer product is Redveil V2 at the GitHub Pages `/v2/` path; the root V1 interface remains a preserved legacy surface.

## Verification Scope

| Area | Publicly Verifiable | Notes |
| --- | --- | --- |
| Scoring utilities | Yes | Python unit tests cover score clipping, percentile behavior, and transformation rules. |
| Pipeline guards | Yes | Tests cover XML parsing, raw-summary filtering, risk scoring, and replacement-candidate rules. |
| Public payload | Yes | If raw inputs are absent, the builder uses the tracked public-safe snapshot. |
| API / content shape | Yes | Tests and smoke checks cover bootstrap, comparison, assessment, district, and property-review payloads. |
| Frontend asset consistency | Yes | The prepare script rebuilds static assets and `--check` detects stale generated files. |
| Client runtime | Yes | A Node runtime check validates the browser-side JavaScript entry path. |
| Browser interaction | Yes | Playwright Chromium E2E is required in pull-request and main-branch CI. |
| Responsive rendering | Yes | The Playwright suite checks representative flows and viewports including mobile, tablet, and desktop widths. |
| GitHub Pages artifact | Yes | CI rebuilds `app/site/website_payload.js`; deployment publishes `app/site` only after verification passes. |
| Full raw-data rebuild | Partially | Requires excluded local source data under `data/`. |

Archived public-safe production evidence:

- [2026-06-15 Production verification](docs/evidence/production-verification-2026-06-15.md)
- [Public payload metadata](docs/evidence/public-payload-metadata-2026-06-15.json)
- [Deploy Pages PASS](docs/evidence/deploy-pages-verification-2026-06-15.json)

## Locked Browser Dependency

The browser test runner is declared and locked in the repository:

```json
{
  "devDependencies": {
    "@playwright/test": "1.60.0"
  }
}
```

`package-lock.json` resolves `@playwright/test`, `playwright`, and `playwright-core` to 1.60.0. CI uses `npm ci`; it does not install an untracked or floating Playwright package with `npm install --no-save`.

## Local Verification

Install Python and Node dependencies:

```bash
pip install -r requirements.txt
npm ci
npx playwright install chromium
```

Run the same main checks used by CI:

```bash
python -m unittest discover -s tests -p "test_*.py"
python src/redveil/pipelines/export_website_payload.py
python scripts/prepare_frontend_assets.py
python scripts/prepare_frontend_assets.py --check
node scripts/check_client_runtime.mjs
python scripts/check_site_smoke.py
npm run test:e2e
test -f app/site/website_payload.js
```

On Linux environments that need browser system packages, use:

```bash
npx playwright install --with-deps chromium
```

Optional local site run:

```bash
python app/server.py --host 127.0.0.1 --port 8030
```

The canonical Playwright configuration starts its own local server on `127.0.0.1:4173`, uses Chromium with one worker, retains traces on failure, and stores screenshots only when a test fails.

## Browser E2E Coverage

The required Playwright suite covers the main V2 reviewer path rather than treating browser interaction as an optional manual check. Current coverage includes representative combinations of:

- V2 landing and core route availability.
- Three-minute diagnosis flow and result continuity.
- District search and district-detail navigation.
- Candidate comparison and replacement-candidate behavior.
- Property-review save and replay flow.
- Loading, empty, failure, recovery, and invalid-state handling where implemented by the suite.
- Responsive rendering at representative mobile, tablet, and desktop widths.

Failure traces and screenshots are uploaded from `test-results/` by GitHub Actions.

Legacy Python browser helper scripts may still be run for targeted manual checks:

```bash
python scripts/check_review_e2e.py
python scripts/check_service_flows_e2e.py
python scripts/check_responsive_pages.py
```

They are supplementary. The locked `@playwright/test` suite executed by `npm run test:e2e` is the canonical CI browser check.

## Public Deployment Check

```bash
python scripts/check_public_site.py
```

This checks the GitHub Pages URL by default. Set `REDVEIL_PUBLIC_URL` to test another deployment. The script distinguishes core availability from stale-deployment warnings because public Pages may lag behind unmerged or undeployed repository changes.

The representative URL is:

```text
https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/v2/
```

Vercel remains an alternate deployment and can be checked by setting `REDVEIL_PUBLIC_URL=https://redveil.vercel.app/`.

## CI Verification

The `Deploy Pages` workflow runs the following verification job on pull requests and `main` pushes:

```bash
pip install -r requirements.txt
npm ci
npx playwright install --with-deps chromium
python -m unittest discover -s tests -p "test_*.py"
python src/redveil/pipelines/export_website_payload.py
python scripts/prepare_frontend_assets.py
python scripts/prepare_frontend_assets.py --check
node scripts/check_client_runtime.mjs
python scripts/check_site_smoke.py
npm run test:e2e
test -f app/site/website_payload.js
```

The deployment job is blocked on the verification job. It rebuilds the public payload and frontend assets, uploads `app/site`, and deploys to GitHub Pages only when verification succeeds.

## Scheduled Data Refresh

The `Refresh Public Data` workflow runs quarterly and can be triggered manually. It downloads the latest public Seoul commercial-district/store datasets, rebuilds the public payload, synchronizes coverage/date documentation, runs unit tests plus the CI-safe smoke check, and opens a pull request only when tracked public artifacts change.

MOLIT transaction data is refreshed in that workflow when the repository secret `PUBLIC_DATA_API_KEY` is configured. Without that secret, the workflow falls back to the tracked public-safe transaction snapshot.

## Data And Claim Boundary

- Tracked public files are sufficient to review the V2 product, API/content shape, public payload, unit tests, browser interaction, and deployment path.
- Raw public-data snapshots and generated local review files are excluded from Git by policy.
- When raw inputs are present, the same payload builder can rebuild the public payload from source CSV files.
- Redveil is a screening and review product. It does not provide investment advice, buy/sell recommendations, return forecasts, individual-property accuracy guarantees, or professional legal, tax, financial, appraisal, or brokerage guidance.
- Public-safe risk and hold signals organize review priority; they do not prove future value, transaction success, or legal feasibility.

## Known Limits

- CI does not call external public APIs and does not prove live real-estate data freshness.
- The public deployment check can pass with warnings when GitHub Pages has not yet deployed the latest merged commit.
- Full raw-source rebuilds remain local because source snapshots are intentionally excluded.
- Chromium E2E validates implemented browser flows, not every visual pixel or every possible user/device combination.
- The tracked public-safe payload remains the canonical review artifact for GitHub visitors.
