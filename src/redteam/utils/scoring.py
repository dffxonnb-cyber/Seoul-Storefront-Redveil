from __future__ import annotations

import pandas as pd


def percentile_rank(series: pd.Series, ascending: bool = True) -> pd.Series:
    valid = series.dropna()
    if valid.empty:
        return pd.Series(50.0, index=series.index)

    ranks = valid.rank(method="average", pct=True, ascending=ascending) * 100
    out = pd.Series(50.0, index=series.index, dtype=float)
    out.loc[valid.index] = ranks
    return out


def clip_score(series: pd.Series) -> pd.Series:
    return series.clip(lower=0, upper=100).round(1)
