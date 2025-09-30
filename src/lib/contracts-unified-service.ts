/**
 * UNIFIED CONTRACT SERVICE
 *
 * This service layer bridges the gap between Overview and Journey tabs,
 * providing a single source of truth for contract data across the application.
 */

import { supabase } from "@/integrations/supabase/client";
import { UnifiedContract, ContractTimeline, ChainRuleStatus, SalaryChange } from "@/types/contracts-unified";
import { StaffContract } from "@/lib/staff-contracts";

export class ContractService {
  /**
   * Get unified contract data for a staff member (replaces both Overview and Journey data)
   */
  static async getStaffContracts(staffId: string): Promise<{
    contracts: UnifiedContract[];
    timeline: ContractTimeline;
    summary: ContractSummary;
  }> {
    try {
      // Fetch comprehensive contract data using the unified view
      const { data: contractData, error: contractError } = await supabase
        .from('contracts_unified')
        .select('*')
        .eq('staff_id', staffId)
        .order('start_date', { ascending: false });

      if (contractError) throw contractError;

      // Fetch staff info
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();

      if (staffError) throw staffError;

      // Transform to unified contract format
      const contracts = contractData?.map(this.transformToUnifiedContract) || [];

      // Build timeline and analytics
      const timeline = await this.buildContractTimeline(staffId, contracts, staff);
      const summary = this.calculateContractSummary(contracts);

      return { contracts, timeline, summary };

    } catch (error) {
      console.error('Error fetching unified staff contracts:', error);
      throw error;
    }
  }

  /**
   * Get contract data compatible with existing Overview tab
   */
  static async getStaffContractsLegacy(staffName: string): Promise<StaffContract[]> {
    try {
      const { data: contractData, error } = await supabase
        .from('contracts_unified')
        .select('*')
        .eq('employee_name', staffName)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to legacy format for backward compatibility
      return contractData?.map(this.transformToLegacyContract) || [];

    } catch (error) {
      console.error('Error fetching legacy staff contracts:', error);
      throw error;
    }
  }

  /**
   * Create a new contract with all related data
   */
  static async createContract(contractData: Partial<UnifiedContract>): Promise<UnifiedContract> {
    try {
      // Start a transaction
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          staff_id: contractData.staff_id,
          employee_name: contractData.employee_name,
          contract_type: contractData.contract_type,
          employment_type: contractData.employment_type,
          status: contractData.status || 'draft',
          start_date: contractData.start_date,
          end_date: contractData.end_date,
          template_version: contractData.template_version || 'v2.0',
          created_by: contractData.created_by,
        })
        .select()
        .single();

      if (contractError) throw contractError;

      // Create related salary info
      if (contractData.salary_info) {
        const { error: salaryError } = await supabase
          .from('contract_salary_info')
          .insert({
            contract_id: contract.id,
            ...contractData.salary_info,
          });

        if (salaryError) throw salaryError;
      }

      // Create related working hours
      if (contractData.working_hours) {
        const { error: hoursError } = await supabase
          .from('contract_working_hours')
          .insert({
            contract_id: contract.id,
            ...contractData.working_hours,
          });

        if (hoursError) throw hoursError;
      }

      // Create integration record
      const { error: integrationError } = await supabase
        .from('contract_integrations')
        .insert({
          contract_id: contract.id,
          sync_status: 'pending',
        });

      if (integrationError) throw integrationError;

      // Create workflow record
      const { error: workflowError } = await supabase
        .from('contract_workflows')
        .insert({
          contract_id: contract.id,
          current_step: 'draft_creation',
          steps_completed: ['draft_creation'],
          next_steps: ['data_validation'],
        });

      if (workflowError) throw workflowError;

      // Return the complete contract
      return this.getContractById(contract.id);

    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Update contract status and trigger workflow progression
   */
  static async updateContractStatus(
    contractId: string,
    newStatus: UnifiedContract['status'],
    userId: string
  ): Promise<void> {
    try {
      // Update contract status
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          status: newStatus,
          last_modified_by: userId,
          last_modified_at: new Date().toISOString(),
        })
        .eq('id', contractId);

      if (updateError) throw updateError;

      // Update workflow if needed
      await this.updateWorkflowForStatus(contractId, newStatus);

      // Check for compliance issues
      await this.checkContractCompliance(contractId);

    } catch (error) {
      console.error('Error updating contract status:', error);
      throw error;
    }
  }

  /**
   * Link existing orphaned contract to staff member
   */
  static async linkContractToStaff(contractId: string, staffId: string): Promise<void> {
    try {
      // Get staff info
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('full_name')
        .eq('id', staffId)
        .single();

      if (staffError) throw staffError;

      // Update contract with staff_id
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          staff_id: staffId,
          employee_name: staff.full_name, // Ensure consistency
          status: 'active', // Fix orphaned contracts to active status
        })
        .eq('id', contractId);

      if (updateError) throw updateError;

      // Create missing related records if they don't exist
      await this.ensureContractRelatedRecords(contractId);

    } catch (error) {
      console.error('Error linking contract to staff:', error);
      throw error;
    }
  }

  /**
   * Generate employment journey compatible with existing journey page
   */
  static async buildEmploymentJourney(staffId: string): Promise<any> {
    try {
      const { timeline } = await this.getStaffContracts(staffId);

      // Transform to existing journey format for backward compatibility
      return {
        employeeId: staffId,
        employeeName: timeline.employee_name,
        email: '', // Will be filled from staff data
        employesId: null,
        totalContracts: timeline.contracts.length,
        totalDurationMonths: timeline.total_employment_months,
        firstStartDate: timeline.contracts[timeline.contracts.length - 1]?.start_date,
        currentContract: timeline.contracts.find(c => c.status === 'active'),
        contracts: timeline.contracts.map(this.transformToJourneyContract),
        chainRuleStatus: timeline.chain_rule_status,
        terminationNotice: null, // Will calculate if needed
        salaryProgression: timeline.salary_progression,
      };

    } catch (error) {
      console.error('Error building employment journey:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private static transformToUnifiedContract(data: any): UnifiedContract {
    return {
      id: data.id,
      staff_id: data.staff_id,
      employee_name: data.employee_name,
      contract_number: data.contract_number || 1,
      contract_type: data.contract_type,
      employment_type: data.employment_type,
      status: data.status,
      chain_sequence: data.chain_sequence || 1,
      requires_permanent: data.requires_permanent || false,
      compliance_warnings: [], // Will be loaded separately
      created_at: data.created_at,
      signed_at: data.signed_at,
      start_date: data.start_date,
      end_date: data.end_date,
      termination_notice_deadline: data.termination_notice_deadline,
      salary_info: {
        scale: data.scale || '',
        trede: data.trede || '',
        hourly_wage: data.hourly_wage || 0,
        monthly_wage: data.monthly_wage || 0,
        yearly_wage: data.yearly_wage || 0,
        overtime_rate: data.overtime_rate || 1.5,
        vacation_allowance: data.vacation_allowance || 8.0,
        thirteenth_month: data.thirteenth_month || false,
        pension_contribution: data.pension_contribution || 0,
        last_increase_date: data.last_increase_date,
        next_review_date: data.next_review_date,
      },
      working_hours: {
        hours_per_week: data.hours_per_week || 40,
        days_per_week: data.days_per_week || 5,
        flexible_hours: data.flexible_hours || false,
        remote_work_allowed: data.remote_work_allowed || false,
        overtime_allowed: data.overtime_allowed || true,
        weekend_work_required: data.weekend_work_required || false,
      },
      pdf_path: data.pdf_path,
      template_version: data.template_version || 'v1.0',
      employes_contract_id: data.employes_id,
      query_params: data.query_params,
      created_by: data.created_by || '',
      last_modified_by: data.last_modified_by || '',
      last_modified_at: data.last_modified_at,
      // Computed fields
      days_until_start: data.days_until_start,
      days_until_end: data.days_until_end,
      days_until_termination_deadline: data.days_until_termination_deadline,
    };
  }

  private static transformToLegacyContract(data: any): StaffContract {
    return {
      id: data.id,
      employee_name: data.employee_name,
      manager: data.manager,
      status: data.status,
      contract_type: data.contract_type,
      department: data.department,
      query_params: data.query_params,
      created_at: data.created_at,
      signed_at: data.signed_at,
      pdf_path: data.pdf_path,
      start_date: data.start_date,
      end_date: data.end_date,
      salary_info: {
        scale: data.scale,
        trede: data.trede,
        grossMonthly: data.monthly_wage,
      },
      days_until_start: data.days_until_start,
      days_until_end: data.days_until_end,
      position: data.query_params?.position,
      location: data.query_params?.location,
    };
  }

  private static transformToJourneyContract(contract: UnifiedContract): any {
    return {
      id: contract.id,
      employeeId: contract.staff_id,
      employeeName: contract.employee_name,
      contractNumber: contract.contract_number,
      startDate: contract.start_date,
      endDate: contract.end_date,
      hoursPerWeek: contract.working_hours.hours_per_week,
      daysPerWeek: contract.working_hours.days_per_week,
      contractType: contract.employment_type,
      employmentType: contract.end_date ? 'fixed' : 'permanent',
      hourlyWage: contract.salary_info.hourly_wage,
      monthlyWage: contract.salary_info.monthly_wage,
      yearlyWage: contract.salary_info.yearly_wage,
      isActive: contract.status === 'active',
    };
  }

  private static async buildContractTimeline(
    staffId: string,
    contracts: UnifiedContract[],
    staff: any
  ): Promise<ContractTimeline> {
    // Calculate chain rule status
    const chainRuleStatus = this.calculateChainRuleStatus(contracts);

    // Calculate salary progression
    const salaryProgression = this.calculateSalaryProgression(contracts);

    // Calculate employment duration
    const firstContract = contracts[contracts.length - 1];
    const firstStartDate = firstContract?.start_date;
    const totalMonths = firstStartDate
      ? Math.floor((Date.now() - new Date(firstStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;

    return {
      employee_id: staffId,
      employee_name: staff.full_name,
      contracts,
      total_employment_months: totalMonths,
      chain_rule_status: chainRuleStatus,
      salary_progression: salaryProgression,
      upcoming_deadlines: [], // Calculate based on contract dates
      compliance_score: this.calculateComplianceScore(contracts, chainRuleStatus),
    };
  }

  private static calculateChainRuleStatus(contracts: UnifiedContract[]): ChainRuleStatus {
    const activeContracts = contracts.filter(c => ['active', 'expired', 'terminated'].includes(c.status));
    const temporaryContracts = activeContracts.filter(c => c.contract_type === 'temporary');
    const hasPermanent = activeContracts.some(c => c.contract_type === 'permanent');

    const totalContracts = temporaryContracts.length;
    const firstContract = activeContracts[activeContracts.length - 1];
    const firstStartDate = firstContract?.start_date;
    const totalMonths = firstStartDate
      ? Math.floor((Date.now() - new Date(firstStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;

    const requiresPermanent = (totalContracts >= 3 || totalMonths >= 36) && !hasPermanent;

    let warningLevel: ChainRuleStatus['warning_level'] = 'safe';
    let recommendation = 'Employee is within chain rule limits';

    if (requiresPermanent) {
      warningLevel = 'permanent_required';
      recommendation = 'Next contract MUST be permanent (vast contract)';
    } else if (totalContracts === 2 || totalMonths >= 30) {
      warningLevel = 'critical';
      recommendation = 'Approaching chain rule limits - consider permanent contract';
    } else if (totalContracts === 1 && totalMonths > 18) {
      warningLevel = 'warning';
      recommendation = 'Monitor contract progression';
    }

    return {
      current_chain_length: totalContracts,
      total_employment_months: totalMonths,
      max_allowed_contracts: 3,
      max_allowed_months: 36,
      requires_permanent_next: requiresPermanent,
      warning_level: warningLevel,
      recommendation,
    };
  }

  private static calculateSalaryProgression(contracts: UnifiedContract[]): SalaryChange[] {
    const changes: SalaryChange[] = [];
    const sortedContracts = contracts.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    sortedContracts.forEach((contract, index) => {
      const prevContract = index > 0 ? sortedContracts[index - 1] : null;
      const increasePercent = prevContract
        ? ((contract.salary_info.monthly_wage - prevContract.salary_info.monthly_wage) / prevContract.salary_info.monthly_wage) * 100
        : 0;

      changes.push({
        date: contract.start_date,
        contract_id: contract.id,
        old_monthly: prevContract?.salary_info.monthly_wage || 0,
        new_monthly: contract.salary_info.monthly_wage,
        increase_percent: Math.round(increasePercent * 100) / 100,
        reason: index === 0 ? 'contract_start' : 'contract_renewal',
        notes: null,
      });
    });

    return changes;
  }

  private static calculateComplianceScore(contracts: UnifiedContract[], chainStatus: ChainRuleStatus): number {
    let score = 100;

    // Deduct points for chain rule issues
    if (chainStatus.warning_level === 'permanent_required') score -= 50;
    else if (chainStatus.warning_level === 'critical') score -= 30;
    else if (chainStatus.warning_level === 'warning') score -= 10;

    // Deduct points for missing data
    contracts.forEach(contract => {
      if (!contract.salary_info.monthly_wage) score -= 5;
      if (!contract.start_date) score -= 10;
      if (contract.status === 'draft' && contract.created_at < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private static calculateContractSummary(contracts: UnifiedContract[]): ContractSummary {
    return {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      expiring_soon: contracts.filter(c => c.days_until_end !== null && c.days_until_end <= 60).length,
      draft: contracts.filter(c => c.status === 'draft').length,
      current_monthly_cost: contracts
        .filter(c => c.status === 'active')
        .reduce((sum, c) => sum + (c.salary_info.monthly_wage || 0), 0),
    };
  }

  private static async getContractById(contractId: string): Promise<UnifiedContract> {
    const { data, error } = await supabase
      .from('contracts_unified')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) throw error;
    return this.transformToUnifiedContract(data);
  }

  private static async updateWorkflowForStatus(contractId: string, status: UnifiedContract['status']): Promise<void> {
    // Implementation for workflow updates based on status changes
    // This would update the contract_workflows table
  }

  private static async checkContractCompliance(contractId: string): Promise<void> {
    // Implementation for compliance checking
    // This would create/update records in contract_compliance_warnings table
  }

  private static async ensureContractRelatedRecords(contractId: string): Promise<void> {
    // Ensure salary info record exists
    const { data: salaryExists } = await supabase
      .from('contract_salary_info')
      .select('id')
      .eq('contract_id', contractId)
      .maybeSingle();

    if (!salaryExists) {
      await supabase.from('contract_salary_info').insert({ contract_id: contractId });
    }

    // Ensure working hours record exists
    const { data: hoursExists } = await supabase
      .from('contract_working_hours')
      .select('id')
      .eq('contract_id', contractId)
      .maybeSingle();

    if (!hoursExists) {
      await supabase.from('contract_working_hours').insert({ contract_id: contractId });
    }

    // Ensure integration record exists
    const { data: integrationExists } = await supabase
      .from('contract_integrations')
      .select('id')
      .eq('contract_id', contractId)
      .maybeSingle();

    if (!integrationExists) {
      await supabase.from('contract_integrations').insert({ contract_id: contractId });
    }
  }
}

interface ContractSummary {
  total: number;
  active: number;
  expiring_soon: number;
  draft: number;
  current_monthly_cost: number;
}