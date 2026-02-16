# Supabase Authentication Setup for KN Biosciences

## Overview
This document explains how to set up and configure Supabase authentication for the KN Biosciences e-commerce platform.

## Authentication Providers

### Email/Password Authentication
- Enabled by default
- Used for customer, dealer, and distributor accounts
- Password strength requirements: minimum 6 characters

### Phone Authentication
- Enabled for SMS verification
- Used for order notifications and account recovery

## User Roles
After signup, users are assigned roles based on their account type:
- **customer**: Basic user with access to browse and purchase products
- **dealer**: Business user with wholesale pricing and bulk ordering
- **distributor**: Higher-tier business user with additional benefits
- **admin**: Administrative access to manage the platform
- **pos_user**: Special role for POS application users

## Profile Management
User profiles are stored in the `profiles` table with the following fields:
- id: UUID (references auth.users.id)
- email: User's email address
- first_name, last_name: Personal information
- phone: Contact information
- role: User's role in the system
- company_name, gst_number, etc.: Business information for dealers/distributors
- status: Account status (active, inactive, suspended, etc.)

## Authentication Flow

### Sign Up
1. User registers via email/password or phone
2. Supabase creates user in auth.users table
3. Custom trigger creates profile in profiles table
4. For business accounts, dealer application process begins

### Sign In
1. User authenticates via Supabase
2. JWT token is returned
3. Frontend uses token to access protected routes
4. Backend validates token and extracts user information

### Role-Based Access Control
- JWT contains user role information
- Backend guards check user roles for protected endpoints
- Different pricing and features based on user role

## Security Measures
- All sensitive operations require authentication
- JWT tokens expire after configured time (default 1 hour)
- Refresh tokens used for extended sessions
- RLS policies prevent unauthorized data access
- Rate limiting on authentication endpoints

## Configuration
The authentication is configured in the Supabase dashboard:
- Email templates customized for KN Biosciences
- SMS templates for phone authentication
- Redirect URLs for OAuth providers
- Password strength requirements
- Email confirmation settings

## Backend Integration
The NestJS API integrates with Supabase Auth using:
- SupabaseService for client initialization
- JwtAuthGuard for protecting routes
- RolesGuard for role-based access control
- Custom decorators for public/private routes

## Frontend Integration
The Next.js apps integrate with Supabase Auth using:
- Supabase JavaScript client
- Session management
- Role-based UI rendering
- Protected route components