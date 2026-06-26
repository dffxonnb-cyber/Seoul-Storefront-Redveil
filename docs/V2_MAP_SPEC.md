# Redveil V2 Map Spec

## Map Type
Static interactive Seoul district boundary map

## Required Geometry
- Seoul 25 district boundaries
- District code
- District Korean name

## Join Key
1. district code
2. district name fallback

## Interaction
- hover: show district name and risk score
- click: select district
- selected: outline/glow
- CTA: review.html / compare.html

## Rendering
- SVG path or inline GeoJSON rendered as SVG
- No external map API in V2 MVP