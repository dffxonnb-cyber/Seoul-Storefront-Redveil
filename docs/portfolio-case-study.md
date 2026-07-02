# Redveil Portfolio Case Study

## Project Summary

Redveil is a concept-driven risk diagnosis interface for Seoul storefront purchase decisions. It helps prospective small-commercial-property buyers identify caution signals, compare alternative districts, and document why a purchase should be paused or reviewed.

Redveil is built as a portfolio-ready frontend-first prototype, not as a production real-estate advisory product.

- Primary live demo: https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/
- Alternate deployment: https://redveil.vercel.app/
- Production evidence: [evidence/production-verification-2026-06-15.md](evidence/production-verification-2026-06-15.md)

## Problem

Small storefront purchases can look attractive before the buyer has checked price burden, transaction liquidity, competition density, volatility, and demand fragility together.

Most raw public or commercial-area datasets are not phrased in the language of a decision. Redveil reframes the experience from:

```text
What should I buy?
```

to:

```text
What should make me pause first?
```

## Target User

The V1 target user is a prospective buyer or early-stage investor reviewing a small Seoul storefront candidate. They are not looking for an automated purchase recommendation; they need a structured way to notice red flags before committing to deeper due diligence.

## Product Concept

Redveil is a pause-first decision surface.

Instead of ranking areas as good or bad investments, it organizes risk signals into:

- a risk overview
- pause reasons
- district signal
- alternative candidates
- factor breakdown
- decision memo
- data basis and limitations

The UI should make the user slower and more careful, not more impulsive.

V2 adds a decision artifact layer: Hold Memo, Comparison Memo, and Professional Review Checklist outputs turn pause-first review into a clearer professional handoff artifact without becoming investment advice or a buy/sell recommendation.

## User Workflow

1. The user lands on Redveil and understands the pause-first concept.
2. The user selects or reviews a Seoul district or storefront scenario.
3. The app shows a risk summary.
4. The app explains key caution signals.
5. The user compares alternative areas.
6. The user writes or reviews a decision memo explaining why the purchase should be paused, reviewed, or escalated.

## Data Signals

Redveil uses portfolio-safe public/commercial-area assumptions and static payloads.

Current public payload periods:

- transactions: `2025.04~2026.03`
- Seoul commercial-district demand: `2025년 4분기`
- store competition: `2026.03.31 기준 파일`

Signal families:

- Price burden
- Liquidity risk
- Competition density
- Volatility
- Demand fragility

The score is a screening signal for review priority. It is not an investment-return prediction.

## Key UX Decisions

- Lead with pause reasons instead of recommendations.
- Use a dark intelligence-interface mood with restrained red accents.
- Show factor breakdowns as interpretation cues rather than proof of certainty.
- Use alternatives to encourage comparison before commitment.
- Keep the workflow narrow so a reviewer can understand the product in one pass.
- Include limitations directly in the product surface.

## What I Built

- Static public site for GitHub Pages
- Home decision surface for Redveil V1
- Property review flow
- 3-minute diagnosis flow
- Candidate comparison view
- District report view
- V2 decision artifact layer with Hold Memo, Comparison Memo, and Professional Review Checklist handoff surfaces
- Public-safe website payload
- Local verification server
- Python unittest coverage
- Static site smoke checks
- Portfolio README and case study

## Technical Stack

| Area | Stack |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Product logic | Client-side decision interpretation and local review state |
| Data preparation | Python, pandas |
| Internal prototype | Streamlit |
| Deployment | GitHub Pages, GitHub Actions |
| QA | unittest, smoke tests, Playwright-based checks |

## Relationship To Shelter Signal

Shelter Signal is a public-data pipeline and operational PWA project: Docker validation, hosted PostgreSQL, serverless API routes, and fallback architecture.

Redveil is deliberately positioned differently. It emphasizes product framing, visual hierarchy, risk interpretation, and interactive decision UX.

Together, the two projects show that I can connect data, product thinking, interface design, and implementation without making every project the same kind of backend-heavy pipeline.

## Limitations

- Redveil is a portfolio prototype.
- It is not financial, legal, or real-estate investment advice.
- Risk signals are exploratory and based on available/static data assumptions.
- Low-sample districts require stronger caution, and the payload can become stale between public-data refreshes.
- Real-world use would require updated transaction data, verified commercial-area data, professional review, and stronger validation.
- Building-level lease terms, vacancy, rights premium, tenant quality, financing, and legal constraints are not fully modeled.

## V2 Status And Roadmap

Completed V2 decision artifact additions:

- Copy/exportable Hold Memo
- Copy/exportable Comparison Memo
- Professional Review Checklist for pause-first review and professional handoff

Potential future additions:

- Cleaner district and admin-dong level data refresh
- More transparent signal weighting controls
- Scenario notes and saved comparisons
- More robust validation against historical outcomes
- Better map interaction and location search

Out of scope for V1:

- production investment advice
- paid/external services
- private backend complexity
- legal or financial recommendation claims

## Portfolio Description

Redveil is an interactive Seoul storefront risk diagnosis prototype that helps prospective buyers identify caution signals, compare alternative districts, and document why a purchase should be paused or reviewed. It demonstrates product design, decision-flow thinking, risk interpretation, and visually refined frontend implementation.
