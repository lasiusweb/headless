# Terraform Variables for KN Biosciences Platform

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (staging or production)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "domain" {
  description = "Custom domain for the application"
  type        = string
  default     = "knbiosciences.in"
}

variable "supabase_project_id" {
  description = "Supabase project ID"
  type        = string
  sensitive   = true
}

variable "redis_host" {
  description = "Redis host for caching"
  type        = string
  sensitive   = true
}

variable "notification_email" {
  description = "Email address for monitoring notifications"
  type        = string
  default     = "devops@knbiosciences.in"
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  sensitive   = true
  default     = ""
}

# Resource naming prefix
variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "kn"
}

# Cloud Run configuration
variable "api_min_instances" {
  description = "Minimum number of API instances"
  type        = number
  default     = 2
}

variable "api_max_instances" {
  description = "Maximum number of API instances"
  type        = number
  default     = 50
}

variable "api_memory" {
  description = "API memory limit"
  type        = string
  default     = "2Gi"
}

variable "api_cpu" {
  description = "API CPU limit"
  type        = string
  default     = "2"
}

variable "frontend_min_instances" {
  description = "Minimum number of frontend instances"
  type        = number
  default     = 2
}

variable "frontend_max_instances" {
  description = "Maximum number of frontend instances"
  type        = number
  default     = 20
}

variable "frontend_memory" {
  description = "Frontend memory limit"
  type        = string
  default     = "1Gi"
}

variable "frontend_cpu" {
  description = "Frontend CPU limit"
  type        = string
  default     = "1"
}

# Monitoring thresholds
variable "error_rate_threshold" {
  description = "Error rate threshold for alerts (percentage)"
  type        = number
  default     = 5
}

variable "latency_threshold_ms" {
  description = "P95 latency threshold for alerts (milliseconds)"
  type        = number
  default     = 2000
}

variable "uptime_check_period" {
  description = "Uptime check period in seconds"
  type        = number
  default     = 60
}

# Storage lifecycle
variable "product_images_retention_days" {
  description = "Retention period for product images in days"
  type        = number
  default     = 365
}

variable "invoice_retention_days" {
  description = "Retention period for invoices in days (7 years for GST)"
  type        = number
  default     = 2555
}
