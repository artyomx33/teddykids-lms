import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Home, 
  CreditCard, 
  Calendar,
  Globe,
  User
} from "lucide-react";
import { EmployesPersonalData } from "@/lib/employesProfile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PersonalDataSectionProps {
  personalData: EmployesPersonalData | null;
}

export function PersonalDataSection({ personalData }: PersonalDataSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!personalData) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('nl-NL');
  };

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value 
  }: { 
    icon: any; 
    label: string; 
    value?: string | null;
  }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <span className="text-xs text-muted-foreground block">{label}</span>
          <span className="text-sm font-medium">{value}</span>
        </div>
      </div>
    );
  };

  const hasData = personalData.email || 
                  personalData.phone || 
                  personalData.mobile ||
                  personalData.birthDate ||
                  personalData.nationality ||
                  personalData.personalId ||
                  personalData.iban ||
                  personalData.address;

  if (!hasData) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border-t pt-4">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between hover:bg-muted/50"
          >
            <span className="text-sm font-medium">Personal Information</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="pt-4 space-y-1">
            {/* Contact Information */}
            <InfoRow 
              icon={Mail} 
              label="Email" 
              value={personalData.email} 
            />
            <InfoRow 
              icon={Phone} 
              label="Phone" 
              value={personalData.phone} 
            />
            <InfoRow 
              icon={Phone} 
              label="Mobile" 
              value={personalData.mobile} 
            />

            {/* Personal Details */}
            <InfoRow 
              icon={Calendar} 
              label="Birth Date" 
              value={formatDate(personalData.birthDate)} 
            />
            <InfoRow 
              icon={Globe} 
              label="Nationality" 
              value={personalData.nationality} 
            />
            <InfoRow 
              icon={User} 
              label="Gender" 
              value={personalData.gender} 
            />

            {/* Financial Information */}
            <InfoRow 
              icon={CreditCard} 
              label="BSN (Personal ID)" 
              value={personalData.personalId} 
            />
            <InfoRow 
              icon={CreditCard} 
              label="IBAN" 
              value={personalData.iban} 
            />

            {/* Address */}
            {personalData.address && (
              <div className="flex items-start gap-3 py-2">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground block">Address</span>
                  <div className="text-sm font-medium">
                    <div>{personalData.address.street} {personalData.address.houseNumber}</div>
                    <div>{personalData.address.zipCode} {personalData.address.city}</div>
                    <div>{personalData.address.country}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Source Badge */}
            <div className="pt-2 flex justify-end">
              <Badge variant="outline" className="text-xs">
                Source: Employes.nl
              </Badge>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
