# KN Biosciences E-Commerce Platform - Testing

This document outlines the testing strategy and setup for the KN Biosciences e-commerce platform.

## Test Structure

The test suite is organized as follows:

- **Unit Tests**: Located in `test/*.spec.ts` files, these test individual services and components in isolation
- **Integration Tests**: Located in `test/*integration*.spec.ts` files, these test the interaction between multiple components
- **E2E Tests**: Located in `test/*.e2e-spec.ts` files, these test complete API flows end-to-end

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run unit tests with coverage
pnpm test:cov

# Run a specific test file
pnpm test -- test/product.service.spec.ts
```

### E2E Tests
```bash
# Run all e2e tests
pnpm test:e2e

# Run e2e tests with coverage
pnpm test:e2e --coverage
```

## Test Coverage

Our goal is to maintain >80% test coverage across the application. The key areas covered include:

- **Auth Module**: JWT validation, role-based access control
- **Product Catalog**: Product CRUD operations, category management
- **Cart & Orders**: Cart functionality, order creation and management
- **Pricing**: Role-based pricing calculations
- **Inventory**: Stock management, FIFO allocation
- **Payments**: Payment gateway integration
- **Shipping**: Carrier integration, tracking
- **Invoicing**: GST-compliant invoice generation
- **Zoho Integration**: Data sync between systems

## Test Configuration

The test environment is configured to use mocked services for external dependencies like Supabase, ensuring tests run reliably without requiring external connections.

## Continuous Integration

Tests are automatically run in the CI pipeline on every push and pull request to ensure code quality and prevent regressions.