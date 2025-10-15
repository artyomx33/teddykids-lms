import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

type BirthdayEntry = {
  staff_id: string;
  full_name: string;
  birth_date: string | null;
};

export function BirthdayWidget() {
  const { data: birthdayData = [] } = useQuery<BirthdayEntry[]>({
    queryKey: ["upcoming-birthdays"],
    retry: false,
    queryFn: async () => {
      console.log('BirthdayWidget: Fetching real staff birthday data');

      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, birth_date')
        .not('birth_date', 'is', null);

      if (error) {
        console.error('BirthdayWidget: Error fetching birthdays:', error);
        return [];
      }

      return data?.map(staff => ({
        staff_id: staff.id,
        full_name: staff.full_name,
        birth_date: staff.birth_date
      })) || [];
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

  // Always show the widget, even if no birthdays

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cake className="h-4 w-4 text-pink-500" />
          Birthday Celebrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show message when no birthdays */}
        {todayBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Cake className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No birthdays coming up this week</p>
            <p className="text-xs">Time to plan some celebrations! 🎉</p>
          </div>
        )}
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
                key={person.staff_id || person.full_name}
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
            {upcomingBirthdays.slice(0, 3).map((person, index) => (
              <div
                key={person.staff_id || `${person.full_name}-${index}`}
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