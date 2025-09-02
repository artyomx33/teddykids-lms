import { useState } from "react";
import { Search, Filter, Download, Eye, Copy, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { listContracts, getSignedPdfUrl, getContractById } from "@/lib/contracts";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "signed":
      return <Badge className="bg-success/10 text-success hover:bg-success/20">Signed</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Pending</Badge>;
    case "draft":
      return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
    case "generated":
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Generated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const navigate = useNavigate();

  // Fetch contracts data
  const { data: contracts = [], isLoading, isError } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => listContracts(supabase),
  });

  // Handle view action
  const handleView = (id: string) => {
    navigate(`/contract/view/${id}`);
  };

  // Handle download action
  const handleDownload = async (id: string, pdfPath: string | null) => {
    if (!pdfPath) {
      toast.error("No PDF available for this contract");
      return;
    }

    try {
      const signedUrl = await getSignedPdfUrl(supabase, pdfPath);
      window.open(signedUrl, "_blank");
    } catch (error: any) {
      toast.error(`Failed to download PDF: ${error.message}`);
    }
  };

  // Handle duplicate action
  const handleDuplicate = async (id: string) => {
    try {
      const contract = await getContractById(supabase, id);
      if (contract && contract.query_params) {
        localStorage.setItem("prefill_contract", JSON.stringify(contract.query_params));
        navigate("/generate-contract");
        toast.success("Contract data loaded for duplication");
      } else {
        toast.error("Could not find contract data to duplicate");
      }
    } catch (error: any) {
      toast.error(`Failed to duplicate contract: ${error.message}`);
    }
  };

  // Filter contracts based on search term and filters
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.manager?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || contract.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Calculate stats
  const totalContracts = contracts.length;
  const signedContracts = contracts.filter(c => c.status === 'signed').length;
  const pendingContracts = contracts.filter(c => c.status === 'pending').length;
  const draftContracts = contracts.filter(c => c.status === 'draft' || c.status === 'generated').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all employee contracts
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          onClick={() => navigate("/generate-contract")}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalContracts}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Signed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {signedContracts}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {pendingContracts}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {draftContracts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Contract Management</CardTitle>
          <CardDescription>
            Search, filter, and manage all employee contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees or managers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="infant-care">Infant Care</SelectItem>
                <SelectItem value="toddler-care">Toddler Care</SelectItem>
                <SelectItem value="preschool">Preschool</SelectItem>
                <SelectItem value="after-school">After School</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2">Loading contracts...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center p-8 text-destructive">
              <p>Error loading contracts. Please try again.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No contracts found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{contract.employee_name}</TableCell>
                      <TableCell>{contract.manager}</TableCell>
                      <TableCell>{contract.department?.replace("-", " ")}</TableCell>
                      <TableCell>{contract.contract_type?.replace("-", " ")}</TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(contract.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(contract.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(contract.id, contract.pdf_path)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
