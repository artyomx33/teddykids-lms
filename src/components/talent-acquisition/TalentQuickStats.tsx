/**
 * 📊 TALENT QUICK STATS COMPONENT
 * Component Refactoring Architect - Stats cards extraction
 * Preserves quick stats UI, NOW with REAL data from useAnalytics hook
 */

import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Zap, 
  TrendingUp, 
  Target 
} from 'lucide-react';
import { useAnalytics } from '@/hooks/talent/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

export function TalentQuickStats() {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardContent className="p-4">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-purple-300 py-8">
        No analytics data available
      </div>
    );
  }

  console.log('📊 [TalentQuickStats] Rendering with REAL analytics:', analytics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-4 text-center">
          <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-400">
            {analytics.totalApplications}
          </div>
          <div className="text-xs text-purple-300">Total Applications</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-4 text-center">
          <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-400">
            {analytics.activeApplications}
          </div>
          <div className="text-xs text-purple-300">Active Applications</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">
            {analytics.hiredThisMonth}
          </div>
          <div className="text-xs text-purple-300">Hired This Month</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-4 text-center">
          <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">
            {analytics.avgTimeToHire}
          </div>
          <div className="text-xs text-purple-300">Avg. Days to Hire</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-400">
            {analytics.passRate}%
          </div>
          <div className="text-xs text-purple-300">Pass Rate</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
        <CardContent className="p-4 text-center">
          <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-400">Widget</div>
          <div className="text-xs text-purple-300">Top Source</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TalentQuickStats;

