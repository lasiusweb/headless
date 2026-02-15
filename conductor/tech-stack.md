# Technology Stack - KN Biosciences

## Backend
- **Framework:** NestJS (TypeScript)
- **Architecture:** Modular Monolith
- **Communication:** RESTful APIs (documented with Swagger/OpenAPI)
- **Validation:** Class-validator & Zod for DTOs and environment variables

## Frontend & Mobile
- **Web Storefronts (B2B/B2C):** Next.js 15 (React, App Router)
- **Styling:** Tailwind CSS & shadcn/ui
- **State Management:** Zustand (web), Riverpod (mobile)
- **Mobile POS:** Flutter (Dart)
- **Local Storage (POS):** SQLite (sqflite) for offline-first autonomy

## Database & Authentication
- **Primary Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (JWT based)
- **Storage:** Supabase Storage / GCP Cloud Storage for product media
- **Real-time:** Supabase Realtime for order/inventory updates

## Infrastructure & Hosting
- **Cloud Provider:** Google Cloud Provider (GCP)
- **Compute:** GCP Cloud Run (Serverless containers)
- **In-Memory Cache:** GCP Memorystore (Redis)
- **Asset Hosting:** GCP Cloud Storage

## DevOps & Tools
- **CI/CD:** GitHub Actions
- **Infrastructure as Code:** Terraform
- **Containerization:** Docker
- **Package Manager:** pnpm
- **Monorepo Management:** Turborepo
