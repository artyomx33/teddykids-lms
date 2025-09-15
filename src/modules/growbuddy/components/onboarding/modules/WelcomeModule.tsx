import { useState } from 'react';
import { Play, MapPin, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModuleProgress } from '@/modules/growbuddy/types/onboarding';

// Use placeholder SVG instead of imported image
const appiesMascot = '/placeholder.svg';

const locations = [
  { name: 'RBW - Rijnsburgerweg 35', address: 'Rijnsburgerweg 35, 2334 BH Leiden', phone: '+31 6 39004514' },
  { name: 'RB3/RB5 - Rijnsburgerweg 3 & 5', address: 'Rijnsburgerweg 3-5, 2334 BA Leiden', phone: '+31 6 43457460' },
  { name: 'LRZ - Lorentzkade 15a', address: 'Lorentzkade 15a, 2313 GB Leiden', phone: '+31 6 39004513' },
  { name: 'ZML - Zeemanlaan 22a', address: 'Zeemanlaan 22a, 2313 SZ Leiden', phone: '+31 6 57916750' },
  { name: 'TISA Leiden', address: 'Lorentzkade 15a, 2313 GB Leiden', phone: '+31 6 44513333' },
  { name: 'TISA Portugal', address: 'R. São Sebastião da Pedreira 27, 1050-010 Lisbon', phone: '+351 937 836 305' },
];

const managers = [
  { name: 'Sofia', role: 'RBW Location Energy Manager', email: 'sofia@teddykids.nl', phone: '+31 6 39004514' },
  { name: 'Pamela', role: 'RB3/RB5 Site Leader', email: 'pamela@teddykids.nl', phone: '+31 6 43457460' },
  { name: 'Antonella', role: 'LRZ Site Leader', email: 'antonela@teddykids.nl', phone: '+31 6 39004513' },
  { name: 'Meral', role: 'ZML Site Leader', email: 'meral@teddykids.nl', phone: '+31 6 57916750' },
  { name: 'Numa', role: 'TISA Leiden Site Leader', email: 'numa@tisaschool.nl', phone: '+31 6 44513333' },
  { name: 'Svetlana', role: 'ZML Pediatric Heart & Hug Coordinator', email: 'svetlana@teddykids.nl', phone: '+31 6 57916750' },
];

interface WelcomeModuleProps {
  moduleProgress?: ModuleProgress;
  onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
}

export const WelcomeModule = ({ moduleProgress, onUpdateProgress }: WelcomeModuleProps) => {
  const [videoWatched, setVideoWatched] = useState(moduleProgress?.videoWatched || false);

  const handleVideoWatch = () => {
    setVideoWatched(true);
    onUpdateProgress({ videoWatched: true });
  };

  const handleCompleteModule = () => {
    onUpdateProgress({ completed: true });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4">
          <img src={appiesMascot} alt="Appies" className="w-16 h-16" />
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-primary font-medium">"Ready to join the family? Welcome to Teddy Kids!"</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Welcome to the Teddy Family</h1>
        <p className="text-muted-foreground text-lg">Your journey with Teddy Kids starts here!</p>
      </div>

      {/* Welcome Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Welcome Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <Play className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Welcome to Teddy Kids - Introduction Video</p>
              <Button onClick={handleVideoWatch} className="bg-gradient-primary">
                {videoWatched ? 'Rewatch Video' : 'Play Video'}
              </Button>
            </div>
          </div>
          {videoWatched && (
            <div className="mt-3 flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Video completed</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Our Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {locations.map((location, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-soft transition-all">
                <h3 className="font-semibold text-foreground">{location.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                <p className="text-sm text-primary mt-2">{location.phone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Your Team Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {managers.map((manager, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {manager.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{manager.name}</h3>
                    <Badge variant="secondary" className="text-xs">{manager.role}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{manager.email}</p>
                  <p className="text-sm text-primary">{manager.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Annual Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold text-foreground">2024 Teddy Kids Calendar</h3>
              <p className="text-sm text-muted-foreground">Important dates, holidays, and training sessions</p>
            </div>
            <Button variant="outline">
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complete Module */}
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to Continue?</h3>
          <p className="mb-4 opacity-90">Mark this module as complete to proceed to The Teddy Code</p>
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
    </div>
  );
};
