/**
 * API Client configuration for backend communication
 */
import { logger } from './logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Translate error messages using the new i18n system
 * This function is kept for backward compatibility but now uses the error handler
 */
import { getErrorMessage, fallbackTranslate } from './error-handler';

function translateError(errorMessage: string | unknown): string {
  // Use the new error handler with fallback translations
  return getErrorMessage(errorMessage, fallbackTranslate);
}

/**
 * Retry a failed request with exponential backoff
 */
async function retryRequest<T>(
  endpoint: string,
  options: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await apiRequestInternal<T>(endpoint, options);
      
      // Don't retry on 4xx errors (client errors) except 408 (timeout) and 429 (rate limit)
      if (response.error && !response.error.includes('timeout') && !response.error.includes('rate limit')) {
        const statusMatch = response.error.match(/status: (\d+)/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1]);
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return response; // Don't retry client errors
          }
        }
      }
      
      if (!response.error) {
        return response;
      }
      
      lastError = new Error(response.error);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
    }
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries - 1) {
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return { 
    error: lastError?.message || 'La solicitud falló después de varios intentos' 
  };
}

/**
 * Internal API request function (without retry logic)
 */
async function apiRequestInternal<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;
    logger.debug(`[API] ${options.method || 'GET'} ${url}`, { headers, body: options.body });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dfff7b82-9de7-4929-be91-d40c01fc1897',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        sessionId:'debug-session',
        runId:'pre-fix',
        hypothesisId:'H1',
        location:'src/lib/api-client.ts:142',
        message:'apiRequestInternal pre-fetch',
        data:{ endpoint, url, method: options.method || 'GET' },
        timestamp:Date.now()
      })
    }).catch(()=>{});
    // #endregion agent log

    const response = await fetch(url, {
      ...options,
      headers,
    });

    logger.debug(`[API] Response status: ${response.status}`, response);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dfff7b82-9de7-4929-be91-d40c01fc1897',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        sessionId:'debug-session',
        runId:'pre-fix',
        hypothesisId:'H1',
        location:'src/lib/api-client.ts:149',
        message:'apiRequestInternal response',
        data:{ endpoint, status: response.status },
        timestamp:Date.now()
      })
    }).catch(()=>{});
    // #endregion agent log

    if (!response.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dfff7b82-9de7-4929-be91-d40c01fc1897',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          sessionId:'debug-session',
          runId:'pre-fix',
          hypothesisId:'H1',
          location:'src/lib/api-client.ts:153',
          message:'apiRequestInternal non-ok response',
          data:{ endpoint, status: response.status },
          timestamp:Date.now()
        })
      }).catch(()=>{});
      // #endregion agent log
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/';
        }
        return { error: 'No autorizado. Por favor, inicia sesión nuevamente.' };
      }
      
      const error = await response.json().catch(() => ({ 
        detail: `Error ${response.status}: ${response.statusText}` 
      }));
      
      // Log full error for 422 validation errors to help debug
      if (response.status === 422) {
        logger.error('[API] Validation error (422):', error);
        // Handle Pydantic validation errors - they have a 'detail' array
        if (error.detail && Array.isArray(error.detail)) {
          const validationErrors = error.detail.map((err: any) => {
            const field = err.loc ? err.loc.join('.') : 'campo';
            const msg = err.msg || 'Error de validación';
            return `${field}: ${msg}`;
          }).join(', ');
          return { error: `Error de validación: ${validationErrors}` };
        }
      }
      
      const errorMessage = error.detail || error.message || `Error ${response.status}`;
      return { error: translateError(errorMessage) };
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as ApiResponse<T>;
    }

    const data = await response.json();
    logger.debug(`[API] Response data:`, data);
    return { data };
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dfff7b82-9de7-4929-be91-d40c01fc1897',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        sessionId:'debug-session',
        runId:'pre-fix',
        hypothesisId:'H1',
        location:'src/lib/api-client.ts:192',
        message:'apiRequestInternal exception',
        data:{ endpoint, error: error instanceof Error ? error.message : 'unknown' },
        timestamp:Date.now()
      })
    }).catch(()=>{});
    // #endregion agent log
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return { error: 'Error de conexión. Verifica que el servidor esté corriendo.' };
    }
    return { 
      error: translateError(error instanceof Error ? error.message : 'Error de red') 
    };
  }
}

/**
 * Make API request to backend with automatic retry for network errors
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retry: boolean = true
): Promise<ApiResponse<T>> {
  if (retry) {
    return retryRequest(endpoint, options);
  }
  return apiRequestInternal(endpoint, options);
}

/**
 * Download PDF file from API
 */
export async function downloadPDF(
  endpoint: string,
  filename: string
): Promise<void> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/';
        }
        throw new Error('Unauthorized. Please login again.');
      }
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.detail || error.message || 'Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    throw error;
  }
}

/**
 * Download DOCX file from API
 */
export async function downloadDOCX(
  endpoint: string,
  filename: string
): Promise<void> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/';
        }
        throw new Error('Unauthorized. Please login again.');
      }
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.detail || error.message || 'Failed to download DOCX');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    logger.error(`Error downloading DOCX from ${endpoint}:`, error);
    throw error;
  }
}

export default apiRequest;
