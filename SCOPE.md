# Splito - Project Scope

## Project Overview
Splito is an end-to-end, full-stack expense sharing application designed specifically for complex, messy, and real-world group finance scenarios (like a flatshare over several months). The core objective of this project was to ingest raw, unstandardized CSV data containing real-world flatmate expenses (with variable split logic), accurately process and persist those expenses using a custom algorithm, and display them through a beautiful, modern, pixel-perfect user interface.

## Core Deliverables

### 1. Robust Data Ingestion Engine
- **CSV Parsing Engine:** Handles raw, messy user data containing various split types (`equal`, `share`, `percentage`, `unequal`).
- **Data Standardization:** Reconciles messy, real-world spreadsheet notes and user inconsistencies into structured database entities.
- **Dynamic Split Algorithms:** Interprets complex split rules (e.g. "Aisha owes 30%, Rohan owes 70%" or "Dev owes 2 shares, Sam owes 1 share") and accurately converts them into exact monetary debts on a per-transaction basis.
- **Transactional Integrity:** Uses Supabase database transactions and RPC functions to ensure atomic ingestion of batches (all-or-nothing rollback).

### 2. High-Performance Math & Settlement Engine
- **Accurate Pairwise Settlement:** Implements an algorithm that calculates the mathematically optimal way for a group to settle their debts using the minimum number of transactions.
- **Integer-Based Currency:** All money is tracked using `paise` (integers) to completely eliminate floating-point rounding errors and ensure the ledger always perfectly balances to exactly zero.
- **Member Timelines:** Accurately calculates net balances by accounting for the exact dates members joined and left the group (e.g., ignoring expenses that occurred before a member moved in, but persisting their debts after they move out).

### 3. Full-Stack Web Application
- **Backend (Express.js):** A lightweight, robust API server interfacing directly with Supabase via Service Roles to bypass RLS for administrative ingestion, while serving standard data to the client securely.
- **Frontend (React.js):** A modern Single Page Application built to consume the backend API seamlessly.
- **Authentication:** Integrated Supabase Auth to allow members to securely log in and view their personal analytics without seeing sensitive data belonging to others.

### 4. Modern, Premium UI/UX Design System
- **Tailwind CSS Styling:** A custom, carefully curated design system leveraging sophisticated color palettes, glassmorphism, responsive grids, and clean typography (Inter/Roboto).
- **Role-Based Views:**
  - **Admin View:** Full God-mode view of the entire ingestion pipeline, historical batches, group-wide data, and a macro-view of all balances.
  - **User View:** A personalized dashboard specifically tailored to highlight exactly what that user owes, what they are owed, and their personal transaction history.
- **Visual Analytics:** Badges, dynamic colors, and real-time loading skeletons enhance the application's premium feel.

## Out of Scope
- Direct payment gateway integration (e.g., Stripe, UPI) for actually moving money.
- Real-time chat or push notifications.
- Automatic email generation.
