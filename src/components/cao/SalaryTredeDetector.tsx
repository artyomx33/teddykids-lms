import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  CheckCircle,
  Target,
  AlertTriangle,
  TrendingUp,
  Info,
  ArrowRight
} from 'lucide-react';
import { CaoService, type TredeDetectionResult } from '@/lib/CaoService';
import { toast } from '@/components/ui/sonner';

interface SalaryTredeDetectorProps {
  salary: number;
  effectiveDate: string;
  onDetectionResult?: (result: TredeDetectionResult) => void;
  showAlternatives?: boolean;
  className?: string;
}

export const SalaryTredeDetector: React.FC<SalaryTredeDetectorProps> = ({
  salary,
  effectiveDate,
  onDetectionResult,
  showAlternatives = true,
  className = ''
}) => {
  // Perform reverse lookup
  const { data: detection, isLoading, error } = useQuery({
    queryKey: ['salary-detection', salary, effectiveDate],
    queryFn: async () => {
      if (!salary || salary <= 0) return null;

      try {
        const result = await CaoService.findTredeByUalary(salary, effectiveDate);
        if (onDetectionResult) {
          onDetectionResult(result);
        }
        return result;
      } catch (err) {
        console.error('Salary detection failed:', err);
        toast.error('Failed to analyze salary against CAO rates');
        throw err;
      }
    },
    enabled: !!salary && salary > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  if (!salary || salary <= 0) return null;

  if (isLoading) {
    return <SalaryDetectionSkeleton className={className} />;
  }

  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Unable to analyze salary against CAO rates</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!detection) return null;

  return (
    <Card className={`bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <Search className="h-4 w-4" />
          CAO Analyse
          <Badge
            variant={detection.confidence === 'high' ? 'default' :
                    detection.confidence === 'medium' ? 'secondary' : 'outline'}
            className="ml-auto"
          >
            {detection.confidenceScore}% confidence
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Detection Result */}
        {detection.isExactMatch ? (
          <ExactMatchDisplay detection={detection} salary={salary} />
        ) : (
          <NearestMatchDisplay detection={detection} salary={salary} />
        )}

        {/* Alternative Matches */}
        {showAlternatives && detection.alternativeMatches.length > 0 && (
          <AlternativeMatchesDisplay alternatives={detection.alternativeMatches} />
        )}

        {/* Salary Progression Preview */}
        <SalaryProgressionPreview
          scale={detection.scale}
          trede={detection.exactTrede || detection.nearestTrede}
          effectiveDate={effectiveDate}
        />
      </CardContent>
    </Card>
  );
};

const ExactMatchDisplay: React.FC<{ detection: TredeDetectionResult; salary: number }> = ({
  detection,
  salary
}) => (
  <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-300">
    <div className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <div>
        <p className="font-medium text-green-800">Perfect Match!</p>
        <p className="text-sm text-green-700">
          Schaal {detection.scale}, Trede {detection.exactTrede}
        </p>
      </div>
    </div>
    <Badge className="bg-green-600">
      €{salary.toLocaleString('nl-NL')}
    </Badge>
  </div>
);

const NearestMatchDisplay: React.FC<{ detection: TredeDetectionResult; salary: number }> = ({
  detection,
  salary
}) => {
  const difference = detection.salaryDifference;
  const isOver = difference > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border border-blue-300">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">Closest Match</p>
            <p className="text-sm text-blue-700">
              Schaal {detection.scale}, Trede {detection.nearestTrede}
            </p>
          </div>
        </div>
        <Badge variant={isOver ? "destructive" : "secondary"}>
          {isOver ? '+' : ''}€{Math.abs(difference).toLocaleString('nl-NL')}
        </Badge>
      </div>

      {/* Difference Analysis */}
      <div className="text-xs bg-gray-50 p-2 rounded border">
        {isOver ? (
          <span className="text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Salary is €{Math.abs(difference).toLocaleString('nl-NL')} above CAO rate - verify compliance
          </span>
        ) : (
          <span className="text-orange-600 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Salary is €{Math.abs(difference).toLocaleString('nl-NL')} below CAO rate - consider adjustment
          </span>
        )}
      </div>
    </div>
  );
};

const ScaleInfoDisplay: React.FC<{ scaleInfo: any }> = ({ scaleInfo }) => (
  <div className="p-3 bg-white rounded border border-emerald-200">
    <h5 className="text-sm font-medium text-gray-800 mb-2">Schaal Informatie</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-600">Functie Niveau:</span>
        <span className="ml-2 font-medium">{scaleInfo.scale_category}</span>
      </div>
      <div>
        <span className="text-gray-600">Trede Bereik:</span>
        <span className="ml-2 font-medium">
          {scaleInfo.min_trede} - {scaleInfo.max_trede}
        </span>
      </div>
    </div>
    {scaleInfo.description && (
      <p className="text-xs text-gray-600 mt-2">{scaleInfo.description}</p>
    )}
  </div>
);

const ComplianceAnalysisDisplay: React.FC<{ detection: TredeDetectionResult }> = ({ detection }) => {
  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-700 bg-green-50 border-green-200';
      case 'over_cao': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'under_cao': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'over_cao': return <TrendingUp className="h-4 w-4" />;
      case 'under_cao': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className={`p-3 rounded border ${getComplianceColor(detection.complianceStatus)}`}>
      <div className="flex items-center gap-2 mb-2">
        {getComplianceIcon(detection.complianceStatus)}
        <span className="text-sm font-medium">
          Compliance Status: {detection.complianceStatus.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      {detection.complianceNotes.length > 0 && (
        <ul className="text-xs space-y-1">
          {detection.complianceNotes.map((note, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-gray-400">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AlternativeMatchesDisplay: React.FC<{ alternatives: any[] }> = ({ alternatives }) => (
  <div className="space-y-2">
    <h5 className="text-sm font-medium text-gray-800">Alternative Matches</h5>
    {alternatives.map((alt, index) => (
      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
        <span>Schaal {alt.scale}, Trede {alt.trede}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">€{alt.salary.toLocaleString('nl-NL')}</span>
          <Badge variant="outline" className="text-xs">
            {alt.confidenceScore}%
          </Badge>
        </div>
      </div>
    ))}
  </div>
);

const SalaryProgressionPreview: React.FC<{
  scale: number;
  trede: number;
  effectiveDate: string;
}> = ({ scale, trede, effectiveDate }) => {
  const { data: progression } = useQuery({
    queryKey: ['salary-progression', scale, trede],
    queryFn: () => CaoService.getSalaryProgression(scale, trede),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (!progression || progression.length === 0) return null;

  return (
    <div className="p-3 bg-white rounded border border-gray-200">
      <h5 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Salaris Progressie
      </h5>

      <div className="space-y-2">
        {progression.map((item, index) => (
          <div
            key={item.effectiveDate}
            className={`flex justify-between items-center p-2 rounded ${
              item.effectiveDate === effectiveDate
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-gray-50'
            }`}
          >
            <span className="text-sm text-gray-700">
              {new Date(item.effectiveDate).toLocaleDateString('nl-NL')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                €{item.salary.toLocaleString('nl-NL')}
              </span>
              {item.increase && item.increase > 0 && (
                <Badge variant="outline" className="text-xs text-green-600">
                  +€{item.increase.toLocaleString('nl-NL')}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Next Progression Hint */}
      {scale === 6 && trede < 23 && (
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <ArrowRight className="h-3 w-3" />
            <span>Next: Trede {trede + 1} progression available</span>
          </div>
        </div>
      )}
    </div>
  );
};

const SalaryDetectionSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={`bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 ${className}`}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 ml-auto" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="p-3 bg-white rounded border">
        <Skeleton className="h-4 w-32 mb-2" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SalaryTredeDetector;