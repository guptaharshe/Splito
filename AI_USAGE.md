# Splito - AI Usage

This document records how AI was used during development and, just as importantly, where it was wrong or incomplete.

## Tools and Responsibilities

- Chat-style AI was used to draft architecture, parser logic, UI scaffolding, and documentation.
- The human developer remained responsible for reviewing the code, checking the CSV, and correcting the misleading parts.
- The assignment specifically required us to document the AI help, not to hide it.

## Key Prompts Used

| Area | Example Prompt |
| --- | --- |
| CSV import | "Design a parser that can ingest a messy flatmate expense CSV and flag anomalies without silently guessing." |
| Split math | "Implement equal, percentage, share, and unequal splits using integer paise math." |
| Balance logic | "Compute net balances and suggested settlements from expenses and settlements." |
| Docs | "Rewrite the project docs so they match the real implementation and the assignment requirements." |

## Where AI Was Wrong

| Mistake | How We Caught It | What Changed |
| --- | --- | --- |
| AI implied all split types were fully exposed in the add-expense UI | `AddExpense.js` only enables the equal split form, while the other options are disabled | The docs now say the backend supports the split types, but the UI still exposes equal split first |
| AI overstated timeline-aware balance handling | `balanceEngine.js` currently sums all expenses and settlements without filtering by `joined_at` / `left_at` | The scope and decisions docs now call this out as a deliberate tradeoff and a live-session discussion point |
| AI described the import finalize flow as fully transactional | `fullImportService.js` is a best-effort ingestion path, not a single DB transaction | The docs were corrected to describe the review-first batch workflow honestly |
| AI suggested the README was already complete for deployment | The repo docs did not mention the DigitalOcean host the assignment expects | README now includes the production URL `http://139.59.42.11` and the deployment model |
| AI initially suspected the live 58-anomaly screenshot was the correct fresh import result | The finalized import report now shows 17 anomaly records, 26 clean rows imported, and 5 rejected rows | The docs were updated to match the finalized report and its row-by-row decisions |

## Final Import Summary

The finalized import now resolves the CSV with the following pattern:

- Approved: row 5
- Rejected: rows 6, 11, 13, 15, 32
- Auto-fixed: rows 7, 9, 20, 21, 23, 26, 27, 28, 31, 42

This summary is the one to use in any live walkthrough of the assignment.

## Concrete AI Contributions That Helped

- Drafted the initial split-calculation approach using integer math.
- Suggested a separate anomaly review table instead of hiding bad rows.
- Helped shape the admin/member split in the frontend navigation.
- Helped turn the assignment requirements into structured documentation files.

## Conclusion

AI was useful for acceleration, but every important claim was checked against the codebase. When the code and the AI answer disagreed, the code won.
