import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, XCircle, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleProgress, SafetyItem } from '@/modules/growbuddy/types/onboarding';

const safetyItems: SafetyItem[] = [
  // Never Do Items
  { id: 'hot-drinks', text: 'Bring hot drinks over 53°C near children', type: 'never-do', acknowledged: false },
  { id: 'private-photos', text: 'Take photos on personal phones', type: 'never-do', acknowledged: false },
  { id: 'personal-info', text: 'Share personal contact information with parents', type: 'never-do', acknowledged: false },
  { id: 'leave-children', text: 'Leave children unsupervised', type: 'never-do', acknowledged: false },
  
  // Always Do Items
  { id: 'greet-parents', text: 'Greet parents warmly when they arrive', type: 'must-do', acknowledged: false },
  { id: 'wash-hands', text: 'Wash hands before and after activities', type: 'must-do', acknowledged: false },
  { id: 'supervise-children', text: 'Maintain active supervision of all children', type: 'must-do', acknowledged: false },
  { id: 'report-incidents', text: 'Report all incidents immediately to management', type: 'must-do', acknowledged: false },
  { id: 'follow-allergies', text: 'Check and follow all allergy protocols', type: 'must-do', acknowledged: false },
  
  // Emergency Protocols
  { id: 'fire-exits', text: 'Know all fire exit routes and procedures', type: 'protocol', acknowledged: false },
  { id: 'emergency-contacts', text: 'Have emergency contact numbers readily available', type: 'protocol', acknowledged: false },
  { id: 'first-aid', text: 'Know location of first aid kit and trained first aiders', type: 'protocol', acknowledged: false }
];

interface SafetyModuleProps {
  moduleProgress?: ModuleProgress;
  onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
}

export const SafetyModule = ({ moduleProgress, onUpdateProgress }: SafetyModuleProps) => {
  const [acknowledgedItems, setAcknowledgedItems] = useState<Set<string>>(
    new Set(moduleProgress?.notes ? JSON.parse(moduleProgress.notes) : [])
  );

  const handleItemAcknowledge = (itemId: string, acknowledged: boolean) => {
    const newAcknowledgedItems = new Set(acknowledgedItems);
    if (acknowledged) {
      newAcknowledgedItems.add(itemId);
    } else {
      newAcknowledgedItems.delete(itemId);
    }
    setAcknowledgedItems(newAcknowledgedItems);
    onUpdateProgress({ notes: JSON.stringify(Array.from(newAcknowledgedItems)) });
  };

  const allItemsAcknowledged = safetyItems.every(item => acknowledgedItems.has(item.id));

  const handleCompleteModule = () => {
    onUpdateProgress({ completed: true });
  };

  const getItemsByType = (type: SafetyItem['type']) => {
    return safetyItems.filter(item => item.type === type);
  };

  const getTypeIcon = (type: SafetyItem['type']) => {
    switch (type) {
      case 'never-do': return XCircle;
      case 'must-do': return CheckCircle;
      case 'protocol': return AlertCircle;
      default: return Shield;
    }
  };

  const getTypeColor = (type: SafetyItem['type']) => {
    switch (type) {
      case 'never-do': return 'border-red-200 bg-red-50';
      case 'must-do': return 'border-green-200 bg-green-50';
      case 'protocol': return 'border-blue-200 bg-blue-50';
      default: return 'border-muted';
    }
  };

  const getTypeTitle = (type: SafetyItem['type']) => {
    switch (type) {
      case 'never-do': return 'What NOT to Do';
      case 'must-do': return 'What to ALWAYS Do';
      case 'protocol': return 'Emergency Protocols';
      default: return 'Safety Items';
    }
  };

  const renderSafetyItems = (type: SafetyItem['type']) => {
    const items = getItemsByType(type);
    const Icon = getTypeIcon(type);
    
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const isAcknowledged = acknowledgedItems.has(item.id);
          
          return (
            <Card key={item.id} className={`transition-all duration-200 ${getTypeColor(type)} ${
              isAcknowledged ? 'shadow-soft' : 'hover:shadow-soft'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`h-5 w-5 ${
                      type === 'never-do' ? 'text-red-600' :
                      type === 'must-do' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                    <span className={`${isAcknowledged ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isAcknowledged}
                      onCheckedChange={(checked) => handleItemAcknowledge(item.id, checked)}
                    />
                    {isAcknowledged && (
                      <Badge variant="secondary" className="text-xs">Acknowledged</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Safety & Conduct</h1>
        <p className="text-muted-foreground text-lg">Essential safety protocols and conduct guidelines</p>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant={allItemsAcknowledged ? "default" : "secondary"} className="px-4 py-2">
            {acknowledgedItems.size} of {safetyItems.length} items acknowledged
          </Badge>
        </div>
      </div>

      {/* Safety Tabs */}
      <Tabs defaultValue="never-do" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="never-do" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Never Do
          </TabsTrigger>
          <TabsTrigger value="must-do" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Always Do
          </TabsTrigger>
          <TabsTrigger value="protocol" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Protocols
          </TabsTrigger>
        </TabsList>

        <TabsContent value="never-do" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                {getTypeTitle('never-do')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSafetyItems('never-do')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="must-do" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                {getTypeTitle('must-do')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSafetyItems('must-do')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <AlertCircle className="h-5 w-5" />
                {getTypeTitle('protocol')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSafetyItems('protocol')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Safety Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Safety Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold text-foreground">Safety Poster</h3>
                <p className="text-sm text-muted-foreground">Visual safety reminders</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold text-foreground">Complete Safety Manual</h3>
                <p className="text-sm text-muted-foreground">Detailed safety procedures</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Module */}
      <Card className={allItemsAcknowledged ? "bg-gradient-success text-success-foreground" : "bg-gradient-primary text-primary-foreground"}>
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">
            {allItemsAcknowledged ? "Safety Training Complete!" : "Ready to Continue?"}
          </h3>
          <p className="mb-4 opacity-90">
            {allItemsAcknowledged 
              ? "You've acknowledged all safety protocols. You're ready for the final quiz!"
              : "Acknowledge all safety items to proceed to the next module"
            }
          </p>
          {allItemsAcknowledged && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
