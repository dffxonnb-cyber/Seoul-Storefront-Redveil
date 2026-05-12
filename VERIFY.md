# Verification Guide

Redveil has two reproducibility modes: public-safe verification from tracked artifacts, and full raw-data rebuild when local source data is available.

## Verification Scope

| Area | Publicly Verifiable | Notes |
| --- | --- | --- |
| Scoring utilities | Yes | Unit tests cover score clipping and percentile behavior. |
| Pipeline guards | Yes | Tests cover XML parsing, raw summary filtering, risk scoring, and replacement candidate rules. |
| Public payload | Yes | If raw inputs are absent, the builder falls back to the tracked public-safe snapshot. |
| Local API shape | Yes | Tests check bootstrap, comparison, assessment, and property review payloads. |
| GitHub Pages artifact | Yes | CI rebuilds `app/site/website_payload.js` before deployment. |
| Full raw-data rebuild | Partially | Requires excluded local data under `data/`. |

## Local Verification

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -p "test_*.py"
python src/redveil/pipelines/export_website_payload.py
python scripts/check_site_smoke.py
```

Optional local site run:

```bash
python app/server.py --host 127.0.0.1 --port 8030
```

Optional browser E2E for the property-review flow:

```bash
python scripts/check_review_e2e.py
python scripts/check_service_flows_e2e.py
python scripts/check_responsive_pages.py
```

These checks start the local server and open the service through Chrome/Edge and Playwright. They cover the property-review save/replay flow, the 3-minute diagnosis, candidate comparison, district search/detail flow, and responsive rendering at 390px, 768px, and 1440px. They require Node.js, Playwright, and a local Chrome or Edge install.

Optional public deployment check:

```bash
python scripts/check_public_site.py
```

This checks the GitHub Pages URL by default. Set `REDVEIL_PUBLIC_URL` to test another deployment. The script distinguishes core availability from stale deployment warnings, because public Pages may lag behind local unpushed changes.

## CI Verification

GitHub Actions runs:

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -p "test_*.py"
python src/redveil/pipelines/export_website_payload.py
python scripts/check_site_smoke.py
test -f app/site/website_payload.js
```

The smoke check starts the local app server, verifies core HTML pages, validates the public payload examples, and exercises the bootstrap/content/assessment API path. The deploy job repeats the payload build and publishes `app/site` to GitHub Pages.

## Scheduled Data Refresh

The `Refresh Public Data` workflow runs quarterly and can be triggered manually. It downloads the latest public Seoul commercial-district/store datasets, rebuilds the public payload, syncs coverage/date documentation, runs unit tests plus the CI-safe smoke check, and opens a pull request only when tracked public artifacts change.

MOLIT transaction data is still bounded by the tracked public-safe snapshot unless a fresh data.go.kr service-key rebuild is run separately.

## Data Boundary

- Tracked public files are enough to review the service UI, API shape, public payload, tests, and deployment path.
- Raw public-data snapshots and generated local review files are excluded from Git by policy.
- When raw inputs are present, the same payload builder can rebuild the public payload from source CSVs.

## Known Limits

- CI does not call external public APIs.
- CI does not validate live real-estate data freshness.
- CI keeps browser interaction checks optional because they require a browser runtime.
- The public deployment check can pass with warnings when GitHub Pages has not yet picked up the latest local changes.
- The public-safe snapshot should be treated as the reviewable artifact for GitHub visitors.
