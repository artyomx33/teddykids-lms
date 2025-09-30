/**
 * INTEGRATION BRIDGE FOR LOVABLE'S V2 SYSTEMS
 *
 * This module creates seamless integration between the new unified contract system
 * and the existing V2 review, employment journey, and analytics systems built by Lovable.
 */

import { ContractService } from './contracts-unified-service';
import { buildEmploymentJourney, EmploymentJourney } from './employesContracts';
import { fetchStaffContracts, StaffContract } from './staff-contracts';
import { UnifiedContract } from '@/types/contracts-unified';

export class V2IntegrationBridge {
  /**
   * STRATEGY 1: Gradual Migration Bridge
   *
   * This allows the existing V2 code to work unchanged while gradually
   * moving to the unified system underneath.
   */

  /**
   * Enhanced fetchStaffContracts that uses unified data but returns legacy format
   */
  static async fetchStaffContractsV2(staffName: string): Promise<StaffContract[]> {
    try {
      // Try unified service first
      const unifiedContracts = await ContractService.getStaffContractsLegacy(staffName);

      if (unifiedContracts && unifiedContracts.length > 0) {
        console.log('✅ Using unified contract data for', staffName);
        return unifiedContracts;
      }

      // Fallback to original implementation
      console.log('⚠️ Falling back to legacy contract data for', staffName);
      return await fetchStaffContracts(staffName);

    } catch (error) {
      console.error('Error in V2 contract bridge:', error);
      // Always fallback to original on error
      return await fetchStaffContracts(staffName);
    }
  }

  /**
   * Enhanced buildEmploymentJourney that enriches data with unified contracts
   */
  static async buildEmploymentJourneyV2(staffId: string): Promise<EmploymentJourney | null> {
    try {
      // Get the original journey data
      const originalJourney = await buildEmploymentJourney(staffId);

      if (!originalJourney) return null;

      // Try to enrich with unified contract data
      try {
        const { contracts: unifiedContracts, timeline } = await ContractService.getStaffContracts(staffId);

        if (unifiedContracts.length > 0) {
          console.log('🔄 Enriching employment journey with unified contract data');

          // Enhance the journey with more accurate contract data
          const enhancedJourney: EmploymentJourney = {
            ...originalJourney,
            totalContracts: unifiedContracts.length,
            contracts: unifiedContracts.map(this.transformUnifiedToJourneyContract),
            chainRuleStatus: timeline.chain_rule_status,
            salaryProgression: timeline.salary_progression.map(change => ({
              date: change.date,
              hourlyWage: change.new_monthly / (40 * 4.33), // Approximate
              monthlyWage: change.new_monthly,
              yearlyWage: change.new_monthly * 12,
              increasePercent: change.increase_percent,
              reason: change.reason as any,
            })),
          };

          return enhancedJourney;
        }
      } catch (enrichError) {
        console.warn('Could not enrich journey with unified data:', enrichError);
      }

      // Return original if enrichment fails
      return originalJourney;

    } catch (error) {
      console.error('Error in V2 employment journey bridge:', error);
      throw error;
    }
  }

  /**
   * STRATEGY 2: Progressive Component Enhancement
   *
   * These hooks can be used to gradually enhance existing components
   * with unified contract features.
   */

  /**
   * Hook for StaffContractsPanel to show unified data with enhanced features
   */
  static async enhanceStaffContractsPanel(staffId: string, staffName: string) {
    try {
      const { contracts, timeline, summary } = await ContractService.getStaffContracts(staffId);

      return {
        // Legacy compatibility
        legacyContracts: contracts.map(this.transformUnifiedToLegacy),

        // Enhanced features
        unifiedContracts: contracts,
        timeline,
        summary,
        complianceWarnings: await this.getActiveComplianceWarnings(staffId),
        upcomingDeadlines: this.calculateUpcomingDeadlines(contracts),

        // Analytics
        contractAnalytics: {
          averageContractDuration: this.calculateAverageContractDuration(contracts),
          salaryGrowthRate: this.calculateSalaryGrowthRate(timeline.salary_progression),
          complianceScore: timeline.compliance_score,
          nextRecommendedAction: this.getNextRecommendedAction(contracts, timeline.chain_rule_status),
        },
      };

    } catch (error) {
      console.error('Error enhancing contracts panel:', error);
      // Return empty state that won't break existing components
      return {
        legacyContracts: [],
        unifiedContracts: [],
        timeline: null,
        summary: null,
        complianceWarnings: [],
        upcomingDeadlines: [],
        contractAnalytics: null,
      };
    }
  }

  /**
   * STRATEGY 3: Review System Integration
   *
   * Connects the unified contract system with Lovable's V2 review system
   */

  /**
   * Sync contract data with review system
   */
  static async syncContractWithReviewSystem(staffId: string) {
    try {
      const { contracts, timeline } = await ContractService.getStaffContracts(staffId);
      const activeContract = contracts.find(c => c.status === 'active');

      if (!activeContract) return;

      // Update review scheduling based on contract dates and salary info
      const reviewData = {
        next_review_due: activeContract.salary_info.next_review_date,
        contract_end_date: activeContract.end_date,
        current_salary: activeContract.salary_info.monthly_wage,
        chain_status: timeline.chain_rule_status.warning_level,
        compliance_score: timeline.compliance_score,
      };

      // This would integrate with the review system hooks
      return reviewData;

    } catch (error) {
      console.error('Error syncing contract with review system:', error);
      return null;
    }
  }

  /**
   * STRATEGY 4: Wage Sync Enhancement
   *
   * Enhances the existing WageSyncPanel with unified contract awareness
   */

  static async enhanceWageSync(staffId: string) {
    try {
      const { contracts } = await ContractService.getStaffContracts(staffId);
      const activeContract = contracts.find(c => c.status === 'active');

      if (!activeContract) return null;

      return {
        currentContractId: activeContract.id,
        salaryInfo: activeContract.salary_info,
        workingHours: activeContract.working_hours,
        syncStatus: activeContract.employes_contract_id ? 'synced' : 'pending',
        lastSyncDate: activeContract.last_modified_at,

        // Enhanced sync capabilities
        canUpdateSalary: this.canUpdateSalary(activeContract),
        canUpdateHours: this.canUpdateHours(activeContract),
        requiresNewContract: this.requiresNewContract(activeContract),

        // Recommendations
        syncRecommendations: await this.getSyncRecommendations(staffId, activeContract),
      };

    } catch (error) {
      console.error('Error enhancing wage sync:', error);
      return null;
    }
  }

  /**
   * STRATEGY 5: Dashboard Analytics Integration
   */

  static async getUnifiedDashboardData() {
    try {
      // Get comprehensive contract analytics for dashboard
      const analytics = await this.getContractAnalytics();
      const complianceAlerts = await this.getSystemWideComplianceAlerts();
      const upcomingActions = await this.getUpcomingActions();

      return {
        contractSummary: analytics,
        complianceAlerts,
        upcomingActions,

        // Dashboard widgets data
        widgets: {
          expiringContracts: analytics.expiring_soon,
          complianceScore: analytics.average_compliance_score,
          pendingActions: upcomingActions.length,
          budgetImpact: analytics.total_monthly_budget,
        },

        // Trend data for charts
        trends: {
          contractCreationTrend: await this.getContractCreationTrend(),
          salaryTrend: await this.getSalaryTrend(),
          complianceTrend: await this.getComplianceTrend(),
        },
      };

    } catch (error) {
      console.error('Error getting unified dashboard data:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */

  private static transformUnifiedToLegacy(contract: UnifiedContract): StaffContract {
    return {
      id: contract.id,
      employee_name: contract.employee_name,
      manager: '', // Would need to be looked up
      status: contract.status,
      contract_type: contract.contract_type,
      department: '', // Would need to be looked up
      query_params: contract.query_params,
      created_at: contract.created_at,
      signed_at: contract.signed_at,
      pdf_path: contract.pdf_path,
      start_date: contract.start_date,
      end_date: contract.end_date,
      salary_info: {
        scale: contract.salary_info.scale,
        trede: contract.salary_info.trede,
        grossMonthly: contract.salary_info.monthly_wage,
      },
      days_until_start: contract.days_until_start,
      days_until_end: contract.days_until_end,
      position: contract.query_params?.position,
      location: contract.query_params?.location,
    };
  }

  private static transformUnifiedToJourneyContract(contract: UnifiedContract): any {
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
      employmentType: contract.contract_type === 'permanent' ? 'permanent' : 'fixed',
      hourlyWage: contract.salary_info.hourly_wage,
      monthlyWage: contract.salary_info.monthly_wage,
      yearlyWage: contract.salary_info.yearly_wage,
      isActive: contract.status === 'active',
    };
  }

  private static async getActiveComplianceWarnings(staffId: string) {
    // Implementation to fetch active compliance warnings
    return [];
  }

  private static calculateUpcomingDeadlines(contracts: UnifiedContract[]) {
    const deadlines = [];

    contracts.forEach(contract => {
      if (contract.days_until_end && contract.days_until_end <= 90) {
        deadlines.push({
          type: 'contract_end',
          date: contract.end_date,
          days_remaining: contract.days_until_end,
          severity: contract.days_until_end <= 30 ? 'critical' : 'warning',
          action_required: 'Decide on contract renewal',
        });
      }

      if (contract.days_until_termination_deadline && contract.days_until_termination_deadline <= 60) {
        deadlines.push({
          type: 'termination_deadline',
          date: contract.termination_notice_deadline,
          days_remaining: contract.days_until_termination_deadline,
          severity: contract.days_until_termination_deadline <= 0 ? 'critical' : 'warning',
          action_required: 'Send termination or renewal notice',
        });
      }
    });

    return deadlines.sort((a, b) => a.days_remaining - b.days_remaining);
  }

  private static calculateAverageContractDuration(contracts: UnifiedContract[]): number {
    const completedContracts = contracts.filter(c => c.end_date && c.status === 'expired');
    if (completedContracts.length === 0) return 0;

    const totalDays = completedContracts.reduce((sum, contract) => {
      const start = new Date(contract.start_date);
      const end = new Date(contract.end_date!);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);

    return Math.round(totalDays / completedContracts.length);
  }

  private static calculateSalaryGrowthRate(salaryProgression: any[]): number {
    if (salaryProgression.length < 2) return 0;

    const firstSalary = salaryProgression[0].new_monthly;
    const lastSalary = salaryProgression[salaryProgression.length - 1].new_monthly;

    return ((lastSalary - firstSalary) / firstSalary) * 100;
  }

  private static getNextRecommendedAction(contracts: UnifiedContract[], chainStatus: any): string {
    if (chainStatus.requires_permanent_next) {
      return 'Create permanent contract (required by Dutch labor law)';
    }

    const activeContract = contracts.find(c => c.status === 'active');
    if (activeContract?.days_until_end && activeContract.days_until_end <= 90) {
      return 'Plan contract renewal or termination';
    }

    return 'No immediate action required';
  }

  private static canUpdateSalary(contract: UnifiedContract): boolean {
    return contract.status === 'active' && !contract.employes_contract_id;
  }

  private static canUpdateHours(contract: UnifiedContract): boolean {
    return contract.status === 'active';
  }

  private static requiresNewContract(contract: UnifiedContract): boolean {
    return contract.requires_permanent || (contract.days_until_end && contract.days_until_end <= 60);
  }

  private static async getSyncRecommendations(staffId: string, contract: UnifiedContract) {
    const recommendations = [];

    if (!contract.employes_contract_id) {
      recommendations.push('Sync contract with Employes.nl system');
    }

    if (contract.requires_permanent) {
      recommendations.push('Next contract must be permanent due to chain rule');
    }

    return recommendations;
  }

  private static async getContractAnalytics() {
    // Implementation for system-wide contract analytics
    return {
      total_contracts: 0,
      active_contracts: 0,
      expiring_soon: 0,
      average_compliance_score: 0,
      total_monthly_budget: 0,
    };
  }

  private static async getSystemWideComplianceAlerts() {
    // Implementation for system-wide compliance alerts
    return [];
  }

  private static async getUpcomingActions() {
    // Implementation for upcoming actions across all contracts
    return [];
  }

  private static async getContractCreationTrend() {
    // Implementation for contract creation trend data
    return [];
  }

  private static async getSalaryTrend() {
    // Implementation for salary trend data
    return [];
  }

  private static async getComplianceTrend() {
    // Implementation for compliance trend data
    return [];
  }
}