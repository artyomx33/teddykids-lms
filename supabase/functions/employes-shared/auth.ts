// 🔐 AUTHENTICATION & API KEY MANAGEMENT
// NO TEMPLATE LITERALS! (Supabase Edge Function requirement)

import { EMPLOYES_BASE_URL, TEDDY_KIDS_COMPANY_ID } from './types.ts';

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

export function getEmployesAPIKey(): string {
  const key = Deno.env.get('EMPLOYES_API_KEY');
  if (!key) {
    throw new Error('EMPLOYES_API_KEY environment variable not set');
  }
  return key;
}

export function getSupabaseURL(): string {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) {
    throw new Error('SUPABASE_URL environment variable not set');
  }
  return url;
}

export function getSupabaseServiceKey(): string {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  }
  return key;
}

// ============================================================================
// API REQUEST HELPERS
// ============================================================================

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function makeEmployesRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const apiKey = getEmployesAPIKey();
  
  const headers: Record<string, string> = {
    'Authorization': 'Bearer ' + apiKey,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const requestConfig: RequestInit = {
    method: options.method || 'GET',
    headers
  };
  
  if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
    requestConfig.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(endpoint, requestConfig);
    
    if (response.ok) {
      const data = await response.json();
      return { data, status: response.status };
    } else {
      const errorText = await response.text();
      return {
        error: 'API request failed: ' + response.status + ' - ' + errorText,
        status: response.status
      };
    }
  } catch (error: any) {
    return {
      error: 'Network error: ' + error.message,
      status: 0
    };
  }
}

// ============================================================================
// ENDPOINT BUILDERS
// ============================================================================

export function buildEmployeesEndpoint(page: number = 1, perPage: number = 100): string {
  return EMPLOYES_BASE_URL + '/' + TEDDY_KIDS_COMPANY_ID + '/employees?page=' + page + '&per_page=' + perPage;
}

export function buildEmployeeEndpoint(employeeId: string): string {
  return EMPLOYES_BASE_URL + '/' + TEDDY_KIDS_COMPANY_ID + '/employees/' + employeeId;
}

export function buildEmploymentsEndpoint(employeeId: string): string {
  return EMPLOYES_BASE_URL + '/' + TEDDY_KIDS_COMPANY_ID + '/employees/' + employeeId + '/employments';
}

export function buildSalaryHistoryEndpoint(employeeId: string): string {
  return EMPLOYES_BASE_URL + '/' + TEDDY_KIDS_COMPANY_ID + '/employees/' + employeeId + '/salary-history';
}

export function buildContractsEndpoint(employeeId: string): string {
  return EMPLOYES_BASE_URL + '/' + TEDDY_KIDS_COMPANY_ID + '/employees/' + employeeId + '/contracts';
}

export function buildHoursEndpoint(employeeId: string): string {
  return EMPLOYES_BASE_URL + '/' + TEDDY_KIDS_COMPANY_ID + '/employees/' + employeeId + '/hours';
}

export function buildPayrunsEndpoint(): string {
  return EMPLOYES_BASE_URL + '/' + TEDDY_KIDS_COMPANY_ID + '/payruns';
}

// ============================================================================
// CORS HEADERS
// ============================================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// ============================================================================
// JWT DECODING
// ============================================================================

export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error: any) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function validateJWT(token: string): { valid: boolean; details: any; error?: string } {
  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return { valid: false, details: null, error: 'Invalid JWT format' };
  }
  
  const now = Math.floor(Date.now() / 1000);
  const details = {
    issuer: decoded.iss,
    audience: decoded.aud,
    subject: decoded.sub,
    expires: decoded.exp,
    issuedAt: decoded.iat,
    isExpired: decoded.exp && decoded.exp < now,
    timeToExpiry: decoded.exp ? decoded.exp - now : null,
    scopes: decoded.scope || decoded.scopes || 'not specified'
  };
  
  if (details.isExpired) {
    return { valid: false, details, error: 'JWT token expired' };
  }
  
  return { valid: true, details };
}


