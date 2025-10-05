// 📝 STRUCTURED LOGGING
// NO TEMPLATE LITERALS! (Supabase Edge Function requirement)

import type { LogEntry } from './types.ts';

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

export function log(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  service: string,
  context?: Record<string, any>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service,
    context
  };
  
  console.log(JSON.stringify(entry));
}

export function logInfo(message: string, service: string, context?: Record<string, any>): void {
  log('info', message, service, context);
}

export function logWarn(message: string, service: string, context?: Record<string, any>): void {
  log('warn', message, service, context);
}

export function logError(message: string, service: string, error?: any, context?: Record<string, any>): void {
  const errorContext = {
    ...context,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : undefined
  };
  
  log('error', message, service, errorContext);
}

export function logDebug(message: string, service: string, context?: Record<string, any>): void {
  log('debug', message, service, context);
}

// ============================================================================
// SYNC LOGGING (Database)
// ============================================================================

export async function logSyncToDB(
  supabase: any,
  action: string,
  status: 'success' | 'error' | 'info',
  message: string,
  employeeId?: string,
  staffId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('employes_sync_logs').insert({
      action,
      status,
      message,
      employes_employee_id: employeeId,
      lms_staff_id: staffId,
      error_message: errorMessage,
      details: null,
      created_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Failed to log sync to database:', error);
  }
}

// ============================================================================
// PERFORMANCE LOGGING
// ============================================================================

export class PerformanceTimer {
  private startTime: number;
  private checkpoints: Map<string, number>;
  
  constructor() {
    this.startTime = Date.now();
    this.checkpoints = new Map();
  }
  
  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now() - this.startTime);
  }
  
  duration(): number {
    return Date.now() - this.startTime;
  }
  
  getCheckpoints(): Record<string, number> {
    const result: Record<string, number> = {};
    this.checkpoints.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  
  logSummary(service: string, operation: string): void {
    logInfo(
      operation + ' completed in ' + this.duration() + 'ms',
      service,
      {
        duration_ms: this.duration(),
        checkpoints: this.getCheckpoints()
      }
    );
  }
}

// ============================================================================
// REQUEST LOGGING
// ============================================================================

export function logRequest(
  service: string,
  method: string,
  endpoint: string,
  statusCode: number,
  duration_ms: number
): void {
  logInfo(
    method + ' ' + endpoint + ' - ' + statusCode,
    service,
    {
      method,
      endpoint,
      status_code: statusCode,
      duration_ms
    }
  );
}

export function logAPICall(
  service: string,
  endpoint: string,
  success: boolean,
  duration_ms: number,
  error?: string
): void {
  if (success) {
    logInfo(
      'API call successful: ' + endpoint,
      service,
      { endpoint, duration_ms }
    );
  } else {
    logError(
      'API call failed: ' + endpoint,
      service,
      error ? new Error(error) : undefined,
      { endpoint, duration_ms }
    );
  }
}

// ============================================================================
// BATCH LOGGING
// ============================================================================

export class BatchLogger {
  private logs: LogEntry[];
  private service: string;
  
  constructor(service: string) {
    this.logs = [];
    this.service = service;
  }
  
  add(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      context
    });
  }
  
  flush(): void {
    if (this.logs.length === 0) return;
    
    console.log(JSON.stringify({
      batch: true,
      service: this.service,
      count: this.logs.length,
      logs: this.logs
    }));
    
    this.logs = [];
  }
  
  summary(): { total: number; by_level: Record<string, number> } {
    const by_level: Record<string, number> = {};
    this.logs.forEach(log => {
      by_level[log.level] = (by_level[log.level] || 0) + 1;
    });
    
    return {
      total: this.logs.length,
      by_level
    };
  }
}


