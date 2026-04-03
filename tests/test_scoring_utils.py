from __future__ import annotations

import sys
import unittest
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from redveil.utils.scoring import clip_score, percentile_rank


class ScoringUtilsTest(unittest.TestCase):
    def test_clip_score_bounds_values(self) -> None:
        series = pd.Series([-5, 20.26, 105])
        result = clip_score(series)
        self.assertEqual(result.tolist(), [0.0, 20.3, 100.0])

    def test_percentile_rank_returns_expected_order(self) -> None:
        series = pd.Series([10, 20, 30])
        result = percentile_rank(series, ascending=True)
        self.assertTrue(result.iloc[2] > result.iloc[1] > result.iloc[0])


if __name__ == "__main__":
    unittest.main()
