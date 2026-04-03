# PRD: Storefront Red Team

## 1. Problem

Small commercial-property investors often anchor on a good-looking location, a familiar district, or broker narratives.
They underweight the counter-evidence:

- prices that have run ahead of commercial demand
- thinning transaction liquidity
- merchant oversaturation
- weak local sales productivity

The result is a predictable failure mode:
the investor buys into a story, not into resilient area fundamentals.

## 2. Product thesis

If the product is designed to challenge the purchase decision instead of supporting it, investors will make fewer weak acquisitions and compare alternatives more rationally.

## 3. Target user

### Primary

- Retail investor buying a small commercial unit in Seoul
- Budget-sensitive and yield-sensitive
- Needs a pre-purchase red-flag check, not a full institutional underwriting model

### Secondary

- Analyst or broker preparing a short investment note
- Wants a fast objection list and comparable lower-risk districts

## 4. Core job to be done

When I am about to buy a small commercial property in Seoul,
help me see the strongest reasons to pause, reject, or compare alternatives before I commit.

## 5. Product principles

- Objection-first: show the strongest negatives before any positive signal
- Explainable: every score must map to visible evidence
- Comparable: risk is more useful when shown against nearby or peer districts
- Actionable: every warning should imply a next step

## 6. MVP scope

### Geography

- Seoul only

### Analysis units

- District (`gu`) for the integrated risk rank
- Admin dong for merchant-density drilldown
- Trade area for sales and floating-population evidence

### User inputs

- district name
- admin dong name
- optional building price assumptions in later phase

### Outputs

- overall acquisition risk score
- top three objections
- sub-scores by pillar
- comparable lower-risk districts
- merchant saturation profile
- trade-area demand context

## 7. Key use cases

### Use case 1: Fast pre-check

The investor enters `Mapo-gu`.
The product returns:

- overall risk
- strongest objections
- peer districts with lower risk

### Use case 2: Drilldown

The investor opens `Seogyo-dong`.
The product returns:

- merchant density
- top merchant categories
- food-share saturation
- nearby district-level transaction context

### Use case 3: Alternative search

The investor likes a high-risk district.
The product suggests districts with:

- lower acquisition risk
- similar merchant mix
- better liquidity or lower price burden

## 8. User-facing screens

### Screen 1: Red-team home

- search box
- Seoul district risk ranking
- "Do not buy yet" cards for the riskiest districts

### Screen 2: District memo

- overall score
- objection summary
- sub-score breakdown
- time-series transaction context
- merchant saturation snapshot
- replacement candidates

### Screen 3: Admin dong drilldown

- merchant count
- food-share
- top categories
- area reference information

### Screen 4: Trade-area evidence

- top service category
- total sales
- floating population
- sales-per-population metrics
- caveat flags for unstable denominators

## 9. Success metrics

### Product metrics

- user can identify top three objections in under 30 seconds
- user can compare at least two alternatives in one flow
- each red flag can be traced to a source metric

### Portfolio metrics

- the product story clearly connects planning, data, analytics, and implementation
- the scoring logic is explainable and reproducible
- the application demonstrates decision support, not passive visualization

## 10. Out of scope for phase 1

- property-level rent-roll analysis
- cap-rate estimation
- exact vacancy-rate prediction
- machine-learned price forecasting
- formal underwriting for individual buildings

## 11. Delivery plan

### Phase 1

- finalize product framing and risk pillars
- produce district transaction risk
- produce district/admin-dong competition risk
- ship memo-first UI

### Phase 2

- integrate trade-area demand into scoring
- introduce alternative district recommendation logic
- add stronger explanation templates

### Phase 3

- add property-level inputs
- add scenario analysis
- test model calibration against real case studies
