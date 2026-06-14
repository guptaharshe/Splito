# UI DESIGN PLAN — Splito
> Complete UI blueprint. Every screen, every component, every design decision documented before a pixel is placed.

---

## 1. Design Philosophy

Splito is a **tool**, not a product showcase. The UI should feel like something a senior engineer built — not a design student's portfolio piece.

### Core Principles

**Clean over clever.** No animations that don't serve a function. No gradients. No glow effects. No frosted glass. No floating blobs. Nothing that would look out of place in a Stripe dashboard or Linear app.

**Black and off-white.** Dark background, light text, one accent color. High contrast. Easy to read in a bright room during a live evaluation session.

**Flat, not rounded.** Minimal border radius. Buttons and cards have sharp or very slightly rounded corners (max 4px). No pill-shaped buttons unless it's a tag/badge.

**Dense but breathable.** Financial data is dense. Give it room to breathe with consistent spacing, but don't waste space with huge padding and hero sections.

**No hover animations.** Hover states change color/border only. No scale transforms, no shadow blooms, no slide-ins on hover.

**Production style.** If it looks like a tutorial project, it's wrong. If it looks like something you'd pay for, it's right.

---

## 2. Design Tokens

These are the only values used throughout the app. No one-off colors or sizes.

### Color Palette

```css
/* Backgrounds */
--bg-base:        #0a0a0a;   /* page background — near black */
--bg-surface:     #111111;   /* cards, panels */
--bg-elevated:    #1a1a1a;   /* modals, dropdowns, drawers */
--bg-input:       #141414;   /* input fields */

/* Borders */
--border-subtle:  #222222;   /* card borders, dividers */
--border-default: #2e2e2e;   /* input borders */
--border-focus:   #555555;   /* focused input */

/* Text */
--text-primary:   #f0f0f0;   /* main text — off-white, not pure white */
--text-secondary: #888888;   /* labels, metadata, subtitles */
--text-tertiary:  #555555;   /* placeholder text, disabled */
--text-inverse:   #0a0a0a;   /* text on light/accent backgrounds */

/* Accent — one color only */
--accent:         #4f7cff;   /* primary actions, links, active states */
--accent-hover:   #3d6aee;   /* accent on hover */
--accent-subtle:  #4f7cff1a; /* accent background tint (10% opacity) */

/* Semantic */
--success:        #22c55e;   /* settled, imported, approved */
--success-subtle: #22c55e1a;
--warning:        #f59e0b;   /* pending, needs review */
--warning-subtle: #f59e0b1a;
--error:          #ef4444;   /* owe, rejected, failed */
--error-subtle:   #ef4444 1a;
--info:           #888888;   /* neutral anomaly info */
```

### Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs:   11px;   /* badges, table footnotes */
--text-sm:   13px;   /* table cells, secondary labels */
--text-base: 14px;   /* default body text */
--text-md:   16px;   /* section headings, card titles */
--text-lg:   20px;   /* page headings */
--text-xl:   28px;   /* balance numbers */
--text-2xl:  40px;   /* hero balance on dashboard */

/* Weight */
--weight-normal:  400;
--weight-medium:  500;
--weight-semibold: 600;
```

### Spacing

```css
/* All spacing is multiples of 4px */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
```

### Border Radius

```css
--radius-sm:   2px;   /* tags, badges */
--radius-base: 4px;   /* buttons, inputs, cards */
--radius-md:   6px;   /* modals, drawers */
```

### Shadows

```css
/* No colored shadows. No glow. Only subtle elevation. */
--shadow-sm:  0 1px 2px rgba(0,0,0,0.4);
--shadow-md:  0 4px 12px rgba(0,0,0,0.5);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.6);
```

---

## 3. Component Library

### Button

```
Variants: primary | secondary | ghost | danger
Sizes: sm | md (default) | lg

Primary:   bg-accent, text-inverse, border: none
Secondary: bg-transparent, text-primary, border: border-default
Ghost:     bg-transparent, text-secondary, border: none
Danger:    bg-error, text-white, border: none

Hover: darken bg by ~10%, no transform, no shadow
Active: darken further
Disabled: opacity 40%, cursor not-allowed

Border radius: radius-base (4px)
Padding: sm=6px 12px | md=8px 16px | lg=10px 20px
Font: text-sm, weight-medium
```

### Input

```
bg-input, border: 1px solid border-default
On focus: border-color → border-focus, no glow, no box-shadow
Border radius: radius-base
Padding: 8px 12px
Font: text-base
Placeholder: text-tertiary

Error state: border-color → error
```

### Card

```
bg-surface, border: 1px solid border-subtle
Border radius: radius-base
Padding: space-6 (24px)
No shadow by default
```

### Table

```
Header row: bg-elevated, text-secondary, text-xs uppercase, letter-spacing 0.05em
Body rows: bg-surface, border-bottom: 1px solid border-subtle
Hover row: bg-elevated (no animation)
Cell padding: space-3 space-4 (12px 16px)
Font: text-sm
```

### Badge / Tag

```
Inline rounded tags for statuses
Border radius: radius-sm (2px)
Font: text-xs, weight-medium, uppercase

success:  bg-success-subtle, text-success
warning:  bg-warning-subtle, text-warning
error:    bg-error-subtle, text-error
info:     bg-border-subtle, text-secondary
```

### Drawer (Slide-in Panel)

```
Slides in from the right
Width: 480px (desktop), full width (mobile)
bg-elevated
Border-left: 1px solid border-default
No animation blur/fade — just position transition (200ms ease)
Overlay: rgba(0,0,0,0.6) backdrop
```

### Navbar

```
Fixed top
Height: 56px
bg-base, border-bottom: 1px solid border-subtle
Left: Splito logo (text, not image — "Splito" in weight-semibold, accent color)
Right: user name + role badge + logout button
```

---

## 4. Page-by-Page Layout

---

### Page 1 — Login `/login`

```
Layout: centered card on full-height bg-base page

Card (400px wide):
  ┌─────────────────────────────┐
  │  Splito                     │  ← text logo, accent color, text-lg
  │  Sign in to your account    │  ← text-secondary, text-sm
  │                             │
  │  Email                      │  ← label, text-sm
  │  [─────────────────────]    │  ← input
  │                             │
  │  Password                   │
  │  [─────────────────────]    │
  │                             │
  │  [    Sign In    ]          │  ← primary button, full width
  │                             │
  │  Having trouble? Contact    │  ← text-tertiary, text-xs
  │  your group admin.          │
  └─────────────────────────────┘

No signup link. No "forgot password". No social auth buttons.
Error state: red border on input + error message below input.
```

---

### Page 2 — Dashboard `/dashboard`

**Member view:**

```
Navbar (fixed top)

Page content (max-width 1100px, centered, padding space-8):

Row 1 — Balance Hero Card (full width)
  ┌──────────────────────────────────────────────────────┐
  │  Your balance in Flat 4B                             │
  │                                                      │
  │  You owe  ₹3,200                                    │  ← text-2xl, error color if owe
  │                                                      │     text-2xl, success color if owed
  │  Last updated: 14 Jun 2026                          │  ← text-tertiary, text-xs
  └──────────────────────────────────────────────────────┘

Row 2 — Per-Person Breakdown (full width card)
  ┌──────────────────────────────────────────────────────┐
  │  Breakdown                                           │  ← text-md, weight-semibold
  │  ──────────────────────────────────────────────────  │
  │  Aisha        You owe  ₹1,200    [View breakdown →] │
  │  Rohan        You owe  ₹2,000    [View breakdown →] │
  │  Sam          Settled up ✓                          │
  └──────────────────────────────────────────────────────┘

  Clicking "View breakdown →" opens ExpenseBreakdownDrawer

Row 3 — Two columns (60/40 split)

  Left col — Recent Expenses
  ┌──────────────────────────────────┐
  │  Recent Expenses                 │
  │  ─────────────────────────────   │
  │  14 Jun  Maid salary Apr  ₹750  │
  │  15 Apr  Groceries DMart  ₹498  │
  │  ...                            │
  │  [View all expenses]            │
  └──────────────────────────────────┘

  Right col — Quick Actions
  ┌────────────────────────┐
  │  [+ Add Expense]       │
  │  [Record Settlement]   │
  │  [View Group]          │
  └────────────────────────┘
```

**Admin view (additional section at top):**

```
Admin Panel card:
  ┌──────────────────────────────────────────────────────┐
  │  Admin Panel                    [badge: ADMIN]       │
  │  ──────────────────────────────────────────────────  │
  │  Import CSV          [Go to Import →]               │
  │  View Import Report  [View Report →]                │
  │  Manage Users        [Manage →]                     │
  └──────────────────────────────────────────────────────┘
```

---

### Page 3 — Expense Breakdown Drawer (component)

```
Slides in from right when "View breakdown →" is clicked.

Header:
  Rohan → You          ← who owes whom
  You owe Rohan ₹2,000  ← net amount

Table:
  Date        Description         Total      Your Share
  01-03-2026  March rent          ₹48,000    ₹12,000
  05-03-2026  Wifi bill Mar       ₹1,199     ₹299.75
  18-03-2026  Electricity Mar     ₹1,450     ₹362.50
  ...

Footer:
  Net: You owe ₹2,000   [Record Settlement]
```

---

### Page 4 — Group Detail `/groups/:id`

```
Page header:
  Flat 4B                    ← group name, text-lg
  Created Feb 2026           ← text-secondary

Two columns:

Left — Members
  ┌──────────────────────────────┐
  │  Members                     │
  │  [+ Add Member]              │
  │  ─────────────────────────   │
  │  ● Aisha      Active         │
  │  ● Rohan      Active         │
  │  ● Priya      Active         │
  │  ○ Meera      Left Mar 31   │  ← dimmed, text-tertiary
  │  ● Sam        Joined Apr 15  │
  │  ○ Dev        Guest          │
  └──────────────────────────────┘

Right — Group Balances
  ┌──────────────────────────────┐
  │  Balances                    │
  │  ─────────────────────────   │
  │  Aisha    +₹4,200   [owed]  │  ← success color
  │  Rohan    -₹2,000   [owes]  │  ← error color
  │  Priya    -₹2,200   [owes]  │
  │  Sam      +₹0       [even]  │
  │                              │
  │  Suggested Settlements:      │
  │  Rohan → Aisha  ₹2,000     │
  │  Priya → Aisha  ₹2,200     │
  └──────────────────────────────┘
```

---

### Page 5 — Expenses List `/groups/:id/expenses`

```
Header row:
  Expenses — Flat 4B          [+ Add Expense]

Filters bar (single row):
  [Month: All ▼]  [Paid by: All ▼]  [Split type: All ▼]  [Search...]

Table:
  Date        Description              Paid by   Amount     Your share   Split
  14-04-2026  Maid salary Apr          Priya     ₹3,000     ₹750         Equal
  12-04-2026  Electricity Apr          Aisha     ₹1,380     ₹345         Equal
  10-04-2026  Housewarming drinks      Sam       ₹3,100     ₹775         Equal
  ...

  Each row clickable → opens ExpenseDetail page
  Soft-deleted rows shown with strikethrough + DELETED badge (admin only)
```

---

### Page 6 — Add / Edit Expense (modal or page)

```
Modal (640px wide) or full page on mobile.

Form:
  Description        [────────────────────────────]
  Amount             [──────────] Currency [INR ▼]
                     If USD selected:
                     "= ₹X at ₹84/USD"  ← computed live
  Date               [────────────────────────────]
  Paid by            [Dropdown of group members  ▼]
  Split type         [Equal ▼] [Unequal] [%] [Share]

  -- Split Details (conditional) --

  If Equal:
    Split with: [checkboxes of members, all checked by default]
    Preview: "₹750 each (4 members)"

  If Unequal:
    Aisha   [──────]
    Rohan   [──────]
    Priya   [──────]
    Sam     [──────]
    Total must match amount. Live validation: "₹3,000 / ₹3,000 ✓"

  If Percentage:
    Aisha   [──────] %
    Rohan   [──────] %
    Priya   [──────] %
    Sam     [──────] %
    Live validation: "100% / 100% ✓" or "110% — must equal 100%"

  If Share:
    Aisha   [──] shares
    Rohan   [──] shares
    Preview: "Rohan: 2/6 shares = ₹1,000"

  Notes              [────────────────────────────]

  [Cancel]                              [Save Expense]
```

---

### Page 7 — Import CSV `/import` (Admin only)

```
Page header:
  Import Expenses
  Upload the expenses_export.csv file to import historical data.

Upload zone:
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │   Drop CSV file here, or click to browse            │  ← dashed border, text-secondary
  │   Only .csv files accepted                          │
  │                                                      │
  └──────────────────────────────────────────────────────┘

  After file selected:
  ✓ Expenses_Export.csv (4.2 KB)    [Remove]

  [Analyze File]   ← triggers backend parsing, shows spinner

After analysis:

  Summary bar:
  42 rows found  |  24 clean  |  18 anomalies detected

  [Proceed to Review →]
```

---

### Page 8 — Import Review `/import/:batch_id/review` (Admin only)

```
Page header:
  Import Review
  Resolve all anomalies before finalizing.

Progress indicator:
  18 anomalies  |  12 resolved  |  6 pending

Two sections:

── ANOMALIES (blocking first, then info) ──────────────────

  Each anomaly card:
  ┌──────────────────────────────────────────────────────────┐
  │  Row 6   [BLOCKING]   Exact Duplicate                   │
  │  ──────────────────────────────────────────────────────  │
  │  "dinner - marina bites" on 08-02-2026 paid by Dev     │
  │  appears identical to Row 5 "Dinner at Marina Bites"   │
  │                                                          │
  │  Suggested: Skip Row 6, keep Row 5                      │
  │                                                          │
  │  Raw row: { date: "08-02-2026", description: "dinner   │  ← monospace, text-xs, bg-base
  │  - marina bites", paid_by: "Dev", amount: "3200" }     │
  │                                                          │
  │  [✓ Approve suggestion]    [✗ Reject (skip row)]        │
  └──────────────────────────────────────────────────────────┘

── INFO ANOMALIES (auto-handled) ──────────────────────────

  Shown as a simple table, no action needed:

  Row   Type                    Action Taken
  7     Comma in amount         Parsed "1,200" → 1200 (INR)
  27    Malformed date          "Mar-14" → 2026-03-14
  9     Name case               "priya" → Priya
  ...

After all blocking anomalies resolved:

  [Finalize Import]  ← accent button, full width at bottom
```

---

### Page 9 — Import Report `/import/:batch_id/report` (Admin only)

```
Page header:
  Import Report
  Expenses_Export.csv  •  Imported 14 Jun 2026  •  by Admin

Summary cards (4 in a row):
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ 42       │  │ 24       │  │ 14       │  │ 4        │
  │ Total    │  │ Imported │  │ Anomalies│  │ Skipped  │
  │ Rows     │  │          │  │ Resolved │  │          │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘

Full anomaly log table:
  Row  Description            Anomaly Type           Action Taken          Status
  5,6  Marina Bites dinner    Exact duplicate        Row 6 rejected        REJECTED
  7    Electricity Feb        Comma in amount        Parsed to 1200        IMPORTED
  11   Groceries DMart        Unknown payer (Priya S) Mapped to Priya      IMPORTED
  14   Rohan paid Aisha back  Settlement as expense  Moved to settlements  SETTLED
  ...

  [Download Report as PDF]  ← ghost button
```

---

### Page 10 — Settlements `/groups/:id/settlements`

```
Header:
  Settlements — Flat 4B        [+ Record Payment]

Table:
  Date        From     To      Amount    Notes
  25-02-2026  Rohan    Aisha   ₹5,000   Imported from CSV
  ...

Record Payment modal:
  Who paid     [Dropdown ▼]
  Who to       [Dropdown ▼]
  Amount       [────────]
  Date         [────────]
  Notes        [────────]
  [Save]
```

---

## 5. Navigation Structure

```
Navbar (all users):
  Splito    Dashboard    Expenses    Settlements    [username]    Logout

Admin additionally sees:
  Splito    Dashboard    Expenses    Settlements    Import    Users    [Admin]    Logout
```

**Route map:**
```
/login
/dashboard
/groups/:id
/groups/:id/expenses
/groups/:id/expenses/new
/groups/:id/expenses/:eid
/groups/:id/settlements
/import                          (admin)
/import/:batch_id/review         (admin)
/import/:batch_id/report         (admin)
/admin/users                     (admin)
```

---

## 6. Responsive Behavior

The app is primarily a desktop tool (evaluators will use a laptop). Mobile is a bonus, not a requirement.

- Below 768px: collapse navbar to hamburger, stack columns, drawers go full-width
- Tables scroll horizontally on mobile
- No separate mobile design — just graceful degradation

---

## 7. What the UI Must Never Do

- No gradient backgrounds
- No glowing elements or box-shadow with color
- No border-radius > 6px on any card or button
- No scale/translate animations on hover
- No loading skeletons that animate with shimmer
- No emoji in UI labels (reserve for notes/descriptions from users)
- No hero images or illustrations
- No colored sidebar (sidebar if any = bg-surface, same as cards)
- No sticky action bars that float over content

---

## 8. Loading and Error States

**Loading:** Simple text "Loading..." or a non-animated spinner (CSS border-spin, monochrome)

**Empty states:**
```
No expenses yet.
[+ Add the first expense]
```
Plain text, centered, no illustration.

**Error states:**
```
Failed to load balances.
[Try again]
```

**Form validation:** Inline below each field. Red border + error message text. No toast popups for validation.

**Success/failure toasts:** Minimal. Bottom-right corner. Black bg, white text. Auto-dismiss 3s. No color except for the left border (green/red).

---

*End of UI_DESIGN_PLAN.md*
*Next: GIT_WORKFLOW.md*
