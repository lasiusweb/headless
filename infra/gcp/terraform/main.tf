# Terraform Infrastructure for KN Biosciences Platform
# This Terraform configuration provisions the complete GCP infrastructure

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "kn-biosciences-terraform-state"
    prefix = "terraform/state"
  }
}

# ===========================================
# Provider Configuration
# ===========================================
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ===========================================
# Variables
# ===========================================
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (staging/production)"
  type        = string
  default     = "production"
}

variable "domain" {
  description = "Custom domain"
  type        = string
  default     = "knbiosciences.in"
}

# ===========================================
# Local Values
# ===========================================
locals {
  service_prefix = "kn-${var.environment}"
  
  common_labels = {
    environment = var.environment
    project     = "kn-biosciences"
    managed_by  = "terraform"
  }
  
  # Environment-specific configurations
  api_config = var.environment == "production" ? {
    min_instances = 2
    max_instances = 50
    memory        = "2Gi"
    cpu           = "2"
  } : {
    min_instances = 1
    max_instances = 10
    memory        = "1Gi"
    cpu           = "1"
  }
  
  frontend_config = var.environment == "production" ? {
    min_instances = 2
    max_instances = 20
    memory        = "1Gi"
    cpu           = "1"
  } : {
    min_instances = 1
    max_instances = 5
    memory        = "512Mi"
    cpu           = "1"
  }
}

# ===========================================
# Cloud Run IAM
# ===========================================
# Service account for API
resource "google_service_account" "api_sa" {
  account_id   = "${local.service_prefix}-api-sa"
  display_name = "KN Biosciences API Service Account"
  description  = "Service account for KN Biosciences API Cloud Run service"
}

# Service account for Frontend
resource "google_service_account" "frontend_sa" {
  account_id   = "${local.service_prefix}-frontend-sa"
  display_name = "KN Biosciences Frontend Service Account"
  description  = "Service account for KN Biosciences Frontend Cloud Run services"
}

# Grant API service account permissions
resource "google_project_iam_member" "api_sa_run_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "api_sa_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

resource "google_project_iam_member" "api_sa_storage_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.api_sa.email}"
}

# Grant Frontend service account permissions
resource "google_project_iam_member" "frontend_sa_run_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.frontend_sa.email}"
}

resource "google_project_iam_member" "frontend_sa_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.frontend_sa.email}"
}

# ===========================================
# Cloud Run Services
# ===========================================

# API Service
resource "google_cloud_run_v2_service" "api" {
  name     = "${local.service_prefix}-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    max_instance_request_concurrency = 80
    timeout                          = "300s"
    
    containers {
      image = "gcr.io/${var.project_id}/kn-api:${var.environment}-latest"
      
      ports {
        name           = "http1"
        container_port = 8080
      }
      
      resources {
        limits = {
          cpu    = local.api_config.cpu
          memory = local.api_config.memory
        }
      }
      
      env {
        name  = "NODE_ENV"
        value = var.environment
      }
      
      env {
        name  = "PORT"
        value = "8080"
      }
      
      # Secret environment variables
      env {
        name = "SUPABASE_URL"
        value_source {
          secret_key_ref {
            secret  = "supabase-url"
            version = "latest"
          }
        }
      }
      
      env {
        name = "SUPABASE_SERVICE_ROLE_KEY"
        value_source {
          secret_key_ref {
            secret  = "supabase-key"
            version = "latest"
          }
        }
      }
      
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = "jwt-secret"
            version = "latest"
          }
        }
      }
    }
    
    service_account = google_service_account.api_sa.email
    
    scaling {
      min_instance_count = local.api_config.min_instances
      max_instance_count = local.api_config.max_instances
    }
  }
  
  labels = local.common_labels
  
  annotations = {
    "run.googleapis.com/launch-stage" = "GA"
  }
}

# Landing Page Service
resource "google_cloud_run_v2_service" "landing" {
  name     = "${local.service_prefix}-landing"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    max_instance_request_concurrency = 80
    timeout                          = "60s"
    
    containers {
      image = "gcr.io/${var.project_id}/kn-landing:${var.environment}-latest"
      
      ports {
        name           = "http1"
        container_port = 3000
      }
      
      resources {
        limits = {
          cpu    = local.frontend_config.cpu
          memory = local.frontend_config.memory
        }
      }
    }
    
    service_account = google_service_account.frontend_sa.email
    
    scaling {
      min_instance_count = local.frontend_config.min_instances
      max_instance_count = local.frontend_config.max_instances
    }
  }
  
  labels = local.common_labels
}

# B2B Portal Service
resource "google_cloud_run_v2_service" "b2b" {
  name     = "${local.service_prefix}-b2b"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    max_instance_request_concurrency = 80
    timeout                          = "60s"
    
    containers {
      image = "gcr.io/${var.project_id}/kn-b2b:${var.environment}-latest"
      
      ports {
        name           = "http1"
        container_port = 3000
      }
      
      resources {
        limits = {
          cpu    = local.frontend_config.cpu
          memory = local.frontend_config.memory
        }
      }
    }
    
    service_account = google_service_account.frontend_sa.email
    
    scaling {
      min_instance_count = local.frontend_config.min_instances
      max_instance_count = local.frontend_config.max_instances
    }
  }
  
  labels = local.common_labels
}

# B2C Portal Service
resource "google_cloud_run_v2_service" "b2c" {
  name     = "${local.service_prefix}-b2c"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    max_instance_request_concurrency = 80
    timeout                          = "60s"
    
    containers {
      image = "gcr.io/${var.project_id}/kn-b2c:${var.environment}-latest"
      
      ports {
        name           = "http1"
        container_port = 3000
      }
      
      resources {
        limits = {
          cpu    = local.frontend_config.cpu
          memory = local.frontend_config.memory
        }
      }
    }
    
    service_account = google_service_account.frontend_sa.email
    
    scaling {
      min_instance_count = local.frontend_config.min_instances
      max_instance_count = local.frontend_config.max_instances
    }
  }
  
  labels = local.common_labels
}

# Admin Dashboard Service
resource "google_cloud_run_v2_service" "admin" {
  name     = "${local.service_prefix}-admin"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    max_instance_request_concurrency = 80
    timeout                          = "60s"
    
    containers {
      image = "gcr.io/${var.project_id}/kn-admin:${var.environment}-latest"
      
      ports {
        name           = "http1"
        container_port = 3000
      }
      
      resources {
        limits = {
          cpu    = local.frontend_config.cpu
          memory = local.frontend_config.memory
        }
      }
    }
    
    service_account = google_service_account.frontend_sa.email
    
    scaling {
      min_instance_count = local.frontend_config.min_instances
      max_instance_count = local.frontend_config.max_instances
    }
  }
  
  labels = local.common_labels
}

# ===========================================
# Cloud Storage Buckets
# ===========================================

# Product Images Bucket
resource "google_storage_bucket" "products" {
  name          = "${var.project_id}-products"
  location      = var.region
  storage_class = "STANDARD"
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
  
  cors {
    origin          = ["https://www.knbiosciences.in", "https://agriculture.knbiosciences.in"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
  
  labels = local.common_labels
}

# Invoice PDFs Bucket
resource "google_storage_bucket" "invoices" {
  name          = "${var.project_id}-invoices"
  location      = var.region
  storage_class = "STANDARD"
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 2555  # 7 years for GST compliance
    }
    action {
      type = "Delete"
    }
  }
  
  labels = local.common_labels
}

# Static Assets Bucket
resource "google_storage_bucket" "static" {
  name          = "${var.project_id}-static"
  location      = var.region
  storage_class = "STANDARD"
  
  uniform_bucket_level_access = true
  
  website {
    main_page_suffix = "index.html"
  }
  
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
  
  labels = local.common_labels
}

# ===========================================
# Secret Manager Secrets
# ===========================================

resource "google_secret_manager_secret" "supabase_url" {
  secret_id = "supabase-url"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "supabase_key" {
  secret_id = "supabase-key"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "easebuzz_salt" {
  secret_id = "easebuzz-salt"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "delhivery_api_key" {
  secret_id = "delhivery-api-key"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "zoho_client_id" {
  secret_id = "zoho-client-id"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "zoho_client_secret" {
  secret_id = "zoho-client-secret"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "sendgrid_api_key" {
  secret_id = "sendgrid-api-key"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

resource "google_secret_manager_secret" "sentry_dsn" {
  secret_id = "sentry-dsn"
  
  replication {
    auto {}
  }
  
  labels = local.common_labels
}

# ===========================================
# Monitoring & Alerting
# ===========================================

# Uptime Check for API
resource "google_monitoring_uptime_check_config" "api" {
  display_name = "KN Biosciences API Uptime Check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path           = "/health"
    port           = 443
    use_ssl        = true
    validate_ssl   = true
    request_method = "GET"
  }
  
  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "api.${var.domain}"
    }
  }
  
  content_matchers {
    content   = "\"status\":\"ok\""
    matcher   = "CONTAINS_STRING"
  }
}

# Alert Policy for High Error Rate
resource "google_monitoring_alert_policy" "api_error_rate" {
  display_name = "API High Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Error rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND metric.type=\"cloud_run.googleapis.com/request_count\" AND metric.labels.response_code=~\"5..\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      duration        = "300s"
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
  
  documentation {
    content   = "API error rate has exceeded 5%. Check Cloud Run logs and Sentry dashboard."
    mime_type = "text/markdown"
  }
  
  labels = local.common_labels
}

# Alert Policy for High Latency
resource "google_monitoring_alert_policy" "api_latency" {
  display_name = "API High Latency"
  combiner     = "OR"

  conditions {
    display_name = "P95 latency > 2000ms"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND metric.type=\"cloud_run.googleapis.com/request_latencies\""
      comparison      = "COMPARISON_GT"
      threshold_value = 2000
      duration        = "300s"
      
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_PERCENTILE_95"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.label.\"service_name\""]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
  
  documentation {
    content   = "API P95 latency has exceeded 2000ms. Check for slow queries and consider scaling."
    mime_type = "text/markdown"
  }
  
  labels = local.common_labels
}

# Notification Channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "DevOps Team Email"
  type         = "email"
  
  labels = {
    email_address = "devops@knbiosciences.in"
  }
}

# ===========================================
# Logging
# ===========================================

# Log-based metric for API errors
resource "google_logging_metric" "api_error_rate" {
  name   = "api-error-rate"
  filter = "resource.type=\"cloud_run_revision\" AND httpRequest.status>=500"
  
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
    
    labels {
      key         = "service"
      value_type  = "STRING"
      description = "Cloud Run service name"
    }
    
    display_name = "API Error Count"
    description  = "Count of 5xx errors from API"
  }
  
  label_extractors = {
    "service" = "EXTRACT(resource.label.\"service_name\")"
  }
}

# ===========================================
# Outputs
# ===========================================

output "api_service_url" {
  description = "Cloud Run API service URL"
  value       = google_cloud_run_v2_service.api.uri
}

output "landing_service_url" {
  description = "Cloud Run Landing service URL"
  value       = google_cloud_run_v2_service.landing.uri
}

output "b2b_service_url" {
  description = "Cloud Run B2B service URL"
  value       = google_cloud_run_v2_service.b2b.uri
}

output "b2c_service_url" {
  description = "Cloud Run B2C service URL"
  value       = google_cloud_run_v2_service.b2c.uri
}

output "admin_service_url" {
  description = "Cloud Run Admin service URL"
  value       = google_cloud_run_v2_service.admin.uri
}

output "products_bucket_url" {
  description = "Product images bucket URL"
  value       = "gs://${google_storage_bucket.products.name}"
}

output "invoices_bucket_url" {
  description = "Invoice PDFs bucket URL"
  value       = "gs://${google_storage_bucket.invoices.name}"
}

output "static_bucket_url" {
  description = "Static assets bucket URL"
  value       = "gs://${google_storage_bucket.static.name}"
}
