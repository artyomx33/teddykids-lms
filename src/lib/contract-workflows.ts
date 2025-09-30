/**
 * CONTRACT STATE MANAGEMENT & WORKFLOWS
 *
 * This module manages contract lifecycle states, transitions, and automated workflows
 * to ensure proper contract progression and compliance with Dutch labor law.
 */

import { supabase } from "@/integrations/supabase/client";
import { UnifiedContract } from "@/types/contracts-unified";

export type WorkflowStep =
  | 'draft_creation'
  | 'data_validation'
  | 'legal_review'
  | 'manager_approval'
  | 'hr_approval'
  | 'employee_signature'
  | 'manager_signature'
  | 'hr_signature'
  | 'contract_activation'
  | 'employes_sync';

export type WorkflowAction =
  | 'validate_data'
  | 'request_review'
  | 'approve'
  | 'reject'
  | 'sign'
  | 'activate'
  | 'sync_external'
  | 'archive';

export interface WorkflowState {
  contract_id: string;
  current_step: WorkflowStep;
  steps_completed: WorkflowStep[];
  next_steps: WorkflowStep[];
  can_progress: boolean;
  blocking_issues: string[];
  workflow_metadata: Record<string, any>;
}

export interface WorkflowTransition {
  from_step: WorkflowStep;
  to_step: WorkflowStep;
  action: WorkflowAction;
  required_role: 'admin' | 'manager' | 'hr' | 'employee';
  conditions: string[];
  automated: boolean;
}

export class ContractWorkflowManager {

  /**
   * WORKFLOW DEFINITION - Dutch Employment Contract Process
   */
  private static readonly WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
    // Initial creation and validation
    {
      from_step: 'draft_creation',
      to_step: 'data_validation',
      action: 'validate_data',
      required_role: 'admin',
      conditions: ['has_required_fields', 'valid_dates', 'valid_salary'],
      automated: true,
    },

    // Data validation to legal review
    {
      from_step: 'data_validation',
      to_step: 'legal_review',
      action: 'request_review',
      required_role: 'admin',
      conditions: ['data_validated', 'chain_rule_compliant'],
      automated: false,
    },

    // Legal review paths
    {
      from_step: 'legal_review',
      to_step: 'manager_approval',
      action: 'approve',
      required_role: 'admin',
      conditions: ['legal_review_passed'],
      automated: false,
    },

    {
      from_step: 'legal_review',
      to_step: 'data_validation',
      action: 'reject',
      required_role: 'admin',
      conditions: [],
      automated: false,
    },

    // Manager approval
    {
      from_step: 'manager_approval',
      to_step: 'hr_approval',
      action: 'approve',
      required_role: 'manager',
      conditions: ['manager_approved'],
      automated: false,
    },

    // HR approval
    {
      from_step: 'hr_approval',
      to_step: 'employee_signature',
      action: 'approve',
      required_role: 'hr',
      conditions: ['hr_approved', 'contract_generated'],
      automated: false,
    },

    // Signature workflow
    {
      from_step: 'employee_signature',
      to_step: 'manager_signature',
      action: 'sign',
      required_role: 'employee',
      conditions: ['employee_signed'],
      automated: false,
    },

    {
      from_step: 'manager_signature',
      to_step: 'hr_signature',
      action: 'sign',
      required_role: 'manager',
      conditions: ['manager_signed'],
      automated: false,
    },

    // Final activation
    {
      from_step: 'hr_signature',
      to_step: 'contract_activation',
      action: 'activate',
      required_role: 'hr',
      conditions: ['all_signatures_complete'],
      automated: true,
    },

    // External sync
    {
      from_step: 'contract_activation',
      to_step: 'employes_sync',
      action: 'sync_external',
      required_role: 'admin',
      conditions: ['contract_active'],
      automated: true,
    },
  ];

  /**
   * Get current workflow state for a contract
   */
  static async getWorkflowState(contractId: string): Promise<WorkflowState | null> {
    try {
      const { data, error } = await supabase
        .from('contract_workflows')
        .select('*')
        .eq('contract_id', contractId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No workflow record exists, create one
          return await this.initializeWorkflow(contractId);
        }
        throw error;
      }

      return {
        contract_id: data.contract_id,
        current_step: data.current_step,
        steps_completed: data.steps_completed || [],
        next_steps: data.next_steps || [],
        can_progress: data.can_progress,
        blocking_issues: data.blocking_issues || [],
        workflow_metadata: data.workflow_metadata || {},
      };

    } catch (error) {
      console.error('Error getting workflow state:', error);
      return null;
    }
  }

  /**
   * Initialize workflow for a new contract
   */
  static async initializeWorkflow(contractId: string): Promise<WorkflowState> {
    try {
      const initialState: WorkflowState = {
        contract_id: contractId,
        current_step: 'draft_creation',
        steps_completed: ['draft_creation'],
        next_steps: ['data_validation'],
        can_progress: true,
        blocking_issues: [],
        workflow_metadata: {
          created_at: new Date().toISOString(),
          created_by: 'system', // Should be actual user ID
        },
      };

      const { error } = await supabase
        .from('contract_workflows')
        .insert({
          contract_id: contractId,
          current_step: initialState.current_step,
          steps_completed: initialState.steps_completed,
          next_steps: initialState.next_steps,
          can_progress: initialState.can_progress,
          blocking_issues: initialState.blocking_issues,
          workflow_metadata: initialState.workflow_metadata,
        });

      if (error) throw error;

      return initialState;

    } catch (error) {
      console.error('Error initializing workflow:', error);
      throw error;
    }
  }

  /**
   * Execute a workflow action
   */
  static async executeAction(
    contractId: string,
    action: WorkflowAction,
    userId: string,
    userRole: 'admin' | 'manager' | 'hr' | 'employee',
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; message: string; newState?: WorkflowState }> {
    try {
      const currentState = await this.getWorkflowState(contractId);
      if (!currentState) {
        return { success: false, message: 'Workflow state not found' };
      }

      // Find valid transition
      const validTransition = this.WORKFLOW_TRANSITIONS.find(
        t => t.from_step === currentState.current_step &&
             t.action === action &&
             (t.required_role === userRole || userRole === 'admin')
      );

      if (!validTransition) {
        return {
          success: false,
          message: `Action '${action}' not allowed from step '${currentState.current_step}' for role '${userRole}'`
        };
      }

      // Check conditions
      const conditionResults = await this.checkConditions(contractId, validTransition.conditions);
      const failedConditions = conditionResults.filter(r => !r.passed).map(r => r.condition);

      if (failedConditions.length > 0) {
        return {
          success: false,
          message: `Conditions not met: ${failedConditions.join(', ')}`
        };
      }

      // Execute the transition
      const newState = await this.executeTransition(contractId, validTransition, userId, metadata);

      // Auto-execute any automated next steps
      await this.processAutomatedSteps(contractId);

      return {
        success: true,
        message: `Successfully transitioned from ${validTransition.from_step} to ${validTransition.to_step}`,
        newState
      };

    } catch (error) {
      console.error('Error executing workflow action:', error);
      return { success: false, message: 'Internal error executing action' };
    }
  }

  /**
   * Get available actions for current workflow state
   */
  static getAvailableActions(
    currentStep: WorkflowStep,
    userRole: 'admin' | 'manager' | 'hr' | 'employee'
  ): WorkflowAction[] {
    return this.WORKFLOW_TRANSITIONS
      .filter(t =>
        t.from_step === currentStep &&
        (t.required_role === userRole || userRole === 'admin')
      )
      .map(t => t.action);
  }

  /**
   * Check if contract can progress automatically
   */
  static async checkAutomatedProgression(contractId: string): Promise<boolean> {
    try {
      const state = await this.getWorkflowState(contractId);
      if (!state) return false;

      const automatedTransitions = this.WORKFLOW_TRANSITIONS.filter(
        t => t.from_step === state.current_step && t.automated
      );

      for (const transition of automatedTransitions) {
        const conditionResults = await this.checkConditions(contractId, transition.conditions);
        const allConditionsMet = conditionResults.every(r => r.passed);

        if (allConditionsMet) {
          await this.executeTransition(contractId, transition, 'system');
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('Error checking automated progression:', error);
      return false;
    }
  }

  /**
   * Get workflow progress percentage
   */
  static getWorkflowProgress(state: WorkflowState): number {
    const totalSteps = ['draft_creation', 'data_validation', 'legal_review', 'manager_approval',
                       'hr_approval', 'employee_signature', 'manager_signature', 'hr_signature',
                       'contract_activation', 'employes_sync'];

    const completedCount = state.steps_completed.length;
    return Math.round((completedCount / totalSteps.length) * 100);
  }

  /**
   * Private helper methods
   */

  private static async executeTransition(
    contractId: string,
    transition: WorkflowTransition,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<WorkflowState> {
    // Update workflow state
    const { data: currentWorkflow } = await supabase
      .from('contract_workflows')
      .select('*')
      .eq('contract_id', contractId)
      .single();

    const updatedStepsCompleted = [...(currentWorkflow.steps_completed || []), transition.to_step];
    const nextSteps = this.calculateNextSteps(transition.to_step);

    const newState: WorkflowState = {
      contract_id: contractId,
      current_step: transition.to_step,
      steps_completed: updatedStepsCompleted,
      next_steps: nextSteps,
      can_progress: nextSteps.length > 0,
      blocking_issues: [],
      workflow_metadata: {
        ...currentWorkflow.workflow_metadata,
        [`${transition.to_step}_completed_at`]: new Date().toISOString(),
        [`${transition.to_step}_completed_by`]: userId,
        ...metadata,
      },
    };

    await supabase
      .from('contract_workflows')
      .update({
        current_step: newState.current_step,
        steps_completed: newState.steps_completed,
        next_steps: newState.next_steps,
        can_progress: newState.can_progress,
        blocking_issues: newState.blocking_issues,
        workflow_metadata: newState.workflow_metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('contract_id', contractId);

    // Update contract status based on workflow step
    await this.updateContractStatusForStep(contractId, transition.to_step);

    // Log workflow transition
    await this.logWorkflowTransition(contractId, transition, userId, metadata);

    return newState;
  }

  private static calculateNextSteps(currentStep: WorkflowStep): WorkflowStep[] {
    return this.WORKFLOW_TRANSITIONS
      .filter(t => t.from_step === currentStep)
      .map(t => t.to_step);
  }

  private static async checkConditions(contractId: string, conditions: string[]): Promise<{condition: string, passed: boolean}[]> {
    const results = [];

    for (const condition of conditions) {
      let passed = false;

      try {
        switch (condition) {
          case 'has_required_fields':
            passed = await this.checkRequiredFields(contractId);
            break;
          case 'valid_dates':
            passed = await this.checkValidDates(contractId);
            break;
          case 'valid_salary':
            passed = await this.checkValidSalary(contractId);
            break;
          case 'data_validated':
            passed = await this.checkDataValidated(contractId);
            break;
          case 'chain_rule_compliant':
            passed = await this.checkChainRuleCompliance(contractId);
            break;
          case 'legal_review_passed':
            passed = await this.checkLegalReviewPassed(contractId);
            break;
          case 'manager_approved':
            passed = await this.checkManagerApproved(contractId);
            break;
          case 'hr_approved':
            passed = await this.checkHRApproved(contractId);
            break;
          case 'contract_generated':
            passed = await this.checkContractGenerated(contractId);
            break;
          case 'employee_signed':
            passed = await this.checkEmployeeSigned(contractId);
            break;
          case 'manager_signed':
            passed = await this.checkManagerSigned(contractId);
            break;
          case 'all_signatures_complete':
            passed = await this.checkAllSignaturesComplete(contractId);
            break;
          case 'contract_active':
            passed = await this.checkContractActive(contractId);
            break;
          default:
            passed = true; // Unknown conditions pass by default
        }
      } catch (error) {
        console.error(`Error checking condition ${condition}:`, error);
        passed = false;
      }

      results.push({ condition, passed });
    }

    return results;
  }

  private static async processAutomatedSteps(contractId: string): Promise<void> {
    let hasAutomatedStep = true;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (hasAutomatedStep && attempts < maxAttempts) {
      hasAutomatedStep = await this.checkAutomatedProgression(contractId);
      attempts++;
    }
  }

  private static async updateContractStatusForStep(contractId: string, step: WorkflowStep): Promise<void> {
    let newStatus: UnifiedContract['status'] = 'draft';

    switch (step) {
      case 'draft_creation':
      case 'data_validation':
      case 'legal_review':
        newStatus = 'draft';
        break;
      case 'manager_approval':
      case 'hr_approval':
      case 'employee_signature':
      case 'manager_signature':
      case 'hr_signature':
        newStatus = 'pending';
        break;
      case 'contract_activation':
      case 'employes_sync':
        newStatus = 'active';
        break;
    }

    await supabase
      .from('contracts')
      .update({ status: newStatus })
      .eq('id', contractId);
  }

  private static async logWorkflowTransition(
    contractId: string,
    transition: WorkflowTransition,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // This would log to a workflow_logs table for audit trail
    console.log(`Workflow transition: ${contractId} from ${transition.from_step} to ${transition.to_step} by ${userId}`);
  }

  // Condition check methods
  private static async checkRequiredFields(contractId: string): Promise<boolean> {
    const { data: contract } = await supabase
      .from('contracts')
      .select('staff_id, employee_name, contract_type, start_date')
      .eq('id', contractId)
      .single();

    return !!(contract?.staff_id && contract?.employee_name && contract?.contract_type && contract?.start_date);
  }

  private static async checkValidDates(contractId: string): Promise<boolean> {
    const { data: contract } = await supabase
      .from('contracts')
      .select('start_date, end_date')
      .eq('id', contractId)
      .single();

    if (!contract?.start_date) return false;

    const startDate = new Date(contract.start_date);
    if (isNaN(startDate.getTime())) return false;

    if (contract.end_date) {
      const endDate = new Date(contract.end_date);
      if (isNaN(endDate.getTime()) || endDate <= startDate) return false;
    }

    return true;
  }

  private static async checkValidSalary(contractId: string): Promise<boolean> {
    const { data: salary } = await supabase
      .from('contract_salary_info')
      .select('monthly_wage')
      .eq('contract_id', contractId)
      .single();

    return !!(salary?.monthly_wage && salary.monthly_wage > 0);
  }

  private static async checkDataValidated(contractId: string): Promise<boolean> {
    // Check if all required validations have passed
    return await this.checkRequiredFields(contractId) &&
           await this.checkValidDates(contractId) &&
           await this.checkValidSalary(contractId);
  }

  private static async checkChainRuleCompliance(contractId: string): Promise<boolean> {
    // Implementation for Dutch chain rule compliance check
    return true; // Simplified for now
  }

  private static async checkLegalReviewPassed(contractId: string): Promise<boolean> {
    const { data: workflow } = await supabase
      .from('contract_workflows')
      .select('workflow_metadata')
      .eq('contract_id', contractId)
      .single();

    return !!(workflow?.workflow_metadata?.legal_review_approved);
  }

  private static async checkManagerApproved(contractId: string): Promise<boolean> {
    const { data: workflow } = await supabase
      .from('contract_workflows')
      .select('workflow_metadata')
      .eq('contract_id', contractId)
      .single();

    return !!(workflow?.workflow_metadata?.manager_approved);
  }

  private static async checkHRApproved(contractId: string): Promise<boolean> {
    const { data: workflow } = await supabase
      .from('contract_workflows')
      .select('workflow_metadata')
      .eq('contract_id', contractId)
      .single();

    return !!(workflow?.workflow_metadata?.hr_approved);
  }

  private static async checkContractGenerated(contractId: string): Promise<boolean> {
    const { data: contract } = await supabase
      .from('contracts')
      .select('pdf_path')
      .eq('id', contractId)
      .single();

    return !!(contract?.pdf_path);
  }

  private static async checkEmployeeSigned(contractId: string): Promise<boolean> {
    const { data: workflow } = await supabase
      .from('contract_workflows')
      .select('workflow_metadata')
      .eq('contract_id', contractId)
      .single();

    return !!(workflow?.workflow_metadata?.employee_signed);
  }

  private static async checkManagerSigned(contractId: string): Promise<boolean> {
    const { data: workflow } = await supabase
      .from('contract_workflows')
      .select('workflow_metadata')
      .eq('contract_id', contractId)
      .single();

    return !!(workflow?.workflow_metadata?.manager_signed);
  }

  private static async checkAllSignaturesComplete(contractId: string): Promise<boolean> {
    return await this.checkEmployeeSigned(contractId) &&
           await this.checkManagerSigned(contractId);
  }

  private static async checkContractActive(contractId: string): Promise<boolean> {
    const { data: contract } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', contractId)
      .single();

    return contract?.status === 'active';
  }
}