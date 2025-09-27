import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Mail, 
  Clock, 
  DollarSign, 
  MapPin, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { EmployeeMatch } from '@/lib/employeesSync';
import { toast } from 'sonner';

interface EmployeeMatchCardProps {
  match: EmployeeMatch;
  onSync: (match: EmployeeMatch) => Promise<void>;
  isLoading?: boolean;
}

export const EmployeeMatchCard: React.FC<EmployeeMatchCardProps> = ({
  match,
  onSync,
  isLoading = false
}) => {
  const { employes: employee, lms: staff, matchType, confidence, syncRequired, conflicts } = match;

  const handleSync = async () => {
    try {
      await onSync(match);
    } catch (error) {
      toast.error('Failed to sync employee');
    }
  };

  const getMatchBadgeColor = () => {
    if (matchType === 'exact') return 'default';
    if (matchType === 'similar') return 'secondary';
    return 'destructive';
  };

  const getMatchIcon = () => {
    if (matchType === 'exact') return <CheckCircle className="h-4 w-4" />;
    if (matchType === 'similar') return <Users className="h-4 w-4" />;
    return <UserPlus className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {getMatchIcon()}
            <h3 className="text-lg font-semibold">
              {employee.first_name} {employee.surname || ''}
            </h3>
            <Badge variant={getMatchBadgeColor()}>
              {matchType === 'new' ? 'New Employee' : `${confidence}% Match`}
            </Badge>
          </div>
          
          {syncRequired && (
            <Button
              onClick={handleSync}
              disabled={isLoading}
              size="sm"
              variant={staff ? "outline" : "default"}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : staff ? (
                <RefreshCw className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {staff ? 'Update' : 'Add to LMS'}
            </Button>
          )}
        </div>

        {/* Conflicts Warning */}
        {conflicts && conflicts.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Data Conflicts Detected
              </span>
            </div>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              {conflicts.map((conflict, index) => (
                <li key={index}>• {conflict}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employes Data */}
          <div>
            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
              Employes.nl Data
            </h4>
            <div className="space-y-2 text-sm">
              {employee.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.email}</span>
                </div>
              )}
              
              {employee.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone_number}</span>
                </div>
              )}

              {employee.employee_number && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{employee.employee_number}
                  </Badge>
                </div>
              )}

              {employee.employment?.start_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Started: {new Date(employee.employment.start_date).toLocaleDateString()}</span>
                </div>
              )}

              {employee.employment?.contract?.hours_per_week && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.employment.contract.hours_per_week}h/week</span>
                </div>
              )}

              {employee.employment?.salary?.hour_wage && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>€{employee.employment.salary.hour_wage}/hour</span>
                </div>
              )}

              {(employee.zipcode || employee.city) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.zipcode} {employee.city}</span>
                </div>
              )}

              <Badge 
                variant={employee.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {employee.status}
              </Badge>
            </div>
          </div>

          {/* LMS Data */}
          <div>
            <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
              {staff ? 'LMS Data' : 'Will be added to LMS'}
            </h4>
            {staff ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.full_name}</span>
                </div>
                
                {staff.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.email}</span>
                  </div>
                )}
                
                {staff.role && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {staff.role}
                    </Badge>
                  </div>
                )}
                
                {staff.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.location}</span>
                  </div>
                )}

                {staff.last_sync_at && (
                  <div className="text-xs text-muted-foreground">
                    Last synced: {new Date(staff.last_sync_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>New employee will be added to LMS with:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Full contact information</li>
                  <li>• Employment details</li>
                  <li>• Salary information</li>
                  <li>• Contract terms</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {!syncRequired && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Employee data is up to date
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};