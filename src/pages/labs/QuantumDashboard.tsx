/**
 * 🔮 QUANTUM DASHBOARD
 * Probability states and future predictions - mind-bending visualization!
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Atom,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Sparkles,
  RotateCcw,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  Brain,
  Activity,
  AlertTriangle
} from "lucide-react";
import { stateTracker } from "@/lib/labs/state-tracker";
import type { QuantumState } from "@/lib/labs/state-tracker";

// Mock quantum states for employees
const mockQuantumStates = [
  {
    id: "1",
    name: "Sarah Johnson",
    position: "Marketing Specialist",
    quantumState: {
      entityId: "1",
      probabilities: {
        contract_renewal: 0.87,
        salary_increase: 0.45,
        hours_increase: 0.67,
        role_promotion: 0.23,
        termination_risk: 0.08,
        satisfaction_high: 0.89,
      },
      entanglement: {
        "2": 0.72, // John Smith
        "3": 0.34, // Lisa Chen
        "4": 0.91, // Mike Davis
      },
      confidence: 0.84,
      lastCollapse: new Date('2024-12-15'),
    },
    recentChanges: ["salary_increase", "performance_review"],
    timeline: {
      "1_month": { renewal: 0.85, satisfaction: 0.92 },
      "3_months": { renewal: 0.87, satisfaction: 0.89 },
      "6_months": { renewal: 0.89, satisfaction: 0.86 },
      "1_year": { renewal: 0.92, satisfaction: 0.84 },
    }
  },
  {
    id: "2",
    name: "John Smith",
    position: "Senior Developer",
    quantumState: {
      entityId: "2",
      probabilities: {
        contract_renewal: 0.94,
        salary_increase: 0.78,
        hours_increase: 0.34,
        role_promotion: 0.67,
        termination_risk: 0.03,
        satisfaction_high: 0.76,
      },
      entanglement: {
        "1": 0.72,
        "3": 0.56,
        "4": 0.43,
      },
      confidence: 0.91,
      lastCollapse: new Date('2024-12-10'),
    },
    recentChanges: ["contract_renewal", "role_change"],
    timeline: {
      "1_month": { renewal: 0.93, satisfaction: 0.78 },
      "3_months": { renewal: 0.94, satisfaction: 0.76 },
      "6_months": { renewal: 0.96, satisfaction: 0.74 },
      "1_year": { renewal: 0.97, satisfaction: 0.72 },
    }
  },
  {
    id: "3",
    name: "Lisa Chen",
    position: "HR Manager",
    quantumState: {
      entityId: "3",
      probabilities: {
        contract_renewal: 0.56,
        salary_increase: 0.89,
        hours_increase: 0.23,
        role_promotion: 0.91,
        termination_risk: 0.34,
        satisfaction_high: 0.45,
      },
      entanglement: {
        "1": 0.34,
        "2": 0.56,
        "4": 0.28,
      },
      confidence: 0.67,
      lastCollapse: new Date('2024-12-20'),
    },
    recentChanges: ["performance_review", "hours_change", "manager_change"],
    timeline: {
      "1_month": { renewal: 0.52, satisfaction: 0.48 },
      "3_months": { renewal: 0.56, satisfaction: 0.45 },
      "6_months": { renewal: 0.61, satisfaction: 0.52 },
      "1_year": { renewal: 0.68, satisfaction: 0.58 },
    }
  },
  {
    id: "4",
    name: "Mike Davis",
    position: "Designer",
    quantumState: {
      entityId: "4",
      probabilities: {
        contract_renewal: 0.78,
        salary_increase: 0.56,
        hours_increase: 0.45,
        role_promotion: 0.34,
        termination_risk: 0.15,
        satisfaction_high: 0.82,
      },
      entanglement: {
        "1": 0.91,
        "2": 0.43,
        "3": 0.28,
      },
      confidence: 0.75,
      lastCollapse: new Date('2024-12-18'),
    },
    recentChanges: ["training_completion", "project_completion"],
    timeline: {
      "1_month": { renewal: 0.76, satisfaction: 0.84 },
      "3_months": { renewal: 0.78, satisfaction: 0.82 },
      "6_months": { renewal: 0.81, satisfaction: 0.80 },
      "1_year": { renewal: 0.85, satisfaction: 0.78 },
    }
  },
];

const probabilityLabels = {
  contract_renewal: "Contract Renewal",
  salary_increase: "Salary Increase",
  hours_increase: "Hours Increase",
  role_promotion: "Role Promotion",
  termination_risk: "Termination Risk",
  satisfaction_high: "High Satisfaction",
};

const probabilityColors = {
  contract_renewal: "bg-green-500",
  salary_increase: "bg-blue-500",
  hours_increase: "bg-purple-500",
  role_promotion: "bg-yellow-500",
  termination_risk: "bg-red-500",
  satisfaction_high: "bg-pink-500",
};

const probabilityIcons = {
  contract_renewal: RotateCcw,
  salary_increase: TrendingUp,
  hours_increase: Clock,
  role_promotion: Target,
  termination_risk: AlertTriangle,
  satisfaction_high: Sparkles,
};

export default function QuantumDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState(mockQuantumStates[0]);
  const [viewMode, setViewMode] = useState("probabilities");
  const [timeHorizon, setTimeHorizon] = useState("3_months");
  const [isCollapsing, setIsCollapsing] = useState(false);

  const collapseWaveFunction = async () => {
    setIsCollapsing(true);
    // Simulate quantum measurement collapse
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCollapsing(false);
  };

  const getProbabilityTrend = (probability: number) => {
    if (probability >= 0.8) return { icon: ArrowUp, color: "text-green-400", trend: "increasing" };
    if (probability >= 0.6) return { icon: Minus, color: "text-yellow-400", trend: "stable" };
    if (probability >= 0.4) return { icon: ArrowDown, color: "text-orange-400", trend: "decreasing" };
    return { icon: ArrowDown, color: "text-red-400", trend: "critical" };
  };

  const getEntanglementStrength = (strength: number) => {
    if (strength >= 0.8) return { color: "bg-green-500", label: "Strong" };
    if (strength >= 0.6) return { color: "bg-yellow-500", label: "Medium" };
    if (strength >= 0.4) return { color: "bg-orange-500", label: "Weak" };
    return { color: "bg-red-500", label: "Minimal" };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400";
    if (confidence >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600">
            <Atom className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Quantum Dashboard</h1>
            <p className="text-purple-300">
              Probability states and entangled future predictions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-blue-500/20 text-blue-300 border-blue-500/30"
          >
            <Brain className="h-3 w-3 mr-1" />
            Superposition Active
          </Badge>
          <Button
            onClick={collapseWaveFunction}
            disabled={isCollapsing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCollapsing ? (
              <>
                <Atom className="h-4 w-4 mr-2 animate-spin" />
                Collapsing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Collapse Wave Function
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
            <SelectItem value="probabilities">Probability States</SelectItem>
            <SelectItem value="entanglement">Quantum Entanglement</SelectItem>
            <SelectItem value="timeline">Timeline Projection</SelectItem>
            <SelectItem value="multiverse">Parallel Universes</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeHorizon} onValueChange={setTimeHorizon}>
          <SelectTrigger className="w-48 bg-black/30 border-purple-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1_month">1 Month</SelectItem>
            <SelectItem value="3_months">3 Months</SelectItem>
            <SelectItem value="6_months">6 Months</SelectItem>
            <SelectItem value="1_year">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Quantum States */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Quantum Entities</h3>
          {mockQuantumStates.map((employee) => (
            <Card
              key={employee.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedEmployee.id === employee.id
                  ? "bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20"
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
                    <Badge
                      variant="outline"
                      className={`${getConfidenceColor(employee.quantumState.confidence)} border-current`}
                    >
                      {Math.round(employee.quantumState.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>

                {/* Quick probability preview */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-300">Renewal:</span>
                    <span className="text-green-400 font-mono">
                      {Math.round(employee.quantumState.probabilities.contract_renewal * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-300">Risk:</span>
                    <span className="text-red-400 font-mono">
                      {Math.round(employee.quantumState.probabilities.termination_risk * 100)}%
                    </span>
                  </div>
                </div>

                {/* Wave function visualization */}
                <div className="mt-3 h-2 bg-purple-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 animate-pulse"
                    style={{ width: `${employee.quantumState.confidence * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Quantum Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {viewMode === "probabilities" && (
            <>
              {/* Probability States */}
              <Card className="bg-black/30 border-blue-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Atom className="h-5 w-5 text-blue-400" />
                    {selectedEmployee?.name} - Quantum Probability States
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(selectedEmployee.quantumState.probabilities).map(([key, probability]) => {
                      const trend = getProbabilityTrend(probability);
                      const Icon = probabilityIcons[key as keyof typeof probabilityIcons];
                      const color = probabilityColors[key as keyof typeof probabilityColors];

                      return (
                        <div
                          key={key}
                          className="p-4 bg-black/50 rounded-lg border border-purple-500/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded ${color}/20`}>
                                <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
                              </div>
                              <span className="text-white font-medium">
                                {probabilityLabels[key as keyof typeof probabilityLabels]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <trend.icon className={`h-4 w-4 ${trend.color}`} />
                              <span className="text-white font-mono font-bold">
                                {Math.round(probability * 100)}%
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={probability * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-purple-300 mt-1">
                            Wave function: {trend.trend}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Quantum Changes */}
              <Card className="bg-black/30 border-green-500/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Recent Wave Function Collapses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(selectedEmployee?.recentChanges || []).map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                      >
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-white font-medium">
                          {probabilityLabels[change as keyof typeof probabilityLabels] || change}
                        </span>
                        <Badge variant="outline" className="text-green-300 border-green-500/30 ml-auto">
                          Collapsed
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {viewMode === "entanglement" && (
            <Card className="bg-black/30 border-pink-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-pink-400" />
                  Quantum Entanglement Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(selectedEmployee?.quantumState.entanglement || {}).map(([empId, strength]) => {
                    const otherEmployee = mockQuantumStates.find(e => e.id === empId);
                    const entanglement = getEntanglementStrength(Number(strength));

                    if (!otherEmployee) return null;

                    return (
                      <div
                        key={empId}
                        className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-white font-medium">
                              {otherEmployee.name}
                            </div>
                            <div className="text-sm text-pink-300">
                              {otherEmployee.position}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-pink-300 border-pink-500/30"
                          >
                            {entanglement.label}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-pink-300">
                            <span>Entanglement Strength</span>
                            <span className="font-mono">{Math.round(Number(strength) * 100)}%</span>
                          </div>
                          <div className="w-full bg-pink-900/30 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${entanglement.color} transition-all duration-500`}
                              style={{ width: `${Number(strength) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-pink-400">
                            Spooky action at distance: When {selectedEmployee?.name} changes,
                            {otherEmployee.name} is affected with {Math.round(Number(strength) * 100)}% correlation
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === "timeline" && (
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  Temporal Probability Evolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(selectedEmployee?.timeline || {}).map(([timeKey, data]: [string, any]) => (
                    <div key={timeKey} className="space-y-3">
                      <h4 className="text-purple-300 font-medium capitalize">
                        {timeKey.replace('_', ' ')} Horizon
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="text-green-300 text-sm">Contract Renewal</div>
                          <div className="text-green-400 text-xl font-bold">
                            {Math.round((data?.renewal || 0) * 100)}%
                          </div>
                        </div>
                        <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                          <div className="text-pink-300 text-sm">Satisfaction</div>
                          <div className="text-pink-400 text-xl font-bold">
                            {Math.round((data?.satisfaction || 0) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === "multiverse" && (
            <Card className="bg-black/30 border-yellow-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-yellow-400" />
                  Parallel Universe Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      universe: "Alpha Timeline",
                      probability: 0.42,
                      outcome: "Salary increase → Full-time → Stays long-term",
                      impact: "+23% productivity, +€200/month cost"
                    },
                    {
                      universe: "Beta Timeline",
                      probability: 0.31,
                      outcome: "Role promotion → Team lead → Company growth",
                      impact: "+45% team efficiency, +€500/month cost"
                    },
                    {
                      universe: "Gamma Timeline",
                      probability: 0.18,
                      outcome: "Status quo → Gradual decline → Departure",
                      impact: "-12% satisfaction, replacement cost €3000"
                    },
                    {
                      universe: "Delta Timeline",
                      probability: 0.09,
                      outcome: "Immediate termination → Quick replacement",
                      impact: "Immediate cost €0, long-term risk high"
                    }
                  ].map((scenario, index) => (
                    <div
                      key={index}
                      className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{scenario.universe}</span>
                        <Badge
                          variant="outline"
                          className="text-yellow-300 border-yellow-500/30"
                        >
                          {Math.round(scenario.probability * 100)}% probability
                        </Badge>
                      </div>
                      <div className="text-yellow-300 text-sm mb-1">{scenario.outcome}</div>
                      <div className="text-yellow-400 text-xs">{scenario.impact}</div>
                      <div className="mt-2 w-full bg-yellow-900/30 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${scenario.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}