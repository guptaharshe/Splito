# Splito - Project Scope

## Project Overview

Splito is a shared-expenses app for a flatshare with messy CSV data, changing membership, multiple split rules, and a need for reviewable imports. The assignment required a working app, a documented decision trail, and an import report that explains every anomaly rather than hiding it. The finalized import report now records 17 anomaly records, 26 clean rows imported, and 5 rejected rows.

## What the App Covers

### 1. Login and Role-Based Access

- Supabase Auth login
- Admin and member dashboard variants
- Protected routes for app screens

### 2. Group and Member Management

- Create and list groups
- Add members to groups
- Track `joined_at` and `left_at` dates

### 3. Expenses and Balances

- Create expenses for a group
- Support split types that appear in the backend: `equal`, `unequal`, `percentage`, `share`
- Compute group balances and pairwise suggested settlements
- Store money as integer paise values

### 4. CSV Import Workflow

- Upload the provided CSV
- Detect anomalies before finalizing an import
- Let the reviewer approve or reject blocking rows
- Produce an import report with the detected anomalies and actions taken

## CSV Anomaly Log

The current code path yields 17 anomaly records across the provided file. The policy below is the one implemented in the repo today, and the finalized report is the canonical source for this documentation pass.

| CSV Row | Anomaly | Handling Policy |
| --- | --- | --- |
| 5 | Timeline violation: Dev appears before `joined_at` | Block until the row is corrected or the user is excluded |
| 6 | Timeline violation: duplicate Dev dinner before `joined_at` | Block until corrected |
| 7 | Comma in amount (`1,200`) | Auto-strip the comma and continue |
| 9 | Name case (`priya` vs `Priya`) | Auto-normalize to the canonical member name |
| 11 | Unknown payer (`Priya S`) | Block and require manual mapping |
| 13 | Missing payer | Block and require manual assignment or rejection |
| 15 | Percentage total is 110% | Block until the split is corrected |
| 20 | USD currency | Convert to INR using the fixed policy in code (`84.00` per USD) |
| 21 | USD currency | Convert to INR using the fixed policy in code (`84.00` per USD) |
| 23 | USD currency | Convert to INR using the fixed policy in code (`84.00` per USD) |
| 26 | Negative amount | Treat as a refund-style entry and keep the sign policy explicit |
| 26 | USD currency | Convert to INR using the fixed policy in code (`84.00` per USD) |
| 27 | Name case (`rohan` vs `Rohan`) | Auto-normalize to the canonical member name |
| 28 | Missing currency | Default to INR |
| 31 | Zero amount | Skip the row |
| 32 | Percentage total is 110% | Block until the split is corrected |
| 42 | Conflicting split_type (`equal` with split details) | Ignore the extra split details |

## Known Manual-Review Items

These issues are present in the CSV and should be called out in the live review, even though the current parser does not auto-flag every one of them:

- Duplicate/near-duplicate Marina Bites dinner entries on 2026-02-08
- Duplicate/contradictory Thalassa dinner entries on 2026-03-11
- `Rohan paid Aisha back` on 2026-02-25, which is a settlement-like entry rather than a normal expense
- The April/May cleaning-service date ambiguity in `04-05-2026`

## Finalized Import Outcome

The finalized report resolved the 17 anomalies as follows:

| Row | Final Status | Notes |
| --- | --- | --- |
| 5 | Approved | Kept as the selected Marina Bites dinner row |
| 6 | Rejected | Duplicate Marina Bites dinner row |
| 7 | Auto-fixed | Comma removed from amount |
| 9 | Auto-fixed | Payer name normalized to `Priya` |
| 11 | Rejected | Unknown payer `Priya S` could not be safely mapped |
| 13 | Rejected | Missing payer |
| 15 | Rejected | Invalid percentage total |
| 20 | Auto-fixed | USD converted to INR |
| 21 | Auto-fixed | USD converted to INR |
| 23 | Auto-fixed | USD converted to INR |
| 26 | Auto-fixed | Negative USD refund handled explicitly |
| 27 | Auto-fixed | Payer name normalized to `Rohan` |
| 28 | Auto-fixed | Missing currency defaulted to INR |
| 31 | Auto-fixed | Zero-amount row skipped |
| 32 | Rejected | Invalid percentage total |
| 42 | Auto-fixed | Extra split details ignored |

## Database Schema

The schema is implemented in `backend/src/db/schema.sql` and contains these tables:

| Table | Purpose |
| --- | --- |
| `users` | Public user profile linked to `auth.users` |
| `groups` | Expense groups |
| `group_members` | Membership history with `joined_at` and `left_at` |
| `expenses` | Expense records, split type, payer, and import metadata |
| `expense_splits` | Per-user responsibility for each expense |
| `settlements` | Direct payments between users |
| `import_batches` | CSV upload batch tracking |
| `import_anomalies` | Detected issues, review status, and resolution metadata |

## Design Boundary

Not included in scope:

- Payment gateway integration
- Real-time chat or notifications
- Automatic email sending
- A fully generic group creation and invite system beyond the screens already in the app
