import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  MapPin, 
  Building2, 
  Calendar, 
  Euro,
  Clock,
  Phone,
  Mail,
  Globe,
  FileText,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface EmployeeDataExpansionProps {
  employees: any[];
  onExpandDataFetch: () => void;
  isLoading?: boolean;
}

export const EmployeeDataExpansion = ({ 
  employees, 
  onExpandDataFetch, 
  isLoading = false 
}: EmployeeDataExpansionProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // Calculate data completeness metrics
  const getDataCompleteness = (employee: any) => {
    const fields = [
      'email', 'phone', 'birth_date', 'nationality', 
      'street', 'city', 'zipcode', 'start_date', 
      'department', 'position', 'salary', 'hours_per_week'
    ];
    
    const filledFields = fields.filter(field => employee[field]);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const averageCompleteness = employees.length > 0 
    ? Math.round(employees.reduce((sum, emp) => sum + getDataCompleteness(emp), 0) / employees.length)
    : 0;

  const incompleteEmployees = employees.filter(emp => getDataCompleteness(emp) < 80);

  return (
    <div className="space-y-6">
      {/* Data Expansion Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Employee Data Expansion
          </CardTitle>
          <CardDescription>
            Enhance employee profiles with comprehensive Employes.nl data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Data Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
              <div className="text-sm text-blue-700">Total Employees</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{averageCompleteness}%</div>
              <div className="text-sm text-green-700">Avg Data Completeness</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{incompleteEmployees.length}</div>
              <div className="text-sm text-orange-700">Need Data Enhancement</div>
            </div>
          </div>

          {/* Expansion Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={onExpandDataFetch}
              disabled={isLoading}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              {isLoading ? 'Expanding Data...' : 'Expand Employee Data'}
            </Button>
          </div>

          {/* Available Data Fields */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Available Data Fields from Employes.nl:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                { icon: User, label: 'Personal Info', fields: ['Name', 'Birth Date', 'Nationality', 'Gender'] },
                { icon: MapPin, label: 'Address', fields: ['Street', 'House Number', 'City', 'Postal Code'] },
                { icon: Phone, label: 'Contact', fields: ['Phone', 'Mobile', 'Email'] },
                { icon: Building2, label: 'Employment', fields: ['Department', 'Position', 'Location', 'Manager'] },
                { icon: Calendar, label: 'Dates', fields: ['Start Date', 'End Date', 'Contract Type'] },
                { icon: Euro, label: 'Compensation', fields: ['Salary', 'Hourly Rate', 'Scale', 'Trede'] },
                { icon: Clock, label: 'Hours', fields: ['Hours/Week', 'Schedule', 'Overtime'] },
                { icon: FileText, label: 'Contracts', fields: ['Type', 'Duration', 'Terms', 'Status'] }
              ].map((category, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <category.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{category.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {category.fields.map((field, idx) => (
                      <div key={idx}>• {field}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Data Preview */}
      <Tabs defaultValue="incomplete" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incomplete">Incomplete Profiles ({incompleteEmployees.length})</TabsTrigger>
          <TabsTrigger value="complete">Complete Profiles</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="incomplete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employees Needing Data Enhancement</CardTitle>
              <CardDescription>
                These profiles have less than 80% data completeness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-auto">
                {incompleteEmployees.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {employee.first_name?.[0]}{employee.surname?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {employee.first_name} {employee.surname}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {employee.id} • {employee.department || 'No Department'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{getDataCompleteness(employee)}%</div>
                        <Progress 
                          value={getDataCompleteness(employee)} 
                          className="w-16 h-2" 
                        />
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Employee Profiles</CardTitle>
              <CardDescription>
                These profiles have comprehensive data (80%+ complete)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-auto">
                {employees.filter(emp => getDataCompleteness(emp) >= 80).map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {employee.first_name} {employee.surname}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.position || employee.department} • {employee.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {getDataCompleteness(employee)}% Complete
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedEmployee && (
            <Card>
              <CardHeader>
                <CardTitle>Employee Data Preview</CardTitle>
                <CardDescription>
                  {selectedEmployee.first_name} {selectedEmployee.surname} - Available Data Fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="space-y-1 text-sm">
                      <div>Name: {selectedEmployee.first_name} {selectedEmployee.surname}</div>
                      <div>Email: {selectedEmployee.email || 'Not available'}</div>
                      <div>Phone: {selectedEmployee.phone || 'Not available'}</div>
                      <div>Birth Date: {selectedEmployee.birth_date || 'Not available'}</div>
                      <div>Nationality: {selectedEmployee.nationality || 'Not available'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Employment Information</h4>
                    <div className="space-y-1 text-sm">
                      <div>Department: {selectedEmployee.department || 'Not available'}</div>
                      <div>Position: {selectedEmployee.position || 'Not available'}</div>
                      <div>Start Date: {selectedEmployee.start_date || 'Not available'}</div>
                      <div>Status: {selectedEmployee.status || 'Not available'}</div>
                      <div>Hours/Week: {selectedEmployee.hours_per_week || 'Not available'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};