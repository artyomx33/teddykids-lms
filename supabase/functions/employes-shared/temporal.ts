// ⏰ TEMPORAL HELPER FUNCTIONS
// NO TEMPLATE LITERALS! (Supabase Edge Function requirement)

import type { 
  RawDataRecord, 
  ChangeRecord, 
  DetectedChange,
  ChangeType,
  ComparisonResult
} from './types.ts';

// ============================================================================
// DATA HASHING
// ============================================================================

export async function hashData(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  if (dateString === '0001-01-01T00:00:00') return null; // Invalid date from API
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

export function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.getTime() < d2.getTime();
}

export function isDateAfter(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.getTime() > d2.getTime();
}

export function isDateInRange(
  date: string | Date,
  start: string | Date | null,
  end: string | Date | null
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (start) {
    const s = typeof start === 'string' ? new Date(start) : start;
    if (d.getTime() < s.getTime()) return false;
  }
  
  if (end) {
    const e = typeof end === 'string' ? new Date(end) : end;
    if (d.getTime() > e.getTime()) return false;
  }
  
  return true;
}

// ============================================================================
// EFFECTIVE DATE EXTRACTION
// ============================================================================

export function extractEffectiveDate(data: any, endpoint: string): string | null {
  // Extract effective_from based on endpoint type
  switch (endpoint) {
    case '/employee':
      // For employee snapshots, use current time
      return new Date().toISOString();
      
    case '/employments':
      return formatDate(data.start_date);
      
    case '/salary-history':
      return formatDate(data.start_date);
      
    case '/contracts':
      return formatDate(data.start_date);
      
    case '/hours':
      return formatDate(data.start_date);
      
    case '/payruns':
      return formatDate(data.start_date || data.period_start);
      
    default:
      return new Date().toISOString();
  }
}

// ============================================================================
// CHANGE DETECTION
// ============================================================================

export function detectChanges(
  oldData: any,
  newData: any,
  fieldsToCheck: string[]
): DetectedChange[] {
  const changes: DetectedChange[] = [];
  
  for (const field of fieldsToCheck) {
    const oldValue = getNestedValue(oldData, field);
    const newValue = getNestedValue(newData, field);
    
    if (!areValuesEqual(oldValue, newValue)) {
      const change: DetectedChange = {
        change_type: inferChangeType(field),
        effective_date: extractEffectiveDate(newData, '/employee') || new Date().toISOString(),
        field_name: field,
        old_value: oldValue,
        new_value: newValue,
        confidence_score: 1.0,
        reason: 'Field value changed'
      };
      
      // Calculate numeric changes
      if (typeof oldValue === 'number' && typeof newValue === 'number') {
        change.change_amount = newValue - oldValue;
        change.change_percent = oldValue !== 0 
          ? ((newValue - oldValue) / oldValue) * 100 
          : 0;
      }
      
      changes.push(change);
    }
  }
  
  return changes;
}

function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current == null) return null;
    current = current[part];
  }
  
  return current;
}

function areValuesEqual(val1: any, val2: any): boolean {
  if (val1 === val2) return true;
  if (val1 == null || val2 == null) return false;
  
  // For numbers, consider small floating point differences
  if (typeof val1 === 'number' && typeof val2 === 'number') {
    return Math.abs(val1 - val2) < 0.01;
  }
  
  // For dates
  if (val1 instanceof Date && val2 instanceof Date) {
    return val1.getTime() === val2.getTime();
  }
  
  // For objects/arrays (deep comparison)
  if (typeof val1 === 'object' && typeof val2 === 'object') {
    return JSON.stringify(val1) === JSON.stringify(val2);
  }
  
  return false;
}

function inferChangeType(fieldName: string): ChangeType {
  const lower = fieldName.toLowerCase();
  
  if (lower.includes('salary') || lower.includes('wage') || lower.includes('hourly')) {
    return 'salary_change';
  }
  if (lower.includes('hours') || lower.includes('hour_per_week')) {
    return 'hours_change';
  }
  if (lower.includes('contract')) {
    return 'contract_change';
  }
  if (lower.includes('position') || lower.includes('role') || lower.includes('job')) {
    return 'position_change';
  }
  if (lower.includes('location')) {
    return 'location_change';
  }
  if (lower.includes('department')) {
    return 'department_change';
  }
  if (lower.includes('status')) {
    return 'status_change';
  }
  
  // Default
  return 'contract_change';
}

// ============================================================================
// COMPARISON HELPERS
// ============================================================================

export function compareSnapshots(
  oldSnapshot: any,
  newSnapshot: any
): ComparisonResult {
  const fields = [
    'salary',
    'hourly_rate',
    'hours_per_week',
    'contract_type',
    'position',
    'location',
    'department',
    'status'
  ];
  
  const changes = detectChanges(oldSnapshot, newSnapshot, fields);
  
  return {
    is_different: changes.length > 0,
    changes,
    similarity_score: calculateSimilarity(oldSnapshot, newSnapshot)
  };
}

function calculateSimilarity(obj1: any, obj2: any): number {
  const fields = Object.keys({ ...obj1, ...obj2 });
  if (fields.length === 0) return 1.0;
  
  let matches = 0;
  for (const field of fields) {
    if (areValuesEqual(obj1[field], obj2[field])) {
      matches++;
    }
  }
  
  return matches / fields.length;
}

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

export function calculateConfidenceScore(change: DetectedChange): number {
  let confidence = 1.0;
  
  // Reduce confidence for large percentage changes
  if (change.change_percent && Math.abs(change.change_percent) > 50) {
    confidence -= 0.3;
  }
  
  // Reduce confidence if no effective date
  if (!change.effective_date) {
    confidence -= 0.2;
  }
  
  // Boost confidence if change amount seems reasonable
  if (change.change_type === 'salary_change' && change.change_percent) {
    const percentChange = Math.abs(change.change_percent);
    if (percentChange >= 0 && percentChange <= 10) {
      confidence += 0.1;
    }
  }
  
  return Math.max(0, Math.min(1, confidence));
}

// ============================================================================
// UUID GENERATION
// ============================================================================

export function generateUUID(): string {
  return crypto.randomUUID();
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function isValidEmployeeId(id: string): boolean {
  // Check if it's a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function isValidEndpoint(endpoint: string): boolean {
  const validEndpoints = [
    '/employee',
    '/employments',
    '/salary-history',
    '/contracts',
    '/hours',
    '/payruns'
  ];
  return validEndpoints.includes(endpoint);
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function deduplicate<T>(array: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  
  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  
  return result;
}


