# Splito - Technical & Design Decisions

This document outlines the major architectural, algorithmic, and design decisions made during the construction of Splito, along with their justifications.

## 1. Algorithmic Processing

### The Integer Math Standard (`paise`)
**Decision:** All monetary values in the database and calculation engine are stored as integers representing the lowest denomination of the currency (e.g., `paise` for INR, `cents` for USD).
**Justification:** Floating-point arithmetic in JavaScript is notoriously unreliable (e.g., `0.1 + 0.2 = 0.30000000000000004`). By doing all math in integers and only converting to decimals for UI display, we entirely eliminated the risk of fractions leaking or balances getting corrupted by rounding errors over hundreds of complex splits.

### Fractional Remainder Distribution
**Decision:** When dividing an amount unevenly (e.g., ₹10.00 equally among 3 people), the engine distributes the integer remainder (1 paise) across members one by one.
**Justification:** The ledger must always perfectly balance to zero. If 3 people split ₹10.00, mathematically they owe 3.333... each. Our engine charges Person A ₹3.34, Person B ₹3.33, and Person C ₹3.33. This ensures the sum of debts exactly equals the sum of the expense.

### The Pairwise Settlement Algorithm
**Decision:** The system implements an optimal pathing algorithm to resolve group debts. It aggregates all absolute net balances (everyone's total owed vs total owes), separates them into a `debtors` list and a `creditors` list, and matches the largest debtor with the largest creditor iteratively.
**Justification:** This drastically minimizes the number of actual real-world bank transfers the group has to make. If A owes B, and B owes C, the engine simplifies this so A pays C directly, eliminating B as a middleman. 

## 2. System Architecture

### Separation of Concerns (Backend vs Frontend)
**Decision:** The application is split into a discrete Express.js backend and a React SPA frontend, rather than a monolithic full-stack framework like Next.js.
**Justification:** The core of this application revolves around a highly complex, CPU-intensive data ingestion script that processes raw CSVs and handles database transactions. Keeping the API discrete allows for robust testing of the math engine completely independent of the UI state, and ensures UI re-renders never impact database insertions.

### Supabase Architecture
**Decision:** We used Supabase for PostgreSQL, but heavily relied on the `@supabase/supabase-js` Service Key within the Node.js backend.
**Justification:** Because the core feature involves an admin executing global data imports (wiping existing group ledgers and replacing them based on a master CSV), relying on client-side Row Level Security (RLS) policies would be incredibly messy and slow. The backend acts as a trusted orchestrator to handle the massive bulk transactions securely.

## 3. Interface & UX Decisions

### Two-Tier Dashboard System
**Decision:** The dashboard heavily pivots based on the user's role (Admin vs Normal User).
**Justification:** An admin needs to see macro-level data (CSV imports, group-wide metrics), whereas a flatmate only cares about "How much do I owe?" and "Who owes me?". Creating dedicated view modes removes clutter and significantly improves user experience.

### Real-time "Skeleton" Loading states
**Decision:** We opted for `animate-pulse` skeletons over standard loading spinners.
**Justification:** Skeletons preserve the structural layout of the dashboard while data is being fetched. This prevents the jarring "layout shift" that occurs when a spinner suddenly disappears and a massive table renders. It feels vastly more premium.

### CSS Grid vs Flexbox
**Decision:** The layout relies heavily on CSS Grid for the macro structure (columns, cards) and Flexbox for micro-alignments (items within cards).
**Justification:** CSS Grid natively handles equal-height columns, which is essential for our "Members vs Balances" side-by-side view. By utilizing grid properly, we avoided hacky JavaScript height calculations and achieved a responsive layout that gracefully degrades to a single column on mobile.
