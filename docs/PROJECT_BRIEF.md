# Redveil

## One-line concept

A Seoul-focused acquisition risk detection service for small commercial-property investors.

## Product stance

Most real-estate tools try to recommend where to buy.

This product does the opposite:

- it assumes the investor already wants to buy
- it looks for disconfirming evidence first
- it produces a structured "do not buy yet" memo before any positive recommendation

## Core user

- Individual investor buying a small retail or mixed-use commercial unit in Seoul
- Secondary user: a broker, analyst, or advisor preparing a pre-acquisition risk memo

## Core question

"What are the strongest data-backed reasons not to buy this area right now?"

## Product promise

Before the investor commits to a district or area, the product should surface:

- price distortion
- transaction illiquidity
- oversaturated merchant mix
- weak demand signals
- better alternative areas

## Phase 1 analysis unit

- District (`gu`) for integrated risk ranking
- Admin dong for merchant saturation detail
- Trade area for sales and foot-traffic context

## Phase 1 outputs

- overall acquisition risk score
- price burden risk
- liquidity risk
- competition risk
- risk memo with top objections
- replacement candidates with lower risk

## What makes it different

- It is not a simple dashboard.
- It is not a hot-area recommender.
- It behaves like an analyst trying to break an investment thesis.

## Portfolio story

This project should read as:

1. Product strategy: define a contrarian decision-support product
2. Data engineering: build pipelines across public and downloaded datasets
3. Analytics: turn raw signals into explainable risk scores
4. Application engineering: deliver the risk memo and comparisons in a usable interface
