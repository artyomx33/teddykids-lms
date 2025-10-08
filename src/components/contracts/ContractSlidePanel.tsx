import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StaffContract } from '@/lib/staff-contracts';
import { ContractDetailsSection } from './ContractDetailsSection';
import { ContractSalarySection } from './ContractSalarySection';
import { ContractFullText } from './ContractFullText';
import { ContractChangeHistory } from './ContractChangeHistory';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';

interface ContractSlidePanelProps {
  contractId: string | null;
  staffId?: string;
  staffName?: string;
  onClose: () => void;
}

export function ContractSlidePanel({
  contractId,
  staffId,
  staffName,
  onClose,
}: ContractSlidePanelProps) {
  // Fetch contract data
  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract-detail', contractId],
    queryFn: async () => {
      if (!contractId) return null;
      
      // If it's a generated contract from LMS
      if (contractId.startsWith('contract-')) {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', contractId)
          .single();
        
        if (error) throw error;
        return data;
      }
      
      // If it's an employes contract, we need to reconstruct it
      // For now, just return null and we'll handle employes contracts later
      return null;
    },
    enabled: !!contractId,
  });

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle print
  const handlePrint = () => {
    if (!contract) return;
    
    // Create print window with contract data
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Could not open print window. Please check popup blocker.');
      return;
    }
    
    // Generate print-friendly HTML
    const contractHTML = generatePrintHTML(contract);
    
    printWindow.document.write(contractHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    
    toast.success('Print dialog opened!');
  };

  // Handle email
  const handleEmail = () => {
    if (!contract) return;
    
    const employeeName = contract.employee_name || staffName || 'Employee';
    const subject = encodeURIComponent(`Contract - ${employeeName}`);
    const body = encodeURIComponent(`
Hi,

Please find the employment contract details for ${employeeName}.

Contract Period: ${contract.query_params?.startDate || 'N/A'} - ${contract.query_params?.endDate || 'N/A'}
Position: ${contract.query_params?.functionTitle || 'N/A'}

Best regards,
Teddy Kids HR Team
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.info('Email client opened. Please attach the contract PDF if needed.');
  };

  return (
    <AnimatePresence>
      {contractId && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Slide Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[60%] lg:w-[50%] 
                       bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                📋 Contract Details
                {staffName && (
                  <span className="text-sm text-muted-foreground font-normal">
                    - {staffName}
                  </span>
                )}
              </h2>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!contract || isLoading}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmail}
                  disabled={!contract || isLoading}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-destructive font-medium mb-2">
                    Error loading contract
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(error as Error).message}
                  </p>
                </div>
              )}

              {contract && (
                <div className="space-y-6">
                  {/* Contract Details Section */}
                  <ContractDetailsSection contract={contract} />
                  
                  <Separator />
                  
                  {/* Salary Section */}
                  <ContractSalarySection contract={contract} />
                  
                  <Separator />
                  
                  {/* Full Contract Text */}
                  <ContractFullText contract={contract} />
                  
                  <Separator />
                  
                  {/* Change History */}
                  {staffId && (
                    <ContractChangeHistory
                      contractId={contractId}
                      staffId={staffId}
                    />
                  )}
                </div>
              )}

              {!contract && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    Contract not found or not yet loaded
                  </p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper function to generate print-friendly HTML
function generatePrintHTML(contract: any): string {
  const employeeName = contract.employee_name || contract.query_params?.firstName + ' ' + contract.query_params?.lastName;
  const startDate = contract.query_params?.startDate || 'N/A';
  const endDate = contract.query_params?.endDate || 'N/A';
  const position = contract.query_params?.functionTitle || contract.query_params?.position || 'N/A';
  const hoursPerWeek = contract.query_params?.hoursPerWeek || 'N/A';
  const grossMonthly = contract.query_params?.grossMonthly || 'N/A';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contract - ${employeeName}</title>
        <style>
          @page { 
            margin: 2cm; 
            size: A4;
          }
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #0f172a;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            text-align: center;
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #1e40af;
            margin-top: 20px;
            font-size: 18px;
          }
          .section {
            margin: 20px 0;
          }
          .label {
            font-weight: bold;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .no-print {
            display: none;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Arbeidsovereenkomst</h1>
        
        <div class="section">
          <h2>Werknemer</h2>
          <table>
            <tr>
              <td class="label">Naam:</td>
              <td>${employeeName}</td>
            </tr>
            <tr>
              <td class="label">Functie:</td>
              <td>${position}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Contract Periode</h2>
          <table>
            <tr>
              <td class="label">Startdatum:</td>
              <td>${startDate}</td>
            </tr>
            <tr>
              <td class="label">Einddatum:</td>
              <td>${endDate}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Arbeidsvoorwaarden</h2>
          <table>
            <tr>
              <td class="label">Uren per week:</td>
              <td>${hoursPerWeek}</td>
            </tr>
            <tr>
              <td class="label">Bruto salaris:</td>
              <td>€${grossMonthly} per maand</td>
            </tr>
          </table>
        </div>
        
        <div class="section" style="margin-top: 40px;">
          <p style="color: #64748b; font-size: 12px;">
            Gegenereerd op ${new Date().toLocaleDateString('nl-NL')}
          </p>
        </div>
      </body>
    </html>
  `;
}

