# Getting Started - KN Biosciences Platform

Welcome to the KN Biosciences Headless E-Commerce Platform! This guide will help you set up and run the platform locally.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Development](#development)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **pnpm** v8.15+ ([Install](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized development) ([Download](https://docker.com/))

### Accounts & Credentials

- **Supabase** account ([Sign up](https://supabase.com/))
- **GCP** account (for production deployment) ([Sign up](https://cloud.google.com/))

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/knbiosciences/store.git
cd store
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment files:

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local

# Landing Page
cp apps/web/apps/landing/.env.example apps/web/apps/landing/.env.local
```

Edit the `.env` files with your credentials:

**apps/api/.env**:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

**apps/web/.env.local**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Validate Environment

Before starting, validate your environment variables:

```bash
cd apps/api
npx ts-node src/scripts/validate-env.ts
```

### 5. Start Development Servers

**Option A: Start All Services**
```bash
# From root directory
pnpm run dev
```

**Option B: Start Individual Services**
```bash
# API (Terminal 1)
cd apps/api && pnpm run dev

# Landing Page (Terminal 2)
cd apps/web/apps/landing && pnpm run dev

# B2B Portal (Terminal 3)
cd apps/web/apps/www && pnpm run dev

# B2C Portal (Terminal 4)
cd apps/web/apps/agriculture && pnpm run dev
```

### 6. Access the Applications

| Application | URL | Description |
|-------------|-----|-------------|
| Landing Page | http://localhost:3000 | Portal entry point |
| API | http://localhost:3000/api | Backend API |
| API Docs | http://localhost:3000/api/docs | Swagger documentation |
| B2B Portal | http://localhost:3001 | Dealer portal |
| B2C Portal | http://localhost:3002 | Farmer portal |
| Admin | http://localhost:3003 | Admin dashboard |

---

## Project Structure

```
kn-biosciences-store/
├── apps/
│   ├── api/                      # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules
│   │   │   ├── common/           # Shared utilities
│   │   │   ├── config/           # Configuration
│   │   │   └── main.ts           # Entry point
│   │   └── test/                 # E2E tests
│   │
│   ├── web/                      # Next.js storefronts
│   │   ├── apps/
│   │   │   ├── landing/          # Landing page
│   │   │   ├── www/              # B2B portal
│   │   │   ├── agriculture/      # B2C portal
│   │   │   └── admin/            # Admin dashboard
│   │   └── packages/
│   │       ├── lib/              # Shared libraries
│   │       ├── ui/               # UI components
│   │       └── types/            # TypeScript types
│   │
│   └── mobile/
│       └── pos/                  # Flutter POS app
│
├── infra/
│   └── db/                       # Database schema & migrations
│
├── conductor/                    # Project documentation
│
├── docker-compose.yml            # Docker orchestration
├── pnpm-workspace.yaml           # pnpm workspace config
├── turbo.json                    # Turborepo config
└── package.json                  # Root package.json
```

---

## Development

### Available Commands

```bash
# Install dependencies
pnpm install

# Start all services in development
pnpm run dev

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Run linting
pnpm run lint

# Format code
pnpm run format
```

### Service-Specific Commands

**API**:
```bash
cd apps/api

# Development
pnpm run dev

# Build
pnpm run build

# Test
pnpm run test
pnpm run test:e2e

# Start production
pnpm run start:prod
```

**Web Apps**:
```bash
cd apps/web/apps/landing

# Development
pnpm run dev

# Build
pnpm run build

# Start production
pnpm run start

# Test
pnpm run test
```

### Hot Reload

All services support hot reload in development mode. Changes to your code will automatically restart the server.

---

## Testing

### Run All Tests

```bash
pnpm run test
```

### Run API Tests

```bash
# Unit tests
cd apps/api && pnpm run test

# E2E tests
cd apps/api && pnpm run test:e2e

# With coverage
cd apps/api && pnpm run test:cov
```

### Run Frontend Tests

```bash
cd apps/web/apps/landing && pnpm run test
```

### Health Check

Before deployment, run the system health check:

```bash
cd apps/api
npx ts-node src/health-check.ts
```

---

## Deployment

### Docker Deployment (Recommended)

**1. Build Containers**:
```bash
docker-compose build
```

**2. Start Services**:
```bash
docker-compose up -d
```

**3. Check Status**:
```bash
docker-compose ps
```

**4. View Logs**:
```bash
docker-compose logs -f api
```

### GCP Cloud Run Deployment

See [PORTAL_ROUTING_DEPLOYMENT.md](./PORTAL_ROUTING_DEPLOYMENT.md) for detailed deployment instructions.

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

**Required**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (min 32 characters)
- `CORS_ORIGIN` (comma-separated list)

**Optional**:
- Payment gateway credentials
- Shipping provider API keys
- Zoho integration credentials
- Notification service credentials

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**: Change the port in `.env` or kill the process:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### 2. Module Not Found

**Error**: `Cannot find module '@kn/ui'`

**Solution**: Rebuild packages:
```bash
pnpm run build --filter=@kn/ui
pnpm run build --filter=@kn/lib
```

#### 3. Environment Validation Failed

**Error**: `Environment validation failed`

**Solution**: 
1. Check `.env` file exists
2. Verify all required variables are set
3. Run validation script:
```bash
npx ts-node src/scripts/validate-env.ts
```

#### 4. Database Connection Error

**Error**: `Connection refused` or `Authentication failed`

**Solution**:
1. Verify Supabase credentials in `.env`
2. Check Supabase project status
3. Ensure network connectivity

#### 5. CORS Errors

**Error**: `CORS policy blocked`

**Solution**: Add your frontend URL to `CORS_ORIGIN` in API `.env`:
```bash
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Getting Help

- **Documentation**: See [README.md](./README.md) and [QWEN.md](./QWEN.md)
- **Issues**: https://github.com/knbiosciences/store/issues
- **Email**: tech@knbiosciences.in

---

## Next Steps

After setting up locally:

1. **Explore the API**: Visit http://localhost:3000/api/docs
2. **Create Test Data**: Use the admin dashboard to add products
3. **Test User Flows**: Register as dealer and farmer
4. **Run Tests**: Ensure all tests pass
5. **Read Documentation**: Review [PORTAL_ROUTING_SUMMARY.md](./PORTAL_ROUTING_SUMMARY.md)

---

## Additional Resources

- [API Documentation](./apps/api/API_DOCUMENTATION.md)
- [Database Schema](./infra/db/DATABASE_SCHEMA.md)
- [Infrastructure Guide](./infra/INFRASTRUCTURE.md)
- [Production Runbook](./PRODUCTION_RUNBOOK.md)
- [Portal Routing Guide](./B2B_D2C_ROUTING_IMPROVEMENTS.md)

---

**Happy Coding! 🚀**
