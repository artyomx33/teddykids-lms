import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Brain, Lightbulb, HelpCircle, BookOpen, Trophy } from 'lucide-react';
import { ConfettiCelebration } from '@/components/celebrations/ConfettiCelebration';
import type {
  KnowledgeContentNode,
  KnowledgeDocumentSection,
} from '@/modules/growbuddy/types/knowledge';
import { createSanitizedContentNodes } from '@/modules/growbuddy/data/sanitize';

interface DocumentSectionProps {
  section: KnowledgeDocumentSection;
  isCompleted: boolean;
  onComplete: (score: number) => void | Promise<void>;
}

const renderContentNode = (
  node: KnowledgeContentNode,
  key: string,
): React.ReactNode => {
  if (node.type === 'text') {
    return node.value;
  }

  const childElements = (node.children ?? []).map((child, index) =>
    renderContentNode(child, `${key}-${index}`),
  );

  switch (node.name) {
    case 'p':
      return (
        <p key={key} className="mb-4 leading-relaxed">
          {childElements}
        </p>
      );
    case 'strong':
      return (
        <strong key={key}>{childElements}</strong>
      );
    case 'em':
      return (
        <em key={key}>{childElements}</em>
      );
    case 'ul':
      return (
        <ul key={key} className="mb-4 list-disc space-y-2 pl-6">
          {childElements}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="mb-4 list-decimal space-y-2 pl-6">
          {childElements}
        </ol>
      );
    case 'li':
      return (
        <li key={key} className="leading-relaxed">
          {childElements}
        </li>
      );
    case 'a': {
      const attributes: Record<string, string> = {
        target: '_blank',
        rel: 'noopener noreferrer',
        ...(node.attributes ?? {}),
      };

      if (!attributes.href) {
        delete attributes.target;
        delete attributes.rel;
      }

      return (
        <a
          key={key}
          {...attributes}
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {childElements}
        </a>
      );
    }
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="mb-4 border-l-4 border-muted pl-4 italic text-muted-foreground"
        >
          {childElements}
        </blockquote>
      );
    case 'code':
      return (
        <code key={key} className="rounded bg-muted px-1 py-0.5 text-sm">
          {childElements}
        </code>
      );
    case 'pre':
      return (
        <pre key={key} className="mb-4 overflow-x-auto rounded bg-muted p-4 text-sm">
          {childElements}
        </pre>
      );
    case 'span':
      return (
        <span key={key}>{childElements}</span>
      );
    case 'h1':
      return (
        <h1 key={key} className="mb-4 text-2xl font-semibold">
          {childElements}
        </h1>
      );
    case 'h2':
      return (
        <h2 key={key} className="mb-4 text-xl font-semibold">
          {childElements}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={key} className="mb-3 text-lg font-semibold">
          {childElements}
        </h3>
      );
    case 'br':
      return <br key={key} />;
    default:
      return (
        <span key={key}>{childElements}</span>
      );
  }
};

const renderContentNodes = (nodes: KnowledgeContentNode[]): React.ReactNode[] =>
  nodes.map((node, index) => renderContentNode(node, `content-${index}`));

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  section,
  isCompleted,
  onComplete
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    let correct = 0;
    section.questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'multiple-choice') {
        isCorrect = parseInt(userAnswer) === question.correctAnswer;
      } else if (question.type === 'true-false') {
        isCorrect = (userAnswer === 'true') === question.correctAnswer;
      }

      if (isCorrect) correct++;
    });

    const totalQuestions = section.questions.length;
    const score = totalQuestions === 0
      ? 100
      : Math.round((correct / totalQuestions) * 100);

    setQuizScore(score);
    setShowResults(true);

    if (score >= 80) {
      setShowConfetti(true);
      try {
        await onComplete(score);
      } finally {
        setTimeout(() => setShowConfetti(false), 1000);
      }
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setQuizScore(0);
  };

  const allQuestionsAnswered = section.questions.every(q => answers[q.id] !== undefined);

  const contentElements = useMemo(() => {
    if (section.contentNodes.length > 0) {
      const providedNodes = renderContentNodes(section.contentNodes);
      if (providedNodes.length > 0) {
        return providedNodes;
      }
    }

    if (section.content) {
      const generatedNodes = renderContentNodes(
        createSanitizedContentNodes(section.content),
      );

      if (generatedNodes.length > 0) {
        return generatedNodes;
      }

      return section.content
        .split('\n')
        .map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (!trimmed) {
            return null;
          }

          return (
            <p key={`fallback-${index}`} className="mb-4 leading-relaxed">
              {trimmed}
            </p>
          );
        })
        .filter((element): element is React.ReactNode => element !== null);
    }

    return [];
  }, [section.content, section.contentNodes]);

  return (
    <div className="space-y-6">
      {showConfetti && (
        <ConfettiCelebration 
          isActive={showConfetti}
          title="Section Completed!"
          message="Great job! You've mastered this section."
          onClose={() => setShowConfetti(false)}
          type="document"
        />
      )}
      
      {/* Section Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Section {section.section_number}</p>
              </div>
            </div>
            {isCompleted && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{section.summary}</p>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Content
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
          {contentElements.length > 0 ? (
            contentElements
          ) : (
            <p className="mb-4 leading-relaxed text-muted-foreground">
              No content available for this section yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-500" />
            Key Points to Remember
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {section.key_points.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="w-5 h-5 text-green-500" />
            Knowledge Check
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete this quiz with 80% or higher to proceed. You can retake it if needed.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {section.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="text-xs px-2 py-1 mt-1">
                  {index + 1}
                </Badge>
                <p className="font-medium">{question.question}</p>
              </div>

              {question.type === 'multiple-choice' && question.options && (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  disabled={showResults}
                  className="ml-8"
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`q${question.id}-${optionIndex}`}
                      />
                      <Label
                        htmlFor={`q${question.id}-${optionIndex}`}
                        className={`cursor-pointer ${
                          showResults
                            ? optionIndex === question.correctAnswer
                              ? 'text-green-600 font-medium'
                              : parseInt(answers[question.id]) === optionIndex && optionIndex !== question.correctAnswer
                              ? 'text-red-600'
                              : ''
                            : ''
                        }`}
                      >
                        {option}
                        {showResults && optionIndex === question.correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-2 inline" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'true-false' && (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  disabled={showResults}
                  className="ml-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`q${question.id}-true`} />
                    <Label
                      htmlFor={`q${question.id}-true`}
                      className={`cursor-pointer ${
                        showResults
                          ? question.correctAnswer === true
                            ? 'text-green-600 font-medium'
                            : answers[question.id] === 'true' && question.correctAnswer === false
                            ? 'text-red-600'
                            : ''
                          : ''
                      }`}
                    >
                      True
                      {showResults && question.correctAnswer === true && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-2 inline" />
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`q${question.id}-false`} />
                    <Label
                      htmlFor={`q${question.id}-false`}
                      className={`cursor-pointer ${
                        showResults
                          ? question.correctAnswer === false
                            ? 'text-green-600 font-medium'
                            : answers[question.id] === 'false' && question.correctAnswer === true
                            ? 'text-red-600'
                            : ''
                          : ''
                      }`}
                    >
                      False
                      {showResults && question.correctAnswer === false && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-2 inline" />
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              )}

              {index < section.questions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          <div className="pt-4 border-t">
            {!showResults ? (
              <Button
                onClick={submitQuiz}
                disabled={!allQuestionsAnswered}
                className="w-full"
              >
                Submit Quiz
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    quizScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {quizScore >= 80 ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <HelpCircle className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      Score: {quizScore}% ({section.questions.filter(q => {
                        const userAnswer = answers[q.id];
                        if (q.type === 'multiple-choice') {
                          return parseInt(userAnswer) === q.correctAnswer;
                        } else {
                          return (userAnswer === 'true') === q.correctAnswer;
                        }
                      }).length}/{section.questions.length} correct)
                    </span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  {quizScore >= 80 ? (
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium">🎉 Excellent work! You've mastered this section.</p>
                      <p>You can now proceed to the next section.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-red-600 font-medium">You need 80% or higher to proceed.</p>
                      <p>Review the content above and try again.</p>
                    </div>
                  )}
                </div>

                {quizScore < 80 && (
                  <Button onClick={resetQuiz} variant="outline" className="w-full">
                    Retake Quiz
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};