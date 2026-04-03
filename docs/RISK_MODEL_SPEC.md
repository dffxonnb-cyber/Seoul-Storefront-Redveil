# Risk Model Spec

## Goal

The model should not answer "Where should I buy?"

It should answer:
"What are the strongest reasons this acquisition thesis could be wrong?"

## Modeling philosophy

- Use explainable scores, not opaque predictions
- Treat score output as a pre-acquisition warning system
- Keep raw evidence visible next to every sub-score
- Prefer robust heuristics over fake precision

## Phase 1 score structure

### Overall acquisition risk

`overall_acquisition_risk = 0.40 price/liquidity + 0.35 competition + 0.25 demand`

The exact weights can change after calibration, but phase 1 should keep them fixed and documented.

## Pillar 1: Price and liquidity risk

### Purpose

Detect districts where acquisition cost is elevated but transaction conditions are weakening.

### Current data source

- MOLIT commercial transaction data

### Current sub-signals

- median price per square meter
- recent price growth versus trailing average
- transaction count
- transaction count versus trailing average
- six-month price volatility

### Current outputs already implemented

- `price_burden_risk_score`
- `liquidity_risk_score`
- `volatility_risk_score`
- `overall_transaction_risk_score`

### Interpretation

High score means:

- buying is expensive relative to peers
- exits may be harder
- recent market behavior is less stable

## Pillar 2: Competition risk

### Purpose

Detect districts or admin dongs where merchant density and merchant concentration may make tenant durability worse.

### Current data source

- Small Business Market Promotion Corporation store dataset

### Current district signals

- total store count
- food-store share
- stores per admin dong
- top category share
- small-category concentration

### Current output already implemented

- `competition_risk_score`

### Interpretation

High score means:

- too many merchants are competing in a limited local footprint
- the area may be over-dependent on a narrow set of business types

## Pillar 3: Demand fragility risk

### Purpose

Detect trade areas where commercial activity may look large in absolute terms but weak relative to the area structure.

### Current data sources

- Seoul trade-area sales
- Seoul floating population
- Seoul attractor facilities

### Signals to build next

- sales per floating population with denominator floor
- sales per transaction
- floating population per service category
- attractor intensity
- low-population instability flag

### Planned output

- `demand_fragility_risk_score`

### Interpretation

High score means:

- visible sales may be less durable than they appear
- foot traffic or supporting facilities may not justify current commercial expectations

## Objection engine

The product should not only compute scores.
It should translate them into objections.

### Example objection templates

- "Price burden is high while transaction activity is weakening."
- "Merchant concentration suggests the area is crowded into a narrow set of categories."
- "Demand indicators are unstable relative to reported sales."
- "A lower-risk peer district offers similar commercial characteristics."

## Comparison logic

The product needs alternatives, not just warnings.

### Candidate replacement rule for phase 1

Find districts with:

- lower overall acquisition risk
- similar food-store share or merchant profile
- non-inferior transaction liquidity

## Known limitations

- Trade-area data and admin-dong data are not yet directly joinable one-to-one
- District-level integration is therefore the phase 1 default
- Demand signals are not yet merged into the final risk file
- Scores are heuristic and need case-study calibration

## Phase 1 output files

- `data/processed/seoul_transaction_risk_scores.csv`
- `data/external/processed/seoul_store_competition_by_district.csv`
- `data/external/processed/seoul_store_competition_by_admin_dong.csv`
- `data/external/processed/seoul_trade_area_activity_2024.csv`

## Phase 1 next implementation steps

1. Build `demand_fragility_risk_score`
2. Merge district-level transaction and competition scores
3. Add replacement-candidate logic
4. Generate memo text from score thresholds
5. Expose all of the above in an interactive UI
