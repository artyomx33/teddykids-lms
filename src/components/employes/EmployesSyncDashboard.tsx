import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmployesIntegration } from '@/hooks/useEmployesIntegration';
import { CheckCircle, XCircle, Clock, Users, DollarSign, TrendingUp, RefreshCw, RotateCcw, Database, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export const EmployesSyncDashboard = () => {
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

  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [syncResults, setSyncResults] = useState(null);
  const [wageResults, setWageResults] = useState(null);
  const [bidirectionalResults, setBidirectionalResults] = useState(null);
  const [statistics, setStatistics] = useState({
    mappedEmployees: 0,
    mappedWageComponents: 0,
    weeklySuccessRate: { successful: 0, failed: 0 },
    lastSyncAt: null
  });
  const [endpointDiscovery, setEndpointDiscovery] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Auto-load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load statistics and employees in parallel
      await Promise.all([
        loadStatistics(),
        handleFetchEmployees()
      ]);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getSyncStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleTestConnection = async () => {
    try {
      await testConnection();
    } catch (err) {
      console.error('Connection test failed:', err);
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
      setEmployees(employeeData);
      toast.success(`Fetched ${employeeData.length} employees from Employes API`);
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleCompareStaff = async () => {
    try {
      const comparison = await compareStaffData();
      setComparisonData(comparison);
      toast.success('Staff data comparison completed');
    } catch (err) {
      toast.error('Failed to compare staff data');
    }
  };

  const handleSyncEmployees = async () => {
    try {
      const results = await syncEmployees();
      setSyncResults(results);
      await loadStatistics(); // Refresh stats
      toast.success(`Sync completed! Created: ${results.created?.length || 0}, Updated: ${results.updated?.length || 0}`);
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
      toast.success(`Bidirectional sync completed! Updates: ${results.employeeUpdates?.length || 0}`);
    } catch (err) {
      toast.error('Failed to sync from Employes');
    }
  };

  const handleGetSyncLogs = async () => {
    try {
      const logs = await getSyncLogs();
      setSyncLogs(logs);
      toast.success(`Loaded ${logs.length} sync logs`);
    } catch (err) {
      toast.error('Failed to fetch sync logs');
    }
  };

  const handleDiscoverEndpoints = async () => {
    try {
      const discovery = await discoverEndpoints();
      setEndpointDiscovery(discovery);
      toast.success(`Tested ${discovery.testedEndpoints?.length || 0} endpoints, found ${discovery.workingEndpoints?.length || 0} working`);
    } catch (err) {
      toast.error('Failed to discover endpoints');
    }
  };

  const handleDebugConnection = async () => {
    try {
      const debug = await debugConnection();
      setDebugInfo(debug);
      toast.success(`Debug completed! Tested ${debug.testResults?.length || 0} configurations`);
    } catch (err) {
      toast.error('Failed to debug connection');
    }
  };

  const ConnectionStatusBadge = () => {
    const statusConfig = {
      connected: { color: 'bg-green-500', icon: CheckCircle, text: 'Connected' },
      error: { color: 'bg-red-500', icon: XCircle, text: 'Error' },
      unknown: { color: 'bg-gray-500', icon: Clock, text: 'Unknown' }
    };

    const config = statusConfig[connectionStatus];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Employee List - Primary Focus */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employes Employees
                {employees.length > 0 && (
                  <Badge variant="secondary">{employees.length} employees</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Employee data synchronized from Employes.nl
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <ConnectionStatusBadge />
              <Button 
                onClick={handleFetchEmployees} 
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Refresh Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.slice(0, 12).map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4 space-y-2">
                    <div className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {employee.email && <div>📧 {employee.email}</div>}
                      {employee.position && <div>💼 {employee.position}</div>}
                      {employee.department && <div>🏢 {employee.department}</div>}
                      {employee.location && <div>📍 {employee.location}</div>}
                      {employee.startDate && <div>📅 Started: {new Date(employee.startDate).toLocaleDateString()}</div>}
                    </div>
                    {employee.status && (
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {employees.length > 12 && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing 12 of {employees.length} employees. View all in sync operations below.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isLoading ? 'Loading employee data...' : 'No employee data loaded yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Mapped Employees"
            value={statistics.mappedEmployees}
            icon={Users}
            description="LMS ↔ Employes mappings"
          />
          <StatCard
            title="Wage Components"
            value={statistics.mappedWageComponents}
            icon={DollarSign}
            description="Synced salary data"
          />
          <StatCard
            title="Weekly Success Rate"
            value={statistics?.weeklySuccessRate ? `${Math.round((statistics.weeklySuccessRate.successful / Math.max(1, statistics.weeklySuccessRate.successful + statistics.weeklySuccessRate.failed)) * 100)}%` : '0%'}
            icon={TrendingUp}
            description={statistics?.weeklySuccessRate ? `${statistics.weeklySuccessRate.successful} successful, ${statistics.weeklySuccessRate.failed} failed` : 'No data available'}
          />
          <StatCard
            title="Last Sync"
            value={statistics.lastSyncAt ? new Date(statistics.lastSyncAt).toLocaleDateString() : 'Never'}
            icon={Clock}
            description="Most recent activity"
          />
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sync">Sync Operations</TabsTrigger>
          <TabsTrigger value="wages">Wage Data</TabsTrigger>
          <TabsTrigger value="comparison">Data Compare</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Sync Operations Tab */}
        <TabsContent value="sync" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={handleSyncEmployees} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Sync to LMS
            </Button>
            <Button 
              onClick={handleSyncFromEmployes} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync from Employes
            </Button>
            <Button 
              onClick={handleCompareStaff} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Compare Data
            </Button>
          </div>

          {/* Sync Results */}
          {(syncResults || bidirectionalResults) && (
            <Card>
              <CardHeader>
                <CardTitle>Sync Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {syncResults && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Employee Sync to LMS:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{syncResults.created?.length || 0}</div>
                        <div>Created</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{syncResults.updated?.length || 0}</div>
                        <div>Updated</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">{syncResults.skipped?.length || 0}</div>
                        <div>Skipped</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">{syncResults.errors?.length || 0}</div>
                        <div>Errors</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {bidirectionalResults && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Sync from Employes:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{bidirectionalResults.employeeUpdates?.length || 0}</div>
                        <div>Employee Updates</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{bidirectionalResults.wageUpdates?.length || 0}</div>
                        <div>Wage Updates</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">{bidirectionalResults.errors?.length || 0}</div>
                        <div>Errors</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Wage Sync Tab */}
        <TabsContent value="wages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wage & Salary Synchronization</CardTitle>
              <CardDescription>
                Sync contract salary data from LMS to Employes payroll system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSyncWageData} 
                disabled={isLoading || connectionStatus !== 'connected'}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Sync Wage Data
              </Button>
            </CardContent>
          </Card>

          {wageResults && (
            <Card>
              <CardHeader>
                <CardTitle>Wage Sync Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="text-center">
                    <div className="font-bold text-green-600">{wageResults.created?.length || 0}</div>
                    <div>Created</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{wageResults.updated?.length || 0}</div>
                    <div>Updated</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-600">{wageResults.skipped?.length || 0}</div>
                    <div>Skipped</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">{wageResults.errors?.length || 0}</div>
                    <div>Errors</div>
                  </div>
                </div>
                
                {wageResults.errors?.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                      <ScrollArea className="h-32">
                        {wageResults.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 mb-1">
                            Contract {error.contract?.employee_name}: {error.error}
                          </div>
                        ))}
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Comparison</CardTitle>
              <CardDescription>
                Compare employee data between LMS and Employes systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCompareStaff} 
                disabled={isLoading || connectionStatus !== 'connected'}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Compare Staff Data
              </Button>
            </CardContent>
          </Card>

          {comparisonData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Matches ({comparisonData.matches?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    {comparisonData.matches?.map((match, index) => (
                      <div key={index} className="text-sm mb-2 p-2 bg-green-50 rounded">
                        <div className="font-medium">{match.lms.full_name}</div>
                        <div className="text-muted-foreground">LMS ID: {match.lms.id}</div>
                        <div className="text-muted-foreground">Employes ID: {match.employes.id}</div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Mismatches ({comparisonData.mismatches?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    {comparisonData.mismatches?.map((mismatch, index) => (
                      <div key={index} className="text-sm mb-2 p-2 bg-orange-50 rounded">
                        <div className="font-medium">
                          {mismatch.lms?.full_name || `${mismatch.employes?.firstName} ${mismatch.employes?.lastName}`}
                        </div>
                        <div className="text-muted-foreground">
                          {mismatch.lms ? 'LMS only' : 'Employes only'}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Synchronization Logs</CardTitle>
                <CardDescription>
                  Recent sync activity and error logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGetSyncLogs} 
                  disabled={isLoading}
                  className="flex items-center gap-2 mb-4"
                >
                  <Clock className="h-4 w-4" />
                  Load Recent Logs
                </Button>

                {syncLogs.length > 0 && (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {syncLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center space-x-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">{log.action}</span>
                            {log.error_message && (
                              <span className="text-xs text-red-600">({log.error_message})</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoint Discovery</CardTitle>
                <CardDescription>
                  Test API endpoints to find working connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleDiscoverEndpoints} 
                  disabled={isLoading}
                  className="flex items-center gap-2 mb-4"
                >
                  <Database className="h-4 w-4" />
                  Discover Endpoints
                </Button>

                {endpointDiscovery && (
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Base URL:</strong> {endpointDiscovery.baseUrl}
                    </div>
                    
                    {endpointDiscovery.workingEndpoints?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Working Endpoints:</h4>
                        <ScrollArea className="h-32 border rounded p-2">
                          {endpointDiscovery.workingEndpoints.map((endpoint, index) => (
                            <div key={index} className="text-sm mb-1 text-green-600">
                              ✓ {endpoint.endpoint} (Status: {endpoint.statusCode})
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                    
                    {endpointDiscovery.testedEndpoints?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">All Tested:</h4>
                        <ScrollArea className="h-32 border rounded p-2">
                          {endpointDiscovery.testedEndpoints.map((endpoint, index) => (
                            <div key={index} className={`text-sm mb-1 ${endpoint.statusCode < 400 ? 'text-green-600' : 'text-red-600'}`}>
                              {endpoint.statusCode < 400 ? '✓' : '✗'} {endpoint.endpoint} ({endpoint.statusCode})
                              {endpoint.error && ` - ${endpoint.error}`}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getConnectionIcon()}
                API Connection Settings
              </CardTitle>
              <CardDescription>
                Manage your Employes.nl API connection and debug issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Test Connection
                </Button>
                <Button 
                  onClick={handleFetchCompanies} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Fetch Companies
                </Button>
                <Button 
                  onClick={handleDebugConnection} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Debug Connection
                </Button>
              </div>

              {error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {companies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Available Companies:</h4>
                  <div className="grid gap-2">
                    {companies.map((company, index) => (
                      <div key={index} className="bg-muted p-3 rounded text-sm">
                        <div><strong>ID:</strong> {company.id || company.company_id || 'N/A'}</div>
                        <div><strong>Name:</strong> {company.name || company.company_name || 'N/A'}</div>
                        {company.address && <div><strong>Address:</strong> {company.address}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugInfo && (
                <div className="space-y-4">
                  <div className="text-sm">
                    <h4 className="font-medium mb-2">Connection Debug Info:</h4>
                    <div className="bg-muted p-3 rounded text-xs space-y-1">
                      <div><strong>API Key:</strong> {debugInfo.apiKey} ({debugInfo.apiKeyLength} chars)</div>
                      <div><strong>Preview:</strong> {debugInfo.apiKeyPreview}</div>
                      <div><strong>Base URL:</strong> {debugInfo.baseUrl}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Connection Tests:</h4>
                    <ScrollArea className="h-64 border rounded p-2">
                      {debugInfo.testResults?.map((result, index) => (
                        <div key={index} className="text-xs mb-3 p-2 border-b">
                          <div className={`font-medium ${result.canConnect ? 'text-green-600' : 'text-red-600'}`}>
                            {result.canConnect ? '✓' : '✗'} {result.baseUrl}
                          </div>
                          <div>Method: {result.method}</div>
                          {result.statusCode && <div>Status: {result.statusCode} {result.statusText}</div>}
                          {result.error && <div className="text-red-600">Error: {result.error}</div>}
                          {result.responsePreview && (
                            <div className="mt-1">
                              <div className="font-medium">Response:</div>
                              <div className="bg-gray-100 p-1 rounded">{result.responsePreview}...</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};