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
  const [filteredEmployees, setFilteredEmployees] = useState<EmployesEmployee[]>([]);
  const { toast } = useToast();

  // Auto-refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchEmployeesData();
    }
  }, [refreshTrigger]);

  // The staff members we're looking for based on the screenshot
  const targetStaff = [
    "Adéla Jarošová",
    "Alena Masselink", 
    "Anastasia Christofori",
    "Anna ten Dolle",
    "Anna Cumbo"
  ];

  const fetchEmployeesData = async () => {
    setIsLoading(true);
    
    // Clear any previous error state
    setEmployees([]);
    setFilteredEmployees([]);
    
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
          title: "Edge Function Error",
          description: `Supabase function error: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        console.error('API error:', data.error);
        toast({
          title: "API Error", 
          description: `Employes API error: ${data.error}`,
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

      // Filter for the specific employees we're looking for
      const filtered = employeesData.filter((emp: EmployesEmployee) => {
        const fullName = `${emp.first_name} ${emp.surname_prefix ? emp.surname_prefix + ' ' : ''}${emp.surname}`;
        return targetStaff.some(target => 
          fullName.toLowerCase().includes(target.toLowerCase()) ||
          target.toLowerCase().includes(fullName.toLowerCase())
        );
      });

      setFilteredEmployees(filtered);

      // Update parent component with all employee data
      if (onEmployeeDataUpdate) {
        onEmployeeDataUpdate(employeesData);
      }

      toast({
        title: "Data fetched successfully",
        description: `Found ${filtered.length} matching employees out of ${employeesData.length} total`,
      });

    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Network Error",
        description: "Failed to connect to employes integration",
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
            <Users className="h-5 w-5" />
            Employes.nl Data Fetcher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Fetch employee data from employes.nl to find IDs and match with hours data.
            </p>
            
            <Button 
              onClick={fetchEmployeesData}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching from employes.nl...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Fetch Employee Data
                </>
              )}
            </Button>
          </div>

          {filteredEmployees.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Target Employees Found ({filteredEmployees.length})</h3>
              <p className="text-xs text-muted-foreground">
                These employees show their employes.nl ID and "afdeling" (department/location assignment)
              </p>
              
              {filteredEmployees.map((emp) => {
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
          )}

          {employees.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p>Total employees in employes.nl: {employees.length}</p>
              <p>Matching target employees: {filteredEmployees.length}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}