import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Star, Upload } from "lucide-react";

export interface TimelineItem {
  id: string;
  type: 'review' | 'note' | 'certificate';
  date: string;
  title: string;
  description?: string;
  metadata?: {
    score?: number;
    raise?: boolean;
    note_type?: string;
    file_path?: string;
  };
}

interface StaffTimelineProps {
  items: TimelineItem[];
}

export function StaffTimeline({ items }: StaffTimelineProps) {
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'certificate':
        return <Upload className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTimelineBadge = (item: TimelineItem) => {
    if (item.type === 'review' && item.metadata?.score) {
      return (
        <Badge variant={item.metadata.score >= 4 ? "default" : "secondary"}>
          {item.metadata.score}/5
        </Badge>
      );
    }
    
    if (item.type === 'note' && item.metadata?.note_type) {
      const noteTypeColors = {
        positive: "bg-green-100 text-green-800 border-green-300",
        concern: "bg-yellow-100 text-yellow-800 border-yellow-300",
        warning: "bg-red-100 text-red-800 border-red-300",
        note: "bg-gray-100 text-gray-800 border-gray-300"
      };
      
      return (
        <Badge variant="outline" className={noteTypeColors[item.metadata.note_type as keyof typeof noteTypeColors] || noteTypeColors.note}>
          {item.metadata.note_type}
        </Badge>
      );
    }
    
    return null;
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getTimelineIcon(item.type)}
                </div>
                {index < items.length - 1 && (
                  <div className="h-12 w-px bg-border mt-2" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    {getTimelineBadge(item)}
                    {item.metadata?.raise && (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        💰 Raise
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}