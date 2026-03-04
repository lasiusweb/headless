# Production Deployment Guide - KN Biosciences Platform

## Document Information

- **Version**: 1.0.0
- **Date**: 2026-03-04
- **Owner**: DevOps Team
- **Status**: Ready for Production

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Infrastructure Deployment](#infrastructure-deployment)
5. [Application Deployment](#application-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`pnpm test`)
- [ ] E2E tests passing (`pnpm test:e2e`)
- [ ] Code coverage > 80%
- [ ] No linting errors (`pnpm lint`)
- [ ] Type checking passes (`pnpm exec tsc --noEmit`)
- [ ] Security scan completed (`npm audit`)

### Documentation

- [ ] README.md updated
- [ ] API documentation current (Swagger)
- [ ] Environment variables documented
- [ ] Runbook updated
- [ ] CHANGELOG.md updated

### Secrets & Configuration

- [ ] All secrets created in Secret Manager
- [ ] Environment variables validated
- [ ] CORS origins configured
- [ ] Database connection strings set
- [ ] Payment gateway credentials configured

### Infrastructure

- [ ] GCP project created
- [ ] Required APIs enabled
- [ ] Service accounts created
- [ ] DNS records configured
- [ ] SSL certificates provisioned

### Monitoring

- [ ] Sentry DSN configured
- [ ] Cloud Monitoring dashboards created
- [ ] Alert policies configured
- [ ] Notification channels set up
- [ ] Uptime checks configured

---

## Environment Setup

### 1. GCP Project Setup

```bash
# Set project ID
export PROJECT_ID="kn-biosciences"
export REGION="us-central1"

# Create project (if not exists)
gcloud projects create $PROJECT_ID --name="KN Biosciences"

# Set as default
gcloud config set project $PROJECT_ID

# Link billing account
gcloud beta billing projects link $PROJECT_ID \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage-api.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  domains.googleapis.com \
  sqladmin.googleapis.com
```

### 3. Create Service Accounts

```bash
# API Service Account
gcloud iam service-accounts create kn-api-sa \
  --display-name="KN Biosciences API Service Account" \
  --project=$PROJECT_ID

# Frontend Service Account
gcloud iam service-accounts create kn-frontend-sa \
  --display-name="KN Biosciences Frontend Service Account" \
  --project=$PROJECT_ID

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:kn-api-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:kn-api-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:kn-api-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

### 4. Create Secrets

```bash
# Supabase configuration
echo -n "https://YOUR_PROJECT.supabase.co" | \
  gcloud secrets create supabase-url --data-file=-

echo -n "YOUR_SUPABASE_SERVICE_ROLE_KEY" | \
  gcloud secrets create supabase-key --data-file=-

# JWT Secret (generate secure random string)
openssl rand -base64 32 | \
  gcloud secrets create jwt-secret --data-file=-

# Payment Gateway
echo -n "YOUR_EASEBUZZ_SALT" | \
  gcloud secrets create easebuzz-salt --data-file=-

echo -n "YOUR_DELHIVERY_API_KEY" | \
  gcloud secrets create delhivery-api-key --data-file=-

# Zoho Integration
echo -n "YOUR_ZOHO_CLIENT_ID" | \
  gcloud secrets create zoho-client-id --data-file=-

echo -n "YOUR_ZOHO_CLIENT_SECRET" | \
  gcloud secrets create zoho-client-secret --data-file=-

# Notifications
echo -n "YOUR_SENDGRID_API_KEY" | \
  gcloud secrets create sendgrid-api-key --data-file=-

# Sentry
echo -n "https://YOUR_SENTRY_DSN" | \
  gcloud secrets create sentry-dsn --data-file=-

# Redis (if using Memorystore)
echo -n "YOUR_REDIS_HOST" | \
  gcloud secrets create redis-host --data-file=-
```

---

## Database Deployment

### 1. Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Select region closest to your users (us-central-1 for GCP us-central1)
   - Note your project URL and keys

2. **Run Schema Migration**

```bash
# Connect to Supabase SQL editor
# URL: https://YOUR_PROJECT.supabase.co/project/_/sql

# Copy and paste the contents of:
# infra/db/migrations/001_production_schema.sql
```

3. **Configure Row Level Security (RLS)**

```bash
# In Supabase Dashboard:
# Authentication > Policies
# Enable RLS for all tables
# Add policies as defined in schema
```

4. **Seed Initial Data**

```bash
# Run seed script
# infra/db/seed.sql
```

### 2. Database Connection Testing

```bash
# Test connection from local
psql "postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Verify tables created
\dt

# Check row count
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
```

---

## Infrastructure Deployment

### Option 1: Terraform (Recommended)

```bash
# Navigate to Terraform directory
cd infra/gcp/terraform

# Initialize Terraform
terraform init \
  -backend-config="bucket=kn-biosciences-terraform-state" \
  -backend-config="prefix=terraform/production"

# Create backend bucket if not exists
gsutil mb -p $PROJECT_ID gs://kn-biosciences-terraform-state

# Plan infrastructure
terraform plan \
  -var="project_id=$PROJECT_ID" \
  -var="environment=production" \
  -var="region=$REGION" \
  -out=tfplan

# Apply infrastructure
terraform apply tfplan

# Save outputs
terraform output > ../outputs.txt
```

### Option 2: Manual Deployment

```bash
# Deploy using gcloud
# See infra/gcp/scripts/deploy-api.sh
```

---

## Application Deployment

### 1. Build Applications

```bash
# Install dependencies
pnpm install

# Build API
cd apps/api
pnpm build

# Build Web Applications
cd apps/web
pnpm build
```

### 2. Deploy API

```bash
# Navigate to scripts directory
cd infra/gcp/scripts

# Make script executable
chmod +x deploy-api.sh

# Deploy to production
export GCP_PRODUCTION_PROJECT_ID=$PROJECT_ID
export GCP_PRODUCTION_SERVICE_ACCOUNT=kn-api-sa@$PROJECT_ID.iam.gserviceaccount.com
export GITHUB_SHA=$(git rev-parse HEAD)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

./deploy-api.sh production
```

### 3. Deploy Web Applications

```bash
# Deploy all applications
./deploy-web.sh production all

# Or deploy individually
./deploy-web.sh production landing
./deploy-web.sh production www
./deploy-web.sh production agriculture
./deploy-web.sh production admin
```

### 4. Configure Custom Domains

```bash
# Map domains to Cloud Run services
gcloud run domain-mappings create \
  --service kn-api \
  --domain api.knbiosciences.in \
  --region $REGION

gcloud run domain-mappings create \
  --service kn-landing \
  --domain knbiosciences.in \
  --region $REGION

gcloud run domain-mappings create \
  --service kn-b2b \
  --domain www.knbiosciences.in \
  --region $REGION

gcloud run domain-mappings create \
  --service kn-b2c \
  --domain agriculture.knbiosciences.in \
  --region $REGION
```

### 5. Configure DNS

Add the following DNS records in your DNS provider:

```
Type    Name                        Value
----    ----                        -----
A       knbiosciences.in            35.186.224.25 (GCP Load Balancer IP)
CNAME   www                         knbiosciences.in
CNAME   agriculture                 knbiosciences.in
CNAME   admin                       knbiosciences.in
CNAME   api                         knbiosciences.in
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# API Health
curl https://api.knbiosciences.in/health
curl https://api.knbiosciences.in/health/detailed

# Landing Page
curl https://knbiosciences.in

# B2B Portal
curl https://www.knbiosciences.in

# B2C Portal
curl https://agriculture.knbiosciences.in
```

### 2. Smoke Tests

```bash
# Test product listing
curl https://api.knbiosciences.in/api/products | jq

# Test categories
curl https://api.knbiosciences.in/api/categories | jq

# Test authentication (if public registration enabled)
curl -X POST https://api.knbiosciences.in/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### 3. Performance Tests

```bash
# Run load tests
cd test/load-testing
./load-test.sh production all -u 10 -d 60

# Check response times
wrk -t4 -c50 -d30s https://api.knbiosciences.in/health
```

### 4. Monitoring Verification

1. **Check Cloud Monitoring Dashboard**
   - Open https://console.cloud.google.com/monitoring
   - Verify all services are reporting metrics
   - Check for any errors or warnings

2. **Check Sentry**
   - Open https://sentry.io
   - Verify events are being captured
   - Test error reporting

3. **Check Uptime Checks**
   - Open https://console.cloud.google.com/monitoring/uptime
   - Verify all checks are passing

### 5. Functional Testing

**B2B Portal (www.knbiosciences.in)**:
- [ ] User registration works
- [ ] Login works
- [ ] Product browsing works
- [ ] Cart operations work
- [ ] Order creation works
- [ ] Payment integration works

**B2C Portal (agriculture.knbiosciences.in)**:
- [ ] User registration works
- [ ] Login works
- [ ] Product browsing works
- [ ] Cart operations work
- [ ] Order creation works
- [ ] Payment integration works

**Admin Dashboard (admin.knbiosciences.in)**:
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] User management works
- [ ] Product management works
- [ ] Order management works

---

## Rollback Procedures

### Quick Rollback (Cloud Run)

```bash
# List revisions
gcloud run revisions list --service kn-api --region $REGION

# Rollback to previous revision
gcloud run services update-traffic kn-api \
  --to-revisions=PREVIOUS_REVISION_ID=100 \
  --region $REGION

# Verify rollback
gcloud run services describe kn-api --region $REGION
```

### Database Rollback

```bash
# Contact Supabase support for point-in-time recovery
# Or restore from backup

# Restore from SQL backup
psql "postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres" \
  < backup_YYYYMMDD.sql
```

### Complete Rollback

```bash
# 1. Rollback all services
./rollback.sh production all

# 2. Restore database from backup

# 3. Update DNS if needed

# 4. Notify stakeholders
```

---

## Troubleshooting

### Issue: Service Not Starting

**Symptoms**: Cloud Run service shows "Error" status

**Diagnosis**:
```bash
# Check logs
gcloud run services logs read kn-api --region $REGION --limit 50

# Check environment variables
gcloud run services describe kn-api --region $REGION
```

**Solutions**:
1. Verify all secrets exist in Secret Manager
2. Check environment variable values
3. Review application logs for errors
4. Verify database connectivity

### Issue: High Error Rate

**Symptoms**: Error rate > 5%

**Diagnosis**:
```bash
# Check Sentry dashboard
https://sentry.io/organizations/kn-biosciences/issues/

# Check error logs
gcloud run services logs read kn-api \
  --region $REGION \
  --severity=ERROR \
  --limit 100
```

**Solutions**:
1. Review error messages in Sentry
2. Check database connection pool
3. Verify external service status (payment gateway, shipping)
4. Scale up instances if needed

### Issue: High Latency

**Symptoms**: P95 > 1000ms

**Diagnosis**:
```bash
# Check slow queries in Supabase
# Dashboard > Database > Slow queries

# Check Cloud Run metrics
gcloud monitoring dashboards list
```

**Solutions**:
1. Add database indexes
2. Enable caching (Redis)
3. Optimize slow queries
4. Scale up Cloud Run instances

### Issue: Database Connection Errors

**Symptoms**: "too many connections" error

**Diagnosis**:
```bash
# Check connection count
psql "postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres" \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

**Solutions**:
1. Increase connection pool size in Supabase
2. Enable connection pooling (PgBouncer)
3. Fix connection leaks in code
4. Scale database instance

---

## Post-Deployment Tasks

### 1. Monitoring Setup

- [ ] Create Cloud Monitoring dashboard
- [ ] Configure alert policies
- [ ] Set up notification channels
- [ ] Create uptime checks
- [ ] Configure log-based metrics

### 2. Security Hardening

- [ ] Enable Cloud Armor (WAF)
- [ ] Configure rate limiting
- [ ] Enable VPC Service Controls
- [ ] Set up Security Command Center
- [ ] Schedule security scans

### 3. Backup Configuration

- [ ] Verify Supabase automatic backups
- [ ] Configure Cloud Storage versioning
- [ ] Test restore procedures
- [ ] Document backup schedule

### 4. Documentation

- [ ] Update architecture diagram
- [ ] Document deployment process
- [ ] Create runbook for operations team
- [ ] Update API documentation
- [ ] Create troubleshooting guide

### 5. Team Training

- [ ] Train operations team on monitoring
- [ ] Train support team on common issues
- [ ] Document escalation procedures
- [ ] Schedule post-deployment review

---

## Support Contacts

### Internal Teams

| Role | Contact | Availability |
|------|---------|--------------|
| DevOps | devops@knbiosciences.in | 24/7 |
| Engineering | engineering@knbiosciences.in | Business hours |
| On-Call | oncall@knbiosciences.in | 24/7 |

### External Services

| Service | Support URL | Emergency Contact |
|---------|-------------|-------------------|
| GCP | https://cloud.google.com/support | - |
| Supabase | https://supabase.com/support | support@supabase.com |
| Sentry | https://sentry.io/support | - |
| Payment Gateway | - | - |

---

## Deployment Timeline

### Typical Deployment Schedule

| Time | Activity |
|------|----------|
| T-7 days | Code freeze |
| T-5 days | Staging deployment |
| T-3 days | Load testing |
| T-2 days | Security audit |
| T-1 day | Final checks |
| T-0 | Production deployment |
| T+1 day | Monitoring & stabilization |
| T+7 days | Post-deployment review |

---

## Success Criteria

Deployment is considered successful when:

- [ ] All services deployed and running
- [ ] Health checks passing
- [ ] Error rate < 1%
- [ ] P95 latency < 500ms
- [ ] All smoke tests passing
- [ ] Monitoring active and alerting
- [ ] Team trained on operations

---

**End of Production Deployment Guide**

For questions or issues, contact: devops@knbiosciences.in
