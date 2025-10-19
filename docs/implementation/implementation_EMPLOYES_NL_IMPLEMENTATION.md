# 🎯 **EMPLOYES.NL PERFECT IMPLEMENTATION GUIDE**

> **The definitive guide for TeddyKids LMS ↔ Employes.nl integration**
> *No workarounds, no hacks, just perfect production-ready code!* 🚀

---

## 📋 **QUICK REFERENCE**

- **API Base URL:** `https://connect.employes.nl/v4`
- **Company ID:** `b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6` (Teddy Kids Daycare)
- **Authentication:** Bearer JWT token
- **Rate Limit:** 5 requests/second
- **CORS:** Not supported (use edge functions)

---

## 🔑 **AUTHENTICATION SETUP**

### 1. **Generate API Token**
1. Login to [Employes.nl](https://employes.nl)
2. Click your name (bottom left corner)
3. Navigate to account settings
4. Generate new API token
5. **CRITICAL:** Token is valid for 1 year - set calendar reminder!

### 2. **Token Format Validation**
```javascript
// ✅ CORRECT JWT Format (3 parts separated by dots):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{payload}.{signature}

// ❌ WRONG Format (hashed/processed token):
28f4e104bd574452b303706f75f905b5...
```

### 3. **Environment Configuration**
```bash
# .env
EMPLOYES_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."

# Supabase Secrets
npx supabase secrets set EMPLOYES_API_KEY="your_jwt_token_here"
```

---

## 🌐 **API ENDPOINTS (CORRECT STRUCTURE)**

### Base Structure
```typescript
const EMPLOYES_BASE_URL = 'https://connect.employes.nl/v4';
const COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
```

### ✅ **CORRECT URLs**
```typescript
const endpoints = {
  // ✅ Employees endpoint
  employees: `${EMPLOYES_BASE_URL}/${COMPANY_ID}/employees`,
  // Result: https://connect.employes.nl/v4/b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6/employees

  // ✅ Payruns endpoint
  payruns: `${EMPLOYES_BASE_URL}/${COMPANY_ID}/payruns`,

  // ✅ Employee employments
  employments: `${EMPLOYES_BASE_URL}/${COMPANY_ID}/employees/{employeeId}/employments`,

  // ✅ Payrun employee data
  payrunEmployee: `${EMPLOYES_BASE_URL}/${COMPANY_ID}/payruns/{payrunId}/employee/{employeeId}`
};
```

### ❌ **WRONG URLs (Common Mistakes)**
```typescript
// ❌ Don't add /companies in path
`${EMPLOYES_BASE_URL}/companies/${COMPANY_ID}/employees`

// ❌ Don't use old dev API
`https://api-dev.employes.nl/api/v1/employees`

// ❌ Don't use wrong version
`https://connect.employes.nl/v3/${COMPANY_ID}/employees`
```

---

## 🔧 **EDGE FUNCTION IMPLEMENTATION**

### Authentication Headers
```typescript
const headers = {
  'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
```

### Request Function Template
```typescript
async function employesRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<EmployesResponse<T>> {
  if (!EMPLOYES_API_KEY) {
    return { error: 'Employes API key not configured' };
  }

  const config: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);

    if (response.ok) {
      const data = await response.json();
      return { data, status: response.status };
    } else {
      const errorText = await response.text();
      return {
        error: `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        status: response.status
      };
    }
  } catch (networkError: any) {
    return { error: `Network error: ${networkError.message}` };
  }
}
```

---

## 📊 **API USAGE PATTERNS**

### Fetch Employees (with Pagination)
```typescript
async function fetchEmployees(): Promise<EmployesEmployee[]> {
  let allEmployees: EmployesEmployee[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const url = `${EMPLOYES_BASE_URL}/${COMPANY_ID}/employees?page=${currentPage}&per_page=100`;
    const result = await employesRequest<any>(url);

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.data && result.data.data) {
      allEmployees = allEmployees.concat(result.data.data);
      totalPages = result.data.pages || 1;
      currentPage++;
    } else {
      break;
    }
  } while (currentPage <= totalPages);

  return allEmployees;
}
```

### Add Employee
```typescript
async function addEmployee(employeeData: EmployeeCreateData) {
  const endpoint = `${EMPLOYES_BASE_URL}/${COMPANY_ID}/employees`;
  return await employesRequest(endpoint, 'POST', employeeData);
}
```

### Add Employment Contract
```typescript
async function addEmployment(employeeId: string, employmentData: EmploymentData) {
  const endpoint = `${EMPLOYES_BASE_URL}/${COMPANY_ID}/employees/${employeeId}/employments`;
  return await employesRequest(endpoint, 'POST', employmentData);
}
```

---

## 🧪 **TESTING & VALIDATION**

### Connection Test Script
```javascript
// test-connection.js
const companyId = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
const employesKey = process.env.EMPLOYES_API_KEY;

const response = await fetch(`https://connect.employes.nl/v4/${companyId}/employees?per_page=1`, {
  headers: { 'Authorization': `Bearer ${employesKey}` }
});

console.log('Status:', response.status);
console.log('Connected:', response.ok);
```

### JWT Token Validation
```typescript
function validateJWT(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    if (payload.exp && payload.exp < now) {
      console.warn('JWT token expired!');
      return false;
    }

    // Check issuer
    if (!payload.iss || !payload.iss.includes('employes.nl')) {
      console.warn('Invalid JWT issuer');
      return false;
    }

    return true;
  } catch (error) {
    console.error('JWT validation failed:', error);
    return false;
  }
}
```

---

## 📁 **DATA STRUCTURES**

### Employee Interface
```typescript
interface EmployesEmployee {
  // Basic info
  id: string;
  first_name: string;
  surname: string;
  initials?: string;
  surname_prefix?: string;
  date_of_birth?: string;
  nationality_id?: string;
  gender?: 'male' | 'female';
  personal_identification_number?: string;

  // Address info
  street?: string;
  housenumber?: string;
  zipcode?: string;
  city?: string;
  country_code?: string;

  // Employment info
  status?: 'pending' | 'active' | 'out of service';
  employee_number?: string;
  department?: string;
  position?: string;

  // Contact info
  email?: string;
  phone?: string;

  // Contract info
  start_date?: string;
  end_date?: string;
  hours_per_week?: number;
  salary?: number;
}
```

### API Response Structure
```typescript
interface EmployesResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

// Paginated responses
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  page: number;
  per_page: number;
}
```

---

## ⚠️ **COMMON PITFALLS & SOLUTIONS**

### 1. **"Invalid key=value pair" Error**
```bash
# ❌ Problem: Using hashed/processed token instead of raw JWT
EMPLOYES_API_KEY="28f4e104bd574452b303706f75f905b5..."

# ✅ Solution: Use the actual JWT from Employes.nl
EMPLOYES_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
```

### 2. **404 Not Found Errors**
```typescript
// ❌ Wrong: Adding /companies in URL
`https://connect.employes.nl/v4/companies/${companyId}/employees`

// ✅ Correct: Direct company path
`https://connect.employes.nl/v4/${companyId}/employees`
```

### 3. **401 Unauthorized Errors**
- Check token expiration (1 year validity)
- Verify Bearer token format: `Bearer ${token}`
- Ensure token has correct scopes/permissions

### 4. **429 Rate Limit Errors**
```typescript
// Implement rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Max 5 requests per second
await delay(200); // Wait 200ms between requests
```

---

## 🔄 **SYNC STRATEGIES**

### Employee Matching Logic
```typescript
function matchEmployeeByName(lmsStaff: StaffMember[], employesEmployee: EmployesEmployee) {
  const employesFullName = `${employesEmployee.first_name} ${
    employesEmployee.surname_prefix ? employesEmployee.surname_prefix + ' ' : ''
  }${employesEmployee.surname}`.toLowerCase();

  return lmsStaff.find(staff =>
    staff.full_name.toLowerCase() === employesFullName
  );
}
```

### Incremental Sync Pattern
```typescript
async function syncEmployees() {
  const employesData = await fetchEmployees();
  const lmsStaff = await fetchLMSStaff();

  for (const employee of employesData) {
    const match = matchEmployeeByName(lmsStaff, employee);

    if (!match) {
      // Create new LMS staff member
      await createLMSStaff(employee);
    } else if (hasChanges(match, employee)) {
      // Update existing LMS staff member
      await updateLMSStaff(match.id, employee);
    }
  }
}
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### Pre-deployment
- [ ] JWT token validated and not expired
- [ ] Environment variables set correctly
- [ ] URL paths verified against API docs
- [ ] Rate limiting implemented
- [ ] Error handling in place

### Testing
- [ ] Connection test passes
- [ ] Employee fetch works
- [ ] Pagination handles multiple pages
- [ ] Error responses handled gracefully
- [ ] Sync logs are created

### Deployment
```bash
# Deploy edge function
npx supabase functions deploy employes-integration

# Test deployed function
node test-connection.js

# Monitor logs
npx supabase functions logs employes-integration
```

---

## 🔧 **TROUBLESHOOTING GUIDE**

### Debug Connection Issues
```typescript
async function debugConnection() {
  const token = Deno.env.get('EMPLOYES_API_KEY');

  console.log('Token length:', token?.length);
  console.log('Token format:', token?.includes('.') ? 'JWT' : 'Hash');

  // Test each endpoint incrementally
  const tests = [
    `${EMPLOYES_BASE_URL}/companies`,
    `${EMPLOYES_BASE_URL}/${COMPANY_ID}`,
    `${EMPLOYES_BASE_URL}/${COMPANY_ID}/employees?per_page=1`
  ];

  for (const url of tests) {
    const result = await employesRequest(url);
    console.log(`${url}: ${result.error ? 'FAILED' : 'SUCCESS'}`);
  }
}
```

### Monitor API Health
```typescript
async function checkAPIHealth() {
  const response = await fetch(`${EMPLOYES_BASE_URL}/companies`, {
    headers: { 'Authorization': `Bearer ${EMPLOYES_API_KEY}` }
  });

  return {
    status: response.status,
    healthy: response.ok,
    headers: Object.fromEntries(response.headers.entries())
  };
}
```

---

## 📚 **REFERENCE LINKS**

- **Employes.nl Developer Docs:** https://developer.employes.nl/docs/getting-started
- **API Authentication:** https://developer.employes.nl/docs/authentication
- **Employee Endpoints:** https://developer.employes.nl/docs/importing-employees
- **Wage Components:** https://developer.employes.nl/docs/regulations
- **Rate Limits:** https://developer.employes.nl/docs/rate-limits

---

## 🎯 **SUCCESS METRICS**

### Integration Health Indicators
- [ ] Connection tests pass consistently
- [ ] Employee sync completes without errors
- [ ] API calls stay under rate limits
- [ ] Data mapping accuracy > 95%
- [ ] Sync logs show successful operations

### Performance Targets
- Employee sync: < 30 seconds for 100 employees
- API response time: < 2 seconds average
- Error rate: < 1% of total requests
- Uptime: > 99.5%

---

## 🔄 **MAINTENANCE SCHEDULE**

### Monthly
- [ ] Check JWT token expiration (11 months remaining)
- [ ] Review sync logs for errors
- [ ] Validate employee data accuracy

### Quarterly
- [ ] Performance optimization review
- [ ] API endpoint health check
- [ ] Update employee mapping logic if needed

### Yearly
- [ ] **CRITICAL:** Renew JWT token before expiration
- [ ] Full integration testing
- [ ] Documentation updates

---

**🎉 Ready to rock! This integration is now bulletproof!** 🚀

*Last updated: 2025-01-27*
*Version: 1.0*
*Status: Production Ready ✅*