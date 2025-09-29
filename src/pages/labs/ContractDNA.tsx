/**
 * 🧬 CONTRACT DNA VISUALIZER
 * Genetic analysis of employment patterns
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dna,
  Search,
  Zap,
  TrendingUp,
  Users,
  Activity,
  Sparkles,
  RotateCcw,
  Download,
  Eye,
  ChevronRight,
  HeartHandshake
} from "lucide-react";
import { stateTracker } from "@/lib/labs/state-tracker";
import type { EmployeeDNA, StatePattern } from "@/lib/labs/state-tracker";

// Mock employee data - will be replaced with real data
const mockEmployees = [
  {
    id: "1",
    name: "Sarah Johnson",
    position: "Marketing Specialist",
    dna: "SSHPCSRHPSCRSHCE",
    traits: {
      stability: 0.85,
      growth: 0.67,
      satisfaction: 0.92,
      predictability: 0.74,
    },
    patterns: [
      { name: "Tuesday Salary Syndrome", confidence: 0.89, frequency: 12 },
      { name: "Quarterly Review Pattern", confidence: 0.76, frequency: 4 },
      { name: "Summer Hours Boost", confidence: 0.65, frequency: 3 },
    ],
    mutations: 3,
    compatibility: { "2": 0.87, "3": 0.23, "4": 0.91 },
  },
  {
    id: "2",
    name: "John Smith",
    position: "Senior Developer",
    dna: "CSHPSRHCPSCRHPSE",
    traits: {
      stability: 0.92,
      growth: 0.45,
      satisfaction: 0.78,
      predictability: 0.89,
    },
    patterns: [
      { name: "Performance-Salary Link", confidence: 0.94, frequency: 8 },
      { name: "Monday Blues Pattern", confidence: 0.67, frequency: 15 },
    ],
    mutations: 1,
    compatibility: { "1": 0.87, "3": 0.54, "4": 0.76 },
  },
  {
    id: "3",
    name: "Lisa Chen",
    position: "HR Manager",
    dna: "PSRHCSPHRCSPRHE",
    traits: {
      stability: 0.34,
      growth: 0.89,
      satisfaction: 0.67,
      predictability: 0.23,
    },
    patterns: [
      { name: "Rapid Advancement", confidence: 0.91, frequency: 6 },
      { name: "Change Catalyst", confidence: 0.78, frequency: 9 },
      { name: "Weekend Work Bursts", confidence: 0.55, frequency: 11 },
    ],
    mutations: 7,
    compatibility: { "1": 0.23, "2": 0.54, "4": 0.34 },
  },
  {
    id: "4",
    name: "Mike Davis",
    position: "Designer",
    dna: "HPSCHPRSCRHPSRC",
    traits: {
      stability: 0.78,
      growth: 0.56,
      satisfaction: 0.89,
      predictability: 0.67,
    },
    patterns: [
      { name: "Creative Cycles", confidence: 0.83, frequency: 7 },
      { name: "Project Completion Rush", confidence: 0.72, frequency: 5 },
    ],
    mutations: 2,
    compatibility: { "1": 0.91, "2": 0.76, "3": 0.34 },
  },
];

const DNAColors = {
  S: "#10B981", // Salary - Green
  H: "#3B82F6", // Hours - Blue
  P: "#8B5CF6", // Performance - Purple
  C: "#F59E0B", // Contract - Orange
  R: "#EF4444", // Review - Red
  L: "#06B6D4", // Location - Cyan
  M: "#EC4899", // Manager - Pink
  T: "#84CC16", // Training - Lime
  D: "#6B7280", // Document - Gray
  X: "#374151", // Unknown - Dark Gray
};

const TraitNames = {
  stability: "Stability",
  growth: "Growth Oriented",
  satisfaction: "Satisfaction",
  predictability: "Predictability",
};

const TraitColors = {
  stability: "text-blue-400",
  growth: "text-green-400",
  satisfaction: "text-pink-400",
  predictability: "text-purple-400",
};

export default function ContractDNA() {
  const [selectedEmployee, setSelectedEmployee] = useState(mockEmployees[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisMode, setAnalysisMode] = useState("individual");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateDNA = async () => {
    setIsGenerating(true);
    // Simulate DNA generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const renderDNASequence = (dna: string, size = "normal") => {
    const baseSize = size === "large" ? "text-2xl" : size === "small" ? "text-sm" : "text-lg";
    const spacing = size === "large" ? "space-x-1" : "space-x-0.5";

    return (
      <div className={`font-mono ${baseSize} ${spacing} flex flex-wrap items-center`}>
        {dna.split('').map((base, index) => (
          <span
            key={index}
            className="inline-block px-1 py-0.5 rounded text-white font-bold"
            style={{ backgroundColor: DNAColors[base as keyof typeof DNAColors] }}
            title={`${base} - ${getBaseDescription(base)} (Position ${index + 1})`}
          >
            {base}
          </span>
        ))}
      </div>
    );
  };

  const getBaseDescription = (base: string) => {
    const descriptions = {
      S: "Salary Change",
      H: "Hours Modification",
      P: "Performance Review",
      C: "Contract Update",
      R: "Role Change",
      L: "Location Change",
      M: "Manager Change",
      T: "Training Completion",
      D: "Document Upload",
      X: "Unknown Event",
    };
    return descriptions[base as keyof typeof descriptions] || "Unknown";
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return "text-green-400";
    if (score >= 0.6) return "text-yellow-400";
    if (score >= 0.4) return "text-orange-400";
    return "text-red-400";
  };

  const getTraitBarColor = (trait: string, value: number) => {
    const intensity = Math.round(value * 100);
    if (trait === 'stability') return `bg-blue-500/${intensity}`;
    if (trait === 'growth') return `bg-green-500/${intensity}`;
    if (trait === 'satisfaction') return `bg-pink-500/${intensity}`;
    if (trait === 'predictability') return `bg-purple-500/${intensity}`;
    return `bg-gray-500/${intensity}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
            <Dna className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Contract DNA</h1>
            <p className="text-purple-300">
              Genetic analysis of employment patterns and behavioral traits
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={generateDNA}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate DNA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/30 border-purple-500/30 text-white placeholder-purple-400"
            />
          </div>
        </div>
        <Select value={analysisMode} onValueChange={setAnalysisMode}>
          <SelectTrigger className="w-48 bg-black/30 border-purple-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual Analysis</SelectItem>
            <SelectItem value="comparison">DNA Comparison</SelectItem>
            <SelectItem value="evolution">Evolution Timeline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Employee Selection</h3>
          {filteredEmployees.map((employee) => (
            <Card
              key={employee.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedEmployee.id === employee.id
                  ? "bg-green-500/20 border-green-500/50"
                  : "bg-black/30 border-purple-500/30 hover:bg-black/40"
              }`}
              onClick={() => setSelectedEmployee(employee)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{employee.name}</h4>
                    <p className="text-sm text-purple-300">{employee.position}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-300 border-green-500/30"
                  >
                    {employee.mutations} mutations
                  </Badge>
                </div>
                {renderDNASequence(employee.dna, "small")}
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-blue-400">
                    Stability: {Math.round(employee.traits.stability * 100)}%
                  </span>
                  <span className="text-pink-400">
                    Satisfaction: {Math.round(employee.traits.satisfaction * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DNA Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main DNA Display */}
          <Card className="bg-black/30 border-green-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Dna className="h-5 w-5 text-green-400" />
                {selectedEmployee.name} - Employment DNA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* DNA Sequence */}
                <div className="p-4 bg-black/50 rounded-lg">
                  <div className="text-sm text-purple-300 mb-2">
                    Genetic Sequence ({selectedEmployee.dna.length} bases)
                  </div>
                  {renderDNASequence(selectedEmployee.dna, "large")}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {Object.entries(DNAColors).map(([base, color]) => (
                    <div key={base} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-purple-300">
                        {base} - {getBaseDescription(base)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traits Analysis */}
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Behavioral Traits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(selectedEmployee.traits).map(([trait, value]) => (
                  <div key={trait}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm font-medium ${TraitColors[trait as keyof typeof TraitColors]}`}>
                        {TraitNames[trait as keyof typeof TraitNames]}
                      </span>
                      <span className="text-sm text-purple-300">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-900/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getTraitBarColor(trait, value)}`}
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patterns */}
          <Card className="bg-black/30 border-blue-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Detected Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedEmployee.patterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                  >
                    <div>
                      <div className="text-white font-medium">{pattern.name}</div>
                      <div className="text-sm text-blue-300">
                        Frequency: {pattern.frequency} occurrences
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-blue-300 border-blue-500/30"
                    >
                      {Math.round(pattern.confidence * 100)}% confidence
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compatibility Matrix */}
          <Card className="bg-black/30 border-pink-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-pink-400" />
                DNA Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(selectedEmployee.compatibility).map(([empId, score]) => {
                  const otherEmployee = mockEmployees.find(e => e.id === empId);
                  if (!otherEmployee) return null;

                  return (
                    <div
                      key={empId}
                      className="flex items-center justify-between p-3 bg-pink-500/10 rounded-lg border border-pink-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-white font-medium">
                          {otherEmployee.name}
                        </div>
                        <div className="text-sm text-pink-300">
                          {otherEmployee.position}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${getCompatibilityColor(score)}`}>
                          {Math.round(score * 100)}%
                        </span>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: score >= 0.8 ? '#10B981' :
                                             score >= 0.6 ? '#F59E0B' :
                                             score >= 0.4 ? '#F97316' : '#EF4444'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}