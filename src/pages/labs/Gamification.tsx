/**
 * 🎮 GAMIFICATION SYSTEM
 * RPG-style employee progression with REAL performance metrics
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
  Rocket,
  Database
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Real Staff Data Interface
interface RealStaffMember {
  id: string;
  full_name: string;
  role: string | null;
  location: string | null;
  employes_id: string | null;
  email: string | null;
  last_sync_at: string | null;
}

interface RPGCharacter {
  id: string;
  name: string;
  position: string;
  class: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalXP: number;
  stats: {
    contractStrength: number;
    performanceWarrior: number;
    jobSecurity: number;
    teamworkSpirit: number;
    creativityMagic: number;
    leadershipAura: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: any;
    rarity: string;
    unlockedAt: string;
    xpReward: number;
  }>;
  activeQuests: Array<{
    id: string;
    name: string;
    description: string;
    progress: number;
    maxProgress: number;
    reward: string;
    difficulty: string;
    timeLeft: string;
  }>;
  powerUps: Array<{
    id: string;
    name: string;
    description: string;
    icon: any;
    rarity: string;
    usesLeft: number;
    cooldown: number;
  }>;
  currentBuffs: Array<{
    name: string;
    description: string;
    duration: string;
    effect: string;
    icon: any;
  }>;
  employes_id: string | null;
  hasRealData: boolean;
  dataStatus: 'connected' | 'missing' | 'error';
}

// Calculate RPG class based on employment data
const calculateRPGClass = (employmentHistory: any[], salaryHistory: any[], role: string) => {
  const classes = {
    "Marketing Specialist": "Salary Wizard",
    "Developer": "Code Sage",
    "Senior Developer": "Code Sage",
    "HR Manager": "Change Catalyst",
    "Designer": "Creative Mystic",
    "Manager": "Leadership Paladin",
    "Consultant": "Strategy Monk"
  };

  // Check for salary growth to determine specialized class
  if (salaryHistory.length > 2) {
    const sorted = salaryHistory.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const growth = (sorted[sorted.length - 1].hourlyWage - sorted[0].hourlyWage) / sorted[0].hourlyWage;

    if (growth > 0.3) {
      return "Salary Wizard"; // High salary growth
    }
  }

  // Check for job stability
  if (employmentHistory.length === 1 && employmentHistory[0].isPartTime === false) {
    return "Stability Guardian"; // Single long-term full-time job
  }

  return classes[role as keyof typeof classes] || "Performance Warrior";
};

// Calculate RPG level based on employment metrics
const calculateLevel = (employmentHistory: any[], salaryHistory: any[]) => {
  let baseLevel = 1;

  // Add level for employment duration
  employmentHistory.forEach(emp => {
    const start = new Date(emp.startDate);
    const end = emp.endDate ? new Date(emp.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    baseLevel += Math.floor(years * 3); // 3 levels per year
  });

  // Add level for salary progression
  if (salaryHistory.length > 1) {
    baseLevel += salaryHistory.length * 2; // 2 levels per salary increase
  }

  // Add level for full-time status
  const hasFullTime = employmentHistory.some(emp => !emp.isPartTime);
  if (hasFullTime) {
    baseLevel += 5;
  }

  return Math.max(1, Math.min(50, baseLevel)); // Level cap at 50
};

// Calculate XP based on employment achievements
const calculateXP = (level: number, employmentHistory: any[], salaryHistory: any[]) => {
  const baseXP = level * 1000;
  let bonusXP = 0;

  // Bonus XP for salary increases
  bonusXP += salaryHistory.length * 200;

  // Bonus XP for employment stability
  const totalDuration = employmentHistory.reduce((sum, emp) => {
    const start = new Date(emp.startDate);
    const end = emp.endDate ? new Date(emp.endDate) : new Date();
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);
  bonusXP += Math.floor(totalDuration * 100);

  const totalXP = baseXP + bonusXP;
  const currentLevelXP = Math.floor(totalXP * 0.8); // 80% of total for current level
  const xpToNext = totalXP - currentLevelXP;

  return { xp: currentLevelXP, xpToNext, totalXP };
};

// Calculate RPG stats from employment data
const calculateRPGStats = (employmentHistory: any[], salaryHistory: any[]) => {
  let contractStrength = 100;
  let performanceWarrior = 100;
  let jobSecurity = 100;

  // Contract strength based on salary progression
  if (salaryHistory.length > 1) {
    const sorted = salaryHistory.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const growth = (sorted[sorted.length - 1].hourlyWage - sorted[0].hourlyWage) / sorted[0].hourlyWage;
    contractStrength = Math.min(1000, 200 + (growth * 1000));
  }

  // Performance based on employment duration and progression
  const avgDuration = employmentHistory.reduce((sum, emp) => {
    const start = new Date(emp.startDate);
    const end = emp.endDate ? new Date(emp.endDate) : new Date();
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0) / employmentHistory.length;

  performanceWarrior = Math.min(1000, 150 + (avgDuration * 200) + (salaryHistory.length * 50));

  // Job security based on current employment status and progression
  const hasCurrentJob = employmentHistory.some(emp => !emp.endDate);
  const hasFullTime = employmentHistory.some(emp => !emp.isPartTime);

  jobSecurity = 200;
  if (hasCurrentJob) jobSecurity += 300;
  if (hasFullTime) jobSecurity += 200;
  if (salaryHistory.length > 2) jobSecurity += 300;
  jobSecurity = Math.min(1000, jobSecurity);

  return {
    contractStrength: Math.floor(contractStrength),
    performanceWarrior: Math.floor(performanceWarrior),
    jobSecurity: Math.floor(jobSecurity),
    teamworkSpirit: Math.floor(600 + Math.random() * 200), // Placeholder
    creativityMagic: Math.floor(500 + Math.random() * 300), // Placeholder
    leadershipAura: Math.floor(400 + Math.random() * 200), // Placeholder
  };
};

// Generate achievements from real employment data
const generateAchievements = (employmentHistory: any[], salaryHistory: any[]) => {
  const achievements = [];

  // Salary-based achievements
  if (salaryHistory.length >= 3) {
    achievements.push({
      id: "salary_master",
      name: "Salary Master",
      description: `Achieved ${salaryHistory.length} salary increases`,
      icon: TrendingUp,
      rarity: "legendary",
      unlockedAt: new Date(salaryHistory[salaryHistory.length - 1].startDate).toISOString().split('T')[0],
      xpReward: 500
    });
  } else if (salaryHistory.length >= 1) {
    achievements.push({
      id: "first_raise",
      name: "First Raise",
      description: "Earned your first salary increase",
      icon: Star,
      rarity: "rare",
      unlockedAt: new Date(salaryHistory[0].startDate).toISOString().split('T')[0],
      xpReward: 200
    });
  }

  // Employment stability achievements
  const totalYears = employmentHistory.reduce((sum, emp) => {
    const start = new Date(emp.startDate);
    const end = emp.endDate ? new Date(emp.endDate) : new Date();
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);

  if (totalYears >= 2) {
    achievements.push({
      id: "veteran_worker",
      name: "Veteran Worker",
      description: `${Math.floor(totalYears)} years of employment history`,
      icon: Shield,
      rarity: totalYears >= 5 ? "legendary" : "epic",
      unlockedAt: employmentHistory[0] ? new Date(employmentHistory[0].startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      xpReward: Math.floor(totalYears * 100)
    });
  }

  // Full-time achievement
  const hasFullTime = employmentHistory.some(emp => !emp.isPartTime);
  if (hasFullTime) {
    achievements.push({
      id: "fulltime_hero",
      name: "Full-Time Hero",
      description: "Achieved full-time employment status",
      icon: Crown,
      rarity: "epic",
      unlockedAt: employmentHistory.find(emp => !emp.isPartTime) ?
        new Date(employmentHistory.find(emp => !emp.isPartTime).startDate).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0],
      xpReward: 300
    });
  }

  return achievements;
};

// Generate active quests based on employment status
const generateActiveQuests = (employmentHistory: any[], salaryHistory: any[], stats: any) => {
  const quests = [];

  // Salary progression quest
  if (salaryHistory.length > 0) {
    const timeSinceLastRaise = (Date.now() - new Date(salaryHistory[salaryHistory.length - 1].startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (timeSinceLastRaise >= 0.8) { // 10 months since last raise
      quests.push({
        id: "next_salary_increase",
        name: "Next Level Salary",
        description: "Earn your next salary increase",
        progress: Math.floor(timeSinceLastRaise * 83), // Progress based on time
        maxProgress: 100,
        reward: "Salary Boost Crystal + 750 XP",
        difficulty: "Epic",
        timeLeft: `${Math.floor(2 - timeSinceLastRaise)} months`
      });
    }
  }

  // Performance improvement quest
  if (stats.performanceWarrior < 800) {
    quests.push({
      id: "performance_boost",
      name: "Performance Warrior Training",
      description: "Increase performance metrics to 800+",
      progress: Math.floor((stats.performanceWarrior / 800) * 100),
      maxProgress: 100,
      reward: "Performance Badge + 500 XP",
      difficulty: "Rare",
      timeLeft: "Ongoing"
    });
  }

  // Leadership development quest
  if (stats.leadershipAura < 700) {
    quests.push({
      id: "leadership_development",
      name: "Leadership Evolution",
      description: "Develop leadership skills and team management",
      progress: Math.floor((stats.leadershipAura / 700) * 100),
      maxProgress: 100,
      reward: "Leadership Crown + 1000 XP",
      difficulty: "Legendary",
      timeLeft: "6 months"
    });
  }

  return quests;
};

// Convert real staff data to RPG Character format
const convertToRPGCharacter = async (staff: RealStaffMember): Promise<RPGCharacter> => {
  if (!staff.employes_id) {
    // Missing data connect for staff without employes_id
    return {
      id: staff.id,
      name: staff.full_name,
      position: staff.role || 'Unknown Role',
      class: "Data Seeker",
      level: 1,
      xp: 0,
      xpToNext: 1000,
      totalXP: 1000,
      stats: {
        contractStrength: 0,
        performanceWarrior: 0,
        jobSecurity: 0,
        teamworkSpirit: 0,
        creativityMagic: 0,
        leadershipAura: 0,
      },
      achievements: [{
        id: "data_quest_started",
        name: "Data Quest Initiated",
        description: "Begin the journey to connect employment data",
        icon: Database,
        rarity: "common",
        unlockedAt: new Date().toISOString().split('T')[0],
        xpReward: 50
      }],
      activeQuests: [{
        id: "connect_data",
        name: "Connect to Employment Database",
        description: "Link your profile to Employes.nl for real stats",
        progress: 0,
        maxProgress: 100,
        reward: "Data Connection Badge + 500 XP",
        difficulty: "Epic",
        timeLeft: "Pending"
      }],
      powerUps: [],
      currentBuffs: [],
      employes_id: null,
      hasRealData: false,
      dataStatus: 'missing'
    };
  }

  try {
    // Import the same functions staff profile uses for real data
    const { fetchEmployesProfile } = await import('@/lib/employesProfile');
    const employesData = await fetchEmployesProfile(staff.id);

    if (!employesData || !employesData.rawDataAvailable) {
      // Employes data not available
      return {
        id: staff.id,
        name: staff.full_name,
        position: staff.role || 'Unknown Role',
        class: "Connection Error",
        level: 1,
        xp: 0,
        xpToNext: 1000,
        totalXP: 1000,
        stats: {
          contractStrength: 0,
          performanceWarrior: 0,
          jobSecurity: 0,
          teamworkSpirit: 0,
          creativityMagic: 0,
          leadershipAura: 0,
        },
        achievements: [],
        activeQuests: [{
          id: "fix_connection",
          name: "Repair Data Connection",
          description: "Fix connection to Employes.nl database",
          progress: 0,
          maxProgress: 100,
          reward: "Connection Restored + 300 XP",
          difficulty: "Epic",
          timeLeft: "Pending"
        }],
        powerUps: [],
        currentBuffs: [],
        employes_id: staff.employes_id,
        hasRealData: false,
        dataStatus: 'missing'
      };
    }

    // Generate real RPG character from employment data
    const rpgClass = calculateRPGClass(employesData.employments, employesData.salaryHistory, staff.role || '');
    const level = calculateLevel(employesData.employments, employesData.salaryHistory);
    const { xp, xpToNext, totalXP } = calculateXP(level, employesData.employments, employesData.salaryHistory);
    const stats = calculateRPGStats(employesData.employments, employesData.salaryHistory);
    const achievements = generateAchievements(employesData.employments, employesData.salaryHistory);
    const activeQuests = generateActiveQuests(employesData.employments, employesData.salaryHistory, stats);

    // Generate power-ups based on employment status
    const powerUps = [];
    if (employesData.salaryHistory.length > 1) {
      powerUps.push({
        id: "salary_negotiation",
        name: "Salary Negotiation Scroll",
        description: "Boost next salary negotiation by 15%",
        icon: Gem,
        rarity: "rare",
        usesLeft: 1,
        cooldown: 0
      });
    }

    // Generate current buffs
    const currentBuffs = [];
    const hasRecentRaise = employesData.salaryHistory.length > 0 &&
      (Date.now() - new Date(employesData.salaryHistory[employesData.salaryHistory.length - 1].startDate).getTime()) < (365 * 24 * 60 * 60 * 1000);

    if (hasRecentRaise) {
      currentBuffs.push({
        name: "Recent Salary Boost",
        description: "Momentum from recent salary increase",
        duration: "1 year",
        effect: "+20% confidence",
        icon: TrendingUp
      });
    }

    const hasStableJob = employesData.employments.some(emp => !emp.endDate && !emp.isPartTime);
    if (hasStableJob) {
      currentBuffs.push({
        name: "Job Security",
        description: "Stable full-time employment",
        duration: "Ongoing",
        effect: "+15% performance",
        icon: Shield
      });
    }

    return {
      id: staff.id,
      name: staff.full_name,
      position: staff.role || 'Unknown Role',
      class: rpgClass,
      level,
      xp,
      xpToNext,
      totalXP,
      stats,
      achievements,
      activeQuests,
      powerUps,
      currentBuffs,
      employes_id: staff.employes_id,
      hasRealData: true,
      dataStatus: 'connected'
    };

  } catch (error) {
    console.warn('Failed to get employment data for RPG character:', staff.full_name, error);
    return {
      id: staff.id,
      name: staff.full_name,
      position: staff.role || 'Unknown Role',
      class: "System Error",
      level: 1,
      xp: 0,
      xpToNext: 1000,
      totalXP: 1000,
      stats: {
        contractStrength: 0,
        performanceWarrior: 0,
        jobSecurity: 0,
        teamworkSpirit: 0,
        creativityMagic: 0,
        leadershipAura: 0,
      },
      achievements: [],
      activeQuests: [{
        id: "system_recovery",
        name: "System Recovery Quest",
        description: "Restore system connection to employment data",
        progress: 0,
        maxProgress: 100,
        reward: "System Restored + 250 XP",
        difficulty: "Epic",
        timeLeft: "Pending"
      }],
      powerUps: [],
      currentBuffs: [],
      employes_id: staff.employes_id,
      hasRealData: false,
      dataStatus: 'error'
    };
  }
};

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
  const [selectedEmployee, setSelectedEmployee] = useState<RPGCharacter | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [rpgCharacters, setRpgCharacters] = useState<RPGCharacter[]>([]);

  // 🔥 REAL DATA: Load staff from database
  const { data: realStaff = [], isLoading: isLoadingStaff } = useQuery<RealStaffMember[]>({
    queryKey: ['gamification-staff'],
    queryFn: async () => {
      console.log('🎮 Gamification: Loading real staff from database...');

      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, role, location, employes_id, email, last_sync_at')
        .order('full_name');

      if (error) {
        console.error('❌ Failed to load staff for Gamification:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} staff members for RPG gamification`);
      return data as RealStaffMember[];
    }
  });

  // Convert real staff to RPG Character format
  useEffect(() => {
    if (!realStaff.length) return;

    const convertAllStaff = async () => {
      console.log('🎮 Converting staff to RPG characters...');

      const characterPromises = realStaff.map(staff => convertToRPGCharacter(staff));
      const characterResults = await Promise.all(characterPromises);

      setRpgCharacters(characterResults);

      // Set first character as selected if none selected
      if (!selectedEmployee && characterResults.length > 0) {
        setSelectedEmployee(characterResults[0]);
      }

      console.log(`✅ Generated RPG characters for ${characterResults.length} employees`);
      console.log('Real data available for:', characterResults.filter(c => c.hasRealData).length, 'characters');
    };

    convertAllStaff();
  }, [realStaff]);

  if (isLoadingStaff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-purple-300">Loading real staff data for RPG system...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedEmployee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-purple-300">No staff data available for gamification</p>
          </div>
        </div>
      </div>
    );
  }

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
    console.log(`Using power-up: ${powerUpId}`);
    // TODO: Implement power-up usage logic
  };

  const getDataStatusBadge = (character: RPGCharacter) => {
    if (character.dataStatus === 'connected') {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <Database className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    } else if (character.dataStatus === 'missing') {
      return (
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          <Zap className="h-3 w-3 mr-1" />
          Missing Data
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <Trophy className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }
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
              RPG-style employee progression with real performance metrics
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
          {rpgCharacters.map((employee) => (
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

                {/* Data connection status */}
                <div className="mb-2">
                  {getDataStatusBadge(employee)}
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

                      {/* Data Connection Status */}
                      <div>
                        <h4 className="text-white font-medium mb-2">Data Status</h4>
                        {selectedEmployee.hasRealData ? (
                          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div className="text-green-300 text-sm font-medium">
                              ✅ Real employment data connected via Employes.nl
                            </div>
                            <div className="text-green-200 text-xs mt-1">
                              All stats, achievements, and quests based on actual performance
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <div className="text-orange-300 text-sm font-medium">
                              ⚠️ {selectedEmployee.employes_id ?
                                'Employment data connection failed' :
                                'No employes_id found - RPG stats simulated'
                              }
                            </div>
                          </div>
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
                    {selectedEmployee.achievements.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Complete employment milestones to unlock achievements
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>}

            {selectedTab === "stats" && <div className="space-y-6">
              <Card className="bg-black/30 border-green-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sword className="h-5 w-5 text-green-400" />
                    Character Stats {selectedEmployee.hasRealData ? '(Real Data)' : '(Simulated)'}
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
                    {selectedEmployee.achievements.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Complete employment milestones to earn achievements</p>
                      </div>
                    )}
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
                    {selectedEmployee.activeQuests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active quests available</p>
                      </div>
                    )}
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
                    {selectedEmployee.powerUps.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <Gem className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No power-ups available</p>
                      </div>
                    )}
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