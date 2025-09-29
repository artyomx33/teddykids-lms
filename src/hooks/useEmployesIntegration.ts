import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeMatch, EmployesEmployee, matchEmployees } from '@/lib/employeesSync';

interface SyncLog {
  id: string;
  action: string;
  status: 'success' | 'error';
  payload?: any;
  lms_staff_id?: string;
  employes_employee_id?: string;
  error_message?: string;
  created_at: string;
}

interface ComparisonResult {
  totalEmployes: number;
  totalLMS: number;
  matches: number;
  newEmployees: number;
  conflicts: number;
  matchDetails?: EmployeeMatch[];
}

export const useEmployesIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'test_connection' }
      });

      if (data?.error) {
        setConnectionStatus('error');
        throw new Error(data.error);
      }

      setConnectionStatus('connected');
      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Connection test failed';
      setConnectionStatus('error');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'fetch_companies' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch companies';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'fetch_employees' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data) {
        console.warn('No data received from employes-integration function');
        return [];
      }

      // Robust data validation - ensure we always return an array
      let employees = data.data || data || [];

      // Double-check that employees is actually an array
      if (!Array.isArray(employees)) {
        console.warn('Employee data is not an array:', typeof employees, employees);
        // If it's an object with a data property, try that
        if (employees && typeof employees === 'object' && Array.isArray(employees.data)) {
          employees = employees.data;
        } else {
          console.error('Invalid employee data structure, returning empty array');
          return [];
        }
      }

      console.log(`✅ Successfully fetched ${employees.length} employees from Employes.nl`);
      return employees;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch employees';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const compareStaffData = useCallback(async (): Promise<ComparisonResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch employees from Employes.nl
      const employees = await fetchEmployees();

      // EMERGENCY FIX: Force array validation
      const safeEmployees = Array.isArray(employees) ? employees : [];
      console.log('🔍 Employee data check:', {
        original: typeof employees,
        isArray: Array.isArray(employees),
        length: safeEmployees.length,
        firstEmployee: safeEmployees[0]
      });

      if (safeEmployees.length === 0) {
        console.warn('❌ No employees data available for comparison');
        throw new Error('No employee data available. Please fetch employees first.');
      }

      // Use our superior client-side matching algorithm
      const matches = await matchEmployees(safeEmployees);

      // Calculate statistics
      const exactMatches = matches.filter(m => m.matchType === 'exact').length;
      const similarMatches = matches.filter(m => m.matchType === 'similar').length;
      const newEmployees = matches.filter(m => m.matchType === 'new').length;
      const conflicts = matches.filter(m => m.conflicts && m.conflicts.length > 0).length;

      return {
        totalEmployes: employees.length,
        totalLMS: matches.filter(m => m.lms).length,
        matches: exactMatches + similarMatches,
        newEmployees,
        conflicts,
        matchDetails: matches
      };
    } catch (error) {
      console.error('Compare staff data error:', error);
      setError(error instanceof Error ? error.message : 'Failed to compare staff data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchEmployees]);

  const syncEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'sync_employees' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sync employees';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncWageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'sync_wage_data' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sync wage data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncFromEmployes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'sync_from_employes' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sync from Employes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'sync_contracts' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sync contracts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSyncStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'get_sync_statistics' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get sync statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSyncLogs = useCallback(async (limit = 100): Promise<SyncLog[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'get_sync_logs', limit }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data || [];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get sync logs';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const discoverEndpoints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting comprehensive endpoint discovery...');
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'discover_endpoints' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('🎯 Discovery Results:');
      console.log(`📊 Total: ${data?.data?.summary?.total || 0}`);
      console.log(`✅ Available: ${data?.data?.summary?.available || 0}`);
      console.log(`🏛️ Contract-related: ${data?.data?.summary?.contractRelated || 0}`);
      
      if (data?.data?.contractEndpoints?.length > 0) {
        console.log('🎉 CONTRACT HISTORY ENDPOINTS FOUND:');
        data.data.contractEndpoints.forEach((ep: any) => {
          console.log(`  📍 ${ep.endpoint}: ${ep.dataStructure}`);
        });
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to discover endpoints';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debugConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'debug_connection' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to debug connection';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testIndividualEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing individual employee endpoints...');
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'test_individual_employees' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('🎯 Individual Employee Test Results:', data?.data);
      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to test individual employees';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeEmploymentData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔬 Analyzing employment data structure...');
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'analyze_employment_data' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('📊 Employment Data Analysis:', data?.data);
      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze employment data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    connectionStatus,
    error,
    testConnection,
    fetchCompanies,
    fetchEmployees,
    compareStaffData,
    getSyncLogs,
    syncEmployees,
    syncWageData,
    syncFromEmployes,
    syncContracts,
    getSyncStatistics,
    discoverEndpoints,
    debugConnection,
    testIndividualEmployees,
    analyzeEmploymentData,
  };
};