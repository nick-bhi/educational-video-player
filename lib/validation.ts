/**
 * Input validation and sanitization utilities
 */

// Input length limits
export const INPUT_LIMITS = {
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 2000,
  COMMENT_MAX: 1000,
  URL_MAX: 2048,
} as const;

// Profanity words list. Expand as needed
// Use word boundary matching to reduce false positives
const PROFANITY_WORDS: string[] = [
  // Common profanity and inappropriate words
  'ass',
  'asshole',
  'bastard',
  'bitch',
  'bullshit',
  'crap',
  'damn',
  'dick',
  'fuck',
  'fucking',
  'goddamn',
  'hell',
  'idiot',
  'moron',
  'piss',
  'pussy',
  'shit',
  'shitting',
  'stupid',
  'suck',
  'sucks',
  'sex',
  'sucking',
  'whore',
  // Add more words as needed
];

/**
 * Check if text contains profanity using word boundary matching
 * Match whole words only to reduce false positives
 */
export function containsProfanity(text: string): boolean {
  if (!text || PROFANITY_WORDS.length === 0) return false;
  
  const lowerText = text.toLowerCase();
  
  // Use word boundary matching to reduce false positives
  // Match whole words, not parts of words
  for (const profanityWord of PROFANITY_WORDS) {
    // Create regex pattern with word boundaries
    // \b matches word boundaries (start/end of word)
    // Escape special regex characters in profanity word
    const escapedWord = profanityWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundaryRegex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    
    if (wordBoundaryRegex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sanitize text input by trimming and removing excessive whitespace
 */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Validate video title
 */
export function validateVideoTitle(
  title: string,
  existingTitles: string[] = []
): { isValid: boolean; error?: string } {
  const trimmed = title.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Title is required' };
  }
  
  if (trimmed.length > INPUT_LIMITS.TITLE_MAX) {
    return {
      isValid: false,
      error: `Title must be no more than ${INPUT_LIMITS.TITLE_MAX} characters`,
    };
  }
  
  // Check for duplicate titles (case-insensitive)
  const lowerTitle = trimmed.toLowerCase();
  if (existingTitles.some(t => t.toLowerCase() === lowerTitle)) {
    return {
      isValid: false,
      error: 'A video with this title already exists. Please choose a different title.',
    };
  }
  
  // Check for profanity
  if (containsProfanity(trimmed)) {
    return {
      isValid: false,
      error: 'Title contains inappropriate language. Please use appropriate language.',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate video description
 */
export function validateVideoDescription(
  description: string
): { isValid: boolean; error?: string } {
  const trimmed = description.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Description is required' };
  }
  
  if (trimmed.length > INPUT_LIMITS.DESCRIPTION_MAX) {
    return {
      isValid: false,
      error: `Description must be no more than ${INPUT_LIMITS.DESCRIPTION_MAX} characters`,
    };
  }
  
  // Check for profanity
  if (containsProfanity(trimmed)) {
    return {
      isValid: false,
      error: 'Description contains inappropriate language. Please use appropriate language.',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate video URL
 */
export function validateVideoUrl(url: string): { isValid: boolean; error?: string } {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Video URL is required' };
  }
  
  if (trimmed.length > INPUT_LIMITS.URL_MAX) {
    return {
      isValid: false,
      error: `URL must be no more than ${INPUT_LIMITS.URL_MAX} characters`,
    };
  }
  
  // Check for local file paths
  if (trimmed.startsWith('/')) {
    if (!trimmed.startsWith('/videos/')) {
      return {
        isValid: false,
        error: 'Local video files must be in the /videos/ folder (e.g., /videos/my-video.mp4)',
      };
    }
    return { isValid: true };
  }
  
  // Validate external URL. Only allow HTTP/HTTPS protocols
  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.toLowerCase();
    
    // Only allow http and https protocols
    if (protocol !== 'http:' && protocol !== 'https:') {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol',
      };
    }
    
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid video URL',
    };
  }
}

/**
 * Validate comment text
 */
export function validateComment(comment: string): { isValid: boolean; error?: string } {
  const trimmed = comment.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Comment cannot be empty' };
  }
  
  if (trimmed.length > INPUT_LIMITS.COMMENT_MAX) {
    return {
      isValid: false,
      error: `Comment must be no more than ${INPUT_LIMITS.COMMENT_MAX} characters`,
    };
  }
  
  // Check for profanity
  if (containsProfanity(trimmed)) {
    return {
      isValid: false,
      error: 'Comment contains inappropriate language. Please use appropriate language.',
    };
  }
  
  return { isValid: true };
}

