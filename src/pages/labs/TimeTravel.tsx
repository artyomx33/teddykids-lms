import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Clock, FastForward, Rewind, Play, Pause, RotateCcw, Zap, Sparkles, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: Date;
  employeeId: string;
  employeeName: string;
  type: 'contract_start' | 'contract_end' | 'promotion' | 'salary_increase' | 'review' | 'training' | 'vacation' | 'sick_leave';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  probability: number;
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
}

const TimeTravel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedScenario, setSelectedScenario] = useState<string>('original');
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(50);

  const mockScenarios: TimelineScenario[] = [
    {
      id: 'original',
      name: 'Original Timeline',
      description: 'Current trajectory without interventions',
      timelineEvents: [
        {
          id: '1',
          date: new Date('2024-10-15'),
          employeeId: '1',
          employeeName: 'Sarah Johnson',
          type: 'review',
          description: 'Quarterly performance review scheduled',
          impact: 'positive',
          probability: 95
        },
        {
          id: '2',
          date: new Date('2024-11-01'),
          employeeId: '2',
          employeeName: 'Mike Chen',
          type: 'contract_end',
          description: 'Contract expires, potential resignation risk',
          impact: 'negative',
          probability: 78
        },
        {
          id: '3',
          date: new Date('2024-12-01'),
          employeeId: '3',
          employeeName: 'Emma Rodriguez',
          type: 'promotion',
          description: 'Promotion to Senior Developer',
          impact: 'positive',
          probability: 85
        }
      ],
      metrics: {
        employeeSatisfaction: 72,
        productivity: 85,
        retention: 88,
        costs: 245000
      },
      alterations: []
    },
    {
      id: 'intervention_a',
      name: 'Early Intervention Alpha',
      description: 'Proactive salary adjustment and training programs',
      timelineEvents: [
        {
          id: '4',
          date: new Date('2024-10-10'),
          employeeId: '2',
          employeeName: 'Mike Chen',
          type: 'salary_increase',
          description: 'Preemptive 12% salary increase to prevent resignation',
          impact: 'positive',
          probability: 92
        },
        {
          id: '5',
          date: new Date('2024-10-20'),
          employeeId: '2',
          employeeName: 'Mike Chen',
          type: 'training',
          description: 'Advanced React certification program enrollment',
          impact: 'positive',
          probability: 88
        },
        {
          id: '6',
          date: new Date('2024-11-01'),
          employeeId: '2',
          employeeName: 'Mike Chen',
          type: 'contract_start',
          description: 'Contract renewal with improved terms',
          impact: 'positive',
          probability: 94
        }
      ],
      metrics: {
        employeeSatisfaction: 89,
        productivity: 92,
        retention: 96,
        costs: 265000
      },
      alterations: ['Salary increase: +€4,800/year', 'Training investment: €2,500', 'Retention bonus: €3,000']
    },
    {
      id: 'quantum_leap',
      name: 'Quantum Leap Protocol',
      description: 'Maximum timeline optimization with AI-driven decisions',
      timelineEvents: [
        {
          id: '7',
          date: new Date('2024-10-05'),
          employeeId: 'all',
          employeeName: 'All Staff',
          type: 'training',
          description: 'AI-optimized skill enhancement program launch',
          impact: 'positive',
          probability: 97
        },
        {
          id: '8',
          date: new Date('2024-10-12'),
          employeeId: '4',
          employeeName: 'Lisa Park',
          type: 'promotion',
          description: 'Accelerated promotion to prevent competitor poaching',
          impact: 'positive',
          probability: 91
        },
        {
          id: '9',
          date: new Date('2024-11-15'),
          employeeId: 'team',
          employeeName: 'Development Team',
          type: 'contract_start',
          description: 'Team-wide contract optimization and perks upgrade',
          impact: 'positive',
          probability: 98
        }
      ],
      metrics: {
        employeeSatisfaction: 94,
        productivity: 118,
        retention: 99,
        costs: 285000
      },
      alterations: ['AI optimization: +15% productivity', 'Team perks: €8,000/month', 'Quantum analytics: €12,000 setup']
    }
  ];

  const getCurrentScenario = () => mockScenarios.find(s => s.id === selectedScenario) || mockScenarios[0];

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
    const totalDays = 90; // 3 months simulation
    const currentDay = Math.floor((position / 100) * totalDays);
    const currentSimDate = new Date();
    currentSimDate.setDate(currentSimDate.getDate() + currentDay);

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

  const scenario = getCurrentScenario();
  const visibleEvents = getEventsByPosition(timelinePosition);

  return (
    <div className="space-y-6">
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
                  Day {Math.floor((timelinePosition / 100) * 90)} of 90
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
              <h4 className="text-sm font-medium text-gray-300">Current Timeline Metrics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-green-400">Satisfaction: {scenario.metrics.employeeSatisfaction}%</div>
                <div className="text-blue-400">Productivity: {scenario.metrics.productivity}%</div>
                <div className="text-purple-400">Retention: {scenario.metrics.retention}%</div>
                <div className="text-yellow-400">Costs: €{scenario.metrics.costs.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <Card className="bg-gray-900/90 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-300">
            <Sparkles className="h-5 w-5" />
            Timeline Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockScenarios.map((scenario) => (
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
                  <h4 className="font-medium text-white">{scenario.name}</h4>
                  <p className="text-sm text-gray-400">{scenario.description}</p>

                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="text-green-400">📈 {scenario.metrics.productivity}%</div>
                    <div className="text-purple-400">💼 {scenario.metrics.retention}%</div>
                  </div>

                  {scenario.alterations.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-yellow-400">Alterations:</div>
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
                      </div>
                      <p className="text-sm text-gray-300">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{event.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={getImpactColor(event.impact)}>
                          {event.probability}% probability
                        </span>
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

      {/* Scenario Comparison */}
      <Card className="bg-gray-900/90 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-300">
            <TrendingUp className="h-5 w-5" />
            Impact Analysis
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
                  value={key === 'costs' ? (value / 300000) * 100 : value}
                  className="h-2"
                />
              </div>
            ))}
          </div>

          {scenario.alterations.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Timeline Alterations</h4>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTravel;