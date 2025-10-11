import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Briefcase, Clock, FileText } from 'lucide-react';
import { format, parseISO, differenceInDays, isValid } from 'date-fns';

interface ContractDetailsSectionProps {
  contract: any;
}

export function ContractDetailsSection({ contract }: ContractDetailsSectionProps) {
  const queryParams = contract.query_params || {};
  
  // Extract data
  const startDate = queryParams.startDate || contract.start_date;
  const endDate = queryParams.endDate || contract.end_date;
  const position = queryParams.functionTitle || queryParams.position || contract.position;
  const location = queryParams.cityOfEmployment || contract.location;
  const hoursPerWeek = queryParams.hoursPerWeek;
  const daysPerWeek = queryParams.daysPerWeek;
  const contractType = contract.contract_type || queryParams.contractType || 'Bepaalde tijd';
  
  // Calculate days remaining
  const daysRemaining = endDate ? differenceInDays(parseISO(endDate), new Date()) : null;
  
  // Format dates
  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, 'dd MMM yyyy') : dateStr;
    } catch {
      return dateStr;
    }
  };
  
  // Status badge
  const getStatusBadge = () => {
    if (contract.status === 'active') {
      if (daysRemaining !== null && daysRemaining <= 30) {
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Expiring Soon</Badge>;
      }
      return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    }
    if (contract.status === 'signed') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Signed</Badge>;
    }
    if (contract.status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    }
    if (contract.status === 'draft') {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Draft</Badge>;
    }
    return <Badge variant="outline">{contract.status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>📋 Contract Details</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Period */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Contract Periode</span>
          </div>
          <div className="ml-6">
            <p className="font-medium">
              {startDate && formatDate(startDate)} → {endDate ? formatDate(endDate) : 'Onbepaalde tijd'}
            </p>
            {daysRemaining !== null && daysRemaining > 0 && (
              <p className="text-sm text-muted-foreground">
                {daysRemaining} days remaining
              </p>
            )}
            {daysRemaining !== null && daysRemaining <= 0 && (
              <p className="text-sm text-destructive">
                Contract expired
              </p>
            )}
          </div>
        </div>

        {/* Working Hours */}
        {hoursPerWeek && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Working Hours</span>
            </div>
            <div className="ml-6">
              <p className="font-medium">
                {hoursPerWeek} hours/week
                {daysPerWeek && ` (${daysPerWeek} days)`}
              </p>
            </div>
          </div>
        )}

        {/* Position */}
        {position && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="font-medium">Position</span>
            </div>
            <div className="ml-6">
              <p className="font-medium">{position}</p>
            </div>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Location</span>
            </div>
            <div className="ml-6">
              <p className="font-medium">{location}</p>
            </div>
          </div>
        )}

        {/* Contract Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Contract Type</span>
          </div>
          <div className="ml-6">
            <p className="font-medium">{contractType}</p>
          </div>
        </div>

        {/* Created/Signed Date */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          {contract.signed_at && (
            <p>Signed: {formatDate(contract.signed_at)}</p>
          )}
          {contract.created_at && (
            <p>Created: {formatDate(contract.created_at)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


