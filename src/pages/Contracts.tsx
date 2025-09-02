import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Eye, Copy, FileDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock contract data - in a real app, this would come from an API
const mockContracts = [
  {
    id: "1",
    employeeName: "Sarah Johnson",
    manager: "Mike Chen",
    status: "signed",
    signedAt: "2024-01-15",
    contractType: "full-time",
    department: "Infant Care",
    position: "Childcare Educator",
    salary: "€38,000"
  },
  {
    id: "2",
    employeeName: "Alex Rodriguez",
    manager: "Lisa Wang",
    status: "pending",
    signedAt: null,
    contractType: "part-time",
    department: "Toddler Care",
    position: "Assistant Educator",
    salary: "€28,000"
  },
  {
    id: "3",
    employeeName: "Emma Thompson",
    manager: "David Kim",
    status: "signed",
    signedAt: "2024-01-12",
    contractType: "full-time",
    department: "Preschool",
    position: "Lead Educator",
    salary: "€42,000"
  },
  {
    id: "4",
    employeeName: "James Wilson",
    manager: "Anna Brown",
    status: "draft",
    signedAt: null,
    contractType: "temporary",
    department: "After School",
    position: "Substitute Teacher",
    salary: "€25,000"
  },
  {
    id: "5",
    employeeName: "Maria Garcia",
    manager: "Tom Lee",
    status: "signed",
    signedAt: "2024-01-10",
    contractType: "full-time",
    department: "Administration",
    position: "Administrative Assistant",
    salary: "€35,000"
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "signed":
      return <Badge className="bg-success/10 text-success hover:bg-success/20">Signed</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Pending</Badge>;
    case "draft":
      return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();
  
  const contractTypes = [
    { value: "all", label: "All Types" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "temporary", label: "Temporary" },
    { value: "casual", label: "Casual" }
  ];

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || contract.contractType === filterType;
    
    return matchesSearch && matchesType;
  });
  
  const handleDuplicate = (contractId: string) => {
    toast({
      title: "Contract Duplicated",
      description: "A copy of the contract has been created in draft status.",
    });
  };
  
  const handleExport = (contractId: string) => {
    toast({
      title: "Export Started",
      description: "The contract PDF is being generated and will download shortly.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage employment contracts and agreements
          </p>
        </div>
        <Link to="/generate-contract">
          <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </Link>
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
            <div className="text-2xl font-bold text-foreground">{mockContracts.length}</div>
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
              {mockContracts.filter(c => c.status === 'signed').length}
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
              {mockContracts.filter(c => c.status === 'pending').length}
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
              {mockContracts.filter(c => c.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Find contracts by employee name, manager, position, or contract type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Contract Type Filter */}
            <div className="sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || filterType !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Active Filters Display */}
          {filterType !== "all" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                Type: {contractTypes.find(t => t.value === filterType)?.label}
                <button 
                  onClick={() => setFilterType("all")}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signed At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{contract.employeeName}</TableCell>
                  <TableCell>{contract.manager}</TableCell>
                  <TableCell>{contract.position}</TableCell>
                  <TableCell className="capitalize">{contract.contractType.replace('-', ' ')}</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link to={`/contracts/${contract.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Copy className="w-4 h-4 mr-1" />
                            Duplicate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Duplicate Contract</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will create a copy of the contract as a draft. You can then modify it as needed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDuplicate(contract.id)}>
                              Duplicate Contract
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button size="sm" variant="outline" onClick={() => handleExport(contract.id)}>
                        <FileDown className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* No Results Message */}
          {filteredContracts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No contracts found matching your search criteria.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}