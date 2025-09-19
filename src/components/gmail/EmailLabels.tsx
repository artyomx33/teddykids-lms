import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailLabelsProps {
  labels: Array<{
    id: string;
    name: string;
    color: string;
    description?: string;
  }>;
  onRefresh: () => void;
}

export const EmailLabels = ({ labels, onRefresh }: EmailLabelsProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6B7280');
  const [newLabelDescription, setNewLabelDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const predefinedColors = [
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#EAB308', // yellow
    '#84CC16', // lime
    '#22C55E', // green
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#A855F7', // purple
    '#EC4899', // pink
    '#6B7280', // gray
  ];

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error('Please enter a label name');
      return;
    }

    setIsCreating(true);
    
    try {
      const { data, error } = await supabase
        .from('email_labels')
        .insert({
          name: newLabelName.trim(),
          color: newLabelColor,
          description: newLabelDescription.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Label created successfully');
      setIsCreateOpen(false);
      setNewLabelName('');
      setNewLabelColor('#6B7280');
      setNewLabelDescription('');
      onRefresh();
      
    } catch (error: any) {
      toast.error(`Failed to create label: ${error.message}`);
      console.error('Create label error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">TeddyMail Labels</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Create New Label
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="labelName">Label Name *</Label>
                <Input
                  id="labelName"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="e.g., Invoices, Staff, Reviews"
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="labelDescription">Description</Label>
                <Input
                  id="labelDescription"
                  value={newLabelDescription}
                  onChange={(e) => setNewLabelDescription(e.target.value)}
                  placeholder="Optional description..."
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewLabelColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        newLabelColor === color 
                          ? 'border-foreground scale-110' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      style={{ backgroundColor: color }}
                      type="button"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateLabel} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Label'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1">
        {labels.map((label) => (
          <div key={label.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: label.color }}
              ></div>
              <span className="text-sm">{label.name}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              0
            </Badge>
          </div>
        ))}
        
        {labels.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No labels yet. Create your first label to organize emails.
          </div>
        )}
      </div>
    </div>
  );
};