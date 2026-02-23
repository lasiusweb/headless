# Infrastructure Documentation

## Overview

This document provides comprehensive documentation for the KN Biosciences cloud infrastructure on Google Cloud Platform (GCP).

**Cloud Provider**: Google Cloud Platform (GCP)  
**Region**: us-central1 (Iowa, USA)  
**Version**: 2.0.0  
**Last Updated**: 2026-02-23

---

## Architecture Diagram

```
                                    ┌─────────────────────────────────────┐
                                    │         Cloudflare DNS              │
                                    │  (DNS Management & CDN)             │
                                    └─────────────────┬───────────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────────────────────────┐
                    │                                 │                                 │
        ┌───────────▼───────────┐         ┌──────────▼──────────┐         ┌───────────▼───────────┐
        │   Cloud Run (Landing) │         │  Cloud Run (B2B)    │         │  Cloud Run (B2C)      │
        │   knbiosciences.in    │         │  www.knbiosciences  │         │  agriculture.knbio... │
        │   Port: 443           │         │  Port: 443          │         │  Port: 443            │
        └───────────┬───────────┘         └──────────┬──────────┘         └───────────┬───────────┘
                    │                                 │                                 │
                    └─────────────────────────────────┼─────────────────────────────────┘
                                                      │
                                        ┌─────────────▼──────────────┐
                                        │   Cloud Load Balancer      │
                                        │   (HTTPS Termination)      │
                                        └─────────────┬──────────────┘
                                                      │
                                        ┌─────────────▼──────────────┐
                                        │   Cloud Run (API)          │
                                        │   api.knbiosciences.in     │
                                        │   Port: 8080               │
                                        └─────────────┬──────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────────────────────────┐
                    │                                 │                                 │
        ┌───────────▼───────────┐         ┌──────────▼──────────┐         ┌───────────▼───────────┐
        │   Supabase            │         │   Memorystore       │         │   Cloud Storage       │
        │   (PostgreSQL + Auth) │         │   (Redis Cache)     │         │   (Static Assets)     │
        └───────────────────────┘         └─────────────────────┘         └───────────────────────┘
```

---

## Services

### 1. Compute Services

#### Cloud Run

| Service | Name | Region | Min Instances | Max Instances | Memory | CPU |
|---------|------|--------|---------------|---------------|--------|-----|
| Landing Page | kn-landing | us-central1 | 1 | 10 | 512 MiB | 1 |
| B2B Portal | kn-b2b | us-central1 | 2 | 20 | 1 GiB | 2 |
| B2C Portal | kn-b2c | us-central1 | 2 | 20 | 1 GiB | 2 |
| Admin Dashboard | kn-admin | us-central1 | 1 | 10 | 512 MiB | 1 |
| API | kn-api | us-central1 | 2 | 50 | 2 GiB | 2 |

**Configuration**:
```yaml
# Landing Page
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: kn-landing
  namespace: kn-biosciences
spec:
  template:
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/kn-landing:latest
        ports:
        - containerPort: 3000
        resources:
          limits:
            memory: 512Mi
            cpu: '1'
      minScale: 1
      maxScale: 10
```

**Scaling Configuration**:
- **CPU Target**: 80%
- **Scale Down Delay**: 300s
- **Request Timeout**: 300s
- **Max Concurrent Requests**: 80

---

### 2. Database Services

#### Supabase (Managed PostgreSQL)

| Configuration | Value |
|---------------|-------|
| Version | PostgreSQL 15 |
| Region | us-central1 |
| Compute Size | Pro Plan (4 vCPU, 8 GB RAM) |
| Storage | 100 GB SSD |
| Connection Pool | Enabled (PgBouncer) |
| Max Connections | 200 |
| Backup Retention | 30 days |

**Connection String**:
```
postgresql://postgres:[PASSWORD]@db.PROJECT_ID.supabase.co:5432/postgres
```

**Connection Pooling** (PgBouncer):
```
Host: aws-0-[REGION].pooler.supabase.com
Port: 5432
Database: postgres
```

---

#### Memorystore (Redis)

| Configuration | Value |
|---------------|-------|
| Tier | Basic |
| Memory Size | 1 GB |
| Region | us-central1 |
| Zone | us-central1-a |
| Redis Version | Redis 7.0 |

**Use Cases**:
- API response caching
- Session storage
- Rate limiting
- Real-time data

**Connection**:
```bash
redis-cli -h [REDIS_IP] -p 6379
```

---

### 3. Storage Services

#### Cloud Storage

| Bucket | Purpose | Storage Class | Lifecycle |
|--------|---------|---------------|-----------|
| kn-biosciences-products | Product images | Standard | Delete after 365 days |
| kn-biosciences-invoices | Invoice PDFs | Standard | Delete after 2555 days (7 years) |
| kn-biosciences-backups | Database backups | Nearline | Delete after 90 days |
| kn-biosciences-static | Static assets | Standard | No expiration |

**Bucket Configuration**:
```json
{
  "name": "kn-biosciences-products",
  "location": "US-CENTRAL1",
  "storageClass": "STANDARD",
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 365}
      }
    ]
  },
  "cors": [
    {
      "origin": ["https://www.knbiosciences.in", "https://agriculture.knbiosciences.in"],
      "method": ["GET", "HEAD"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

---

### 4. Network Services

#### Cloud Load Balancing

**Configuration**:
- **Type**: Global HTTP(S) Load Balancer
- **SSL Certificate**: Managed certificate
- **Backend Services**: Cloud Run services
- **Health Check**: HTTP /health

**URL Map**:
```
knbiosciences.in/*           → kn-landing
www.knbiosciences.in/*       → kn-b2b
agriculture.knbiosciences.in → kn-b2c
admin.knbiosciences.in       → kn-admin
api.knbiosciences.in/*       → kn-api
```

#### Cloud DNS

| Record | Type | Value | TTL |
|--------|------|-------|-----|
| knbiosciences.in | A | 35.186.224.25 | 300 |
| www.knbiosciences.in | CNAME | knbiosciences.in | 300 |
| agriculture.knbiosciences.in | CNAME | knbiosciences.in | 300 |
| admin.knbiosciences.in | CNAME | knbiosciences.in | 300 |
| api.knbiosciences.in | CNAME | knbiosciences.in | 300 |

---

### 5. Security Services

#### Secret Manager

| Secret | Purpose | Rotation |
|--------|---------|----------|
| supabase-url | Supabase project URL | Manual |
| supabase-key | Supabase service role key | Quarterly |
| jwt-secret | JWT signing secret | Quarterly |
| payment-gateway-key | Payment gateway credentials | Quarterly |
| zoho-client-secret | Zoho OAuth secret | Quarterly |

**Access**:
```bash
gcloud secrets versions access latest --secret=supabase-key
```

#### IAM Roles

| Service Account | Roles | Purpose |
|-----------------|-------|---------|
| kn-api-sa@PROJECT_ID.iam.gserviceaccount.com | Cloud Run Invoker, Secret Manager Accessor, Storage Object Viewer | API service account |
| kn-frontend-sa@PROJECT_ID.iam.gserviceaccount.com | Cloud Run Invoker, Storage Object Viewer | Frontend service account |

---

## Cost Estimation

### Monthly Costs (Estimated)

| Service | Configuration | Monthly Cost (USD) |
|---------|---------------|-------------------|
| Cloud Run (API) | 2 GiB, 2 CPU, 2 instances | $60 |
| Cloud Run (Frontend) | 1 GiB, 1 CPU, 6 instances | $90 |
| Supabase | Pro Plan | $25 |
| Memorystore | 1 GB | $15 |
| Cloud Storage | 10 GB | $2 |
| Cloud Load Balancer | 1 LB | $20 |
| Cloud DNS | 1M queries | $0.20 |
| Secret Manager | 10 secrets | $0.60 |
| **Total** | | **~$213/month** |

---

## Deployment Procedures

### Prerequisites

1. GCP project created
2. Billing enabled
3. Required APIs enabled:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API
   - Secret Manager API
   - Memorystore API

### Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable redis.googleapis.com
```

### Create Service Accounts

```bash
# API Service Account
gcloud iam service-accounts create kn-api-sa \
  --display-name "KN Biosciences API Service Account"

# Frontend Service Account
gcloud iam service-accounts create kn-frontend-sa \
  --display-name "KN Biosciences Frontend Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:kn-api-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:kn-api-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Create Secrets

```bash
# Supabase URL
echo -n "https://PROJECT_ID.supabase.co" | gcloud secrets create supabase-url --data-file=-

# Supabase Key
echo -n "YOUR_SUPABASE_KEY" | gcloud secrets create supabase-key --data-file=-

# JWT Secret
openssl rand -base64 32 | gcloud secrets create jwt-secret --data-file=-
```

### Deploy to Cloud Run

```bash
# Deploy API
gcloud run deploy kn-api \
  --image gcr.io/PROJECT_ID/kn-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account kn-api-sa@PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars NODE_ENV=production \
  --set-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-key:latest,JWT_SECRET=jwt-secret:latest

# Deploy Frontend
gcloud run deploy kn-landing \
  --image gcr.io/PROJECT_ID/kn-landing:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Monitoring & Logging

### Cloud Monitoring Dashboards

Create dashboard with these widgets:
1. API Request Count (1m intervals)
2. API Latency (P50, P95, P99)
3. Error Rate (%)
4. Cloud Run Instance Count
5. Database Connection Count
6. Cache Hit Rate

### Alert Policies

```yaml
# High Error Rate
alertPolicy:
  displayName: "High Error Rate"
  conditions:
  - displayName: "Error rate > 5%"
    conditionThreshold:
      filter: 'resource.type="cloud_run_revision" AND metric.type="cloud_run.googleapis.com/request_count" AND metric.labels.response_code=~"5.."'
      comparison: COMPARISON_GT
      thresholdValue: 0.05
      duration: 300s
  notificationChannels:
  - "projects/PROJECT_ID/notificationChannels/CHANNEL_ID"
```

### Log-Based Metrics

```bash
# Create log-based metric for API errors
gcloud logging metrics create api-error-rate \
  --description="Rate of 5xx errors in API" \
  --log-filter='resource.type="cloud_run_revision" AND httpRequest.status>=500'
```

---

## Disaster Recovery

### Backup Strategy

| Resource | Backup Method | Frequency | Retention |
|----------|---------------|-----------|-----------|
| Database | Supabase automatic backups | Continuous | 30 days |
| Cloud Storage | Versioning + lifecycle rules | N/A | 90 days |
| Secrets | Secret Manager versioning | Per change | 10 versions |
| Code | GitHub | Per commit | Permanent |

### Recovery Procedures

#### Database Point-in-Time Recovery

1. Go to Supabase Dashboard
2. Select project
3. Click "Restore"
4. Choose recovery point
5. Confirm restoration

#### Service Rollback

```bash
# List revisions
gcloud run services describe kn-api --format='value(status.traffic)'

# Rollback to previous revision
gcloud run services update-traffic kn-api \
  --to-revisions=REVISION_ID=100 \
  --region us-central1
```

---

## Security Best Practices

### Network Security

- ✅ All services use HTTPS
- ✅ Cloud Run behind load balancer
- ✅ VPC Service Controls enabled
- ✅ Private service connection for Redis

### Identity & Access

- ✅ Service accounts for each service
- ✅ Principle of least privilege
- ✅ Secret Manager for credentials
- ✅ Regular credential rotation

### Data Protection

- ✅ Encryption at rest (default)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Database backups enabled
- ✅ Storage versioning enabled

---

## Environment Variables

### API Environment

```bash
# Server
NODE_ENV=production
PORT=8080

# Supabase
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SECRET]

# JWT
JWT_SECRET=[SECRET]

# Redis
REDIS_HOST=[REDIS_IP]
REDIS_PORT=6379

# CORS
CORS_ORIGIN=https://knbiosciences.in,https://www.knbiosciences.in,https://agriculture.knbiosciences.in

# External Services
ZOHO_CLIENT_ID=[SECRET]
ZOHO_CLIENT_SECRET=[SECRET]
EASEBUZZ_SALT=[SECRET]
DELHIVERY_API_KEY=[SECRET]
```

---

## Support

For infrastructure issues:
- DevOps Team: devops@knbiosciences.in
- GCP Console: https://console.cloud.google.com
- Supabase Dashboard: https://app.supabase.com

---

**Version**: 2.0.0  
**Last Updated**: 2026-02-23
