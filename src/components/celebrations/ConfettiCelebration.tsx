import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConfettiCelebrationProps {
  isActive: boolean;
  title: string;
  message: string;
  onClose?: () => void;
  type?: "milestone" | "review" | "document" | "badge" | "birthday";
}

export function ConfettiCelebration({ isActive, title, message, onClose, type = "milestone" }: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; emoji: string }>>([]);

  const getEmojisForType = (type: string) => {
    switch (type) {
      case "milestone": return ["🎉", "🌟", "✨", "🎊", "🏆"];
      case "review": return ["⭐", "🌟", "💫", "✨", "🎖️"];
      case "document": return ["📄", "✅", "📋", "📁", "🎯"];
      case "badge": return ["🏅", "🏆", "⭐", "🎖️", "👑"];
      case "birthday": return ["🎂", "🎈", "🎁", "🍰", "🎉"];
      default: return ["🎉", "🌟", "✨", "🎊"];
    }
  };

  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
  const emojis = getEmojisForType(type);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      }));
      setParticles(newParticles);

      // Auto-close after 2 seconds if onClose is provided
      if (onClose) {
        const timer = setTimeout(onClose, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setParticles([]);
    }
  }, [isActive, onClose, type]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Confetti Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>

      {/* Celebration Message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <Card className="max-w-md mx-4 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 animate-scale-in">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-6xl animate-pulse">
              {type === "milestone" && "🏆"}
              {type === "review" && "⭐"}
              {type === "document" && "📄"}
              {type === "badge" && "🏅"}
              {type === "birthday" && "🎂"}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground animate-fade-in">
                {title}
              </h2>
              <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {message}
              </p>
            </div>

            {onClose && (
              <Button 
                onClick={onClose}
                className="mt-4 bg-gradient-primary animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                ✨ Awesome!
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-2 h-2 rounded-full bg-primary/30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Celebration trigger hook
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    isActive: boolean;
    title: string;
    message: string;
    type: "milestone" | "review" | "document" | "badge" | "birthday";
  }>({
    isActive: false,
    title: "",
    message: "",
    type: "milestone"
  });

  const celebrate = (title: string, message: string, type: "milestone" | "review" | "document" | "badge" | "birthday" = "milestone") => {
    setCelebration({
      isActive: true,
      title,
      message,
      type
    });
  };

  const closeCelebration = () => {
    setCelebration(prev => ({ ...prev, isActive: false }));
  };

  return {
    ...celebration,
    celebrate,
    closeCelebration
  };
}