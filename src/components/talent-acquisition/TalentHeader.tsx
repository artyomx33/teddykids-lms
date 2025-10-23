/**
 * 🎯 TALENT HEADER COMPONENT
 * Component Refactoring Architect - Header section extraction
 * Preserves header UI from main component
 */

import { UserPlus, Brain } from 'lucide-react';

export function TalentHeader() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="relative">
          <UserPlus className="h-12 w-12 text-purple-400" />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-white">
          Talent Acquisition Engine
        </h1>
        <Brain className="h-8 w-8 text-yellow-400 animate-pulse" />
      </div>
      <p className="text-xl text-purple-300 max-w-3xl mx-auto">
        AI-powered hiring pipeline with intelligent candidate matching,
        automated assessments, and predictive analytics for optimal talent acquisition.
      </p>
    </div>
  );
}

export default TalentHeader;

