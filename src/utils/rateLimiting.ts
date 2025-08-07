import AsyncStorage from '@react-native-async-storage/async-storage';

// Rate limiting configuration for spam prevention
const RATE_LIMITS = {
  POST_CREATION: {
    maxActions: 10, // Max 5 posts
    windowMs: 10 * 60 * 1000, // in 10 minutes
    key: 'posts'
  },
  COMMENT_CREATION: {
    maxActions: 20, // Max 15 comments 
    windowMs: 5 * 60 * 1000, // in 5 minutes
    key: 'comments'
  }
} as const;

type ActionType = 'POST_CREATION' | 'COMMENT_CREATION';

interface RateLimitData {
  timestamps: number[];
  lastCleanup: number;
}

/**
 * Client-side rate limiting to prevent spam posting/commenting
 * This provides immediate feedback to users and reduces server load
 */
export class RateLimiter {
  
  /**
   * Check if user can perform an action (post/comment)
   * @param userId - User ID to track rate limits per user
   * @param actionType - Type of action being performed
   * @returns Promise<{allowed: boolean, timeUntilReset?: number, message?: string}>
   */
  static async checkRateLimit(userId: string, actionType: ActionType): Promise<{
    allowed: boolean;
    timeUntilReset?: number;
    message?: string;
  }> {
    const config = RATE_LIMITS[actionType];
    const storageKey = `rateLimit_${userId}_${config.key}`;
    
    try {
      // Get current rate limit data
      const storedData = await AsyncStorage.getItem(storageKey);
      let rateLimitData: RateLimitData = storedData 
        ? JSON.parse(storedData) 
        : { timestamps: [], lastCleanup: Date.now() };

      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Clean old timestamps (older than the window)
      rateLimitData.timestamps = rateLimitData.timestamps.filter(
        timestamp => timestamp > windowStart
      );

      // Check if user has exceeded the limit
      if (rateLimitData.timestamps.length >= config.maxActions) {
        const oldestTimestamp = Math.min(...rateLimitData.timestamps);
        const timeUntilReset = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);
        
        const actionName = actionType === 'POST_CREATION' ? 'post' : 'comment';
        const minutesUntilReset = Math.ceil(timeUntilReset / 60);
        
        return {
          allowed: false,
          timeUntilReset,
          message: `Slow down please. You can ${actionName} again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // If there's an error, allow the action (fail open for better UX)
      return { allowed: true };
    }
  }

  /**
   * Record that user performed an action
   * @param userId - User ID
   * @param actionType - Type of action performed
   */
  static async recordAction(userId: string, actionType: ActionType): Promise<void> {
    const config = RATE_LIMITS[actionType];
    const storageKey = `rateLimit_${userId}_${config.key}`;
    
    try {
      const storedData = await AsyncStorage.getItem(storageKey);
      let rateLimitData: RateLimitData = storedData 
        ? JSON.parse(storedData) 
        : { timestamps: [], lastCleanup: Date.now() };

      const now = Date.now();
      
      // Add current timestamp
      rateLimitData.timestamps.push(now);
      rateLimitData.lastCleanup = now;

      // Save updated data
      await AsyncStorage.setItem(storageKey, JSON.stringify(rateLimitData));
    } catch (error) {
      console.error('Rate limit record error:', error);
      // Fail silently - rate limiting is not critical for app function
    }
  }

  /**
   * Get current rate limit status for user
   * @param userId - User ID
   * @param actionType - Type of action
   * @returns Current usage stats
   */
  static async getRateLimitStatus(userId: string, actionType: ActionType): Promise<{
    current: number;
    max: number;
    windowMinutes: number;
    timeUntilReset?: number;
  }> {
    const config = RATE_LIMITS[actionType];
    const storageKey = `rateLimit_${userId}_${config.key}`;
    
    try {
      const storedData = await AsyncStorage.getItem(storageKey);
      let rateLimitData: RateLimitData = storedData 
        ? JSON.parse(storedData) 
        : { timestamps: [], lastCleanup: Date.now() };

      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Clean old timestamps
      rateLimitData.timestamps = rateLimitData.timestamps.filter(
        timestamp => timestamp > windowStart
      );

      let timeUntilReset: number | undefined;
      if (rateLimitData.timestamps.length > 0) {
        const oldestTimestamp = Math.min(...rateLimitData.timestamps);
        timeUntilReset = Math.max(0, oldestTimestamp + config.windowMs - now);
      }

      return {
        current: rateLimitData.timestamps.length,
        max: config.maxActions,
        windowMinutes: config.windowMs / (1000 * 60),
        timeUntilReset
      };
    } catch (error) {
      console.error('Rate limit status error:', error);
      return {
        current: 0,
        max: config.maxActions,
        windowMinutes: config.windowMs / (1000 * 60)
      };
    }
  }

  /**
   * Clear rate limit data for a user (useful for testing or admin actions)
   * @param userId - User ID
   * @param actionType - Optional specific action type to clear
   */
  static async clearRateLimit(userId: string, actionType?: ActionType): Promise<void> {
    try {
      if (actionType) {
        const config = RATE_LIMITS[actionType];
        const storageKey = `rateLimit_${userId}_${config.key}`;
        await AsyncStorage.removeItem(storageKey);
      } else {
        // Clear all rate limits for user
        for (const action of Object.keys(RATE_LIMITS) as ActionType[]) {
          const config = RATE_LIMITS[action];
          const storageKey = `rateLimit_${userId}_${config.key}`;
          await AsyncStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Clear rate limit error:', error);
    }
  }
}

/**
 * Higher-order function to wrap actions with rate limiting
 * @param userId - User ID
 * @param actionType - Type of action
 * @param action - The actual action function to execute
 * @returns Promise with rate limit enforcement
 */
export async function withRateLimit<T>(
  userId: string,
  actionType: ActionType,
  action: () => Promise<T>
): Promise<T> {
  // Check rate limit first
  const rateLimitCheck = await RateLimiter.checkRateLimit(userId, actionType);
  
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.message || 'Rate limit exceeded');
  }

  // Execute the action
  const result = await action();

  // Record the action for future rate limiting
  await RateLimiter.recordAction(userId, actionType);

  return result;
}

export default RateLimiter;
