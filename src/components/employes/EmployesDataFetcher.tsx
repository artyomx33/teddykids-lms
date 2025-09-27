import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployesEmployee {
  // Basic info
  id: string;
  first_name: string;
  surname: string;
  surname_prefix?: string;
  date_of_birth?: string;
  personal_identification_number?: string;
  status?: string;
  email?: string;
  
  // Department/location fields
  afdeling?: string;
  department?: string;
  location?: string;
  department_id?: string;
  location_id?: string;
  
  // Employment info
  employee_number?: string;
  position?: string;
  role?: string;
  job_title?: string;
  start_date?: string;
  end_date?: string;
  contract_type?: string;
  employment_type?: string;
  hours_per_week?: number;
  
  // Contact
  phone?: string;
  mobile?: string;
  
  // Address
  street?: string;
  housenumber?: string;
  zipcode?: string;
  city?: string;
  country_code?: string;
  
  // Additional fields
  [key: string]: any;
}

interface EmployesDataFetcherProps {
  refreshTrigger?: number;
  onEmployeeDataUpdate?: (data: EmployesEmployee[]) => void;
}

export function EmployesDataFetcher({ refreshTrigger, onEmployeeDataUpdate }: EmployesDataFetcherProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployesEmployee[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Auto-refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchEmployeesData();
    }
  }, [refreshTrigger]);

  const fetchEmployeesData = async () => {
    setIsLoading(true);
    
    // Clear any previous error state
    setEmployees([]);
    
    try {
      console.log('🚀 Calling edge function with fetch_employees action...');
      
      // Call the edge function to fetch employees from employes.nl
      const { data, error } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'fetch_employees' }
      });

      console.log('📨 Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Connection Error",
          description: `Failed to connect to Employes.nl: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        console.error('API error:', data.error);
        toast({
          title: "API Error", 
          description: `Employes.nl API error: ${data.error}`,
          variant: "destructive",
        });
        return;
      }

      // Extract employees from the response
      const employeesData = data?.data?.data || data?.data || [];
      console.log('Fetched employee data:', employeesData);
      console.log('Employee data type:', typeof employeesData);
      console.log('Employee data length:', employeesData.length);
      
      setEmployees(employeesData);
      setLastFetchTime(new Date());

      // Update parent component with all employee data
      if (onEmployeeDataUpdate) {
        onEmployeeDataUpdate(employeesData);
      }

      toast({
        title: "✅ Production Data Fetched",
        description: `Successfully loaded ${employeesData.length} employees from Employes.nl`,
      });

    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Network Error",
        description: "Failed to connect to Employes.nl integration service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Production Employee Data
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Connect to Employes.nl and fetch all employee records
            </div>
            {lastFetchTime && (
              <div className="text-xs text-muted-foreground">
                Last updated: {lastFetchTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                🚀 Production Mode Active
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                This will fetch ALL employees from your Employes.nl system - no testing filters applied.
              </p>
            </div>
            
            <Button 
              onClick={fetchEmployeesData}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Connecting to Employes.nl...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Fetch All Employee Data
                </>
              )}
            </Button>
          </div>

          {employees.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">All Employees ({employees.length})</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✅ Production Data
                </Badge>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {employees.map((emp) => {
                  const fullName = `${emp.first_name} ${emp.surname_prefix ? emp.surname_prefix + ' ' : ''}${emp.surname}`;
                  
                  // Get all non-standard fields (excluding basic name components)
                  const excludeFields = ['first_name', 'surname', 'surname_prefix'];
                  const allFields = Object.entries(emp).filter(([key, value]) => 
                    !excludeFields.includes(key) && value !== null && value !== undefined && value !== ''
                  );
                  
                  return (
                    <div key={emp.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-lg">{fullName}</h4>
                          <p className="text-sm text-muted-foreground">
                            ID: <span className="font-mono bg-muted px-1 rounded">{emp.id}</span>
                          </p>
                        </div>
                        <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                          {emp.status || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-primary">All Available Fields:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {allFields.map(([key, value]) => (
                            <div key={key} className="flex justify-between items-start p-2 bg-muted/30 rounded">
                              <span className="font-medium text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-right max-w-[200px] break-words">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {employees.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-primary">Production Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Employees:</span>
                  <span className="ml-2 font-semibold">{employees.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Data Source:</span>
                  <span className="ml-2 font-semibold">Employes.nl</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-semibold text-green-600">Ready for Sync</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="ml-2 font-semibold text-blue-600">Production</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}