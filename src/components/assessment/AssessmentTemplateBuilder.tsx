/**
 * 🧪 ASSESSMENT TEMPLATE BUILDER - LABS 2.0
 * Comprehensive interface for creating and managing assessment templates
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
  GripVertical,
  Clock,
  Target,
  Brain,
  FileText,
  Video,
  Upload,
  Star,
  MessageSquare,
  Zap,
  Heart,
  Users,
  Award,
  ChevronDown,
  ChevronRight,
  Copy,
  Play,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AssessmentRoleCategory,
  AssessmentQuestionType,
  AssessmentCategory,
  QuestionBuilder,
  TemplateBuilder,
  ROLE_CATEGORY_LABELS,
  QUESTION_TYPE_LABELS,
  CATEGORY_LABELS
} from "@/types/assessmentEngine";

interface AssessmentTemplateBuilderProps {
  templateId?: string; // For editing existing templates
  onSave?: (template: TemplateBuilder) => Promise<void>;
  onCancel?: () => void;
  onPreview?: (template: TemplateBuilder) => void;
}

const QUESTION_TYPE_ICONS: Record<AssessmentQuestionType, any> = {
  multiple_choice: Target,
  scenario_response: MessageSquare,
  video_response: Video,
  file_upload: Upload,
  rating_scale: Star,
  time_challenge: Zap,
  text_response: FileText,
  emotional_intelligence: Heart,
  cultural_fit: Users
};

const CATEGORY_COLORS: Record<AssessmentCategory, string> = {
  communication_skills: 'bg-blue-500/20 text-blue-300',
  childcare_scenarios: 'bg-pink-500/20 text-pink-300',
  cultural_fit: 'bg-purple-500/20 text-purple-300',
  technical_competency: 'bg-green-500/20 text-green-300',
  emotional_intelligence: 'bg-red-500/20 text-red-300',
  emergency_response: 'bg-orange-500/20 text-orange-300',
  teamwork: 'bg-indigo-500/20 text-indigo-300',
  leadership: 'bg-yellow-500/20 text-yellow-300',
  creativity: 'bg-cyan-500/20 text-cyan-300',
  problem_solving: 'bg-emerald-500/20 text-emerald-300'
};

export default function AssessmentTemplateBuilder({
  templateId,
  onSave,
  onCancel,
  onPreview
}: AssessmentTemplateBuilderProps) {
  const [template, setTemplate] = useState<TemplateBuilder>({
    name: '',
    description: '',
    role_category: 'childcare_staff',
    time_limit_minutes: 45,
    passing_threshold: 75,
    weighted_scoring: false,
    questions: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sample TeddyKids scenarios for different roles
  const SCENARIO_TEMPLATES = {
    childcare_staff: [
      {
        title: "Handling a Toddler Meltdown",
        context: "A 2-year-old child in your care is having an emotional outburst during snack time. They're crying loudly, throwing food, and other children are getting upset.",
        question: "How would you handle this situation? Describe your step-by-step approach."
      },
      {
        title: "Safety Incident Response",
        context: "While supervising outdoor play, you notice a child has fallen from the slide and appears to be injured. The child is crying and holding their arm.",
        question: "What immediate actions would you take? List your priorities in order."
      }
    ],
    educational_staff: [
      {
        title: "Learning Difficulty Support",
        context: "During a group activity, you notice one child is struggling to keep up with the learning objectives while others are progressing well.",
        question: "How would you adapt your teaching approach to support this child while maintaining engagement for the whole group?"
      }
    ],
    management: [
      {
        title: "Staff Conflict Resolution",
        context: "Two team members have come to you with a disagreement about childcare approaches. The conflict is affecting team morale.",
        question: "How would you mediate this situation and prevent similar issues in the future?"
      }
    ]
  };

  const addQuestion = (type?: AssessmentQuestionType) => {
    const newQuestion: QuestionBuilder = {
      question_text: '',
      question_type: type || 'multiple_choice',
      category: 'communication_skills',
      options: type === 'multiple_choice' ? ['Option A', 'Option B', 'Option C', 'Option D'] : [],
      correct_answers: [],
      points: 1,
      weight: 1.0,
      auto_scorable: type === 'multiple_choice',
      constraints: {},
      order_sequence: template.questions.length + 1
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setSelectedQuestion(template.questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<QuestionBuilder>) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index).map((q, i) => ({
        ...q,
        order_sequence: i + 1
      }))
    }));

    if (selectedQuestion === index) {
      setSelectedQuestion(null);
    } else if (selectedQuestion && selectedQuestion > index) {
      setSelectedQuestion(selectedQuestion - 1);
    }
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = template.questions[index];
    const duplicatedQuestion: QuestionBuilder = {
      ...questionToDuplicate,
      question_text: `${questionToDuplicate.question_text} (Copy)`,
      order_sequence: template.questions.length + 1
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion]
    }));
  };

  const addScenarioQuestion = (scenario: any) => {
    const scenarioQuestion: QuestionBuilder = {
      question_text: scenario.question,
      question_type: 'scenario_response',
      category: 'childcare_scenarios',
      scenario_context: scenario.context,
      options: [],
      correct_answers: [],
      points: 3,
      weight: 2.0,
      auto_scorable: false,
      constraints: {
        min_length: 100,
        max_length: 1000
      },
      order_sequence: template.questions.length + 1
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, scenarioQuestion]
    }));
  };

  const validateTemplate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!template.name.trim()) {
      errors.name = 'Template name is required';
    }

    if (template.questions.length === 0) {
      errors.questions = 'At least one question is required';
    }

    if (template.passing_threshold < 0 || template.passing_threshold > 100) {
      errors.passing_threshold = 'Passing threshold must be between 0 and 100';
    }

    // Validate questions
    template.questions.forEach((question, index) => {
      if (!question.question_text.trim()) {
        errors[`question_${index}_text`] = `Question ${index + 1} text is required`;
      }

      if (question.question_type === 'multiple_choice' && question.options.length < 2) {
        errors[`question_${index}_options`] = `Question ${index + 1} needs at least 2 options`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateTemplate()) return;

    setIsSaving(true);
    try {
      await onSave?.(template);
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestionEditor = () => {
    if (selectedQuestion === null || !template.questions[selectedQuestion]) {
      return (
        <div className="flex items-center justify-center h-64 text-purple-400">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a question to edit its properties</p>
          </div>
        </div>
      );
    }

    const question = template.questions[selectedQuestion];
    const QuestionIcon = QUESTION_TYPE_ICONS[question.question_type];

    return (
      <div className="space-y-6">
        {/* Question Header */}
        <div className="flex items-center gap-3">
          <QuestionIcon className="h-6 w-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Question {selectedQuestion + 1}
            </h3>
            <p className="text-sm text-purple-300">
              {QUESTION_TYPE_LABELS[question.question_type]}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateQuestion(selectedQuestion)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteQuestion(selectedQuestion)}
              className="border-red-500/30 text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Type & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-purple-300">Question Type</Label>
            <Select
              value={question.question_type}
              onValueChange={(value) => updateQuestion(selectedQuestion, {
                question_type: value as AssessmentQuestionType,
                auto_scorable: value === 'multiple_choice'
              })}
            >
              <SelectTrigger className="bg-black/30 border-purple-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Category</Label>
            <Select
              value={question.category}
              onValueChange={(value) => updateQuestion(selectedQuestion, { category: value as AssessmentCategory })}
            >
              <SelectTrigger className="bg-black/30 border-purple-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", CATEGORY_COLORS[key as AssessmentCategory])} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scenario Context (for scenario-based questions) */}
        {question.question_type === 'scenario_response' && (
          <div className="space-y-2">
            <Label className="text-purple-300">Scenario Context</Label>
            <Textarea
              value={question.scenario_context || ''}
              onChange={(e) => updateQuestion(selectedQuestion, { scenario_context: e.target.value })}
              placeholder="Describe the scenario or situation for this question..."
              className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-400 min-h-[100px]"
            />
          </div>
        )}

        {/* Question Text */}
        <div className="space-y-2">
          <Label className="text-purple-300">Question Text</Label>
          <Textarea
            value={question.question_text}
            onChange={(e) => updateQuestion(selectedQuestion, { question_text: e.target.value })}
            placeholder="Enter your question here..."
            className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-400"
          />
          {validationErrors[`question_${selectedQuestion}_text`] && (
            <p className="text-red-400 text-sm">{validationErrors[`question_${selectedQuestion}_text`]}</p>
          )}
        </div>

        {/* Options (for multiple choice) */}
        {question.question_type === 'multiple_choice' && (
          <div className="space-y-2">
            <Label className="text-purple-300">Answer Options</Label>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.options];
                      newOptions[index] = e.target.value;
                      updateQuestion(selectedQuestion, { options: newOptions });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = question.options.filter((_, i) => i !== index);
                      updateQuestion(selectedQuestion, { options: newOptions });
                    }}
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newOptions = [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`];
                  updateQuestion(selectedQuestion, { options: newOptions });
                }}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            {validationErrors[`question_${selectedQuestion}_options`] && (
              <p className="text-red-400 text-sm">{validationErrors[`question_${selectedQuestion}_options`]}</p>
            )}
          </div>
        )}

        {/* Constraints */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-purple-300">Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) => updateQuestion(selectedQuestion, { points: parseInt(e.target.value) || 1 })}
              min="1"
              max="10"
              className="bg-black/30 border-purple-500/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Weight</Label>
            <Input
              type="number"
              step="0.1"
              value={question.weight}
              onChange={(e) => updateQuestion(selectedQuestion, { weight: parseFloat(e.target.value) || 1.0 })}
              min="0.1"
              max="3.0"
              className="bg-black/30 border-purple-500/30 text-white"
            />
          </div>
        </div>

        {/* Time Limit */}
        {question.question_type === 'time_challenge' && (
          <div className="space-y-2">
            <Label className="text-purple-300">Time Limit (seconds)</Label>
            <Input
              type="number"
              value={question.constraints.time_limit_seconds || 60}
              onChange={(e) => updateQuestion(selectedQuestion, {
                constraints: {
                  ...question.constraints,
                  time_limit_seconds: parseInt(e.target.value) || 60
                }
              })}
              min="10"
              max="300"
              className="bg-black/30 border-purple-500/30 text-white"
            />
          </div>
        )}

        {/* Text Response Constraints */}
        {(question.question_type === 'text_response' || question.question_type === 'scenario_response') && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-purple-300">Min Length (characters)</Label>
              <Input
                type="number"
                value={question.constraints.min_length || ''}
                onChange={(e) => updateQuestion(selectedQuestion, {
                  constraints: {
                    ...question.constraints,
                    min_length: parseInt(e.target.value) || undefined
                  }
                })}
                min="0"
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-purple-300">Max Length (characters)</Label>
              <Input
                type="number"
                value={question.constraints.max_length || ''}
                onChange={(e) => updateQuestion(selectedQuestion, {
                  constraints: {
                    ...question.constraints,
                    max_length: parseInt(e.target.value) || undefined
                  }
                })}
                min="1"
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>
          </div>
        )}

        {/* Auto Scoring Toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div>
            <Label className="text-purple-300">Auto-Scoring</Label>
            <p className="text-sm text-purple-400">
              Enable automatic scoring for this question
            </p>
          </div>
          <Switch
            checked={question.auto_scorable}
            onCheckedChange={(checked) => updateQuestion(selectedQuestion, { auto_scorable: checked })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Assessment Template Builder
          </h1>
          <p className="text-purple-300">
            Create comprehensive assessments for TeddyKids hiring pipeline
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPreview?.(template)}
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-500/30 text-gray-300 hover:bg-gray-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/30 border-purple-500/30">
          <TabsTrigger value="basic" className="data-[state=active]:bg-purple-500/30">
            <Settings className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-purple-500/30">
            <FileText className="h-4 w-4 mr-2" />
            Questions ({template.questions.length})
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-purple-500/30">
            <Brain className="h-4 w-4 mr-2" />
            TeddyKids Scenarios
          </TabsTrigger>
          <TabsTrigger value="scoring" className="data-[state=active]:bg-purple-500/30">
            <Award className="h-4 w-4 mr-2" />
            Scoring & Settings
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Template Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-purple-300">Template Name *</Label>
                  <Input
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Childcare Professional Assessment"
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                  {validationErrors.name && (
                    <p className="text-red-400 text-sm">{validationErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Role Category *</Label>
                  <Select
                    value={template.role_category}
                    onValueChange={(value) => setTemplate(prev => ({
                      ...prev,
                      role_category: value as AssessmentRoleCategory
                    }))}
                  >
                    <SelectTrigger className="bg-black/30 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-300">Description</Label>
                <Textarea
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this assessment evaluates..."
                  className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-purple-300">Time Limit (minutes)</Label>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={template.time_limit_minutes !== undefined}
                      onCheckedChange={(checked) => setTemplate(prev => ({
                        ...prev,
                        time_limit_minutes: checked ? 45 : undefined
                      }))}
                    />
                    {template.time_limit_minutes !== undefined && (
                      <Input
                        type="number"
                        value={template.time_limit_minutes}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          time_limit_minutes: parseInt(e.target.value) || 45
                        }))}
                        min="5"
                        max="180"
                        className="bg-black/30 border-purple-500/30 text-white w-24"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Passing Threshold (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[template.passing_threshold]}
                      onValueChange={([value]) => setTemplate(prev => ({ ...prev, passing_threshold: value }))}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-center text-purple-300">
                      {template.passing_threshold}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div>
                  <Label className="text-purple-300">Weighted Scoring</Label>
                  <p className="text-sm text-purple-400">
                    Use question weights to calculate final scores
                  </p>
                </div>
                <Switch
                  checked={template.weighted_scoring}
                  onCheckedChange={(checked) => setTemplate(prev => ({ ...prev, weighted_scoring: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            {/* Questions List */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Questions ({template.questions.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    {['multiple_choice', 'scenario_response', 'text_response'].map((type) => {
                      const Icon = QUESTION_TYPE_ICONS[type as AssessmentQuestionType];
                      return (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(type as AssessmentQuestionType)}
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {template.questions.map((question, index) => {
                    const Icon = QUESTION_TYPE_ICONS[question.question_type];
                    const isSelected = selectedQuestion === index;

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedQuestion(index)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "bg-purple-500/20 border-purple-500/50"
                            : "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical className="h-4 w-4 text-purple-400 mt-1" />
                          <Icon className="h-4 w-4 text-purple-400 mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">
                                Question {index + 1}
                              </span>
                              <Badge className={cn("text-xs", CATEGORY_COLORS[question.category])}>
                                {CATEGORY_LABELS[question.category]}
                              </Badge>
                            </div>
                            <p className="text-sm text-purple-300 truncate">
                              {question.question_text || 'Untitled question'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-purple-400">
                              <span>{QUESTION_TYPE_LABELS[question.question_type]}</span>
                              <span>•</span>
                              <span>{question.points} pts</span>
                              {question.auto_scorable && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-400">Auto-scored</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {template.questions.length === 0 && (
                    <div className="text-center py-8 text-purple-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No questions added yet</p>
                      <p className="text-sm">Click the icons above to add questions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Editor */}
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Question Editor</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {renderQuestionEditor()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TeddyKids Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                TeddyKids Scenario Library
              </CardTitle>
              <p className="text-purple-300">
                Pre-built scenarios specific to childcare and educational roles
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(SCENARIO_TEMPLATES).map(([role, scenarios]) => (
                  <div key={role} className="space-y-3">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      {ROLE_CATEGORY_LABELS[role as AssessmentRoleCategory]}
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {scenarios.length} scenarios
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scenarios.map((scenario, index) => (
                        <Card key={index} className="bg-purple-500/10 border-purple-500/20">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-white mb-2">{scenario.title}</h4>
                            <p className="text-sm text-purple-300 mb-3">{scenario.context}</p>
                            <p className="text-sm text-purple-400 italic mb-3">"{scenario.question}"</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addScenarioQuestion(scenario)}
                              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Template
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring & Settings Tab */}
        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Scoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div>
                      <Label className="text-purple-300">Weighted Scoring</Label>
                      <p className="text-sm text-purple-400">
                        Calculate scores based on question weights
                      </p>
                    </div>
                    <Switch
                      checked={template.weighted_scoring}
                      onCheckedChange={(checked) => setTemplate(prev => ({ ...prev, weighted_scoring: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Passing Threshold</Label>
                    <div className="space-y-3">
                      <Slider
                        value={[template.passing_threshold]}
                        onValueChange={([value]) => setTemplate(prev => ({ ...prev, passing_threshold: value }))}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">0% (Fail)</span>
                        <span className="text-purple-300 font-medium">
                          {template.passing_threshold}% Required
                        </span>
                        <span className="text-green-400">100% (Perfect)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Time Limit</Label>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={template.time_limit_minutes !== undefined}
                        onCheckedChange={(checked) => setTemplate(prev => ({
                          ...prev,
                          time_limit_minutes: checked ? 45 : undefined
                        }))}
                      />
                      {template.time_limit_minutes !== undefined && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={template.time_limit_minutes}
                            onChange={(e) => setTemplate(prev => ({
                              ...prev,
                              time_limit_minutes: parseInt(e.target.value) || 45
                            }))}
                            min="5"
                            max="180"
                            className="bg-black/30 border-purple-500/30 text-white w-20"
                          />
                          <span className="text-purple-300">minutes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Assessment Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-purple-300">
                        {template.questions.length}
                      </div>
                      <div className="text-sm text-purple-400">Questions</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-blue-300">
                        {template.questions.reduce((sum, q) => sum + q.points, 0)}
                      </div>
                      <div className="text-sm text-blue-400">Total Points</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Question Categories</Label>
                    <div className="space-y-1">
                      {Object.entries(
                        template.questions.reduce((acc, q) => {
                          acc[q.category] = (acc[q.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span className="text-purple-300">
                            {CATEGORY_LABELS[category as AssessmentCategory]}
                          </span>
                          <Badge className={cn("text-xs", CATEGORY_COLORS[category as AssessmentCategory])}>
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Estimated Duration</Label>
                    <div className="text-sm text-purple-400">
                      {Math.ceil(template.questions.length * 1.5)} - {Math.ceil(template.questions.length * 3)} minutes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-300 font-medium">Validation Errors</span>
            </div>
            <ul className="text-sm text-red-400 space-y-1">
              {Object.entries(validationErrors).map(([key, error]) => (
                <li key={key}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}