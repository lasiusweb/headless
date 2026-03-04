# GCP Infrastructure Deployment Guide

This directory contains infrastructure-as-code and deployment scripts for KN Biosciences platform on Google Cloud Platform (GCP).

## Directory Structure

```
infra/gcp/
├── terraform/              # Terraform infrastructure definitions
│   ├── main.tf            # Main infrastructure resources
│   ├── variables.tf       # Variable definitions
│   └── outputs.tf         # Output values
├── scripts/               # Deployment scripts
│   ├── deploy-api.sh     # API deployment script
│   └── deploy-web.sh     # Web applications deployment script
└── README.md             # This file
```

## Prerequisites

### Required Tools

1. **gcloud CLI** (v450.0.0 or later)
   ```bash
   # Install on macOS
   brew install --cask google-cloud-sdk
   
   # Install on Linux
   curl https://sdk.cloud.google.com | bash
   
   # Install on Windows
   # Download from https://cloud.google.com/sdk/docs/install
   ```

2. **Terraform** (v1.5.0 or later)
   ```bash
   # Install on macOS
   brew install terraform
   
   # Install on Linux
   wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
   unzip terraform_1.5.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

3. **Docker** (v20.10 or later)
   ```bash
   # Install from https://docs.docker.com/get-docker/
   ```

4. **Node.js** (v18 or later)
   ```bash
   # Install using nvm
   nvm install 18
   nvm use 18
   ```

### GCP Setup

1. **Create a GCP Project**
   ```bash
   gcloud projects create kn-biosciences-PLATFORM_ID \
     --name="KN Biosciences" \
     --set-as-default
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable \
     run.googleapis.com \
     cloudbuild.googleapis.com \
     containerregistry.googleapis.com \
     secretmanager.googleapis.com \
     storage-api.googleapis.com \
     monitoring.googleapis.com \
     logging.googleapis.com \
     domains.googleapis.com
   ```

3. **Create Service Account for Deployment**
   ```bash
   gcloud iam service-accounts create terraform-deployer \
     --display-name="Terraform Deployer"
   
   gcloud projects add-iam-policy-binding kn-biosciences \
     --member="serviceAccount:terraform-deployer@kn-biosciences.iam.gserviceaccount.com" \
     --role="roles/editor"
   
   # Generate key
   gcloud iam service-accounts keys create ~/terraform-key.json \
     --iam-account=terraform-deployer@kn-biosciences.iam.gserviceaccount.com
   
   export GOOGLE_APPLICATION_CREDENTIALS=~/terraform-key.json
   ```

4. **Configure Container Registry**
   ```bash
   gcloud auth configure-docker
   ```

## Infrastructure Deployment (Terraform)

### Initialize Terraform

```bash
cd infra/gcp/terraform

terraform init \
  -backend-config="bucket=kn-biosciences-terraform-state" \
  -backend-config="prefix=terraform/production"
```

### Plan Infrastructure

```bash
terraform plan \
  -var="project_id=kn-biosciences" \
  -var="environment=production" \
  -var="region=us-central1" \
  -out=tfplan
```

### Apply Infrastructure

```bash
terraform apply tfplan
```

### Destroy Infrastructure (Cleanup)

```bash
terraform destroy \
  -var="project_id=kn-biosciences" \
  -var="environment=production"
```

## Application Deployment

### Environment Variables

Create a `.env.gcp` file in the project root:

```bash
# GCP Configuration
GCP_PRODUCTION_PROJECT_ID=kn-biosciences
GCP_STAGING_PROJECT_ID=kn-biosciences-staging
GCP_PRODUCTION_SERVICE_ACCOUNT=kn-prod-sa@kn-biosciences.iam.gserviceaccount.com
GCP_STAGING_SERVICE_ACCOUNT=kn-staging-sa@kn-biosciences-staging.iam.gserviceaccount.com

# Authentication
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# GitHub SHA (for deployment tracking)
GITHUB_SHA=$(git rev-parse HEAD)
```

### Deploy API

```bash
# Staging
cd infra/gcp/scripts
./deploy-api.sh staging

# Production
./deploy-api.sh production
```

### Deploy Web Applications

```bash
# Deploy all applications to staging
./deploy-web.sh staging all

# Deploy specific application to production
./deploy-web.sh production landing
./deploy-web.sh production www
./deploy-web.sh production agriculture
./deploy-web.sh production admin
```

### Deploy Individual Services

```bash
# Deploy only B2B portal
./deploy-web.sh production www

# Deploy only B2C portal
./deploy-web.sh production agriculture
```

## Manual Deployment (Alternative)

### Build and Deploy API

```bash
# Build Docker image
docker build -f apps/api/Dockerfile \
  -t gcr.io/kn-biosciences/kn-api:production-latest .

# Push to Container Registry
docker push gcr.io/kn-biosciences/kn-api:production-latest

# Deploy to Cloud Run
gcloud run deploy kn-api \
  --image gcr.io/kn-biosciences/kn-api:production-latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 2 \
  --max-instances 50 \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars NODE_ENV=production \
  --set-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-key:latest
```

### Build and Deploy Frontend

```bash
# Landing Page
docker build -f apps/web/apps/landing/Dockerfile \
  -t gcr.io/kn-biosciences/kn-landing:production-latest .

docker push gcr.io/kn-biosciences/kn-landing:production-latest

gcloud run deploy kn-landing \
  --image gcr.io/kn-biosciences/kn-landing:production-latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Monitoring & Verification

### Check Service Status

```bash
# List all Cloud Run services
gcloud run services list

# Describe specific service
gcloud run services describe kn-api --region us-central1
```

### View Logs

```bash
# Real-time logs
gcloud run services logs read kn-api --region us-central1

# Filter by severity
gcloud run services logs read kn-api \
  --region us-central1 \
  --severity=ERROR
```

### Health Checks

```bash
# Get service URL
API_URL=$(gcloud run services describe kn-api \
  --format 'value(status.url)' \
  --region us-central1)

# Test health endpoint
curl $API_URL/health
curl $API_URL/health/detailed
```

### Check Metrics

```bash
# View in Cloud Console
gcloud monitoring dashboards list

# Or open directly
open https://console.cloud.google.com/monitoring/dashboards
```

## Secret Management

### Create Secrets

```bash
# Supabase URL
echo -n "https://PROJECT_ID.supabase.co" | \
  gcloud secrets create supabase-url --data-file=-

# Supabase Key
echo -n "YOUR_SUPABASE_KEY" | \
  gcloud secrets create supabase-key --data-file=-

# JWT Secret
openssl rand -base64 32 | \
  gcloud secrets create jwt-secret --data-file=-

# Payment Gateway
echo -n "YOUR_EASEBUZZ_SALT" | \
  gcloud secrets create easebuzz-salt --data-file=-
```

### Update Secrets

```bash
# Add new version
echo -n "NEW_SECRET_VALUE" | \
  gcloud secrets versions access latest --secret=SECRET_NAME

# List versions
gcloud secrets versions list SECRET_NAME
```

### Access Secrets

```bash
# Access latest version
gcloud secrets versions access latest --secret=supabase-url

# Access specific version
gcloud secrets versions access 1 --secret=supabase-url
```

## Domain Configuration

### Map Custom Domain

```bash
# Map domain to Cloud Run service
gcloud run domain-mappings create \
  --service kn-api \
  --domain api.knbiosciences.in \
  --region us-central1
```

### Verify SSL Certificate

```bash
# Check certificate status
gcloud beta run domain-mappings describe \
  --domain api.knbiosciences.in \
  --region us-central1
```

## Cost Optimization

### Recommended Settings

1. **Set appropriate min/max instances**
   - Production API: min=2, max=50
   - Production Frontend: min=2, max=20
   - Staging: min=1, max=5

2. **Use Cloud Run concurrency**
   - Default: 80 concurrent requests
   - Adjust based on memory/CPU needs

3. **Enable auto-scaling**
   - Scale to zero for staging (optional)
   - Set CPU allocation to "CPU is only allocated during request processing"

4. **Use committed use discounts**
   - For predictable workloads
   - 1 or 3 year commitments

### Estimated Monthly Costs

| Service | Configuration | Cost (USD) |
|---------|---------------|------------|
| Cloud Run API | 2Gi, 2 CPU, 2-50 instances | $60-150 |
| Cloud Run Frontend | 1Gi, 1 CPU, 4-40 instances | $60-120 |
| Cloud Storage | 10 GB | $2 |
| Secret Manager | 10 secrets | $0.60 |
| Cloud Monitoring | Standard | Free |
| **Total** | | **~$123-273/month** |

## Troubleshooting

### Common Issues

#### Deployment Fails with "Permission Denied"

```bash
# Check service account permissions
gcloud projects get-iam-policy PROJECT_ID

# Grant required permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/run.admin"
```

#### Image Pull Errors

```bash
# Verify image exists
gcloud container images list-tags gcr.io/PROJECT_ID/kn-api

# Check service account has artifact registry reader role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/artifactregistry.reader"
```

#### Health Check Fails

```bash
# Check service logs
gcloud run services logs read kn-api --limit 50

# Verify environment variables
gcloud run services describe kn-api \
  --format 'value(spec.template.spec.containers[0].env)'
```

### Rollback Deployment

```bash
# List revisions
gcloud run revisions list --service kn-api

# Rollback to previous revision
gcloud run services update-traffic kn-api \
  --to-revisions=REVISION_ID=100 \
  --region us-central1
```

## Security Best Practices

1. **Use service accounts** for each service
2. **Store secrets in Secret Manager**, not environment variables
3. **Enable VPC Service Controls** for sensitive data
4. **Use private Cloud Run** for internal services
5. **Implement IAM least privilege**
6. **Enable Cloud Audit Logs**
7. **Rotate secrets regularly** (quarterly recommended)
8. **Use HTTPS everywhere**
9. **Enable security scanner**
10. **Monitor with Security Command Center**

## CI/CD Integration

### GitHub Actions

The `.github/workflows/ci-cd.yml` file contains the complete CI/CD pipeline that:

1. Runs tests on every push
2. Builds Docker images
3. Deploys to staging on `develop` branch
4. Deploys to production on `main` branch (with approval)
5. Runs post-deployment health checks

### Manual Trigger

```bash
# Trigger deployment via gcloud
gcloud run jobs execute deployment-job \
  --region us-central1 \
  --env ENVIRONMENT=production
```

## Support

For issues or questions:
- **DevOps Team**: devops@knbiosciences.in
- **Documentation**: See `PRODUCTION_RUNBOOK.md`
- **GCP Console**: https://console.cloud.google.com

---

**Last Updated**: 2026-03-04
**Version**: 1.0.0
