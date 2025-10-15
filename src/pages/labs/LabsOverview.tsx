/**
 * 🧪 LABS 2.0 OVERVIEW DASHBOARD
 * Command center for all experimental features
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dna,
  Atom,
  Heart,
  Gamepad2,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Activity,
  Sparkles,
  Rocket,
  FlaskConical,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { NavLink } from "react-router-dom";

const featuresGrid = [
  {
    title: "Talent Acquisition",
    description: "AI-powered hiring pipeline with smart matching",
    icon: UserPlus,
    status: "beta" as const,
    url: "/labs/talent",
    color: "from-purple-500 to-pink-600",
    features: ["Smart Candidate Matching", "Automated Assessments", "Pipeline Analytics"],
    progress: 80,
  },
  {
    title: "Contract DNA",
    description: "Genetic analysis of employment patterns",
    icon: Dna,
    status: "beta" as const,
    url: "/labs/dna",
    color: "from-green-500 to-emerald-600",
    features: ["Pattern Recognition", "Compatibility Matching", "Evolution Tracking"],
    progress: 75,
  },
  {
    title: "Quantum Dashboard",
    description: "Probability states and future predictions",
    icon: Atom,
    status: "beta" as const,
    url: "/labs/quantum",
    color: "from-blue-500 to-cyan-600",
    features: ["Future Simulation", "Quantum Entanglement", "Probability Collapse"],
    progress: 60,
  },
  {
    title: "Emotion Engine",
    description: "AI-powered emotional intelligence",
    icon: Heart,
    status: "experimental" as const,
    url: "/labs/emotions",
    color: "from-pink-500 to-rose-600",
    features: ["Sentiment Analysis", "Satisfaction Tracking", "Mood Prediction"],
    progress: 40,
  },
  {
    title: "Gamification",
    description: "RPG-style employee progression",
    icon: Gamepad2,
    status: "experimental" as const,
    url: "/labs/game",
    color: "from-purple-500 to-violet-600",
    features: ["Level System", "Achievements", "Power-ups"],
    progress: 30,
  },
  {
    title: "Reality Control",
    description: "Timeline manipulation and what-if scenarios",
    icon: Zap,
    status: "future" as const,
    url: "/labs/reality",
    color: "from-orange-500 to-red-600",
    features: ["Time Travel", "Parallel Universes", "Reality Remote"],
    progress: 10,
  },
  {
    title: "Neural Networks",
    description: "Advanced AI pattern recognition",
    icon: Brain,
    status: "future" as const,
    url: "/labs/neural",
    color: "from-indigo-500 to-purple-600",
    features: ["Deep Learning", "Prediction Models", "Auto-optimization"],
    progress: 5,
  },
];

const statusColors = {
  beta: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  experimental: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  future: "bg-accent text-accent-foreground border-border",
};

export default function LabsOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <FlaskConical className="h-12 w-12 text-purple-400" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-purple-500 rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-foreground-labs">
            Welcome to Labs 2.0
          </h1>
          <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
        </div>
        <p className="text-xl text-purple-300 max-w-2xl mx-auto">
          Experimental AI-powered features that push the boundaries of what's possible
          in employment management. Welcome to the future of HR technology.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card-labs-glass border-labs transition-theme">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400">2</div>
            <div className="text-sm text-purple-300">Active Features</div>
          </CardContent>
        </Card>
        <Card className="bg-card-labs-glass border-labs transition-theme">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">3</div>
            <div className="text-sm text-purple-300">Beta Features</div>
          </CardContent>
        </Card>
        <Card className="bg-card-labs-glass border-labs transition-theme">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-400">2</div>
            <div className="text-sm text-purple-300">Experimental</div>
          </CardContent>
        </Card>
        <Card className="bg-card-labs-glass border-labs transition-theme">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">2</div>
            <div className="text-sm text-purple-300">Coming Soon</div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {featuresGrid.map((feature) => {
          const Icon = feature.icon;
          const isDisabled = feature.status === 'future';

          return (
            <Card
              key={feature.title}
              className="bg-card-labs-glass border-labs hover:shadow-card-labs-intense transition-theme group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground-labs transition-colors">
                        {feature.title}
                      </CardTitle>
                      <p className="text-sm text-purple-300 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[feature.status]}
                  >
                    {feature.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Features List */}
                <div className="space-y-2 mb-4">
                  {feature.features.map((featureName) => (
                    <div key={featureName} className="flex items-center gap-2 text-sm text-purple-300">
                      <ChevronRight className="h-3 w-3" />
                      {featureName}
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-purple-300 mb-1">
                    <span>Development Progress</span>
                    <span>{feature.progress}%</span>
                  </div>
                  <div className="w-full bg-purple-900/30 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${feature.color} transition-all duration-300`}
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  asChild={!isDisabled}
                  variant="outline"
                  className={`w-full ${
                    isDisabled
                      ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                      : 'border-labs text-muted-foreground-labs hover:bg-accent hover:text-accent-foreground hover:border-primary'
                  }`}
                  disabled={isDisabled}
                >
                  {isDisabled ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Coming Soon
                    </span>
                  ) : (
                    <NavLink to={feature.url} className="flex items-center gap-2">
                      <Rocket className="h-4 w-4" />
                      Launch Feature
                      <ChevronRight className="h-4 w-4" />
                    </NavLink>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Status */}
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-foreground-labs flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Labs System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">Online</div>
              <div className="text-sm text-purple-300">State Tracker</div>
              <div className="text-xs text-green-400">All systems operational</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">Active</div>
              <div className="text-sm text-purple-300">AI Engine</div>
              <div className="text-xs text-blue-400">Processing patterns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">Ready</div>
              <div className="text-sm text-purple-300">Quantum Core</div>
              <div className="text-xs text-purple-400">Probability calculations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-purple-300 mb-4">
          Ready to explore the future of employment management?
        </p>
        <div className="flex justify-center gap-4">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-labs text-muted-foreground-labs hover:bg-accent hover:text-accent-foreground transition-theme"
          >
            <NavLink to="/labs/dna" className="flex items-center gap-2">
              <Dna className="h-5 w-5" />
              Start with Contract DNA
              <ChevronRight className="h-4 w-4" />
            </NavLink>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-labs text-muted-foreground-labs hover:bg-accent hover:text-accent-foreground transition-theme"
          >
            <NavLink to="/labs/quantum" className="flex items-center gap-2">
              <Atom className="h-5 w-5" />
              Explore Quantum States
              <ChevronRight className="h-4 w-4" />
            </NavLink>
          </Button>
        </div>
      </div>
    </div>
  );
}