import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarBadge } from "./ReviewChips";
import { MapPin, User, Calendar, Mail, Phone, Cake, Lock, IdCard, CreditCard, Copy, Eye, EyeOff, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { EmployesPersonalData } from "@/lib/employesProfile";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface UnifiedProfileCardProps {
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

export function UnifiedProfileCard({ 
  staff, 
  enrichedData, 
  firstContractDate,
  documentStatus,
  personalData
}: UnifiedProfileCardProps) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [showBSN, setShowBSN] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getBadges = () => {
    const badges = [];
    
    if (enrichedData?.has_five_star_badge) {
      badges.push(
        <Badge key="star" variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          ⭐ Teddy Star
        </Badge>
      );
    }
    
    if (staff.is_intern && staff.intern_year) {
      badges.push(
        <Badge key="intern" variant="secondary">
          🎓 Intern Y{staff.intern_year}
        </Badge>
      );
    }
    
    if (documentStatus && documentStatus.missing_count === 0) {
      badges.push(
        <Badge key="docs" variant="default" className="bg-green-100 text-green-800 border-green-300">
          ✅ Docs Complete
        </Badge>
      );
    }
    
    if (staff.status === 'active') {
      badges.push(
        <Badge key="active" variant="outline">
          💼 Active
        </Badge>
      );
    }
    
    return badges;
  };

  // Calculate age and birthday
  console.log('🎂 UnifiedProfileCard - personalData:', personalData);
  console.log('🎂 birthDate:', personalData?.birthDate);
  
  const age = personalData?.birthDate ? calculateAge(personalData.birthDate) : null;
  const daysUntilBirthday = personalData?.birthDate ? calculateDaysUntilBirthday(personalData.birthDate) : null;
  
  console.log('🎂 Calculated age:', age);
  console.log('🎂 Days until birthday:', daysUntilBirthday);

  // Format gender
  const genderDisplay = personalData?.gender === 'M' ? 'Male' : 
                        personalData?.gender === 'F' ? 'Female' : 
                        personalData?.gender?.toLowerCase() === 'male' ? 'Male' :
                        personalData?.gender?.toLowerCase() === 'female' ? 'Female' :
                        personalData?.gender;

  // Get location summary
  const locationSummary = personalData?.address 
    ? `${personalData.address.city}${personalData.address.country ? `, ${getCountryName(personalData.address.country)}` : ''}`
    : null;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        
        {/* 🎨 HEADER: Name, Title, Star, Badges */}
        <div className="flex flex-col gap-4 pb-6 border-b">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{staff.full_name}</h1>
            <StarBadge show={enrichedData?.has_five_star_badge} />
          </div>
          
          <div className="text-lg text-muted-foreground">
            {enrichedData?.position || staff.role || 'Staff Member'}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {getBadges()}
          </div>
        </div>

        {/* 🎨 PERSONAL INFO: Compact 2-column grid */}
        {personalData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            
            {/* Age & Birthday */}
            {age !== null && daysUntilBirthday !== null && (
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-pink-500 flex-shrink-0" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{age} years</span>
                  {daysUntilBirthday === 0 ? (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs h-5">
                      🎉 Birthday!
                    </Badge>
                  ) : daysUntilBirthday <= 7 ? (
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200 text-xs h-5">
                      🎂 {daysUntilBirthday}d
                    </Badge>
                  ) : daysUntilBirthday <= 30 ? (
                    <span className="text-xs text-muted-foreground">
                      Birthday in {daysUntilBirthday}d
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* Email */}
            {personalData.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <a 
                  href={`mailto:${personalData.email}`}
                  className="text-sm text-primary hover:underline truncate"
                >
                  {personalData.email}
                </a>
              </div>
            )}

            {/* Location */}
            {locationSummary && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{locationSummary}</span>
              </div>
            )}

            {/* Gender & Nationality */}
            {(genderDisplay || personalData.nationality) && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-1.5 text-sm">
                  {genderDisplay && <span>{genderDisplay}</span>}
                  {genderDisplay && personalData.nationality && (
                    <span className="text-muted-foreground">•</span>
                  )}
                  {personalData.nationality && (
                    <span className="flex items-center gap-1">
                      {getCountryFlag(personalData.nationality)}
                      <span>{getCountryName(personalData.nationality)}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Phone */}
            {personalData.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{personalData.phone}</span>
              </div>
            )}

            {/* Mobile */}
            {personalData.mobile && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{personalData.mobile}</span>
              </div>
            )}

            {/* Birth Date */}
            {personalData.birthDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {new Date(personalData.birthDate).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}

            {/* Manager */}
            {enrichedData?.manager_key && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">Manager: {enrichedData.manager_key}</span>
              </div>
            )}

            {/* Start Date */}
            {firstContractDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">Started: {new Date(firstContractDate).toLocaleDateString('nl-NL')}</span>
              </div>
            )}

            {/* Full Address */}
            {personalData.address && (
              <div className="flex items-start gap-2 md:col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  {personalData.address.street} {personalData.address.houseNumber}, {personalData.address.zipCode} {personalData.address.city}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 🎨 SENSITIVE INFORMATION - Compact Collapsible */}
        {personalData && (personalData.personalId || personalData.iban) && (
          <Collapsible open={showSensitive} onOpenChange={setShowSensitive} className="pt-3 border-t">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                <span className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  {showSensitive ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <Lock className="h-3 w-3 text-amber-500" />
                  Sensitive Information
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Authorized personnel only</span>
                </div>

                {/* BSN */}
                {personalData.personalId && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">BSN:</span>
                      <span className="font-mono text-xs">
                        {showBSN ? personalData.personalId : maskBSN(personalData.personalId)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBSN(!showBSN)}
                      className="h-6 px-2 text-xs"
                    >
                      {showBSN ? (
                        <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                      ) : (
                        <><Eye className="h-3 w-3 mr-1" /> Show</>
                      )}
                    </Button>
                  </div>
                )}

                {/* IBAN */}
                {personalData.iban && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">IBAN:</span>
                      <span className="font-mono text-xs">{personalData.iban}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(personalData.iban!, 'IBAN')}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Source indicator */}
        {personalData && (
          <div className="text-xs text-muted-foreground text-right pt-2 border-t">
            Source: Employes.nl
          </div>
        )}
      </CardContent>
    </Card>
  );
}
