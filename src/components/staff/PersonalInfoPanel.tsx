import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, CreditCard, MapPin, Phone, Calendar, Flag, IdCard } from "lucide-react";
import { EmployesPersonalData } from "@/lib/employesProfile";

interface PersonalInfoPanelProps {
  personalData: EmployesPersonalData | null;
}

export function PersonalInfoPanel({ personalData }: PersonalInfoPanelProps) {
  if (!personalData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email */}
        {personalData.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{personalData.email}</p>
            </div>
          </div>
        )}

        {/* Phone */}
        {personalData.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{personalData.phone}</p>
            </div>
          </div>
        )}

        {/* Mobile */}
        {personalData.mobile && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Mobile</p>
              <p className="text-sm text-muted-foreground">{personalData.mobile}</p>
            </div>
          </div>
        )}

        {/* Birth Date */}
        {personalData.birthDate && (
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Birth Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(personalData.birthDate).toLocaleDateString('nl-NL')}
              </p>
            </div>
          </div>
        )}

        {/* Nationality */}
        {personalData.nationality && (
          <div className="flex items-center gap-3">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Nationality</p>
              <p className="text-sm text-muted-foreground">{personalData.nationality}</p>
            </div>
          </div>
        )}

        {/* Gender */}
        {personalData.gender && (
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-sm text-muted-foreground">
                {personalData.gender === 'M' ? 'Male' : personalData.gender === 'F' ? 'Female' : personalData.gender}
              </p>
            </div>
          </div>
        )}

        {/* BSN (Personal ID) */}
        {personalData.personalId && (
          <div className="flex items-center gap-3">
            <IdCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">BSN</p>
              <p className="text-sm text-muted-foreground font-mono">{personalData.personalId}</p>
            </div>
          </div>
        )}

        {/* IBAN */}
        {personalData.iban && (
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">IBAN</p>
              <p className="text-sm text-muted-foreground font-mono">{personalData.iban}</p>
            </div>
          </div>
        )}

        {/* Address */}
        {personalData.address && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Address</p>
              <div className="text-sm text-muted-foreground">
                <p>{personalData.address.street} {personalData.address.houseNumber}</p>
                <p>{personalData.address.zipCode} {personalData.address.city}</p>
                {personalData.address.country && personalData.address.country !== 'NL' && (
                  <p>{personalData.address.country}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Source indicator */}
        <div className="text-xs text-muted-foreground text-right">
          Source: Employes.nl
        </div>
      </CardContent>
    </Card>
  );
}