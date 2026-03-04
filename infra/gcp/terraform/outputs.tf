# Terraform Outputs for KN Biosciences Platform

# ===========================================
# Cloud Run Service URLs
# ===========================================

output "api_service_name" {
  description = "Cloud Run API service name"
  value       = google_cloud_run_v2_service.api.name
}

output "api_service_url" {
  description = "Cloud Run API service URL"
  value       = google_cloud_run_v2_service.api.uri
}

output "api_service_location" {
  description = "Cloud Run API service location"
  value       = google_cloud_run_v2_service.api.location
}

output "landing_service_name" {
  description = "Cloud Run Landing service name"
  value       = google_cloud_run_v2_service.landing.name
}

output "landing_service_url" {
  description = "Cloud Run Landing service URL"
  value       = google_cloud_run_v2_service.landing.uri
}

output "b2b_service_name" {
  description = "Cloud Run B2B service name"
  value       = google_cloud_run_v2_service.b2b.name
}

output "b2b_service_url" {
  description = "Cloud Run B2B service URL"
  value       = google_cloud_run_v2_service.b2b.uri
}

output "b2c_service_name" {
  description = "Cloud Run B2C service name"
  value       = google_cloud_run_v2_service.b2c.name
}

output "b2c_service_url" {
  description = "Cloud Run B2C service URL"
  value       = google_cloud_run_v2_service.b2c.uri
}

output "admin_service_name" {
  description = "Cloud Run Admin service name"
  value       = google_cloud_run_v2_service.admin.name
}

output "admin_service_url" {
  description = "Cloud Run Admin service URL"
  value       = google_cloud_run_v2_service.admin.uri
}

# ===========================================
# Service Accounts
# ===========================================

output "api_service_account_email" {
  description = "API service account email"
  value       = google_service_account.api_sa.email
}

output "frontend_service_account_email" {
  description = "Frontend service account email"
  value       = google_service_account.frontend_sa.email
}

# ===========================================
# Cloud Storage Buckets
# ===========================================

output "products_bucket_name" {
  description = "Product images bucket name"
  value       = google_storage_bucket.products.name
}

output "products_bucket_url" {
  description = "Product images bucket URL"
  value       = "gs://${google_storage_bucket.products.name}"
}

output "invoices_bucket_name" {
  description = "Invoice PDFs bucket name"
  value       = google_storage_bucket.invoices.name
}

output "invoices_bucket_url" {
  description = "Invoice PDFs bucket URL"
  value       = "gs://${google_storage_bucket.invoices.name}"
}

output "static_bucket_name" {
  description = "Static assets bucket name"
  value       = google_storage_bucket.static.name
}

output "static_bucket_url" {
  description = "Static assets bucket URL"
  value       = "gs://${google_storage_bucket.static.name}"
}

output "products_bucket_domain" {
  description = "Product images bucket domain name"
  value       = google_storage_bucket.products.url
}

output "invoices_bucket_domain" {
  description = "Invoice PDFs bucket domain name"
  value       = google_storage_bucket.invoices.url
}

output "static_bucket_domain" {
  description = "Static assets bucket domain name"
  value       = google_storage_bucket.static.url
}

# ===========================================
# Secret Manager
# ===========================================

output "secret_names" {
  description = "List of created secret names"
  value = [
    google_secret_manager_secret.supabase_url.secret_id,
    google_secret_manager_secret.supabase_key.secret_id,
    google_secret_manager_secret.jwt_secret.secret_id,
    google_secret_manager_secret.easebuzz_salt.secret_id,
    google_secret_manager_secret.delhivery_api_key.secret_id,
    google_secret_manager_secret.zoho_client_id.secret_id,
    google_secret_manager_secret.zoho_client_secret.secret_id,
    google_secret_manager_secret.sendgrid_api_key.secret_id,
    google_secret_manager_secret.sentry_dsn.secret_id,
  ]
}

# ===========================================
# Monitoring
# ===========================================

output "uptime_check_id" {
  description = "API uptime check ID"
  value       = google_monitoring_uptime_check_config.api.id
}

output "error_rate_alert_policy_id" {
  description = "Error rate alert policy ID"
  value       = google_monitoring_alert_policy.api_error_rate.id
}

output "latency_alert_policy_id" {
  description = "Latency alert policy ID"
  value       = google_monitoring_alert_policy.api_latency.id
}

output "notification_channel_id" {
  description = "Notification channel ID"
  value       = google_monitoring_notification_channel.email.id
}

output "log_metric_name" {
  description = "Log-based metric name for API errors"
  value       = google_logging_metric.api_error_rate.name
}

# ===========================================
# Labels
# ===========================================

output "common_labels" {
  description = "Common labels applied to all resources"
  value = {
    environment = var.environment
    project     = "kn-biosciences"
    managed_by  = "terraform"
  }
}

# ===========================================
# Configuration Summary
# ===========================================

output "configuration_summary" {
  description = "Summary of deployed configuration"
  value = {
    project_id     = var.project_id
    region         = var.region
    environment    = var.environment
    domain         = var.domain
    
    api = {
      service_name  = google_cloud_run_v2_service.api.name
      min_instances = var.api_min_instances
      max_instances = var.api_max_instances
      memory        = var.api_memory
      cpu           = var.api_cpu
    }
    
    frontend = {
      service_name  = "kn-frontend"
      min_instances = var.frontend_min_instances
      max_instances = var.frontend_max_instances
      memory        = var.frontend_memory
      cpu           = var.frontend_cpu
    }
    
    buckets = {
      products = google_storage_bucket.products.name
      invoices = google_storage_bucket.invoices.name
      static   = google_storage_bucket.static.name
    }
    
    monitoring = {
      error_rate_threshold  = var.error_rate_threshold
      latency_threshold_ms  = var.latency_threshold_ms
      uptime_check_period   = var.uptime_check_period
      notification_email    = var.notification_email
    }
  }
}
