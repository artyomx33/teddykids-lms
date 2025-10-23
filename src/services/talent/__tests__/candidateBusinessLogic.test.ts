/**
 * 🧪 CANDIDATE BUSINESS LOGIC - TESTS
 * Tests for business rules and calculations
 */

import { describe, it, expect } from 'vitest';
import { CandidateBusinessLogic } from '../candidateBusinessLogic';

describe('CandidateBusinessLogic', () => {
  describe('validateStatusTransition', () => {
    it('should allow valid transitions', () => {
      expect(CandidateBusinessLogic.validateStatusTransition('new', 'screening')).toBe(true);
      expect(CandidateBusinessLogic.validateStatusTransition('screening', 'interview')).toBe(true);
      expect(CandidateBusinessLogic.validateStatusTransition('interview', 'offer')).toBe(true);
      expect(CandidateBusinessLogic.validateStatusTransition('offer', 'hired')).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(CandidateBusinessLogic.validateStatusTransition('new', 'hired')).toBe(false);
      expect(CandidateBusinessLogic.validateStatusTransition('hired', 'screening')).toBe(false);
      expect(CandidateBusinessLogic.validateStatusTransition('rejected', 'offer')).toBe(false);
    });

    it('should allow rejection from any status', () => {
      expect(CandidateBusinessLogic.validateStatusTransition('new', 'rejected')).toBe(true);
      expect(CandidateBusinessLogic.validateStatusTransition('screening', 'rejected')).toBe(true);
      expect(CandidateBusinessLogic.validateStatusTransition('interview', 'rejected')).toBe(true);
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate weighted score correctly', () => {
      const candidate = {
        percentage_score: 80,
        ai_match_score: 90,
        cultural_fit_score: 85
      };

      const score = CandidateBusinessLogic.calculateOverallScore(candidate);
      
      // (80 * 0.4) + (90 * 0.4) + (85 * 0.2) = 32 + 36 + 17 = 85
      expect(score).toBe(85);
    });

    it('should handle null values', () => {
      const candidate = {
        percentage_score: null,
        ai_match_score: null,
        cultural_fit_score: undefined
      };

      const score = CandidateBusinessLogic.calculateOverallScore(candidate);
      expect(score).toBe(0);
    });
  });

  describe('determineHiringRecommendation', () => {
    it('should recommend hire for high scores', () => {
      const recommendation = CandidateBusinessLogic.determineHiringRecommendation(
        92, // overallScore
        true, // passed
        0 // redFlagCount
      );

      expect(recommendation).toBe('hire');
    });

    it('should reject candidates with red flags', () => {
      const recommendation = CandidateBusinessLogic.determineHiringRecommendation(
        95, // high score
        true,
        2 // red flags!
      );

      expect(recommendation).toBe('no_hire');
    });

    it('should reject candidates who did not pass', () => {
      const recommendation = CandidateBusinessLogic.determineHiringRecommendation(
        85,
        false, // did not pass!
        0
      );

      expect(recommendation).toBe('no_hire');
    });
  });

  describe('filterCandidates', () => {
    const candidates = [
      { id: '1', overall_status: 'new', overall_score: 85, passed: true },
      { id: '2', overall_status: 'screening', overall_score: 72, passed: true },
      { id: '3', overall_status: 'interview', overall_score: 65, passed: false }
    ] as any[];

    it('should filter by status', () => {
      const filtered = CandidateBusinessLogic.filterCandidates(candidates, {
        status: 'new'
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by minimum score', () => {
      const filtered = CandidateBusinessLogic.filterCandidates(candidates, {
        minScore: 75
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].overall_score).toBe(85);
    });

    it('should filter by passed status', () => {
      const filtered = CandidateBusinessLogic.filterCandidates(candidates, {
        passed: true
      });

      expect(filtered).toHaveLength(2);
    });
  });

  describe('sortCandidatesByPriority', () => {
    it('should sort by status priority', () => {
      const candidates = [
        { id: '1', overall_status: 'hired', overall_score: 90 },
        { id: '2', overall_status: 'new', overall_score: 85 },
        { id: '3', overall_status: 'screening', overall_score: 88 }
      ] as any[];

      const sorted = CandidateBusinessLogic.sortCandidatesByPriority(candidates);

      expect(sorted[0].overall_status).toBe('new');
      expect(sorted[1].overall_status).toBe('screening');
      expect(sorted[2].overall_status).toBe('hired');
    });
  });
});

