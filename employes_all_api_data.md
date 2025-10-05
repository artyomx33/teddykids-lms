# 🎯 ADÉLA JAROŠOVÁ - ULTIMATE DATA EXTRACTION PLAN

## 🚀 MISSION: Extract EVERYTHING possible from Employes.nl API

**Target Employee:** Adéla Jarošová
**Employee ID:** `b1bc1ed8-79f3-4f45-9790-2a16953879a1`
**Company ID:** `b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6`

---

## 📋 FIRST PRINCIPLES APPROACH

### 🔑 API Foundation
- **Base URL:** `https://connect.employes.nl/v4`
- **Authentication:** Bearer JWT token (stored in `EMPLOYES_API_KEY` env var)
- **API Version:** v4.0 (latest)
- **Content-Type:** `application/json`
- **Accept:** `application/json`

### 🎯 Data Categories to Extract
1. **Personal Information** (name, address, contact, nationality, BSN)
2. **Employment Records** (contracts, periods, status, departments)
3. **Salary Information** (current + historical wages, hourly rates, annual)
4. **Tax Details** (reduction status, tax periods, legal info)
5. **Payroll Data** (payruns, payslips, loonstroken)
6. **Work Schedule** (hours, days, employment type)
7. **Company Context** (department, job role, manager)

---

## 🎖️ COMPREHENSIVE ENDPOINT BATTLE PLAN

### 📊 PHASE 1: COMPANY CONTEXT
```
GET /{companyId}
```
**Purpose:** Get company information for context
**Data Expected:** Company name, address, settings

### 👥 PHASE 2: BASIC EMPLOYEE DATA
```
GET /{companyId}/employees/{employeeId}
```
**Purpose:** Get comprehensive employee profile
**Data Expected:**
- Personal: first_name, surname, initials, gender, date_of_birth
- Contact: email, phone_number, address (street, housenumber, zipcode, city, country_code)
- Identity: BSN, nationality, IBAN
- Employment: employee_number, status, department, position
- Administrative: dt_create, dt_update, administration_id

### 💼 PHASE 3: EMPLOYMENT RECORDS
```
GET /{companyId}/employees/{employeeId}/employments
```
**Purpose:** Get ALL employment periods (including historical)
**Data Expected:**
- Employment periods (start_date, end_date)
- Contract details (hours_per_week, days_per_week, employee_type)
- Employment status (active, terminated, etc.)
- Multiple employment records if renewals/changes occurred

### 💰 PHASE 4: SALARY & COMPENSATION
```
GET /{companyId}/employees/{employeeId}/employments/{employmentId}/salaries
```
**Purpose:** Get ALL salary periods and wage progressions
**Data Expected:**
- Historical salary changes (start_date, end_date for each period)
- Hourly wages (hour_wage)
- Monthly salaries (month_wage)
- Annual compensation (yearly_wage)
- Salary adjustment reasons
- Commission, bonuses, allowances

### 📋 PHASE 5: CONTRACT DETAILS
```
GET /{companyId}/employees/{employeeId}/employments/{employmentId}/contracts
```
**Purpose:** Get detailed contract information
**Data Expected:**
- Contract periods (start_date, end_date)
- Working hours (hours_per_week, max_hours, min_hours)
- Work schedule (days_per_week)
- Employment type (fulltime, parttime)
- Contract renewal history

### 🏢 PHASE 6: WORK SCHEDULE & HOURS
```
GET /{companyId}/employees/{employeeId}/employments/{employmentId}/hours
```
**Purpose:** Get detailed working hours and schedule
**Data Expected:**
- Weekly hours breakdown
- Daily work patterns
- Overtime policies
- Schedule variations
- Break times, shift patterns

### 💸 PHASE 7: TAX INFORMATION
```
GET /{companyId}/employees/{employeeId}/employments/{employmentId}/tax-details
```
**Purpose:** Get tax reduction status and legal details
**Data Expected:**
- Tax reduction eligibility (is_reduction_applied)
- Tax periods (start_date, end_date)
- Tax codes and categories
- Legal employment status
- Withholding details

### 📄 PHASE 8: PAYROLL HISTORY
```
GET /{companyId}/payruns
```
**Purpose:** Get ALL payroll periods that include Adéla
**Data Expected:**
- Payroll periods (monthly, weekly runs)
- Payment dates
- Payroll status
- Historical payroll data

### 💼 PHASE 9: PAYSLIPS & LOONSTROKEN
```
GET /{companyId}/payruns/{payrunId}/entries
```
**Purpose:** Get individual payslip entries for Adéla
**Data Expected:**
- Detailed payslip information (loonstroken)
- Gross pay, net pay, deductions
- Tax withholdings
- Benefit details
- Pay period breakdown

### 📊 PHASE 10: EMPLOYEE SYNC DATA
```
GET /{companyId}/employees/sync
```
**Purpose:** Get synchronized employee data with all details
**Data Expected:**
- Complete synchronized employee profiles
- Contract, salary, tax data in one call
- Most current information
- Relationship mappings

### 📋 PHASE 11: ANNUAL STATEMENTS
```
GET /{companyId}/employees/{employeeId}/employments/{employmentId}/annualStatement/{year}
```
**Purpose:** Get annual employment statements
**Data Expected:**
- Yearly income summaries
- Tax declarations
- Annual working hours
- Year-end employment status

---

## 🔧 TECHNICAL EXECUTION STRATEGY

### 🗂️ Data Structure Design
```json
{
  "employee_id": "b1bc1ed8-79f3-4f45-9790-2a16953879a1",
  "extraction_timestamp": "ISO_DATETIME",
  "company_context": { /* Company data */ },
  "personal_profile": { /* Basic employee info */ },
  "employment_history": [
    {
      "employment_id": "...",
      "period": { "start": "...", "end": "..." },
      "contracts": [ /* Contract details */ ],
      "salaries": [ /* Salary progression */ ],
      "hours": [ /* Work schedule */ ],
      "tax_details": [ /* Tax information */ ]
    }
  ],
  "payroll_history": [
    {
      "payrun_id": "...",
      "period": "...",
      "payslips": [ /* Individual payslips */ ]
    }
  ],
  "annual_statements": { /* Yearly summaries */ }
}
```

### 🔄 API Call Sequence
1. **Single Employee Call** → Get employeeId and basic info
2. **Employment List Call** → Get all employmentIds
3. **Parallel Detail Calls** → For each employment, get contracts/salaries/hours/tax
4. **Payrun Discovery** → Find payruns containing Adéla
5. **Payslip Extraction** → Get detailed payslips
6. **Annual Data** → Get yearly summaries

### 🛡️ Error Handling Strategy
- **403 Forbidden** → Check endpoint permissions, may need different auth
- **404 Not Found** → Endpoint may not exist for this employee
- **Empty Response** → Employee may not have data for this category
- **500 Internal Error** → API issue, retry with backoff

### 📊 Data Validation Approach
- **Cross-Reference** → Compare salary data across endpoints
- **Date Consistency** → Verify employment periods align
- **Completeness Check** → Ensure all expected fields present
- **Historical Accuracy** → Validate progression timeline

---

## 🎯 EXPECTED OUTCOMES

### ✅ Complete Personal Dossier
- Full name, address, contact information
- Date of birth, nationality, BSN
- Banking details (IBAN)

### ✅ Employment Timeline
- Complete employment history
- Contract periods and renewals
- Job role and department changes

### ✅ Salary Progression
- **HISTORICAL WAGES** (the holy grail!)
- Nov 2024: €2.577,00 → Dec 2024: €2.709,00 → Jun 2025: €2.777,00 → Jul 2025: €2.846,00
- Hourly rate progressions
- Annual salary calculations

### ✅ Payroll Evidence
- Monthly payslips (loonstroken)
- Tax withholdings and deductions
- Net vs gross pay breakdowns

### ✅ Legal & Tax Information
- Tax reduction status and periods
- Employment legal status
- Compliance information

### ✅ Work Schedule Details
- Hours per week progression
- Days worked patterns
- Employment type changes (part-time/full-time)

---

## 🚨 SUCCESS CRITERIA

### 🎖️ MISSION ACCOMPLISHED IF:
1. **Historical Salary Data Found** → We recover the Nov-Jul progression
2. **Complete Employment Timeline** → All contracts and periods mapped
3. **Payslip Collection** → Monthly loonstroken retrieved
4. **Personal Data Complete** → All contact and identity info
5. **Tax Information Complete** → Full legal employment status

### 🎯 BONUS OBJECTIVES:
- Department and role history
- Manager assignments
- Annual statement documents
- Any additional employment benefits

---

## 🔥 EXECUTION NOTES

### 🚀 API Authentication
- Use existing `EMPLOYES_API_KEY` from environment
- Ensure Bearer token format: `Authorization: Bearer {token}`

### 🎯 Error Recovery
- If employment endpoints fail → Use sync endpoint as fallback
- If individual calls fail → Try bulk endpoints
- If specific employmentId needed → Extract from employment list first

### 📊 Data Preservation
- Save ALL raw API responses for analysis
- Preserve exact JSON structure from each endpoint
- Document which endpoints contain which data types

### 🔍 Discovery Mode
- Test ALL endpoints even if they seem redundant
- Some endpoints may have different data or more details
- Historical data might be in unexpected places

---

## 💪 LET'S GET ADÉLA'S COMPLETE DATA!

**This plan will extract EVERYTHING Employes.nl knows about Adéla Jarošová. No stone left unturned. No data point missed. We're going to get her complete employment story, salary progression, payslips, tax details, and every piece of information available.**

**Time to execute and finally solve the salary progression mystery! 🚀**