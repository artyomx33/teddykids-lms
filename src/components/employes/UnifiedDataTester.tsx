import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UnifiedEmploymentService, type UnifiedEmploymentData } from '@/lib/unified-employment-data';
import { Loader2, CheckCircle2, AlertCircle, Database } from 'lucide-react';

export function UnifiedDataTester() {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<UnifiedEmploymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Adéla's staff ID for testing
  const ADELA_STAFF_ID = '8842f515-e4a3-40a4-bcfc-641399463ecf';

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setTestData(null);

    try {
      console.log('Testing unified data service...');
      const data = await UnifiedEmploymentService.getEmploymentData(ADELA_STAFF_ID);
      
      if (!data) {
        setError('No data found for staff member');
        return;
      }

      setTestData(data);
      console.log('Unified data retrieved:', data);
    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'Failed to fetch unified data');
    } finally {
      setLoading(false);
    }
  };

  const getDataSourceBadge = (source: string) => {
    switch (source) {
      case 'employes_sync':
        return <Badge className="bg-green-500">🔄 Employes Sync</Badge>;
      case 'contract_generated':
        return <Badge className="bg-blue-500">📄 Contract Generated</Badge>;
      case 'manual_entry':
        return <Badge className="bg-yellow-500">✏️ Manual Entry</Badge>;
      default:
        return <Badge variant="secondary">⚠️ Unknown</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'verified':
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'calculated':
        return <Badge className="bg-blue-600"><Database className="w-3 h-3 mr-1" />Calculated</Badge>;
      case 'manual':
        return <Badge className="bg-yellow-600">✏️ Manual</Badge>;
      default:
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Incomplete</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Unified Data Service Tester</CardTitle>
        <CardDescription>
          Test the new unified employment data service that queries contracts_enriched as single source
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Test with Adéla's Data
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {testData && (
          <div className="space-y-4">
            {/* Current Employment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Employment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Data Source:</span>
                  {getDataSourceBadge(testData.current.dataSource)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Confidence:</span>
                  {getConfidenceBadge(testData.dataQuality.confidence)}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{testData.current.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{testData.current.position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{testData.current.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Type</p>
                    <p className="font-medium">{testData.current.contractType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{testData.current.startDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{testData.current.endDate || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Quality Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Quality Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Has Employes Sync Data</span>
                  {testData.dataQuality.hasEmployesSync ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Has Contract Data</span>
                  {testData.dataQuality.hasContractData ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Has Manual Data</span>
                  {testData.dataQuality.hasManualData ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{testData.contracts.length}</p>
                    <p className="text-sm text-muted-foreground">Contracts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{testData.salaryHistory.length}</p>
                    <p className="text-sm text-muted-foreground">Salary Records</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{testData.employmentHistory.length}</p>
                    <p className="text-sm text-muted-foreground">History Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Salary (if available) */}
            {testData.salaryHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Salary Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Scale/Trede</p>
                      <p className="font-medium">
                        {testData.salaryHistory[0].scale || 'N/A'} / {testData.salaryHistory[0].trede || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Monthly</p>
                      <p className="font-medium">€{testData.salaryHistory[0].grossMonthly.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Wage</p>
                      <p className="font-medium">
                        {testData.salaryHistory[0].hourlyWage 
                          ? `€${testData.salaryHistory[0].hourlyWage.toFixed(2)}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hours/Week</p>
                      <p className="font-medium">{testData.salaryHistory[0].hoursPerWeek}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Data Source</p>
                    <Badge variant="outline">{testData.salaryHistory[0].dataSource || 'unknown'}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
