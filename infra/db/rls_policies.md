# Row Level Security (RLS) Policies for KN Biosciences

## Overview
This document describes all RLS policies implemented in the KN Biosciences Supabase database.

## Policies

### Profiles Table
- **Policy**: Users can view own profile
  - Applies to: SELECT operations
  - Role: authenticated users
  - Condition: auth.uid() = id (user can only access their own profile)

- **Policy**: Users can update own profile
  - Applies to: UPDATE operations
  - Role: authenticated users
  - Condition: auth.uid() = id (user can only update their own profile)

### Products Table
- **Policy**: Enable read access for all users
  - Applies to: SELECT operations
  - Role: authenticated and anon users
  - Condition: is_active = true (only active products visible)

### Product Variants Table
- **Policy**: Enable read access for all users
  - Applies to: SELECT operations
  - Role: authenticated and anon users
  - Condition: is_active = true AND parent product is active

### Orders Table
- **Policy**: Users can view own orders
  - Applies to: SELECT operations
  - Role: authenticated users
  - Condition: user_id = auth.uid() (user can only see their own orders)

- **Policy**: Users can create own orders
  - Applies to: INSERT operations
  - Role: authenticated users
  - Condition: user_id = auth.uid() (user can only create orders for themselves)

### Addresses Table
- **Policy**: Users can view own addresses
  - Applies to: SELECT operations
  - Role: authenticated users
  - Condition: user_id = auth.uid()

- **Policy**: Users can manage own addresses
  - Applies to: ALL operations
  - Role: authenticated users
  - Condition: user_id = auth.uid()

### Carts Table
- **Policy**: Users can view own cart
  - Applies to: SELECT operations
  - Role: authenticated users
  - Condition: user_id = auth.uid()

- **Policy**: Users can manage own cart
  - Applies to: ALL operations
  - Role: authenticated users
  - Condition: user_id = auth.uid()

### Cart Items Table
- **Policy**: Users can view own cart items
  - Applies to: SELECT operations
  - Role: authenticated users
  - Condition: Cart belongs to user (EXISTS check with carts table)

- **Policy**: Users can manage own cart items
  - Applies to: ALL operations
  - Role: authenticated users
  - Condition: Cart belongs to user (EXISTS check with carts table)

### Dealer Applications Table
- **Policy**: Users can view own dealer application
  - Applies to: SELECT operations
  - Role: authenticated users
  - Condition: user_id = auth.uid()

- **Policy**: Users can create own dealer application
  - Applies to: INSERT operations
  - Role: authenticated users
  - Condition: user_id = auth.uid()

### Admin Policies
- **Policy**: Admin full access to profiles
  - Applies to: ALL operations
  - Role: authenticated users
  - Condition: User has admin role

- **Policy**: Admin full access to products
  - Applies to: ALL operations
  - Role: authenticated users
  - Condition: User has admin role

## Implementation Notes
- All RLS policies are enabled on tables that contain sensitive user data
- Policies are designed to prevent unauthorized access to data belonging to other users
- Admin users have elevated privileges to manage the entire system
- Guest (anon) users have limited read access to public data like products