import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useEmployesIntegration } from '@/hooks/useEmployesIntegration';
import { EmployeeMatchCard } from './EmployeeMatchCard';
import { EmployeeDataExpansion } from './EmployeeDataExpansion';
import { EmployeeMatch, syncEmployeeToLMS } from '@/lib/employeesSync';
import { 
  Building2, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
  Database,
  ArrowLeftRight,
  Loader2,
  FileText,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployesSyncDashboardProps {
  refreshTrigger?: number;
  onGlobalRefresh?: () => void;
  sharedEmployeeData?: any[];
}

export const EmployesSyncDashboard = ({ refreshTrigger, onGlobalRefresh, sharedEmployeeData }: EmployesSyncDashboardProps) => {
  const {
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
  } = useEmployesIntegration();

  // State management
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    recentSyncs: 0,
    lastSync: null as string | null
  });
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<any>(null);
  const [contractResults, setContractResults] = useState<any>(null);
  const [wageResults, setWageResults] = useState<any>(null);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Load initial data
  const loadInitialData = async () => {
    try {
      const statsData = await getSyncStatistics();
      if (statsData) {
        setStats(statsData);
      }
      
      // Use shared data if available, otherwise fetch
      if (sharedEmployeeData && sharedEmployeeData.length > 0) {
        setEmployees(sharedEmployeeData);
        setStats(prev => ({ ...prev, totalEmployees: sharedEmployeeData.length }));
      } else {
        const employeeData = await fetchEmployees();
        if (employeeData && Array.isArray(employeeData)) {
          setEmployees(employeeData);
          setStats(prev => ({ ...prev, totalEmployees: employeeData.length }));
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger) {
      loadInitialData();
    }
  }, [refreshTrigger]);

  // Update employees when shared data changes
  useEffect(() => {
    if (sharedEmployeeData && sharedEmployeeData.length > 0) {
      setEmployees(sharedEmployeeData);
      setStats(prev => ({ ...prev, totalEmployees: sharedEmployeeData.length }));
    }
  }, [sharedEmployeeData]);

  // Event handlers
  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      if (result) {
        toast.success('Connection test successful!');
        onGlobalRefresh?.();
      }
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  const handleFetchCompanies = async () => {
    try {
      const result = await fetchCompanies();
      if (result && Array.isArray(result)) {
        setCompanies(result);
        toast.success(`Fetched ${result.length} companies`);
      }
    } catch (error) {
      toast.error('Failed to fetch companies');
    }
  };

  const handleFetchEmployees = async () => {
    try {
      const result = await fetchEmployees();
      if (result && Array.isArray(result)) {
        setEmployees(result);
        setStats(prev => ({ ...prev, totalEmployees: result.length }));
        toast.success(`Fetched ${result.length} employees`);
        onGlobalRefresh?.();
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleCompareStaff = async () => {
    try {
      const result = await compareStaffData();
      if (result && Array.isArray(result)) {
        setComparisons(result);
        toast.success(`Compared ${result.length} employees`);
      }
    } catch (error) {
      toast.error('Failed to compare staff data');
    }
  };

  const handleSyncSingleEmployee = async (employee: any) => {
    try {
      const result = await syncEmployeeToLMS(employee);
      if (result) {
        toast.success(`Synced employee: ${employee.first_name} ${employee.last_name}`);
        // Refresh comparisons
        handleCompareStaff();
        onGlobalRefresh?.();
      }
    } catch (error) {
      toast.error(`Failed to sync employee: ${employee.first_name} ${employee.last_name}`);
    }
  };

  const handleBulkSync = async () => {
    try {
      const pendingSync = comparisons.filter(c => c.status === 'needs_sync' || c.status === 'update_needed');
      if (pendingSync.length === 0) {
        toast.info('No employees need synchronization');
        return;
      }

      const result = await syncEmployees();
      if (result) {
        setSyncResults(result);
        toast.success(`Bulk sync completed: ${result.successful || 0} successful, ${result.failed || 0} failed`);
        // Refresh data
        await loadInitialData();
        handleCompareStaff();
        onGlobalRefresh?.();
      }
    } catch (error) {
      toast.error('Bulk sync failed');
    }
  };

  const handleSyncWageData = async () => {
    try {
      const result = await syncWageData();
      if (result) {
        setWageResults(result);
        toast.success('Wage data synchronized successfully');
        onGlobalRefresh?.();
      }
    } catch (error) {
      toast.error('Failed to sync wage data');
    }
  };

  const handleSyncFromEmployes = async () => {
    try {
      const result = await syncFromEmployes();
      if (result) {
        setSyncResults(result);
        toast.success('Synchronization from Employes completed');
        await loadInitialData();
        onGlobalRefresh?.();
      }
    } catch (error) {
      toast.error('Failed to sync from Employes');
    }
  };

  const handleSyncContracts = async () => {
    try {
      const result = await syncContracts();
      if (result) {
        setContractResults(result);
        toast.success('Contract synchronization completed');
        onGlobalRefresh?.();
      }
    } catch (error) {
      toast.error('Failed to sync contracts');
    }
  };

  const handleGetSyncLogs = async () => {
    try {
      const result = await getSyncLogs();
      if (result && Array.isArray(result)) {
        setSyncLogs(result);
        toast.success(`Loaded ${result.length} log entries`);
      }
    } catch (error) {
      toast.error('Failed to fetch sync logs');
    }
  };

  const handleDiscoverEndpoints = async () => {
    try {
      const result = await discoverEndpoints();
      if (result) {
        toast.success('Endpoints discovery completed');
        setDebugInfo(result);
      }
    } catch (error) {
      toast.error('Failed to discover endpoints');
    }
  };

  const handleDebugConnection = async () => {
    try {
      const result = await debugConnection();
      if (result) {
        setDebugInfo(result);
        toast.success('Debug information retrieved');
      }
    } catch (error) {
      toast.error('Failed to get debug information');
    }
  };

  const handleTestIndividualEmployees = async () => {
    try {
      const result = await testIndividualEmployees();
      if (result) {
        setDebugInfo(result);
        toast.success('Individual employee tests completed');
      }
    } catch (error) {
      toast.error('Failed to test individual employees');
    }
  };

  const handleAnalyzeEmploymentData = async () => {
    try {
      const result = await analyzeEmploymentData();
      if (result) {
        setDebugInfo(result);
        toast.success('Employment data analysis completed');
      }
    } catch (error) {
      toast.error('Failed to analyze employment data');
    }
  };

  // Helper components
  const ConnectionStatusBadge = () => {
    const getIcon = () => {
      switch (connectionStatus) {
        case 'connected': return <CheckCircle className="h-4 w-4" />;
        case 'error': return <XCircle className="h-4 w-4" />;
        case 'unknown': return <Loader2 className="h-4 w-4 animate-spin" />;
        default: return <AlertTriangle className="h-4 w-4" />;
      }
    };

    const getVariant = () => {
      switch (connectionStatus) {
        case 'connected': return 'default';
        case 'error': return 'destructive';
        case 'unknown': return 'secondary';
        default: return 'outline';
      }
    };

    return (
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getIcon()}
        {connectionStatus || 'Unknown'}
      </Badge>
    );
  };

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employes.nl Integration</h1>
          <p className="text-muted-foreground">
            Synchronize employee data between Employes.nl and your LMS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatusBadge />
          <Button 
            onClick={loadInitialData} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          description="From Employes.nl API"
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          icon={CheckCircle}
          description="Currently active"
        />
        <StatCard
          title="Recent Syncs"
          value={stats.recentSyncs}
          icon={Activity}
          description="Last 30 days"
        />
        <StatCard
          title="Last Sync"
          value={stats.lastSync ? new Date(stats.lastSync).toLocaleDateString() : 'Never'}
          icon={Calendar}
          description="Most recent sync"
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Employee Sync</TabsTrigger>
          <TabsTrigger value="expansion">Data Expansion</TabsTrigger>
          <TabsTrigger value="wage">Wage Data</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Data Overview
              </CardTitle>
              <CardDescription>
                Current employee data from Employes.nl API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {employees.length} employees loaded
                  </p>
                  {employees.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date().toLocaleString()}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleFetchEmployees} 
                  disabled={isLoading}
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {employees.length === 0 ? 'Load Employee Data' : 'Refresh Data'}
                </Button>
              </div>

              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No employee data loaded</p>
                  <p className="text-muted-foreground mb-4">
                    Click the button above to fetch employee data from Employes.nl
                  </p>
                  {!sharedEmployeeData && (
                    <Button 
                      onClick={handleFetchEmployees} 
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Fetch Employee Data
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto">
                  {employees.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {employee.id} • {employee.status || 'Active'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{employee.department || 'No Department'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                Employee Synchronization
              </CardTitle>
              <CardDescription>
                Compare and sync employee data between Employes.nl and LMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleCompareStaff} 
                  disabled={isLoading || !employees?.length}
                  variant="outline"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {isLoading ? 'Comparing...' : `Compare Data ${employees?.length ? `(${employees.length} employees)` : ''}`}
                </Button>
                
                <Button 
                  onClick={handleSyncContracts} 
                  disabled={isLoading || !employees?.length}
                  variant="default"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoading ? 'Syncing Contracts...' : 'Sync Employment Contracts'}
                </Button>
                
                {comparisons.length > 0 && (
                  <>
                    <Button 
                      onClick={handleBulkSync} 
                      disabled={isLoading || !comparisons.some(c => c.status === 'needs_sync' || c.status === 'update_needed')}
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Bulk Sync ({comparisons.filter(c => c.status === 'needs_sync' || c.status === 'update_needed').length})
                    </Button>
                    
                    <Button 
                      onClick={handleSyncFromEmployes} 
                      disabled={isLoading}
                      variant="secondary"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Full Sync from Employes
                    </Button>
                  </>
                )}
              </div>

              {contractResults && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Contract Sync Results</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{contractResults.summary?.contracts_created || 0}</div>
                        <div className="text-sm text-muted-foreground">Created</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{contractResults.summary?.contracts_updated || 0}</div>
                        <div className="text-sm text-muted-foreground">Updated</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{contractResults.summary?.contracts_skipped || 0}</div>
                        <div className="text-sm text-muted-foreground">Skipped</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{contractResults.summary?.errors || 0}</div>
                        <div className="text-sm text-muted-foreground">Errors</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {comparisons.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Comparison Results ({comparisons.length})</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        ✓ {comparisons.filter(c => c.status === 'synced').length} Synced
                      </Badge>
                      <Badge variant="secondary">
                        ↑ {comparisons.filter(c => c.status === 'needs_sync').length} New
                      </Badge>
                      <Badge variant="destructive">
                        ⚠ {comparisons.filter(c => c.status === 'update_needed').length} Updates
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 max-h-96 overflow-auto">
                    {comparisons.map((comparison, index) => (
                      <EmployeeMatchCard
                        key={index}
                        match={comparison}
                        onSync={() => handleSyncSingleEmployee(comparison.employes_data)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {comparisons.length === 0 && employees.length > 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">All employees are up to date!</p>
                  <p className="text-muted-foreground">No synchronization needed at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Sync Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Data Synchronization
              </CardTitle>
              <CardDescription>
                Sync employment contracts and job data from Employes.nl
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleSyncContracts} 
                  disabled={isLoading || !employees?.length}
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoading ? 'Syncing Contracts...' : 'Sync Employment Contracts'}
                </Button>

                {contractResults && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Contract Sync Results</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-green-600">Created:</span> {contractResults.created || 0}
                      </div>
                      <div>
                        <span className="font-medium text-blue-600">Updated:</span> {contractResults.updated || 0}
                      </div>
                      <div>
                        <span className="font-medium text-yellow-600">Skipped:</span> {contractResults.skipped || 0}
                      </div>
                    </div>
                    {contractResults.message && (
                      <p className="text-sm text-muted-foreground mt-2">{contractResults.message}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sync Results */}
          {syncResults && (
            <Card>
              <CardHeader>
                <CardTitle>Last Sync Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{syncResults.successful || 0}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{syncResults.failed || 0}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{syncResults.skipped || 0}</div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expansion" className="space-y-6">
          <EmployeeDataExpansion 
            employees={employees}
            onExpandDataFetch={handleSyncFromEmployes}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="wage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Wage Data Synchronization
              </CardTitle>
              <CardDescription>
                Sync salary and wage information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSyncWageData} 
                disabled={isLoading}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Sync Wage Data
              </Button>

              {wageResults && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Wage Sync Results</h4>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(wageResults, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <CardDescription>
                View synchronization activity and errors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetSyncLogs} 
                disabled={isLoading}
              >
                <Activity className="h-4 w-4 mr-2" />
                Load Recent Logs
              </Button>

              {syncLogs.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={log.status === 'success' ? 'default' : 'destructive'}
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* API Discovery Section */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Phase 1: API Discovery</h3>
                <p className="text-sm text-muted-foreground">
                  Discover contract history endpoints in Employes.nl API
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDiscoverEndpoints}
                  disabled={isLoading}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Activity className="h-4 w-4" />
                  )}
                  Discover Endpoints
                </Button>
                <Button
                  onClick={handleTestIndividualEmployees}
                  disabled={isLoading}
                  variant="outline"
                >
                  Test Individual
                </Button>
                <Button
                  onClick={handleAnalyzeEmploymentData}
                  disabled={isLoading}
                  variant="outline"
                >
                  Analyze Data
                </Button>
              </div>
            </div>

            {debugInfo?.summary && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium text-blue-900">Total Tested</div>
                    <div className="text-xl font-bold text-blue-600">{debugInfo.summary.total || 0}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-900">Available</div>
                    <div className="text-xl font-bold text-green-600">{debugInfo.summary.available || 0}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="font-medium text-purple-900">Contract History</div>
                    <div className="text-xl font-bold text-purple-600">{debugInfo.summary.contractRelated || 0}</div>
                  </div>
                </div>

                {debugInfo.contractEndpoints && debugInfo.contractEndpoints.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">🎉 Contract History Endpoints Found!</h4>
                    <div className="space-y-2">
                      {debugInfo.contractEndpoints.map((endpoint: any) => (
                        <div key={endpoint.endpoint} className="bg-green-50 p-3 rounded border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-sm font-medium text-green-800">
                              /{endpoint.endpoint}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {endpoint.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {endpoint.dataStructure}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connection & Settings
              </CardTitle>
              <CardDescription>
                Test API connection and manage settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isLoading}
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                
                <Button 
                  onClick={handleFetchCompanies} 
                  disabled={isLoading}
                  variant="outline"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Fetch Companies
                </Button>
                
                <Button 
                  onClick={handleDiscoverEndpoints} 
                  disabled={isLoading}
                  variant="outline"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Discover Endpoints
                </Button>
                
                <Button 
                  onClick={handleDebugConnection} 
                  disabled={isLoading}
                  variant="outline"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Debug Connection
                </Button>
              </div>

              {companies.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Companies ({companies.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {companies.map((company) => (
                      <div key={company.id} className="p-2 border rounded text-sm">
                        {company.name || company.company_name || company.id}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugInfo && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Debug Information</h4>
                  <pre className="text-sm overflow-auto max-h-64">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};