# Splito 💸

Splito is an end-to-end, full-stack expense sharing application designed to handle the messy reality of group finances. It takes complex, unstandardized transactional data (like a heavily customized Excel spreadsheet of flatmate expenses over several months) and transforms it into a mathematically rigorous, beautifully designed web application where every member can instantly see their exact debts and credits.

![Splito Dashboard](https://github.com/guptaharshe/Splito)

## Features & Capabilities

- **Intelligent Data Parsing:** Automatically ingests CSV data, seamlessly handling missing dates, messy notes, and varying currency formats.
- **Dynamic Split Mathematics:** Accurately processes 4 distinct split algorithms on a per-expense basis:
  - `Equal`: Splits the expense mathematically equally across all active group members.
  - `Share`: Splits based on proportional units (e.g., Member A pays 2 shares, Member B pays 1 share).
  - `Percentage`: Divides the cost based on explicit percentages.
  - `Unequal`: Takes hardcoded integer amounts assigned to specific members.
- **Temporal Member Tracking:** The engine strictly enforces move-in and move-out dates (`joined_at`, `left_at`). If an expense occurs before a member moves in, they are entirely excluded from the split. If a member leaves, their historical debts correctly remain on their ledger.
- **Optimal Path Settlements:** Analyzes the total web of group debt and generates the mathematically shortest path to zero (e.g., eliminating the need for Member A to pay Member B if Member B owes Member C, telling A to just pay C directly).
- **Floating-Point Immunity:** Operates 100% on lowest-denomination integer math (`paise`) under the hood, ensuring fractions of a cent are accurately rounded and preventing the catastrophic ledger drift common in JavaScript finance apps.

---

## The Mathematics: Justifying the Ledger

The core objective of Splito was to ingest raw, unstandardized Excel data and mathematically guarantee an exact balance. Our engine perfectly mirrors the intent of the original spreadsheet through rigorous integer distribution.

### How the Math Works (vs Excel)
1. **Total Paid:** The system sums up exactly how much real-world money a user physically paid for group expenses.
2. **Total Owed (Responsibility):** The system parses the split rule for every single transaction (e.g., "Equal" among 6 people, or "Percentage" 30/70) and calculates that user's exact share of the burden.
3. **The Remainder Rule:** If an expense of ₹10.00 is split equally among 3 people, it cannot be ₹3.33 each (which leaves ₹0.01 unaccounted for). The Splito algorithm assigns ₹3.34 to Person A, ₹3.33 to Person B, and ₹3.33 to Person C. **No money is ever lost or created.**
4. **Net Balance Formula:** `[Total Amount Paid] - [Total Personal Responsibility] = Net Balance`
   - **Positive Balance:** The user paid MORE than their fair share. They are owed money.
   - **Negative Balance:** The user paid LESS than their fair share. They owe money.

### Example Justification (Aisha)
In the raw Excel sheet, Aisha was the primary payer for massive group expenses like Rent and Security Deposits.
- Aisha's Total Physical Payments for the group: **₹1,22,993.90**
- Aisha's Personal Share (her actual responsibility of those bills): **₹23,660.00**
- **Aisha's Splito Dashboard Net Balance:** **+₹99,333.90 (Owed)** 
The math balances perfectly. Every single paise is accounted for.

---

## 🔑 Demo Accounts & Credentials

The application features a fully secure login system. You can explore the dashboard from different perspectives using the following pre-configured accounts.

**Password for ALL accounts:** `password123`

| Role / Name | Email | Description |
| :--- | :--- | :--- |
| **System Admin** | `admin@splito.com` | God-mode. Can upload CSVs, run batch ingestion, and view total group balances. |
| **Aisha** | `aisha@example.com` | Primary payer. Has a massive positive balance (owed money). |
| **Priya** | `priya@example.com` | Active flatmate. Has a large negative balance (owes money). |
| **Rohan** | `rohan@example.com` | Active flatmate. Has a negative balance (owes money). |
| **Dev** | `dev@example.com` | Flatmate who left early (Mar 12). |
| **Meera** | `meera@example.com` | Flatmate who left early (Mar 31). Dashboard correctly preserves her historical debt! |
| **Sam** | `sam@example.com` | Flatmate who joined late (Apr 8). Dashboard correctly ignores expenses before this date. |

*(Note: Log in as the Admin to see the macro-view of the entire group. Log in as a User to see their highly personalized dashboard.)*

---

## 🚀 Future Roadmap & Possible Features

While the core math engine and viewing dashboards are feature-complete, Splito's architecture is highly extensible. The following features are primed for future development:

1. **Settle Up (Ledger Integration):** 
   - A dedicated feature allowing users to record physical payments made to each other (e.g., "I sent Aisha ₹10,000 via UPI").
   - These records would dynamically update the Net Balances and automatically recalculate the optimal "Suggested Settlements" path in real time.
2. **Dynamic Group Management:**
   - Full UI workflows for creating brand new groups from scratch.
   - The ability to invite new members via email or joining links, dynamically updating the database relations.
3. **Granular Expense Editor:**
   - A highly detailed view for individual expenses, allowing users to modify a split rule retroactively (e.g., changing an "Equal" split to an "Unequal" split) directly from the UI without requiring an admin CSV re-import.
4. **Export & Reporting:**
   - One-click PDF or CSV exports of a user's monthly expense history and tax-deductible items.

---

## Technology Stack

- **Frontend:** React 18, React Router DOM v6, Tailwind CSS (Custom Design System).
- **Backend:** Node.js, Express.js.
- **Database:** Supabase (PostgreSQL), `@supabase/supabase-js`.
- **Authentication:** Supabase Auth.
- **Data Pipeline:** `csv-parse`, custom mathematical settlement algorithms.

## Documentation
For deeper dives into how Splito was built, please review the accompanying project documentation files:
- `SCOPE.md`: The overarching project goals and deliverables.
- `DECISIONS.md`: The technical architecture and algorithmic choices made during development.
- `AI_USAGE.md`: A transparent breakdown of how AI collaborated on code, design, and math.
