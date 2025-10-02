import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export function BirthdayWidget() {
  const { data: birthdayData = [] } = useQuery({
    queryKey: ["upcoming-birthdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched_v2")
        .select("employes_employee_id, full_name, birth_date")
        .not("birth_date", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { todayBirthdays, upcomingBirthdays } = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todayBirthdays = birthdayData.filter(person => {
      if (!person.birth_date) return false;
      const birthDate = new Date(person.birth_date);
      const birthStr = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
      return birthStr === todayStr;
    });

    const upcomingBirthdays = birthdayData.filter(person => {
      if (!person.birth_date) return false;
      const birthDate = new Date(person.birth_date);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      // If birthday already passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }
      
      return thisYearBirthday > today && thisYearBirthday <= nextWeek;
    }).sort((a, b) => {
      const aDate = new Date(a.birth_date!);
      const bDate = new Date(b.birth_date!);
      const aThisYear = new Date(today.getFullYear(), aDate.getMonth(), aDate.getDate());
      const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
      
      if (aThisYear < today) aThisYear.setFullYear(today.getFullYear() + 1);
      if (bThisYear < today) bThisYear.setFullYear(today.getFullYear() + 1);
      
      return aThisYear.getTime() - bThisYear.getTime();
    });

    return { todayBirthdays, upcomingBirthdays };
  }, [birthdayData]);

  const formatBirthday = (birthDate: string) => {
    const date = new Date(birthDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (todayBirthdays.length === 0 && upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cake className="h-4 w-4 text-pink-500" />
          Birthday Celebrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Birthdays */}
        {todayBirthdays.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                TODAY 🎉
              </Badge>
            </div>
            {todayBirthdays.map((person) => (
              <div
              key={person.employes_employee_id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200"
              >
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-pink-500" />
                  <span className="font-medium text-foreground">
                    {person.full_name}
                  </span>
                </div>
                <div className="text-xl">🎂</div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                This Week
              </span>
            </div>
            {upcomingBirthdays.slice(0, 3).map((person) => (
              <div
                key={person.employes_employee_id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Cake className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {person.full_name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatBirthday(person.birth_date!)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}