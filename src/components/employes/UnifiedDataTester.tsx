/**
 * 🧪 UNIFIED DATA TESTER
 *
 * Test the new UnifiedDataService with Employes.nl sync
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UnifiedDataService, type StaffData } from "@/lib/unified-data-service";
import { executeUnifiedSync } from "@/lib/unified-sync";
import { TestTube, Zap, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

export function UnifiedDataTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Test with Adéla Jarošová (the user mentioned this name)
  const TEST_STAFF_NAME = "Adéla Jarošová";

  const runFullTest = async () => {
    setIsLoading(true);
    setSyncResult(null);
    setTestResult(null);

    try {
      console.log('🧪 Starting full test: Sync + Unified Data Service');

      // Step 1: Run unified sync
      console.log('📡 Step 1: Running unified sync...');
      const sync = await executeUnifiedSync();
      setSyncResult(sync);

      if (!sync.success) {
        throw new Error('Sync failed: ' + sync.summary);
      }

      // Step 2: Find the test staff member
      console.log('🔍 Step 2: Finding staff member:', TEST_STAFF_NAME);

      // First get all staff to find the ID
      const allContracts = await UnifiedDataService.getContractsData();
      const testStaffContract = allContracts.find(c =>
        c.full_name.toLowerCase().includes('adéla') ||
        c.full_name.toLowerCase().includes('adela')
      );

      if (!testStaffContract) {
        throw new Error(`Could not find staff member: ${TEST_STAFF_NAME}`);
      }

      console.log('✅ Found test staff:', testStaffContract.full_name, 'ID:', testStaffContract.staff_id);

      // Step 3: Test UnifiedDataService
      console.log('🎯 Step 3: Testing UnifiedDataService...');
      const staffData = await UnifiedDataService.getStaffData(testStaffContract.staff_id);

      // Step 4: Run consistency check
      console.log('🧪 Step 4: Running consistency check...');
      const consistencyCheck = await UnifiedDataService.debugDataConsistency(testStaffContract.staff_id);

      // Step 5: Get analytics summary
      console.log('📊 Step 5: Getting analytics summary...');
      const analytics = await UnifiedDataService.getAnalyticsSummary();

      setTestResult({
        success: true,
        staff_data: staffData,
        consistency: consistencyCheck,
        analytics,
        test_staff: testStaffContract
      });

      console.log('✅ Full test completed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testUnifiedServiceOnly = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🎯 Testing UnifiedDataService only...');

      // Get all contracts first
      const allContracts = await UnifiedDataService.getContractsData();
      console.log(`📋 Found ${allContracts.length} total contracts`);

      // Find test staff
      const testStaffContract = allContracts.find(c =>
        c.full_name.toLowerCase().includes('adéla') ||
        c.full_name.toLowerCase().includes('adela')
      );

      if (!testStaffContract) {
        // Just test with first available staff
        const firstStaff = allContracts[0];
        if (!firstStaff) {
          throw new Error('No contracts found - run sync first');
        }

        console.log('Using first available staff:', firstStaff.full_name);
        const staffData = await UnifiedDataService.getStaffData(firstStaff.staff_id);
        const analytics = await UnifiedDataService.getAnalyticsSummary();

        setTestResult({
          success: true,
          staff_data: staffData,
          analytics,
          test_staff: firstStaff,
          note: 'Used first available staff (Adéla not found)'
        });
        return;
      }

      // Test with Adéla
      console.log('✅ Found Adéla:', testStaffContract.full_name);
      const staffData = await UnifiedDataService.getStaffData(testStaffContract.staff_id);
      const consistencyCheck = await UnifiedDataService.debugDataConsistency(testStaffContract.staff_id);
      const analytics = await UnifiedDataService.getAnalyticsSummary();

      setTestResult({
        success: true,
        staff_data: staffData,
        consistency: consistencyCheck,
        analytics,
        test_staff: testStaffContract
      });

    } catch (error) {
      console.error('❌ UnifiedDataService test failed:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-500" />
          Unified Data Service Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={runFullTest}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Full Test...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Full Test: Sync + Data Service
              </>
            )}
          </Button>

          <Button
            onClick={testUnifiedServiceOnly}
            disabled={isTesting}
            variant="outline"
            className="border-purple-300 hover:bg-purple-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing Service...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Data Service Only
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
          <p><strong>Test Plan:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>🔄 Run Employes.nl sync (full test only)</li>
            <li>🎯 Test UnifiedDataService with {TEST_STAFF_NAME}</li>
            <li>🧪 Compare old vs new data consistency</li>
            <li>📊 Verify analytics work correctly</li>
          </ul>
        </div>

        {/* Sync Results */}
        {syncResult && (
          <div className="space-y-3">
            <h4 className="font-medium">📡 Sync Results</h4>
            <Alert className={syncResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              {syncResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                <div className="font-medium">{syncResult.summary}</div>
                {syncResult.success && (
                  <div className="text-sm mt-1">
                    Employees: {syncResult.employees_processed} |
                    New: {syncResult.contracts_created} |
                    Updated: {syncResult.contracts_updated}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <div className="space-y-4">
            <h4 className="font-medium">🧪 UnifiedDataService Test Results</h4>

            <Alert className={testResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {testResult.success ? (
                  <div>
                    <div className="font-medium">✅ UnifiedDataService Working!</div>
                    <div className="text-sm mt-1">
                      Testing with: {testResult.test_staff?.full_name}
                      {testResult.note && <span className="text-orange-600"> ({testResult.note})</span>}
                    </div>
                  </div>
                ) : (
                  <div className="font-medium">❌ Test Failed: {testResult.error}</div>
                )}
              </AlertDescription>
            </Alert>

            {testResult.success && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Staff Data Summary */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">Staff Data</h5>
                  <div className="space-y-1 text-sm">
                    <div>Name: <strong>{testResult.staff_data?.full_name}</strong></div>
                    <div>Contracts: <strong>{testResult.staff_data?.total_contracts}</strong></div>
                    <div>Reviews: <strong>{testResult.staff_data?.reviews?.length || 0}</strong></div>
                    <div>Current: <strong>{testResult.staff_data?.current_contract ? 'Yes' : 'No'}</strong></div>
                  </div>
                </div>

                {/* Analytics Summary */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">Analytics</h5>
                  <div className="space-y-1 text-sm">
                    <div>Total: <strong>{testResult.analytics?.total_contracts}</strong></div>
                    <div>Active: <strong>{testResult.analytics?.active_contracts}</strong></div>
                    <div>Need Review: <strong>{testResult.analytics?.needing_review}</strong></div>
                    <div>5-Star: <strong>{testResult.analytics?.five_star_staff}</strong></div>
                  </div>
                </div>

                {/* Consistency Check */}
                {testResult.consistency && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h5 className="font-medium text-purple-800 mb-2">Consistency</h5>
                    <div className="space-y-1 text-sm">
                      <div>Unified: <strong>{testResult.consistency.unified?.all_contracts?.length || 0}</strong></div>
                      <div>Legacy: <strong>{testResult.consistency.legacy?.contracts?.length || 0}</strong></div>
                      <div>Enriched: <strong>{testResult.consistency.legacy?.enriched?.length || 0}</strong></div>
                      <div className={testResult.consistency.unified?.all_contracts?.length === testResult.consistency.legacy?.enriched?.length ? 'text-green-600' : 'text-orange-600'}>
                        Status: <strong>{testResult.consistency.unified?.all_contracts?.length === testResult.consistency.legacy?.enriched?.length ? 'Consistent' : 'Check Needed'}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}