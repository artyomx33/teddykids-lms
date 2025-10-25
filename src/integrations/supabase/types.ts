/**
 * Supabase Database Types
 * 
 * This file has been refactored into domain-specific modules for better maintainability.
 * The original 4,728-line file has been split into focused domains while preserving
 * 100% backward compatibility.
 * 
 * Structure:
 * - types/base.ts - Core types (Json, Database shell)
 * - types/staff.ts - Staff management types
 * - types/reviews.ts - Review system types
 * - types/contracts.ts - Contract types
 * - types/employes.ts - Employes integration types
 * - types/talent.ts - Talent acquisition types
 * - types/documents.ts - Document types
 * - types/system.ts - System/shared types
 * - types/index.ts - Merges all domains (this exports from there)
 * 
 * All existing imports continue to work without changes.
 * Original file preserved at types.ts.backup for reference.
 */

export * from './types/index';
