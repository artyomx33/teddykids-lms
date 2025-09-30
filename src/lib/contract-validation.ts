/**
 * CONTRACT DATA VALIDATION & SYNC PREVENTION
 *
 * This module provides comprehensive validation and sync mechanisms
 * to prevent future data inconsistencies in the contract system.
 */

import { supabase } from "@/integrations/supabase/client";
import { UnifiedContract } from "@/types/contracts-unified";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  recommendation: string;
}

export interface SyncIntegrityCheck {
  staff_id: string;
  staff_name: string;
  issues: IntegrityIssue[];
  recommendations: string[];
  auto_fixable: boolean;
}

export interface IntegrityIssue {
  type: 'missing_contract' | 'orphaned_contract' | 'data_mismatch' | 'duplicate_active';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affected_records: string[];
}

export class ContractValidationService {

  /**
   * COMPREHENSIVE CONTRACT VALIDATION
   */

  /**
   * Validate contract data before creation/update
   */
  static async validateContract(contractData: Partial<UnifiedContract>): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required field validation
    await this.validateRequiredFields(contractData, errors);

    // Business logic validation
    await this.validateBusinessRules(contractData, errors, warnings);

    // Dutch labor law validation
    await this.validateDutchLaborLaw(contractData, errors, warnings);

    // Data consistency validation
    await this.validateDataConsistency(contractData, errors, warnings);

    // Integration validation
    await this.validateIntegrationData(contractData, errors, warnings);

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate staff-contract relationship integrity
   */
  static async validateStaffContractIntegrity(staffId: string): Promise<SyncIntegrityCheck> {
    const issues: IntegrityIssue[] = [];
    const recommendations: string[] = [];

    try {
      // Get staff record
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();

      if (staffError || !staff) {
        issues.push({
          type: 'missing_contract',
          severity: 'high',
          description: 'Staff record not found',
          affected_records: [staffId],
        });
        return {
          staff_id: staffId,
          staff_name: 'Unknown',
          issues,
          recommendations: ['Create or fix staff record'],
          auto_fixable: false,
        };
      }

      // Check for orphaned contracts (contracts without staff_id but matching name)
      const { data: orphanedContracts } = await supabase
        .from('contracts')
        .select('id, employee_name, status')
        .is('staff_id', null)
        .ilike('employee_name', staff.full_name);

      if (orphanedContracts && orphanedContracts.length > 0) {
        issues.push({
          type: 'orphaned_contract',
          severity: 'high',
          description: `Found ${orphanedContracts.length} orphaned contracts for ${staff.full_name}`,
          affected_records: orphanedContracts.map(c => c.id),
        });
        recommendations.push('Link orphaned contracts to staff record');
      }

      // Check for multiple active contracts
      const { data: activeContracts } = await supabase
        .from('contracts')
        .select('id, status, start_date, end_date')
        .eq('staff_id', staffId)
        .eq('status', 'active');

      if (activeContracts && activeContracts.length > 1) {
        issues.push({
          type: 'duplicate_active',
          severity: 'medium',
          description: `Staff has ${activeContracts.length} active contracts`,
          affected_records: activeContracts.map(c => c.id),
        });
        recommendations.push('Review and deactivate overlapping contracts');
      }

      // Check for data mismatches between staff and contract
      const { data: contracts } = await supabase
        .from('contracts_unified')
        .select('*')
        .eq('staff_id', staffId);

      if (contracts) {
        for (const contract of contracts) {
          if (contract.employee_name !== staff.full_name) {
            issues.push({
              type: 'data_mismatch',
              severity: 'medium',
              description: `Contract name "${contract.employee_name}" doesn't match staff name "${staff.full_name}"`,
              affected_records: [contract.id],
            });
            recommendations.push('Synchronize employee names between tables');
          }

          // Check salary consistency
          if (staff.salary_amount && contract.monthly_wage &&
              Math.abs(staff.salary_amount - contract.monthly_wage) > 10) {
            issues.push({
              type: 'data_mismatch',
              severity: 'low',
              description: `Salary mismatch: Staff table (€${staff.salary_amount}) vs Contract (€${contract.monthly_wage})`,
              affected_records: [contract.id],
            });
            recommendations.push('Synchronize salary data between systems');
          }
        }
      }

      // Determine if issues are auto-fixable
      const autoFixable = issues.every(issue =>
        issue.type === 'orphaned_contract' ||
        (issue.type === 'data_mismatch' && issue.severity !== 'high')
      );

      return {
        staff_id: staffId,
        staff_name: staff.full_name,
        issues,
        recommendations,
        auto_fixable: autoFixable,
      };

    } catch (error) {
      console.error('Error validating staff-contract integrity:', error);
      return {
        staff_id: staffId,
        staff_name: 'Error',
        issues: [{
          type: 'missing_contract',
          severity: 'high',
          description: 'Error checking integrity',
          affected_records: [],
        }],
        recommendations: ['Manual review required'],
        auto_fixable: false,
      };
    }
  }

  /**
   * System-wide integrity check
   */
  static async performSystemIntegrityCheck(): Promise<{
    totalChecked: number;
    issuesFound: number;
    autoFixable: number;
    criticalIssues: number;
    summary: SyncIntegrityCheck[];
  }> {
    const { data: allStaff, error } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active');

    if (error || !allStaff) {
      throw new Error('Failed to fetch staff for integrity check');
    }

    const results: SyncIntegrityCheck[] = [];
    let totalIssues = 0;
    let autoFixableCount = 0;
    let criticalIssues = 0;

    for (const staff of allStaff) {
      const check = await this.validateStaffContractIntegrity(staff.id);
      results.push(check);

      totalIssues += check.issues.length;
      if (check.auto_fixable) autoFixableCount++;
      criticalIssues += check.issues.filter(i => i.severity === 'high').length;
    }

    return {
      totalChecked: allStaff.length,
      issuesFound: totalIssues,
      autoFixable: autoFixableCount,
      criticalIssues,
      summary: results.filter(r => r.issues.length > 0),
    };
  }

  /**
   * SYNC PREVENTION MECHANISMS
   */

  /**
   * Pre-sync validation hook for Employes.nl integration
   */
  static async validateEmployesSync(employeeData: any): Promise<{
    canSync: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if staff record exists
      const { data: existingStaff } = await supabase
        .from('staff')
        .select('id, full_name')
        .ilike('full_name', `${employeeData.first_name} ${employeeData.surname}`)
        .maybeSingle();

      if (!existingStaff) {
        issues.push('No matching staff record found in LMS');
        recommendations.push('Create staff record before syncing contract data');
      }

      // Check for conflicting active contracts
      if (existingStaff) {
        const { data: activeContracts } = await supabase
          .from('contracts')
          .select('id, status, start_date, end_date')
          .eq('staff_id', existingStaff.id)
          .eq('status', 'active');

        if (activeContracts && activeContracts.length > 0) {
          // Check for date overlaps
          const newStartDate = new Date(employeeData.employment?.start_date);
          const newEndDate = employeeData.employment?.end_date ? new Date(employeeData.employment.end_date) : null;

          for (const contract of activeContracts) {
            const existingStart = new Date(contract.start_date);
            const existingEnd = contract.end_date ? new Date(contract.end_date) : null;

            if (this.datesOverlap(newStartDate, newEndDate, existingStart, existingEnd)) {
              issues.push(`Sync would create overlapping contract periods`);
              recommendations.push('Resolve date conflicts before syncing');
            }
          }
        }
      }

      // Validate employment data completeness
      if (!employeeData.employment?.start_date) {
        issues.push('Missing employment start date');
      }

      if (!employeeData.employment?.salary?.month_wage) {
        issues.push('Missing salary information');
      }

      return {
        canSync: issues.length === 0,
        issues,
        recommendations,
      };

    } catch (error) {
      console.error('Error validating Employes sync:', error);
      return {
        canSync: false,
        issues: ['Error validating sync data'],
        recommendations: ['Review sync data manually'],
      };
    }
  }

  /**
   * Post-sync validation to ensure data integrity
   */
  static async validatePostSync(staffId: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Check that contract was created/updated properly
      const { data: contracts } = await supabase
        .from('contracts')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!contracts || contracts.length === 0) {
        errors.push({
          field: 'contract',
          code: 'MISSING_CONTRACT',
          message: 'No contract found after sync',
          severity: 'error',
        });
      } else {
        const contract = contracts[0];

        // Validate contract has required data
        if (!contract.staff_id) {
          errors.push({
            field: 'staff_id',
            code: 'MISSING_STAFF_LINK',
            message: 'Contract not properly linked to staff',
            severity: 'error',
          });
        }

        if (!contract.start_date) {
          errors.push({
            field: 'start_date',
            code: 'MISSING_START_DATE',
            message: 'Contract missing start date',
            severity: 'error',
          });
        }

        // Check for related records
        const { data: salaryInfo } = await supabase
          .from('contract_salary_info')
          .select('id')
          .eq('contract_id', contract.id)
          .maybeSingle();

        if (!salaryInfo) {
          warnings.push({
            field: 'salary_info',
            code: 'MISSING_SALARY',
            message: 'Contract missing salary information',
            recommendation: 'Create salary info record',
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };

    } catch (error) {
      console.error('Error validating post-sync:', error);
      return {
        isValid: false,
        errors: [{
          field: 'system',
          code: 'VALIDATION_ERROR',
          message: 'Error during post-sync validation',
          severity: 'error',
        }],
        warnings: [],
      };
    }
  }

  /**
   * AUTO-FIX CAPABILITIES
   */

  /**
   * Automatically fix common data inconsistencies
   */
  static async autoFixIntegrityIssues(staffId: string): Promise<{
    fixed: string[];
    failed: string[];
    warnings: string[];
  }> {
    const fixed: string[] = [];
    const failed: string[] = [];
    const warnings: string[] = [];

    try {
      const integrityCheck = await this.validateStaffContractIntegrity(staffId);

      if (!integrityCheck.auto_fixable) {
        warnings.push('Issues found but require manual intervention');
        return { fixed, failed, warnings };
      }

      for (const issue of integrityCheck.issues) {
        try {
          switch (issue.type) {
            case 'orphaned_contract':
              // Link orphaned contracts
              for (const contractId of issue.affected_records) {
                await supabase
                  .from('contracts')
                  .update({ staff_id: staffId })
                  .eq('id', contractId);
                fixed.push(`Linked contract ${contractId} to staff`);
              }
              break;

            case 'data_mismatch':
              // Sync employee names
              const { data: staff } = await supabase
                .from('staff')
                .select('full_name')
                .eq('id', staffId)
                .single();

              if (staff) {
                await supabase
                  .from('contracts')
                  .update({ employee_name: staff.full_name })
                  .eq('staff_id', staffId);
                fixed.push('Synchronized employee names');
              }
              break;

            default:
              warnings.push(`Cannot auto-fix issue type: ${issue.type}`);
          }
        } catch (fixError) {
          failed.push(`Failed to fix ${issue.type}: ${fixError.message}`);
        }
      }

      return { fixed, failed, warnings };

    } catch (error) {
      console.error('Error in auto-fix:', error);
      return {
        fixed,
        failed: ['Auto-fix process failed'],
        warnings,
      };
    }
  }

  /**
   * PRIVATE VALIDATION METHODS
   */

  private static async validateRequiredFields(
    contractData: Partial<UnifiedContract>,
    errors: ValidationError[]
  ): Promise<void> {
    const requiredFields = [
      'staff_id',
      'employee_name',
      'contract_type',
      'employment_type',
      'start_date',
    ];

    for (const field of requiredFields) {
      if (!contractData[field as keyof UnifiedContract]) {
        errors.push({
          field,
          code: 'REQUIRED_FIELD',
          message: `${field} is required`,
          severity: 'error',
        });
      }
    }
  }

  private static async validateBusinessRules(
    contractData: Partial<UnifiedContract>,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    // Date validation
    if (contractData.start_date && contractData.end_date) {
      const startDate = new Date(contractData.start_date);
      const endDate = new Date(contractData.end_date);

      if (endDate <= startDate) {
        errors.push({
          field: 'end_date',
          code: 'INVALID_DATE_RANGE',
          message: 'End date must be after start date',
          severity: 'error',
        });
      }

      // Check for reasonable contract duration
      const durationMonths = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (durationMonths > 36) {
        warnings.push({
          field: 'end_date',
          code: 'LONG_CONTRACT',
          message: 'Contract duration exceeds 36 months',
          recommendation: 'Consider Dutch chain rule implications',
        });
      }
    }

    // Salary validation
    if (contractData.salary_info?.monthly_wage) {
      const minWage = 1800; // Approximate Dutch minimum wage
      if (contractData.salary_info.monthly_wage < minWage) {
        warnings.push({
          field: 'salary_info.monthly_wage',
          code: 'LOW_SALARY',
          message: `Salary below minimum wage threshold (€${minWage})`,
          recommendation: 'Verify salary amount',
        });
      }
    }
  }

  private static async validateDutchLaborLaw(
    contractData: Partial<UnifiedContract>,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!contractData.staff_id) return;

    // Check chain rule compliance
    const { data: existingContracts } = await supabase
      .from('contracts')
      .select('id, contract_type, start_date, end_date, status')
      .eq('staff_id', contractData.staff_id)
      .neq('status', 'cancelled');

    if (existingContracts && existingContracts.length >= 2) {
      const temporaryContracts = existingContracts.filter(c => c.contract_type === 'temporary');

      if (temporaryContracts.length >= 3 && contractData.contract_type === 'temporary') {
        errors.push({
          field: 'contract_type',
          code: 'CHAIN_RULE_VIOLATION',
          message: 'Maximum of 3 temporary contracts allowed - next must be permanent',
          severity: 'error',
        });
      }

      // Check total employment duration
      const firstContract = existingContracts.sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )[0];

      if (firstContract) {
        const totalMonths = (Date.now() - new Date(firstContract.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (totalMonths >= 36 && contractData.contract_type === 'temporary') {
          errors.push({
            field: 'contract_type',
            code: 'DURATION_RULE_VIOLATION',
            message: 'Employment duration exceeds 36 months - next contract must be permanent',
            severity: 'error',
          });
        }
      }
    }
  }

  private static async validateDataConsistency(
    contractData: Partial<UnifiedContract>,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!contractData.staff_id) return;

    // Check staff record exists
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('full_name, email')
      .eq('id', contractData.staff_id)
      .single();

    if (staffError || !staff) {
      errors.push({
        field: 'staff_id',
        code: 'INVALID_STAFF_REFERENCE',
        message: 'Referenced staff member not found',
        severity: 'error',
      });
      return;
    }

    // Check name consistency
    if (contractData.employee_name && contractData.employee_name !== staff.full_name) {
      warnings.push({
        field: 'employee_name',
        code: 'NAME_MISMATCH',
        message: `Contract name "${contractData.employee_name}" doesn't match staff name "${staff.full_name}"`,
        recommendation: 'Use consistent employee names across systems',
      });
    }
  }

  private static async validateIntegrationData(
    contractData: Partial<UnifiedContract>,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    // Check for duplicate Employes.nl IDs
    if (contractData.employes_contract_id) {
      const { data: existing } = await supabase
        .from('contracts')
        .select('id')
        .eq('employes_contract_id', contractData.employes_contract_id)
        .neq('id', contractData.id || '');

      if (existing && existing.length > 0) {
        errors.push({
          field: 'employes_contract_id',
          code: 'DUPLICATE_EXTERNAL_ID',
          message: 'Employes.nl contract ID already exists',
          severity: 'error',
        });
      }
    }
  }

  private static datesOverlap(
    start1: Date,
    end1: Date | null,
    start2: Date,
    end2: Date | null
  ): boolean {
    // If either contract has no end date, assume it's ongoing
    const actualEnd1 = end1 || new Date('2100-01-01');
    const actualEnd2 = end2 || new Date('2100-01-01');

    return start1 < actualEnd2 && start2 < actualEnd1;
  }
}