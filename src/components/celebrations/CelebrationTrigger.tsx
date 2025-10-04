import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Star, Award, FileCheck, UserCheck, Trophy, Heart } from "lucide-react";

interface CelebrationEvent {
  id: string;
  type: 'five-star-review' | 'all-docs-complete' | 'contract-signed' | 'intern-promotion' | 'perfect-month';
  staffName: string;
  timestamp: string;
}

export function CelebrationTrigger() {
  // Monitor recent activities for celebration triggers
  const { data: recentEvents = [] } = useQuery({
    queryKey: ["celebration-events"],
    retry: false,
    queryFn: async () => {
      const events: CelebrationEvent[] = [];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      try {
        // TODO: CONNECT - staff_reviews table not available yet
        // Returning mock data until database table is created
        console.log('CelebrationTrigger: Using mock data - staff_reviews needs connection');
        const recentReviewsData = [];

        if (recentReviewsData) {
          recentReviewsData.forEach((review: any) => {
            if (review.staff?.full_name) {
              events.push({
                id: `review-${review.id}`,
                type: 'five-star-review',
                staffName: review.staff.full_name,
                timestamp: review.created_at
              });
            }
          });
        }

        // Check for recently signed contracts
        const { data: recentContracts } = await supabase
          .from("contracts")
          .select("id, employee_name, signed_at")
          .not("signed_at", "is", null)
          .gte("signed_at", oneHourAgo.toISOString())
          .order("signed_at", { ascending: false });

        if (recentContracts) {
          recentContracts.forEach(contract => {
            events.push({
              id: `contract-${contract.id}`,
              type: 'contract-signed',
              staffName: contract.employee_name,
              timestamp: contract.signed_at
            });
          });
        }

        // Check for staff with all documents now complete
        const { data: completeStaff } = await supabase
          .from("staff_docs_status")
          .select("staff_id, full_name, missing_count")
          .eq("missing_count", 0);

        if (completeStaff && completeStaff.length > 0) {
          // For demo, trigger celebration for first complete staff member
          const celebrateStaff = completeStaff[0];
          events.push({
            id: `docs-${celebrateStaff.staff_id}`,
            type: 'all-docs-complete',
            staffName: celebrateStaff.full_name || 'Team Member',
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error("Error fetching celebration events:", error);
      }

      return events;
    },
    refetchInterval: 30000, // Check every 30 seconds for new celebrations
  });

  // Trigger celebrations when new events are detected
  useEffect(() => {
    recentEvents.forEach(event => {
      const celebrationKey = `celebration-${event.id}`;
      
      // Check if we've already celebrated this event (simple localStorage check)
      if (!localStorage.getItem(celebrationKey)) {
        triggerCelebration(event);
        localStorage.setItem(celebrationKey, 'true');
        
        // Clean up old celebration markers after 24 hours
        setTimeout(() => {
          localStorage.removeItem(celebrationKey);
        }, 24 * 60 * 60 * 1000);
      }
    });
  }, [recentEvents]);

  const triggerCelebration = (event: CelebrationEvent) => {
    const celebrations = {
      'five-star-review': {
        title: "🌟 Amazing Performance!",
        description: `${event.staffName} just earned a 5-star review! Outstanding work!`,
        icon: Star,
        style: "bg-gradient-to-r from-yellow-400 to-yellow-600"
      },
      'contract-signed': {
        title: "📝 Welcome to the Team!",
        description: `${event.staffName} just signed their contract! New team member aboard!`,
        icon: FileCheck,
        style: "bg-gradient-to-r from-green-400 to-green-600"
      },
      'all-docs-complete': {
        title: "✅ Documentation Master!",
        description: `${event.staffName} has completed all required documents! Perfect compliance!`,
        icon: Award,
        style: "bg-gradient-to-r from-blue-400 to-blue-600"
      },
      'intern-promotion': {
        title: "🎓 Promotion Ready!",
        description: `${event.staffName} has completed their internship program! Time for full-time!`,
        icon: Trophy,
        style: "bg-gradient-to-r from-purple-400 to-purple-600"
      },
      'perfect-month': {
        title: "💎 Perfect Month!",
        description: `${event.staffName} had a flawless month - all reviews, docs, and goals met!`,
        icon: Heart,
        style: "bg-gradient-to-r from-pink-400 to-pink-600"
      }
    };

    const celebration = celebrations[event.type];
    const IconComponent = celebration.icon;

    toast({
      title: (
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">{celebration.title}</span>
        </div>
      ) as any,
      description: (
        <div className="text-white/90 mt-1">
          {celebration.description}
        </div>
      ) as any,
      className: `${celebration.style} text-white border-0 shadow-lg`,
      duration: 6000,
    });

    // Add confetti effect for high-impact celebrations
    if (event.type === 'five-star-review' || event.type === 'perfect-month') {
      // Simple confetti fallback using emoji
      const confettiToast = () => {
        setTimeout(() => {
          toast({
            title: "🎉🎊✨🌟🎈" as any,
            description: "Celebration time! Keep up the amazing work!" as any,
            className: "bg-gradient-to-r from-rainbow-start to-rainbow-end text-white border-0",
            duration: 3000,
          });
        }, 1500);
      };
      confettiToast();
    }
  };

  // Component doesn't render anything - it's just a trigger
  return null;
}