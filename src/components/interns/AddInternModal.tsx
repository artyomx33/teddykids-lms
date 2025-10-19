import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddInternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StaffOption {
  id: string;
  full_name: string;
  email: string | null;
  is_intern?: boolean | null;
}

export function AddInternModal({ isOpen, onClose, onSuccess }: AddInternModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffOption | null>(null);
  const [internYear, setInternYear] = useState<string>("1");
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state whenever the dialog opens
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setStaffOptions([]);
      setSelectedStaff(null);
      setInternYear("1");
    }
  }, [isOpen]);

  // Load staff directory when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingStaff(true);
    supabase
      .from("staff_with_lms_data")
      .select("id, full_name, email, is_intern")
      .order("full_name")
      .limit(500)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load staff", error);
          toast({
            title: "Could not load staff",
            description: error.message,
            variant: "destructive",
          });
          setStaffOptions([]);
        } else {
          setStaffOptions((data || []).filter((option) => !option.is_intern));
        }
      })
      .finally(() => setIsLoadingStaff(false));
  }, [isOpen, toast]);

  const filteredResults = useMemo(() => {
    if (staffOptions.length === 0) return [];

    const trimmed = searchTerm.trim().toLowerCase();
    if (trimmed.length < 2) {
      return staffOptions.slice(0, 12);
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    return staffOptions
      .filter((option) => {
        const haystack = `${option.full_name ?? ""} ${option.email ?? ""}`.toLowerCase();
        return words.every((word) => haystack.includes(word));
      })
      .slice(0, 12);
  }, [searchTerm, staffOptions]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedStaff) {
      toast({
        title: "Select a staff member",
        description: "Search and pick the staff member you want to tag as an intern.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from("employee_info")
      .upsert({
        staff_id: selectedStaff.id,
        is_intern: true,
        intern_year: Number(internYear) || 1,
      });

    setIsSubmitting(false);

    if (error) {
      console.error("Failed to add intern", error);
      toast({
        title: "Could not add intern",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Intern added",
      description: `${selectedStaff.full_name} is now marked as an intern`,
    });

    onSuccess?.();
    onClose();
  };

  const canSubmit = useMemo(() => !!selectedStaff && !isSubmitting, [selectedStaff, isSubmitting]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Intern</DialogTitle>
          <DialogDescription>
            Search for a staff member and mark them as an intern. You can set their intern year now or update it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="staff-search">Staff Member</Label>
            <Input
              id="staff-search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSelectedStaff(null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Type at least two characters to search the staff directory. Staff already marked as interns are hidden from the results.
            </p>
            {selectedStaff && (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <div className="font-medium">{selectedStaff.full_name}</div>
                <div className="text-muted-foreground">{selectedStaff.email ?? "No email on file"}</div>
              </div>
            )}
            <ScrollArea className="h-40 rounded-md border">
              <div className="divide-y">
                {isLoadingStaff ? (
                  <div className="p-3 text-sm text-muted-foreground">Loading staff...</div>
                ) : filteredResults.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No eligible staff found</div>
                ) : (
                  filteredResults.map((option) => {
                    const isActive = selectedStaff?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                        onClick={() => setSelectedStaff(option)}
                      >
                        <div className="font-medium">{option.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.email ?? "No email provided"}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label>Intern Year</Label>
            <Select value={internYear} onValueChange={setInternYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select intern year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

