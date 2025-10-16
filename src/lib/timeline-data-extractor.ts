/**
 * Timeline Data Extractor
 * 
 * EXPLICIT FALLBACK LOGIC for extracting salary and hours from timeline events.
 * 
 * STRATEGY:
 * 1. Try timeline cache (salary_at_event, hours_at_event)
 * 2. If NULL → Extract from JSONB (new_value, previous_value)
 * 3. If still NULL → Return null (caller can handle further fallbacks)
 * 
 * This is Phase 1 of Option C (Hybrid Approach)
 */

interface TimelineEventData {
  salary_at_event?: number | null;
  hours_at_event?: number | null;
  previous_value?: any;
  new_value?: any;
  event_type?: string;
}

interface ExtractedData {
  salary: number | null;
  hours: number | null;
  source: 'cache' | 'jsonb_new' | 'jsonb_previous' | 'not_found';
}

/**
 * Extract salary from timeline event with explicit fallback chain
 */
export function extractSalary(event: TimelineEventData): { value: number | null; source: string } {
  console.log('💰 [extractSalary] Starting extraction for event type:', event.event_type);
  
  // FALLBACK 1: Try cached value in salary_at_event
  if (event.salary_at_event != null && event.salary_at_event > 0) {
    console.log('✅ [extractSalary] Found in cache:', event.salary_at_event);
    return { value: event.salary_at_event, source: 'timeline_cache' };
  }
  console.log('⚠️ [extractSalary] Cache miss - salary_at_event is null or 0');
  
  // FALLBACK 2: Try extracting from JSONB new_value
  if (event.new_value) {
    const salary = extractSalaryFromJsonb(event.new_value, 'new_value');
    if (salary != null) {
      console.log('✅ [extractSalary] Extracted from new_value JSONB:', salary);
      return { value: salary, source: 'jsonb_new_value' };
    }
  }
  
  // FALLBACK 3: Try extracting from JSONB previous_value
  if (event.previous_value) {
    const salary = extractSalaryFromJsonb(event.previous_value, 'previous_value');
    if (salary != null) {
      console.log('✅ [extractSalary] Extracted from previous_value JSONB:', salary);
      return { value: salary, source: 'jsonb_previous_value' };
    }
  }
  
  console.log('❌ [extractSalary] No salary found in any source');
  return { value: null, source: 'not_found' };
}

/**
 * Extract hours from timeline event with explicit fallback chain
 */
export function extractHours(event: TimelineEventData): { value: number | null; source: string } {
  console.log('⏰ [extractHours] Starting extraction for event type:', event.event_type);
  
  // FALLBACK 1: Try cached value in hours_at_event
  if (event.hours_at_event != null && event.hours_at_event > 0) {
    console.log('✅ [extractHours] Found in cache:', event.hours_at_event);
    return { value: event.hours_at_event, source: 'timeline_cache' };
  }
  console.log('⚠️ [extractHours] Cache miss - hours_at_event is null or 0');
  
  // FALLBACK 2: Try extracting from JSONB new_value
  if (event.new_value) {
    const hours = extractHoursFromJsonb(event.new_value, 'new_value');
    if (hours != null) {
      console.log('✅ [extractHours] Extracted from new_value JSONB:', hours);
      return { value: hours, source: 'jsonb_new_value' };
    }
  }
  
  // FALLBACK 3: Try extracting from JSONB previous_value
  if (event.previous_value) {
    const hours = extractHoursFromJsonb(event.previous_value, 'previous_value');
    if (hours != null) {
      console.log('✅ [extractHours] Extracted from previous_value JSONB:', hours);
      return { value: hours, source: 'jsonb_previous_value' };
    }
  }
  
  console.log('❌ [extractHours] No hours found in any source');
  return { value: null, source: 'not_found' };
}

/**
 * Extract salary from JSONB object
 * Tries multiple field name variations
 */
function extractSalaryFromJsonb(jsonbData: any, source: string): number | null {
  // Handle string JSONB (needs parsing)
  let data = jsonbData;
  if (typeof jsonbData === 'string') {
    try {
      data = JSON.parse(jsonbData);
    } catch (e) {
      // Might be a plain number string
      const num = Number(jsonbData);
      if (!isNaN(num)) {
        console.log(`📦 [JSONB] Parsed ${source} as number:`, num);
        return num;
      }
      console.log(`❌ [JSONB] Failed to parse ${source}:`, e);
      return null;
    }
  }
  
  // Try different field name variations
  const fieldVariations = [
    'monthly_wage',
    'monthlyWage', 
    'salary',
    'gross_monthly',
    'grossMonthly',
    'bruto',
  ];
  
  for (const field of fieldVariations) {
    if (data[field] != null) {
      const value = Number(data[field]);
      if (!isNaN(value) && value > 0) {
        console.log(`📦 [JSONB] Found salary in ${source}.${field}:`, value);
        return value;
      }
    }
  }
  
  console.log(`❌ [JSONB] No salary field found in ${source}. Available fields:`, Object.keys(data));
  return null;
}

/**
 * Extract hours from JSONB object
 * Tries multiple field name variations
 */
function extractHoursFromJsonb(jsonbData: any, source: string): number | null {
  // Handle string JSONB (needs parsing)
  let data = jsonbData;
  if (typeof jsonbData === 'string') {
    try {
      data = JSON.parse(jsonbData);
    } catch (e) {
      // Might be a plain number string
      const num = Number(jsonbData);
      if (!isNaN(num)) {
        console.log(`📦 [JSONB] Parsed ${source} as number:`, num);
        return num;
      }
      console.log(`❌ [JSONB] Failed to parse ${source}:`, e);
      return null;
    }
  }
  
  // Try different field name variations
  const fieldVariations = [
    'hours_per_week',
    'hoursPerWeek',
    'hours',
    'weekly_hours',
    'weeklyHours',
  ];
  
  for (const field of fieldVariations) {
    if (data[field] != null) {
      const value = Number(data[field]);
      if (!isNaN(value) && value > 0) {
        console.log(`📦 [JSONB] Found hours in ${source}.${field}:`, value);
        return value;
      }
    }
  }
  
  console.log(`❌ [JSONB] No hours field found in ${source}. Available fields:`, Object.keys(data));
  return null;
}

/**
 * Extract both salary and hours with full fallback chain
 * Returns comprehensive result with sources
 */
export function extractTimelineData(event: TimelineEventData): ExtractedData {
  const salaryResult = extractSalary(event);
  const hoursResult = extractHours(event);
  
  // Log summary
  console.log('📊 [extractTimelineData] Summary:', {
    salary: salaryResult.value,
    salary_source: salaryResult.source,
    hours: hoursResult.value,
    hours_source: hoursResult.source,
  });
  
  return {
    salary: salaryResult.value,
    hours: hoursResult.value,
    source: salaryResult.source !== 'not_found' ? salaryResult.source : 'not_found',
  };
}

