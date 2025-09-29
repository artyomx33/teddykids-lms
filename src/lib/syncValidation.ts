import { EmployesEmployee, LMSStaff } from './employeesSync';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Comprehensive validation for employee data before sync
 * Includes Dutch labor law compliance checks
 */
export function validateEmployeeSync(employes: EmployesEmployee, lms?: LMSStaff): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Critical validations
  if (!employes.id) {
    errors.push({
      field: 'id',
      message: 'Employee ID is required',
      severity: 'critical'
    });
  }

  if (!employes.first_name || !employes.surname) {
    errors.push({
      field: 'name',
      message: 'Employee first name and surname are required',
      severity: 'critical'
    });
  }

  // Email validation
  if (employes.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employes.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        severity: 'error'
      });
    }
  } else {
    warnings.push({
      field: 'email',
      message: 'Email is missing',
      suggestion: 'Add employee email for better communication'
    });
  }

  // Phone number validation (Dutch format)
  if (employes.phone_number) {
    const dutchPhoneRegex = /^(\+31|0031|0)[1-9][0-9]{8}$/;
    const normalized = employes.phone_number.replace(/[\s\-\(\)]/g, '');
    if (!dutchPhoneRegex.test(normalized)) {
      warnings.push({
        field: 'phone_number',
        message: 'Phone number may not be in valid Dutch format',
        suggestion: 'Expected format: +31612345678 or 0612345678'
      });
    }
  }

  // BSN validation (if available)
  if (employes.iban) {
    const ibanRegex = /^NL\d{2}[A-Z]{4}\d{10}$/;
    if (!ibanRegex.test(employes.iban.replace(/\s/g, ''))) {
      warnings.push({
        field: 'iban',
        message: 'IBAN may not be in valid Dutch format',
        suggestion: 'Expected format: NL##BANK##########'
      });
    }
  }

  // Employment data validation
  if (employes.employment) {
    const { start_date, end_date, contract, salary } = employes.employment;

    // Date validations
    if (start_date) {
      const startDate = new Date(start_date);
      if (isNaN(startDate.getTime())) {
        errors.push({
          field: 'start_date',
          message: 'Invalid start date format',
          severity: 'error'
        });
      } else if (startDate > new Date()) {
        warnings.push({
          field: 'start_date',
          message: 'Start date is in the future',
          suggestion: 'Verify the employment start date'
        });
      }
    }

    if (end_date) {
      const endDate = new Date(end_date);
      const startDate = new Date(start_date);
      if (!isNaN(endDate.getTime()) && !isNaN(startDate.getTime())) {
        if (endDate < startDate) {
          errors.push({
            field: 'end_date',
            message: 'End date cannot be before start date',
            severity: 'error'
          });
        }
      }
    }

    // Contract validations
    if (contract) {
      if (contract.hours_per_week) {
        if (contract.hours_per_week < 0 || contract.hours_per_week > 60) {
          warnings.push({
            field: 'hours_per_week',
            message: 'Hours per week seems unusual',
            suggestion: 'Typical range is 0-40 hours for part-time, up to 40 for full-time'
          });
        }
      }
    }

    // Salary validations
    if (salary) {
      const minWageHourly = 12.00; // Approximate Dutch minimum wage 2025
      if (salary.hour_wage && salary.hour_wage < minWageHourly) {
        warnings.push({
          field: 'hour_wage',
          message: `Hourly wage (€${salary.hour_wage}) is below Dutch minimum wage`,
          suggestion: `Minimum wage is approximately €${minWageHourly}/hour for adults`
        });
      }

      // Cross-check hourly vs monthly wage
      if (salary.hour_wage && salary.month_wage && contract?.hours_per_week) {
        const expectedMonthly = salary.hour_wage * contract.hours_per_week * 4.33;
        const difference = Math.abs(salary.month_wage - expectedMonthly);
        if (difference > expectedMonthly * 0.15) { // 15% tolerance
          warnings.push({
            field: 'salary',
            message: 'Hourly and monthly wage calculations don\'t match',
            suggestion: 'Verify salary calculations'
          });
        }
      }
    }
  }

  // Dutch labor law specific validations
  if (employes.date_of_birth) {
    const birthDate = new Date(employes.date_of_birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (age < 16) {
      warnings.push({
        field: 'date_of_birth',
        message: 'Employee is under 16 years old',
        suggestion: 'Special labor law regulations apply for workers under 16'
      });
    }

    if (age < 18 && employes.employment?.contract?.hours_per_week) {
      const maxHoursForMinors = age < 16 ? 12 : 40;
      if (employes.employment.contract.hours_per_week > maxHoursForMinors) {
        errors.push({
          field: 'hours_per_week',
          message: `Working hours exceed legal limit for age ${age}`,
          severity: 'error'
        });
      }
    }
  }

  // Address validation
  if (employes.zipcode) {
    const dutchZipcodeRegex = /^\d{4}\s?[A-Z]{2}$/i;
    if (!dutchZipcodeRegex.test(employes.zipcode)) {
      warnings.push({
        field: 'zipcode',
        message: 'Zipcode may not be in valid Dutch format',
        suggestion: 'Expected format: 1234 AB'
      });
    }
  }

  // Conflict validation (if updating existing staff)
  if (lms) {
    // Check for data regression
    if (lms.email && employes.email && lms.email !== employes.email) {
      warnings.push({
        field: 'email',
        message: 'Email change detected',
        suggestion: 'Verify this is an intended change'
      });
    }

    if (lms.employee_number && employes.employee_number && lms.employee_number !== employes.employee_number) {
      errors.push({
        field: 'employee_number',
        message: 'Employee number mismatch',
        severity: 'error'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate bulk sync operation
 */
export function validateBulkSync(employees: EmployesEmployee[]): {
  totalEmployees: number;
  validEmployees: number;
  invalidEmployees: number;
  criticalIssues: number;
  results: Map<string, ValidationResult>;
} {
  const results = new Map<string, ValidationResult>();
  let validCount = 0;
  let criticalCount = 0;

  for (const employee of employees) {
    const validation = validateEmployeeSync(employee);
    results.set(employee.id, validation);
    
    if (validation.isValid) {
      validCount++;
    }
    
    const hasCritical = validation.errors.some(e => e.severity === 'critical');
    if (hasCritical) {
      criticalCount++;
    }
  }

  return {
    totalEmployees: employees.length,
    validEmployees: validCount,
    invalidEmployees: employees.length - validCount,
    criticalIssues: criticalCount,
    results
  };
}
