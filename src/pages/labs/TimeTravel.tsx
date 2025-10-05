/**
 * ⏰ TIME TRAVEL - EMPLOYMENT HISTORY ANALYZER
 * Real employment timeline analysis with predictive scenarios
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Clock,
  FastForward,
  Rewind,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sparkles,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Database,
  Users
} from 'lucide-react';
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

interface TimelineEvent {
  id: string;
  date: Date;
  employeeId: string;
  employeeName: string;
  type: 'contract_start' | 'contract_end' | 'promotion' | 'salary_increase' | 'review' | 'training' | 'vacation' | 'sick_leave' | 'hours_change';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  probability: number;
  value?: number; // For salary increases, hours changes
  metadata?: any; // Additional event data
}

interface TimelineScenario {
  id: string;
  name: string;
  description: string;
  timelineEvents: TimelineEvent[];
  metrics: {
    employeeSatisfaction: number;
    productivity: number;
    retention: number;
    costs: number;
  };
  alterations: string[];
  basedOnRealData: boolean;
  dataStatus: 'connected' | 'missing' | 'error';
}

// Generate timeline events from real employment data
const generateTimelineEventsFromEmploymentData = (
  employmentHistory: any[],
  salaryHistory: any[],
  staffMember: RealStaffMember
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  let eventId = 1;

  // Generate events from employment history
  employmentHistory.forEach(emp => {
    // Contract start events
    events.push({
      id: `emp_start_${eventId++}`,
      date: new Date(emp.startDate),
      employeeId: staffMember.id,
      employeeName: staffMember.full_name,
      type: 'contract_start',
      description: `Employment started: ${emp.isPartTime ? 'Part-time' : 'Full-time'} position`,
      impact: 'positive',
      probability: 100, // Already happened
      metadata: { isPartTime: emp.isPartTime, hoursPerWeek: emp.hoursPerWeek }
    });

    // Contract end events (if exists)
    if (emp.endDate) {
      events.push({
        id: `emp_end_${eventId++}`,
        date: new Date(emp.endDate),
        employeeId: staffMember.id,
        employeeName: staffMember.full_name,
        type: 'contract_end',
        description: `Employment ended`,
        impact: 'negative',
        probability: 100, // Already happened
        metadata: { reason: emp.endReason || 'Unknown' }
      });
    }

    // Hours change events (part-time to full-time transitions)
    if (emp.hoursPerWeek && emp.hoursPerWeek !== emp.previousHours) {
      events.push({
        id: `hours_change_${eventId++}`,
        date: new Date(emp.startDate),
        employeeId: staffMember.id,
        employeeName: staffMember.full_name,
        type: 'hours_change',
        description: `Hours changed to ${emp.hoursPerWeek}/week`,
        impact: emp.hoursPerWeek > (emp.previousHours || 0) ? 'positive' : 'neutral',
        probability: 100,
        value: emp.hoursPerWeek,
        metadata: { previousHours: emp.previousHours, newHours: emp.hoursPerWeek }
      });
    }
  });

  // Generate events from salary history
  salaryHistory.forEach((salary, index) => {
    events.push({
      id: `salary_${eventId++}`,
      date: new Date(salary.startDate),
      employeeId: staffMember.id,
      employeeName: staffMember.full_name,
      type: 'salary_increase',
      description: index === 0
        ? `Initial salary: €${salary.hourlyWage}/hour`
        : `Salary increase to €${salary.hourlyWage}/hour`,
      impact: index === 0 ? 'neutral' : 'positive',
      probability: 100, // Already happened
      value: salary.hourlyWage,
      metadata: {
        scale: salary.scale,
        step: salary.trede,
        previousWage: index > 0 ? salaryHistory[index - 1].hourlyWage : null
      }
    });
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Generate predictive scenario based on employment patterns
const generatePredictiveScenario = (
  currentEvents: TimelineEvent[],
  staffMember: RealStaffMember,
  employmentHistory: any[],
  salaryHistory: any[]
): TimelineScenario => {
  const metrics = {
    employeeSatisfaction: 75,
    productivity: 85,
    retention: 90,
    costs: 50000
  };

  const alterations: string[] = [];

  // Analyze patterns for predictions
  let predictedEvents = [...currentEvents];
  let eventId = 1000;

  // Predict next salary increase if pattern exists
  if (salaryHistory.length > 1) {
    const avgIncreasePeriod = calculateAverageIncreasePeriod(salaryHistory);
    const lastIncrease = salaryHistory[salaryHistory.length - 1];
    const nextIncreaseDate = new Date(lastIncrease.startDate);
    nextIncreaseDate.setMonth(nextIncreaseDate.getMonth() + avgIncreasePeriod);

    if (nextIncreaseDate > new Date()) {
      const avgIncrease = calculateAverageIncreasePercentage(salaryHistory);
      const predictedWage = lastIncrease.hourlyWage * (1 + avgIncrease);

      predictedEvents.push({
        id: `predicted_salary_${eventId++}`,
        date: nextIncreaseDate,
        employeeId: staffMember.id,
        employeeName: staffMember.full_name,
        type: 'salary_increase',
        description: `Predicted salary increase to €${predictedWage.toFixed(2)}/hour`,
        impact: 'positive',
        probability: Math.min(85, 60 + (salaryHistory.length * 10)), // Higher probability with more history
        value: predictedWage,
        metadata: { predicted: true, basedOnPattern: true }
      });

      alterations.push(`Predicted salary increase: +${(avgIncrease * 100).toFixed(1)}%`);
      metrics.employeeSatisfaction += 15;
      metrics.costs += (predictedWage - lastIncrease.hourlyWage) * 40 * 52; // Weekly hours * weeks
    }
  }

  // Predict contract renewal if on fixed-term
  const currentEmployment = employmentHistory.find(emp => !emp.endDate);
  if (currentEmployment && currentEmployment.contractType === 'fixed') {
    const contractEndDate = new Date(currentEmployment.startDate);
    contractEndDate.setFullYear(contractEndDate.getFullYear() + 1); // Assume 1-year contracts

    if (contractEndDate > new Date()) {
      predictedEvents.push({
        id: `predicted_renewal_${eventId++}`,
        date: contractEndDate,
        employeeId: staffMember.id,
        employeeName: staffMember.full_name,
        type: 'contract_start',
        description: 'Predicted contract renewal',
        impact: 'positive',
        probability: calculateRenewalProbability(employmentHistory, salaryHistory),
        metadata: { predicted: true, contractType: 'renewal' }
      });

      alterations.push('Contract renewal strategy implemented');
      metrics.retention += 10;
    }
  }

  // Predict performance review
  const nextReviewDate = new Date();
  nextReviewDate.setMonth(nextReviewDate.getMonth() + 6); // 6-month cycles

  predictedEvents.push({
    id: `predicted_review_${eventId++}`,
    date: nextReviewDate,
    employeeId: staffMember.id,
    employeeName: staffMember.full_name,
    type: 'review',
    description: 'Scheduled performance review',
    impact: 'positive',
    probability: 95,
    metadata: { predicted: true, reviewType: 'six_month' }
  });

  return {
    id: 'ai_prediction',
    name: 'AI Employment Prediction',
    description: 'Predictive timeline based on real employment patterns',
    timelineEvents: predictedEvents,
    metrics,
    alterations,
    basedOnRealData: true,
    dataStatus: 'connected'
  };
};

// Calculate average time between salary increases
const calculateAverageIncreasePeriod = (salaryHistory: any[]): number => {
  if (salaryHistory.length < 2) return 12; // Default 12 months

  const periods = [];
  for (let i = 1; i < salaryHistory.length; i++) {
    const prev = new Date(salaryHistory[i - 1].startDate);
    const curr = new Date(salaryHistory[i].startDate);
    const months = (curr.getFullYear() - prev.getFullYear()) * 12 + (curr.getMonth() - prev.getMonth());
    periods.push(months);
  }

  return periods.reduce((sum, period) => sum + period, 0) / periods.length;
};

// Calculate average salary increase percentage
const calculateAverageIncreasePercentage = (salaryHistory: any[]): number => {
  if (salaryHistory.length < 2) return 0.1; // Default 10%

  const increases = [];
  for (let i = 1; i < salaryHistory.length; i++) {
    const increase = (salaryHistory[i].hourlyWage - salaryHistory[i - 1].hourlyWage) / salaryHistory[i - 1].hourlyWage;
    increases.push(increase);
  }

  return increases.reduce((sum, inc) => sum + inc, 0) / increases.length;
};

// Calculate contract renewal probability
const calculateRenewalProbability = (employmentHistory: any[], salaryHistory: any[]): number => {
  let probability = 70; // Base probability

  // Increase probability for salary growth
  if (salaryHistory.length > 1) {
    probability += Math.min(20, salaryHistory.length * 5);
  }

  // Increase for employment stability
  const totalYears = employmentHistory.reduce((sum, emp) => {
    const start = new Date(emp.startDate);
    const end = emp.endDate ? new Date(emp.endDate) : new Date();
    return sum + (end.getFullYear() - start.getFullYear());
  }, 0);

  probability += Math.min(15, totalYears * 3);

  return Math.min(95, probability);
};

// Convert real staff data to Timeline Scenario
const convertToTimelineScenario = async (staff: RealStaffMember): Promise<TimelineScenario[]> => {
  if (!staff.employes_id) {
    return [{
      id: 'no_data',
      name: 'Missing Data Timeline',
      description: 'No employment data available - connect to Employes.nl',
      timelineEvents: [{
        id: 'missing_data_event',
        date: new Date(),
        employeeId: staff.id,
        employeeName: staff.full_name,
        type: 'training',
        description: 'Connect to Employes.nl to unlock real employment timeline',
        impact: 'neutral',
        probability: 100
      }],
      metrics: { employeeSatisfaction: 0, productivity: 0, retention: 0, costs: 0 },
      alterations: ['Connect employes_id to unlock features'],
      basedOnRealData: false,
      dataStatus: 'missing'
    }];
  }

  try {
    // Import the same functions used elsewhere for real data
    const { fetchEmployesProfile } = await import('@/lib/employesProfile');
    const employesData = await fetchEmployesProfile(staff.id);

    if (!employesData || !employesData.rawDataAvailable) {
      return [{
        id: 'connection_error',
        name: 'Connection Error Timeline',
        description: 'Failed to connect to Employes.nl employment data',
        timelineEvents: [{
          id: 'connection_error_event',
          date: new Date(),
          employeeId: staff.id,
          employeeName: staff.full_name,
          type: 'training',
          description: 'Employment data connection failed - check Employes.nl sync',
          impact: 'negative',
          probability: 100
        }],
        metrics: { employeeSatisfaction: 0, productivity: 0, retention: 0, costs: 0 },
        alterations: ['Fix Employes.nl connection'],
        basedOnRealData: false,
        dataStatus: 'error'
      }];
    }

    // Generate real timeline events
    const timelineEvents = generateTimelineEventsFromEmploymentData(
      employesData.employments,
      employesData.salaryHistory,
      staff
    );

    // Calculate metrics from real data
    const metrics = {
      employeeSatisfaction: calculateSatisfactionFromData(employesData.employments, employesData.salaryHistory),
      productivity: calculateProductivityFromData(employesData.employments, employesData.salaryHistory),
      retention: calculateRetentionFromData(employesData.employments),
      costs: calculateTotalCostsFromData(employesData.salaryHistory, employesData.employments)
    };

    const originalScenario: TimelineScenario = {
      id: 'real_timeline',
      name: 'Real Employment History',
      description: 'Actual employment timeline from Employes.nl data',
      timelineEvents,
      metrics,
      alterations: [],
      basedOnRealData: true,
      dataStatus: 'connected'
    };

    // Generate predictive scenario
    const predictiveScenario = generatePredictiveScenario(
      timelineEvents,
      staff,
      employesData.employments,
      employesData.salaryHistory
    );

    return [originalScenario, predictiveScenario];

  } catch (error) {
    console.warn('Failed to generate timeline for', staff.full_name, error);
    return [{
      id: 'error_timeline',
      name: 'System Error Timeline',
      description: 'Error processing employment data',
      timelineEvents: [],
      metrics: { employeeSatisfaction: 0, productivity: 0, retention: 0, costs: 0 },
      alterations: ['System error occurred'],
      basedOnRealData: false,
      dataStatus: 'error'
    }];
  }
};

// Calculate satisfaction score from employment data
const calculateSatisfactionFromData = (employments: any[], salaryHistory: any[]): number => {
  let score = 50; // Base score

  // Increase for salary growth
  if (salaryHistory.length > 1) {
    const growth = (salaryHistory[salaryHistory.length - 1].hourlyWage - salaryHistory[0].hourlyWage) / salaryHistory[0].hourlyWage;
    score += Math.min(30, growth * 100);
  }

  // Increase for employment stability
  const hasCurrentJob = employments.some(emp => !emp.endDate);
  if (hasCurrentJob) score += 20;

  return Math.min(100, Math.max(0, score));
};

// Calculate productivity score from employment data
const calculateProductivityFromData = (employments: any[], salaryHistory: any[]): number => {
  let score = 60; // Base score

  // Increase for tenure
  const totalDuration = employments.reduce((sum, emp) => {
    const start = new Date(emp.startDate);
    const end = emp.endDate ? new Date(emp.endDate) : new Date();
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);

  score += Math.min(25, totalDuration * 5);

  // Increase for salary progression (indicates performance)
  score += Math.min(15, salaryHistory.length * 3);

  return Math.min(100, Math.max(0, score));
};

// Calculate retention score from employment data
const calculateRetentionFromData = (employments: any[]): number => {
  const hasCurrentEmployment = employments.some(emp => !emp.endDate);
  if (!hasCurrentEmployment) return 10; // Low if not currently employed

  const currentEmployment = employments.find(emp => !emp.endDate);
  const employmentYears = (Date.now() - new Date(currentEmployment.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);

  return Math.min(95, 70 + (employmentYears * 10));
};

// Calculate total costs from employment data
const calculateTotalCostsFromData = (salaryHistory: any[], employments: any[]): number => {
  if (!salaryHistory.length) return 0;

  const currentSalary = salaryHistory[salaryHistory.length - 1];
  const currentEmployment = employments.find(emp => !emp.endDate);
  const hoursPerWeek = currentEmployment?.hoursPerWeek || 40;

  return Math.floor(currentSalary.hourlyWage * hoursPerWeek * 52); // Annual cost
};

const TimeTravel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedScenario, setSelectedScenario] = useState<string>('real_timeline');
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(50);
  const [selectedStaff, setSelectedStaff] = useState<RealStaffMember | null>(null);
  const [scenarios, setScenarios] = useState<TimelineScenario[]>([]);

  // 🔥 REAL DATA: Load staff from database
  const { data: realStaff = [], isLoading: isLoadingStaff } = useQuery<RealStaffMember[]>({
    queryKey: ['timetravel-staff'],
    queryFn: async () => {
      console.log('⏰ Time Travel: Loading real staff from database...');

      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, role, location, employes_id, email, last_sync_at')
        .order('full_name');

      if (error) {
        console.error('❌ Failed to load staff for Time Travel:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} staff members for timeline analysis`);
      return data as RealStaffMember[];
    }
  });

  // Load timeline scenarios when staff is selected
  useEffect(() => {
    if (!selectedStaff) return;

    const loadScenarios = async () => {
      console.log('⏰ Generating timeline scenarios for:', selectedStaff.full_name);
      const staffScenarios = await convertToTimelineScenario(selectedStaff);
      setScenarios(staffScenarios);

      // Auto-select first scenario
      if (staffScenarios.length > 0) {
        setSelectedScenario(staffScenarios[0].id);
      }
    };

    loadScenarios();
  }, [selectedStaff]);

  // Set default staff selection
  useEffect(() => {
    if (!selectedStaff && realStaff.length > 0) {
      setSelectedStaff(realStaff[0]);
    }
  }, [realStaff, selectedStaff]);

  const getCurrentScenario = () => scenarios.find(s => s.id === selectedScenario) || scenarios[0];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelinePosition(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + (timeSpeed * 0.5);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeSpeed]);

  const resetTimeline = () => {
    setTimelinePosition(0);
    setIsPlaying(false);
  };

  const getEventsByPosition = (position: number) => {
    const scenario = getCurrentScenario();
    if (!scenario) return [];

    const now = new Date();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const timelineEnd = new Date(now.getTime() + oneYear);
    const timelineStart = new Date(now.getTime() - oneYear);

    const totalTimespan = timelineEnd.getTime() - timelineStart.getTime();
    const currentTime = timelineStart.getTime() + (position / 100) * totalTimespan;
    const currentSimDate = new Date(currentTime);

    return scenario.timelineEvents.filter(event =>
      event.date <= currentSimDate
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getDataStatusBadge = (scenario: TimelineScenario) => {
    if (scenario.dataStatus === 'connected') {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <Database className="h-3 w-3 mr-1" />
          Real Data
        </Badge>
      );
    } else if (scenario.dataStatus === 'missing') {
      return (
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          <Zap className="h-3 w-3 mr-1" />
          Missing
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }
  };

  if (isLoadingStaff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-purple-300">Loading real staff data for timeline analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  const scenario = getCurrentScenario();
  const visibleEvents = scenario ? getEventsByPosition(timelinePosition) : [];

  return (
    <div className="space-y-6">
      {/* Header & Staff Selection */}
      <Card className="bg-gray-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Clock className="h-5 w-5" />
            Employment Time Travel Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Select Employee</label>
              <select
                value={selectedStaff?.id || ''}
                onChange={(e) => {
                  const staff = realStaff.find(s => s.id === e.target.value);
                  setSelectedStaff(staff || null);
                }}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="">Select an employee...</option>
                {realStaff.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.full_name} - {staff.role || 'Unknown Role'}
                  </option>
                ))}
              </select>
            </div>

            {selectedStaff && (
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Employee Info</label>
                <div className="p-2 bg-gray-800 border border-gray-600 rounded">
                  <div className="text-white font-medium">{selectedStaff.full_name}</div>
                  <div className="text-sm text-gray-400">{selectedStaff.role || 'Unknown Role'}</div>
                  <div className="text-xs text-gray-500">
                    {selectedStaff.employes_id ? '✅ Connected to Employes.nl' : '⚠️ No Employes ID'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Control Panel */}
      <Card className="bg-gray-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Clock className="h-5 w-5" />
            Temporal Navigation Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 10))}
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                >
                  <Rewind className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimelinePosition(Math.min(100, timelinePosition + 10))}
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
                >
                  <FastForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTimeline}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Timeline Position</label>
                <Progress value={timelinePosition} className="h-2" />
                <div className="text-xs text-gray-400">
                  Position: {Math.floor(timelinePosition)}%
                </div>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-4">
              <label className="text-sm text-gray-300">Time Speed</label>
              <div className="space-y-2">
                <Slider
                  value={[timeSpeed]}
                  onValueChange={(value) => setTimeSpeed(value[0])}
                  max={5}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">
                  {timeSpeed}x speed
                </div>
              </div>
            </div>

            {/* Current Metrics */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Timeline Metrics</h4>
              {scenario ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-green-400">Satisfaction: {scenario.metrics.employeeSatisfaction}%</div>
                  <div className="text-blue-400">Productivity: {scenario.metrics.productivity}%</div>
                  <div className="text-purple-400">Retention: {scenario.metrics.retention}%</div>
                  <div className="text-yellow-400">Costs: €{scenario.metrics.costs.toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">Select an employee to view metrics</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      {scenarios.length > 0 && (
        <Card className="bg-gray-900/90 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-300">
              <Sparkles className="h-5 w-5" />
              Timeline Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedScenario === scenario.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{scenario.name}</h4>
                      {getDataStatusBadge(scenario)}
                    </div>
                    <p className="text-sm text-gray-400">{scenario.description}</p>

                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-green-400">📈 {scenario.metrics.productivity}%</div>
                      <div className="text-purple-400">💼 {scenario.metrics.retention}%</div>
                    </div>

                    {scenario.alterations.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-yellow-400">Predictions:</div>
                        {scenario.alterations.slice(0, 2).map((alt, i) => (
                          <div key={i} className="text-xs text-gray-400">• {alt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Events */}
      <Card className="bg-gray-900/90 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-300">
            <Calendar className="h-5 w-5" />
            Timeline Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No events visible at current timeline position</p>
                <p className="text-sm">Move the timeline forward to see future events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-700 bg-gray-800/50"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        event.impact === 'positive' ? 'bg-green-400' :
                        event.impact === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                      }`} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{event.employeeName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                        {event.metadata?.predicted && (
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                            Predicted
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{event.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={getImpactColor(event.impact)}>
                          {event.probability}% probability
                        </span>
                        {event.value && (
                          <>
                            <span>•</span>
                            <span className="text-green-400">€{event.value.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {event.impact === 'positive' && <TrendingUp className="h-4 w-4 text-green-400" />}
                      {event.impact === 'negative' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                      {event.impact === 'neutral' && <Zap className="h-4 w-4 text-yellow-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact Analysis */}
      {scenario && (
        <Card className="bg-gray-900/90 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-300">
              <TrendingUp className="h-5 w-5" />
              Employment Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(scenario.metrics).map(([key, value]) => (
                <div key={key} className="text-center space-y-2">
                  <div className="text-sm text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {key === 'costs' ? `€${value.toLocaleString()}` : `${value}%`}
                  </div>
                  <Progress
                    value={key === 'costs' ? Math.min(100, (value / 100000) * 100) : value}
                    className="h-2"
                  />
                </div>
              ))}
            </div>

            {scenario.alterations.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-gray-300">
                  {scenario.basedOnRealData ? 'Predictions' : 'Alterations'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scenario.alterations.map((alteration, index) => (
                    <div key={index} className="text-sm text-cyan-300 flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      {alteration}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Connection Status */}
            <div className="mt-6 p-3 bg-black/30 rounded-lg">
              {scenario.basedOnRealData ? (
                <div className="text-green-300 text-sm">
                  ✅ Timeline generated from real employment data via Employes.nl
                </div>
              ) : (
                <div className="text-orange-300 text-sm">
                  ⚠️ {scenario.dataStatus === 'missing' ?
                    'Connect to Employes.nl for real timeline analysis' :
                    'Fix data connection to unlock real timeline features'
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimeTravel;