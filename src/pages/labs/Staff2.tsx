/**
 * 🧪 STAFF 2.0 - LABS EXPERIMENTAL INTERFACE
 * Enhanced Staff Management with Real Employes.nl Integration
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Zap,
  Database,
  Activity,
  TrendingUp,
  MapPin,
  Calendar,
  Euro,
  Clock,
  ExternalLink,
  Sparkles,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Staff2Data {
  id: string;
  full_name: string;
  employes_id: string;
  role: string | null;
  location: string | null;
  email: string | null;
  last_sync_at: string;
}

export default function Staff2() {
  const [staffData, setStaffData] = useState<Staff2Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    withEmployesId: 0,
    synced: 0,
    locations: 0
  });

  useEffect(() => {
    loadStaff2Data();
  }, []);

  const loadStaff2Data = async () => {
    console.log('🔬 Loading Staff 2.0 experimental data...');

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, employes_id, role, location, email, last_sync_at')
        .order('full_name');

      if (error) throw error;

      const staff = data as Staff2Data[];
      setStaffData(staff);

      // Calculate enhanced stats
      const withEmployesId = staff.filter(s => s.employes_id).length;
      const locations = new Set(staff.map(s => s.location).filter(Boolean)).size;
      const synced = staff.filter(s => s.last_sync_at).length;

      setStats({
        total: staff.length,
        withEmployesId,
        synced,
        locations
      });

      console.log('✅ Staff 2.0 data loaded:', {
        total: staff.length,
        withEmployesId,
        synced,
        locations
      });

    } catch (error) {
      console.error('❌ Failed to load Staff 2.0 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffData.filter(staff =>
    staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (staff.role && staff.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (staff.location && staff.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const syncPercentage = stats.total > 0 ? Math.round((stats.withEmployesId / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Staff 2.0</h1>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              active
            </Badge>
          </div>
          <p className="text-purple-300">
            Enhanced staff management with real-time Employes.nl integration
          </p>
        </div>

        <Link to="/staff">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Production Staff
          </Button>
        </Link>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-purple-300">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Database className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.withEmployesId}</p>
                <p className="text-sm text-purple-300">Connected to Employes.nl</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{syncPercentage}%</p>
                <p className="text-sm text-purple-300">Sync Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.locations}</p>
                <p className="text-sm text-purple-300">Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Real-time Data Flow</span>
              </div>
              <p className="text-xs text-purple-300">
                Staff 2.0 connects directly to employes_raw_data with automatic VIEW synchronization
              </p>
            </div>

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">Live Employment Data</span>
              </div>
              <p className="text-xs text-purple-300">
                Employment history, salary progression, and contract timelines from Dutch payroll
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Compliance Monitoring</span>
              </div>
              <p className="text-xs text-purple-300">
                Dutch labor law compliance with automatic Ketenregeling tracking
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              Architecture 2.0
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">employes_raw_data</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Source
                </Badge>
              </div>

              <div className="flex items-center justify-center">
                <div className="h-px bg-purple-500/30 flex-1"></div>
                <span className="mx-2 text-xs text-purple-400">↓</span>
                <div className="h-px bg-purple-500/30 flex-1"></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">staff VIEW</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Auto-sync
                </Badge>
              </div>

              <div className="flex items-center justify-center">
                <div className="h-px bg-purple-500/30 flex-1"></div>
                <span className="mx-2 text-xs text-purple-400">↓</span>
                <div className="h-px bg-purple-500/30 flex-1"></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">Enhanced UI</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Real-time
                </Badge>
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-xs text-purple-300">
                <span className="font-medium">Zero-conflict architecture:</span> Self-healing
                data flow with no manual sync required
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="bg-black/40 border-purple-500/30 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">Enhanced Staff Directory</CardTitle>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search staff, roles, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm bg-black/20 border-purple-500/30 text-white placeholder:text-purple-400"
            />
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {filteredStaff.length} results
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-purple-300 mt-2">Loading Staff 2.0 data...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStaff.map((staff) => (
                <Link
                  key={staff.id}
                  to={`/staff/${staff.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{staff.full_name}</h3>
                        <div className="flex items-center gap-3 text-sm text-purple-300">
                          {staff.role && (
                            <span className="flex items-center gap-1">
                              <span>{staff.role}</span>
                            </span>
                          )}
                          {staff.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {staff.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {staff.employes_id ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Database className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}

                      {staff.last_sync_at && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Activity className="h-3 w-3 mr-1" />
                          Synced
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}