# Splito - AI Usage

This document transparently outlines how AI assistants were utilized throughout the lifecycle of the Splito project. The AI was not merely a code-completion tool; it acted as a collaborative pair-programmer, system architect, and specialized problem solver.

## 1. Data Parsing & Algorithmic Design
The most significant AI contribution was in deciphering the highly complex math required to match the user's Excel spreadsheet rules.

**The Challenge:** The raw CSV data contained columns for specific individuals alongside columns for the "Total Expense", with various markers indicating whether an expense was split equally, by exact shares, by percentages, or completely unevenly. The math needed to calculate "who paid what" vs "who owes what" and then derive the net balance dynamically.

**AI Intervention:** 
- The AI parsed the initial Excel data layout to understand the underlying semantic meaning behind the columns.
- It wrote the robust `importService.js` and `splitService.js` algorithms, successfully implementing the integer math conversion (paise) to prevent floating-point rounding errors.
- It designed the fractional remainder logic, ensuring that odd amounts (e.g. ₹10.00 split 3 ways) always resolved without dropping a single cent.

## 2. Architecture & Database Normalization
**The Challenge:** Taking a flat, 2D spreadsheet and translating it into a relational database schema that supports scalable users, groups, relational expenses, and dynamic splits.

**AI Intervention:**
- Designed the `schema.sql` outlining a 4-tier relational model: `Users`, `Groups`, `Expenses`, and `Expense_Splits`.
- Wrote the seed script and initialization logic to dynamically map CSV usernames to actual Supabase Auth `uuid`s.
- Recommended and implemented the Supabase Service Key architecture for the Node.js backend to facilitate massive bulk imports seamlessly.

## 3. UI/UX Design System
**The Challenge:** Creating an interface that didn't just function, but felt premium, highly modern, and visually engaging.

**AI Intervention:**
- Authored the core `tailwind.config.js` design tokens (color palettes, font families, custom spacing).
- Iteratively generated the React components, implementing best practices like `animate-fade-in` and `animate-pulse` for loading states.
- Actively diagnosed and resolved complex CSS Grid vs Flexbox alignment bugs (such as card height stretching issues) through visual descriptions and live debugging.

## 4. Debugging & Rapid Prototyping
**The Challenge:** The project encountered several sophisticated bugs, such as state invalidation caching errors, asynchronous React hydration issues, and foreign-key constraint violations during database rollbacks.

**AI Intervention:**
- **State Invalidation:** Diagnosed an issue where navigating between different user sessions caused stale dashboard data to render, resolving it by writing dynamic custom hooks to forcibly fetch fresh data.
- **Data Integrity:** Identified a major flaw where deleted expenses were failing due to relational constraints (`expense_splits` needed to be dropped before `expenses`). The AI wrote the correction scripts and flawlessly wiped the duplicate rows from the database.
- **Algorithmic Edge Cases:** Found an edge case where users who left a group were being excluded from the net balance calculation. The AI pinpointed the exact `.is('left_at', null)` constraint and removed it.

## Conclusion
The AI served as an invaluable architect and debugger, vastly accelerating the development timeline while simultaneously elevating the mathematical rigor and visual aesthetics of the final application.
