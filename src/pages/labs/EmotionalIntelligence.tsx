/**
 * 🎭 EMOTIONAL INTELLIGENCE PANEL
 * AI-powered emotional analysis and mood prediction
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Heart,
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  Smile,
  Frown,
  Meh,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Thermometer,
  Battery,
  Waves,
  BarChart3
} from "lucide-react";
import { stateTracker } from "@/lib/labs/state-tracker";

// Mock emotional intelligence data
const mockEmotionalData = [
  {
    id: "1",
    name: "Sarah Johnson",
    position: "Marketing Specialist",
    emotion: {
      happiness: 87,
      stress: 23,
      satisfaction: 92,
      motivation: 78,
      stability: 85,
      prediction: "Will ask for promotion in 3 weeks",
    },
    mood: {
      current: "content",
      trend: "improving",
      volatility: "low",
      lastChange: new Date('2024-12-28'),
    },
    vitals: {
      energy: 82,
      focus: 89,
      creativity: 76,
      collaboration: 91,
    },
    patterns: {
      mondayBlues: 12,
      fridayBoost: 89,
      lunchDip: 34,
      deadlineStress: 45,
    },
    recentEvents: [
      { type: "salary_increase", impact: "+15 happiness", date: "2024-12-20" },
      { type: "project_completion", impact: "+8 satisfaction", date: "2024-12-18" },
      { type: "team_recognition", impact: "+12 motivation", date: "2024-12-15" },
    ],
    socialNetwork: {
      influence: 0.73,
      connections: 8,
      sentiment: "positive",
      teamMoodImpact: "+12%",
    }
  },
  {
    id: "2",
    name: "John Smith",
    position: "Senior Developer",
    emotion: {
      happiness: 76,
      stress: 45,
      satisfaction: 78,
      motivation: 82,
      stability: 92,
      prediction: "Stable and content with current situation",
    },
    mood: {
      current: "focused",
      trend: "stable",
      volatility: "very_low",
      lastChange: new Date('2024-12-25'),
    },
    vitals: {
      energy: 75,
      focus: 94,
      creativity: 88,
      collaboration: 67,
    },
    patterns: {
      mondayBlues: 8,
      fridayBoost: 65,
      lunchDip: 28,
      deadlineStress: 23,
    },
    recentEvents: [
      { type: "code_review_praise", impact: "+6 satisfaction", date: "2024-12-22" },
      { type: "bug_fix_success", impact: "+10 motivation", date: "2024-12-19" },
      { type: "overtime_session", impact: "-5 energy", date: "2024-12-17" },
    ],
    socialNetwork: {
      influence: 0.45,
      connections: 4,
      sentiment: "neutral",
      teamMoodImpact: "+3%",
    }
  },
  {
    id: "3",
    name: "Lisa Chen",
    position: "HR Manager",
    emotion: {
      happiness: 45,
      stress: 78,
      satisfaction: 56,
      motivation: 67,
      stability: 34,
      prediction: "Considering contract non-renewal",
    },
    mood: {
      current: "overwhelmed",
      trend: "declining",
      volatility: "high",
      lastChange: new Date('2024-12-29'),
    },
    vitals: {
      energy: 52,
      focus: 61,
      creativity: 43,
      collaboration: 78,
    },
    patterns: {
      mondayBlues: 89,
      fridayBoost: 23,
      lunchDip: 67,
      deadlineStress: 91,
    },
    recentEvents: [
      { type: "conflict_resolution", impact: "-12 stress", date: "2024-12-28" },
      { type: "workload_increase", impact: "-15 satisfaction", date: "2024-12-26" },
      { type: "manager_feedback", impact: "-8 motivation", date: "2024-12-24" },
    ],
    socialNetwork: {
      influence: 0.89,
      connections: 12,
      sentiment: "mixed",
      teamMoodImpact: "-8%",
    }
  },
  {
    id: "4",
    name: "Mike Davis",
    position: "Designer",
    emotion: {
      happiness: 89,
      stress: 18,
      satisfaction: 84,
      motivation: 91,
      stability: 78,
      prediction: "Ready for additional responsibilities",
    },
    mood: {
      current: "inspired",
      trend: "improving",
      volatility: "medium",
      lastChange: new Date('2024-12-27'),
    },
    vitals: {
      energy: 88,
      focus: 79,
      creativity: 96,
      collaboration: 85,
    },
    patterns: {
      mondayBlues: 15,
      fridayBoost: 94,
      lunchDip: 22,
      deadlineStress: 35,
    },
    recentEvents: [
      { type: "design_approval", impact: "+18 happiness", date: "2024-12-27" },
      { type: "client_praise", impact: "+14 motivation", date: "2024-12-25" },
      { type: "creative_breakthrough", impact: "+20 satisfaction", date: "2024-12-23" },
    ],
    socialNetwork: {
      influence: 0.67,
      connections: 7,
      sentiment: "very_positive",
      teamMoodImpact: "+15%",
    }
  },
];

const emotionColors = {
  happiness: "text-yellow-400",
  stress: "text-red-400",
  satisfaction: "text-green-400",
  motivation: "text-blue-400",
  stability: "text-purple-400",
};

const moodEmojis = {
  content: "😊",
  focused: "🎯",
  overwhelmed: "😰",
  inspired: "✨",
};

const moodColors = {
  content: "text-green-400",
  focused: "text-blue-400",
  overwhelmed: "text-red-400",
  inspired: "text-yellow-400",
};

const trendIcons = {
  improving: TrendingUp,
  stable: Zap,
  declining: TrendingDown,
};

const trendColors = {
  improving: "text-green-400",
  stable: "text-yellow-400",
  declining: "text-red-400",
};

export default function EmotionalIntelligence() {
  const [selectedEmployee, setSelectedEmployee] = useState(mockEmotionalData[0]);
  const [viewMode, setViewMode] = useState("overview");
  const [timeframe, setTimeframe] = useState("week");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeEmotions = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const getEmotionLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-400" };
    if (score >= 60) return { level: "Good", color: "text-yellow-400" };
    if (score >= 40) return { level: "Fair", color: "text-orange-400" };
    return { level: "Needs Attention", color: "text-red-400" };
  };

  const getVolatilityColor = (volatility: string) => {
    if (volatility === "very_low") return "text-green-400";
    if (volatility === "low") return "text-blue-400";
    if (volatility === "medium") return "text-yellow-400";
    return "text-red-400";
  };

  const getSentimentEmoji = (sentiment: string) => {
    if (sentiment === "very_positive") return "🌟";
    if (sentiment === "positive") return "😊";
    if (sentiment === "neutral") return "😐";
    if (sentiment === "mixed") return "🤔";
    return "😞";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600">
            <Heart className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-rose-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Emotion Engine</h1>
            <p className="text-purple-300">
              AI-powered emotional intelligence and mood prediction
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-pink-500/20 text-pink-300 border-pink-500/30"
          >
            <Brain className="h-3 w-3 mr-1" />
            AI Active
          </Badge>
          <Button
            onClick={analyzeEmotions}
            disabled={isAnalyzing}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Deep Emotion Scan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Select value={viewMode} onValueChange={setViewMode}>
          <SelectTrigger className="w-48 bg-black/30 border-purple-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Emotional Overview</SelectItem>
            <SelectItem value="vitals">Vital Signs</SelectItem>
            <SelectItem value="patterns">Behavioral Patterns</SelectItem>
            <SelectItem value="network">Social Network</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-48 bg-black/30 border-purple-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Emotional States */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Emotional Profiles</h3>
          {mockEmotionalData.map((employee) => {
            const TrendIcon = trendIcons[employee.mood.trend as keyof typeof trendIcons];
            const trendColor = trendColors[employee.mood.trend as keyof typeof trendColors];

            return (
              <Card
                key={employee.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedEmployee.id === employee.id
                    ? "bg-pink-500/20 border-pink-500/50 shadow-lg shadow-pink-500/20"
                    : "bg-black/30 border-purple-500/30 hover:bg-black/40"
                }`}
                onClick={() => setSelectedEmployee(employee)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{employee.name}</h4>
                      <p className="text-sm text-purple-300">{employee.position}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl mb-1">
                        {moodEmojis[employee.mood.current as keyof typeof moodEmojis]}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                        <span className={`text-xs ${trendColor}`}>
                          {employee.mood.trend}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick emotional snapshot */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-green-300">Satisfaction:</span>
                      <span className="text-green-400 font-mono">
                        {employee.emotion.satisfaction}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-300">Stress:</span>
                      <span className="text-red-400 font-mono">
                        {employee.emotion.stress}%
                      </span>
                    </div>
                  </div>

                  {/* Emotional health bar */}
                  <div className="mt-3 h-2 bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 animate-pulse"
                      style={{
                        width: `${(employee.emotion.happiness + employee.emotion.satisfaction - employee.emotion.stress) / 2}%`
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Emotional Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {viewMode === "overview" && (
            <>
              {/* Current Emotional State */}
              <Card className="bg-black/30 border-pink-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-400" />
                    {selectedEmployee.name} - Emotional State
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(selectedEmployee.emotion).filter(([key]) => key !== 'prediction').map(([emotion, value]) => {
                      const level = getEmotionLevel(value as number);
                      const color = emotionColors[emotion as keyof typeof emotionColors];

                      return (
                        <div key={emotion} className="text-center">
                          <div className={`text-2xl font-bold ${color} mb-1`}>
                            {value}%
                          </div>
                          <div className="text-sm text-purple-300 capitalize mb-2">
                            {emotion}
                          </div>
                          <Progress
                            value={value as number}
                            className="h-2"
                          />
                          <div className={`text-xs ${level.color} mt-1`}>
                            {level.level}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Prediction */}
                  <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-pink-400 mt-0.5" />
                      <div>
                        <div className="text-pink-300 font-medium mb-1">
                          AI Emotional Prediction
                        </div>
                        <div className="text-white">
                          {selectedEmployee.emotion.prediction}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Mood & Trend */}
              <Card className="bg-black/30 border-yellow-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Waves className="h-5 w-5 text-yellow-400" />
                    Mood Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-6xl mb-3">
                        {moodEmojis[selectedEmployee.mood.current as keyof typeof moodEmojis]}
                      </div>
                      <div className={`text-xl font-bold mb-2 ${moodColors[selectedEmployee.mood.current as keyof typeof moodColors]}`}>
                        {selectedEmployee.mood.current}
                      </div>
                      <div className="text-sm text-purple-300">
                        Current Mood
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-purple-300">Trend:</span>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const TrendIcon = trendIcons[selectedEmployee.mood.trend as keyof typeof trendIcons];
                            const trendColor = trendColors[selectedEmployee.mood.trend as keyof typeof trendColors];
                            return (
                              <>
                                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                                <span className={`${trendColor} capitalize`}>
                                  {selectedEmployee.mood.trend}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-purple-300">Volatility:</span>
                        <span className={`capitalize ${getVolatilityColor(selectedEmployee.mood.volatility)}`}>
                          {selectedEmployee.mood.volatility.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-purple-300">Last Change:</span>
                        <span className="text-white">
                          {selectedEmployee.mood.lastChange.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Emotional Events */}
              <Card className="bg-black/30 border-blue-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    Recent Emotional Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEmployee.recentEvents.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                      >
                        <div>
                          <div className="text-white font-medium capitalize">
                            {event.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-blue-300">
                            {event.date}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            event.impact.startsWith('+')
                              ? 'text-green-300 border-green-500/30'
                              : 'text-red-300 border-red-500/30'
                          }`}
                        >
                          {event.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {viewMode === "vitals" && (
            <Card className="bg-black/30 border-green-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Battery className="h-5 w-5 text-green-400" />
                  Emotional Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(selectedEmployee.vitals).map(([vital, value]) => (
                    <div key={vital} className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {value}%
                      </div>
                      <div className="text-purple-300 capitalize mb-3">
                        {vital}
                      </div>
                      <div className="relative h-32 w-8 mx-auto bg-green-900/30 rounded-full overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-300 transition-all duration-1000"
                          style={{ height: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === "patterns" && (
            <Card className="bg-black/30 border-orange-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                  Behavioral Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(selectedEmployee.patterns).map(([pattern, intensity]) => (
                    <div key={pattern}>
                      <div className="flex justify-between mb-2">
                        <span className="text-white font-medium capitalize">
                          {pattern.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-orange-400 font-mono">
                          {intensity}% intensity
                        </span>
                      </div>
                      <Progress
                        value={intensity}
                        className="h-3"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === "network" && (
            <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  Social Emotional Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {getSentimentEmoji(selectedEmployee.socialNetwork.sentiment)}
                    </div>
                    <div className="text-cyan-400 text-xl font-bold mb-1">
                      {Math.round(selectedEmployee.socialNetwork.influence * 100)}%
                    </div>
                    <div className="text-cyan-300 text-sm">
                      Social Influence
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-300">Connections:</span>
                      <span className="text-white">
                        {selectedEmployee.socialNetwork.connections}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Sentiment:</span>
                      <span className="text-cyan-400 capitalize">
                        {selectedEmployee.socialNetwork.sentiment.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Team Impact:</span>
                      <span className={`font-bold ${
                        selectedEmployee.socialNetwork.teamMoodImpact.startsWith('+')
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {selectedEmployee.socialNetwork.teamMoodImpact}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}