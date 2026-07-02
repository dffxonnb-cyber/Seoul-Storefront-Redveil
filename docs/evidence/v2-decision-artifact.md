# Redveil V2 Decision Artifact Evidence

Evidence date: **2026-07-02 KST**

Related implementation commit: `ac99460 feat: add professional review checklist`

## What Changed In V2

Redveil V2 adds a decision artifact layer to the existing public portfolio prototype. The V2 work strengthens reviewable outputs so a reviewer can copy, export, compare, and hand off pause-first review notes without turning Redveil into an advisory or recommendation product.

V2 keeps the existing public V1 review flow intact. It extends the result surfaces with structured artifacts:

- Hold Memo for a single storefront review.
- Comparison Memo for two or three candidate districts.
- Professional Review Checklist for re-checking and professional handoff.

## Hold Memo Copy / Export

The review result screen now supports a Hold Memo that can be copied to the clipboard or exported as a `.txt` file.

Implementation scope:

- `app/site/review.js` builds the Hold Memo text in one memo builder.
- The memo includes the storefront candidate, district context, risk score, pause reasons, re-check items, replacement candidates, professional review checklist, and claim boundary.
- Clipboard copy and TXT export use the existing button/action structure.
- The memo language frames the output as a pause-first decision artifact, not as a buy/sell recommendation.

## Comparison Memo Copy / Export

The compare screen now supports a Comparison Memo that can be copied to the clipboard or exported as a `.txt` file.

Implementation scope:

- `app/site/compare.js` builds the Comparison Memo text in one memo builder.
- The memo includes the candidate combination, conservative review candidate, lower-risk comparison baseline, largest risk-axis gap, next actions, professional review checklist, and claim boundary.
- Clipboard copy and TXT export use the existing button/action structure.
- The memo language supports comparison baseline review and professional review handoff, not investment ranking.

## Professional Review Checklist

The Professional Review Checklist appears in both the review result screen and the Comparison Memo area.

Checklist items:

- Re-check recent transaction prices / asking prices.
- Check vacancy possibility.
- Check lease terms.
- Check rights premium / management fees.
- Check loan conditions.
- Check same-business competition density on site.
- Check hourly foot-traffic variation.
- Legal / tax / brokerage professional review.

The same checklist is included in copied/exported memo text so the saved artifact matches the visible review surface.

## Implementation Scope

Files touched for the V2 decision artifact UI layer:

- `app/site/review.js`
- `app/site/compare.js`
- `app/site/styles.css`

Documentation evidence added or updated:

- `docs/evidence/v2-decision-artifact.md`
- `docs/evidence/README.md`
- `docs/V2_SCOPE.md`
- `README.md`
- `docs/portfolio-case-study.md`

This update is frontend/static-site scoped. It does not add accounts, server storage, paid-service flows, production advisory workflows, or building-level legal/lease verification.

## Verification Commands

Requested verification:

```bash
npm run build
py -m unittest discover -s tests -p "test_*.py"
```

Result on 2026-07-02 KST: both commands passed locally on `featrue/v2-decision-artifact`; unittest discovery ran 23 tests.

Additional UI implementation checks completed before this evidence update:

```bash
node --check app/site/review.js
node --check app/site/compare.js
npm run build
py -m unittest discover -s tests -p "test_*.py"
```

Verification boundary:

- Local static build validation and Python unit/static-page tests are claimed.
- Browser E2E, production deployment, and fresh public GitHub Pages verification are not claimed by this V2 evidence page unless separately archived.

## Claim Boundary

Redveil is a public-safe portfolio prototype focused on pause-first decision support.

Redveil does not provide:

- investment advice
- buy/sell recommendations
- return prediction
- legal advice
- tax advice
- financial advice
- brokerage advice
- on-site professional review

The Hold Memo, Comparison Memo, and Professional Review Checklist are decision artifacts for re-checking, comparison baseline review, and professional review handoff. They do not replace legal, tax, financial, brokerage, or on-site professional review.
