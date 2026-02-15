# GEMINI.md - Project Context

## Project Overview
**KN Biosciences Headless E-Commerce Platform** is a comprehensive, multi-platform ecosystem designed to modernize agricultural commerce. It bridges the gap between KN Biosciences and its diverse user base, ranging from large-scale B2B distributors to individual rural farmers.

### Core Components:
- **Unified NestJS Backend:** A modular monolith providing a single source of truth for inventory, pricing, and orders.
- **Next.js 15 Storefronts:** High-performance web applications for both B2B dealers and B2C agricultural customers.
- **Offline-First Flutter POS:** A mobile application built for 48-hour autonomy in rural areas with low connectivity, supporting barcode scanning.

## Tech Stack Summary
- **Backend:** NestJS (TypeScript), Modular Monolith, RESTful APIs (Swagger/OpenAPI).
- **Frontend:** Next.js 15 (React, App Router), Tailwind CSS, shadcn/ui.
- **Mobile:** Flutter (Dart), Riverpod (State Management), SQLite (Local Storage).
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage, Real-time).
- **Infrastructure:** Google Cloud Platform (GCP) - Cloud Run, Cloud Storage, Memorystore (Redis).
- **DevOps:** GitHub Actions (CI/CD), Terraform (IaC), Docker, Turborepo, pnpm.

## Building and Running
*Note: The project is currently in the initial scaffolding phase. Specific build/run scripts will be populated as the monorepo structure is implemented.*

- **Package Manager:** `pnpm`
- **Monorepo Tool:** `Turborepo`
- **Backend (Inferred):** `cd apps/api && pnpm run start:dev`
- **Frontend (Inferred):** `pnpm run dev` (from root or specific app directory)

## Development & Design Conventions
- **Performance First:** Target sub-2.5 second page loads on 4G mobile networks.
- **Mobile-First:** Prioritize smartphone experience for all user segments.
- **Accessibility (A11y):** 
    - Support for regional languages (Telugu, Kannada).
    - High-contrast modes and adjustable font sizes for outdoor readability.
    - Large touch targets (min 44x44px) for POS users.
- **Prose Style:** 
    - B2C: Educational and supportive.
    - B2B/POS: Efficient and transactional.
    - Corporate: Authority and trust.
- **Architecture:** Maintain a clean, modular monolith structure in the backend with clear separation of concerns (Modules, Guards, DTOs).

## Project Management (Conductor)
This project uses the **Conductor** methodology for setup and track management.
- **Index:** `conductor/index.md` (To be created)
- **Status:** Initial setup in progress. Tech stack defined (`conductor/tech-stack.md`).
- **State File:** `conductor/setup_state.json`
