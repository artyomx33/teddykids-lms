import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployesEmployee {
  id: string;
  first_name: string;
  surname: string;
  surname_prefix?: string;
  date_of_birth?: string;
  personal_identification_number?: string;
  status?: string;
  email?: string;
  afdeling?: string; // Department/location in employes.nl
}

export function EmployesDataFetcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployesEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployesEmployee[]>([]);
  const { toast } = useToast();

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
    try {
      // Call the edge function to fetch employees from employes.nl
      const { data, error } = await supabase.functions.invoke('employes-integration', {
        body: { action: 'fetch_employees' }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Error fetching data",
          description: "Failed to fetch employee data from employes.nl",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        console.error('API error:', data.error);
        toast({
          title: "API Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Extract employees from the response
      const employeesData = data.data?.data || [];
      console.log('Fetched employees:', employeesData.length);
      
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
                
                return (
                  <div key={emp.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{fullName}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            ID: <span className="font-mono bg-muted px-1 rounded">{emp.id}</span>
                          </p>
                          {emp.afdeling && (
                            <Badge variant="outline">
                              Afdeling: {emp.afdeling}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                        {emp.status || 'Unknown'}
                      </Badge>
                    </div>
                    
                    {emp.date_of_birth && (
                      <p className="text-sm">
                        <span className="font-medium">Birth Date:</span> {emp.date_of_birth}
                      </p>
                    )}
                    
                    {emp.personal_identification_number && (
                      <p className="text-sm">
                        <span className="font-medium">BSN:</span> {emp.personal_identification_number}
                      </p>
                    )}
                    
                    {emp.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {emp.email}
                      </p>
                    )}
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