/**
 * 🔍 DATABASE INVESTIGATOR
 *
 * Direct database queries to find the REAL source of salary progression data
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Search, Database, AlertTriangle } from "lucide-react";

export function DatabaseInvestigator() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const ADELA_STAFF_ID = '8842f515-e4a3-40a4-bcfc-641399463ecf';

  const investigateDatabase = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      console.log('🔍 Investigating database for Adéla Jarošová...');

      // Check all possible data sources
      const [
        caoSalaryResult,
        contractsResult,
        contractsEnrichedResult,
        staffResult,
        staffEmploymentResult
      ] = await Promise.all([
        // 1. cao_salary_history table
        supabase
          .from('cao_salary_history')
          .select('*')
          .eq('staff_id', ADELA_STAFF_ID)
          .order('valid_from', { ascending: false }),

        // 2. contracts table
        supabase
          .from('contracts')
          .select('*')
          .eq('staff_id', ADELA_STAFF_ID)
          .order('created_at', { ascending: false }),

        // 3. contracts_enriched view
        supabase
          .from('contracts_enriched')
          .select('*')
          .eq('staff_id', ADELA_STAFF_ID)
          .order('start_date', { ascending: false }),

        // 4. staff table
        supabase
          .from('staff')
          .select('*')
          .eq('id', ADELA_STAFF_ID)
          .single(),

        // 5. staff_employment_history table
        supabase
          .from('staff_employment_history')
          .select('*')
          .eq('staff_id', ADELA_STAFF_ID)
          .order('start_date', { ascending: false })
      ]);

      // Check for errors
      const errors = [
        caoSalaryResult.error,
        contractsResult.error,
        contractsEnrichedResult.error,
        staffResult.error,
        staffEmploymentResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Database query errors:', errors);
      }

      // Also check contracts by name (old method)
      let contractsByNameResult = null;
      if (staffResult.data?.full_name) {
        contractsByNameResult = await supabase
          .from('contracts')
          .select('*')
          .eq('employee_name', staffResult.data.full_name)
          .order('created_at', { ascending: false });
      }

      const investigation = {
        staff_id: ADELA_STAFF_ID,
        staff_name: staffResult.data?.full_name || 'Unknown',

        // Data counts
        cao_salary_count: caoSalaryResult.data?.length || 0,
        contracts_count: contractsResult.data?.length || 0,
        contracts_enriched_count: contractsEnrichedResult.data?.length || 0,
        employment_history_count: staffEmploymentResult.data?.length || 0,
        contracts_by_name_count: contractsByNameResult?.data?.length || 0,

        // Actual data
        cao_salary_data: caoSalaryResult.data || [],
        contracts_data: contractsResult.data || [],
        contracts_enriched_data: contractsEnrichedResult.data || [],
        staff_data: staffResult.data,
        employment_history_data: staffEmploymentResult.data || [],
        contracts_by_name_data: contractsByNameResult?.data || [],

        // Analysis
        has_real_salary_history: (caoSalaryResult.data?.length || 0) > 0,
        has_real_contracts: (contractsResult.data?.length || 0) > 0,
        has_enriched_data: (contractsEnrichedResult.data?.length || 0) > 0,
        has_employment_history: (staffEmploymentResult.data?.length || 0) > 0,

        // Errors
        errors: errors.map(e => e?.message).filter(Boolean)
      };

      setResults(investigation);

      console.log('🔍 Investigation complete:', investigation);

    } catch (error) {
      console.error('❌ Investigation failed:', error);
      setResults({
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-orange-500" />
          Database Detective: Find Real Salary Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Mission:</strong> Find the REAL source of Adéla's detailed salary progression data.
            No more mocks, drafts, or fake data - only live database content!
          </AlertDescription>
        </Alert>

        <Button
          onClick={investigateDatabase}
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? (
            <>
              <Database className="h-4 w-4 mr-2 animate-pulse" />
              Investigating Database...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Investigate Adéla's Data Sources
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            {results.error ? (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription>
                  <strong>Investigation Failed:</strong> {results.error}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Summary */}
                <Alert className="border-blue-500 bg-blue-50">
                  <Database className="h-4 w-4 text-blue-500" />
                  <AlertDescription>
                    <div><strong>Staff:</strong> {results.staff_name} ({results.staff_id})</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>📊 Salary History: <strong>{results.cao_salary_count}</strong></div>
                      <div>📄 Contracts: <strong>{results.contracts_count}</strong></div>
                      <div>🔍 Enriched: <strong>{results.contracts_enriched_count}</strong></div>
                      <div>📋 Employment: <strong>{results.employment_history_count}</strong></div>
                      <div>🔤 By Name: <strong>{results.contracts_by_name_count}</strong></div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Detailed Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Salary History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">💰 cao_salary_history</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {results.cao_salary_count > 0 ? (
                        <div className="space-y-2">
                          {results.cao_salary_data.map((record: any, i: number) => (
                            <div key={i} className="text-xs p-2 bg-green-50 rounded border">
                              <div><strong>€{record.gross_monthly}/mo</strong> (€{record.hourly_wage}/hr)</div>
                              <div>{record.valid_from} → {record.valid_to || 'current'}</div>
                              <div className="text-muted-foreground">Source: {record.data_source}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          🚫 No salary history records
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contracts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">📄 contracts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {results.contracts_count > 0 ? (
                        <div className="space-y-2">
                          {results.contracts_data.map((contract: any, i: number) => (
                            <div key={i} className="text-xs p-2 bg-blue-50 rounded border">
                              <div><strong>{contract.status}</strong> - {contract.contract_type}</div>
                              <div>{contract.employee_name}</div>
                              <div className="text-muted-foreground">Created: {new Date(contract.created_at).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          🚫 No contracts by staff_id
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contracts Enriched */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🔍 contracts_enriched</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {results.contracts_enriched_count > 0 ? (
                        <div className="space-y-2">
                          {results.contracts_enriched_data.map((contract: any, i: number) => (
                            <div key={i} className="text-xs p-2 bg-purple-50 rounded border">
                              <div><strong>{contract.full_name}</strong></div>
                              <div>{contract.start_date} → {contract.end_date || 'current'}</div>
                              <div>{contract.position} at {contract.location_key}</div>
                              <div className="text-muted-foreground">Manager: {contract.manager_key}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          🚫 No enriched contracts
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contracts by Name */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🔤 contracts (by name)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      {results.contracts_by_name_count > 0 ? (
                        <div className="space-y-2">
                          {results.contracts_by_name_data.map((contract: any, i: number) => (
                            <div key={i} className="text-xs p-2 bg-yellow-50 rounded border">
                              <div><strong>{contract.employee_name}</strong></div>
                              <div>{contract.status} - {contract.contract_type}</div>
                              <div className="text-muted-foreground">
                                Query Params: {JSON.stringify(contract.query_params || {}, null, 1).substring(0, 100)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          🚫 No contracts by name
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>

                {/* Errors */}
                {results.errors.length > 0 && (
                  <Alert className="border-red-500 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription>
                      <strong>Query Errors:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {results.errors.map((error: string, i: number) => (
                          <li key={i} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Conclusion */}
                <Alert className={`border-${results.has_real_salary_history ? 'green' : 'orange'}-500 bg-${results.has_real_salary_history ? 'green' : 'orange'}-50`}>
                  <Database className={`h-4 w-4 text-${results.has_real_salary_history ? 'green' : 'orange'}-500`} />
                  <AlertDescription>
                    <strong>CONCLUSION:</strong>
                    {results.has_real_salary_history ? (
                      <span className="text-green-700"> Real salary history found! The detailed progression is coming from the cao_salary_history table.</span>
                    ) : (
                      <span className="text-orange-700"> No real salary history found! The detailed progression must be coming from mock/calculated data.</span>
                    )}
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}