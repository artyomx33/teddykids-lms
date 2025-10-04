import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, AlertCircle, Calendar, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Prediction {
  type: 'chain_rule_risk' | 'contract_renewal' | 'turnover_risk';
  employee_name: string;
  employee_id: string;
  probability: number;
  timeframe: string;
  factors: string[];
  recommendation: string;
}

export const PredictiveAnalyticsPanel = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState({
    highRiskCount: 0,
    mediumRiskCount: 0,
    renewalsNext3Months: 0,
    chainRuleRisks: 0
  });

  useEffect(() => {
    generatePredictions();
  }, []);

  const generatePredictions = async () => {
    setIsLoading(true);
    try {
      // Fetch contracts and staff data
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts_enriched')
        .select('*');

      let contractsData = contracts;
      if (contractsError && contractsError.code === 'PGRST205') {
        console.log('PredictiveAnalyticsPanel: contracts_enriched table not found, using mock data');
        contractsData = [];
      } else if (contractsError) {
        throw contractsError;
      }

      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*');

      if (staffError) throw staffError;

      const generatedPredictions: Prediction[] = [];

      // 1. Chain Rule Risk Prediction
      contractsData?.forEach(contract => {
        if (contract.needs_yearly_review || contract.needs_six_month_review) {
          const contractDuration = contract.start_date && contract.end_date
            ? (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
            : 0;

          const riskFactors = [];
          let probability = 30;

          if (contractDuration >= 20) {
            probability += 30;
            riskFactors.push('Contract duration exceeds 20 months');
          }

          if (contract.contract_type?.toLowerCase().includes('tijdelijk')) {
            probability += 25;
            riskFactors.push('Multiple temporary contracts detected');
          }

          if (contract.end_date) {
            const daysUntilEnd = (new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysUntilEnd <= 90 && daysUntilEnd > 0) {
              probability += 20;
              riskFactors.push('Contract ending within 90 days');
            }
          }

          if (probability >= 50) {
            generatedPredictions.push({
              type: 'chain_rule_risk',
              employee_name: contract.employee_name || 'Unknown',
              employee_id: contract.staff_id || '',
              probability: Math.min(probability, 95),
              timeframe: 'Next 60 days',
              factors: riskFactors,
              recommendation: 'Consider offering permanent contract or ensure proper termination notice'
            });
          }
        }
      });

      // 2. Contract Renewal Predictions
      contracts?.forEach(contract => {
        if (!contract.end_date) return;

        const endDate = new Date(contract.end_date);
        const now = new Date();
        const daysUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (daysUntilEnd > 0 && daysUntilEnd <= 120) {
          const factors = [];
          let probability = 60;

          if (contract.has_five_star_badge) {
            probability += 20;
            factors.push('Employee has 5-star performance badge');
          }

          if (contract.avg_review_score && contract.avg_review_score >= 4) {
            probability += 15;
            factors.push(`High review scores (${contract.avg_review_score}/5)`);
          }

          if (daysUntilEnd <= 60) {
            factors.push('Contract renewal decision needed soon');
          }

          generatedPredictions.push({
            type: 'contract_renewal',
            employee_name: contract.employee_name || 'Unknown',
            employee_id: contract.staff_id || '',
            probability: Math.min(probability, 95),
            timeframe: `${Math.round(daysUntilEnd)} days`,
            factors,
            recommendation: probability >= 75 
              ? 'Strong candidate for renewal - initiate discussions now'
              : 'Review performance and business needs before decision'
          });
        }
      });

      // 3. Turnover Risk Prediction (based on contract patterns)
      staff?.forEach(employee => {
        const employeeContracts = contracts?.filter(c => c.staff_id === employee.id) || [];
        
        if (employeeContracts.length >= 2) {
          const factors = [];
          let probability = 20;

          // Multiple short contracts might indicate dissatisfaction
          const shortContracts = employeeContracts.filter(c => {
            if (!c.start_date || !c.end_date) return false;
            const duration = (new Date(c.end_date).getTime() - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
            return duration < 12;
          });

          if (shortContracts.length >= 2) {
            probability += 30;
            factors.push('Pattern of short-term contracts');
          }

          // No recent reviews
          const recentContract = employeeContracts[0];
          if (recentContract?.needs_yearly_review || recentContract?.needs_six_month_review) {
            probability += 25;
            factors.push('Overdue performance reviews');
          }

          if (probability >= 40) {
            generatedPredictions.push({
              type: 'turnover_risk',
              employee_name: employee.full_name,
              employee_id: employee.id,
              probability: Math.min(probability, 85),
              timeframe: 'Next 6 months',
              factors,
              recommendation: 'Schedule 1-on-1 meeting to discuss career development and satisfaction'
            });
          }
        }
      });

      // Calculate insights
      const highRisk = generatedPredictions.filter(p => p.probability >= 75).length;
      const mediumRisk = generatedPredictions.filter(p => p.probability >= 50 && p.probability < 75).length;
      const renewals = generatedPredictions.filter(p => p.type === 'contract_renewal').length;
      const chainRisks = generatedPredictions.filter(p => p.type === 'chain_rule_risk').length;

      setInsights({
        highRiskCount: highRisk,
        mediumRiskCount: mediumRisk,
        renewalsNext3Months: renewals,
        chainRuleRisks: chainRisks
      });

      // Sort by probability
      generatedPredictions.sort((a, b) => b.probability - a.probability);

      setPredictions(generatedPredictions);

    } catch (error) {
      console.error('Failed to generate predictions:', error);
      toast.error('Failed to generate predictive analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const getPredictionIcon = (type: Prediction['type']) => {
    switch (type) {
      case 'chain_rule_risk':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'contract_renewal':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'turnover_risk':
        return <Users className="h-4 w-4 text-amber-500" />;
    }
  };

  const getPredictionLabel = (type: Prediction['type']) => {
    switch (type) {
      case 'chain_rule_risk':
        return 'Chain Rule Risk';
      case 'contract_renewal':
        return 'Contract Renewal';
      case 'turnover_risk':
        return 'Turnover Risk';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-red-600';
    if (probability >= 50) return 'text-amber-600';
    return 'text-blue-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" />
          Predictive Insights
        </h2>
        <p className="text-muted-foreground">
          AI-powered predictions for proactive workforce management
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{insights.highRiskCount}</div>
              <div className="text-xs text-muted-foreground mt-1">High Risk Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{insights.mediumRiskCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Medium Risk Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{insights.renewalsNext3Months}</div>
              <div className="text-xs text-muted-foreground mt-1">Renewal Opportunities</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{insights.chainRuleRisks}</div>
              <div className="text-xs text-muted-foreground mt-1">Chain Rule Risks</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analysis</CardTitle>
          <CardDescription>
            {predictions.length} predictions generated from employment data patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">All Clear!</p>
              <p className="text-muted-foreground">No significant risks detected at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction, idx) => (
                <Card key={idx} className="border-l-4" style={{
                  borderLeftColor: prediction.probability >= 75 ? '#ef4444' :
                                   prediction.probability >= 50 ? '#f59e0b' : '#3b82f6'
                }}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getPredictionIcon(prediction.type)}
                          <div>
                            <p className="font-semibold">{prediction.employee_name}</p>
                            <Badge variant="outline" className="mt-1">
                              {getPredictionLabel(prediction.type)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                            {prediction.probability}%
                          </p>
                          <p className="text-xs text-muted-foreground">{prediction.timeframe}</p>
                        </div>
                      </div>

                      <div>
                        <Progress value={prediction.probability} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Risk Factors:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {prediction.factors.map((factor, i) => (
                            <li key={i}>• {factor}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm">
                          <span className="font-semibold text-blue-700 dark:text-blue-400">Recommendation: </span>
                          <span className="text-blue-900 dark:text-blue-200">{prediction.recommendation}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
