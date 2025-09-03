import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Target, Globe, Sprout, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ModuleProgress, ValueReflection } from '@/modules/growbuddy/types/onboarding';

const teddyValues: ValueReflection[] = [
  {
    value: 'Children Come First — Always',
    mantra: '🧒 Every decision we make puts the child at the center',
    description: 'At Teddy Kids, children are the heart of everything we do. Their safety, happiness, and development guide every choice we make. This means listening to them, respecting their needs, and creating environments where they can thrive.'
  },
  {
    value: 'Love Is Our Foundation',
    mantra: '💖 We approach every interaction with genuine care and warmth',
    description: 'Love creates the foundation for trust, learning, and growth. We show love through patience, understanding, kindness, and by celebrating each child\'s unique personality and achievements.'
  },
  {
    value: 'Clarity Over Control',
    mantra: '🎯 Clear expectations create freedom and confidence',
    description: 'Instead of strict rules, we believe in clear, consistent communication. When everyone understands expectations, children and staff can make better choices and feel more confident in their actions.'
  },
  {
    value: 'One World, Many Ways',
    mantra: '🌍 We celebrate diversity and embrace different perspectives',
    description: 'Every family, culture, and individual brings unique strengths. We honor these differences and create inclusive environments where everyone feels valued and respected for who they are.'
  },
  {
    value: 'Growth Through Trust',
    mantra: '🌱 Trust allows everyone to flourish and reach their potential',
    description: 'When children, parents, and staff feel trusted, they take ownership of their growth. We build trust through consistency, honesty, and by believing in everyone\'s capacity to learn and improve.'
  },
  {
    value: 'Professionalism With Playfulness',
    mantra: '🎈 We maintain high standards while keeping joy in our work',
    description: 'Excellence doesn\'t mean being serious all the time. We combine professional expertise with genuine joy, creativity, and playfulness to create the best possible experience for children and families.'
  }
];

interface ValuesModuleProps {
  moduleProgress?: ModuleProgress;
  onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
}

export const ValuesModule = ({ moduleProgress, onUpdateProgress }: ValuesModuleProps) => {
  const [currentValueIndex, setCurrentValueIndex] = useState(0);
  const [reflections, setReflections] = useState<Record<number, string>>(
    moduleProgress?.notes ? JSON.parse(moduleProgress.notes) : {}
  );

  const currentValue = teddyValues[currentValueIndex];
  const isLastValue = currentValueIndex === teddyValues.length - 1;
  const allReflectionsComplete = teddyValues.every((_, index) => reflections[index]?.trim());

  const handleReflectionChange = (text: string) => {
    const newReflections = { ...reflections, [currentValueIndex]: text };
    setReflections(newReflections);
    onUpdateProgress({ notes: JSON.stringify(newReflections) });
  };

  const handleNext = () => {
    if (!isLastValue) {
      setCurrentValueIndex(currentValueIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentValueIndex > 0) {
      setCurrentValueIndex(currentValueIndex - 1);
    }
  };

  const handleCompleteModule = () => {
    onUpdateProgress({ completed: true });
  };

  const getValueIcon = (index: number) => {
    const icons = [Heart, Heart, Target, Globe, Sprout, Sparkles];
    return icons[index] || Heart;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">The Teddy Code</h1>
        <p className="text-muted-foreground text-lg">Our core values that guide everything we do</p>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{currentValueIndex + 1} of {teddyValues.length}</span>
          </div>
          <Progress value={((currentValueIndex + 1) / teddyValues.length) * 100} className="w-full" />
        </div>
      </div>

      {/* Value Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            {(() => {
              const Icon = getValueIcon(currentValueIndex);
              return <Icon className="h-6 w-6 text-primary" />;
            })()}
            {currentValue.value}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mantra */}
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-lg font-medium text-primary">{currentValue.mantra}</p>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{currentValue.description}</p>
          </div>

          {/* Reflection Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              What does this value mean to you in your work with children?
            </label>
            <Textarea
              placeholder="Share your thoughts and how you'll apply this value in your daily work..."
              value={reflections[currentValueIndex] || ''}
              onChange={(e) => handleReflectionChange(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Take your time to reflect deeply. This will help you internalize our values.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentValueIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Value
        </Button>

        <div className="flex gap-2">
          {teddyValues.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentValueIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentValueIndex 
                  ? 'bg-primary' 
                  : reflections[index]?.trim()
                    ? 'bg-success'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={isLastValue}
          className={!isLastValue ? 'bg-gradient-primary' : ''}
        >
          Next Value
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Complete Module */}
      <Card className={allReflectionsComplete ? "bg-gradient-success text-success-foreground" : "bg-gradient-primary text-primary-foreground"}>
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">
            {allReflectionsComplete ? "Values Reflection Complete!" : "Ready to Continue?"}
          </h3>
          <p className="mb-4 opacity-90">
            {allReflectionsComplete 
              ? "You've reflected on all our core values. You're ready to learn about daily life at Teddy Kids."
              : "Complete all value reflections to proceed to the next module"
            }
          </p>
          {allReflectionsComplete && (
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
