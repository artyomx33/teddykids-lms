import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Coffee,
  Zap,
  Users,
  Calendar,
  Clock,
  Smile,
  Frown,
  Meh,
  Battery,
  Target,
  Shield,
  Bell
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  currentMood: number; // 0-100
  stressLevel: number; // 0-100
  energyLevel: number; // 0-100
  workload: number; // 0-100
  lastBreak: Date;
  predictedBurnout: number; // days until potential burnout
  alerts: MoodAlert[];
}

interface MoodAlert {
  id: string;
  type: 'stress' | 'fatigue' | 'overwork' | 'breakthrough' | 'burnout_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
  predictedIn: number; // hours
  confidence: number; // percentage
}

interface Department {
  id: string;
  name: string;
  members: TeamMember[];
  averageMood: number;
  averageStress: number;
  averageEnergy: number;
  riskScore: number;
  color: string;
}

const TeamMoodMapping = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [alertsVisible, setAlertsVisible] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(true);

  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Developer',
      department: 'Engineering',
      currentMood: 45,
      stressLevel: 78,
      energyLevel: 32,
      workload: 92,
      lastBreak: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      predictedBurnout: 3,
      alerts: [
        {
          id: 'a1',
          type: 'burnout_risk',
          severity: 'critical',
          message: 'High burnout risk detected',
          suggestion: 'Immediate 30-minute break recommended. Consider redistributing workload.',
          predictedIn: 2,
          confidence: 87
        },
        {
          id: 'a2',
          type: 'overwork',
          severity: 'high',
          message: 'Extended work session without breaks',
          suggestion: 'Schedule mandatory break in next hour',
          predictedIn: 1,
          confidence: 94
        }
      ]
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'UX Designer',
      department: 'Design',
      currentMood: 82,
      stressLevel: 35,
      energyLevel: 88,
      workload: 65,
      lastBreak: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      predictedBurnout: 28,
      alerts: [
        {
          id: 'a3',
          type: 'breakthrough',
          severity: 'low',
          message: 'Creative peak detected',
          suggestion: 'Optimal time for complex design tasks',
          predictedIn: 0,
          confidence: 76
        }
      ]
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      role: 'Project Manager',
      department: 'Management',
      currentMood: 68,
      stressLevel: 55,
      energyLevel: 72,
      workload: 78,
      lastBreak: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      predictedBurnout: 12,
      alerts: [
        {
          id: 'a4',
          type: 'stress',
          severity: 'medium',
          message: 'Gradual stress increase detected',
          suggestion: 'Consider delegation or break in next 2 hours',
          predictedIn: 4,
          confidence: 71
        }
      ]
    },
    {
      id: '4',
      name: 'Alex Kim',
      role: 'Backend Developer',
      department: 'Engineering',
      currentMood: 75,
      stressLevel: 42,
      energyLevel: 79,
      workload: 68,
      lastBreak: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      predictedBurnout: 18,
      alerts: []
    },
    {
      id: '5',
      name: 'Lisa Park',
      role: 'QA Engineer',
      department: 'Engineering',
      currentMood: 58,
      stressLevel: 63,
      energyLevel: 54,
      workload: 85,
      lastBreak: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      predictedBurnout: 7,
      alerts: [
        {
          id: 'a5',
          type: 'fatigue',
          severity: 'medium',
          message: 'Energy levels declining',
          suggestion: 'Quick 15-minute energizing break recommended',
          predictedIn: 1,
          confidence: 82
        }
      ]
    }
  ];

  const departments: Department[] = [
    {
      id: 'engineering',
      name: 'Engineering',
      members: mockTeamMembers.filter(m => m.department === 'Engineering'),
      averageMood: 59,
      averageStress: 61,
      averageEnergy: 55,
      riskScore: 73,
      color: 'bg-blue-500'
    },
    {
      id: 'design',
      name: 'Design',
      members: mockTeamMembers.filter(m => m.department === 'Design'),
      averageMood: 82,
      averageStress: 35,
      averageEnergy: 88,
      riskScore: 25,
      color: 'bg-purple-500'
    },
    {
      id: 'management',
      name: 'Management',
      members: mockTeamMembers.filter(m => m.department === 'Management'),
      averageMood: 68,
      averageStress: 55,
      averageEnergy: 72,
      riskScore: 45,
      color: 'bg-green-500'
    }
  ];

  const getAllAlerts = () => {
    return mockTeamMembers.flatMap(member =>
      member.alerts.map(alert => ({ ...alert, memberName: member.name, memberId: member.id }))
    ).sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const getFilteredMembers = () => {
    if (selectedDepartment === 'all') return mockTeamMembers;
    return mockTeamMembers.filter(m => m.department.toLowerCase() === selectedDepartment);
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 70) return <Smile className="h-4 w-4 text-green-400" />;
    if (mood >= 40) return <Meh className="h-4 w-4 text-yellow-400" />;
    return <Frown className="h-4 w-4 text-red-400" />;
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-300';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-300';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
      default: return 'border-blue-500 bg-blue-500/10 text-blue-300';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'burnout_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'stress': return <Zap className="h-4 w-4" />;
      case 'fatigue': return <Battery className="h-4 w-4" />;
      case 'overwork': return <Clock className="h-4 w-4" />;
      case 'breakthrough': return <Target className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const criticalAlerts = getAllAlerts().filter(alert => alert.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && alertsVisible && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <div className="flex items-center justify-between">
              <div>
                <strong>Critical Alert:</strong> {criticalAlerts.length} team member(s) need immediate attention!
                <div className="mt-1 text-sm">
                  {criticalAlerts.map(alert => alert.memberName).join(', ')} - Take action now to prevent burnout.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAlertsVisible(false)}
                className="border-red-500/50 text-red-300 hover:bg-red-500/20"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card className="bg-gray-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Brain className="h-5 w-5" />
            Team Emotion Mapping Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">Department:</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={`border-green-500/50 ${realTimeMode ? 'bg-green-500/20 text-green-300' : 'text-green-300'}`}
              >
                <Zap className="h-4 w-4 mr-2" />
                {realTimeMode ? 'Real-time ON' : 'Real-time OFF'}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Heart className="h-4 w-4 text-red-400" />
              <span>Live monitoring {mockTeamMembers.length} team members</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Overview */}
      {!loading && (
        <Card className="bg-gray-900/90 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-300">
            <Users className="h-5 w-5" />
            Department Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedDepartment === dept.id.toLowerCase() || selectedDepartment === 'all'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedDepartment(dept.id.toLowerCase())}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{dept.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-gray-400">Mood</div>
                      <div className="flex items-center gap-1">
                        {getMoodIcon(dept.averageMood)}
                        <span className="text-white">{dept.averageMood}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Risk</div>
                      <div className={`text-sm font-medium ${
                        dept.riskScore >= 70 ? 'text-red-400' :
                        dept.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {dept.riskScore}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Stress Level</span>
                      <span>{dept.averageStress}%</span>
                    </div>
                    <Progress value={dept.averageStress} className="h-1" />
                  </div>

                  <div className="text-xs text-gray-400">
                    {dept.members.length} team member{dept.members.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        </Card>
      )}

      {/* Team Member Details */}
      {!loading && (
        <Card className="bg-gray-900/90 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-300">
              <Heart className="h-5 w-5" />
              Individual Team Member Status
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {getFilteredMembers().map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-lg border border-gray-700 bg-gray-800/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getMoodIcon(member.currentMood)}
                        <h4 className="font-medium text-white">{member.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {member.department}
                      </Badge>

                      {teamMembers.length > 0 && (
                        <Badge className={`text-xs ${
                          member.dataStatus === 'connected' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          member.dataStatus === 'missing' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          <Database className="h-3 w-3 mr-1" />
                          {member.dataStatus === 'connected' ? 'Connected' :
                           member.dataStatus === 'missing' ? 'Missing Data' : 'Error'}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400">Mood</div>
                        <div className="text-sm font-medium text-white">{member.currentMood}%</div>
                        <Progress value={member.currentMood} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400">Stress</div>
                        <div className="text-sm font-medium text-white">{member.stressLevel}%</div>
                        <Progress value={member.stressLevel} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400">Energy</div>
                        <div className="text-sm font-medium text-white">{member.energyLevel}%</div>
                        <Progress value={member.energyLevel} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400">Workload</div>
                        <div className="text-sm font-medium text-white">{member.workload}%</div>
                        <Progress value={member.workload} className="h-1" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Coffee className="h-3 w-3" />
                        <span>Last break: {Math.floor((Date.now() - member.lastBreak.getTime()) / (1000 * 60 * 60))}h ago</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        <span>Burnout risk: {member.predictedBurnout} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    {member.alerts.length > 0 && (
                      <Badge variant="outline" className="text-orange-300 border-orange-500/50">
                        {member.alerts.length} alert{member.alerts.length !== 1 ? 's' : ''}
                      </Badge>
                    )}

                    {teamMembers.length > 0 && member.dataStatus === 'missing' && (
                      <div className="text-xs text-orange-400 mt-2">
                        Missing Data Connect →
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Prediction Alerts */}
      {!loading && (
        <Card className="bg-gray-900/90 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-300">
              <Shield className="h-5 w-5" />
              Proactive Mood Prediction Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-3">
            {getAllAlerts().length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All team members are in good emotional health!</p>
                <p className="text-sm">No immediate alerts or interventions needed.</p>
              </div>
            ) : (
              getAllAlerts().map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.memberName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity} priority
                          </Badge>
                        </div>
                        <div className="text-xs opacity-75">
                          {alert.predictedIn === 0 ? 'Now' : `In ${alert.predictedIn}h`} • {alert.confidence}% confidence
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-sm opacity-75">{alert.suggestion}</p>
                      </div>

                      {alert.severity === 'critical' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            Send Break Notification
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/50 text-red-300">
                            Redistribute Tasks
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamMoodMapping;