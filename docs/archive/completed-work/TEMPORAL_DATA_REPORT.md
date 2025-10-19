# 🔍 TEMPORAL DATA RECONNAISSANCE REPORT

**Generated:** 2025-10-05T07:18:50.913Z

---

## 📦 Raw Data Summary

- **Total Records:** 180
- **Unique Employees:** 110

### Records by Endpoint:

- `/employments`: 102 records
- `/employee`: 78 records

## 🔄 Changes Detected Summary

- **Total Changes:** 0

### Changes by Type:


## 📋 Recent Sync Sessions

| Session Type | Started | Status | Records |
|-------------|---------|--------|---------|
| history | 2025-10-05 | partial | 110 |
| snapshot | 2025-10-05 | partial | 110 |

---

## 👤 ALENA MASSELINK - COMPLETE HISTORY

**Employee ID:** `d2d0c793-0272-49e4-b6e7-c4b809a976ff`
**Full Name:** Alena Masselink
**Total Records:** 1

### 📸 Current Snapshot

```json
{
  "id": "d2d0c793-0272-49e4-b6e7-c4b809a976ff",
  "city": "Leiderdorp",
  "iban": "NL77RABO0375960678",
  "email": "alena.masselink@gmail.com",
  "gender": "female",
  "status": "active",
  "street": "Raaphorst",
  "surname": "Masselink",
  "zipcode": "2352KJ",
  "initials": "A.",
  "dt_create": "0001-01-01T00:00:00",
  "dt_update": "2025-07-02T14:22:15.133794",
  "employment": {
    "salary": {
      "hour_wage": 18.24,
      "month_wage": 2846,
      "start_date": "2025-07-01T00:00:00",
      "yearly_wage": 32785.961
    },
    "contract": {
      "max_hours": 0,
      "min_hours": 0,
      "start_date": "2025-01-02T00:00:00",
      "days_per_week": 4,
      "employee_type": "parttime",
      "hours_per_week": 32
    },
    "start_date": "2024-09-01T00:00:00",
    "tax_details": {
      "start_date": "2024-09-01T00:00:00",
      "is_reduction_applied": true
    }
  },
  "first_name": "Alena",
  "housenumber": "23",
  "yearly_wage": 21998.15,
  "country_code": "NL",
  "phone_number": "0682002139",
  "date_of_birth": "1987-03-04T00:00:00",
  "surname_prefix": "",
  "employee_number": 167,
  "employee_type_id": 3,
  "administration_id": "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6"
}
```

### 📜 Historical Records

| Collected | Endpoint | Effective From | Is Latest |
|-----------|----------|----------------|-----------|
| 2025-10-05 | `/employee` | 2025-10-05 | ✅ |

### 🔄 Detected Changes

_No changes detected yet. Run the change-detector service to analyze her history._

### 📦 Complete Raw Data Dump

<details>
<summary>Click to expand all 1 records</summary>

```json
[
  {
    "id": "fb47fe23-16dd-41bc-8d12-376309e935d7",
    "employee_id": "d2d0c793-0272-49e4-b6e7-c4b809a976ff",
    "endpoint": "/employee",
    "api_response": {
      "id": "d2d0c793-0272-49e4-b6e7-c4b809a976ff",
      "city": "Leiderdorp",
      "iban": "NL77RABO0375960678",
      "email": "alena.masselink@gmail.com",
      "gender": "female",
      "status": "active",
      "street": "Raaphorst",
      "surname": "Masselink",
      "zipcode": "2352KJ",
      "initials": "A.",
      "dt_create": "0001-01-01T00:00:00",
      "dt_update": "2025-07-02T14:22:15.133794",
      "employment": {
        "salary": {
          "hour_wage": 18.24,
          "month_wage": 2846,
          "start_date": "2025-07-01T00:00:00",
          "yearly_wage": 32785.961
        },
        "contract": {
          "max_hours": 0,
          "min_hours": 0,
          "start_date": "2025-01-02T00:00:00",
          "days_per_week": 4,
          "employee_type": "parttime",
          "hours_per_week": 32
        },
        "start_date": "2024-09-01T00:00:00",
        "tax_details": {
          "start_date": "2024-09-01T00:00:00",
          "is_reduction_applied": true
        }
      },
      "first_name": "Alena",
      "housenumber": "23",
      "yearly_wage": 21998.15,
      "country_code": "NL",
      "phone_number": "0682002139",
      "date_of_birth": "1987-03-04T00:00:00",
      "surname_prefix": "",
      "employee_number": 167,
      "employee_type_id": 3,
      "administration_id": "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6"
    },
    "data_hash": "{\"id\":\"d2d0c793-0272-49e4-b6e7-c4b809a976ff\",\"administration_id\":\"b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6\",\"employee_type_id\":3,\"first_name\":\"Alena\",\"surname\":\"Masselink\",\"initials\":\"A.\",\"surname_prefix\":\"\",\"gender\":\"female\",\"date_of_birth\":\"1987-03-04T00:00:00\",\"zipcode\":\"2352KJ\",\"city\":\"Leiderdorp\",\"street\":\"Raaphorst\",\"housenumber\":\"23\",\"country_code\":\"NL\",\"iban\":\"NL77RABO0375960678\",\"status\":\"active\",\"dt_create\":\"0001-01-01T00:00:00\",\"dt_update\":\"2025-07-02T14:22:15.133794\",\"employment\":{\"start_date\":\"2024-09-01T00:00:00\",\"contract\":{\"start_date\":\"2025-01-02T00:00:00\",\"hours_per_week\":32,\"max_hours\":0,\"min_hours\":0,\"days_per_week\":4,\"employee_type\":\"parttime\"},\"tax_details\":{\"start_date\":\"2024-09-01T00:00:00\",\"is_reduction_applied\":true},\"salary\":{\"start_date\":\"2025-07-01T00:00:00\",\"hour_wage\":18.24,\"month_wage\":2846,\"yearly_wage\":32785.961}},\"email\":\"alena.masselink@gmail.com\",\"phone_number\":\"0682002139\",\"employee_number\":167,\"yearly_wage\":21998.15}",
    "collected_at": "2025-10-05T07:17:38.294+00:00",
    "effective_from": "2025-10-05T07:17:38.294+00:00",
    "effective_to": null,
    "is_latest": true,
    "superseded_by": null,
    "supersedes": null,
    "sync_session_id": "354e4108-8153-4100-9194-e56cc8e476f4",
    "confidence_score": 1
  }
]
```
</details>
