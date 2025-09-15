import { useState } from "react";
import { Trophy, Star, Award, Crown, Zap, Target, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfettiCelebration, useCelebration } from "./ConfettiCelebration";

interface AchievementBadgeProps {
  type: "teddy_star" | "milestone" | "perfect_attendance" | "mentor" | "innovation" | "leadership" | "document_master";
  level?: "bronze" | "silver" | "gold" | "platinum";
  name: string;
  description: string;
  earnedDate?: string;
  points?: number;
  onClick?: () => void;
  isNew?: boolean;
  size?: "sm" | "md" | "lg";
}

const badgeConfig = {
  teddy_star: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  milestone: { icon: Target, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  perfect_attendance: { icon: Star, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  mentor: { icon: Award, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  innovation: { icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  leadership: { icon: Trophy, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  document_master: { icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" }
};

const levelConfig = {
  bronze: { color: "text-amber-600", glow: "shadow-amber-500/20" },
  silver: { color: "text-gray-400", glow: "shadow-gray-500/20" },
  gold: { color: "text-yellow-400", glow: "shadow-yellow-500/20" },
  platinum: { color: "text-indigo-400", glow: "shadow-indigo-500/20" }
};

export function AchievementBadge({ 
  type, 
  level = "bronze", 
  name, 
  description, 
  earnedDate, 
  points, 
  onClick, 
  isNew = false,
  size = "md" 
}: AchievementBadgeProps) {
  const config = badgeConfig[type];
  const levelStyle = levelConfig[level];
  const Icon = config.icon;
  
  const { isActive, title, message, type: celebrationType, celebrate, closeCelebration } = useCelebration();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      celebrate(
        `${name} Achieved!`,
        `🏆 You've earned the ${name} badge! ${description}`,
        "badge"
      );
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "w-16 h-16 text-xs";
      case "lg": return "w-24 h-24 text-base";
      default: return "w-20 h-20 text-sm";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm": return "w-6 h-6";
      case "lg": return "w-10 h-10";
      default: return "w-8 h-8";
    }
  };

  return (
    <>
      <div className="relative group">
        {/* New Badge Indicator */}
        {isNew && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="bg-red-500 text-white text-xs animate-pulse">NEW!</Badge>
          </div>
        )}
        
        {/* Badge Container */}
        <Card 
          className={`cursor-pointer transition-all duration-300 ${config.bg} ${config.border} hover:shadow-lg ${levelStyle.glow} ${
            isNew ? "animate-pulse ring-2 ring-primary/50" : ""
          }`}
          onClick={handleClick}
        >
          <CardContent className={`flex flex-col items-center justify-center p-4 ${getSizeClasses()}`}>
            <div className={`p-3 rounded-full ${config.bg} ${config.border} mb-2`}>
              <Icon className={`${getIconSize()} ${config.color} ${levelStyle.color}`} />
            </div>
            
            <h4 className="font-bold text-center leading-tight mb-1">{name}</h4>
            
            {level && level !== "bronze" && (
              <Badge variant="outline" className={`text-xs mb-1 ${levelStyle.color}`}>
                {level.toUpperCase()}
              </Badge>
            )}
            
            {points && (
              <Badge variant="secondary" className="text-xs">
                {points} pts
              </Badge>
            )}
          </CardContent>
        </Card>
        
        {/* Tooltip on Hover */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs">
            <p className="text-sm font-medium mb-1">{name}</p>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            {earnedDate && (
              <p className="text-xs text-muted-foreground">
                Earned: {new Date(earnedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfettiCelebration
        isActive={isActive}
        title={title}
        message={message}  
        type={celebrationType}
        onClose={closeCelebration}
      />
    </>
  );
}

// Badge Gallery Component
export function AchievementGallery({ staffName }: { staffName: string }) {
  const [showAll, setShowAll] = useState(false);
  
  // Mock achievement data
  const achievements = [
    {
      type: "teddy_star" as const,
      level: "gold" as const,
      name: "Teddy Star",
      description: "Achieved 5★ rating in performance reviews",
      earnedDate: "2024-01-15",
      points: 500,
      isNew: true
    },
    {
      type: "milestone" as const,
      level: "silver" as const,
      name: "Six Month Hero",
      description: "Successfully completed 6-month milestone",
      earnedDate: "2024-02-01", 
      points: 300
    },
    {
      type: "perfect_attendance" as const,
      level: "bronze" as const,
      name: "Perfect Attendance",
      description: "No missed days for 3 months",
      earnedDate: "2024-01-30",
      points: 200
    },
    {
      type: "document_master" as const,
      level: "bronze" as const,
      name: "Document Master",
      description: "All required documents uploaded on time",
      earnedDate: "2024-01-10",
      points: 150
    },
    {
      type: "mentor" as const,
      level: "silver" as const,
      name: "Mentor",
      description: "Successfully mentored junior staff member",
      earnedDate: "2024-02-15",
      points: 400
    },
    {
      type: "innovation" as const,
      level: "bronze" as const,
      name: "Innovation Award",
      description: "Suggested process improvement that was implemented",
      earnedDate: "2024-01-20",
      points: 250
    }
  ];

  const displayedAchievements = showAll ? achievements : achievements.slice(0, 4);
  const totalPoints = achievements.reduce((sum, achievement) => sum + (achievement.points || 0), 0);

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">🏆 {staffName}'s Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {achievements.length} badges earned • {totalPoints.toLocaleString()} total points
            </p>
          </div>
          {achievements.length > 4 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : `Show All (${achievements.length})`}
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayedAchievements.map((achievement, index) => (
            <AchievementBadge
              key={index}
              type={achievement.type}
              level={achievement.level}
              name={achievement.name}
              description={achievement.description}
              earnedDate={achievement.earnedDate}
              points={achievement.points}
              isNew={achievement.isNew}
              size="md"
            />
          ))}
        </div>
        
        {achievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No achievements yet. Keep up the great work!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}