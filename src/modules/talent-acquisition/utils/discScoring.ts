/**
 * 🧪 DISC SCORING ENGINE - Luna's Specifications
 * Complete assessment scoring system for TeddyKids talent acquisition
 */

import type {
  AssessmentAnswer,
  AssessmentResult,
  AssessmentQuestion,
  DISCColor,
  GroupFit
} from '../types';
import { DISC_PROFILES } from '../constants/discProfiles';

// ====================================================
// CORE SCORING FUNCTION - Luna's Algorithm
// ====================================================

export function scoreAssessment(
  answers: AssessmentAnswer[],
  questions: AssessmentQuestion[]
): AssessmentResult {
  // Initialize result object
  const result: Partial<AssessmentResult> = {
    color_counts: { red: 0, blue: 0, green: 0, yellow: 0 },
    red_flag_count: 0,
    red_flag_items: [],
    competency_scores: {},
    overall_score: 0
  };

  // Create question lookup for performance
  const questionMap = new Map(questions.map(q => [q.id, q]));

  // Process each answer
  for (const answer of answers) {
    const question = questionMap.get(answer.id);
    if (!question) continue;

    // Process based on question type
    switch (question.question_type) {
      case 'disc_color':
        processColorQuestion(answer, question, result);
        break;
      case 'red_flag':
        processRedFlagQuestion(answer, question, result);
        break;
      case 'age_group':
        processAgeGroupQuestion(answer, question, result);
        break;
      case 'competency':
        processCompetencyQuestion(answer, question, result);
        break;
    }
  }

  // Calculate primary and secondary colors
  const colorCounts = result.color_counts as Record<DISCColor, number>;
  const sortedColors = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a) as [DISCColor, number][];

  result.color_primary = sortedColors[0][0];
  result.color_secondary = sortedColors[1][0];

  // Calculate age group fit using Luna's heuristic
  result.age_fit = calculateAgeGroupFit(answers, questions);
  result.age_fit_confidence = calculateAgeGroupConfidence(answers, questions);

  // Calculate overall score
  result.overall_score = calculateOverallScore(result as AssessmentResult);

  return result as AssessmentResult;
}

// ====================================================
// INDIVIDUAL QUESTION PROCESSORS
// ====================================================

function processColorQuestion(
  answer: AssessmentAnswer,
  question: AssessmentQuestion,
  result: Partial<AssessmentResult>
): void {
  if (!question.color_mapping || !result.color_counts) return;

  const colorChoice = question.color_mapping[answer.choice];
  if (colorChoice && isValidDISCColor(colorChoice)) {
    result.color_counts[colorChoice]++;
  }
}

function processRedFlagQuestion(
  answer: AssessmentAnswer,
  question: AssessmentQuestion,
  result: Partial<AssessmentResult>
): void {
  if (!question.red_flag_mapping || !result.red_flag_items) return;

  const isRedFlag = question.red_flag_mapping[answer.choice];
  if (isRedFlag) {
    result.red_flag_count = (result.red_flag_count || 0) + 1;
    result.red_flag_items.push(answer.id);
  }
}

function processAgeGroupQuestion(
  answer: AssessmentAnswer,
  question: AssessmentQuestion,
  result: Partial<AssessmentResult>
): void {
  if (!question.age_group_mapping) return;

  const ageGroup = question.age_group_mapping[answer.choice];
  if (ageGroup) {
    // Store for later processing in calculateAgeGroupFit
    // Note: Stored as metadata, not in competency_scores
  }
}

function processCompetencyQuestion(
  answer: AssessmentAnswer,
  question: AssessmentQuestion,
  result: Partial<AssessmentResult>
): void {
  if (!question.competency_mapping || !result.competency_scores) return;

  const competencies = question.competency_mapping[answer.choice];
  if (competencies) {
    Object.entries(competencies).forEach(([competency, score]) => {
      if (!result.competency_scores![competency]) {
        result.competency_scores![competency] = 0;
      }
      result.competency_scores![competency] += score;
    });
  }
}

// ====================================================
// AGE GROUP FIT CALCULATION - Luna's Heuristic
// ====================================================

function calculateAgeGroupFit(
  answers: AssessmentAnswer[],
  questions: AssessmentQuestion[]
): GroupFit {
  const preferences: Record<GroupFit, number> = {
    babies: 0,
    one_two: 0,
    three_plus: 0,
    mixed: 0
  };

  // Key questions for age group determination (Luna's specification)
  const keyQuestions = [2, 7, 8, 9, 10, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];

  for (const answer of answers) {
    if (!keyQuestions.includes(answer.id)) continue;

    const question = questions.find(q => q.id === answer.id);
    if (!question || !question.age_group_mapping) continue;

    const preference = question.age_group_mapping[answer.choice];
    if (preference && preference in preferences) {
      preferences[preference as GroupFit]++;
    }
  }

  // Apply Luna's specific logic based on question patterns

  // Question 31-40 (direct age preference) - higher weight
  const directPreferences = answers.filter(a => a.id >= 31 && a.id <= 40);
  for (const answer of directPreferences) {
    const question = questions.find(q => q.id === answer.id);
    if (question?.age_group_mapping) {
      const pref = question.age_group_mapping[answer.choice];
      if (pref && pref in preferences) {
        preferences[pref as GroupFit] += 2; // Double weight for direct preferences
      }
    }
  }

  // Special patterns from Luna's heuristic:

  // If "prefers older" repeatedly → 3+
  const olderPreference = answers.filter(a =>
    [31, 33, 35, 37].includes(a.id) && a.choice === 'C'
  ).length;
  if (olderPreference >= 3) {
    preferences.three_plus += 3;
  }

  // If "routine/patience/gentleness" → Babies/1-2
  const routinePatience = answers.filter(a =>
    [32, 34, 36, 38].includes(a.id) && ['A', 'B'].includes(a.choice)
  ).length;
  if (routinePatience >= 3) {
    preferences.babies += 2;
    preferences.one_two += 2;
  }

  // If "group games/structured lessons" → 3+
  const structuredActivities = answers.filter(a =>
    [33, 35, 39].includes(a.id) && a.choice === 'C'
  ).length;
  if (structuredActivities >= 2) {
    preferences.three_plus += 2;
  }

  // Return the highest scoring age group
  const sortedPreferences = Object.entries(preferences)
    .sort(([,a], [,b]) => b - a) as [GroupFit, number][];

  return sortedPreferences[0][0];
}

function calculateAgeGroupConfidence(
  answers: AssessmentAnswer[],
  questions: AssessmentQuestion[]
): number {
  // Calculate confidence based on consistency of age-related answers
  const ageAnswers = answers.filter(a => a.id >= 31 && a.id <= 40);
  const totalAgeQuestions = ageAnswers.length;

  if (totalAgeQuestions === 0) return 0.5; // Default confidence

  // Count consistent answers
  const preferences: Record<string, number> = {};
  for (const answer of ageAnswers) {
    const question = questions.find(q => q.id === answer.id);
    if (question?.age_group_mapping) {
      const pref = question.age_group_mapping[answer.choice];
      if (pref) {
        preferences[pref] = (preferences[pref] || 0) + 1;
      }
    }
  }

  // Calculate consistency
  const maxCount = Math.max(...Object.values(preferences));
  const consistency = maxCount / totalAgeQuestions;

  // Convert to confidence (0.5 - 1.0 range)
  return Math.max(0.5, Math.min(1.0, 0.5 + consistency * 0.5));
}

// ====================================================
// OVERALL SCORE CALCULATION
// ====================================================

function calculateOverallScore(result: AssessmentResult): number {
  let score = 80; // Base score

  // Color distribution bonus (diversity is good)
  const colorCounts = Object.values(result.color_counts);
  const maxColor = Math.max(...colorCounts);
  const totalColors = colorCounts.reduce((sum, count) => sum + count, 0);

  if (totalColors > 0) {
    const colorBalance = 1 - (maxColor / totalColors);
    score += colorBalance * 10; // Up to 10 points for balanced personality
  }

  // Red flag penalty
  score -= result.red_flag_count * 15; // -15 points per red flag

  // Competency scores bonus
  const competencyAvg = Object.values(result.competency_scores).length > 0
    ? Object.values(result.competency_scores).reduce((sum, score) => sum + score, 0) / Object.values(result.competency_scores).length
    : 0;
  score += competencyAvg * 2; // Competency scores can add up to 10 points

  // Age fit confidence bonus
  score += (result.age_fit_confidence - 0.5) * 20; // Up to 10 points for high confidence

  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ====================================================
// COLOR RESULT GENERATION - Luna's Display Text
// ====================================================

export function generateColorResult(result: AssessmentResult): {
  primary: DISCColor;
  secondary: DISCColor;
  description: string;
  childcare_fit: string;
} {
  const primaryProfile = DISC_PROFILES[result.color_primary];
  const secondaryProfile = DISC_PROFILES[result.color_secondary];

  return {
    primary: result.color_primary,
    secondary: result.color_secondary,
    description: `Your style looks ${primaryProfile.title} with a ${secondaryProfile.title} edge.`,
    childcare_fit: `Likely group fit: ${formatGroupFit(result.age_fit)}. We'll confirm in your trial day!`
  };
}

function formatGroupFit(ageFit: GroupFit): string {
  switch (ageFit) {
    case 'babies': return 'Babies (0-1 years)';
    case 'one_two': return 'Toddlers (1-2 years)';
    case 'three_plus': return 'Older Children (3+ years)';
    case 'mixed': return 'Mixed Age Groups';
    default: return 'To be determined';
  }
}

// ====================================================
// UTILITY FUNCTIONS
// ====================================================

function isValidDISCColor(color: string): color is DISCColor {
  return ['red', 'blue', 'green', 'yellow'].includes(color);
}

export function getColorDescription(color: DISCColor): string {
  return DISC_PROFILES[color].description;
}

export function getColorStrengths(color: DISCColor): string[] {
  return DISC_PROFILES[color].strengths;
}

export function getAgeGroupRecommendation(
  primaryColor: DISCColor,
  agePreference: GroupFit
): {
  recommended: boolean;
  reasoning: string;
  alternative?: GroupFit;
} {
  // Luna's matching logic
  const colorAgeMatching: Record<DISCColor, GroupFit[]> = {
    red: ['three_plus', 'mixed'], // Leaders work well with older kids
    blue: ['babies', 'one_two'], // Planners excel with routine-heavy age groups
    green: ['babies', 'one_two', 'three_plus', 'mixed'], // Hearts work with everyone
    yellow: ['one_two', 'three_plus', 'mixed'] // Spark makers need interactive ages
  };

  const idealAges = colorAgeMatching[primaryColor];
  const isRecommended = idealAges.includes(agePreference);

  if (isRecommended) {
    return {
      recommended: true,
      reasoning: `Your ${DISC_PROFILES[primaryColor].title} style aligns perfectly with ${formatGroupFit(agePreference)}.`
    };
  } else {
    const bestFit = idealAges[0];
    return {
      recommended: false,
      reasoning: `Your ${DISC_PROFILES[primaryColor].title} style might be better suited for ${formatGroupFit(bestFit)}.`,
      alternative: bestFit
    };
  }
}

// ====================================================
// ASSESSMENT VALIDATION
// ====================================================

export function validateAssessmentAnswers(
  answers: AssessmentAnswer[],
  questions: AssessmentQuestion[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if all required questions are answered
  const requiredQuestions = questions.filter(q => q.required);
  const answeredQuestionIds = new Set(answers.map(a => a.id));

  for (const question of requiredQuestions) {
    if (!answeredQuestionIds.has(question.id)) {
      errors.push(`Question ${question.id} is required but not answered`);
    }
  }

  // Validate answer choices
  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.id);
    if (!question) {
      errors.push(`Question ${answer.id} not found`);
      continue;
    }

    const validChoices = ['A', 'B'];
    if (question.option_c) validChoices.push('C');
    if (question.option_d) validChoices.push('D');

    if (!validChoices.includes(answer.choice)) {
      errors.push(`Invalid choice "${answer.choice}" for question ${answer.id}`);
    }
  }

  // Check for suspicious patterns
  const redFlagQuestions = questions.filter(q => q.question_type === 'red_flag');
  const redFlagAnswers = answers.filter(a =>
    redFlagQuestions.some(q => q.id === a.id)
  );

  if (redFlagAnswers.length > 0) {
    const suspiciousCount = redFlagAnswers.filter(answer => {
      const question = redFlagQuestions.find(q => q.id === answer.id);
      return question?.red_flag_mapping?.[answer.choice];
    }).length;

    if (suspiciousCount >= 5) {
      warnings.push('High number of concerning responses detected - may require additional review');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ====================================================
// EXPORT SCORING UTILITIES
// ====================================================

export { DISC_PROFILES } from '../constants/discProfiles';

export type {
  AssessmentAnswer,
  AssessmentResult,
  AssessmentQuestion,
  DISCColor,
  GroupFit
} from '../types';