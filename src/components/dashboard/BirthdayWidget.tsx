import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift, Sparkles } from "lucide-react";
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
      console.log('BirthdayWidget: Fetching real birthday data from staff_legacy');

      const { data, error } = await supabase
        .from('staff_legacy')
        .select('id, full_name, birth_date')
        .not('birth_date', 'is', null)
        .gt('birth_date', '1900-01-01') // Filter out invalid dates like 0001-01-01
        .order('birth_date');

      if (error) {
        console.error('BirthdayWidget: Error fetching birthday data:', error);
        return [];
      }

      return data.map(person => ({
        staff_id: person.id,
        full_name: person.full_name,
        birth_date: person.birth_date
      }));
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
    <Card className="bg-card-labs-glass shadow-card-labs border-labs hover:shadow-card-labs-intense transition-theme">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-foreground-labs">
          <Cake className="h-4 w-4 text-pink-500" />
          🎂 Birthday Celebrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Birthdays - Enhanced with Labs theme */}
        {todayBirthdays.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse">
                TODAY 🎉
              </Badge>
            </div>
            {todayBirthdays.map((person) => (
              <div
                key={person.staff_id || person.full_name}
                className="relative overflow-hidden p-4 bg-gradient-to-r from-pink-50/90 to-purple-50/90 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200 dark:border-pink-500/30 hover:scale-[1.02] transition-all duration-300 shadow-glow"
              >
                {/* Floating celebration particles */}
                <div className="absolute top-1 right-1 opacity-70">
                  <Sparkles className="h-3 w-3 text-pink-400 animate-pulse" />
                </div>
                <div className="absolute top-3 right-4 opacity-50">
                  <Sparkles className="h-2 w-2 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg">
                      <Gift className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground-labs text-lg">
                        {person.full_name}
                      </span>
                      <div className="text-xs text-muted-foreground-labs">
                        🎉 Happy Birthday! 🎉
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl animate-bounce">🎂</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Birthdays - Enhanced styling */}
        {upcomingBirthdays.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cake className="h-4 w-4 text-muted-foreground-labs" />
              <span className="text-sm font-medium text-muted-foreground-labs">
                Coming This Week
              </span>
            </div>
            {upcomingBirthdays.slice(0, 3).map((person, index) => (
              <div
                key={person.staff_id || `${person.full_name}-${index}`}
                className="flex items-center justify-between p-3 bg-muted/30 dark:bg-muted/20 rounded-lg hover:bg-muted/50 transition-all duration-200 hover-lift border border-transparent hover:border-labs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-muted">
                    <Cake className="h-3 w-3 text-muted-foreground-labs" />
                  </div>
                  <span className="text-sm text-foreground-labs font-medium">
                    {person.full_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground-labs font-medium">
                    {formatBirthday(person.birth_date!)}
                  </span>
                  <span className="text-sm">🎈</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}