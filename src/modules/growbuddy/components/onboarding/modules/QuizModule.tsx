import { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Download, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModuleProgress, QuizQuestion } from '@/modules/growbuddy/types/onboarding';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'temp-limit',
    question: 'What is the maximum temperature allowed for drinks around children?',
    type: 'multiple-choice',
    options: ['45°C', '53°C', '60°C', '70°C'],
    correctAnswer: '53°C',
    required: true
  },
  {
    id: 'clarity-control',
    question: 'What does "Clarity over Control" mean to you in your daily work?',
    type: 'text',
    required: true
  },
  {
    id: 'never-allowed',
    question: 'Which items are NEVER allowed in the childcare environment? (Select all that apply)',
    type: 'multi-select',
    options: [
      'Hot drinks over 53°C',
      'Personal phone photography',
      'Sharing personal contact information',
      'Leaving children unsupervised',
      'First aid kit'
    ],
    correctAnswer: ['Hot drinks over 53°C', 'Personal phone photography', 'Sharing personal contact information', 'Leaving children unsupervised'],
    required: true
  },
  {
    id: 'children-first',
    question: 'True or False: "Children Come First" means we should always prioritize children\'s immediate wants.',
    type: 'yes-no',
    correctAnswer: 'false',
    required: true
  },
  {
    id: 'emergency-protocol',
    question: 'In case of an emergency, what should be your first priority?',
    type: 'multiple-choice',
    options: [
      'Call the manager',
      'Ensure children\'s immediate safety',
      'Document the incident',
      'Contact parents'
    ],
    correctAnswer: 'Ensure children\'s immediate safety',
    required: true
  },
  {
    id: 'values-application',
    question: 'How will you apply the Teddy Kids values in your first week? Give specific examples.',
    type: 'text',
    required: true
  },
  {
    id: 'hygiene-protocol',
    question: 'When should you wash your hands during your shift? (Select all that apply)',
    type: 'multi-select',
    options: [
      'Before starting your shift',
      'After using the bathroom',
      'Before handling food',
      'After cleaning up messes',
      'After outdoor activities',
      'Before going home'
    ],
    correctAnswer: ['Before starting your shift', 'After using the bathroom', 'Before handling food', 'After cleaning up messes', 'After outdoor activities'],
    required: true
  },
  {
    id: 'professional-playfulness',
    question: 'Describe how you would balance "Professionalism with Playfulness" when dealing with a difficult situation.',
    type: 'text',
    required: true
  }
];

interface QuizModuleProps {
  moduleProgress?: ModuleProgress;
  onUpdateProgress: (updates: Partial<ModuleProgress>) => void;
}

export const QuizModule = ({ moduleProgress, onUpdateProgress }: QuizModuleProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    const scorableQuestions = quizQuestions.filter(q => q.correctAnswer);

    scorableQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      if (question.type === 'multi-select') {
        const correctSet = new Set(question.correctAnswer as string[]);
        const userSet = new Set(userAnswer as string[] || []);
        if (correctSet.size === userSet.size && 
            [...correctSet].every(answer => userSet.has(answer))) {
          correctAnswers++;
        }
      } else if (question.type === 'yes-no') {
        const isCorrect = (userAnswer === 'yes' && question.correctAnswer === 'true') ||
                         (userAnswer === 'no' && question.correctAnswer === 'false');
        if (isCorrect) correctAnswers++;
      } else if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / scorableQuestions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    setQuizScore(score);
    setQuizCompleted(true);
    setShowResults(true);
    onUpdateProgress({ 
      completed: true, 
      quizScore: score,
      notes: JSON.stringify(answers)
    });
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setQuizCompleted(false);
    setQuizScore(null);
    setShowResults(false);
  };

  const currentQ = quizQuestions[currentQuestion];
  const allQuestionsAnswered = quizQuestions.every(q => 
    answers[q.id] && (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : answers[q.id])
  );

  const renderQuestion = (question: QuizQuestion) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={answer as string || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'yes-no':
        return (
          <RadioGroup
            value={answer as string || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        );

      case 'multi-select':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={(answer as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = (answer as string[]) || [];
                    if (checked) {
                      handleAnswerChange(question.id, [...currentAnswers, option]);
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter(a => a !== option));
                    }
                  }}
                />
                <Label htmlFor={option} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <Textarea
            placeholder="Type your answer here..."
            value={answer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="min-h-[100px] resize-none"
          />
        );

      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Award className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Quiz Complete!</h1>
          <Badge variant="default" className="text-lg px-4 py-2">
            Score: {quizScore}%
          </Badge>
        </div>

        <Card className={`${quizScore! >= 80 ? 'bg-gradient-success' : 'bg-gradient-primary'} text-white`}>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {quizScore! >= 80 ? 'Congratulations! 🎉' : 'Good Effort! 💪'}
            </h2>
            <p className="text-lg opacity-90 mb-6">
              {quizScore! >= 80
                ? 'You\'ve successfully completed the Teddy Kids onboarding program!'
                : 'You can retake the quiz to improve your score.'}
            </p>
            
            {quizScore! >= 80 ? (
              <div className="space-y-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🎓 Certification Earned</h3>
                  <p className="text-sm opacity-90">
                    Teddy Kids Staff Onboarding - Completed {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="secondary"
                  className="bg-white text-foreground hover:bg-white/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleRetakeQuiz}
                variant="secondary"
                className="bg-white text-foreground hover:bg-white/90"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
            )}
          </CardContent>
        </Card>

        {quizScore! >= 80 && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Welcome to the Teddy Family! 🧸</h3>
              <p className="text-muted-foreground">
                You're now ready to start your amazing journey with Teddy Kids. 
                Your dedication to learning our values and protocols shows you'll be a wonderful addition to our team!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Final Quiz & Certification</h1>
        <p className="text-muted-foreground text-lg">Test your knowledge and earn your Teddy Kids certification</p>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="px-4 py-2">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </Badge>
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              {currentQuestion + 1}
            </span>
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderQuestion(currentQ)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          variant="outline"
          disabled={currentQuestion === 0}
        >
          Previous Question
        </Button>

        <div className="flex gap-1">
          {quizQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentQuestion 
                  ? 'bg-primary' 
                  : answers[quizQuestions[index].id]
                    ? 'bg-success'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {currentQuestion === quizQuestions.length - 1 ? (
          <Button
            onClick={handleSubmitQuiz}
            disabled={!allQuestionsAnswered}
            className="bg-gradient-primary"
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(Math.min(quizQuestions.length - 1, currentQuestion + 1))}
            className="bg-gradient-primary"
          >
            Next Question
          </Button>
        )}
      </div>

      {/* Completion Status */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quiz Progress</span>
            <span className="text-sm font-medium">
              {Object.keys(answers).length} of {quizQuestions.length} questions answered
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
