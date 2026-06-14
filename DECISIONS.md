# Splito - Technical and Design Decisions

This file records the major choices made during implementation, the alternatives considered, and why the current approach was selected.

## 1. Currency Math

| Decision | Options Considered | Chosen Approach | Why |
| --- | --- | --- | --- |
| Store money as integer paise | Floats, decimals, integers | Integer paise | Avoids floating-point drift and keeps split math auditable |
| Distribute rounding remainders deterministically | Drop remainder, round everyone, assign to payer/first member | Assign remainder one paise at a time | Guarantees the split sums exactly to the expense total |

## 2. Import Strategy

| Decision | Options Considered | Chosen Approach | Why |
| --- | --- | --- | --- |
| Review anomalies before final import | Fail fast, auto-fix silently, review queue | Review queue with approve/reject | The assignment explicitly asks for deliberate handling of imperfect data |
| Flag suspicious rows instead of guessing | Auto-ignore, auto-merge, block all imports | Mixed severity model | Some issues are safe to auto-fix, while others need human approval |
| Track the import in batches | Immediate inserts only, no batch state, batch table | `import_batches` + `import_anomalies` | Makes the process traceable and easy to report |

## 3. Balance Engine

| Decision | Options Considered | Chosen Approach | Why |
| --- | --- | --- | --- |
| Compute pairwise settlements from net balances | Keep raw debt graph only, use greedy pairwise matching | Greedy netting of debtor/creditor balances | Produces a shorter list of suggested transfers and is easy to explain live |
| Keep settlements in the same model as expenses | Separate ledger, external payment system | `settlements` table in the same schema | Direct payments need to affect the same balance computation path |

## 4. Frontend Structure

| Decision | Options Considered | Chosen Approach | Why |
| --- | --- | --- | --- |
| Separate admin and member views | One generic dashboard, separate apps | Role-based dashboard in one SPA | Keeps the UX simple while still exposing admin-only import tools |
| Use skeleton loaders | Spinner only, blank screen | `animate-pulse` placeholders | Preserves layout during fetches and feels more polished |
| Use a React SPA instead of a monolith | Next.js monolith, server-rendered app, SPA | React SPA plus Express API | Keeps the ingestion pipeline isolated from the UI and easier to reason about |

## 5. Known Tradeoffs

| Tradeoff | Current Choice | Reason |
| --- | --- | --- |
| Some split types are backend-ready but not fully exposed in the add-expense UI | Equal split UI first | The CSV import and backend logic were higher priority for the assignment |
| Import finalization is review-driven rather than fully transactional | Best-effort finalize flow | The review workflow was the core deliverable; hardening can be added later |
| Fixed FX policy for USD rows | `84.00` INR per USD in code | The assignment asked for a deliberate policy, and the file documentation is the source of truth |

## 6. Final Import Decisions

| Row | Final Decision | Why |
| --- | --- | --- |
| 5 | Approved | It is the selected dinner record and has contextual notes |
| 6 | Rejected | Duplicate of row 5 with no added value |
| 11 | Rejected | The payer name is unknown and cannot be safely inferred |
| 13 | Rejected | A missing payer cannot be reconstructed with confidence |
| 15 | Rejected | The percentage split sums to 110%, which would corrupt the ledger |
| 32 | Rejected | Same percentage error as row 15, so it is also unsafe to import |

## 7. Finalized Auto-Fixes

| Row | Finalized Action | Why |
| --- | --- | --- |
| 7 | Auto-fixed | Amount commas are safe to strip |
| 9 | Auto-fixed | Case normalization is deterministic and low-risk |
| 20, 21, 23, 26 | Auto-fixed | USD rows are converted using the documented FX policy |
| 26 | Auto-fixed | The negative amount is treated as a refund-style entry |
| 27 | Auto-fixed | Case normalization is deterministic and low-risk |
| 28 | Auto-fixed | Missing currency defaults to INR |
| 31 | Auto-fixed | Zero-amount rows are harmless to skip |
| 42 | Auto-fixed | Extra split details on an equal split can be ignored safely |
