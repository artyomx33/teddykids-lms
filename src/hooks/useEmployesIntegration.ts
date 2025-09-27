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

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch employees';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const compareStaffData = useCallback(async (): Promise<ComparisonResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'compare_staff_data' }
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to compare staff data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      const { data } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'discover_endpoints' }
      });

      if (data?.error) {
        throw new Error(data.error);
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
  };
};