/**
 * Security utilities for safe user input handling
 * Protects against XSS, injection attacks, and malicious usernames
 */

// Safe characters for usernames: Letters, numbers, underscore, hyphen, period
// Excludes: /, ., #, $, [, ], control chars, and confusing Unicode
const SAFE_USERNAME_REGEX = /^[\p{L}\p{N}_\-.]{4,12}$/u;

// Dangerous characters that could be used for injection or spoofing
const DANGEROUS_CHARS = /[<>'"&\/\\#$\[\]{}()=+*?^|~`!@%]/;

// Zero-width and control characters that could be used for spoofing
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E]/;

// Firestore reserved characters that break document paths
const FIRESTORE_RESERVED = /[\/\.#$\[\]]/;

/**
 * Validates username with security considerations
 */
export const validateUsernameSecure = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  // Length check
  if (username.length < 4) {
    return { isValid: false, error: 'Username must be at least 4 characters' };
  }
  
  if (username.length > 12) {
    return { isValid: false, error: 'Username cannot exceed 12 characters' };
  }

  // Check for dangerous characters
  if (DANGEROUS_CHARS.test(username)) {
    return { isValid: false, error: 'Username contains invalid characters. Use letters, numbers, underscore, hyphen, or period only.' };
  }

  // Check for control characters (invisible chars used for spoofing)
  if (CONTROL_CHARS.test(username)) {
    return { isValid: false, error: 'Username contains invalid control characters' };
  }

  // Check for Firestore reserved characters
  if (FIRESTORE_RESERVED.test(username)) {
    return { isValid: false, error: 'Username cannot contain /, ., #, $, [, or ]' };
  }

  // Check against safe regex pattern
  if (!SAFE_USERNAME_REGEX.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscore, hyphen, and period' };
  }

  // Check for suspicious patterns
  if (username.startsWith('.') || username.endsWith('.')) {
    return { isValid: false, error: 'Username cannot start or end with a period' };
  }

  if (username.includes('..')) {
    return { isValid: false, error: 'Username cannot contain consecutive periods' };
  }

  // Check for homograph attacks (mixed scripts)
  if (containsMixedScripts(username)) {
    return { isValid: false, error: 'Username cannot mix different alphabets' };
  }

  return { isValid: true };
};

/**
 * Sanitizes user content for safe display and storage
 */
export const sanitizeUserContent = (content: string): string => {
  if (!content) return '';
  
  return content
    .trim()
    // Remove control characters but preserve line breaks
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Remove zero-width characters used for spoofing
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');
};

/**
 * Escapes content for safe use in URLs or notifications
 */
export const escapeForUrl = (text: string): string => {
  return encodeURIComponent(sanitizeUserContent(text));
};

/**
 * Escapes content for HTML contexts (future web compatibility)
 */
export const escapeHtml = (text: string): string => {
  return sanitizeUserContent(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validates password with security requirements
 */
export const validatePasswordSecure = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 12) {
    return { isValid: false, error: 'Password must be at least 12 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password cannot exceed 128 characters' };
  }

  // Check for at least one uppercase, lowercase, number, and special char
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      error: 'Password must contain uppercase, lowercase, number, and special character' 
    };
  }

  return { isValid: true };
};

/**
 * Detects mixed scripts that could be used for homograph attacks
 */
function containsMixedScripts(text: string): boolean {
  const scripts = new Set<string>();
  
  for (const char of text) {
    const code = char.codePointAt(0);
    if (!code) continue;
    
    // Determine script based on Unicode ranges
    let script = 'Unknown';
    
    if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) {
      script = 'Latin';
    } else if (code >= 0x0400 && code <= 0x04FF) {
      script = 'Cyrillic';
    } else if (code >= 0x0370 && code <= 0x03FF) {
      script = 'Greek';
    } else if (code >= 0x0590 && code <= 0x05FF) {
      script = 'Hebrew';
    } else if (code >= 0x0600 && code <= 0x06FF) {
      script = 'Arabic';
    } else if (code >= 0x4E00 && code <= 0x9FFF) {
      script = 'CJK';
    } else if (code >= 0x0030 && code <= 0x0039) {
      script = 'Digit';
    } else if (code === 0x005F || code === 0x002D || code === 0x002E) {
      script = 'Safe'; // underscore, hyphen, period
    }
    
    scripts.add(script);
  }
  
  // Allow mixing of Latin + Digits + Safe characters only
  const allowedCombinations = ['Latin', 'Digit', 'Safe'];
  for (const script of scripts) {
    if (!allowedCombinations.includes(script)) {
      return true; // Contains non-Latin scripts
    }
  }
  
  return false;
}

/**
 * Generates safe suggestions for invalid usernames
 */
export const generateSafeUsernameSuggestions = (baseUsername: string): string[] => {
  const safe = baseUsername
    .toLowerCase()
    .replace(/[^a-z0-9_\-.]/g, '') // Remove unsafe chars
    .replace(/\.+/g, '.') // Collapse multiple periods
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing periods
    .substring(0, 8); // Ensure room for suffixes
  
  if (safe.length < 4) {
    return []; // Can't generate valid suggestions
  }
  
  const suggestions: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${safe}${i}`;
    if (suggestion.length <= 12) {
      suggestions.push(suggestion);
    }
  }
  
  return suggestions;
};

/**
 * Rate limiting helper for username checks
 */
export const shouldRateLimit = (attempts: number, timeWindow: number = 60000): boolean => {
  return attempts > 10; // Max 10 username checks per minute
};
