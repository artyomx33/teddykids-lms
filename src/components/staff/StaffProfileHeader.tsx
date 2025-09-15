import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarBadge } from "./ReviewChips";
import { MapPin, User, Calendar } from "lucide-react";

interface StaffProfileHeaderProps {
  staff: {
    full_name: string;
    role: string | null;
    location: string | null;
    email: string | null;
    is_intern: boolean;
    intern_year: number | null;
    status: string;
  };
  enrichedData?: {
    has_five_star_badge?: boolean | null;
    position?: string | null;
    manager_key?: string | null;
  } | null;
  firstContractDate?: string | null;
  documentStatus?: {
    missing_count: number;
    total_docs: number;
  } | null;
}

export function StaffProfileHeader({ 
  staff, 
  enrichedData, 
  firstContractDate,
  documentStatus 
}: StaffProfileHeaderProps) {
  const getBadges = () => {
    const badges = [];
    
    // Teddy Star badge
    if (enrichedData?.has_five_star_badge) {
      badges.push(
        <Badge key="star" variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          ⭐ Teddy Star
        </Badge>
      );
    }
    
    // Intern badge
    if (staff.is_intern && staff.intern_year) {
      badges.push(
        <Badge key="intern" variant="secondary">
          🎓 Intern Y{staff.intern_year}
        </Badge>
      );
    }
    
    // Docs complete badge
    if (documentStatus && documentStatus.missing_count === 0) {
      badges.push(
        <Badge key="docs" variant="default" className="bg-green-100 text-green-800 border-green-300">
          ✅ Docs Complete
        </Badge>
      );
    }
    
    // Active status
    if (staff.status === 'active') {
      badges.push(
        <Badge key="active" variant="outline">
          💼 Active
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Name and Star Badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{staff.full_name}</h1>
            <StarBadge show={enrichedData?.has_five_star_badge} />
          </div>
          
          {/* Role and Position */}
          <div className="flex flex-col gap-2">
            <div className="text-lg text-muted-foreground">
              {enrichedData?.position || staff.role || 'Staff Member'}
            </div>
            
            {/* Location and Manager */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {staff.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{staff.location}</span>
                </div>
              )}
              
              {enrichedData?.manager_key && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Manager: {enrichedData.manager_key}</span>
                </div>
              )}
              
              {firstContractDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Started: {new Date(firstContractDate).toLocaleDateString('nl-NL')}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {getBadges()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}