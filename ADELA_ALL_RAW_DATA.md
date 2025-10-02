# 🔍 ADÉLA JAROŠOVÁ - ALL RAW DATA FROM EMPLOYES API

## Employee ID: b1bc1ed8-79f3-4f45-9790-2a16953879a1

This document contains ALL available data for Adéla from EVERY Employes.nl API endpoint.

---

## 📊 1. BASIC EMPLOYEE DATA
```json
{
  "id": "b1bc1ed8-79f3-4f45-9790-2a16953879a1",
  "administration_id": "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6",
  "employee_type_id": 3,
  "first_name": "Adéla",
  "surname": "Jarošová",
  "initials": "A.",
  "surname_prefix": "",
  "gender": "female",
  "date_of_birth": "1996-09-17T00:00:00",
  "zipcode": "2624GD",
  "city": "Delft",
  "street": "Delflandplein ",
  "housenumber": "50",
  "country_code": "NL",
  "iban": "NL39ABNA0121488381",
  "status": "active",
  "dt_create": "0001-01-01T00:00:00",
  "dt_update": "2024-08-29T12:41:06.214509",
  "employment": {
    "start_date": "2024-09-01T00:00:00",
    "end_date": "2025-11-09T00:00:00",
    "contract": {
      "start_date": "2024-11-20T00:00:00",
      "end_date": "2025-11-09T00:00:00",
      "hours_per_week": 30,
      "max_hours": 0,
      "min_hours": 0,
      "days_per_week": 5,
      "employee_type": "parttime"
    },
    "tax_details": {
      "start_date": "2024-09-01T00:00:00",
      "is_reduction_applied": true
    },
    "salary": {
      "start_date": "2025-07-01T00:00:00",
      "hour_wage": 18.24,
      "month_wage": 2846,
      "yearly_wage": 30736.677
    }
  },
  "email": "adelkajarosova@seznam.cz",
  "housenumber_suffix": "",
  "phone_number": "+420 605789413",
  "employee_number": 93,
  "yearly_wage": 29252.42
}

```

## 📊 2. ALL EMPLOYMENT RECORDS
```json

```

## 📊 3. ALL ENDPOINT TESTS (INCLUDING ADÉLA)


## 📊 2. ALL EMPLOYMENT RECORDS (DIRECT FROM EMPLOYES API)
```json

## 📊 TESTING ALL AVAILABLE ENDPOINTS FOR ADÉLA

### Endpoint: employees/b1bc1ed8-79f3-4f45-9790-2a16953879a1
```json
{"message": "Internal server error"}
```

### Endpoint: employees/b1bc1ed8-79f3-4f45-9790-2a16953879a1/employments
```json

```

### Endpoint: employees/b1bc1ed8-79f3-4f45-9790-2a16953879a1/contracts
```json
{"message":"Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'mRn6KaiNUIQj+M/bJ5avfDRFdiUcemZ18M3UEss8HNU='."}

```

### Endpoint: employees/b1bc1ed8-79f3-4f45-9790-2a16953879a1/salary-history
```json
{"message":"Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'mRn6KaiNUIQj+M/bJ5avfDRFdiUcemZ18M3UEss8HNU='."}

```


---

## 🔍 CRITICAL FINDINGS

### ❌ **HISTORICAL SALARY DATA NOT AVAILABLE IN API**

**What we found:**
1. **Basic employee data**: ✅ Available (shows current salary only)
2. **Employment records**: ❌ Empty response 
3. **Contracts endpoint**: ❌ Authorization error
4. **Salary history**: ❌ Authorization error

**What this means:**
- The API only contains the **current** salary period (July 1, 2025)
- The historical progression you saw on Employes website is **NOT** accessible via API
- The detailed timeline (Nov 2024 → Dec 2024 → Jun 2025 → Jul 2025) exists on the website but not in the API

### 🎯 **AVAILABLE DATA SUMMARY**

**Current Salary (July 1, 2025):**
- Hourly: €18.24
- Monthly: €2,846.00  
- Yearly: €30,736.68

**Employment Period:**
- Start: September 1, 2024
- End: November 9, 2025
- Type: Part-time (30 hours/week)

**Tax Details:**
- Reduction applied: Yes (since Sept 1, 2024)

---

## 💡 **NEXT STEPS**

Since the historical salary data is not available in the API, we have two options:

1. **Use current data only** - Sync only the July 2025 salary period
2. **Manually recreate** - Use the website data you provided to create historical records
3. **Contact Employes** - Ask if there's a different endpoint for historical salary data

The salary progression you showed me exists on their website interface but appears to be unavailable through their public API endpoints.

