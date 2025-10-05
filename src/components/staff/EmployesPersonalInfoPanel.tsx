import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Globe, MapPin, CreditCard, FileText } from "lucide-react";
import { EmployesPersonalData } from "@/lib/employesProfile";

interface EmployesPersonalInfoPanelProps {
  personal: EmployesPersonalData | null;
  isIntern?: boolean;
}

export function EmployesPersonalInfoPanel({ personal, isIntern }: EmployesPersonalInfoPanelProps) {
  if (!personal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No Employes.nl data available</p>
            <p className="text-xs mt-1">Data will appear after successful sync</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2 border-b last:border-0">
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-sm font-medium break-words">{value}</div>
        </div>
      </div>
    );
  };

  const fullName = [personal.firstName, personal.middleName, personal.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          {isIntern && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              🎓 Intern
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={fullName} />
        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={personal.email} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={personal.phone} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label="Mobile" value={personal.mobile} />
        <InfoRow 
          icon={<Calendar className="h-4 w-4" />} 
          label="Birth Date" 
          value={personal.birthDate ? new Date(personal.birthDate).toLocaleDateString('nl-NL') : undefined} 
        />
        <InfoRow icon={<Globe className="h-4 w-4" />} label="Nationality" value={personal.nationality} />
        <InfoRow icon={<User className="h-4 w-4" />} label="Gender" value={personal.gender} />
        <InfoRow icon={<FileText className="h-4 w-4" />} label="BSN" value={personal.personalId} />
        <InfoRow icon={<CreditCard className="h-4 w-4" />} label="IBAN" value={personal.iban} />
        
        {personal.address && (
          <div className="flex items-start gap-3 py-2">
            <div className="text-muted-foreground mt-0.5">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="text-sm font-medium">
                {personal.address.street} {personal.address.houseNumber}
              </div>
              <div className="text-sm text-muted-foreground">
                {personal.address.zipCode} {personal.address.city}
              </div>
              <div className="text-sm text-muted-foreground">
                {personal.address.country}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
