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
```

Optional local site run:

```bash
python app/server.py --host 127.0.0.1 --port 8030
```

## CI Verification

GitHub Actions runs:

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -p "test_*.py"
python src/redveil/pipelines/export_website_payload.py
test -f app/site/website_payload.js
```

The deploy job repeats the payload build and publishes `app/site` to GitHub Pages.

## Data Boundary

- Tracked public files are enough to review the service UI, API shape, public payload, tests, and deployment path.
- Raw public-data snapshots and generated local review files are excluded from Git by policy.
- When raw inputs are present, the same payload builder can rebuild the public payload from source CSVs.

## Known Limits

- CI does not call external public APIs.
- CI does not validate live real-estate data freshness.
- The public-safe snapshot should be treated as the reviewable artifact for GitHub visitors.
