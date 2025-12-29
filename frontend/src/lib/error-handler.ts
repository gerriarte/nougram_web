/**
 * Error handler for API errors with i18n support
 * Replaces the old translateError function with a code-based system
 */

interface ErrorResponse {
  code?: string;
  message?: string;
  detail?: string | { code?: string; message?: string; params?: Record<string, any> };
  params?: Record<string, any>;
}

/**
 * Get error message from API error response
 * Supports both old format (string message) and new format (error code)
 * 
 * @param error - Error object from API response
 * @param translations - Translation function (from next-intl or fallback)
 * @returns Translated error message
 */
export function getErrorMessage(
  error: unknown,
  translations?: (key: string, params?: Record<string, any>) => string
): string {
  // Handle Error objects
  if (error instanceof Error) {
    return getErrorMessageFromString(error.message, translations);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return getErrorMessageFromString(error, translations);
  }

  // Handle API error response objects
  if (error && typeof error === 'object') {
    const errorObj = error as ErrorResponse;
    
    // Check for new format: { detail: { code: "...", message: "...", params: {...} } }
    if (errorObj.detail && typeof errorObj.detail === 'object' && 'code' in errorObj.detail) {
      const detail = errorObj.detail as { code?: string; message?: string; params?: Record<string, any> };
      if (detail.code && translations) {
        return translations(`errors.${detail.code}`, detail.params || {});
      }
      if (detail.message) {
        return detail.message;
      }
    }
    
    // Check for code at top level
    if (errorObj.code && translations) {
      return translations(`errors.${errorObj.code}`, errorObj.params || {});
    }
    
    // Check for message at top level
    if (errorObj.message) {
      return getErrorMessageFromString(errorObj.message, translations);
    }
    
    // Check for detail as string
    if (errorObj.detail && typeof errorObj.detail === 'string') {
      return getErrorMessageFromString(errorObj.detail, translations);
    }
  }

  // Fallback
  return translations?.('errors.UNKNOWN_ERROR') || 'Error desconocido';
}

/**
 * Get error message from string (backward compatibility)
 * Handles old error messages that don't have codes
 */
function getErrorMessageFromString(
  message: string,
  translations?: (key: string, params?: Record<string, any>) => string
): string {
  // If we have translations, try to match common patterns
  if (translations) {
    // Common error patterns
    const patterns: Record<string, string> = {
      'not found': 'RESOURCE_NOT_FOUND',
      'Cannot delete': 'RESOURCE_IN_USE',
      'is being used': 'RESOURCE_IN_USE',
      'Unauthorized': 'UNAUTHORIZED',
      'Invalid credentials': 'INVALID_CREDENTIALS',
      'Permission denied': 'PERMISSION_DENIED',
      'Network error': 'NETWORK_ERROR',
    };

    const lowerMessage = message.toLowerCase();
    for (const [pattern, code] of Object.entries(patterns)) {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        return translations(`errors.${code}`);
      }
    }
  }

  // Fallback: return message as-is (for backward compatibility)
  return message;
}

/**
 * Simple fallback translation function
 * Used when next-intl is not available
 */
export function fallbackTranslate(key: string, params?: Record<string, any>): string {
  // Load Spanish translations as fallback
  try {
    // This is a simple fallback - in production, you'd load from messages/es.json
    const fallbackTranslations: Record<string, string> = {
      'errors.INVALID_CREDENTIALS': 'Credenciales inválidas',
      'errors.UNAUTHORIZED': 'No autorizado',
      'errors.PERMISSION_DENIED': 'No tienes permiso para realizar esta acción',
      'errors.RESOURCE_NOT_FOUND': 'El recurso solicitado no existe o ha sido eliminado',
      'errors.RESOURCE_IN_USE': 'No se puede eliminar. Está siendo usado',
      'errors.NETWORK_ERROR': 'Error de conexión de red',
      'errors.UNKNOWN_ERROR': 'Error desconocido',
    };

    let message = fallbackTranslations[key] || key;
    
    // Simple parameter interpolation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        message = message.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return message;
  } catch {
    return key;
  }
}

