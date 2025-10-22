/**
 * TRIAL CHECKLIST FORM - LUNA-APPROVED
 * 
 * Supervisor evaluation form for candidate trial days
 * 8-point checklist + pre/post ratings + qualitative feedback
 * 
 * Agents: Form Validation Agent + Component Refactoring Architect
 */

import { useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Send,
  Users,
  MessageSquare,
  Award,
  Shield,
  Clock,
  Zap,
  Heart,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateTrialReview, GroupFitCategory, TrialChecklistScores } from '@/types/talentAcquisition';
import { TRIAL_CHECKLIST_LABELS } from '@/types/talentAcquisition';

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const TrialChecklistSchema = z.object({
  // Trial details
  trial_date: z.string().min(1, 'Trial date is required'),
  trial_location: z.string().min(1, 'Location is required'),
  trial_group: z.string().min(1, 'Group is required'),
  trial_duration_hours: z.number().min(0.5).max(12).optional(),
  trial_style: z.enum(['observation', 'active_participation', 'mixed']).optional(),
  
  // Supervisor
  supervisor_name: z.string().min(1, 'Supervisor name is required'),
  supervisor_email: z.string().email('Invalid email').optional(),
  
  // Pre-trial (optional)
  pre_trial_rating: z.number().min(1).max(5).optional(),
  pre_trial_notes: z.string().max(1000).optional(),
  pre_trial_expectations: z.string().max(1000).optional(),
  
  // Checklist (all required, 1-5)
  checklist_interaction_with_children: z.number().min(1).max(5),
  checklist_communication_skills: z.number().min(1).max(5),
  checklist_follows_instructions: z.number().min(1).max(5),
  checklist_initiative: z.number().min(1).max(5),
  checklist_safety_awareness: z.number().min(1).max(5),
  checklist_punctuality: z.number().min(1).max(5),
  checklist_teamwork: z.number().min(1).max(5),
  checklist_adaptability: z.number().min(1).max(5),
  
  // Post-trial (required)
  post_trial_rating: z.number().min(1).max(5),
  post_trial_notes: z.string().min(10, 'Please provide detailed notes (at least 10 characters)'),
  
  // Overall assessment
  would_hire: z.boolean().optional(),
  hire_confidence: z.number().min(1).max(5).optional(),
  
  // Qualitative
  strengths: z.string().max(1000).optional(),
  concerns: z.string().max(1000).optional(),
  specific_incidents: z.string().max(1000).optional(),
  children_response: z.string().max(1000).optional(),
  team_fit: z.string().max(1000).optional(),
});

type TrialChecklistFormData = z.infer<typeof TrialChecklistSchema>;

// =============================================================================
// STAR RATING COMPONENT
// =============================================================================

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  label,
  required,
  error,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={cn(
              'transition-colors',
              value >= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
            )}
          >
            <Star
              className={cn(sizeClasses[size], value >= rating && 'fill-current')}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {value}/5
        </span>
      </div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// CHECKLIST ITEM COMPONENT
// =============================================================================

interface ChecklistItemProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  description?: string;
  required?: boolean;
  error?: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  label,
  value,
  onChange,
  icon,
  description,
  required,
  error,
}) => {
  const ratingLabels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];
  
  return (
    <Card className={cn('p-4', error && 'border-destructive')}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-purple-400">{icon}</div>
          <Label className="text-base font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => onChange(rating)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md border-2 transition-all text-sm font-medium',
                  value === rating
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'bg-background border-border hover:border-purple-400 hover:bg-purple-500/10'
                )}
              >
                {rating}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Poor</span>
            {value > 0 && (
              <Badge variant="outline" className="text-xs">
                {ratingLabels[value]}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">Excellent</span>
          </div>
          
          <Progress value={(value / 5) * 100} className="h-2" />
        </div>
        
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    </Card>
  );
};

// =============================================================================
// MAIN FORM COMPONENT
// =============================================================================

interface TrialChecklistFormProps {
  candidateId: string;
  candidateName: string;
  initialData?: Partial<CandidateTrialReview>;
  onSave: (data: Partial<CandidateTrialReview>) => Promise<void>;
  onCancel: () => void;
}

export const TrialChecklistForm: React.FC<TrialChecklistFormProps> = ({
  candidateId,
  candidateName,
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<TrialChecklistFormData>>({
    trial_date: initialData?.trial_date || new Date().toISOString().split('T')[0],
    trial_location: initialData?.trial_location || '',
    trial_group: initialData?.trial_group || '',
    supervisor_name: initialData?.supervisor_name || '',
    supervisor_email: initialData?.supervisor_email || '',
    ...initialData,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pre' | 'checklist' | 'post'>('checklist');
  
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const calculateOverallPerformance = (): number => {
    const scores = [
      formData.checklist_interaction_with_children || 0,
      formData.checklist_communication_skills || 0,
      formData.checklist_follows_instructions || 0,
      formData.checklist_initiative || 0,
      formData.checklist_safety_awareness || 0,
      formData.checklist_punctuality || 0,
      formData.checklist_teamwork || 0,
      formData.checklist_adaptability || 0,
    ];
    const sum = scores.reduce((a, b) => a + b, 0);
    return sum / 8;
  };
  
  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      setIsSaving(true);
      
      // Validate if not draft
      if (!isDraft) {
        const result = TrialChecklistSchema.safeParse(formData);
        if (!result.success) {
          const newErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            newErrors[err.path[0] as string] = err.message;
          });
          setErrors(newErrors);
          return;
        }
      }
      
      // Calculate overall performance
      const overall_performance = calculateOverallPerformance();
      
      // Prepare data
      const reviewData: Partial<CandidateTrialReview> = {
        candidate_id: candidateId,
        ...formData,
        overall_performance,
        is_final: !isDraft,
      } as Partial<CandidateTrialReview>;
      
      await onSave(reviewData);
    } catch (error) {
      console.error('Failed to save trial review:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const checklistComplete = Object.keys(formData).filter(key => 
    key.startsWith('checklist_')
  ).length === 8;
  
  const overallPerformance = calculateOverallPerformance();
  
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Trial Evaluation: {candidateName}
          </CardTitle>
          <CardDescription>
            Complete this evaluation after the trial day. All checklist items are required.
          </CardDescription>
        </CardHeader>
        
        {overallPerformance > 0 && (
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Overall Performance</p>
                <p className="text-2xl font-bold text-white">
                  {overallPerformance.toFixed(1)} / 5.0
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className={cn(
                  'text-lg font-semibold',
                  overallPerformance >= 4.5 && 'text-green-400',
                  overallPerformance >= 3.5 && overallPerformance < 4.5 && 'text-blue-400',
                  overallPerformance >= 2.5 && overallPerformance < 3.5 && 'text-yellow-400',
                  overallPerformance < 2.5 && 'text-red-400'
                )}>
                  {overallPerformance >= 4.5 && '⭐ Excellent'}
                  {overallPerformance >= 3.5 && overallPerformance < 4.5 && '👍 Good'}
                  {overallPerformance >= 2.5 && overallPerformance < 3.5 && '😐 Average'}
                  {overallPerformance < 2.5 && '⚠️ Below Average'}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Trial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trial Date *</Label>
              <Input
                type="date"
                value={formData.trial_date || ''}
                onChange={(e) => updateField('trial_date', e.target.value)}
                className="mt-2"
              />
              {errors.trial_date && (
                <p className="text-sm text-destructive mt-1">{errors.trial_date}</p>
              )}
            </div>
            
            <div>
              <Label>Duration (hours)</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={formData.trial_duration_hours || ''}
                onChange={(e) => updateField('trial_duration_hours', parseFloat(e.target.value))}
                placeholder="e.g., 3.5"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Location *</Label>
              <Input
                value={formData.trial_location || ''}
                onChange={(e) => updateField('trial_location', e.target.value)}
                placeholder="e.g., Amsterdam Central"
                className="mt-2"
              />
              {errors.trial_location && (
                <p className="text-sm text-destructive mt-1">{errors.trial_location}</p>
              )}
            </div>
            
            <div>
              <Label>Group *</Label>
              <Select
                value={formData.trial_group || ''}
                onValueChange={(value) => updateField('trial_group', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Babies (0-1)">👶 Babies (0-1)</SelectItem>
                  <SelectItem value="1-2 years">🧒 1-2 years</SelectItem>
                  <SelectItem value="3+ years">👦 3+ years</SelectItem>
                  <SelectItem value="Multi-age">👨‍👩‍👧‍👦 Multi-age</SelectItem>
                </SelectContent>
              </Select>
              {errors.trial_group && (
                <p className="text-sm text-destructive mt-1">{errors.trial_group}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Supervisor Name *</Label>
              <Input
                value={formData.supervisor_name || ''}
                onChange={(e) => updateField('supervisor_name', e.target.value)}
                className="mt-2"
              />
              {errors.supervisor_name && (
                <p className="text-sm text-destructive mt-1">{errors.supervisor_name}</p>
              )}
            </div>
            
            <div>
              <Label>Supervisor Email</Label>
              <Input
                type="email"
                value={formData.supervisor_email || ''}
                onChange={(e) => updateField('supervisor_email', e.target.value)}
                placeholder="supervisor@teddykids.nl"
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pre-Trial Assessment (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Pre-Trial Assessment (Optional)
          </CardTitle>
          <CardDescription>
            Fill this before the trial begins if you have initial impressions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StarRating
            label="Pre-Trial Rating"
            value={formData.pre_trial_rating || 0}
            onChange={(value) => updateField('pre_trial_rating', value)}
          />
          
          <div>
            <Label>Pre-Trial Notes</Label>
            <Textarea
              value={formData.pre_trial_notes || ''}
              onChange={(e) => updateField('pre_trial_notes', e.target.value)}
              placeholder="First impressions, application review notes..."
              className="mt-2 min-h-[80px]"
            />
          </div>
          
          <div>
            <Label>Expectations</Label>
            <Textarea
              value={formData.pre_trial_expectations || ''}
              onChange={(e) => updateField('pre_trial_expectations', e.target.value)}
              placeholder="What do you expect to observe during the trial?"
              className="mt-2 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Trial Evaluation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Trial Evaluation Checklist
          </CardTitle>
          <CardDescription>
            Rate each competency from 1 (Poor) to 5 (Excellent). All fields required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChecklistItem
            label="Interaction with Children"
            value={formData.checklist_interaction_with_children || 0}
            onChange={(value) => updateField('checklist_interaction_with_children', value)}
            icon={<Heart className="h-5 w-5" />}
            description="How well did they connect with the children?"
            required
            error={errors.checklist_interaction_with_children}
          />
          
          <ChecklistItem
            label="Communication Skills"
            value={formData.checklist_communication_skills || 0}
            onChange={(value) => updateField('checklist_communication_skills', value)}
            icon={<MessageSquare className="h-5 w-5" />}
            description="Clear communication with children, parents, and team"
            required
            error={errors.checklist_communication_skills}
          />
          
          <ChecklistItem
            label="Follows Instructions"
            value={formData.checklist_follows_instructions || 0}
            onChange={(value) => updateField('checklist_follows_instructions', value)}
            icon={<Target className="h-5 w-5" />}
            description="Ability to understand and execute directions"
            required
            error={errors.checklist_follows_instructions}
          />
          
          <ChecklistItem
            label="Initiative & Proactiveness"
            value={formData.checklist_initiative || 0}
            onChange={(value) => updateField('checklist_initiative', value)}
            icon={<Zap className="h-5 w-5" />}
            description="Takes initiative without being asked"
            required
            error={errors.checklist_initiative}
          />
          
          <ChecklistItem
            label="Safety Awareness"
            value={formData.checklist_safety_awareness || 0}
            onChange={(value) => updateField('checklist_safety_awareness', value)}
            icon={<Shield className="h-5 w-5" />}
            description="Maintains safety protocols and child supervision"
            required
            error={errors.checklist_safety_awareness}
          />
          
          <ChecklistItem
            label="Punctuality"
            value={formData.checklist_punctuality || 0}
            onChange={(value) => updateField('checklist_punctuality', value)}
            icon={<Clock className="h-5 w-5" />}
            description="Arrived on time and ready to work"
            required
            error={errors.checklist_punctuality}
          />
          
          <ChecklistItem
            label="Teamwork & Collaboration"
            value={formData.checklist_teamwork || 0}
            onChange={(value) => updateField('checklist_teamwork', value)}
            icon={<Users className="h-5 w-5" />}
            description="Works well with existing team members"
            required
            error={errors.checklist_teamwork}
          />
          
          <ChecklistItem
            label="Adaptability & Flexibility"
            value={formData.checklist_adaptability || 0}
            onChange={(value) => updateField('checklist_adaptability', value)}
            icon={<Zap className="h-5 w-5" />}
            description="Handles unexpected situations and changes"
            required
            error={errors.checklist_adaptability}
          />
        </CardContent>
      </Card>
      
      {/* Post-Trial Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            Post-Trial Assessment *
          </CardTitle>
          <CardDescription>
            Final thoughts after the trial day (required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StarRating
            label="Post-Trial Rating"
            value={formData.post_trial_rating || 0}
            onChange={(value) => updateField('post_trial_rating', value)}
            required
            error={errors.post_trial_rating}
            size="lg"
          />
          
          <div>
            <Label>
              Post-Trial Notes *
              <span className="text-sm text-muted-foreground ml-2">(minimum 10 characters)</span>
            </Label>
            <Textarea
              value={formData.post_trial_notes || ''}
              onChange={(e) => updateField('post_trial_notes', e.target.value)}
              placeholder="Detailed observations from the trial day..."
              className="mt-2 min-h-[120px]"
            />
            {errors.post_trial_notes && (
              <p className="text-sm text-destructive mt-1">{errors.post_trial_notes}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Would You Hire This Candidate?</Label>
              <Select
                value={formData.would_hire === undefined ? '' : String(formData.would_hire)}
                onValueChange={(value) => updateField('would_hire', value === 'true')}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">✅ Yes, recommend hiring</SelectItem>
                  <SelectItem value="false">❌ No, do not recommend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.would_hire !== undefined && (
              <div>
                <Label>Hire Confidence (1-5)</Label>
                <StarRating
                  label=""
                  value={formData.hire_confidence || 0}
                  onChange={(value) => updateField('hire_confidence', value)}
                />
              </div>
            )}
          </div>
          
          <div>
            <Label>Strengths</Label>
            <Textarea
              value={formData.strengths || ''}
              onChange={(e) => updateField('strengths', e.target.value)}
              placeholder="What did they excel at?"
              className="mt-2 min-h-[80px]"
            />
          </div>
          
          <div>
            <Label>Concerns / Areas for Improvement</Label>
            <Textarea
              value={formData.concerns || ''}
              onChange={(e) => updateField('concerns', e.target.value)}
              placeholder="What needs improvement?"
              className="mt-2 min-h-[80px]"
            />
          </div>
          
          <div>
            <Label>Specific Incidents (Good or Bad)</Label>
            <Textarea
              value={formData.specific_incidents || ''}
              onChange={(e) => updateField('specific_incidents', e.target.value)}
              placeholder="Any notable behaviors or situations..."
              className="mt-2 min-h-[80px]"
            />
          </div>
          
          <div>
            <Label>How Did Children Respond?</Label>
            <Textarea
              value={formData.children_response || ''}
              onChange={(e) => updateField('children_response', e.target.value)}
              placeholder="Were children comfortable? Did they engage?"
              className="mt-2 min-h-[80px]"
            />
          </div>
          
          <div>
            <Label>Team Fit</Label>
            <Textarea
              value={formData.team_fit || ''}
              onChange={(e) => updateField('team_fit', e.target.value)}
              placeholder="How did they fit with the existing team?"
              className="mt-2 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        
        <Button
          onClick={() => handleSubmit(false)}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Final Evaluation
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TrialChecklistForm;

