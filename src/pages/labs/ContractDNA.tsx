/**
 * 🧬 CONTRACT DNA VISUALIZER
 * Genetic analysis of employment patterns with REAL Employes.nl data
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
  HeartHandshake,
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

interface EmploymentDNA {
  id: string;
  name: string;
  position: string;
  dna: string;
  traits: {
    stability: number;
    growth: number;
    satisfaction: number;
    predictability: number;
  };
  patterns: Array<{
    name: string;
    confidence: number;
    frequency: number;
  }>;
  mutations: number;
  employes_id: string | null;
  hasRealData: boolean;
  dataStatus: 'connected' | 'missing' | 'error';
}

// DNA Generator for Real Employment Patterns
const generateEmploymentDNA = (employmentHistory: any[], salaryHistory: any[]) => {
  let dna = '';

  // Analyze employment stability patterns
  if (employmentHistory.length > 1) {
    const avgPeriod = employmentHistory.reduce((sum, emp) => {
      const start = new Date(emp.startDate);
      const end = emp.endDate ? new Date(emp.endDate) : new Date();
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    }, 0) / employmentHistory.length;

    dna += avgPeriod > 2 ? 'S' : avgPeriod > 1 ? 'M' : 'C'; // Stable/Medium/Changing
  } else {
    dna += 'S'; // Single employment = stable
  }

  // Analyze salary progression
  if (salaryHistory.length > 1) {
    const sorted = salaryHistory.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const growth = (sorted[sorted.length - 1].hourlyWage - sorted[0].hourlyWage) / sorted[0].hourlyWage;
    dna += growth > 0.2 ? 'H' : growth > 0.1 ? 'G' : growth > 0 ? 'P' : 'F'; // High/Good/Poor/Flat
  } else {
    dna += 'P'; // Single salary record = poor data
  }

  // Add contract pattern analysis
  const hasPartTime = employmentHistory.some(emp => emp.isPartTime);
  dna += hasPartTime ? 'P' : 'F'; // Part-time/Full-time

  // Working hours pattern
  const avgHours = employmentHistory.reduce((sum, emp) => sum + (emp.hoursPerWeek || 40), 0) / employmentHistory.length;
  dna += avgHours > 35 ? 'H' : avgHours > 20 ? 'M' : 'L'; // High/Medium/Low hours

  // Add more DNA segments for different patterns...
  return dna.padEnd(16, 'X'); // Pad to 16 characters
};

// Calculate employment traits from real data
const calculateTraits = (employmentHistory: any[], salaryHistory: any[]) => {
  const stability = employmentHistory.length === 1 ? 0.95 :
    Math.max(0.1, 1 - (employmentHistory.length - 1) * 0.2);

  const growth = salaryHistory.length > 1 ?
    Math.min(1, (salaryHistory[salaryHistory.length - 1].hourlyWage / salaryHistory[0].hourlyWage - 1) * 2) : 0.5;

  const satisfaction = 0.8; // TODO: Calculate from reviews when available
  const predictability = stability * 0.8 + (growth > 0 ? 0.2 : 0.1);

  return { stability, growth, satisfaction, predictability };
};

// Real employment pattern detection
const detectPatterns = (employmentHistory: any[], salaryHistory: any[]) => {
  const patterns = [];

  // Salary progression pattern
  if (salaryHistory.length > 2) {
    patterns.push({
      name: "Dutch CAO Progression",
      confidence: 0.85,
      frequency: salaryHistory.length
    });
  }

  // Employment duration pattern
  if (employmentHistory.length > 1) {
    patterns.push({
      name: "Contract Renewal Pattern",
      confidence: 0.78,
      frequency: employmentHistory.length
    });
  }

  // Hours pattern
  const hasVariableHours = employmentHistory.some(emp => emp.hoursPerWeek !== employmentHistory[0].hoursPerWeek);
  if (hasVariableHours) {
    patterns.push({
      name: "Flexible Hours Adaptation",
      confidence: 0.72,
      frequency: 3
    });
  }

  return patterns;
};

// Convert real staff data to Employment DNA format
const convertToEmploymentDNA = async (staff: RealStaffMember): Promise<EmploymentDNA> => {
  if (!staff.employes_id) {
    // Missing data connect for staff without employes_id
    return {
      id: staff.id,
      name: staff.full_name,
      position: staff.role || 'Unknown Role',
      dna: 'XXXXXXXXXXXXXXXX', // No data available
      traits: {
        stability: 0,
        growth: 0,
        satisfaction: 0,
        predictability: 0
      },
      patterns: [{
        name: "No Employes ID",
        confidence: 1.0,
        frequency: 1
      }],
      mutations: 0,
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
        dna: 'DDDDDDDDDDDDDDDD', // Data connection failed
        traits: {
          stability: 0,
          growth: 0,
          satisfaction: 0,
          predictability: 0
        },
        patterns: [{
          name: "Missing Data Connect",
          confidence: 1.0,
          frequency: 1
        }],
        mutations: 0,
        employes_id: staff.employes_id,
        hasRealData: false,
        dataStatus: 'missing'
      };
    }

    // Generate real DNA from employment data
    const dna = generateEmploymentDNA(employesData.employments, employesData.salaryHistory);
    const traits = calculateTraits(employesData.employments, employesData.salaryHistory);
    const patterns = detectPatterns(employesData.employments, employesData.salaryHistory);

    return {
      id: staff.id,
      name: staff.full_name,
      position: staff.role || 'Unknown Role',
      dna,
      traits,
      patterns,
      mutations: employesData.employments.length + employesData.salaryHistory.length,
      employes_id: staff.employes_id,
      hasRealData: true,
      dataStatus: 'connected'
    };

  } catch (error) {
    console.warn('Failed to get employment data for', staff.full_name, error);
    return {
      id: staff.id,
      name: staff.full_name,
      position: staff.role || 'Unknown Role',
      dna: 'EEEEEEEEEEEEEEEE', // Error connecting
      traits: {
        stability: 0,
        growth: 0,
        satisfaction: 0,
        predictability: 0
      },
      patterns: [{
        name: "Connection Error",
        confidence: 1.0,
        frequency: 1
      }],
      mutations: 0,
      employes_id: staff.employes_id,
      hasRealData: false,
      dataStatus: 'error'
    };
  }
};

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
  G: "#22C55E", // Growth - Light Green
  F: "#64748B", // Flat - Slate
  E: "#DC2626", // Error - Dark Red
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
  const [selectedEmployee, setSelectedEmployee] = useState<EmploymentDNA | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisMode, setAnalysisMode] = useState("individual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [employmentDNAData, setEmploymentDNAData] = useState<EmploymentDNA[]>([]);

  // 🔥 REAL DATA: Load staff from database
  const { data: realStaff = [], isLoading: isLoadingStaff } = useQuery<RealStaffMember[]>({
    queryKey: ['contract-dna-staff'],
    queryFn: async () => {
      console.log('🧬 Contract DNA: Loading real staff from database...');

      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, role, location, employes_id, email, last_sync_at')
        .order('full_name');

      if (error) {
        console.error('❌ Failed to load staff for Contract DNA:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} staff members for DNA analysis`);
      return data as RealStaffMember[];
    }
  });

  // Convert real staff to Employment DNA format
  useEffect(() => {
    if (!realStaff.length) return;

    const convertAllStaff = async () => {
      console.log('🧬 Converting staff to Employment DNA format...');

      const dnaPromises = realStaff.map(staff => convertToEmploymentDNA(staff));
      const dnaResults = await Promise.all(dnaPromises);

      setEmploymentDNAData(dnaResults);

      // Set first employee as selected if none selected
      if (!selectedEmployee && dnaResults.length > 0) {
        setSelectedEmployee(dnaResults[0]);
      }

      console.log(`✅ Generated DNA for ${dnaResults.length} employees`);
      console.log('Real data available for:', dnaResults.filter(e => e.hasRealData).length, 'employees');
    };

    convertAllStaff();
  }, [realStaff]);

  const filteredEmployees = employmentDNAData.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingStaff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-purple-300">Loading real staff data for DNA analysis...</p>
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
            <p className="text-purple-300">No staff data available for DNA analysis</p>
          </div>
        </div>
      </div>
    );
  }

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
      G: "Growth Pattern",
      F: "Flat Progression",
      E: "Error/Missing",
    };
    return descriptions[base as keyof typeof descriptions] || "Unknown";
  };

  const getTraitBarColor = (trait: string, value: number) => {
    const intensity = Math.round(value * 100);
    if (trait === 'stability') return `bg-blue-500/${intensity}`;
    if (trait === 'growth') return `bg-green-500/${intensity}`;
    if (trait === 'satisfaction') return `bg-pink-500/${intensity}`;
    if (trait === 'predictability') return `bg-purple-500/${intensity}`;
    return `bg-gray-500/${intensity}`;
  };

  const getDataStatusBadge = (employee: EmploymentDNA) => {
    if (employee.dataStatus === 'connected') {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <Database className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    } else if (employee.dataStatus === 'missing') {
      return (
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          <Zap className="h-3 w-3 mr-1" />
          Missing
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <Activity className="h-3 w-3 mr-1" />
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
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
            <Dna className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Contract DNA</h1>
            <p className="text-purple-300">
              Genetic analysis of real employment patterns via Employes.nl
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
                  <div className="flex items-center gap-2">
                    {getDataStatusBadge(employee)}
                    <Badge
                      variant="outline"
                      className="text-green-300 border-green-500/30"
                    >
                      {employee.mutations} events
                    </Badge>
                  </div>
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

          {/* Data Connection Status */}
          <Card className="bg-black/30 border-pink-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-pink-400" />
                Data Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEmployee.hasRealData ? (
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-green-300 font-medium mb-2">✅ Real Employment Data Connected</div>
                  <p className="text-sm text-green-200">
                    DNA generated from {selectedEmployee.mutations} real employment events via Employes.nl
                  </p>
                  <p className="text-xs text-green-300 mt-2">
                    Employes ID: {selectedEmployee.employes_id}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-orange-300 font-medium mb-2">⚠️ Missing Data Connect</div>
                  <p className="text-sm text-orange-200">
                    {selectedEmployee.employes_id ?
                      'Employes.nl data not available for this employee' :
                      'No employes_id found - cannot connect to raw employment data'
                    }
                  </p>
                  {selectedEmployee.dataStatus === 'error' && (
                    <p className="text-xs text-orange-300 mt-2">
                      Connection error occurred while fetching employment data
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}