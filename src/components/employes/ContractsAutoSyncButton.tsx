import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { syncEmploymentToContracts, syncAllEmploymentToContracts } from "@/lib/syncEmploymentToContracts";
import { useQueryClient } from "@tanstack/react-query";

interface ContractsAutoSyncButtonProps {
  staffId?: string;
  syncAll?: boolean;
}

export function ContractsAutoSyncButton({ staffId, syncAll = false }: ContractsAutoSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const handleSync = async () => {
    setSyncing(true);
    
    try {
      let result;
      
      if (syncAll) {
        toast({
          title: "Syncing All Employment Data",
          description: "Creating contracts from employment data for all staff...",
        });
        
        result = await syncAllEmploymentToContracts();
      } else if (staffId) {
        toast({
          title: "Syncing Employment Data",
          description: "Creating contracts from employment data...",
        });
        
        result = await syncEmploymentToContracts(staffId);
      } else {
        throw new Error('Either staffId or syncAll must be provided');
      }
      
      if (result.success) {
        const contractsCount = 'totalContractsCreated' in result 
          ? result.totalContractsCreated 
          : result.contractsCreated || 0;
        
        toast({
          title: "Sync Complete",
          description: `Successfully created ${contractsCount} contract${contractsCount !== 1 ? 's' : ''} from employment data`,
          duration: 5000,
        });
        
        // Invalidate contracts queries to refetch
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
        queryClient.invalidateQueries({ queryKey: ['staffDetail'] });
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('[ContractsAutoSyncButton] Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || 'Failed to sync employment data to contracts',
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {syncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4" />
          {syncAll ? 'Sync All to Contracts' : 'Sync to Contracts'}
        </>
      )}
    </Button>
  );
}
