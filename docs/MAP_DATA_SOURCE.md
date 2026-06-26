# Map Data Source

## Dataset

Seoul district boundary GeoJSON

## File Used

`app/site/assets/seoul-districts.geojson`

## Source Repository

`southkorea/seoul-maps`

## Source File

`kostat/2013/json/seoul_municipalities_geo_simple.json`

## Geometry Scope

- Seoul 25 autonomous districts
- GeoJSON FeatureCollection
- Geometry type: Polygon
- Feature count: 25

## Properties Used

The local GeoJSON includes the following fields:

- `code`: district code
- `name`: Korean district name
- `name_eng`: English district name
- `base_year`: geometry base year

## License

Apache License 2.0, as stated in the source repository.

## Processing

- Downloaded the simplified Seoul municipality GeoJSON.
- Renamed the local project copy to `seoul-districts.geojson`.
- Stored the file under `app/site/assets/`.
- Used for district-level portfolio visualization.
- Joined with Redveil public-safe risk payload by `code` first and `name` as fallback.

## Notes

This map geometry is used only for district-level portfolio visualization and map-first risk exploration.

It is not used for legal boundary determination, official GIS analysis, investment recommendation, or real-estate advisory claims.
