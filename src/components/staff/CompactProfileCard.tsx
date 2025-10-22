import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, MapPin, ChevronDown, ChevronRight, Mail, IdCard, CreditCard, Copy, Eye, EyeOff, Home } from "lucide-react";
import { EmployesPersonalData } from "@/lib/employesProfile";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CompactProfileCardProps {
  staffName: string;
  personalData: EmployesPersonalData | null;
}

// Helper functions
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const calculateDaysUntilBirthday = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getCountryFlag = (countryCode: string): string => {
  const flags: Record<string, string> = {
    'NL': '🇳🇱', 'CZ': '🇨🇿', 'DE': '🇩🇪', 'BE': '🇧🇪',
    'PL': '🇵🇱', 'RO': '🇷🇴', 'GB': '🇬🇧', 'US': '🇺🇸',
    'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹'
  };
  return flags[countryCode] || '🌍';
};

const getCountryName = (countryCode: string): string => {
  const countries: Record<string, string> = {
    'NL': 'Netherlands', 'CZ': 'Czech Republic', 'DE': 'Germany',
    'BE': 'Belgium', 'PL': 'Poland', 'RO': 'Romania',
    'GB': 'United Kingdom', 'US': 'United States',
    'FR': 'France', 'ES': 'Spain', 'IT': 'Italy'
  };
  return countries[countryCode] || countryCode;
};

const maskBSN = (bsn: string): string => {
  if (bsn.length <= 3) return bsn;
  return `••• ••• ${bsn.slice(-3)}`;
};

export function CompactProfileCard({ staffName, personalData }: CompactProfileCardProps) {
  const [showMore, setShowMore] = useState(false);
  const [showBSN, setShowBSN] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  // Calculate age and birthday
  // console.log('🎂 CompactProfileCard - Full personalData:', JSON.stringify(personalData, null, 2));
  // console.log('🎂 birthDate field:', personalData?.birthDate);
  // console.log('🎂 All date-related fields:', {
  //   birthDate: personalData?.birthDate,
  //   dateOfBirth: (personalData as any)?.dateOfBirth,
  //   birth_date: (personalData as any)?.birth_date,
  //   geboortedatum: (personalData as any)?.geboortedatum,
  // });

  const age = personalData?.birthDate ? calculateAge(personalData.birthDate) : null;
  const daysUntilBirthday = personalData?.birthDate ? calculateDaysUntilBirthday(personalData.birthDate) : null;

  // console.log('🎂 Calculated - age:', age, 'daysUntilBirthday:', daysUntilBirthday);
  // console.log('🎂 Will show countdown?', age !== null && daysUntilBirthday !== null && daysUntilBirthday <= 30);

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        
        {/* 🎂 Birthday / Age */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cake className="h-4 w-4 text-primary flex-shrink-0" />
            {age !== null ? (
              <span className="text-sm font-medium">{age} years old</span>
            ) : (
              <span className="text-sm text-muted-foreground">Birthday missing</span>
            )}
          </div>
          {age !== null && daysUntilBirthday !== null && (
            <>
              {daysUntilBirthday === 0 ? (
                <Badge variant="default" className="ml-6">
                  🎉 Birthday Today!
                </Badge>
              ) : daysUntilBirthday <= 30 ? (
                <div className="ml-6 text-xs font-medium text-primary">
                  🎂 Birthday in {daysUntilBirthday} {daysUntilBirthday === 1 ? 'day' : 'days'}
                </div>
              ) : (
                <div className="ml-6 text-xs text-muted-foreground">
                  Birthday in {daysUntilBirthday} days
                </div>
              )}
            </>
          )}
        </div>

        {/* 📍 City */}
        {personalData?.address?.city && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm">{personalData.address.city}</span>
          </div>
        )}

        {/* 🌍 Country/Nationality */}
        {personalData?.nationality && (
          <div className="flex items-center gap-2">
            <span className="text-sm ml-6">
              {getCountryFlag(personalData.nationality)} {getCountryName(personalData.nationality)}
            </span>
          </div>
        )}

        {/* 🔽 Show More (Collapsible) */}
        <Collapsible open={showMore} onOpenChange={setShowMore} className="pt-3 border-t">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
              <span className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                {showMore ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Show More
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            
            {/* Email */}
            {personalData?.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a 
                    href={`mailto:${personalData.email}`}
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {personalData.email}
                  </a>
                </div>
              </div>
            )}

            {/* Full Address */}
            {personalData?.address && (
              <div className="flex items-start gap-2">
                <Home className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <div className="text-xs">
                    <p>{personalData.address.street} {personalData.address.houseNumber}</p>
                    <p>{personalData.address.zipCode} {personalData.address.city}</p>
                  </div>
                </div>
              </div>
            )}

            {/* BSN */}
            {personalData?.personalId && (
              <div className="flex items-start gap-2">
                <IdCard className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">BSN</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">
                      {showBSN ? personalData.personalId : maskBSN(personalData.personalId)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBSN(!showBSN)}
                      className="h-5 px-1 text-xs"
                    >
                      {showBSN ? (
                        <><EyeOff className="h-3 w-3" /></>
                      ) : (
                        <><Eye className="h-3 w-3" /></>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* IBAN */}
            {personalData?.iban && (
              <div className="flex items-start gap-2">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{personalData.iban}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(personalData.iban!, 'IBAN')}
                      className="h-5 px-1 text-xs"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </Card>
  );
}
