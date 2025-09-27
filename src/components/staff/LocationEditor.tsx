import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface LocationEditorProps {
  staffId: string;
  staffName: string;
  currentLocation?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Location {
  code: string;
  name: string;
  address: string;
}

export function LocationEditor({ 
  staffId, 
  staffName, 
  currentLocation, 
  onSuccess, 
  onCancel 
}: LocationEditorProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>(currentLocation || "");
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleUpdateLocation = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("staff")
        .update({ location: selectedLocation || null })
        .eq("id", staffId);

      if (error) throw error;

      const locationName = selectedLocation 
        ? locations.find(l => l.code === selectedLocation)?.name 
        : "No location";

      toast({
        title: "Location updated",
        description: `${staffName}'s location has been updated to ${locationName}`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error updating location",
        description: "There was an error updating the staff location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          Update Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Update location for <span className="font-medium">{staffName}</span>
          </p>
          
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No location assigned</SelectItem>
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
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUpdating}
            size="sm"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleUpdateLocation}
            disabled={isUpdating}
            size="sm"
          >
            <Save className="h-4 w-4 mr-1" />
            {isUpdating ? "Updating..." : "Update Location"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}