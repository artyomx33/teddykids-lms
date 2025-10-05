// PRODUCTION-READY EDGE FUNCTION IMPROVEMENTS
// To be added to the existing employes-integration function

// 1. ENHANCED INPUT VALIDATION
interface ValidatedRequest {
  action: string;
  data?: any;
  metadata?: {
    userAgent?: string;
    timestamp: string;
    requestId: string;
  };
}

function validateRequest(body: any): ValidatedRequest {
  const requestId = crypto.randomUUID();

  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body: expected JSON object');
  }

  const { action, ...otherData } = body;

  if (!action || typeof action !== 'string') {
    throw new Error('Missing or invalid action parameter');
  }

  const validActions = [
    'test_connection',
    'fetch_companies',
    'fetch_employees',
    'compare_staff_data',
    'sync_employees',
    'sync_wage_data',
    'sync_from_employes',
    'get_sync_statistics',
    'get_sync_logs',
    'discover_endpoints',
    'debug_connection'
  ];

  if (!validActions.includes(action)) {
    throw new Error(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
  }

  return {
    action,
    data: otherData,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId
    }
  };
}

// 2. PRODUCTION ERROR HANDLING
interface ProductionError {
  error: string;
  code: string;
  timestamp: string;
  requestId?: string;
  details?: any;
}

function createProductionError(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: any,
  requestId?: string
): ProductionError {
  return {
    error: message,
    code,
    timestamp: new Date().toISOString(),
    requestId,
    details: Deno.env.get('DEBUG') === 'true' ? details : undefined
  };
}

// 3. RATE LIMITING
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let userRequests = this.requests.get(identifier) || [];
    userRequests = userRequests.filter(time => time > windowStart);

    if (userRequests.length >= this.maxRequests) {
      return false;
    }

    userRequests.push(now);
    this.requests.set(identifier, userRequests);
    return true;
  }
}

// 4. SECURITY ENHANCEMENTS
function validateApiAccess(req: Request): { userId?: string; isAdmin: boolean } {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  // In production, validate JWT token here
  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = decodeJWT(token);

    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token payload');
    }

    return {
      userId: decoded.sub,
      isAdmin: decoded.role === 'admin' || decoded.user_metadata?.role === 'admin'
    };
  } catch (error) {
    throw new Error('Token validation failed');
  }
}

// 5. ENHANCED LOGGING
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  action?: string;
  duration?: number;
  metadata?: any;
}

class ProductionLogger {
  static log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(logEntry));

    // In production, could also send to external logging service
    if (entry.level === 'error') {
      // Could send to error tracking service like Sentry
    }
  }
}

// 6. RESPONSE STANDARDIZATION
interface ProductionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ProductionError;
  metadata: {
    timestamp: string;
    requestId: string;
    duration: number;
    version: string;
  };
}

function createProductionResponse<T>(
  data?: T,
  error?: ProductionError,
  requestId: string = crypto.randomUUID(),
  startTime: number = Date.now()
): ProductionResponse<T> {
  return {
    success: !error,
    data,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      duration: Date.now() - startTime,
      version: '1.0.0'
    }
  };
}

// 7. PRODUCTION MAIN HANDLER TEMPLATE
async function productionHandler(req: Request): Promise<Response> {
  const startTime = Date.now();
  let requestId = crypto.randomUUID();
  let userId: string | undefined;

  try {
    // Rate limiting
    const rateLimiter = new RateLimiter();
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';

    if (!rateLimiter.isAllowed(clientIP)) {
      throw new Error('Rate limit exceeded');
    }

    // Validate auth
    const authInfo = validateApiAccess(req);
    userId = authInfo.userId;

    // Parse and validate request
    const body = await req.json();
    const validatedRequest = validateRequest(body);
    requestId = validatedRequest.metadata!.requestId;

    ProductionLogger.log({
      level: 'info',
      message: `Processing ${validatedRequest.action} request`,
      requestId,
      userId,
      action: validatedRequest.action
    });

    // Execute action (existing logic would go here)
    let result: any;

    switch (validatedRequest.action) {
      case 'fetch_employees':
        result = await fetchEmployesEmployees();
        break;
      // ... other cases
      default:
        throw new Error(`Unimplemented action: ${validatedRequest.action}`);
    }

    if (result.error) {
      throw new Error(result.error);
    }

    ProductionLogger.log({
      level: 'info',
      message: `Successfully completed ${validatedRequest.action}`,
      requestId,
      userId,
      action: validatedRequest.action,
      duration: Date.now() - startTime
    });

    return new Response(
      JSON.stringify(createProductionResponse(result.data, undefined, requestId, startTime)),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    const productionError = createProductionError(
      error.message,
      error.code || 'INTERNAL_ERROR',
      { stack: error.stack },
      requestId
    );

    ProductionLogger.log({
      level: 'error',
      message: `Request failed: ${error.message}`,
      requestId,
      userId,
      metadata: { stack: error.stack }
    });

    return new Response(
      JSON.stringify(createProductionResponse(undefined, productionError, requestId, startTime)),
      {
        status: error.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}