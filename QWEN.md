# KN Biosciences Headless E-Commerce Platform

## Project Overview

This is a headless e-commerce platform for KN Biosciences built with a modern tech stack consisting of:
- **Backend**: NestJS (TypeScript) modular monolith
- **Frontend**: Next.js 15 storefronts for B2B and B2C customers
- **Mobile POS**: Flutter application with offline-first capabilities
- **Database**: Supabase PostgreSQL
- **Infrastructure**: Google Cloud Platform (GCP) Cloud Run

The platform serves multiple user types including B2B dealers/distributors, B2C agricultural customers (farmers), and internal administrators. It features role-based pricing, inventory management, offline POS capabilities, and integrations with Zoho, payment gateways, and shipping providers.

## Architecture

### Backend (NestJS API)
Located in `apps/api`, this is a modular monolith with the following key modules:
- **Auth Module**: Supabase Auth integration with JWT-based authentication
- **Catalog Module**: Product and category management
- **Users Module**: Profile and dealer application management
- **Pricing Module**: Role-based pricing engine
- **Inventory Module**: Stock management with FIFO allocation
- **Orders Module**: Order processing with B2B approval workflow
- **Payments Module**: Payment gateway integrations (Easebuzz/PayU)
- **Shipping Module**: Carrier integrations (Delhivery, VRL)
- **Invoices Module**: GST-compliant invoice generation
- **Zoho Module**: CRM/Books synchronization

### Frontend (Next.js 15)
Planned to be located in `apps/web` with multiple storefronts:
- **www.knbiosciences.in**: B2B portal for dealers and distributors
- **agriculture.knbiosciences.in**: B2C portal for farmers
- **Admin Dashboard**: Management interface for internal staff

### Mobile POS (Flutter)
Planned to be located in `apps/mobile/pos` with offline-first capabilities:
- SQLite for local storage during offline periods
- 48-hour autonomy in low-connectivity rural areas
- Barcode scanning for quick product lookup
- Background sync when connectivity is restored

## Building and Running

### Prerequisites
- Node.js (v18+)
- pnpm package manager
- Docker (for containerized deployments)
- Supabase account and credentials

### Setup
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and other settings
```

### Development Commands
```bash
# Start all services in development mode
pnpm run dev

# Build all packages
pnpm run build

# Run tests across all packages
pnpm run test

# Lint all packages
pnpm run lint
```

### API Service Commands
```bash
# Navigate to the API directory
cd apps/api

# Development mode with auto-reload
pnpm run dev

# Production build
pnpm run build

# Run tests
pnpm run test
pnpm run test:e2e  # End-to-end tests

# Start production server
pnpm run start:prod
```

## Development Conventions

### Code Style
- Follow TypeScript/JavaScript style guides as defined in `conductor/code_styleguides/`
- Use consistent naming conventions for files and functions
- Maintain high code coverage (>80%) for all modules
- Write unit tests before implementing functionality (TDD approach)

### Git Workflow
- Follow the task workflow defined in `conductor/workflow.md`
- Use semantic commit messages following the format: `<type>(<scope>): <description>`
- Each completed task should be marked in `plan.md` with its commit hash
- Write failing tests first, then implement code to make them pass

### Testing
- Unit tests for all business logic
- Integration tests for API endpoints and database operations
- End-to-end tests for critical user flows
- Mobile-specific testing for POS application

## Key Features

### B2B Portal
- Dealer registration and approval workflow
- Role-based pricing (dealers get 40% off MRP, distributors get 55% off MRP)
- Bulk order forms with SKU autocomplete
- Credit management and approval workflows

### B2C Storefront
- Mobile-optimized shopping experience
- GST-compliant checkout process
- Product filtering by segments, crops, and problems

### Offline-First POS
- 48-hour autonomy in low-connectivity areas
- Local SQLite database for offline operations
- Automatic sync when connectivity is restored
- Barcode scanning for quick product lookup

### Inventory Management
- FIFO (First In, First Out) batch allocation
- Real-time stock level tracking
- Reservation system to prevent overselling
- Batch tracking with expiry date management

### Compliance & Integration
- GST-compliant invoicing with CGST/SGST/IGST splits
- Zoho Books and CRM integration
- Multiple payment gateway support (Easebuzz, PayU)
- Shipping integration with Delhivery and VRL

## Project Structure
```
kn-biosciences-store/
├── apps/
│   ├── api/                      # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── products/
│   │   │   │   ├── pricing/
│   │   │   │   ├── inventory/
│   │   │   │   ├── cart/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── shipping/
│   │   │   │   ├── invoices/
│   │   │   │   ├── zoho/
│   │   │   │   └── common/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   └── test/
│   ├── web/                      # Next.js storefronts (planned)
│   └── mobile/                   # Flutter POS (planned)
├── conductor/                    # Project documentation and plans
├── packages/                     # Shared libraries (currently empty)
├── infra/                        # Infrastructure as code (planned)
├── .github/workflows/            # CI/CD configurations
├── pnpm-workspace.yaml
└── turbo.json
```

## Environment Variables

The application uses the following environment variables (defined in `apps/api/src/config/`):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for server-side operations)
- `ZOHo_CLIENT_ID`, `ZOHO_CLIENT_SECRET`: Zoho integration credentials
- `EASEBUZZ_SALT`, `EASEBUZZ_ENVIRONMENT`: Payment gateway credentials
- `DELHIVERY_API_KEY`: Shipping provider API key

## Deployment

The application is designed for deployment on Google Cloud Platform with:
- Cloud Run for containerized services (NestJS API, Next.js SSR)
- Supabase for managed PostgreSQL database
- Cloud Storage for static assets
- Memorystore for Redis caching
- Pub/Sub and Cloud Tasks for asynchronous job processing

The CI/CD pipeline is configured in `.github/workflows/` to automatically build, test, and deploy on pushes to the main branch.