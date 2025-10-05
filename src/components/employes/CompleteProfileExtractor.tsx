import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { extractCompleteEmployeeProfile, downloadExtractionReport } from '@/lib/extractCompleteProfile';

export function CompleteProfileExtractor() {
  const [email, setEmail] = useState('adelkajarosova@seznam.cz');
  const [staffId, setStaffId] = useState('8842f515-e4a3-40a4-bcfc-641399463ecf');
  const [isExtracting, setIsExtracting] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleExtraction = async () => {
    if (!email && !staffId) {
      toast.error('Please provide either email or staff ID');
      return;
    }

    setIsExtracting(true);
    setReport(null);

    try {
      console.log('Starting complete profile extraction...');
      const result = await extractCompleteEmployeeProfile(email || undefined, staffId || undefined);
      
      console.log('Extraction completed:', result);
      setReport(result);

      if (result.extraction_summary.success) {
        toast.success(`Extraction complete! ${result.extraction_summary.data_points_extracted} data points extracted`, {
          description: `Found ${result.salary_progression.total_records} salary records and ${result.contract_timeline.total_contracts} contracts`
        });
      } else {
        toast.warning('Extraction completed with errors', {
          description: result.extraction_summary.errors.join(', ')
        });
      }
    } catch (error: any) {
      console.error('Extraction failed:', error);
      toast.error('Extraction failed', {
        description: error.message
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    const employeeName = report.employee.basic_info?.full_name || 'employee';
    const filename = `${employeeName.toLowerCase().replace(/\s+/g, '_')}_complete_extraction_${new Date().toISOString().split('T')[0]}.md`;
    
    downloadExtractionReport(report, filename);
    toast.success('Report downloaded!', {
      description: `Saved as ${filename}`
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Complete Profile Extraction</CardTitle>
        </div>
        <CardDescription>
          Extract ALL available data for a specific employee from Employes.nl and generate a comprehensive MD report.
          Tests all endpoints, extracts nested employment data, salary progression, and contract timeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="employee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staffId">LMS Staff ID (Optional)</Label>
            <Input
              id="staffId"
              type="text"
              placeholder="UUID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExtraction}
            disabled={isExtracting || (!email && !staffId)}
            className="flex-1"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting Data...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Extract Complete Profile
              </>
            )}
          </Button>

          {report && (
            <Button
              onClick={handleDownload}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>

        {report && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              {report.extraction_summary.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {report.extraction_summary.success ? 'Extraction Successful!' : 'Extraction Completed with Errors'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Employee: {report.employee.basic_info?.full_name || 'Unknown'}
                  {report.employee.employes_id && ` (ID: ${report.employee.employes_id})`}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Data Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.extraction_summary.data_points_extracted}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Salary Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.salary_progression.total_records}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.contract_timeline.total_contracts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Employment Periods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.employment_history.total_periods}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Endpoints Tested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {report.endpoints_tested.slice(0, 5).map((endpoint: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      {endpoint.success ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="font-mono text-xs truncate">
                        {endpoint.endpoint.split('/').slice(-2).join('/')}
                      </span>
                    </div>
                  ))}
                  {report.endpoints_tested.length > 5 && (
                    <p className="text-muted-foreground text-xs">
                      + {report.endpoints_tested.length - 5} more endpoints
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {report.extraction_summary.errors.length > 0 && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-sm text-destructive">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {report.extraction_summary.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Next Steps:</strong> Download the complete report to see all extracted data including
                detailed salary progression, contract timeline, employment history, and API endpoint test results.
                This report serves as the foundation for designing proper data storage and extraction for all employees.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
