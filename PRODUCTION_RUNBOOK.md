# Production Runbook - KN Biosciences Platform

## Document Information

- **Version**: 2.0.0
- **Last Updated**: 2026-02-23
- **Owner**: Engineering Team
- **Review Frequency**: Monthly

---

## System Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Landing    │   B2B Web    │   B2C Web    │   Admin       │
│   (Next.js)  │   (Next.js)  │   (Next.js)  │   (Next.js)   │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘
       │              │              │               │
       └──────────────┴──────┬───────┴───────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
│  Supabase   │      │    Zoho     │      │   Payment   │
│  (PostgreSQL│      │    (CRM/    │      │   Gateways  │
│   + Auth)   │      │    Books)   │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Services

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Landing Page | 3000 | knbiosciences.in | Portal routing & entry point |
| B2B Portal | 3001 | www.knbiosciences.in | Dealer/distributor portal |
| B2C Portal | 3002 | agriculture.knbiosciences.in | Farmer portal |
| Admin Dashboard | 3003 | admin.knbiosciences.in | Internal admin |
| API | 3000 | api.knbiosciences.in | Backend services |

---

## On-Call Procedures

### Escalation Matrix

| Level | Contact | Response Time |
|-------|---------|---------------|
| L1 (On-Call Engineer) | oncall@knbiosciences.in | 15 minutes |
| L2 (Tech Lead) | tech-lead@knbiosciences.in | 30 minutes |
| L3 (CTO) | cto@knbiosciences.in | 1 hour |

### Communication Channels

- **Slack**: #incidents
- **Email**: incidents@knbiosciences.in
- **Phone**: +91-XXX-XXX-XXXX

---

## Daily Operations Checklist

### Morning Check (9:00 AM IST)

- [ ] Check system health dashboard
- [ ] Review error logs (Sentry)
- [ ] Check database backup status
- [ ] Review overnight incidents
- [ ] Check API response times (P95 < 500ms)
- [ ] Verify all services are running

### Evening Check (6:00 PM IST)

- [ ] Review daily metrics
- [ ] Check error rate trends
- [ ] Verify backup completion
- [ ] Update incident log
- [ ] Prepare handover notes (if applicable)

---

## Monitoring & Alerts

### Key Metrics to Monitor

#### API Metrics
| Metric | Warning | Critical | Check Frequency |
|--------|---------|----------|-----------------|
| Error Rate | > 1% | > 5% | 1 minute |
| P95 Latency | > 500ms | > 2000ms | 1 minute |
| P99 Latency | > 1000ms | > 5000ms | 1 minute |
| Requests/sec | > 1000 | > 5000 | 1 minute |
| 5xx Errors | > 0.1% | > 1% | 1 minute |

#### Frontend Metrics
| Metric | Warning | Critical | Check Frequency |
|--------|---------|----------|-----------------|
| LCP | > 2.5s | > 5s | 5 minutes |
| FID | > 100ms | > 500ms | 5 minutes |
| CLS | > 0.1 | > 0.25 | 5 minutes |
| Error Rate | > 0.5% | > 2% | 5 minutes |

#### Database Metrics
| Metric | Warning | Critical | Check Frequency |
|--------|---------|----------|-----------------|
| Connection Pool Usage | > 80% | > 95% | 1 minute |
| Query Duration (avg) | > 100ms | > 500ms | 1 minute |
| Slow Queries | > 10/min | > 50/min | 5 minutes |
| Storage Usage | > 80% | > 95% | 1 hour |

### Alert Configuration

#### GCP Cloud Monitoring
```yaml
alerts:
  - name: High Error Rate
    condition: error_rate > 0.05
    duration: 5m
    channels: [slack, email, pagerduty]
    
  - name: High Latency
    condition: p95_latency > 2000
    duration: 5m
    channels: [slack, email]
    
  - name: Service Down
    condition: health_check_failed == true
    duration: 1m
    channels: [slack, email, pagerduty, phone]
```

#### Sentry Alerts
```yaml
alerts:
  - name: New Error Spike
    condition: new_issue_count > 10
    duration: 10m
    channels: [slack, email]
    
  - name: Critical Error
    condition: level == error AND tag.environment == production
    channels: [slack, pagerduty]
```

---

## Incident Response Procedures

### P0 - Complete Service Outage

**Definition**: All users cannot access the platform

**Response Time**: Immediate (within 5 minutes)

**Procedure**:
1. **Acknowledge** the alert within 5 minutes
2. **Page** the on-call engineer and tech lead
3. **Assess** the situation:
   - Check service status pages (GCP, Supabase)
   - Review recent deployments
   - Check error logs
4. **Communicate**:
   - Post in #incidents Slack channel
   - Send status update to stakeholders
5. **Mitigate**:
   - If deployment-related: rollback immediately
   - If infrastructure: failover to backup
   - If database: check Supabase status
6. **Resolve**:
   - Restore service
   - Verify all functionality
7. **Post-Mortem**:
   - Document timeline
   - Identify root cause
   - Create action items

### P1 - Partial Service Degradation

**Definition**: Some features not working, slow performance

**Response Time**: Within 15 minutes

**Procedure**:
1. **Acknowledge** the alert
2. **Identify** affected features
3. **Check**:
   - API error rates
   - Database performance
   - External service status
4. **Mitigate**:
   - Disable affected features if necessary
   - Scale up resources
5. **Monitor** until resolved
6. **Document** incident

### P2 - Non-Critical Issues

**Definition**: Minor bugs, cosmetic issues

**Response Time**: Within 4 hours

**Procedure**:
1. **Log** the issue
2. **Assign** to appropriate engineer
3. **Fix** in next deployment
4. **Update** issue tracker

---

## Common Issues & Solutions

### Issue 1: High API Latency

**Symptoms**:
- P95 latency > 1000ms
- User complaints about slow loading

**Diagnosis**:
```bash
# Check recent queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries log
# (GCP Cloud Logging > Cloud SQL > Slow Queries)
```

**Solutions**:
1. Add database indexes
2. Enable/optimize caching
3. Scale up Cloud Run instances
4. Optimize slow queries

### Issue 2: Database Connection Pool Exhaustion

**Symptoms**:
- Errors: "too many connections"
- API timeouts

**Diagnosis**:
```bash
# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Check max connections
SHOW max_connections;
```

**Solutions**:
1. Increase connection pool size
2. Fix connection leaks in code
3. Add connection pooling (PgBouncer)
4. Scale database instance

### Issue 3: Memory Pressure

**Symptoms**:
- OOM kills
- Service restarts

**Diagnosis**:
```bash
# Check memory usage (GCP Console)
# Check for memory leaks in logs
```

**Solutions**:
1. Increase memory limits
2. Fix memory leaks
3. Optimize data structures
4. Enable garbage collection tuning

### Issue 4: Cache Issues

**Symptoms**:
- Stale data
- Cache misses

**Diagnosis**:
```bash
# Check cache hit rate
# (should be > 90%)
```

**Solutions**:
1. Clear stale cache entries
2. Adjust TTL values
3. Fix cache invalidation logic
4. Scale cache layer

### Issue 5: External Service Failures

**Symptoms**:
- Payment failures
- Shipping rate errors
- Zoho sync issues

**Diagnosis**:
```bash
# Check external service status pages
# Review API response codes
```

**Solutions**:
1. Implement retry logic
2. Add circuit breakers
3. Use fallback mechanisms
4. Contact service provider

---

## Deployment Procedures

### Standard Deployment

**Frequency**: Twice weekly (Tuesday, Thursday)

**Time**: 10:00 AM - 11:00 AM IST

**Procedure**:
1. **Pre-Deployment** (30 min before)
   - [ ] Run health checks
   - [ ] Review changes
   - [ ] Notify team
   
2. **Deploy API** (10:00 AM)
   ```bash
   cd apps/api
   pnpm build
   gcloud run deploy kn-api --image gcr.io/PROJECT_ID/kn-api:latest
   ```
   
3. **Deploy Frontend** (10:15 AM)
   ```bash
   # Landing
   cd apps/web/apps/landing
   pnpm build
   gcloud run deploy kn-landing --image gcr.io/PROJECT_ID/kn-landing:latest
   
   # B2B
   cd apps/web/apps/www
   pnpm build
   gcloud run deploy kn-b2b --image gcr.io/PROJECT_ID/kn-b2b:latest
   
   # B2C
   cd apps/web/apps/agriculture
   pnpm build
   gcloud run deploy kn-b2c --image gcr.io/PROJECT_ID/kn-b2c:latest
   ```
   
4. **Post-Deployment** (10:45 AM)
   - [ ] Run smoke tests
   - [ ] Check error rates
   - [ ] Verify key flows
   - [ ] Update deployment log

### Emergency Deployment

**Approval**: Tech Lead or CTO

**Procedure**:
1. Get approval via Slack/phone
2. Deploy fix immediately
3. Document in incident log
4. Post-mortem within 24 hours

---

## Backup & Recovery

### Backup Schedule

| Data Type | Frequency | Retention |
|-----------|-----------|-----------|
| Database (Supabase) | Continuous | 30 days |
| File Storage (GCS) | Continuous | 90 days |
| Configuration (Git) | Per commit | Permanent |

### Recovery Procedures

#### Database Point-in-Time Recovery

1. **Identify** the recovery point
2. **Create** restore job in Supabase dashboard
3. **Verify** restored data
4. **Update** application to use restored database

#### File Recovery

1. **Locate** file in GCS versioning
2. **Restore** previous version
3. **Verify** file integrity

---

## Security Procedures

### Secret Rotation

| Secret | Frequency | Owner |
|--------|-----------|-------|
| JWT_SECRET | Quarterly | Tech Lead |
| Database Password | Quarterly | DevOps |
| API Keys | Quarterly | Service Owner |

### Security Incident Response

1. **Identify** the breach
2. **Contain** the incident
3. **Eradicate** the threat
4. **Recover** systems
5. **Document** lessons learned

---

## Capacity Planning

### Current Capacity

| Resource | Current | Max | Utilization |
|----------|---------|-----|-------------|
| API Instances | 3 | 10 | 30% |
| Database Connections | 50 | 200 | 25% |
| Storage | 10 GB | 100 GB | 10% |

### Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU Usage | > 70% for 10 min | < 30% for 30 min |
| Memory Usage | > 80% for 10 min | < 40% for 30 min |
| Request Rate | > 1000/sec | < 100/sec |

---

## Contact Information

### Internal Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| On-Call | Rotation | oncall@knbiosciences.in | - |
| Tech Lead | - | tech-lead@knbiosciences.in | +91-XXX-XXX-XXXX |
| DevOps | - | devops@knbiosciences.in | +91-XXX-XXX-XXXX |
| CTO | - | cto@knbiosciences.in | +91-XXX-XXX-XXXX |

### External Contacts

| Service | Support | Emergency |
|---------|---------|-----------|
| GCP | support.google.com | - |
| Supabase | support.supabase.com | - |
| Zoho | support.zoho.com | - |
| Payment Gateway | - | - |

---

## Appendices

### A. Useful Commands

```bash
# Check service status
gcloud run services list

# View logs
gcloud run services logs read kn-api

# Scale service
gcloud run services update kn-api --min-instances=2

# Rollback deployment
gcloud run services update-traffic kn-api --to-revisions=REVISION_ID=100
```

### B. Dashboard Links

- GCP Console: https://console.cloud.google.com
- Supabase Dashboard: https://app.supabase.com
- Sentry Dashboard: https://sentry.io
- Google Analytics: https://analytics.google.com

### C. Runbook Updates

This runbook should be updated:
- After every incident
- After every major deployment
- Monthly (review)
- Quarterly (comprehensive review)

---

**End of Production Runbook**
