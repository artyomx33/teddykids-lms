/**
 * 🎯 STATE CHANGE TRACKING SYSTEM
 * The foundation that powers all Labs 2.0 AI features
 *
 * This system captures EVERY change in the application:
 * - Location changes, group changes, manager changes
 * - Role changes, salary changes, hours changes
 * - Contract type changes, performance reviews
 * - Document uploads, training completions
 * - Login patterns, system interactions
 *
 * Powers: Contract DNA, Quantum States, Emotional Intelligence,
 *         Time Travel, Gamification, AI Predictions
 */

export interface StateChange {
  id: string;
  timestamp: Date;
  userId: string; // Who made the change
  entityType: 'staff' | 'contract' | 'review' | 'document' | 'training' | 'system';
  entityId: string; // Which record was changed
  changeType: 'create' | 'update' | 'delete' | 'view' | 'action';
  fieldName?: string; // Which field changed
  oldValue?: any; // Previous value
  newValue?: any; // New value
  context?: {
    reason?: string; // Why the change was made
    source: 'manual' | 'import' | 'sync' | 'automation' | 'bulk';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  };
  impact?: {
    affectedUsers?: string[]; // Other users affected by this change
    cascadeChanges?: string[]; // Other changes triggered by this
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface StatePattern {
  patternId: string;
  description: string;
  frequency: number;
  lastOccurrence: Date;
  confidence: number; // 0-1, how confident we are in this pattern
  predictiveValue: number; // 0-1, how useful for predictions
}

export interface EmployeeDNA {
  employeeId: string;
  sequence: string; // Encoded sequence of all changes
  patterns: StatePattern[];
  traits: {
    stability: number; // How often they change
    growth: number; // Trend toward more responsibility
    satisfaction: number; // Derived from change patterns
    predictability: number; // How predictable their changes are
  };
  mutations: StateChange[]; // Recent significant changes
  compatibility: { // With other employees
    [employeeId: string]: number; // Compatibility score 0-1
  };
}

export interface QuantumState {
  entityId: string;
  probabilities: {
    [outcome: string]: number; // Probability 0-1 for each possible future
  };
  entanglement: { // How this entity affects others
    [entityId: string]: number; // Entanglement strength 0-1
  };
  lastCollapse?: Date; // When probability became reality
  confidence: number; // How confident we are in predictions
}

class StateTracker {
  private changes: StateChange[] = [];
  private patterns: Map<string, StatePattern[]> = new Map();
  private dnaCache: Map<string, EmployeeDNA> = new Map();
  private quantumStates: Map<string, QuantumState> = new Map();

  /**
   * 📝 Record a state change
   */
  async trackChange(change: Omit<StateChange, 'id' | 'timestamp'>): Promise<StateChange> {
    const fullChange: StateChange = {
      ...change,
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.changes.push(fullChange);

    // TODO: Persist to database
    await this.persistChange(fullChange);

    // Update patterns and DNA
    await this.updatePatterns(fullChange);
    await this.updateDNA(fullChange);
    await this.updateQuantumStates(fullChange);

    return fullChange;
  }

  /**
   * 🧬 Generate Contract DNA for an employee
   */
  async generateDNA(employeeId: string): Promise<EmployeeDNA> {
    const cached = this.dnaCache.get(employeeId);
    if (cached) return cached;

    const employeeChanges = this.changes.filter(c =>
      c.entityId === employeeId ||
      c.impact?.affectedUsers?.includes(employeeId)
    );

    // Generate DNA sequence from changes
    const sequence = this.encodeChangesToDNA(employeeChanges);

    // Detect patterns
    const patterns = await this.detectPatterns(employeeChanges);

    // Calculate traits
    const traits = this.calculateTraits(employeeChanges, patterns);

    // Find mutations (significant recent changes)
    const mutations = employeeChanges
      .filter(c => this.isSignificantChange(c))
      .slice(-10); // Last 10 significant changes

    // Calculate compatibility with other employees
    const compatibility = await this.calculateCompatibility(employeeId);

    const dna: EmployeeDNA = {
      employeeId,
      sequence,
      patterns,
      traits,
      mutations,
      compatibility,
    };

    this.dnaCache.set(employeeId, dna);
    return dna;
  }

  /**
   * 🔮 Generate Quantum States (probability predictions)
   */
  async generateQuantumStates(entityId: string): Promise<QuantumState> {
    const cached = this.quantumStates.get(entityId);

    const entityChanges = this.changes.filter(c => c.entityId === entityId);
    const patterns = await this.detectPatterns(entityChanges);

    // Calculate probabilities for various outcomes
    const probabilities = {
      'contract_renewal': this.calculateRenewalProbability(entityChanges, patterns),
      'salary_increase': this.calculateSalaryIncreaseProbability(entityChanges, patterns),
      'hours_increase': this.calculateHoursIncreaseProbability(entityChanges, patterns),
      'role_promotion': this.calculatePromotionProbability(entityChanges, patterns),
      'termination_risk': this.calculateTerminationRisk(entityChanges, patterns),
      'satisfaction_high': this.calculateSatisfactionProbability(entityChanges, patterns),
    };

    // Calculate entanglement (how this entity affects others)
    const entanglement = await this.calculateEntanglement(entityId);

    const quantumState: QuantumState = {
      entityId,
      probabilities,
      entanglement,
      confidence: this.calculatePredictionConfidence(patterns),
    };

    this.quantumStates.set(entityId, quantumState);
    return quantumState;
  }

  /**
   * 🎭 Calculate Emotional Intelligence Score
   */
  async calculateEmotionalIntelligence(employeeId: string): Promise<{
    happiness: number;
    stress: number;
    satisfaction: number;
    motivation: number;
    stability: number;
    prediction: string;
  }> {
    const changes = this.changes.filter(c =>
      c.entityId === employeeId ||
      c.impact?.affectedUsers?.includes(employeeId)
    );

    // Analyze change patterns for emotional indicators
    const recentChanges = changes.slice(-50); // Last 50 changes

    const happiness = this.calculateHappinessFromChanges(recentChanges);
    const stress = this.calculateStressFromChanges(recentChanges);
    const satisfaction = this.calculateSatisfactionFromChanges(recentChanges);
    const motivation = this.calculateMotivationFromChanges(recentChanges);
    const stability = this.calculateStabilityFromChanges(recentChanges);

    const prediction = this.generateEmotionalPrediction(
      happiness, stress, satisfaction, motivation, stability
    );

    return {
      happiness,
      stress,
      satisfaction,
      motivation,
      stability,
      prediction,
    };
  }

  /**
   * ⏰ Time Travel: Simulate different timeline outcomes
   */
  async simulateTimeline(
    entityId: string,
    whatIfChanges: Partial<StateChange>[]
  ): Promise<{
    timeline: string;
    probability: number;
    outcomes: {
      [metric: string]: number;
    };
  }[]> {
    // Create alternate timeline by applying what-if changes
    const baseChanges = this.changes.filter(c => c.entityId === entityId);

    const timelines: Array<{
      timeline: string;
      probability: number;
      outcomes: { [metric: string]: number };
    }> = [];

    for (const whatIf of whatIfChanges) {
      const alteredChanges = [...baseChanges];

      // Apply the what-if change
      const mockChange: StateChange = {
        id: `mock_${Date.now()}`,
        timestamp: new Date(),
        userId: 'simulation',
        entityType: 'staff',
        entityId,
        changeType: 'update',
        ...whatIf,
      };

      alteredChanges.push(mockChange);

      // Calculate outcomes for this timeline
      const patterns = await this.detectPatterns(alteredChanges);
      const outcomes = {
        retention: this.calculateRetentionFromPatterns(patterns),
        productivity: this.calculateProductivityFromPatterns(patterns),
        satisfaction: this.calculateSatisfactionFromPatterns(patterns),
        cost: this.calculateCostFromPatterns(patterns),
      };

      const probability = this.calculateTimelineProbability(patterns);

      timelines.push({
        timeline: whatIf.fieldName || 'unknown_change',
        probability,
        outcomes,
      });
    }

    return timelines.sort((a, b) => b.probability - a.probability);
  }

  // Private helper methods
  private async persistChange(change: StateChange): Promise<void> {
    // TODO: Save to Supabase database
    console.log('📝 State change tracked:', change);
  }

  private encodeChangesToDNA(changes: StateChange[]): string {
    // Convert changes to DNA-like sequence
    return changes
      .map(c => {
        const codes: { [key: string]: string } = {
          'salary': 'S',
          'hours': 'H',
          'position': 'P',
          'contract': 'C',
          'review': 'R',
          'location': 'L',
          'manager': 'M',
          'training': 'T',
          'document': 'D',
        };
        return codes[c.fieldName || 'unknown'] || 'X';
      })
      .join('');
  }

  private async detectPatterns(changes: StateChange[]): Promise<StatePattern[]> {
    // Analyze changes to detect recurring patterns
    const patterns: StatePattern[] = [];

    // Example: Detect "Tuesday salary increase pattern"
    const tuesdayIncreases = changes.filter(c =>
      c.fieldName === 'salary' &&
      c.timestamp.getDay() === 2 // Tuesday
    );

    if (tuesdayIncreases.length > 2) {
      patterns.push({
        patternId: 'tuesday_salary_syndrome',
        description: 'Salary increases tend to happen on Tuesdays',
        frequency: tuesdayIncreases.length,
        lastOccurrence: tuesdayIncreases[tuesdayIncreases.length - 1]?.timestamp,
        confidence: Math.min(tuesdayIncreases.length / 10, 1),
        predictiveValue: 0.7,
      });
    }

    // TODO: Add more sophisticated pattern detection

    return patterns;
  }

  private calculateTraits(changes: StateChange[], patterns: StatePattern[]) {
    const recentChanges = changes.slice(-20);

    return {
      stability: Math.max(0, 1 - (recentChanges.length / 20)), // Less changes = more stable
      growth: this.calculateGrowthTrend(changes),
      satisfaction: this.calculateSatisfactionFromChanges(changes),
      predictability: patterns.reduce((acc, p) => acc + p.confidence, 0) / Math.max(patterns.length, 1),
    };
  }

  private calculateGrowthTrend(changes: StateChange[]): number {
    const growthChanges = changes.filter(c =>
      ['salary', 'hours', 'position'].includes(c.fieldName || '') &&
      c.changeType === 'update'
    );

    // Simple growth calculation - could be much more sophisticated
    return Math.min(growthChanges.length / 10, 1);
  }

  private calculateSatisfactionFromChanges(changes: StateChange[]): number {
    // Analyze change patterns to infer satisfaction
    const positiveChanges = changes.filter(c =>
      ['salary', 'hours', 'position'].includes(c.fieldName || '') &&
      c.changeType === 'update'
    ).length;

    const negativeChanges = changes.filter(c =>
      c.changeType === 'delete' ||
      (c.fieldName === 'hours' && c.newValue < c.oldValue)
    ).length;

    return Math.max(0, Math.min(1, (positiveChanges - negativeChanges) / 10 + 0.5));
  }

  private async calculateCompatibility(employeeId: string): Promise<{ [employeeId: string]: number }> {
    // Calculate compatibility with other employees based on similar change patterns
    // TODO: Implement sophisticated compatibility algorithm
    return {};
  }

  private async updatePatterns(change: StateChange): Promise<void> {
    // Update pattern detection based on new change
    // TODO: Implement real-time pattern updates
  }

  private async updateDNA(change: StateChange): Promise<void> {
    // Invalidate DNA cache for affected employees
    this.dnaCache.delete(change.entityId);
    change.impact?.affectedUsers?.forEach(userId => {
      this.dnaCache.delete(userId);
    });
  }

  private async updateQuantumStates(change: StateChange): Promise<void> {
    // Update quantum state predictions based on new change
    this.quantumStates.delete(change.entityId);
  }

  private isSignificantChange(change: StateChange): boolean {
    return ['salary', 'hours', 'position', 'contract', 'manager'].includes(change.fieldName || '');
  }

  // Quantum probability calculations
  private calculateRenewalProbability(changes: StateChange[], patterns: StatePattern[]): number {
    // Calculate probability of contract renewal based on patterns
    return 0.75; // Placeholder
  }

  private calculateSalaryIncreaseProbability(changes: StateChange[], patterns: StatePattern[]): number {
    return 0.45; // Placeholder
  }

  private calculateHoursIncreaseProbability(changes: StateChange[], patterns: StatePattern[]): number {
    return 0.33; // Placeholder
  }

  private calculatePromotionProbability(changes: StateChange[], patterns: StatePattern[]): number {
    return 0.23; // Placeholder
  }

  private calculateTerminationRisk(changes: StateChange[], patterns: StatePattern[]): number {
    return 0.12; // Placeholder
  }

  private calculateSatisfactionProbability(changes: StateChange[], patterns: StatePattern[]): number {
    return 0.78; // Placeholder
  }

  private async calculateEntanglement(entityId: string): Promise<{ [entityId: string]: number }> {
    // Calculate how changes to this entity affect others
    return {}; // Placeholder
  }

  private calculatePredictionConfidence(patterns: StatePattern[]): number {
    return patterns.reduce((acc, p) => acc + p.confidence, 0) / Math.max(patterns.length, 1);
  }

  // Emotional intelligence calculations
  private calculateHappinessFromChanges(changes: StateChange[]): number {
    return Math.random() * 100; // Placeholder
  }

  private calculateStressFromChanges(changes: StateChange[]): number {
    return Math.random() * 100; // Placeholder
  }

  private calculateMotivationFromChanges(changes: StateChange[]): number {
    return Math.random() * 100; // Placeholder
  }

  private calculateStabilityFromChanges(changes: StateChange[]): number {
    return Math.random() * 100; // Placeholder
  }

  private generateEmotionalPrediction(
    happiness: number,
    stress: number,
    satisfaction: number,
    motivation: number,
    stability: number
  ): string {
    if (satisfaction > 80) return "Will ask for promotion in 3 weeks";
    if (stress > 70) return "Considering contract non-renewal";
    if (motivation > 85) return "Ready for additional responsibilities";
    return "Stable and content with current situation";
  }

  // Timeline simulation helpers
  private calculateRetentionFromPatterns(patterns: StatePattern[]): number {
    return Math.random() * 100; // Placeholder
  }

  private calculateProductivityFromPatterns(patterns: StatePattern[]): number {
    return Math.random() * 100; // Placeholder
  }

  private calculateSatisfactionFromPatterns(patterns: StatePattern[]): number {
    return Math.random() * 100; // Placeholder
  }

  private calculateCostFromPatterns(patterns: StatePattern[]): number {
    return Math.random() * 100; // Placeholder
  }

  private calculateTimelineProbability(patterns: StatePattern[]): number {
    return Math.random(); // Placeholder
  }
}

// Singleton instance
export const stateTracker = new StateTracker();

// Convenience functions for tracking common changes
export const trackStaffChange = (staffId: string, fieldName: string, oldValue: any, newValue: any, userId: string) => {
  return stateTracker.trackChange({
    userId,
    entityType: 'staff',
    entityId: staffId,
    changeType: 'update',
    fieldName,
    oldValue,
    newValue,
    context: {
      source: 'manual',
      severity: 'medium',
    },
  });
};

export const trackContractChange = (contractId: string, fieldName: string, oldValue: any, newValue: any, userId: string) => {
  return stateTracker.trackChange({
    userId,
    entityType: 'contract',
    entityId: contractId,
    changeType: 'update',
    fieldName,
    oldValue,
    newValue,
    context: {
      source: 'manual',
      severity: 'high',
    },
  });
};

export const trackSystemInteraction = (userId: string, action: string, entityId?: string) => {
  return stateTracker.trackChange({
    userId,
    entityType: 'system',
    entityId: entityId || 'system',
    changeType: 'action',
    fieldName: 'user_action',
    newValue: action,
    context: {
      source: 'automation',
      severity: 'low',
    },
  });
};