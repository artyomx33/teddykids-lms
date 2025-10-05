import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Play, CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface CollectionResult {
  success: boolean;
  snapshot_id: string;
  employees_processed: number;
  total_employees: number;
  endpoints_collected: string[];
  errors: string[];
}

export function ComprehensiveDataCollector() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [result, setResult] = useState<CollectionResult | null>(null);
  const { toast } = useToast();

  // Fetch latest snapshot status
  const { data: latestSnapshot, refetch } = useQuery({
    queryKey: ["latest-snapshot"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employes_data_snapshots")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    refetchInterval: isCollecting ? 5000 : false, // Poll every 5s when collecting
  });

  const handleStartCollection = async () => {
    try {
      setIsCollecting(true);
      setResult(null);
      
      toast({
        title: "Starting Collection",
        description: "Comprehensive data collection initiated...",
      });

      const { data, error } = await supabase.functions.invoke("employes-integration", {
        body: { action: "collect_comprehensive_data" },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.data);
      await refetch();
      
      toast({
        title: "Collection Complete",
        description: `Successfully collected data for ${data.data.employees_processed} employees`,
      });
    } catch (error: any) {
      console.error("Collection error:", error);
      toast({
        title: "Collection Failed",
        description: error.message || "Failed to collect data",
        variant: "destructive",
      });
    } finally {
      setIsCollecting(false);
    }
  };

  const getProgress = () => {
    if (!latestSnapshot || latestSnapshot.status !== 'running') return 0;
    if (!latestSnapshot.total_employees) return 0;
    return Math.round((latestSnapshot.employees_processed / latestSnapshot.total_employees) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Phase 1: Comprehensive Data Collection
        </CardTitle>
        <CardDescription>
          Collect complete data from all Employes.nl endpoints for all 117 employees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Latest Snapshot Status */}
        {latestSnapshot && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Latest Snapshot:</strong> {new Date(latestSnapshot.created_at).toLocaleString()}
                  <Badge className="ml-2" variant={
                    latestSnapshot.status === 'completed' ? 'default' :
                    latestSnapshot.status === 'running' ? 'secondary' : 'destructive'
                  }>
                    {latestSnapshot.status.toUpperCase()}
                  </Badge>
                </div>
                {latestSnapshot.status === 'running' && (
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {latestSnapshot.employees_processed} / {latestSnapshot.total_employees}
                    </div>
                    <Progress value={getProgress()} className="w-32" />
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Collection Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Collection Completed Successfully</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Employees Processed:</span>
                <span className="ml-2 font-medium">{result.employees_processed} / {result.total_employees}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Endpoints Collected:</span>
                <span className="ml-2 font-medium">{result.endpoints_collected.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Snapshot ID:</span>
                <span className="ml-2 font-mono text-xs">{result.snapshot_id.substring(0, 8)}...</span>
              </div>
              <div>
                <span className="text-muted-foreground">Errors:</span>
                <span className="ml-2 font-medium">{result.errors.length}</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm">
                    <strong>Errors encountered:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {result.errors.slice(0, 5).map((error, i) => (
                        <li key={i} className="truncate">{error}</li>
                      ))}
                    </ul>
                    {result.errors.length > 5 && (
                      <span className="text-xs">...and {result.errors.length - 5} more</span>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleStartCollection}
          disabled={isCollecting || latestSnapshot?.status === 'running'}
          className="w-full"
          size="lg"
        >
          {isCollecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Collecting Data...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Comprehensive Data Collection
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Collects data from all endpoints for every employee</p>
          <p>• Stores raw API responses with change detection</p>
          <p>• Creates snapshot for historical tracking</p>
          <p>• Runs in background (can take 5-10 minutes)</p>
        </div>
      </CardContent>
    </Card>
  );
}
