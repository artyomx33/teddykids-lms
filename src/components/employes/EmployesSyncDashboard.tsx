import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useEmployesIntegration } from '@/hooks/useEmployesIntegration';
import { toast } from 'sonner';

export const EmployesSyncDashboard = () => {
  const {
    isLoading,
    connectionStatus,
    error,
    testConnection,
    fetchEmployees,
    compareStaffData,
    getSyncLogs
  } = useEmployesIntegration();

  const [employees, setEmployees] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, [testConnection]);

  const handleFetchEmployees = async () => {
    try {
      const employeesData = await fetchEmployees();
      setEmployees(employeesData);
      toast.success(`Fetched ${employeesData.length} employees from Employes API`);
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleCompareData = async () => {
    try {
      const comparisonData = await compareStaffData();
      setComparison(comparisonData);
      toast.success('Staff data comparison completed');
    } catch (err) {
      toast.error('Failed to compare staff data');
    }
  };

  const handleGetLogs = async () => {
    try {
      const logsData = await getSyncLogs();
      setLogs(logsData);
      toast.success(`Loaded ${logsData.length} sync logs`);
    } catch (err) {
      toast.error('Failed to fetch sync logs');
    }
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

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="outline" className="text-green-600 border-green-200">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <CardTitle className="text-lg">Employes API Connection</CardTitle>
          </div>
          {getConnectionBadge()}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {connectionStatus === 'connected' 
                  ? 'Successfully connected to Employes API' 
                  : connectionStatus === 'error'
                  ? 'Unable to connect to Employes API'
                  : 'Testing connection...'}
              </p>
              {error && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testConnection}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Discovery Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Fetch Employees
            </CardTitle>
            <CardDescription>
              Pull all employee data from Employes API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleFetchEmployees}
              disabled={isLoading || connectionStatus !== 'connected'}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Fetch Data
            </Button>
            {employees.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {employees.length} employees fetched
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Compare Data
            </CardTitle>
            <CardDescription>
              Match LMS staff with Employes employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCompareData}
              disabled={isLoading || connectionStatus !== 'connected'}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Compare
            </Button>
            {comparison && (
              <p className="text-sm text-muted-foreground mt-2">
                {comparison.matches?.length || 0} matches found
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Sync Logs
            </CardTitle>
            <CardDescription>
              View integration activity logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGetLogs}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              View Logs
            </Button>
            {logs.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {logs.length} log entries
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Data Comparison Results</CardTitle>
            <CardDescription>
              Matching analysis between LMS staff and Employes employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{comparison.matches?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Perfect Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{comparison.mismatches?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Mismatches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{comparison.lmsStaff?.length || 0}</div>
                <div className="text-sm text-muted-foreground">LMS Staff Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{comparison.employesEmployees?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Employes Total</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              {comparison.matches?.length > 0 && (
                <div>
                  <h4 className="font-medium flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Perfect Matches
                  </h4>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {comparison.matches.map((match, index) => (
                      <div key={index} className="text-sm py-1">
                        <span className="font-medium">{match.lms?.full_name}</span>
                        <span className="text-muted-foreground mx-2">↔</span>
                        <span>{match.employes?.firstName} {match.employes?.lastName}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              {comparison.mismatches?.length > 0 && (
                <div>
                  <h4 className="font-medium flex items-center mb-2">
                    <UserX className="h-4 w-4 mr-2 text-yellow-500" />
                    Mismatches & Unmatched Records
                  </h4>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {comparison.mismatches.map((mismatch, index) => (
                      <div key={index} className="text-sm py-1">
                        <span className="font-medium">
                          {mismatch.lms?.full_name || 'No LMS record'}
                        </span>
                        <span className="text-muted-foreground mx-2">↔</span>
                        <span>
                          {mismatch.employes 
                            ? `${mismatch.employes.firstName} ${mismatch.employes.lastName}`
                            : 'No Employes record'
                          }
                        </span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sync Activity</CardTitle>
            <CardDescription>
              Latest integration logs and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {logs.map((log) => (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};