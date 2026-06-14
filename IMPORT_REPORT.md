# Import Report - Expenses Export.csv

This report mirrors the finalized import for the provided CSV export using the current code in the repository. The parser processes 42 total rows, imports 26 clean rows, records 17 anomaly records, and rejects 5 rows after review.

## Summary

| Metric | Value |
| --- | --- |
| Total rows parsed | 42 |
| Clean rows imported | 26 |
| Anomaly records generated | 17 |
| Rows rejected | 5 |

## Resolution Log

The finalized report is the source of truth for this repository. The table below lists the detected issues and the final disposition chosen in the review screen.

| Row | Type | Severity | Detected Issue | Action Taken |
| --- | --- | --- | --- | --- |
| 5 | Timeline violation | BLOCKING | Dev appears in a February expense before his `joined_at` date | Approved |
| 6 | Timeline violation | BLOCKING | Duplicate Dev dinner row before `joined_at` | Rejected |
| 7 | Comma in amount | INFO | Amount written as `1,200` | Strip the comma and continue |
| 9 | Name case | INFO | `priya` should be `Priya` | Auto-normalize to the canonical member name |
| 11 | Unknown payer | BLOCKING | `Priya S` is not a known user | Rejected |
| 13 | Missing payer | BLOCKING | Empty `paid_by` field | Rejected |
| 15 | Percentages do not sum to 100% | BLOCKING | Split details total 110% | Rejected |
| 20 | USD currency | INFO | Dollar amount needs conversion | Convert using the current fixed policy (`84.00` INR per USD) |
| 21 | USD currency | INFO | Dollar amount needs conversion | Convert using the current fixed policy (`84.00` INR per USD) |
| 23 | USD currency | INFO | Dollar amount needs conversion | Convert using the current fixed policy (`84.00` INR per USD) |
| 26 | Negative amount | INFO | Refund-style entry with a negative amount | Preserve the negative sign policy and keep it explicit in the report |
| 26 | USD currency | INFO | Dollar refund needs conversion | Convert using the current fixed policy (`84.00` INR per USD) |
| 27 | Name case | INFO | `rohan` should be `Rohan` | Auto-normalize to the canonical member name |
| 28 | Missing currency | INFO | Currency field is blank | Default to INR |
| 31 | Zero amount | INFO | Amount is zero | Skip the row |
| 32 | Percentages do not sum to 100% | BLOCKING | Split details total 110% | Rejected |
| 42 | Conflicting split_type | INFO | Equal split has extra split details | Ignore the extra split details |

## Notes

- Blocking rows are surfaced in the review screen and must be approved or rejected before finalization.
- Info rows are auto-corrected according to the current policy in `backend/src/services/importService.js`.
- The current parser does not auto-flag every cross-row issue in the CSV; the live review should also inspect duplicate dinner entries, the settlement-like `Rohan paid Aisha back` row, and the ambiguous `04-05-2026` date.
- The report should be read together with `SCOPE.md`, which lists the same anomalies and the underlying schema.

## Finalized Decisions

| Row | Final Status |
| --- | --- |
| 5 | Approved |
| 6 | Rejected |
| 11 | Rejected |
| 13 | Rejected |
| 15 | Rejected |
| 32 | Rejected |

All other anomalies in the finalized report were auto-fixed.
