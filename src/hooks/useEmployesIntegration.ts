import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface EmployeeMatch {
  employes: any;
  lms?: any;
  matchType: 'exact' | 'similar' | 'new';
  confidence: number;
  conflicts: string[];
}

interface EmployesEmployee {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  phone_number?: string;
  status: string;
  employment?: any;
}

export const useEmployesIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'test_connection' }
      });

      if (funcError) throw funcError;

      if (!data) {
        setConnectionStatus('error');
        setError('No response data received');
        return { connected: false, error: 'No response data received' };
      }

      setConnectionStatus(data.connected ? 'connected' : 'error');
      if (!data.connected) {
        setError(data.error || 'Connection failed');
      }
      
      return data;
    } catch (err: any) {
      console.error('Connection test failed:', err);
      setConnectionStatus('error');
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'fetch_companies' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return [];
      }

      return data.data || data;
    } catch (err: any) {
      console.error('Failed to fetch companies:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async (): Promise<EmployesEmployee[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'fetch_employees' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return [];
      }

      // The API returns { data: [...employees], total: X, pages: Y }
      return data.data || [];
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const compareStaffData = useCallback(async (): Promise<ComparisonResult> => {
    try {
      setIsLoading(true);
      
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'compare_staff_data' }
      });

      if (funcError) throw funcError;

      if (!data) {
        throw new Error('No comparison data received');
      }

      return data;
    } catch (error) {
      console.error('Compare staff data error:', error);
      setError(error instanceof Error ? error.message : 'Failed to compare staff data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSyncLogs = useCallback(async (): Promise<SyncLog[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'get_sync_logs' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return [];
      }

      return data.logs || [];
    } catch (err: any) {
      console.error('Failed to fetch sync logs:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'sync_employees_to_lms' }
      });

      if (funcError) throw funcError;

      if (!data) {
        throw new Error('No sync result received');
      }

      return data;
    } catch (error) {
      console.error('Sync employees error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sync employees');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncWageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'sync_wage_data' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return { successful: false, created: [], updated: [], errors: ['No response data received'] };
      }

      return data;
    } catch (err: any) {
      console.error('Failed to sync wage data:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncFromEmployes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'sync_from_employes' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return { successful: false, employeeUpdates: [], wageUpdates: [], errors: ['No response data received'] };
      }

      return data;
    } catch (err: any) {
      console.error('Failed to sync from Employes:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSyncStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'get_sync_statistics' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return { 
          mappedEmployees: 0, 
          mappedWageComponents: 0, 
          weeklySuccessRate: { successful: 0, failed: 0 }, 
          lastSyncAt: null 
        };
      }

      return data;
    } catch (err: any) {
      console.error('Failed to get sync statistics:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const discoverEndpoints = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'discover_endpoints' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return { testedEndpoints: [], workingEndpoints: [], errors: ['No response data received'] };
      }

      return data;
    } catch (err: any) {
      console.error('Failed to discover endpoints:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debugConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'debug_connection' }
      });

      if (funcError) throw funcError;

      if (!data) {
        return { apiKey: 'Not configured', testResults: [], errors: ['No response data received'] };
      }

      return data;
    } catch (err: any) {
      console.error('Failed to debug connection:', err);
      setError(err.message);
      throw err;
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
    getSyncStatistics,
    discoverEndpoints,
    debugConnection,
  };
};
