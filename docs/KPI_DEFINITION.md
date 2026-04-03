# KPI Definition

## Product KPIs

### 1. Memo readability

Definition:

- A user can identify the top three objections for a district within 30 seconds

### 2. Comparison usefulness

Definition:

- Every high-risk district should surface at least one lower-risk replacement candidate

### 3. Explainability coverage

Definition:

- Every risk score shown in the UI must be traceable to visible source metrics

## Current Snapshot

As of `2026-04-03`:

- district memos available: `25`
- replacement-candidate coverage for high-risk districts: `100%`
- manual case studies completed: `3`
- current highest acquisition risk district: `서초구`
- current lowest acquisition risk district: `구로구`
- low-sample districts in the latest transaction month: `8`

## Data KPIs

### 1. Transaction data freshness

- months collected from the MOLIT API
- last available month in processed files

Current value:

- months collected: `12`
- latest available month: `202603`

### 2. District coverage

- number of Seoul districts covered in transaction risk
- number of districts covered in competition risk

Current value:

- transaction risk district coverage: `25`
- competition risk district coverage: `25`
- current transaction window: `2025-04` to `2026-03`
- current demand-data window: `2024`

### 3. Admin-dong coverage

- number of admin dongs in the saturation output

Current value:

- admin-dong coverage: `428`

## Analytics KPIs

### 1. Score stability

- month-to-month change distribution for transaction risk

Current value:

- mean absolute month-to-month change in median `sqm` transaction price: `256.2` (10k KRW)

### 2. Candidate quality

- replacement candidates should have lower overall acquisition risk than the source district

Current value:

- candidate quality pass rate: `100.0%`

### 3. Case-study plausibility

- risk objections should match domain intuition for 3 to 5 manual case studies

Current value:

- completed manual case studies: `3`
- selected districts: `서초구`, `강남구`, `중구`
