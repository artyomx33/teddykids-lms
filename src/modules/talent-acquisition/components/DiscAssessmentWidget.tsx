/**
 * 🧪 DISC ASSESSMENT WIDGET - TALENT ACQUISITION
 * Complete application flow with Luna's 40-question DISC assessment
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Brain,
  Heart,
  Target,
  Zap,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle,
  X,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { assessmentService, type ApplicantFormData, type AssessmentResults } from "../services/assessmentService";

interface DiscAssessmentWidgetProps {
  onComplete?: (result: any) => void;
  onClose?: () => void;
  isPreview?: boolean;
}

// Luna's Exact 40 DISC Questions with Multiple Choice Options
const lunaDiscQuestions = [
  // SECTION 1: Background & Education (Q1-Q3)
  {
    id: 1,
    section: "Background & Education",
    text: "What inspired you to start working with children?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "I like to take care of those who need support", color: "green" },
      { value: "B", label: "I enjoy structure and guiding learning", color: "blue" },
      { value: "C", label: "I love the energy and creativity of kids", color: "yellow" },
      { value: "D", label: "I like responsibility and leading a group", color: "red" }
    ]
  },
  {
    id: 2,
    section: "Background & Education",
    text: "Which ages have you worked with most, and what did you enjoy?",
    options: [
      { value: "A", label: "Babies — the gentleness and routine" },
      { value: "B", label: "Toddlers — watching independence form" },
      { value: "C", label: "Preschool — curiosity and learning through play" },
      { value: "D", label: "Mixed ages — flexibility and variety" }
    ]
  },
  {
    id: 3,
    section: "Background & Education",
    text: "Have you ever cared for children as young as 3 months?",
    options: [
      { value: "A", label: "Yes, and I felt very confident doing so" },
      { value: "B", label: "Yes, but it was challenging for me" },
      { value: "C", label: "No, but I'm eager to learn" },
      { value: "D", label: "No, I prefer older age groups" }
    ]
  },

  // SECTION 2: Work Style & Initiative (Q4-Q6)
  {
    id: 4,
    section: "Work Style & Initiative",
    text: "Imagine you walk into a messy classroom with toys everywhere.",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Start cleaning right away without being told", color: "blue" },
      { value: "B", label: "Ask the children to help clean up in a playful way", color: "yellow" },
      { value: "C", label: "Join a colleague and share the task", color: "green" },
      { value: "D", label: "Direct others quickly to clean efficiently", color: "red" }
    ]
  },
  {
    id: 5,
    section: "Work Style & Initiative",
    text: "When you see a colleague struggling with children, what do you usually do?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Step in and take the lead to solve it", color: "red" },
      { value: "B", label: "Support quietly and assist where needed", color: "green" },
      { value: "C", label: "Suggest a structured solution", color: "blue" },
      { value: "D", label: "Distract the children with fun energy", color: "yellow" }
    ]
  },
  {
    id: 6,
    section: "Work Style & Initiative",
    text: "Do you prefer being told exactly what to do, or finding tasks for yourself?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "I want clear instructions", color: "blue" },
      { value: "B", label: "I prefer freedom to find tasks", color: "red" },
      { value: "C", label: "I like collaborating with colleagues", color: "green" },
      { value: "D", label: "I adapt depending on the moment", color: "yellow" }
    ]
  },

  // SECTION 3: Group Fit (Q7-Q14)
  {
    id: 7,
    section: "Group Fit",
    text: "What do you enjoy about working with babies?",
    options: [
      { value: "A", label: "Their calm routine and caregiving needs" },
      { value: "B", label: "The patience and gentleness it requires" },
      { value: "C", label: "The responsibility of ensuring their safety" },
      { value: "D", label: "Honestly, I prefer older groups" }
    ]
  },
  {
    id: 8,
    section: "Group Fit",
    text: "What is most challenging about 1–2 year olds?",
    options: [
      { value: "A", label: "Constant supervision and safety" },
      { value: "B", label: "Tantrums and strong emotions" },
      { value: "C", label: "Their short attention span" },
      { value: "D", label: "Nothing, I enjoy the challenge" }
    ]
  },
  {
    id: 9,
    section: "Group Fit",
    text: "How do you engage 3+ children?",
    options: [
      { value: "A", label: "By preparing structured lessons" },
      { value: "B", label: "By joining their play creatively" },
      { value: "C", label: "By guiding their emotions and friendships" },
      { value: "D", label: "By leading group games energetically" }
    ]
  },
  {
    id: 10,
    section: "Group Fit",
    text: "Which age group drains you most?",
    options: [
      { value: "A", label: "Babies — too fragile" },
      { value: "B", label: "1–2 year olds — too intense" },
      { value: "C", label: "3+ — too much talking/energy" },
      { value: "D", label: "None, I adapt easily" }
    ]
  },
  {
    id: 11,
    section: "Group Fit",
    text: "Your group's schedule changes last minute. How do you feel?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Calm, I can adjust easily", color: "yellow" },
      { value: "B", label: "Irritated, I prefer sticking to the plan", color: "blue" },
      { value: "C", label: "Ready to take control and fix it", color: "red" },
      { value: "D", label: "Focus on supporting colleagues emotionally", color: "green" }
    ]
  },
  {
    id: 12,
    section: "Group Fit",
    text: "You're asked to lead an activity without preparation.",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Jump in confidently, improvise", color: "red" },
      { value: "B", label: "Try to structure something quickly", color: "blue" },
      { value: "C", label: "Create fun energy with children", color: "yellow" },
      { value: "D", label: "Ask a colleague to guide me", color: "green" }
    ]
  },
  {
    id: 13,
    section: "Group Fit",
    text: "A colleague suggests a new method you don't agree with.",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Debate and try to convince them", color: "red" },
      { value: "B", label: "Ask for evidence and structure", color: "blue" },
      { value: "C", label: "Agree to keep peace", color: "green" },
      { value: "D", label: "Try it out creatively", color: "yellow" }
    ]
  },
  {
    id: 14,
    section: "Group Fit",
    text: "When the team is under stress, what role do you naturally take?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Leader / decision-maker", color: "red" },
      { value: "B", label: "Planner / organizer", color: "blue" },
      { value: "C", label: "Peacemaker / supporter", color: "green" },
      { value: "D", label: "Motivator / bring positivity", color: "yellow" }
    ]
  },

  // SECTION 4: Communication & Parents (Q15-Q16)
  {
    id: 15,
    section: "Communication & Parents",
    text: "How do you explain a difficult day to a parent?",
    options: [
      { value: "A", label: "Focus on facts, clear and short" },
      { value: "B", label: "Share emotions and details" },
      { value: "C", label: "Balance honesty with positivity" },
      { value: "D", label: "Offer a constructive plan for next time" }
    ]
  },
  {
    id: 16,
    section: "Communication & Parents",
    text: "If a parent gives you instructions that conflict with group routine:",
    options: [
      { value: "A", label: "Follow their wishes strictly" },
      { value: "B", label: "Explain gently why routine is important" },
      { value: "C", label: "Discuss with a colleague before deciding" },
      { value: "D", label: "Find a compromise on the spot" }
    ]
  },

  // SECTION 5: Special Skills (Q17-Q18)
  {
    id: 17,
    section: "Special Skills",
    text: "Which skill would you love to bring into the classroom?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Music, art, or drama", color: "yellow" },
      { value: "B", label: "Organization and routines", color: "blue" },
      { value: "C", label: "Emotional support and social games", color: "green" },
      { value: "D", label: "Sports or leadership activities", color: "red" }
    ]
  },
  {
    id: 18,
    section: "Special Skills",
    text: "If you could design your own activity, what would it look like?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "A creative art or music project", color: "yellow" },
      { value: "B", label: "A structured educational exercise", color: "blue" },
      { value: "C", label: "A calming social circle game", color: "green" },
      { value: "D", label: "A competitive team challenge", color: "red" }
    ]
  },

  // SECTION 6: Availability & Flexibility (Q19-Q20)
  {
    id: 19,
    section: "Availability & Flexibility",
    text: "Are you comfortable filling in at short notice?",
    options: [
      { value: "A", label: "Yes, I like challenges" },
      { value: "B", label: "Yes, but I prefer to plan" },
      { value: "C", label: "Sometimes, depends on my mood" },
      { value: "D", label: "Only if it's absolutely needed" }
    ]
  },
  {
    id: 20,
    section: "Availability & Flexibility",
    text: "Which role in a team do you enjoy most?",
    isColorQuestion: true,
    options: [
      { value: "A", label: "Leading", color: "red" },
      { value: "B", label: "Supporting", color: "green" },
      { value: "C", label: "Planning", color: "blue" },
      { value: "D", label: "Creating ideas", color: "yellow" }
    ]
  },

  // SECTION 7: Red-Flag Detectors (Q21-Q30)
  {
    id: 21,
    section: "Red-Flag Detectors",
    text: "A baby has been crying for 20 minutes and nothing works. What do you do next?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Stick to routine and wait for the child to adjust", isRisk: true },
      { value: "B", label: "Try a different soothing method, even if it's outside my comfort zone" },
      { value: "C", label: "Ask a colleague what usually works for this child" },
      { value: "D", label: "Focus on the rest of the group and come back later", isRisk: true }
    ]
  },
  {
    id: 22,
    section: "Red-Flag Detectors",
    text: "When it's time to clean the classroom after play, how do you usually handle it?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Guide children to clean with me as part of the routine" },
      { value: "B", label: "Take charge and tidy quickly so it's done well" },
      { value: "C", label: "Wait for a colleague to start and then join in", isRisk: true },
      { value: "D", label: "Clean only what I used or touched directly", isRisk: true }
    ]
  },
  {
    id: 23,
    section: "Red-Flag Detectors",
    text: "A colleague disagrees with how you handled a child's tantrum. What's your instinct?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Defend my choice — I know what I saw in that moment", isRisk: true },
      { value: "B", label: "Stay quiet and avoid discussion", isRisk: true },
      { value: "C", label: "Ask them how they might have done it differently" },
      { value: "D", label: "Reflect on it later but don't engage right away" }
    ]
  },
  {
    id: 24,
    section: "Red-Flag Detectors",
    text: "How do you usually feel when you receive feedback from your supervisor?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Grateful, it helps me improve" },
      { value: "B", label: "Neutral, I'll consider it if it feels relevant", isRisk: true },
      { value: "C", label: "Defensive, because sometimes they don't see the full picture", isRisk: true },
      { value: "D", label: "Motivated, it pushes me to do even better" }
    ]
  },
  {
    id: 25,
    section: "Red-Flag Detectors",
    text: "Parents often give advice or requests that conflict with group routine. How do you respond?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Try to follow their wishes as much as possible", isRisk: true },
      { value: "B", label: "Stick to group routine, parents need to adapt" },
      { value: "C", label: "Find a middle ground that respects both sides" },
      { value: "D", label: "Pass the situation on to my colleague or manager", isRisk: true }
    ]
  },
  {
    id: 26,
    section: "Red-Flag Detectors",
    text: "When plans change suddenly (teacher sick, groups merged), what do you do?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Adjust quickly and take initiative" },
      { value: "B", label: "Go along with it but feel unsettled" },
      { value: "C", label: "Wait for others to reorganize and follow their lead", isRisk: true },
      { value: "D", label: "Try to keep things as close to the original plan as possible", isRisk: true }
    ]
  },
  {
    id: 27,
    section: "Red-Flag Detectors",
    text: "Several children start crying at once. What's your first instinct?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Focus on the loudest one first", isRisk: true },
      { value: "B", label: "Calm the group environment before going to individuals" },
      { value: "C", label: "Ask a colleague to split the work" },
      { value: "D", label: "Comfort the child I know best", isRisk: true }
    ]
  },
  {
    id: 28,
    section: "Red-Flag Detectors",
    text: "On days when you feel tired or unmotivated, how do you usually cope at work?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Push through and keep busy until it passes" },
      { value: "B", label: "Keep tasks minimal and focus only on essentials", isRisk: true },
      { value: "C", label: "Rely more on colleagues for support that day", isRisk: true },
      { value: "D", label: "Find energy by engaging with the children" }
    ]
  },
  {
    id: 29,
    section: "Red-Flag Detectors",
    text: "Which part of childcare work is most draining for you personally?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Communicating with parents" },
      { value: "B", label: "Managing conflicts between colleagues" },
      { value: "C", label: "Keeping the environment clean and safe" },
      { value: "D", label: "Long stretches of high noise and energy" }
    ]
  },
  {
    id: 30,
    section: "Red-Flag Detectors",
    text: "During group time, one child keeps disrupting. What's your natural response?",
    isRedFlag: true,
    options: [
      { value: "A", label: "Remove them and deal with them separately" },
      { value: "B", label: "Redirect their energy into the activity" },
      { value: "C", label: "Ignore them until they settle down", isRisk: true },
      { value: "D", label: "Stop the group and focus only on that child", isRisk: true }
    ]
  },

  // SECTION 8: General Fit (Q31-Q40)
  {
    id: 31,
    section: "General Fit",
    text: "How do you prefer planning activities?",
    options: [
      { value: "A", label: "Detailed plans in advance" },
      { value: "B", label: "Loose plan with room to adapt" },
      { value: "C", label: "Build from children's interests on the day" },
      { value: "D", label: "Follow another colleague's lead" }
    ]
  },
  {
    id: 32,
    section: "General Fit",
    text: "What keeps you motivated in a long day?",
    options: [
      { value: "A", label: "Seeing children master a skill" },
      { value: "B", label: "A well-run routine" },
      { value: "C", label: "Playful moments and laughter" },
      { value: "D", label: "Teamwork and feeling supported" }
    ]
  },
  {
    id: 33,
    section: "General Fit",
    text: "What's your approach to multilingual groups?",
    options: [
      { value: "A", label: "Clear routines help all languages" },
      { value: "B", label: "Use visuals and gestures" },
      { value: "C", label: "Encourage children to teach each other words" },
      { value: "D", label: "Focus on the main language only" }
    ]
  },
  {
    id: 34,
    section: "General Fit",
    text: "When introducing a new child to the group, first priority is:",
    options: [
      { value: "A", label: "Establishing routine" },
      { value: "B", label: "Emotional safety and trust" },
      { value: "C", label: "Social integration with peers" },
      { value: "D", label: "Engaging activities to spark interest" }
    ]
  },
  {
    id: 35,
    section: "General Fit",
    text: "Which describes your documentation style?",
    options: [
      { value: "A", label: "Concise notes, consistent timing" },
      { value: "B", label: "Rich detail when something stands out" },
      { value: "C", label: "Photos with short captions" },
      { value: "D", label: "Minimal notes; prefer direct work with kids" }
    ]
  },
  {
    id: 36,
    section: "General Fit",
    text: "Transition times (e.g., cleanup → lunch) are best handled by:",
    options: [
      { value: "A", label: "Countdown and clear steps" },
      { value: "B", label: "Songs/games to make it fun" },
      { value: "C", label: "One-on-one prompts for those who need it" },
      { value: "D", label: "Letting the group flow naturally" }
    ]
  },
  {
    id: 37,
    section: "General Fit",
    text: "If a planned activity fails:",
    options: [
      { value: "A", label: "Analyze what went wrong later" },
      { value: "B", label: "Pivot quickly to an alternative" },
      { value: "C", label: "Ask colleagues for ideas" },
      { value: "D", label: "Continue — children need to finish" }
    ]
  },
  {
    id: 38,
    section: "General Fit",
    text: "Your ideal group size:",
    options: [
      { value: "A", label: "Small, for depth" },
      { value: "B", label: "Medium, balanced" },
      { value: "C", label: "Large, dynamic energy" },
      { value: "D", label: "Flexible, depends on the day" }
    ]
  },
  {
    id: 39,
    section: "General Fit",
    text: "Preferred communication with parents:",
    options: [
      { value: "A", label: "Brief daily facts" },
      { value: "B", label: "Weekly summaries" },
      { value: "C", label: "On-the-spot conversation" },
      { value: "D", label: "Messaging app updates" }
    ]
  },
  {
    id: 40,
    section: "General Fit",
    text: "Which age group do you feel you grow the most with?",
    options: [
      { value: "A", label: "Babies (3–12 months)" },
      { value: "B", label: "1–2 years" },
      { value: "C", label: "3+ years" },
      { value: "D", label: "All, I adapt and learn everywhere" }
    ]
  }
];

export default function DiscAssessmentWidget({
  onComplete,
  onClose,
  isPreview = false
}: DiscAssessmentWidgetProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    languageTrack: '',
    city: '',
    startDate: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleFormSubmit = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(3); // Assessment step
    }
  };

  const handleQuestionAnswer = (questionId: number, choice: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: choice }));

    // Automatically advance to next question
    if (currentQuestion < lunaDiscQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Assessment complete - calculate results
      setShowResults(true);
      setCurrentStep(4);
    }
  };

  // Calculate DISC results based on Luna's specifications
  const calculateResults = (answers: Record<number, string>) => {
    const colorCounts = { red: 0, blue: 0, green: 0, yellow: 0 };
    const redFlags: number[] = [];

    // Process each answer
    Object.entries(answers).forEach(([questionIdStr, choice]) => {
      const questionId = parseInt(questionIdStr);
      const question = lunaDiscQuestions.find(q => q.id === questionId);
      if (!question) return;

      const selectedOption = question.options.find(opt => opt.value === choice);
      if (!selectedOption) return;

      // Count colors for color questions
      if (question.isColorQuestion && selectedOption.color) {
        colorCounts[selectedOption.color as keyof typeof colorCounts]++;
      }

      // Detect red flags
      if (question.isRedFlag && selectedOption.isRisk) {
        redFlags.push(questionId);
      }
    });

    // Determine primary and secondary colors
    const colorEntries = Object.entries(colorCounts).sort(([,a], [,b]) => b - a);
    const primaryColor = colorEntries[0][0];
    const secondaryColor = colorEntries[1][0];

    // Calculate percentages
    const totalColorAnswers = Object.values(colorCounts).reduce((sum, count) => sum + count, 0);
    const colorPercentages = Object.fromEntries(
      Object.entries(colorCounts).map(([color, count]) => [
        color,
        totalColorAnswers > 0 ? Math.round((count / totalColorAnswers) * 100) : 0
      ])
    );

    return {
      colorCounts,
      colorPercentages,
      primaryColor,
      secondaryColor,
      redFlagCount: redFlags.length,
      redFlagQuestions: redFlags
    };
  };

  const getColorBadge = (color: string) => {
    const colors = {
      red: "bg-red-500/20 text-red-300 border-red-500/30",
      blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      green: "bg-green-500/20 text-green-300 border-green-500/30",
      yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getColorName = (color: string) => {
    const names = {
      red: "Captain Energy",
      blue: "Planner",
      green: "Heart",
      yellow: "Spark Maker"
    };
    return names[color as keyof typeof names] || color;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to TeddyKids!</h2>
              <p className="text-purple-300">Join our amazing team and help shape young minds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-purple-300">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-purple-500/10 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-purple-300">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="bg-purple-500/10 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-purple-300">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="bg-purple-500/10 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-purple-300">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter your city"
                  className="bg-purple-500/10 border-purple-500/30 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Tell us about your interests</h2>
              <p className="text-purple-300">Help us find the perfect role for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role" className="text-purple-300">Preferred Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="bg-purple-500/10 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select your preferred role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intern">Intern / Stagiair</SelectItem>
                    <SelectItem value="teacher">Teacher / Pedagoog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="languageTrack" className="text-purple-300">Language Track *</Label>
                <Select value={formData.languageTrack} onValueChange={(value) => setFormData(prev => ({ ...prev, languageTrack: value }))}>
                  <SelectTrigger className="bg-purple-500/10 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select language preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English Track</SelectItem>
                    <SelectItem value="nl">Dutch Track</SelectItem>
                    <SelectItem value="bi">Bilingual Track</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="startDate" className="text-purple-300">Preferred Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-purple-500/10 border-purple-500/30 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        const question = lunaDiscQuestions[currentQuestion];
        if (!question) return null;

        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-2">
                  {question.section}
                </Badge>
                <h2 className="text-2xl font-bold text-white mb-2">DISC Assessment</h2>
                <p className="text-purple-300">Question {currentQuestion + 1} of {lunaDiscQuestions.length}</p>
              </div>

              {question.isRedFlag && (
                <div className="flex justify-center">
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                    Behavioral Assessment
                  </Badge>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 rounded-lg border border-purple-500/30">
              <h3 className="text-xl font-medium text-white mb-6 text-center leading-relaxed">
                {question.text}
              </h3>

              {/* Clickable Answer Cards */}
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleQuestionAnswer(question.id, option.value)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                      "hover:border-purple-400 hover:bg-purple-500/20 hover:scale-[1.02]",
                      "border-purple-500/30 bg-purple-500/10 text-white",
                      "focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                        "bg-purple-500/30 text-purple-200 border border-purple-400/50"
                      )}>
                        {option.value}
                      </span>
                      <span className="flex-1 text-purple-100 leading-relaxed">
                        {option.label}
                      </span>
                      {option.color && (
                        <div className={cn(
                          "w-3 h-3 rounded-full opacity-0", // Hidden color indicator for scoring
                          option.color === 'red' && "bg-red-400",
                          option.color === 'blue' && "bg-blue-400",
                          option.color === 'green' && "bg-green-400",
                          option.color === 'yellow' && "bg-yellow-400"
                        )} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress indicator */}
              <div className="mt-6 text-center">
                <div className="text-xs text-purple-400">
                  Click an answer to continue
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        const results = calculateResults(answers);
        const refCode = `TK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        return (
          <div className="space-y-6 text-center relative">
            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-2 h-2 animate-bounce",
                    i % 4 === 0 && "bg-red-400",
                    i % 4 === 1 && "bg-blue-400",
                    i % 4 === 2 && "bg-green-400",
                    i % 4 === 3 && "bg-yellow-400"
                  )}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 50}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center relative z-10">
              <CheckCircle className="h-16 w-16 text-green-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white">Assessment Complete! 🎉</h2>
            <p className="text-purple-300">
              Thank you for completing your application. We'll match your color with our groups and reach out within 5 days.
            </p>

            {/* Real DISC Profile Results */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-medium mb-2">Your DISC Profile</h3>
              <div className="text-sm text-purple-300 mb-4">
                Primary: <span className="text-white font-medium">{getColorName(results.primaryColor)}</span> •
                Secondary: <span className="text-white font-medium">{getColorName(results.secondaryColor)}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="text-red-300 text-sm">Captain Energy</div>
                  <div className={cn(
                    "text-lg font-bold",
                    results.primaryColor === 'red' ? "text-red-400" : "text-white"
                  )}>
                    {results.colorPercentages.red}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-blue-300 text-sm">Planner</div>
                  <div className={cn(
                    "text-lg font-bold",
                    results.primaryColor === 'blue' ? "text-blue-400" : "text-white"
                  )}>
                    {results.colorPercentages.blue}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-green-300 text-sm">Heart</div>
                  <div className={cn(
                    "text-lg font-bold",
                    results.primaryColor === 'green' ? "text-green-400" : "text-white"
                  )}>
                    {results.colorPercentages.green}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="text-yellow-300 text-sm">Spark Maker</div>
                  <div className={cn(
                    "text-lg font-bold",
                    results.primaryColor === 'yellow' ? "text-yellow-400" : "text-white"
                  )}>
                    {results.colorPercentages.yellow}%
                  </div>
                </div>
              </div>

              {/* Primary Color Description */}
              <div className="mt-4 p-3 rounded-lg bg-black/20">
                <div className={cn("text-sm font-medium mb-1", getColorBadge(results.primaryColor))}>
                  You are primarily a {getColorName(results.primaryColor)}
                </div>
                <div className="text-xs text-purple-300">
                  {results.primaryColor === 'red' && "You're natural leaders who take charge and get results quickly."}
                  {results.primaryColor === 'blue' && "You're thoughtful planners who value structure and quality."}
                  {results.primaryColor === 'green' && "You're caring supporters who prioritize harmony and relationships."}
                  {results.primaryColor === 'yellow' && "You're creative energizers who inspire others with enthusiasm."}
                </div>
              </div>
            </div>

            <div className="text-sm text-purple-400">
              Reference Code: <span className="text-white font-mono">{refCode}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-black/90 border-purple-500/30 backdrop-blur-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              {isPreview && <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Preview</Badge>}
              <Brain className="h-5 w-5 text-purple-400" />
              TeddyKids Application
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-300">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="bg-purple-900/50" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 && currentStep < 4 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep < 3 && (
              <Button
                onClick={handleFormSubmit}
                disabled={!formData.fullName || !formData.email || (currentStep === 2 && (!formData.role || !formData.languageTrack))}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white ml-auto"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {currentStep === 4 && (
              <Button
                onClick={async () => {
                  const results = calculateResults(answers);

                  // Save to database
                  const saveResult = await assessmentService.saveAssessment(
                    formData as ApplicantFormData,
                    answers,
                    results as AssessmentResults
                  );

                  if (saveResult.success) {
                    console.log('Assessment saved successfully!', saveResult);
                    if (onComplete) onComplete({
                      formData,
                      answers,
                      results,
                      refCode: saveResult.refCode,
                      applicantId: saveResult.applicantId
                    });
                  } else {
                    console.error('Failed to save assessment:', saveResult.error);
                    // Still allow completion even if save fails
                    if (onComplete) onComplete({ formData, answers, results });
                  }

                  if (onClose) onClose();
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white ml-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}