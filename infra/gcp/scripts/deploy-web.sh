#!/bin/bash

# GCP Production Deployment Script for KN Biosciences Web Applications
# Usage: ./deploy-web.sh [staging|production] [landing|www|agriculture|admin]

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
APP="${2:-all}"
REGION="us-central1"

# Application configuration
declare -A APP_CONFIG
APP_CONFIG[landing]="kn-landing,apps/web/apps/landing,Dockerfile,3000"
APP_CONFIG[www]="kn-b2b,apps/web/apps/www,Dockerfile,3001"
APP_CONFIG[agriculture]="kn-b2c,apps/web/apps/agriculture,Dockerfile,3002"
APP_CONFIG[admin]="kn-admin,apps/web/apps/admin,Dockerfile,3003"

# Load environment-specific configuration
if [ "$ENVIRONMENT" == "production" ]; then
    PROJECT_ID="${GCP_PRODUCTION_PROJECT_ID}"
    SERVICE_ACCOUNT="${GCP_PRODUCTION_SERVICE_ACCOUNT}"
    MIN_INSTANCES=2
    MAX_INSTANCES=20
    MEMORY="1Gi"
    CPU="1"
elif [ "$ENVIRONMENT" == "staging" ]; then
    PROJECT_ID="${GCP_STAGING_PROJECT_ID}"
    SERVICE_ACCOUNT="${GCP_STAGING_SERVICE_ACCOUNT}"
    MIN_INSTANCES=1
    MAX_INSTANCES=5
    MEMORY="512Mi"
    CPU="1"
else
    echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'. Use 'staging' or 'production'.${NC}"
    exit 1
fi

# Validate required environment variables
validate_env() {
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}Error: Missing GCP_PROJECT_ID environment variable${NC}"
        exit 1
    fi
    
    if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo -e "${RED}Error: Missing GOOGLE_APPLICATION_CREDENTIALS environment variable${NC}"
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

# Build Docker image for a specific app
build_image() {
    local app_name=$1
    local app_dir=$2
    local dockerfile=$3
    
    echo -e "${YELLOW}Building Docker image for $app_name...${NC}"
    
    cd "$PROJECT_ROOT"
    
    docker build \
        -f "$app_dir/$dockerfile" \
        -t "gcr.io/$PROJECT_ID/$app_name:$ENVIRONMENT-$GITHUB_SHA" \
        -t "gcr.io/$PROJECT_ID/$app_name:$ENVIRONMENT-latest" \
        .
    
    echo -e "${GREEN}✓ Docker image built for $app_name${NC}"
}

# Push Docker image to Container Registry
push_image() {
    local app_name=$1
    
    echo -e "${YELLOW}Pushing Docker image for $app_name...${NC}"
    
    docker push "gcr.io/$PROJECT_ID/$app_name:$ENVIRONMENT-$GITHUB_SHA"
    docker push "gcr.io/$PROJECT_ID/$app_name:$ENVIRONMENT-latest"
    
    echo -e "${GREEN}✓ Docker image pushed for $app_name${NC}"
}

# Deploy to Cloud Run
deploy_cloud_run() {
    local service_name=$1
    local app_name=$2
    
    echo -e "${YELLOW}Deploying $service_name to Cloud Run ($ENVIRONMENT)...${NC}"
    
    gcloud run deploy "$service_name" \
        --image "gcr.io/$PROJECT_ID/$app_name:$ENVIRONMENT-latest" \
        --platform managed \
        --region "$REGION" \
        --allow-unauthenticated \
        --service-account "$SERVICE_ACCOUNT" \
        --min-instances "$MIN_INSTANCES" \
        --max-instances "$MAX_INSTANCES" \
        --memory "$MEMORY" \
        --cpu "$CPU" \
        --timeout "60s" \
        --concurrency "80" \
        --set-env-vars \
            "NODE_ENV=$ENVIRONMENT",\
            "NEXT_PUBLIC_API_URL=https://api.knbiosciences.in/api",\
            "NEXT_PUBLIC_ENVIRONMENT=$ENVIRONMENT" \
        --set-secrets \
            "NEXT_PUBLIC_SUPABASE_URL=supabase-url:latest",\
            "NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key:latest" \
        --update-labels "environment=$ENVIRONMENT,service=$service_name,team=frontend" \
        --update-annotations "commit-sha=$GITHUB_SHA,deploy-time=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    echo -e "${GREEN}✓ Deployed $service_name to Cloud Run${NC}"
}

# Configure custom domain
configure_domain() {
    local service_name=$1
    local domain=$2
    
    if [ "$ENVIRONMENT" == "production" ]; then
        echo -e "${YELLOW}Configuring domain $domain for $service_name...${NC}"
        
        gcloud run domain-mappings create \
            --service "$service_name" \
            --domain "$domain" \
            --region "$REGION" \
            --project "$PROJECT_ID" || true  # Ignore if already exists
        
        echo -e "${GREEN}✓ Domain configured for $service_name${NC}"
    fi
}

# Run health check
health_check() {
    local service_name=$1
    
    echo -e "${YELLOW}Running health check for $service_name...${NC}"
    
    local service_url
    service_url=$(gcloud run services describe "$service_name" \
        --platform managed \
        --region "$REGION" \
        --format 'value(status.url)')
    
    # Wait for deployment to be ready
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$service_url" > /dev/null; then
            echo -e "${GREEN}✓ Health check passed for $service_name${NC}"
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}✗ Health check failed for $service_name${NC}"
    return 1
}

# Deploy a single application
deploy_app() {
    local app_key=$1
    local config=${APP_CONFIG[$app_key]}
    
    IFS=',' read -r service_name app_dir dockerfile port <<< "$config"
    
    # Build
    build_image "$service_name" "$app_dir" "$dockerfile"
    
    # Push
    push_image "$service_name"
    
    # Deploy
    deploy_cloud_run "$service_name" "$service_name"
    
    # Health check
    health_check "$service_name"
}

# Deploy all applications
deploy_all() {
    for app_key in "${!APP_CONFIG[@]}"; do
        deploy_app "$app_key"
    done
}

# Get deployment status
get_deployment_status() {
    echo -e "${YELLOW}Deployment Status:${NC}"
    echo "================================"
    
    for app_key in "${!APP_CONFIG[@]}"; do
        local config=${APP_CONFIG[$app_key]}
        IFS=',' read -r service_name app_dir dockerfile port <<< "$config"
        
        echo ""
        echo "Service: $service_name"
        gcloud run services describe "$service_name" \
            --platform managed \
            --region "$REGION" \
            --format "table(
                metadata.name,
                status.latestCreatedRevisionName,
                status.traffic[0].percent,
                status.url
            )" || echo "  (Not deployed)"
    done
}

# Main deployment function
main() {
    echo "========================================"
    echo "KN Biosciences Web Deployment"
    echo "Environment: $ENVIRONMENT"
    echo "Project: $PROJECT_ID"
    echo "Application: $APP"
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
    
    # Deploy based on app selection
    if [ "$APP" == "all" ]; then
        deploy_all
    else
        if [ -z "${APP_CONFIG[$APP]}" ]; then
            echo -e "${RED}Error: Unknown application '$APP'${NC}"
            echo "Valid applications: landing, www, agriculture, admin"
            exit 1
        fi
        deploy_app "$APP"
    fi
    
    # Show deployment status
    get_deployment_status
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Run main function
main "$@"
