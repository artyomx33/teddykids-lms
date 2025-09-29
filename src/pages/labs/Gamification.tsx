/**
 * 🎮 GAMIFICATION SYSTEM
 * RPG-style employee progression and achievement system
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Gamepad2,
  Star,
  Trophy,
  Zap,
  Crown,
  Sword,
  Shield,
  Sparkles,
  Target,
  Award,
  TrendingUp,
  Users,
  Clock,
  Brain,
  Heart,
  Gem,
  Gift,
  Flame,
  Rocket
} from "lucide-react";

// RPG Employee Data
const mockGameData = [
  {
    id: "1",
    name: "Sarah Johnson",
    position: "Marketing Specialist",
    class: "Salary Wizard",
    level: 23,
    xp: 8750,
    xpToNext: 1250,
    totalXP: 10000,

    stats: {
      contractStrength: 847,
      performanceWarrior: 480,
      jobSecurity: 950,
      teamworkSpirit: 720,
      creativityMagic: 680,
      leadershipAura: 340,
    },

    achievements: [
      {
        id: "salary_master",
        name: "Salary Master",
        description: "Achieved 5 salary increases",
        icon: TrendingUp,
        rarity: "legendary",
        unlockedAt: "2024-12-15",
        xpReward: 500
      },
      {
        id: "team_player",
        name: "Team Player",
        description: "Collaborated on 20+ projects",
        icon: Users,
        rarity: "epic",
        unlockedAt: "2024-11-20",
        xpReward: 300
      },
      {
        id: "review_champion",
        name: "Review Champion",
        description: "Scored 5 stars in performance review",
        icon: Star,
        rarity: "rare",
        unlockedAt: "2024-10-10",
        xpReward: 200
      },
    ],

    activeQuests: [
      {
        id: "fulltime_quest",
        name: "Unlock Full-Time Achievement",
        description: "Transition from part-time to full-time status",
        progress: 67,
        maxProgress: 100,
        reward: "Full-Time Hero Badge + 1000 XP",
        difficulty: "Epic",
        timeLeft: "3 weeks"
      },
      {
        id: "leadership_path",
        name: "Leadership Path",
        description: "Complete 3 team leadership tasks",
        progress: 1,
        maxProgress: 3,
        reward: "Team Lead Evolution Crystal + 750 XP",
        difficulty: "Legendary",
        timeLeft: "2 months"
      }
    ],

    powerUps: [
      {
        id: "salary_boost",
        name: "Salary Boost Scroll",
        description: "+€200/month salary increase",
        icon: Gem,
        rarity: "rare",
        usesLeft: 1,
        cooldown: 0
      },
      {
        id: "time_expansion",
        name: "Time Expansion Potion",
        description: "+10 hours/week working time",
        icon: Clock,
        rarity: "epic",
        usesLeft: 1,
        cooldown: 0
      }
    ],

    currentBuffs: [
      {
        name: "Tax Reduction Potion",
        description: "Active tax reduction benefits",
        duration: "Permanent",
        effect: "+15% net income",
        icon: Sparkles
      }
    ]
  },
  {
    id: "2",
    name: "John Smith",
    position: "Senior Developer",
    class: "Code Sage",
    level: 31,
    xp: 5200,
    xpToNext: 2800,
    totalXP: 8000,

    stats: {
      contractStrength: 920,
      performanceWarrior: 890,
      jobSecurity: 980,
      teamworkSpirit: 560,
      creativityMagic: 750,
      leadershipAura: 670,
    },

    achievements: [
      {
        id: "code_master",
        name: "Code Master",
        description: "Completed 100+ coding tasks",
        icon: Brain,
        rarity: "legendary",
        unlockedAt: "2024-12-10",
        xpReward: 600
      },
      {
        id: "bug_slayer",
        name: "Bug Slayer",
        description: "Fixed 50 critical bugs",
        icon: Sword,
        rarity: "epic",
        unlockedAt: "2024-11-05",
        xpReward: 400
      },
    ],

    activeQuests: [
      {
        id: "senior_architect",
        name: "Architect Ascension",
        description: "Lead architecture design for major project",
        progress: 23,
        maxProgress: 100,
        reward: "Senior Architect Crown + 1500 XP",
        difficulty: "Legendary",
        timeLeft: "6 weeks"
      }
    ],

    powerUps: [
      {
        id: "productivity_boost",
        name: "Productivity Enhancer",
        description: "+25% work efficiency for 1 month",
        icon: Rocket,
        rarity: "epic",
        usesLeft: 1,
        cooldown: 0
      }
    ],

    currentBuffs: [
      {
        name: "Steady Performance",
        description: "Consistent high performance streak",
        duration: "8 months",
        effect: "+10% XP gain",
        icon: Shield
      }
    ]
  },
  {
    id: "3",
    name: "Lisa Chen",
    position: "HR Manager",
    class: "Change Catalyst",
    level: 18,
    xp: 3400,
    xpToNext: 1600,
    totalXP: 5000,

    stats: {
      contractStrength: 340,
      performanceWarrior: 560,
      jobSecurity: 450,
      teamworkSpirit: 890,
      creativityMagic: 780,
      leadershipAura: 920,
    },

    achievements: [
      {
        id: "rapid_growth",
        name: "Rapid Advancement",
        description: "3 promotions in 2 years",
        icon: TrendingUp,
        rarity: "epic",
        unlockedAt: "2024-12-01",
        xpReward: 350
      },
    ],

    activeQuests: [
      {
        id: "stress_management",
        name: "Stress Buster Challenge",
        description: "Reduce stress levels below 50%",
        progress: 22,
        maxProgress: 100,
        reward: "Zen Master Badge + 500 XP",
        difficulty: "Epic",
        timeLeft: "4 weeks"
      },
      {
        id: "team_harmony",
        name: "Team Harmony Quest",
        description: "Improve team satisfaction by 20%",
        progress: 45,
        maxProgress: 100,
        reward: "Harmony Crystal + 800 XP",
        difficulty: "Rare",
        timeLeft: "6 weeks"
      }
    ],

    powerUps: [
      {
        id: "stress_reducer",
        name: "Calm Mind Elixir",
        description: "-30% stress for 2 weeks",
        icon: Heart,
        rarity: "rare",
        usesLeft: 2,
        cooldown: 0
      }
    ],

    currentBuffs: []
  },
  {
    id: "4",
    name: "Mike Davis",
    position: "Designer",
    class: "Creative Mystic",
    level: 27,
    xp: 7100,
    xpToNext: 900,
    totalXP: 8000,

    stats: {
      contractStrength: 780,
      performanceWarrior: 820,
      jobSecurity: 850,
      teamworkSpirit: 750,
      creativityMagic: 960,
      leadershipAura: 540,
    },

    achievements: [
      {
        id: "design_genius",
        name: "Design Genius",
        description: "Created 25 award-winning designs",
        icon: Sparkles,
        rarity: "legendary",
        unlockedAt: "2024-12-25",
        xpReward: 700
      },
      {
        id: "client_favorite",
        name: "Client Favorite",
        description: "Received 50+ client compliments",
        icon: Heart,
        rarity: "epic",
        unlockedAt: "2024-12-20",
        xpReward: 400
      },
    ],

    activeQuests: [
      {
        id: "creative_breakthrough",
        name: "Creative Breakthrough",
        description: "Develop revolutionary design concept",
        progress: 78,
        maxProgress: 100,
        reward: "Innovation Crown + 1200 XP",
        difficulty: "Legendary",
        timeLeft: "1 week"
      }
    ],

    powerUps: [
      {
        id: "inspiration_boost",
        name: "Inspiration Surge",
        description: "+50% creativity for next project",
        icon: Flame,
        rarity: "legendary",
        usesLeft: 1,
        cooldown: 0
      }
    ],

    currentBuffs: [
      {
        name: "Hot Streak",
        description: "On fire with recent successes",
        duration: "2 weeks",
        effect: "+20% creative output",
        icon: Flame
      }
    ]
  },
];

const rarityColors = {
  common: "text-gray-400 border-gray-500/30 bg-gray-500/10",
  rare: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  epic: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  legendary: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
};

const difficultyColors = {
  Easy: "text-green-400",
  Rare: "text-blue-400",
  Epic: "text-purple-400",
  Legendary: "text-yellow-400",
};

export default function Gamification() {
  const [selectedEmployee, setSelectedEmployee] = useState(mockGameData[0]);
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatBarColor = (statName: string) => {
    const colors = {
      contractStrength: "bg-blue-500",
      performanceWarrior: "bg-red-500",
      jobSecurity: "bg-green-500",
      teamworkSpirit: "bg-purple-500",
      creativityMagic: "bg-pink-500",
      leadershipAura: "bg-yellow-500",
    };
    return colors[statName as keyof typeof colors] || "bg-gray-500";
  };

  const usePowerUp = (powerUpId: string) => {
    // TODO: Implement power-up usage logic
    console.log(`Using power-up: ${powerUpId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-3 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600">
            <Gamepad2 className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-violet-400 rounded-full animate-bounce" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Gamification</h1>
            <p className="text-purple-300">
              RPG-style employee progression and achievement system
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-purple-500/20 text-purple-300 border-purple-500/30"
          >
            <Gamepad2 className="h-3 w-3 mr-1" />
            RPG Mode Active
          </Badge>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Gift className="h-4 w-4 mr-2" />
            Give Power-Up
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee RPG Cards */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Player Characters</h3>
          {mockGameData.map((employee) => (
            <Card
              key={employee.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedEmployee.id === employee.id
                  ? "bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20"
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
                    <div className="flex items-center gap-1 mb-1">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">Lv.{employee.level}</span>
                    </div>
                    <div className="text-xs text-purple-300">{employee.class}</div>
                  </div>
                </div>

                {/* XP Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-purple-300 mb-1">
                    <span>XP</span>
                    <span>{employee.xp.toLocaleString()}/{employee.totalXP.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={(employee.xp / employee.totalXP) * 100}
                    className="h-2"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Contract:</span>
                    <span className="text-blue-400 font-mono">
                      {employee.stats.contractStrength}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-300">Performance:</span>
                    <span className="text-red-400 font-mono">
                      {employee.stats.performanceWarrior}
                    </span>
                  </div>
                </div>

                {/* Active Buffs Indicator */}
                {employee.currentBuffs.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">
                      {employee.currentBuffs.length} active buff{employee.currentBuffs.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main RPG Interface */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="grid grid-cols-5 gap-1 bg-black/30 p-1 rounded-lg">
              {['overview', 'stats', 'achievements', 'quests', 'inventory'].map((tab) => (
                <Button
                  key={tab}
                  variant={selectedTab === tab ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTab(tab)}
                  className={`capitalize ${
                    selectedTab === tab
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-300 hover:text-white hover:bg-purple-500/20'
                  }`}
                >
                  {tab}
                </Button>
              ))}
            </div>

            {selectedTab === "overview" && <div className="space-y-6">
              {/* Player Card */}
              <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    {selectedEmployee.name} - Level {selectedEmployee.level} {selectedEmployee.class}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Character Info */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-purple-300 text-sm mb-1">Experience Points</div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(selectedEmployee.xp / selectedEmployee.totalXP) * 100}
                            className="h-3 flex-1"
                          />
                          <span className="text-white font-mono text-sm">
                            {selectedEmployee.xp.toLocaleString()}/{selectedEmployee.totalXP.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          {selectedEmployee.xpToNext.toLocaleString()} XP to next level
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                          <div className="text-purple-400 text-lg font-bold">
                            {selectedEmployee.achievements.length}
                          </div>
                          <div className="text-xs text-purple-300">Achievements</div>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                          <div className="text-blue-400 text-lg font-bold">
                            {selectedEmployee.activeQuests.length}
                          </div>
                          <div className="text-xs text-blue-300">Active Quests</div>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                          <div className="text-green-400 text-lg font-bold">
                            {selectedEmployee.powerUps.length}
                          </div>
                          <div className="text-xs text-green-300">Power-ups</div>
                        </div>
                      </div>
                    </div>

                    {/* Current Buffs & Status */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Active Buffs</h4>
                        {selectedEmployee.currentBuffs.length > 0 ? (
                          <div className="space-y-2">
                            {selectedEmployee.currentBuffs.map((buff, index) => {
                              const Icon = buff.icon;
                              return (
                                <div
                                  key={index}
                                  className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20 flex items-center gap-2"
                                >
                                  <Icon className="h-4 w-4 text-yellow-400" />
                                  <div className="flex-1">
                                    <div className="text-yellow-400 text-sm font-medium">
                                      {buff.name}
                                    </div>
                                    <div className="text-yellow-300 text-xs">
                                      {buff.effect} • {buff.duration}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">No active buffs</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-black/30 border-yellow-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Latest Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEmployee.achievements.slice(0, 3).map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className={`p-3 rounded border flex items-center gap-3 ${rarityColors[achievement.rarity]}`}
                        >
                          <Icon className="h-6 w-6" />
                          <div className="flex-1">
                            <div className="font-medium text-white">{achievement.name}</div>
                            <div className="text-sm text-purple-300">{achievement.description}</div>
                            <div className="text-xs text-purple-400 mt-1">
                              Unlocked: {achievement.unlockedAt} • +{achievement.xpReward} XP
                            </div>
                          </div>
                          <Badge variant="outline" className={rarityColors[achievement.rarity]}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>}

            {selectedTab === "stats" && <div className="space-y-6">
              <Card className="bg-black/30 border-green-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sword className="h-5 w-5 text-green-400" />
                    Character Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(selectedEmployee.stats).map(([statName, value]) => (
                      <div key={statName}>
                        <div className="flex justify-between mb-1">
                          <span className="text-white font-medium capitalize">
                            {statName.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-white font-mono">
                            {value}/1000
                          </span>
                        </div>
                        <div className="relative">
                          <Progress
                            value={(value / 1000) * 100}
                            className="h-3"
                          />
                          <div
                            className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ${getStatBarColor(statName)}`}
                            style={{ width: `${(value / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>}

            {selectedTab === "achievements" && <div className="space-y-6">
              <Card className="bg-black/30 border-yellow-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Achievement Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEmployee.achievements.map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded border ${rarityColors[achievement.rarity]}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="h-8 w-8" />
                            <div className="flex-1">
                              <div className="font-medium text-white">{achievement.name}</div>
                              <Badge variant="outline" className={`text-xs ${rarityColors[achievement.rarity]}`}>
                                {achievement.rarity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-purple-300 mb-2">
                            {achievement.description}
                          </div>
                          <div className="text-xs text-purple-400">
                            Earned {achievement.xpReward} XP • {achievement.unlockedAt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>}

            {selectedTab === "quests" && <div className="space-y-6">
              <Card className="bg-black/30 border-blue-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Active Quests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedEmployee.activeQuests.map((quest) => (
                      <div
                        key={quest.id}
                        className="p-4 bg-blue-500/10 rounded border border-blue-500/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-white">{quest.name}</div>
                            <div className="text-sm text-blue-300">{quest.description}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${difficultyColors[quest.difficulty as keyof typeof difficultyColors]} border-current`}
                          >
                            {quest.difficulty}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-300">Progress:</span>
                            <span className="text-blue-400">
                              {quest.progress}/{quest.maxProgress} ({Math.round((quest.progress / quest.maxProgress) * 100)}%)
                            </span>
                          </div>
                          <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />

                          <div className="flex justify-between text-xs text-blue-400">
                            <span>Reward: {quest.reward}</span>
                            <span>Time left: {quest.timeLeft}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>}

            {selectedTab === "inventory" && <div className="space-y-6">
              <Card className="bg-black/30 border-pink-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gem className="h-5 w-5 text-pink-400" />
                    Power-Up Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEmployee.powerUps.map((powerUp) => {
                      const Icon = powerUp.icon;
                      return (
                        <div
                          key={powerUp.id}
                          className={`p-4 rounded border ${rarityColors[powerUp.rarity]}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="h-8 w-8" />
                            <div className="flex-1">
                              <div className="font-medium text-white">{powerUp.name}</div>
                              <Badge variant="outline" className={`text-xs ${rarityColors[powerUp.rarity]}`}>
                                {powerUp.rarity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-purple-300 mb-3">
                            {powerUp.description}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-purple-400">
                              Uses left: {powerUp.usesLeft}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => usePowerUp(powerUp.id)}
                              disabled={powerUp.usesLeft === 0 || powerUp.cooldown > 0}
                              className="bg-pink-600 hover:bg-pink-700"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}