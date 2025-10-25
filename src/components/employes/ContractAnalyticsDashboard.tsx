import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, AlertTriangle, Calendar, Clock, Award, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  expiringSoon: number;
  temporaryContracts: number;
  permanentContracts: number;
  averageContractDuration: number;
  contractsByType: { type: string; count: number; }[];
  contractsByDepartment: { department: string; count: number; }[];
  expirationTimeline: { month: string; count: number; }[];
  chainRuleRisks: number;
  complianceRate: number;
}

export const ContractAnalyticsDashboard = () => {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch contract data
      const { data: contracts, error } = await supabase
        .from('contracts_enriched_v2')
        .select('*');

      if (error && error.code === 'PGRST205') {
        setStats({
          totalContracts: 0,
          activeContracts: 0,
          expiringSoon: 0,
          temporaryContracts: 0,
          permanentContracts: 0,
          averageContractDuration: 0,
          contractsByType: [],
          contractsByDepartment: [],
          expirationTimeline: [],
          chainRuleRisks: 0,
          complianceRate: 100
        });
        return;
      }
      if (error) throw error;

      if (!contracts || contracts.length === 0) {
        setStats({
          totalContracts: 0,
          activeContracts: 0,
          expiringSoon: 0,
          temporaryContracts: 0,
          permanentContracts: 0,
          averageContractDuration: 0,
          contractsByType: [],
          contractsByDepartment: [],
          expirationTimeline: [],
          chainRuleRisks: 0,
          complianceRate: 100
        });
        return;
      }

      // Calculate statistics
      const now = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      const activeContracts = contracts.filter(c => 
        c.status === 'signed' && (!c.end_date || new Date(c.end_date) > now)
      );

      const expiringSoon = activeContracts.filter(c => 
        c.end_date && new Date(c.end_date) <= threeMonthsFromNow
      );

      const temporaryContracts = contracts.filter(c => 
        c.contract_type?.toLowerCase().includes('tijdelijk') || 
        c.contract_type?.toLowerCase().includes('temporary')
      );

      const permanentContracts = contracts.filter(c => 
        c.contract_type?.toLowerCase().includes('vast') || 
        c.contract_type?.toLowerCase().includes('permanent')
      );

      // Contract duration calculation
      const durationsInMonths = contracts
        .filter(c => c.start_date && c.end_date)
        .map(c => {
          const start = new Date(c.start_date!);
          const end = new Date(c.end_date!);
          return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        });
      
      const averageContractDuration = durationsInMonths.length > 0
        ? durationsInMonths.reduce((a, b) => a + b, 0) / durationsInMonths.length
        : 0;

      // Contracts by type
      const typeCount = new Map<string, number>();
      contracts.forEach(c => {
        const type = c.contract_type || 'Unknown';
        typeCount.set(type, (typeCount.get(type) || 0) + 1);
      });
      const contractsByType = Array.from(typeCount.entries()).map(([type, count]) => ({
        type,
        count
      }));

      // Contracts by department
      const deptCount = new Map<string, number>();
      contracts.forEach(c => {
        const dept = c.department || 'Unknown';
        deptCount.set(dept, (deptCount.get(dept) || 0) + 1);
      });
      const contractsByDepartment = Array.from(deptCount.entries()).map(([department, count]) => ({
        department,
        count
      }));

      // Expiration timeline (next 12 months)
      const expirationTimeline: { month: string; count: number; }[] = [];
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() + i);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const count = contracts.filter(c => {
          if (!c.end_date) return false;
          const endDate = new Date(c.end_date);
          return endDate >= monthStart && endDate < monthEnd;
        }).length;

        expirationTimeline.push({
          month: monthStart.toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' }),
          count
        });
      }

      // Chain rule risks (employees with 2+ temporary contracts)
      const chainRuleRisks = contracts.filter(c => 
        c.needs_yearly_review || c.needs_six_month_review
      ).length;

      // Compliance rate (contracts with proper reviews)
      const contractsNeedingReview = contracts.filter(c => 
        c.needs_yearly_review || c.needs_six_month_review
      ).length;
      const complianceRate = contracts.length > 0
        ? Math.round(((contracts.length - contractsNeedingReview) / contracts.length) * 100)
        : 100;

      setStats({
        totalContracts: contracts.length,
        activeContracts: activeContracts.length,
        expiringSoon: expiringSoon.length,
        temporaryContracts: temporaryContracts.length,
        permanentContracts: permanentContracts.length,
        averageContractDuration: Math.round(averageContractDuration),
        contractsByType,
        contractsByDepartment,
        expirationTimeline,
        chainRuleRisks,
        complianceRate
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load contract analytics');
    } finally {
      setIsLoading(false);
    }
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

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No contract data available</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const StatCard = ({ title, value, icon: Icon, trend, description }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <Badge variant={trend > 0 ? 'default' : 'secondary'} className="text-xs">
                  {trend > 0 ? '+' : ''}{trend}%
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contract Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive insights into your employment contracts
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contracts"
          value={stats.totalContracts}
          icon={FileText}
          description="All time"
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts}
          icon={Users}
          description="Currently active"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon={Clock}
          description="Next 3 months"
        />
        <StatCard
          title="Compliance Rate"
          value={`${stats.complianceRate}%`}
          icon={Award}
          description="Dutch labor law"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="types">Contract Types</TabsTrigger>
          <TabsTrigger value="timeline">Expiration Timeline</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract Distribution</CardTitle>
                <CardDescription>Temporary vs Permanent</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Temporary', value: stats.temporaryContracts },
                        { name: 'Permanent', value: stats.permanentContracts }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Metrics</CardTitle>
                <CardDescription>Contract statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Duration</span>
                  <span className="text-lg font-bold">{stats.averageContractDuration} months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chain Rule Risks</span>
                  <Badge variant={stats.chainRuleRisks > 0 ? 'destructive' : 'default'}>
                    {stats.chainRuleRisks}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Expiring (3 months)</span>
                  <Badge variant={stats.expiringSoon > 5 ? 'destructive' : 'secondary'}>
                    {stats.expiringSoon}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Contracts by Type</CardTitle>
              <CardDescription>Distribution across contract types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.contractsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Contract Expiration Timeline</CardTitle>
              <CardDescription>Next 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats.expirationTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Expiring Contracts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Contracts by Department</CardTitle>
              <CardDescription>Distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.contractsByDepartment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
