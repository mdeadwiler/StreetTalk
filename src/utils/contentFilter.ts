// Content filtering utilities for user-generated content
// Apple requires content moderation for App Store approval

// Basic profanity list - extend as needed
const PROFANITY_LIST = [
  // Add common inappropriate words here
  'spam', 'scam', 'fake', 'bot',
  // You can expand this list based on your community guidelines
];

// More sophisticated patterns to detect
const SUSPICIOUS_PATTERNS = [
  /(.)\1{4,}/g, // Repeated characters (aaaaa)
  /\b\d{10,}\b/g, // Phone numbers
  /[^\w\s]{5,}/g, // Too many special characters
  /@\w+\.(com|net|org)/gi, // Email patterns
  /bit\.ly|tinyurl|t\.co/gi, // Shortened URLs
];

export interface ContentFilterResult {
  isClean: boolean;
  flaggedWords: string[];
  suspiciousPatterns: string[];
  severity: 'clean' | 'mild' | 'severe';
}

export function filterContent(content: string): ContentFilterResult {
  const lowerContent = content.toLowerCase();
  const flaggedWords: string[] = [];
  const suspiciousPatterns: string[] = [];

  // Check for profanity
  PROFANITY_LIST.forEach(word => {
    if (lowerContent.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  });

  // Check for suspicious patterns
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      suspiciousPatterns.push(pattern.toString());
    }
  });

  // Determine severity
  let severity: 'clean' | 'mild' | 'severe' = 'clean';
  if (suspiciousPatterns.length > 0) {
    severity = 'mild';
  }
  if (flaggedWords.length > 0) {
    severity = 'severe';
  }

  return {
    isClean: flaggedWords.length === 0 && suspiciousPatterns.length === 0,
    flaggedWords,
    suspiciousPatterns,
    severity
  };
}

// Clean content by removing/replacing inappropriate parts
export function cleanContent(content: string): string {
  let cleanedContent = content;

  // Replace flagged words with asterisks
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleanedContent = cleanedContent.replace(regex, '*'.repeat(word.length));
  });

  // Remove suspicious patterns
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    cleanedContent = cleanedContent.replace(pattern, '[removed]');
  });

  return cleanedContent;
}

// Validate content before allowing submission
export function validateContentForSubmission(content: string): {
  isValid: boolean;
  message?: string;
} {
  const filterResult = filterContent(content);

  if (filterResult.severity === 'severe') {
    return {
      isValid: false,
      message: 'Your content contains inappropriate language. Please revise and try again.'
    };
  }

  if (filterResult.severity === 'mild') {
    return {
      isValid: false,
      message: 'Your content appears to contain spam or suspicious patterns. Please revise and try again.'
    };
  }

  return { isValid: true };
}
