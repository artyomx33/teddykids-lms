import { useState } from 'react';
import { Clock, Smartphone, Camera, Coffee, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ModuleProgress } from '@/modules/growbuddy/types/onboarding';

const dailyLifeItems = [
  {
    id: 'hygiene',
    icon: AlertTriangle,
    title: 'Hygiene Rules',
    description: 'Wash hands regularly, sanitize surfaces, follow health protocols',
    category: 'health'
  },
  {
    id: 'work-hours',
    icon: Clock,
    title: 'Work Hours & Expectations',
    description: 'Arrive on time, follow shift schedules, communicate absences early',
    category: 'schedule'
  },
  {
    id: 'whatsapp',
    icon: Smartphone,
    title: 'WhatsApp/Communication Policies',
    description: 'Use official channels, maintain professionalism, respect boundaries',
    category: 'communication'
  },
  {
    id: 'phone-media',
    icon: Camera,
    title: 'Phone and Media Rules',
    description: 'No personal phones during childcare, follow photo consent protocols',
    category: 'media'
  },
  {
    id: 'food-handling',
    icon: Coffee,
    title: 'Food Handling & Allergy Checks',
    description: 'Check allergy lists, follow food safety protocols, monitor dietary restrictions',
    category: 'safety'
  }
];

interface DailyLifeModuleProps {
  moduleProgress?: ModuleProgress;
  onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
}

export const DailyLifeModule = ({ moduleProgress, onUpdateProgress }: DailyLifeModuleProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(moduleProgress?.notes ? JSON.parse(moduleProgress.notes) : [])
  );

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
    }
    setCheckedItems(newCheckedItems);
    onUpdateProgress({ notes: JSON.stringify(Array.from(newCheckedItems)) });
  };

  const allItemsChecked = dailyLifeItems.every(item => checkedItems.has(item.id));

  const handleCompleteModule = () => {
    onUpdateProgress({ completed: true });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'bg-green-100 text-green-800 border-green-200',
      schedule: 'bg-blue-100 text-blue-800 border-blue-200',
      communication: 'bg-purple-100 text-purple-800 border-purple-200',
      media: 'bg-orange-100 text-orange-800 border-orange-200',
      safety: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Daily Life at Teddy Kids</h1>
        <p className="text-muted-foreground text-lg">Essential guidelines for your everyday work</p>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant={allItemsChecked ? "default" : "secondary"} className="px-4 py-2">
            {checkedItems.size} of {dailyLifeItems.length} items acknowledged
          </Badge>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {dailyLifeItems.map((item) => {
          const Icon = item.icon;
          const isChecked = checkedItems.has(item.id);
          
          return (
            <Card key={item.id} className={`transition-all duration-200 ${
              isChecked 
                ? 'border-success bg-success/5 shadow-soft' 
                : 'hover:shadow-soft border-border'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={item.id}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className={`p-2 rounded-lg ${isChecked ? 'bg-success/20' : 'bg-muted'}`}>
                      <Icon className={`h-5 w-5 ${isChecked ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.title}
                      </h3>
                      <Badge variant="outline" className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  
                  {isChecked && (
                    <CheckCircle2 className="h-5 w-5 text-success mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cheat Sheet Download */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Your First Day Cheat Sheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Quick Reference Guide</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Printable checklist for your first few days at Teddy Kids
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complete Module */}
      {allItemsChecked && (
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Daily Guidelines Acknowledged!</h3>
            <p className="mb-4 opacity-90">
              You've reviewed all the essential daily guidelines. Ready to learn about safety and conduct?
            </p>
            <Button 
              onClick={handleCompleteModule}
              variant="secondary"
              size="lg"
              disabled={moduleProgress?.completed}
              className="bg-background text-foreground hover:bg-background/90"
            >
              {moduleProgress?.completed ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5 text-success" />
                  Module Complete
                </>
              ) : (
                'Mark Module Complete'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
