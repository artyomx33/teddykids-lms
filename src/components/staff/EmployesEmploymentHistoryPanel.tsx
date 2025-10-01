import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, Clock, AlertCircle } from "lucide-react";
import { EmployesEmploymentData } from "@/lib/employesProfile";

interface EmployesEmploymentHistoryPanelProps {
  employments: EmployesEmploymentData[];
}

export function EmployesEmploymentHistoryPanel({ employments }: EmployesEmploymentHistoryPanelProps) {
  if (employments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No employment history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in service':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'out of service':
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pending exit':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Employment History
          <Badge variant="secondary">{employments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {employments.map((employment, index) => (
          <div key={employment.employmentId || index} className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getStatusColor(employment.status)}>
                    {employment.status}
                  </Badge>
                  {employment.employmentType && (
                    <Badge variant="outline">
                      {employment.employmentType}
                    </Badge>
                  )}
                  {employment.isPartTime && (
                    <Badge variant="secondary">
                      Part-time
                      {employment.partTimeFactor && ` (${Math.round(employment.partTimeFactor * 100)}%)`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(employment.startDate).toLocaleDateString('nl-NL')}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className={employment.endDate ? '' : 'text-green-600 font-medium'}>
                {employment.endDate 
                  ? new Date(employment.endDate).toLocaleDateString('nl-NL')
                  : 'Present'
                }
              </span>
            </div>

            {/* Working Days */}
            {employment.workingDays && employment.workingDays.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Working days:</span>
                <div className="flex gap-1">
                  {employment.workingDays.map((day) => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Company Access */}
            {employment.hasCompanyAccess && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                <span className="font-medium">Has company access</span>
              </div>
            )}

            {/* Out of Service Info */}
            {employment.outOfServiceCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">Out of Service</div>
                  {employment.outOfServiceReason && (
                    <div className="text-yellow-700">{employment.outOfServiceReason}</div>
                  )}
                  <div className="text-xs text-yellow-600 mt-1">Code: {employment.outOfServiceCode}</div>
                </div>
              </div>
            )}

            {/* Pending Exit */}
            {employment.pendingExitDate && (
              <div className="bg-orange-50 border border-orange-200 rounded p-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-orange-800">Pending Exit</div>
                  <div className="text-orange-700">
                    Exit date: {new Date(employment.pendingExitDate).toLocaleDateString('nl-NL')}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
