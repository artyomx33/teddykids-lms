import { useState } from "react";
import { Users, Search, UserCheck, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MentorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  intern?: {
    id: string;
    name: string;
    year: number;
  };
}

// Mock mentor data
const availableMentors = [
  {
    id: "mentor-1",
    name: "Lisa Wang",
    department: "Operations",
    experience: "5 years",
    currentInterns: 2,
    maxInterns: 3,
    specialties: ["Document Processing", "Administrative Excellence", "Team Leadership"],
    rating: 4.8
  },
  {
    id: "mentor-2", 
    name: "Mike Chen",
    department: "Care Services",
    experience: "7 years",
    currentInterns: 1,
    maxInterns: 4,
    specialties: ["Child Care", "Safety Protocols", "Emergency Response"],
    rating: 4.9
  },
  {
    id: "mentor-3",
    name: "Sofia Martinez",
    department: "Administration",
    experience: "4 years",
    currentInterns: 0,
    maxInterns: 2,
    specialties: ["Communication", "Project Management", "Quality Assurance"],
    rating: 4.7
  },
  {
    id: "mentor-4",
    name: "David Kim", 
    department: "Support",
    experience: "6 years",
    currentInterns: 3,
    maxInterns: 3,
    specialties: ["Technical Support", "System Training", "Problem Solving"],
    rating: 4.6
  }
];

export function MentorAssignmentModal({ isOpen, onClose, intern }: MentorAssignmentModalProps) {
  const [selectedMentor, setSelectedMentor] = useState<string>("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const filteredMentors = availableMentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = !filterDepartment || mentor.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAssign = async () => {
    if (!selectedMentor) return;
    
    setIsAssigning(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mentor = availableMentors.find(m => m.id === selectedMentor);
      
      toast({
        title: "🎉 Mentor Assigned Successfully!",
        description: `${intern?.name} is now mentored by ${mentor?.name}. Assignment starts ${new Date(startDate).toLocaleDateString()}.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign mentor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedMentorData = availableMentors.find(m => m.id === selectedMentor);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Assign Mentor
          </DialogTitle>
          <DialogDescription>
            {intern ? `Find the perfect mentor for ${intern.name} (Year ${intern.year})` : "Assign a mentor to an intern"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search Mentors</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Filter by Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Care Services">Care Services</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Assignment Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Mentor Selection Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Available Mentors ({filteredMentors.length})</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMentors.map((mentor) => {
                const isSelected = selectedMentor === mentor.id;
                const isAvailable = mentor.currentInterns < mentor.maxInterns;
                
                return (
                  <Card 
                    key={mentor.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : isAvailable 
                          ? 'hover:shadow-md hover:bg-muted/50' 
                          : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => isAvailable && setSelectedMentor(mentor.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-primary" />
                          {mentor.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            ⭐ {mentor.rating}
                          </Badge>
                          {isSelected && (
                            <Badge className="bg-success">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium">{mentor.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium">{mentor.experience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Load:</span>
                          <span className={`font-medium ${
                            mentor.currentInterns >= mentor.maxInterns ? 'text-warning' : 'text-success'
                          }`}>
                            {mentor.currentInterns}/{mentor.maxInterns} interns
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {!isAvailable && (
                        <div className="bg-warning/10 border border-warning/20 rounded-md p-2">
                          <p className="text-xs text-warning font-medium">
                            ⚠️ At capacity - contact admin for exceptions
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Selected Mentor Summary */}
          {selectedMentorData && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-primary">
                  🎯 Assignment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Intern:</p>
                    <p className="font-medium">{intern?.name} (Year {intern?.year})</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mentor:</p>
                    <p className="font-medium">{selectedMentorData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department:</p>
                    <p className="font-medium">{selectedMentorData.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date:</p>
                    <p className="font-medium">{new Date(startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-1">Key Focus Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMentorData.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedMentor || isAssigning}
              className="bg-gradient-primary"
            >
              {isAssigning ? (
                <>
                  <Calendar className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign Mentor
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}