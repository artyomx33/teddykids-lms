import { useState } from 'react';
import { MapPin, FileText, Heart, Zap, Utensils, Play, CheckCircle2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModuleProgress } from '@/modules/growbuddy/types/onboarding';

// Use placeholder SVG instead of imported image
const appiesMascot = '/placeholder.svg';

const expateGuideItems = [
  {
    id: 'bsn',
    icon: FileText,
    title: 'How to get a BSN',
    description: 'Burgerservicenummer (BSN) is your Dutch citizen service number. Required for work, banking, and healthcare.',
    steps: [
      'Visit your local municipality (gemeente) with passport and proof of address',
      'Fill out the registration form (GBA/BRP)',
      'Receive your BSN within 5-10 business days',
      'Keep your BSN safe - you\'ll need it for everything in the Netherlands'
    ]
  },
  {
    id: 'gemeente',
    icon: MapPin,
    title: 'Gemeente Registration',
    description: 'Register your address with the local municipality within 5 days of arrival.',
    steps: [
      'Find your local gemeente office online',
      'Book an appointment (uittreksel GBA/BRP)',
      'Bring passport, rental contract, and proof of income',
      'Complete registration forms',
      'Receive your registration confirmation'
    ]
  },
  {
    id: 'health-insurance',
    icon: Heart,
    title: 'Health Insurance',
    description: 'Health insurance is mandatory in the Netherlands. Choose between basic and comprehensive coverage.',
    steps: [
      'Compare insurers: Zilveren Kruis, VGZ, CZ, Menzis',
      'Basic coverage starts around €120-130/month',
      'Register within 4 months of arrival',
      'Consider dental and physiotherapy supplements',
      'Apply for healthcare allowance (zorgtoeslag) if eligible'
    ]
  },
  {
    id: 'utilities',
    icon: Zap,
    title: 'Utilities Setup',
    description: 'Set up electricity, gas, water, internet, and municipal taxes.',
    steps: [
      'Electricity/Gas: Vattenfall, Eneco, Essent, Budget Energie',
      'Water: Contact your local water company (Waternet, Evides, etc.)',
      'Internet: KPN, Ziggo, T-Mobile, Odido',
      'Municipal taxes (OZB): Automatic based on gemeente registration'
    ]
  }
];

const funPlaces = [
  { name: 'Albert Heijn', category: 'Supermarket', description: 'Most popular grocery chain in the Netherlands' },
  { name: 'Jumbo', category: 'Supermarket', description: 'Great prices and fresh products' },
  { name: 'HEMA', category: 'Department Store', description: 'Dutch favorite for household items and snacks' },
  { name: 'Etos', category: 'Pharmacy/Beauty', description: 'Health, beauty, and pharmacy products' },
  { name: 'Action', category: 'Discount Store', description: 'Affordable household items and surprises' },
  { name: 'Blokker', category: 'Home & Garden', description: 'Everything for your home' }
];

interface NetherlandsModuleProps {
  moduleProgress?: ModuleProgress;
  onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
}

export const NetherlandsModule = ({ moduleProgress, onUpdateProgress }: NetherlandsModuleProps) => {
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
        <h1 className="text-3xl font-bold text-foreground">Moving to the Netherlands? 🇳🇱</h1>
        <p className="text-muted-foreground text-lg">Your survival guide for living and working in the Netherlands</p>
        <Badge variant="secondary" className="px-4 py-2">
          Optional Module - For International Staff
        </Badge>
      </div>

      {/* Explainer Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Netherlands Survival Guide Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <Play className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Essential tips for expats in the Netherlands</p>
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

      {/* Essential Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Essential Steps for Expats</h2>
        
        {expateGuideItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <Card key={item.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary mr-3">{index + 1}.</span>
                    {item.title}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Steps to follow:</h4>
                  <ul className="space-y-2">
                    {item.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5">
                          {stepIndex + 1}
                        </div>
                        <span className="text-sm text-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fun Places */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Popular Places for Food & Shopping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funPlaces.map((place, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-soft transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{place.name}</h3>
                  <Badge variant="outline" className="text-xs">{place.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{place.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Survival Guide Download */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Complete Survival Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Expat Survival Guide for the Netherlands</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive PDF with contacts, forms, and detailed instructions
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">BSN Forms</Badge>
                <Badge variant="secondary">Emergency Contacts</Badge>
                <Badge variant="secondary">Dutch Phrases</Badge>
              </div>
            </div>
            <Button className="bg-gradient-primary">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complete Module */}
      <Card className="bg-gradient-success text-success-foreground">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Welcome to the Netherlands! 🇳🇱</h3>
          <p className="mb-4 opacity-90">
            You're all set with the essential information for living in the Netherlands. Ready for the final quiz?
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
    </div>
  );
};
