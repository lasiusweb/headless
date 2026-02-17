# Implementation Plan - Phase 1: Project Foundation & Core Catalog API

## Phase 1: Monorepo & Backend Scaffolding [checkpoint: a79b1c3]
- [x] Task: Initialize pnpm monorepo and Turborepo 04915d7
    - [x] Create `pnpm-workspace.yaml` and `turbo.json`
    - [x] Initialize `apps/` and `packages/` directories
- [x] Task: Scaffold NestJS API application 5fb7415
    - [x] Create `apps/api` using Nest CLI
    - [x] Configure TypeScript, ESLint, and Prettier per style guides
- [x] Task: Configure Supabase Integration e325526
    - [x] Initialize Supabase client in `apps/api`
    - [x] Implement `SupabaseAuthGuard` for JWT validation
- [x] Task: Conductor - User Manual Verification 'Monorepo & Backend Scaffolding' (Protocol in workflow.md) a79b1c3

## Phase 2: Core Catalog Schema & API
- [x] Task: Implement Category Module 03ed528
    - [x] Write tests for Category CRUD
    - [x] Implement Category entity, DTOs, and Service
    - [x] Create secured Admin Controller for Categories
- [x] Task: Implement Product Module a7dfc41
    - [x] Write tests for Product CRUD
    - [x] Implement Product entity, DTOs, and Service
    - [x] Create secured Admin Controller for Products
- [x] Task: Swagger/OpenAPI Documentation ff0110a
    - [x] Configure Swagger in NestJS
    - [x] Annotate Catalog endpoints for API discovery
- [x] Task: Conductor - User Manual Verification 'Core Catalog Schema & API' (Protocol in workflow.md)

[checkpoint: pending_build_verification]

## Phase 3: Cart & Orders Enhancement [checkpoint: 9d875b8]
- [x] Task: Fix duplicate PosModule import in app.module.ts
- [x] Task: Enhance Cart Module with GST calculation
    - [x] Add role-based pricing (retailer/dealer/distributor)
    - [x] Implement CGST+SGST (intra-state) and IGST (inter-state) calculation
    - [x] Add comprehensive unit tests for cart service
- [x] Task: Add Orders Module Tests
    - [x] Create comprehensive tests for orders.service.ts
    - [x] Test B2B approval workflow (auto-approve retailers, pending for dealers)
    - [x] Test order rejection and shipping flows
- [x] Task: Implement Inventory Stock Reservation
    - [x] Add StockReservation interface and DTO
    - [x] Implement createStockReservation method
    - [x] Implement fulfill/cancel/expire stock reservation methods
    - [x] Integrate with orders module for automatic reservation on approval

[checkpoint: 9d875b8]

## Phase 4: Payments & Invoicing [checkpoint: e1fefc6]
- [x] Task: Enhance Payment Gateway Module
    - [x] Add comprehensive payment service tests
    - [x] Test payment initiation, verification, refund flows
    - [x] Test partial payment processing
- [x] Task: Enhance GST-Compliant Invoice Generation
    - [x] Add HSN-based GST rate calculation (5%, 12%, 18% slabs)
    - [x] Add item-level tax breakdown in invoices
    - [x] Add proper CGST/SGST (intra-state) and IGST (inter-state) calculation
- [x] Task: Add GST Compliance Reporting
    - [x] Implement GSTR-1 ready reports (rate-wise summary)
    - [x] Implement HSN-wise summary for GST filing
    - [x] Add outward supply report generation

[checkpoint: e1fefc6]

## Phase 5: Frontend Storefront Foundation [checkpoint: a9615ad]
- [x] Task: Setup Shared Packages
    - [x] Create @kn/lib package (auth hook, API client, Supabase)
    - [x] Create @kn/types package (shared TypeScript types)
    - [x] Create @kn/ui package (Button, Input, Card components)
- [x] Task: Build B2B Portal (www) Foundation
    - [x] Create shop page with product listing
    - [x] Add search and filter functionality
    - [x] Implement product cards with pricing display
- [x] Task: Integrate Authentication
    - [x] Add useAuth hook with Zustand
    - [x] Implement Supabase auth integration
    - [x] Add protected route handling

[checkpoint: a9615ad]

## Phase 6: Mobile POS & Dealer Dashboard [checkpoint: 4dcf798]
- [x] Task: Enhance Mobile POS
    - [x] Add OfflineSyncService with WorkManager background sync
    - [x] Add BarcodeScannerService for product lookup
    - [x] Implement queue-based sync for offline operations
- [x] Task: Build Dealer Dashboard
    - [x] Create dashboard with order statistics
    - [x] Add order history page with status filtering
    - [x] Implement order progress tracker

[checkpoint: 4dcf798]

## Phase 7: Zoho Integration & Analytics [checkpoint: 97cebd3]
- [x] Task: Enhance Zoho Integration
    - [x] Add ZohoWebhookController for Books and CRM webhooks
    - [x] Add webhook signature verification
    - [x] Handle invoice, payment, contact, lead, deal webhooks
    - [x] Auto-sync Zoho data back to local database
- [x] Task: Build Analytics Dashboard
    - [x] Create admin analytics page with overview cards
    - [x] Add sales trend visualization
    - [x] Display top products and quick insights
    - [x] Add date range filtering

[checkpoint: 97cebd3]

## Phase 8: B2C Storefront & Shipping [checkpoint: fcc0f70]
- [x] Task: Enhance B2C Agriculture Storefront
    - [x] Create shop page with crop-based filtering
    - [x] Add problem/solution finder filter
    - [x] Add category quick selection cards
    - [x] Implement multi-filter search
- [x] Task: Implement Shipping Integration
    - [x] Add ShippingService with Delhivery and VRL
    - [x] Implement rate comparison across carriers
    - [x] Add shipment creation with AWB generation
    - [x] Add real-time shipment tracking
    - [x] Add shipment cancellation support

[checkpoint: fcc0f70]

## Phase 9: Loyalty Program & Notifications [checkpoint: 429f03e]
- [x] Task: Enhance Loyalty Program
    - [x] Add Supabase-backed loyalty profile management
    - [x] Implement points earning with tier multipliers
    - [x] Add rewards catalog and redemption
    - [x] Implement referral program with bonus points
    - [x] Add automatic tier upgrades
- [x] Task: Build Notification System
    - [x] Add SendGrid email integration
    - [x] Add Twilio SMS integration
    - [x] Add Twilio WhatsApp integration
    - [x] Implement order lifecycle notifications
    - [x] Add notification preferences management

[checkpoint: 429f03e]

## Phase 10: Returns & Supplier Management [checkpoint: 9a1cc00]
- [x] Task: Implement Returns & Refunds
    - [x] Add return request workflow with auto-approval
    - [x] Implement refund processing with status tracking
    - [x] Add exchange functionality
    - [x] Add return reason categorization
    - [x] Add return policy management
- [x] Task: Build Supplier Management
    - [x] Add supplier CRUD operations
    - [x] Implement purchase order management
    - [x] Add supplier analytics (delivery time, on-time rate)
    - [x] Add auto-reorder for low stock items

[checkpoint: 9a1cc00]
