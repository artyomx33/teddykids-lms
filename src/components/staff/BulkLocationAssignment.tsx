import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface BulkLocationAssignmentProps {
  selectedStaffIds: string[];
  selectedStaffNames: string[];
  onSuccess: () => void;
  onClear: () => void;
}

interface Location {
  code: string;
  name: string;
  address: string;
}

export function BulkLocationAssignment({ 
  selectedStaffIds, 
  selectedStaffNames, 
  onSuccess, 
  onClear 
}: BulkLocationAssignmentProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("none");
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  // Fetch locations from database
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("code, name, address")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAssignLocation = async () => {
    if (!selectedLocation || selectedLocation === "none" || selectedStaffIds.length === 0) return;

    setIsAssigning(true);
    try {
      // Use employee_info table for LMS-specific data
      const { error } = await supabase
        .from("employee_info")
        .upsert(
          selectedStaffIds.map(id => ({ 
            staff_id: id, 
            assigned_location: selectedLocation
          })),
          { onConflict: 'staff_id' }
        );

      if (error) {
        console.error("Error assigning location:", error);
        toast({
          title: "Error assigning location",
          description: error.message, // Show actual error message
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Location assigned successfully",
        description: `Assigned ${selectedStaffIds.length} staff members to ${locations.find(l => l.code === selectedLocation)?.name}`,
      });

      onSuccess();
      onClear();
      setSelectedLocation("none");
    } catch (error) {
      console.error("Error assigning location:", error);
      toast({
        title: "Error assigning location",
        description: error instanceof Error ? error.message : "There was an error updating staff locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (selectedStaffIds.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {selectedStaffIds.length} staff selected
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 max-w-md">
            {selectedStaffNames.slice(0, 3).map((name, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
            {selectedStaffNames.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{selectedStaffNames.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Assign to location:</span>
        </div>
        
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select a location...</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.code} value={location.code}>
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">{location.address}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleAssignLocation}
          disabled={!selectedLocation || selectedLocation === "none" || isAssigning}
          size="sm"
        >
          {isAssigning ? "Assigning..." : "Assign Location"}
        </Button>
      </div>
    </div>
  );
}