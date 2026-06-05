# Redveil

[![Deploy Pages](https://github.com/dffxonnb-cyber/Seoul-Storefront-Redveil/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/dffxonnb-cyber/Seoul-Storefront-Redveil/actions/workflows/deploy-pages.yml)
[![Refresh Public Data](https://github.com/dffxonnb-cyber/Seoul-Storefront-Redveil/actions/workflows/refresh-public-data.yml/badge.svg)](https://github.com/dffxonnb-cyber/Seoul-Storefront-Redveil/actions/workflows/refresh-public-data.yml)
[![Live](https://img.shields.io/badge/live-GitHub%20Pages-0f766e)](https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/)
[![Public Verification](https://img.shields.io/badge/tests-public--safe%20verified-2563eb)](./VERIFY.md)

Redveil is an interactive Seoul storefront risk diagnosis prototype that helps prospective buyers identify caution signals, compare alternative districts, and document why a purchase should be paused or reviewed.

It is a portfolio-ready frontend-first product prototype, not a production investment advisory service.

## Portfolio Positioning

Shelter Signal demonstrates public-data pipeline, operational DB, API, and PWA architecture.

Redveil is intentionally different:

```text
Concept-driven product framing
-> interactive decision UX
-> risk interpretation
-> comparison and pause memo
-> portfolio storytelling
```

The product asks a narrower question:

> Before buying this small commercial property, what should make me pause?

## Live Product

- Live site: [GitHub Pages](https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/)
- Property review: [review.html](https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/review.html)
- 3-minute diagnosis: [assessment.html](https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/assessment.html)
- Candidate compare: [compare.html](https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/compare.html)
- District report: [districts.html](https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/districts.html)

## V1 Workflow

1. The user lands on Redveil and understands the pause-first concept.
2. The user selects or reviews a Seoul district or storefront scenario.
3. Redveil shows a risk summary and factor breakdown.
4. The interface explains key caution signals.
5. The user compares alternative areas.
6. The user leaves with a review memo that explains why the purchase should be paused, compared, or escalated.

## Core Screens

| Screen | Purpose |
| --- | --- |
| Home | Explains the pause-first product concept and shows the decision surface. |
| Review | Turns one storefront scenario into a saved risk memo. |
| Diagnosis | Runs a quick district/price/holding-period check. |
| Compare | Places two or three districts on the same risk axes. |
| Districts | Provides a district-level risk report with caution points and alternatives. |

## Data And Logic Overview

Redveil uses public-safe, portfolio-oriented payloads derived from Seoul storefront transaction and commercial-area assumptions.

Main signal families:

- Price burden
- Liquidity risk
- Competition density
- Price volatility
- Demand fragility

The score is a screening signal for review priority. It is not an investment-return prediction and should not be interpreted as a buy/sell recommendation.

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | Static HTML, CSS, JavaScript |
| Product logic | Client-side interpretation and local review state |
| Data preparation | Python, pandas, public-safe payload generation |
| Internal prototype | Streamlit |
| Deployment | GitHub Pages, GitHub Actions |
| QA | Python unittest, local smoke tests, Playwright-based browser checks |

## Project Structure

| Path | Description |
| --- | --- |
| `app/site/` | Static GitHub Pages product experience |
| `app/server.py` | Local verification server and lightweight API endpoints |
| `src/redveil/` | Data preparation and scoring utilities |
| `docs/` | Product, risk model, data source, and portfolio documentation |
| `docs/images/` | README screenshots |
| `scripts/` | Static-site, browser, public-site, and screenshot checks |
| `tests/` | Unit and static-page verification tests |

## Current Status

Redveil V1 is a polished portfolio product prototype.

Completed:

- Pause-first positioning
- Static public product site
- One clear review/diagnosis/compare workflow
- District-level risk interpretation
- Alternative candidate framing
- Decision memo concept
- Portfolio case study
- Local and public verification scripts

## Limitations

- Redveil is a portfolio prototype.
- It is not financial, legal, or real-estate investment advice.
- Risk signals are exploratory and based on available/static data assumptions.
- Real-world use would require updated transaction data, verified commercial-area data, professional review, and stronger validation.
- Building-level lease terms, vacancy, management costs, rights premium, tenant quality, and legal constraints are not fully modeled.

## Local Setup

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install Node dependencies for Playwright-based checks:

```bash
npm install
```

Run the local verification server:

```bash
python app/server.py --host 127.0.0.1 --port 8030
```

Open:

```text
http://127.0.0.1:8030
```

## Validation

```bash
git diff --check
npm run build
python -m unittest discover -s tests -p "test_*.py"
python scripts/check_site_smoke.py
```

Additional browser checks:

```bash
python scripts/check_review_e2e.py
python scripts/check_service_flows_e2e.py
python scripts/check_responsive_pages.py
```

Public deployment check:

```bash
python scripts/check_public_site.py
```

## Portfolio Docs

- [Portfolio case study](./docs/portfolio-case-study.md)
- [Data sources](./docs/DATA_SOURCES.md)
- [Risk validation](./docs/RISK_VALIDATION.md)
- [Risk model spec](./docs/RISK_MODEL_SPEC.md)
- [User journey](./docs/USER_JOURNEY.md)
- [Validation strategy](./docs/VALIDATION_STRATEGY.md)

## Portfolio Value

Redveil shows product thinking beyond data plumbing: framing an ambiguous decision, translating risk signals into UX, controlling claims, building a coherent visual identity, and giving a reviewer one complete workflow to understand quickly.

## License

This project is licensed under the [MIT License](./LICENSE). Public data rights and usage conditions follow the policies of each original data provider.
