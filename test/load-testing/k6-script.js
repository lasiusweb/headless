/**
 * k6 Load Testing Configuration for KN Biosciences Platform
 * 
 * This script provides comprehensive load testing scenarios for:
 * - API endpoints
 * - Web frontends
 * - Authentication flows
 * - Order processing flows
 * 
 * Usage:
 *   k6 run script.js
 *   k6 run --vus 50 --duration 30s script.js
 *   k6 run --stage=staging script.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const webLatency = new Trend('web_latency');

// Test configuration
const config = {
  staging: {
    api: 'https://staging-api.knbiosciences.in',
    landing: 'https://staging.knbiosciences.in',
    b2b: 'https://staging-www.knbiosciences.in',
    b2c: 'https://staging-agriculture.knbiosciences.in',
  },
  production: {
    api: 'https://api.knbiosciences.in',
    landing: 'https://knbiosciences.in',
    b2b: 'https://www.knbiosciences.in',
    b2c: 'https://agriculture.knbiosciences.in',
  },
};

// Default to staging
const ENV = __ENV.STAGE || 'staging';
const BASE_URLS = config[ENV];

// Test scenarios
export let options = {
  scenarios: {
    // Light load test
    light_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 10 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'light_load' },
    },
    
    // Standard load test
    standard_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'standard_load' },
    },
    
    // Peak load test
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'peak_load' },
    },
    
    // Stress test
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'stress_test' },
    },
  },
  
  thresholds: {
    // Global thresholds
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.05'], // Error rate should be less than 5%
    http_reqs: ['rate>100'], // At least 100 requests per second
    
    // Custom metric thresholds
    errors: ['rate<0.1'], // Error rate less than 10%
    api_latency: ['p(95)<500'], // API P95 latency < 500ms
    web_latency: ['p(95)<2000'], // Web P95 latency < 2s
  },
};

// API Test Scenarios
export function apiTests() {
  group('Health Check', function() {
    const res = http.get(`${BASE_URLS.api}/health`, {
      tags: { name: 'health_check' },
    });
    
    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    errorRate.add(res.status !== 200);
    apiLatency.add(res.timings.duration);
  });
  
  sleep(1);
  
  group('Products API', function() {
    // List products
    const productsRes = http.get(`${BASE_URLS.api}/api/products?limit=20&offset=0`, {
      tags: { name: 'list_products' },
    });
    
    check(productsRes, {
      'products status is 200': (r) => r.status === 200,
      'products has data array': (r) => {
        const body = JSON.parse(r.body);
        return body.data && Array.isArray(body.data);
      },
    });
    
    errorRate.add(productsRes.status !== 200);
    apiLatency.add(productsRes.timings.duration);
    
    sleep(1);
    
    // Get single product (if products exist)
    if (productsRes.status === 200) {
      const body = JSON.parse(productsRes.body);
      if (body.data && body.data.length > 0) {
        const productId = body.data[0].id;
        const productRes = http.get(`${BASE_URLS.api}/api/products/${productId}`, {
          tags: { name: 'get_product' },
        });
        
        check(productRes, {
          'product detail status is 200': (r) => r.status === 200,
        });
        
        apiLatency.add(productRes.timings.duration);
      }
    }
  });
  
  sleep(1);
  
  group('Categories API', function() {
    const categoriesRes = http.get(`${BASE_URLS.api}/api/categories`, {
      tags: { name: 'list_categories' },
    });
    
    check(categoriesRes, {
      'categories status is 200': (r) => r.status === 200,
    });
    
    errorRate.add(categoriesRes.status !== 200);
    apiLatency.add(categoriesRes.timings.duration);
  });
  
  sleep(1);
}

// Web Frontend Test Scenarios
export function webTests() {
  group('Landing Page', function() {
    const res = http.get(BASE_URLS.landing, {
      tags: { name: 'landing_page' },
    });
    
    check(res, {
      'landing page status is 200': (r) => r.status === 200,
      'landing page loads in < 3s': (r) => r.timings.duration < 3000,
    });
    
    errorRate.add(res.status !== 200);
    webLatency.add(res.timings.duration);
  });
  
  sleep(2);
  
  group('B2B Portal', function() {
    const res = http.get(BASE_URLS.b2b, {
      tags: { name: 'b2b_portal' },
    });
    
    check(res, {
      'b2b portal status is 200': (r) => r.status === 200,
    });
    
    webLatency.add(res.timings.duration);
  });
  
  sleep(2);
  
  group('B2C Portal', function() {
    const res = http.get(BASE_URLS.b2c, {
      tags: { name: 'b2c_portal' },
    });
    
    check(res, {
      'b2c portal status is 200': (r) => r.status === 200,
    });
    
    webLatency.add(res.timings.duration);
  });
  
  sleep(2);
}

// Authentication Flow Test
export function authFlowTest() {
  group('Authentication Flow', function() {
    // Register (if test user doesn't exist)
    const registerPayload = JSON.stringify({
      email: `test_${Date.now()}@knbiosciences.in`,
      password: 'TestPassword123!',
      name: 'Test User',
    });
    
    const registerRes = http.post(`${BASE_URLS.api}/api/auth/register`, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'register_user' },
    });
    
    check(registerRes, {
      'register status is 201 or 409': (r) => [201, 409].includes(r.status),
    });
    
    sleep(1);
    
    // Login
    const loginPayload = JSON.stringify({
      email: `test_${Date.now()}@knbiosciences.in`,
      password: 'TestPassword123!',
    });
    
    const loginRes = http.post(`${BASE_URLS.api}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login_user' },
    });
    
    check(loginRes, {
      'login status is 200 or 401': (r) => [200, 401].includes(r.status),
    });
    
    let token = null;
    if (loginRes.status === 200) {
      const body = JSON.parse(loginRes.body);
      token = body.data?.access_token;
    }
    
    sleep(1);
    
    // Get user profile (if logged in)
    if (token) {
      const profileRes = http.get(`${BASE_URLS.api}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        tags: { name: 'get_profile' },
      });
      
      check(profileRes, {
        'profile status is 200': (r) => r.status === 200,
      });
      
      apiLatency.add(profileRes.timings.duration);
    }
  });
  
  sleep(2);
}

// Order Flow Test (requires authentication)
export function orderFlowTest() {
  // This would require a valid authentication token
  // Implement based on your specific order flow
  
  group('Order Flow', function() {
    // 1. Get products
    const productsRes = http.get(`${BASE_URLS.api}/api/products?limit=5`);
    
    if (productsRes.status !== 200) {
      errorRate.add(true);
      return;
    }
    
    // 2. Add to cart
    // 3. Update cart quantities
    // 4. Create order
    // 5. Process payment (mock)
    // 6. Verify order
    
    // Placeholder for order flow
    console.log('Order flow test - implement with valid auth token');
  });
  
  sleep(2);
}

// Default function
export default function() {
  // Run API tests
  apiTests();
  
  // Run web tests
  webTests();
  
  // Run auth flow (occasionally)
  if (Math.random() < 0.1) {
    authFlowTest();
  }
}

// Handle summary for reporting
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    [`./test-results/load-tests/k6-${ENV}-${timestamp}.json`]: JSON.stringify(data),
    'stdout': textSummary(data),
  };
}

function textSummary(data) {
  const { http_req_duration, http_reqs, http_req_failed, errors, api_latency, web_latency } = data.metrics;
  
  return `
╔══════════════════════════════════════════════════════════╗
║           KN Biosciences Load Test Summary              ║
╠══════════════════════════════════════════════════════════╣
║ Environment: ${ENV.padEnd(45)}║
╠══════════════════════════════════════════════════════════╣
║ Requests:
║   Total: ${String(http_reqs.values.count).padEnd(49)}║
║   Rate: ${(http_reqs.values.rate * 60).toFixed(2) + '/min'.padEnd(46)}║
║
║ Latency:
║   HTTP P95: ${String(http_req_duration.values['p(95)'] + 'ms').padEnd(44)}║
║   HTTP Avg: ${(http_req_duration.values.avg.toFixed(2) + 'ms').padEnd(46)}║
║   API P95: ${String(api_latency?.values['p(95)'] + 'ms' || 'N/A').padEnd(45)}║
║   Web P95: ${String(web_latency?.values['p(95)'] + 'ms' || 'N/A').padEnd(45)}║
║
║ Errors:
║   HTTP Error Rate: ${(http_req_failed.values.rate * 100).toFixed(2) + '%'.padEnd(43)}║
║   Custom Error Rate: ${(errors.values.rate * 100).toFixed(2) + '%'.padEnd(43)}║
╚══════════════════════════════════════════════════════════╝
`;
}
