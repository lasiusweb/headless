#!/bin/bash

# Load Testing Script for KN Biosciences Platform
# Usage: ./load-test.sh [staging|production] [api|web|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/test-results/load-tests"

# Default values
ENVIRONMENT="${1:-staging}"
TARGET="${2:-all}"
DURATION="60"
CONCURRENT_USERS="10"

# URLs
declare -A URLS
URLS[staging_api]="https://staging-api.knbiosciences.in"
URLS[staging_landing]="https://staging.knbiosciences.in"
URLS[staging_b2b]="https://staging-www.knbiosciences.in"
URLS[staging_b2c]="https://staging-agriculture.knbiosciences.in"
URLS[production_api]="https://api.knbiosciences.in"
URLS[production_landing]="https://knbiosciences.in"
URLS[production_b2b]="https://www.knbiosciences.in"
URLS[production_b2c]="https://agriculture.knbiosciences.in"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Check if k6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        echo -e "${RED}Error: k6 is not installed.${NC}"
        echo ""
        echo "Install k6:"
        echo "  macOS:     brew install k6"
        echo "  Linux:     sudo apt-get install k6"
        echo "  Windows:   winget install k6"
        echo "  Docker:    docker run -i grafana/k6"
        exit 1
    fi
}

# Check if wrk is installed (optional)
check_wrk() {
    if command -v wrk &> /dev/null; then
        WRK_AVAILABLE=true
    else
        WRK_AVAILABLE=false
        echo -e "${YELLOW}Note: wrk is not installed. Some tests will use k6 only.${NC}"
    fi
}

# API Load Test (k6)
test_api() {
    local base_url=$1
    local test_name=$2
    local output_file="$RESULTS_DIR/${test_name}-$(date +%Y%m%d-%H%M%S).json"
    
    echo -e "${BLUE}Running API load test against: $base_url${NC}"
    
    k6 run --out json="$output_file" <<EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '${DURATION}s', target: ${CONCURRENT_USERS} },
    { duration: '${DURATION}s', target: ${CONCURRENT_USERS} },
    { duration: '${DURATION}s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'], // Error rate should be less than 10%
  },
};

export default function() {
  // Health check endpoint
  let res = http.get('\${base_url}/health');
  check(res, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });
  errorRate.add(res.status !== 200);
  
  sleep(1);
  
  // Products list endpoint
  res = http.get('\${base_url}/api/products?limit=20');
  check(res, {
    'products status is 200': (r) => r.status === 200,
    'products has data': (r) => JSON.parse(r.body).data !== undefined,
  });
  errorRate.add(res.status !== 200);
  
  sleep(1);
  
  // Categories endpoint
  res = http.get('\${base_url}/api/categories');
  check(res, {
    'categories status is 200': (r) => r.status === 200,
  });
  errorRate.add(res.status !== 200);
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    '$output_file': JSON.stringify(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { http_req_duration, http_reqs, errors } = data.metrics;
  return \`
Load Test Summary:
  Requests: \${http_reqs.values.count}
  Request Rate: \${(http_reqs.values.rate * 60).toFixed(2)}/min
  Duration (p95): \${http_req_duration.values['p(95)']}ms
  Duration (avg): \${http_req_duration.values.avg.toFixed(2)}ms
  Error Rate: \${(errors.values.rate * 100).toFixed(2)}%
\`;
}
EOF
    
    echo -e "${GREEN}✓ API load test completed. Results saved to: $output_file${NC}"
}

# Web Frontend Load Test (k6)
test_web() {
    local base_url=$1
    local test_name=$2
    local output_file="$RESULTS_DIR/${test_name}-$(date +%Y%m%d-%H%M%S).json"
    
    echo -e "${BLUE}Running web load test against: $base_url${NC}"
    
    k6 run --out json="$output_file" <<EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '${DURATION}s', target: ${CONCURRENT_USERS} },
    { duration: '${DURATION}s', target: ${CONCURRENT_USERS} },
    { duration: '${DURATION}s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    errors: ['rate<0.1'],
  },
};

export default function() {
  // Homepage
  let res = http.get('\${base_url}');
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 3s': (r) => r.timings.duration < 3000,
  });
  errorRate.add(res.status !== 200);
  
  sleep(2);
}

export function handleSummary(data) {
  return {
    '$output_file': JSON.stringify(data),
  };
}
EOF
    
    echo -e "${GREEN}✓ Web load test completed. Results saved to: $output_file${NC}"
}

# High Load Test using wrk (if available)
test_high_load() {
    local url=$1
    local test_name=$2
    local duration="30s"
    local threads="4"
    local connections="100"
    
    if [ "$WRK_AVAILABLE" = true ]; then
        echo -e "${BLUE}Running high load test with wrk against: $url${NC}"
        
        local output_file="$RESULTS_DIR/${test_name}-wrk-$(date +%Y%m%d-%H%M%S).txt"
        
        wrk -t$threads -c$connections -d$duration "$url" > "$output_file"
        
        echo -e "${GREEN}✓ High load test completed. Results saved to: $output_file${NC}"
        cat "$output_file"
    else
        echo -e "${YELLOW}Skipping high load test (wrk not available)${NC}"
    fi
}

# Run all tests
run_all_tests() {
    local env=$1
    
    echo -e "${YELLOW}Starting comprehensive load testing for $env environment${NC}"
    echo "Duration per stage: ${DURATION}s"
    echo "Concurrent users: ${CONCURRENT_USERS}"
    echo ""
    
    # API Tests
    test_api "${URLS[${env}_api]}" "${env}-api"
    
    # Web Tests
    test_web "${URLS[${env}_landing]}" "${env}-landing"
    test_web "${URLS[${env}_b2b]}" "${env}-b2b"
    test_web "${URLS[${env}_b2c]}" "${env}-b2c"
    
    # High load test on API
    test_high_load "${URLS[${env}_api]}/health" "${env}-api-health"
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}All load tests completed!${NC}"
    echo -e "${GREEN}Results saved to: $RESULTS_DIR${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# Generate report
generate_report() {
    echo -e "${YELLOW}Generating load test report...${NC}"
    
    local report_file="$RESULTS_DIR/load-test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" <<EOF
# Load Test Report

**Environment**: $ENVIRONMENT
**Date**: $(date)
**Duration per Stage**: ${DURATION}s
**Concurrent Users**: ${CONCURRENT_USERS}

## Test Results

### API Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| P95 Latency | < 500ms | - | - |
| Error Rate | < 10% | - | - |
| Throughput | - | - | - |

### Frontend Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| P95 Latency | < 2000ms | - | - |
| Error Rate | < 10% | - | - |
| First Contentful Paint | < 1.5s | - | - |

## Recommendations

- [ ] Review P95 latency results
- [ ] Check error logs for failures
- [ ] Optimize slow endpoints
- [ ] Consider scaling if thresholds exceeded

## Raw Results

See individual JSON files in: $RESULTS_DIR

EOF
    
    echo -e "${GREEN}✓ Report generated: $report_file${NC}"
}

# Show usage
show_usage() {
    echo "Usage: ./load-test.sh [OPTIONS] [ENVIRONMENT] [TARGET]"
    echo ""
    echo "Arguments:"
    echo "  ENVIRONMENT    staging (default) or production"
    echo "  TARGET         api, web, or all (default)"
    echo ""
    echo "Options:"
    echo "  -d, --duration     Test duration in seconds (default: 60)"
    echo "  -u, --users        Concurrent users (default: 10)"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./load-test.sh staging api"
    echo "  ./load-test.sh production all -d 120 -u 50"
    echo "  ./load-test.sh staging web -u 20"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--duration)
            DURATION="$2"
            shift 2
            ;;
        -u|--users)
            CONCURRENT_USERS="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            break
            ;;
    esac
done

# Main
main() {
    echo "========================================"
    echo "KN Biosciences Load Testing"
    echo "Environment: $ENVIRONMENT"
    echo "Target: $TARGET"
    echo "Duration: ${DURATION}s"
    echo "Concurrent Users: ${CONCURRENT_USERS}"
    echo "========================================"
    echo ""
    
    check_k6
    check_wrk
    
    case $TARGET in
        api)
            test_api "${URLS[${ENVIRONMENT}_api]}" "${ENVIRONMENT}-api"
            ;;
        web)
            test_web "${URLS[${ENVIRONMENT}_landing]}" "${ENVIRONMENT}-landing"
            test_web "${URLS[${ENVIRONMENT}_b2b]}" "${ENVIRONMENT}-b2b"
            test_web "${URLS[${ENVIRONMENT}_b2c]}" "${ENVIRONMENT}-b2c"
            ;;
        all)
            run_all_tests "$ENVIRONMENT"
            ;;
        *)
            echo -e "${RED}Error: Unknown target '$TARGET'${NC}"
            show_usage
            exit 1
            ;;
    esac
    
    generate_report
}

# Run main function
main "$@"
