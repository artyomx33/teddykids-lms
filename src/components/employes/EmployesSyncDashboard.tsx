import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useEmployesIntegration } from '@/hooks/useEmployesIntegration';
import { EmployeeMatchCard } from './EmployeeMatchCard';
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
  ArrowLeftRight
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
    getSyncStatistics,
    discoverEndpoints,
    debugConnection
  } = useEmployesIntegration();

  // State management
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeMatches, setEmployeeMatches] = useState<EmployeeMatch[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<any>(null);
  const [wageResults, setWageResults] = useState<any>(null);
  const [bidirectionalResults, setBidirectionalResults] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [endpointDiscovery, setEndpointDiscovery] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [syncingEmployeeId, setSyncingEmployeeId] = useState<string | null>(null);

  // Load initial data
  const loadInitialData = async () => {
    try {
      await loadStatistics();
      // Use shared employee data if available, otherwise fetch fresh
      if (sharedEmployeeData && sharedEmployeeData.length > 0) {
        setEmployees(sharedEmployeeData);
        toast.success(`Using ${sharedEmployeeData.length} employees from data fetcher`);
      } else {
        await handleFetchEmployees();
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getSyncStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // Auto-refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadInitialData();
    }
  }, [refreshTrigger]);

  // Update employees when shared data changes
  useEffect(() => {
    if (sharedEmployeeData && sharedEmployeeData.length > 0) {
      setEmployees(sharedEmployeeData);
    }
  }, [sharedEmployeeData]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Event handlers
  const handleTestConnection = async () => {
    try {
      await testConnection();
      toast.success('Connection test completed');
    } catch (err) {
      toast.error('Connection test failed');
    }
  };

  const handleFetchCompanies = async () => {
    try {
      const companyData = await fetchCompanies();
      setCompanies(companyData);
      toast.success(`Fetched ${companyData.length} companies from Employes API`);
    } catch (err) {
      toast.error('Failed to fetch companies');
    }
  };

  const handleFetchEmployees = async () => {
    try {
      const employeeData = await fetchEmployees();
      console.log('Fetched employee data:', employeeData);
      console.log('Employee data type:', typeof employeeData);
      console.log('Employee data length:', employeeData?.length);
      setEmployees(employeeData || []);
      
      if (employeeData && employeeData.length > 0) {
        toast.success(`Fetched ${employeeData.length} employees from Employes API`);
      } else {
        toast.warning('No employees found in Employes API. This might be due to authentication issues or empty company data.');
      }
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      const errorMessage = err?.message || 'Failed to fetch employees';
      
      // Provide specific error messages for common issues
      if (errorMessage.includes('403')) {
        toast.error('Authentication failed: Check your Employes API key configuration');
      } else if (errorMessage.includes('404')) {
        toast.error('API endpoint not found: Check company ID or API configuration');
      } else if (errorMessage.includes('All authentication methods failed')) {
        toast.error('API key authentication failed: Please verify your Employes API key format');
      } else {
        toast.error(`Error fetching employees: ${errorMessage}`);
      }
      
      setEmployees([]);
    }
  };

  const handleCompareStaff = async () => {
    try {
      const comparison = await compareStaffData();
      setComparisonData(comparison);
      setEmployeeMatches(comparison.matchDetails || []);
      toast.success(`Comparison complete: ${comparison.totalEmployes} employees analyzed`);
    } catch (err) {
      toast.error('Failed to compare staff data');
    }
  };

  const handleSyncSingleEmployee = async (match: EmployeeMatch) => {
    setSyncingEmployeeId(match.employes.id);
    try {
      await syncEmployeeToLMS(match);
      // Refresh the comparison data to show updated state
      await handleCompareStaff();
    } finally {
      setSyncingEmployeeId(null);
    }
  };

  const handleBulkSync = async () => {
    try {
      const employeesToSync = employeeMatches.filter(m => m.syncRequired);
      if (employeesToSync.length === 0) {
        toast.info('No employees need syncing');
        return;
      }

      // Production safety confirmation
      const confirmed = confirm(
        `🚨 PRODUCTION SYNC CONFIRMATION\n\n` +
        `You are about to sync ${employeesToSync.length} employees to your LMS database.\n\n` +
        `This will:\n` +
        `• Create new employee records\n` +
        `• Update existing employee data\n` +
        `• Modify your production database\n\n` +
        `Are you sure you want to continue?`
      );

      if (!confirmed) {
        toast.info('Bulk sync cancelled by user');
        return;
      }

      const result = await syncEmployees();
      setSyncResults(result);
      await loadStatistics();
      await handleCompareStaff(); // Refresh matches
      toast.success(`✅ Bulk sync completed! Success: ${result.success || 0}, Failed: ${result.failed || 0}`);
    } catch (err) {
      toast.error('Failed to sync employees');
    }
  };

  const handleSyncWageData = async () => {
    try {
      const results = await syncWageData();
      setWageResults(results);
      await loadStatistics(); // Refresh stats
      toast.success(`Wage sync completed! Created: ${results.created?.length || 0}`);
    } catch (err) {
      toast.error('Failed to sync wage data');
    }
  };

  const handleSyncFromEmployes = async () => {
    try {
      const results = await syncFromEmployes();
      setBidirectionalResults(results);
      await loadStatistics(); // Refresh stats
      toast.success(`Bidirectional sync completed!`);
    } catch (err) {
      toast.error('Failed to sync from Employes');
    }
  };

  const handleGetSyncLogs = async () => {
    try {
      const logs = await getSyncLogs();
      setSyncLogs(logs);
      toast.success(`Fetched ${logs.length} sync log entries`);
    } catch (err) {
      toast.error('Failed to fetch sync logs');
    }
  };

  const handleDiscoverEndpoints = async () => {
    try {
      const endpoints = await discoverEndpoints();
      setEndpointDiscovery(endpoints);
      toast.success('Endpoint discovery completed');
    } catch (err) {
      toast.error('Failed to discover endpoints');
    }
  };

  const handleDebugConnection = async () => {
    try {
      const debug = await debugConnection();
      setDebugInfo(debug); 
      toast.success('Debug information retrieved');
    } catch (err) {
      toast.error('Failed to get debug information');
    }
  };

  // Helper components
  const ConnectionStatusBadge = () => {
    const variant = connectionStatus === 'connected' ? 'default' : 
                   connectionStatus === 'error' ? 'destructive' : 'secondary';
    
    const statusText = connectionStatus === 'connected' ? '🟢 Connected to Employes.nl' :
                      connectionStatus === 'error' ? '🔴 Connection Error' : '🟡 Connection Unknown';
    
    return (
      <Badge variant={variant} className="flex items-center gap-2 px-3 py-1">
        {getConnectionIcon()}
        <span className="font-medium">{statusText}</span>
      </Badge>
    );
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-3 w-3" />;
      case 'error': return <XCircle className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
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
          <h2 className="text-2xl font-bold text-primary">🏢 Production Employee Sync</h2>
          <p className="text-muted-foreground">
            Enterprise-grade synchronization between Employes.nl and your LMS database
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ConnectionStatusBadge />
          <Button 
            onClick={onGlobalRefresh || loadInitialData} 
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="min-w-[140px]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={employees?.length || 0}
            icon={Users}
            description="From Employes.nl"
          />
          <StatCard
            title="Matched"
            value={comparisonData?.matches || 0}
            icon={CheckCircle}
            description="Already in LMS"
          />
          <StatCard 
            title="New Employees"
            value={comparisonData?.newEmployees || 0}
            icon={TrendingUp}
            description="Need to be added"
          />
          <StatCard
            title="Conflicts"
            value={comparisonData?.conflicts || 0}
            icon={AlertTriangle}
            description="Data mismatches"
          />
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Employee Sync</TabsTrigger>
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
                    Employee data from Employes.nl API {employees?.length > 0 && `(${employees.length} total)`}
                  </p>
                </div>
                <Button 
                  onClick={onGlobalRefresh || handleFetchEmployees} 
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {employees && employees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {employees.slice(0, 12).map((employee) => (
                    <div key={employee.id} className="border rounded-lg p-4 space-y-2">
                      <div className="font-medium">
                        {employee.first_name || employee.firstName} {employee.surname || employee.lastName || employee.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {employee.email && <div>📧 {employee.email}</div>}
                        {employee.status && (
                          <div>
                            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                              {employee.status}
                            </Badge>
                          </div>
                        )}
                        {employee.employee_number && <div>🆔 #{employee.employee_number}</div>}
                        {employee.employment?.start_date && (
                          <div>📅 Started: {new Date(employee.employment.start_date).toLocaleDateString()}</div>
                        )}
                        {employee.employment?.contract?.hours_per_week && (
                          <div>⏰ {employee.employment.contract.hours_per_week}h/week</div>
                        )}
                        {employee.employment?.salary?.hour_wage && (
                          <div>💰 €{employee.employment.salary.hour_wage}/hour</div>
                        )}
                        {employee.phone_number && <div>📞 {employee.phone_number}</div>}
                        {(employee.zipcode || employee.city) && (
                          <div>📍 {employee.zipcode} {employee.city}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isLoading ? 'Loading employee data...' : 'No employee data available. Click "Refresh Data" to fetch employees from Employes.nl'}
                  </p>
                  {!isLoading && (
                    <Button 
                      onClick={handleFetchEmployees} 
                      className="mt-4"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Fetch Employee Data
                    </Button>
                  )}
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
                
                {employeeMatches.length > 0 && (
                  <Button 
                    onClick={handleBulkSync} 
                    disabled={isLoading}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Bulk Sync ({employeeMatches.filter(m => m.matchType === 'new' || (m.conflicts && m.conflicts.length > 0)).length} employees)
                  </Button>
                )}
              </div>

              {/* Comparison Progress */}
              {isLoading && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Processing employee comparison...</div>
                  <Progress value={33} className="w-full" />
                </div>
              )}

              {/* Comparison Summary */}
              {comparisonData && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Comparison Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{comparisonData.totalEmployes}</div>
                      <div className="text-muted-foreground">Employes.nl</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{comparisonData.matches}</div>
                      <div className="text-muted-foreground">Matched</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{comparisonData.newEmployees}</div>
                      <div className="text-muted-foreground">New</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{comparisonData.conflicts}</div>
                      <div className="text-muted-foreground">Conflicts</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {employeeMatches.length > 0 && (
                      <>
                        {employeeMatches.filter(m => m.matchType === 'exact').length} exact matches,{' '}
                        {employeeMatches.filter(m => m.matchType === 'similar').length} similar matches,{' '}
                        {employeeMatches.filter(m => m.matchType === 'new').length} new employees
                        <br />
                        Ready to sync: {employeeMatches.filter(m => m.syncRequired).length} employees
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Employee Matches */}
              {employeeMatches.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Employee Matches</h3>
                    <Badge variant="outline">
                      {employeeMatches.length} employees analyzed
                    </Badge>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {employeeMatches.map((match) => (
                      <EmployeeMatchCard
                        key={match.employes.id}
                        match={match}
                        onSync={handleSyncSingleEmployee}
                        isLoading={syncingEmployeeId === match.employes.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {comparisonData && !employeeMatches.length && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">All employees are up to date!</p>
                  <p className="text-muted-foreground">No synchronization needed at this time.</p>
                </div>
              )}
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
                    <div className="text-2xl font-bold text-green-600">{syncResults.success || 0}</div>
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
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncLogs.slice(0, 10).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.error_message || 'Success'}
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