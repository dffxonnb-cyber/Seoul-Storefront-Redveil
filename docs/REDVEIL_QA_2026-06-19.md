# Redveil QA Note · 2026-06-19

## Status

Redveil v1 remains the stable portfolio-ready public website.

Redveil v2 remains an isolated dashboard experiment under:

```text
app/site/v2/
```

This QA note does not promote v2 to the default homepage.

## v1 Stability Check

v1 is the current public portfolio surface.

The stable v1 flow includes:

```text
home
review
assessment
compare
district report
```

v1 should remain available as the primary public review flow unless a future decision explicitly changes it.

## v2 Experiment Boundary

v2 is a dashboard experiment for map-first risk intelligence.

It may test:

```text
map-first command center
district risk surface
candidate comparison
signal panels
workflow links back to v1
```

v2 should not overwrite, rename, or redesign v1 files unless a future task explicitly requires a compatibility change.

## Decision Gate

v2 should only move forward after a separate decision.

Possible outcomes:

```text
keep v2 experimental
promote v2 as the default homepage
graduate selected v2 components into v1
archive v2 if it does not improve reviewer clarity
```

Current QA position:

```text
keep v1 stable
keep v2 experimental
do not promote v2 yet
```

## Product Boundary

Redveil is not an investment recommendation product.

It does not claim:

```text
buy recommendation
sell recommendation
actual return validation
legal / financial / real estate advisory
```

Redveil should be described as:

```text
a storefront risk review tool
a pause-first screening prototype
a tool for reviewing risk signals before selection
```

## Reviewer Interpretation

Redveil should be read as proof that analysis can be translated into a reviewable web decision surface.

It proves:

```text
risk signal design
pause reason framing
alternative candidate comparison
public-safe payload delivery
static web implementation
```

It does not prove:

```text
investment performance
causal impact on store success
real transaction outcome validation
commercial advisory readiness
```

## QA Result

Current recommendation:

```text
v1 stable
v2 experimental
investment advisory boundary maintained
pause-first review language maintained
```