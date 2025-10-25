import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ComplianceMetric {
  category: string;
  status: 'compliant' | 'warning' | 'critical';
  score: number;
  issues: number;
  description: string;
}

interface ComplianceAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  employee_name: string;
  created_at: string;
  resolved: boolean;
}

export const ComplianceReportingPanel = () => {
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    try {
      // Fetch contracts with enriched data
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts_enriched_v2')
        .select('*');

      let contractsData = contracts;
      if (contractsError && contractsError.code === 'PGRST205') {
        contractsData = [];
      } else if (contractsError) {
        throw contractsError;
      }

      // Fetch sync logs for audit trail
      const { data: syncLogs, error: logsError } = await supabase
        .from('employes_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Calculate compliance metrics
      const calculatedMetrics: ComplianceMetric[] = [];
      const calculatedAlerts: ComplianceAlert[] = [];

      // 1. Chain Rule Compliance (Ketenregeling)
      const chainRuleViolations = contractsData?.filter(c =>
        c.needs_yearly_review || c.needs_six_month_review
      ) || [];
      
      calculatedMetrics.push({
        category: 'Chain Contract Rule',
        status: chainRuleViolations.length === 0 ? 'compliant' : chainRuleViolations.length < 5 ? 'warning' : 'critical',
        score: Math.max(0, 100 - (chainRuleViolations.length * 10)),
        issues: chainRuleViolations.length,
        description: 'Maximum 3 temporary contracts or 2 years total'
      });

      chainRuleViolations.forEach(c => {
        calculatedAlerts.push({
          id: c.id || '',
          type: 'chain_rule',
          severity: 'high',
          message: `Contract may violate chain rule - requires review`,
          employee_name: c.employee_name || 'Unknown',
          created_at: new Date().toISOString(),
          resolved: false
        });
      });

      // 2. Contract Documentation
      const missingDocs = contracts?.filter(c => !c.pdf_path || c.status === 'draft') || [];
      calculatedMetrics.push({
        category: 'Contract Documentation',
        status: missingDocs.length === 0 ? 'compliant' : missingDocs.length < 3 ? 'warning' : 'critical',
        score: Math.max(0, 100 - (missingDocs.length * 15)),
        issues: missingDocs.length,
        description: 'All contracts properly documented and signed'
      });

      // 3. Review Compliance
      const needsReview = contracts?.filter(c => 
        c.needs_yearly_review || c.needs_six_month_review
      ) || [];
      calculatedMetrics.push({
        category: 'Performance Reviews',
        status: needsReview.length === 0 ? 'compliant' : needsReview.length < 5 ? 'warning' : 'critical',
        score: Math.max(0, 100 - (needsReview.length * 12)),
        issues: needsReview.length,
        description: 'Mandatory reviews conducted on time'
      });

      // 4. Data Sync Integrity
      const failedSyncs = syncLogs?.filter(l => l.status === 'error') || [];
      const recentSyncs = syncLogs?.filter(l => {
        const logDate = new Date(l.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate > weekAgo;
      }) || [];
      
      const syncScore = recentSyncs.length > 0 
        ? Math.round((recentSyncs.filter(s => s.status === 'success').length / recentSyncs.length) * 100)
        : 100;

      calculatedMetrics.push({
        category: 'Data Synchronization',
        status: syncScore >= 95 ? 'compliant' : syncScore >= 80 ? 'warning' : 'critical',
        score: syncScore,
        issues: failedSyncs.length,
        description: 'Employee data properly synchronized'
      });

      // 5. Contract Expiration Management
      const now = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      
      const expiringSoon = contracts?.filter(c => {
        if (!c.end_date) return false;
        const endDate = new Date(c.end_date);
        return endDate > now && endDate <= oneMonthFromNow;
      }) || [];

      calculatedMetrics.push({
        category: 'Contract Renewals',
        status: expiringSoon.length === 0 ? 'compliant' : expiringSoon.length < 3 ? 'warning' : 'critical',
        score: Math.max(0, 100 - (expiringSoon.length * 10)),
        issues: expiringSoon.length,
        description: 'Proactive contract renewal management'
      });

      expiringSoon.forEach(c => {
        calculatedAlerts.push({
          id: c.id || '',
          type: 'expiration',
          severity: 'medium',
          message: `Contract expires within 30 days`,
          employee_name: c.employee_name || 'Unknown',
          created_at: new Date().toISOString(),
          resolved: false
        });
      });

      // Calculate overall score
      const avgScore = calculatedMetrics.reduce((sum, m) => sum + m.score, 0) / calculatedMetrics.length;
      setOverallScore(Math.round(avgScore));

      setMetrics(calculatedMetrics);
      setAlerts(calculatedAlerts);

    } catch (error) {
      console.error('Failed to load compliance data:', error);
      toast.error('Failed to load compliance report');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: 'compliant' | 'warning' | 'critical') => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Compliant</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" /> Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Critical</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Medium</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'critical':
        return <Badge variant="destructive" className="bg-red-700">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      overall_score: overallScore,
      metrics,
      alerts: alerts.filter(a => !a.resolved)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Compliance report exported');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Compliance Report
          </h2>
          <p className="text-muted-foreground">
            Dutch labor law compliance monitoring
          </p>
        </div>
        <Button onClick={exportReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overall Score */}
      <Card className={
        overallScore >= 90 ? 'border-green-500' :
        overallScore >= 70 ? 'border-amber-500' :
        'border-red-500'
      }>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Compliance Score</p>
              <p className="text-4xl font-bold mt-1">{overallScore}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                {overallScore >= 90 ? 'Excellent compliance' :
                 overallScore >= 70 ? 'Good, but needs attention' :
                 'Immediate action required'}
              </p>
            </div>
            <div className={`h-20 w-20 rounded-full flex items-center justify-center ${
              overallScore >= 90 ? 'bg-green-100 text-green-600' :
              overallScore >= 70 ? 'bg-amber-100 text-amber-600' :
              'bg-red-100 text-red-600'
            }`}>
              <Shield className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Issues</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{metric.category}</TableCell>
                  <TableCell>{getStatusBadge(metric.status)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${
                      metric.score >= 90 ? 'text-green-600' :
                      metric.score >= 70 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {metric.score}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {metric.issues > 0 ? (
                      <Badge variant="destructive">{metric.issues}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {metric.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Active Compliance Alerts ({alerts.filter(a => !a.resolved).length})
            </CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.filter(a => !a.resolved).slice(0, 10).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.employee_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{alert.type}</Badge>
                    </TableCell>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell className="text-sm">{alert.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
