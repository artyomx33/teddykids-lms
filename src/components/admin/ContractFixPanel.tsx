import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, Trash2, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { fixContractConsistency } from '@/lib/contract-fixes';

interface FixResult {
  linked: number;
  deleted: number;
  errors: string[];
}

export function ContractFixPanel() {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    setError(null);
    setFixResult(null);

    try {
      const result = await fixContractConsistency();
      setFixResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Wrench className="h-5 w-5" />
          Contract Data Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This tool fixes orphaned contract records that are causing the "draft unknown" issue.
            It links contracts to staff members and cleans up broken records.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">What this fix does:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Links orphaned contracts to staff members by name matching</li>
            <li>• Updates contract status from "draft unknown" to appropriate status</li>
            <li>• Removes truly broken contract records that cannot be linked</li>
            <li>• Preserves all valid contract data</li>
          </ul>
        </div>

        <Button
          onClick={handleFix}
          disabled={isFixing}
          className="w-full"
          variant={fixResult ? "outline" : "default"}
        >
          {isFixing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Fixing Contracts...
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-2" />
              Fix Contract Issues
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fixResult && (
          <div className="space-y-2">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Contract fix completed successfully!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                <div className="text-lg font-bold text-green-700">{fixResult.linked}</div>
                <div className="text-xs text-green-600">Contracts Linked</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                <div className="text-lg font-bold text-red-700">{fixResult.deleted}</div>
                <div className="text-xs text-red-600">Broken Records Removed</div>
              </div>
            </div>

            {fixResult.errors.length > 0 && (
              <div className="space-y-1">
                <h5 className="font-medium text-orange-700">Warnings:</h5>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {fixResult.errors.map((error, index) => (
                    <div key={index} className="text-xs p-1 bg-orange-100 rounded border">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}