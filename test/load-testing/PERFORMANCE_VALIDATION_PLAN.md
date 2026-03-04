# Performance Validation Plan - KN Biosciences Platform

## Document Information

- **Version**: 1.0.0
- **Date**: 2026-03-04
- **Owner**: Engineering Team
- **Review Frequency**: Per deployment

---

## Overview

This document outlines the comprehensive performance validation plan for the KN Biosciences headless e-commerce platform. It includes load testing strategies, performance benchmarks, monitoring setup, and optimization recommendations.

---

## Performance Objectives

### API Performance Targets

| Metric | Target | Critical Threshold | Measurement |
|--------|--------|-------------------|-------------|
| P95 Latency | < 500ms | > 1000ms | Cloud Monitoring |
| P99 Latency | < 1000ms | > 2000ms | Cloud Monitoring |
| Error Rate | < 0.1% | > 1% | Sentry |
| Throughput | > 1000 req/s | < 500 req/s | Cloud Monitoring |
| Availability | 99.9% | < 99% | Uptime monitoring |
| Time to First Byte | < 100ms | > 300ms | k6 |

### Frontend Performance Targets

| Metric | Target | Critical Threshold | Measurement |
|--------|--------|-------------------|-------------|
| Largest Contentful Paint (LCP) | < 2.5s | > 4s | PageSpeed Insights |
| First Input Delay (FID) | < 100ms | > 300ms | PageSpeed Insights |
| Cumulative Layout Shift (CLS) | < 0.1 | > 0.25 | PageSpeed Insights |
| Time to Interactive (TTI) | < 3.5s | > 6s | PageSpeed Insights |
| First Contentful Paint (FCP) | < 1.5s | > 3s | PageSpeed Insights |
| Bounce Rate | < 40% | > 60% | Google Analytics |

### Database Performance Targets

| Metric | Target | Critical Threshold | Measurement |
|--------|--------|-------------------|-------------|
| Query Duration (avg) | < 50ms | > 200ms | Supabase logs |
| Slow Queries | < 10/hour | > 50/hour | Supabase logs |
| Connection Pool Usage | < 70% | > 90% | Supabase dashboard |
| Cache Hit Rate | > 90% | < 70% | Supabase dashboard |

---

## Load Testing Strategy

### Test Environments

| Environment | URL | Purpose | Data |
|-------------|-----|---------|------|
| Staging | staging-api.knbiosciences.in | Pre-production testing | Anonymized production data |
| Production | api.knbiosciences.in | Live monitoring only | Real user data |

### Load Test Types

#### 1. Light Load Test
**Purpose**: Baseline performance measurement

**Configuration**:
- Virtual Users: 10
- Duration: 5 minutes
- Ramp-up: 1 minute

**Success Criteria**:
- All requests complete successfully
- P95 latency < 300ms
- Error rate < 0.1%

#### 2. Standard Load Test
**Purpose**: Normal operating conditions

**Configuration**:
- Virtual Users: 50
- Duration: 9 minutes
- Ramp-up: 2 minutes

**Success Criteria**:
- P95 latency < 500ms
- Error rate < 0.5%
- Throughput > 500 req/s

#### 3. Peak Load Test
**Purpose**: High-traffic scenarios (sales, promotions)

**Configuration**:
- Virtual Users: 100
- Duration: 10 minutes
- Ramp-up: 3 minutes

**Success Criteria**:
- P95 latency < 800ms
- Error rate < 1%
- Auto-scaling triggers correctly

#### 4. Stress Test
**Purpose**: Breaking point identification

**Configuration**:
- Virtual Users: 200+
- Duration: 9 minutes
- Ramp-up: 2 minutes

**Success Criteria**:
- System degrades gracefully
- No data corruption
- Recovery time < 5 minutes

#### 5. Endurance Test
**Purpose**: Memory leak detection

**Configuration**:
- Virtual Users: 50
- Duration: 4 hours
- Constant load

**Success Criteria**:
- Memory usage stable
- No performance degradation over time
- Error rate consistent

---

## Test Scenarios

### Scenario 1: Product Browsing

```javascript
// User flow: Browse products
1. GET /api/products?limit=20&offset=0
2. GET /api/categories
3. GET /api/products?category_id=X&filter=Y
4. GET /api/products/:id
```

**Expected Performance**:
- Product list: P95 < 300ms
- Product detail: P95 < 200ms
- Category filter: P95 < 400ms

### Scenario 2: Cart Operations

```javascript
// User flow: Add to cart
1. POST /api/cart/items
2. GET /api/cart
3. PATCH /api/cart/items/:id
4. DELETE /api/cart/items/:id
```

**Expected Performance**:
- Add to cart: P95 < 400ms
- Get cart: P95 < 200ms
- Update cart: P95 < 300ms

### Scenario 3: Checkout Flow

```javascript
// User flow: Complete purchase
1. POST /api/orders
2. POST /api/payments/initiate
3. POST /api/payments/verify
4. GET /api/orders/:id
```

**Expected Performance**:
- Create order: P95 < 500ms
- Payment initiate: P95 < 800ms
- Payment verify: P95 < 1000ms

### Scenario 4: Authentication

```javascript
// User flow: Login and profile access
1. POST /api/auth/login
2. GET /api/users/profile
3. GET /api/users/orders
4. POST /api/auth/logout
```

**Expected Performance**:
- Login: P95 < 400ms
- Get profile: P95 < 200ms
- Get orders: P95 < 500ms

---

## Testing Tools

### Primary Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| k6 | Load testing | `brew install k6` |
| wrk | HTTP benchmarking | `brew install wrk` |
| Apache Bench | Simple load tests | `brew install httpd` |

### Monitoring Tools

| Tool | Purpose | URL |
|------|---------|-----|
| GCP Cloud Monitoring | Infrastructure metrics | console.cloud.google.com |
| Sentry | Error tracking | sentry.io |
| PageSpeed Insights | Frontend performance | pagespeed.web.dev |
| Google Analytics | User behavior | analytics.google.com |

---

## Running Load Tests

### Automated Load Testing

```bash
# Navigate to test directory
cd test/load-testing

# Run light load test
k6 run --vus 10 --duration 5m k6-script.js

# Run standard load test
k6 run --vus 50 --duration 9m k6-script.js

# Run peak load test
k6 run --vus 100 --duration 10m k6-script.js

# Run with custom configuration
k6 run --vus 200 --duration 15m --tag test_type=stress k6-script.js
```

### Using the Load Test Script

```bash
# Run all tests on staging
./load-test.sh staging all

# Run API tests only
./load-test.sh staging api

# Run with custom duration and users
./load-test.sh staging all -d 120 -u 50

# Run production tests (use with caution!)
./load-test.sh production all -u 10
```

### Manual Testing with wrk

```bash
# API health endpoint
wrk -t4 -c100 -d30s https://api.knbiosciences.in/health

# Products endpoint
wrk -t4 -c100 -d30s https://api.knbiosciences.in/api/products

# Homepage
wrk -t4 -c100 -d30s https://knbiosciences.in
```

---

## Performance Monitoring

### Real-Time Dashboards

#### GCP Cloud Monitoring Dashboard

Create dashboard with these widgets:

1. **API Request Rate**
   - Metric: `cloud_run.googleapis.com/request_count`
   - Aggregation: Rate (1m)
   - Group by: service_name

2. **API Latency (P95, P99)**
   - Metric: `cloud_run.googleapis.com/request_latencies`
   - Aggregation: Percentile 95, 99
   - Group by: service_name

3. **Error Rate**
   - Metric: `cloud_run.googleapis.com/request_count`
   - Filter: response_code >= 500
   - Aggregation: Rate (1m)

4. **Instance Count**
   - Metric: `cloud_run.googleapis.com/container/instance_count`
   - Aggregation: Max

5. **Database Connections**
   - Custom metric from Supabase
   - Aggregation: Average

#### Sentry Dashboard

1. **Error Volume**: Errors per hour
2. **Error Rate**: Errors per 1000 events
3. **P95 Latency**: By transaction
4. **Apdex Score**: Application performance score

### Alert Configuration

#### High Error Rate Alert

```yaml
Alert: API High Error Rate
Condition: error_rate > 5% for 5 minutes
Severity: Critical
Channels: Slack, Email, PagerDuty
Runbook: PRODUCTION_RUNBOOK.md
```

#### High Latency Alert

```yaml
Alert: API High Latency
Condition: p95_latency > 2000ms for 5 minutes
Severity: Warning
Channels: Slack, Email
Runbook: PRODUCTION_RUNBOOK.md
```

#### Low Throughput Alert

```yaml
Alert: Low Throughput
Condition: request_rate < 100/min for 10 minutes
Severity: Warning
Channels: Slack
```

---

## Performance Optimization

### API Optimizations

#### 1. Database Query Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Use EXPLAIN ANALYZE for slow queries
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = $1;
```

#### 2. Caching Strategy

```typescript
// Redis caching for frequently accessed data
async function getCachedProducts(categoryId: string) {
  const cacheKey = `products:${categoryId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const products = await db.products.findMany({ where: { categoryId } });
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(products));
  
  return products;
}
```

#### 3. Response Compression

```typescript
// Enable gzip compression in NestJS
app.use(compression());
```

### Frontend Optimizations

#### 1. Image Optimization

```nextjs
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={400}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### 2. Code Splitting

```nextjs
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

#### 3. Bundle Optimization

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
        },
      };
    }
    return config;
  },
};
```

---

## Performance Test Reports

### Report Template

```markdown
# Performance Test Report

**Test Date**: YYYY-MM-DD
**Environment**: Staging/Production
**Test Type**: Light/Standard/Peak/Stress

## Executive Summary

- Overall Status: PASS/FAIL
- Key Findings: ...
- Recommendations: ...

## Test Configuration

- Virtual Users: X
- Duration: X minutes
- Ramp-up: X minutes

## Results

### API Performance

| Endpoint | P50 | P95 | P99 | Error Rate |
|----------|-----|-----|-----|------------|
| GET /health | 50ms | 100ms | 150ms | 0% |
| GET /products | 200ms | 350ms | 500ms | 0.1% |
| POST /orders | 300ms | 500ms | 700ms | 0.2% |

### Frontend Performance

| Page | LCP | FID | CLS | FCP |
|------|-----|-----|-----|-----|
| Homepage | 1.8s | 80ms | 0.05 | 1.2s |
| Product List | 2.1s | 90ms | 0.08 | 1.5s |
| Product Detail | 1.9s | 85ms | 0.06 | 1.3s |

## Bottlenecks Identified

1. Slow query in products endpoint (avg 400ms)
2. Missing index on orders table
3. Large bundle size on mobile

## Recommendations

1. Add database index on products.category_id
2. Implement Redis caching for product list
3. Enable code splitting for mobile

## Next Steps

- [ ] Implement caching layer
- [ ] Optimize slow queries
- [ ] Re-test after optimizations
```

---

## Continuous Performance Testing

### CI/CD Integration

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  performance:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz | tar xz
          sudo cp k6-v0.45.0-linux-amd64/k6 /usr/local/bin/k6
      
      - name: Run performance tests
        run: |
          cd test/load-testing
          k6 run --vus 10 --duration 2m k6-script.js
        env:
          STAGE: staging
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: k6-results
          path: test-results/
```

### Performance Budget

```json
// package.json
{
  "performance": {
    "budget": {
      "api": {
        "p95_latency": 500,
        "error_rate": 0.1,
        "throughput_min": 100
      },
      "frontend": {
        "lcp": 2500,
        "fid": 100,
        "cls": 0.1,
        "bundle_size": 300000
      }
    }
  }
}
```

---

## Troubleshooting Guide

### High Latency

**Symptoms**: P95 > 1000ms

**Diagnosis**:
```bash
# Check slow queries
SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check Cloud Run metrics
gcloud run services describe kn-api --format 'value(status.conditions)'
```

**Solutions**:
1. Add database indexes
2. Enable caching
3. Scale Cloud Run instances
4. Optimize slow queries

### High Error Rate

**Symptoms**: Error rate > 1%

**Diagnosis**:
```bash
# Check error logs
gcloud run services logs read kn-api --severity=ERROR --limit 50

# Check Sentry dashboard
https://sentry.io/organizations/kn-biosciences/issues/
```

**Solutions**:
1. Review error logs
2. Check external service status
3. Verify database connections
4. Check memory/CPU limits

### Low Throughput

**Symptoms**: < 500 req/s

**Diagnosis**:
```bash
# Check instance count
gcloud run services describe kn-api --format 'value(status.latestCreatedRevisionName)'

# Check concurrency settings
gcloud run services describe kn-api --format 'value(spec.template.spec.containers[0].resources)'
```

**Solutions**:
1. Increase max instances
2. Adjust concurrency settings
3. Optimize request handling
4. Add caching layer

---

## Appendix

### A. Load Testing Checklist

**Pre-Test**:
- [ ] Staging environment ready
- [ ] Test data loaded
- [ ] Monitoring dashboards configured
- [ ] Alert thresholds set
- [ ] Team notified

**During Test**:
- [ ] Monitor error rates
- [ ] Track latency metrics
- [ ] Watch database performance
- [ ] Check auto-scaling
- [ ] Document anomalies

**Post-Test**:
- [ ] Collect results
- [ ] Generate report
- [ ] Identify bottlenecks
- [ ] Create optimization tasks
- [ ] Schedule re-test

### B. Performance Testing Commands

```bash
# Quick health check
curl -w "@curl-format.txt" -o /dev/null -s https://api.knbiosciences.in/health

# Detailed performance test
ab -n 1000 -c 100 https://api.knbiosciences.in/health

# Continuous monitoring
watch -n 5 'curl -s https://api.knbiosciences.in/health | jq .'
```

### C. Useful SQL Queries

```sql
-- Slow queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Connection count
SELECT datname, count(*) 
FROM pg_stat_activity 
GROUP BY datname;
```

---

**End of Performance Validation Plan**

For questions or updates, contact: devops@knbiosciences.in
