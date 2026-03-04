#!/bin/bash

# GCP Production Deployment Script for KN Biosciences API
# Usage: ./deploy-api.sh [staging|production]

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-staging}"
REGION="us-central1"
SERVICE_NAME="kn-api"
IMAGE_NAME="kn-api"

# Load environment-specific configuration
if [ "$ENVIRONMENT" == "production" ]; then
    PROJECT_ID="${GCP_PRODUCTION_PROJECT_ID}"
    SERVICE_ACCOUNT="${GCP_PRODUCTION_SERVICE_ACCOUNT}"
    DOMAIN="api.knbiosciences.in"
    MIN_INSTANCES=2
    MAX_INSTANCES=50
    MEMORY="2Gi"
    CPU="2"
elif [ "$ENVIRONMENT" == "staging" ]; then
    PROJECT_ID="${GCP_STAGING_PROJECT_ID}"
    SERVICE_ACCOUNT="${GCP_STAGING_SERVICE_ACCOUNT}"
    DOMAIN="staging-api.knbiosciences.in"
    MIN_INSTANCES=1
    MAX_INSTANCES=10
    MEMORY="1Gi"
    CPU="1"
else
    echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'. Use 'staging' or 'production'.${NC}"
    exit 1
fi

# Validate required environment variables
validate_env() {
    local missing=()
    
    if [ -z "$PROJECT_ID" ]; then
        missing+=("GCP_PRODUCTION_PROJECT_ID or GCP_STAGING_PROJECT_ID")
    fi
    
    if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        missing+=("GOOGLE_APPLICATION_CREDENTIALS")
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required environment variables:${NC}"
        for var in "${missing[@]}"; do
            echo -e "${RED}  - $var${NC}"
        done
        exit 1
    fi
}

# Check if gcloud is installed
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
        echo "Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
}

# Check if docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: docker is not installed.${NC}"
        exit 1
    fi
}

# Build Docker image
build_image() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    
    cd "$PROJECT_ROOT"
    
    docker build \
        -f apps/api/Dockerfile \
        -t "gcr.io/$PROJECT_ID/$IMAGE_NAME:$ENVIRONMENT-$GITHUB_SHA" \
        -t "gcr.io/$PROJECT_ID/$IMAGE_NAME:$ENVIRONMENT-latest" \
        .
    
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
}

# Push Docker image to Container Registry
push_image() {
    echo -e "${YELLOW}Pushing Docker image to Container Registry...${NC}"
    
    docker push "gcr.io/$PROJECT_ID/$IMAGE_NAME:$ENVIRONMENT-$GITHUB_SHA"
    docker push "gcr.io/$PROJECT_ID/$IMAGE_NAME:$ENVIRONMENT-latest"
    
    echo -e "${GREEN}✓ Docker image pushed successfully${NC}"
}

# Deploy to Cloud Run
deploy_cloud_run() {
    echo -e "${YELLOW}Deploying to Cloud Run ($ENVIRONMENT)...${NC}"
    
    gcloud run deploy "$SERVICE_NAME" \
        --image "gcr.io/$PROJECT_ID/$IMAGE_NAME:$ENVIRONMENT-latest" \
        --platform managed \
        --region "$REGION" \
        --allow-unauthenticated \
        --service-account "$SERVICE_ACCOUNT" \
        --min-instances "$MIN_INSTANCES" \
        --max-instances "$MAX_INSTANCES" \
        --memory "$MEMORY" \
        --cpu "$CPU" \
        --timeout "300s" \
        --concurrency "80" \
        --set-env-vars \
            "NODE_ENV=$ENVIRONMENT",\
            "PORT=8080" \
        --set-secrets \
            "SUPABASE_URL=supabase-url:latest",\
            "SUPABASE_SERVICE_ROLE_KEY=supabase-key:latest",\
            "JWT_SECRET=jwt-secret:latest",\
            "EASEBUZZ_SALT=easebuzz-salt:latest",\
            "DELHIVERY_API_KEY=delhivery-api-key:latest",\
            "ZOHO_CLIENT_ID=zoho-client-id:latest",\
            "ZOHO_CLIENT_SECRET=zoho-client-secret:latest",\
            "SENDGRID_API_KEY=sendgrid-api-key:latest",\
            "REDIS_HOST=redis-host:latest",\
            "SENTRY_DSN=sentry-dsn:latest" \
        --add-cloudsql-instances "${PROJECT_ID}:us-central1:kn-biosciences" \
        --update-labels "environment=$ENVIRONMENT,service=api,team=backend" \
        --update-annotations "commit-sha=$GITHUB_SHA,deploy-time=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    echo -e "${GREEN}✓ Deployed to Cloud Run successfully${NC}"
}

# Configure custom domain (production only)
configure_domain() {
    if [ "$ENVIRONMENT" == "production" ]; then
        echo -e "${YELLOW}Configuring custom domain...${NC}"
        
        # Map domain to Cloud Run service
        gcloud run domain-mappings create \
            --service "$SERVICE_NAME" \
            --domain "$DOMAIN" \
            --region "$REGION" \
            --project "$PROJECT_ID" || true  # Ignore if already exists
        
        echo -e "${GREEN}✓ Custom domain configured${NC}"
    fi
}

# Run health check
health_check() {
    echo -e "${YELLOW}Running health check...${NC}"
    
    local service_url
    service_url=$(gcloud run services describe "$SERVICE_NAME" \
        --platform managed \
        --region "$REGION" \
        --format 'value(status.url)')
    
    echo "Service URL: $service_url"
    
    # Wait for deployment to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$service_url/health" > /dev/null; then
            echo -e "${GREEN}✓ Health check passed${NC}"
            return 0
        fi
        
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}✗ Health check failed after $max_attempts attempts${NC}"
    return 1
}

# Get deployment info
get_deployment_info() {
    echo -e "${YELLOW}Deployment Information:${NC}"
    echo "================================"
    
    gcloud run services describe "$SERVICE_NAME" \
        --platform managed \
        --region "$REGION" \
        --format "table(
            metadata.name,
            status.latestCreatedRevisionName,
            status.traffic[0].percent,
            status.url
        )"
    
    echo ""
    echo "Recent Revisions:"
    gcloud run revisions list \
        --service "$SERVICE_NAME" \
        --region "$REGION" \
        --limit 5 \
        --format "table(
            metadata.name,
            status.conditions[?type=='Ready'].status,
            metadata.creationTimestamp
        )"
}

# Main deployment function
main() {
    echo "========================================"
    echo "KN Biosciences API Deployment"
    echo "Environment: $ENVIRONMENT"
    echo "Project: $PROJECT_ID"
    echo "Region: $REGION"
    echo "========================================"
    echo ""
    
    # Pre-deployment checks
    validate_env
    check_gcloud
    check_docker
    
    # Set GCP project
    gcloud config set project "$PROJECT_ID"
    
    # Authenticate with Container Registry
    gcloud auth configure-docker
    
    # Build and push
    build_image
    push_image
    
    # Deploy
    deploy_cloud_run
    
    # Configure domain (production only)
    configure_domain
    
    # Health check
    health_check
    
    # Show deployment info
    get_deployment_info
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main "$@"
