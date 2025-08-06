/**
 * Client-side cost monitoring and query optimization utilities
 * Helps track and prevent expensive Firestore operations
 */

interface QueryMetrics {
  operation: string;
  collection: string;
  docCount: number;
  timestamp: number;
  userId?: string;
}

class CostMonitor {
  private metrics: QueryMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 operations
  
  /**
   * Log a Firestore operation for monitoring
   */
  logOperation(operation: string, collection: string, docCount: number, userId?: string) {
    const metric: QueryMetrics = {
      operation,
      collection,
      docCount,
      timestamp: Date.now(),
      userId
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
    
    // Warn about expensive operations
    if (docCount > 50) {
      console.warn(`🔥 Expensive Firestore operation: ${operation} on ${collection} read ${docCount} documents`);
    }
    
    // Log to analytics if available
    this.logToAnalytics(metric);
  }
  
  /**
   * Get cost statistics for the current session
   */
  getStats() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    
    const totalReads = recentMetrics.reduce((sum, m) => sum + m.docCount, 0);
    const operationCounts = recentMetrics.reduce((counts, m) => {
      counts[m.operation] = (counts[m.operation] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return {
      totalReads,
      operationCounts,
      averageDocsPerOperation: recentMetrics.length > 0 ? totalReads / recentMetrics.length : 0,
      expensiveOperations: recentMetrics.filter(m => m.docCount > 20).length
    };
  }
  
  /**
   * Check if user is performing too many expensive operations
   */
  checkUserLimits(userId: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const lastMinute = now - (60 * 1000);
    const userOps = this.metrics.filter(m => 
      m.userId === userId && 
      m.timestamp > lastMinute
    );
    
    const totalReads = userOps.reduce((sum, m) => sum + m.docCount, 0);
    
    // Limit: 500 document reads per minute per user
    if (totalReads > 500) {
      return { 
        allowed: false, 
        reason: 'Too many document reads. Please wait before performing more operations.' 
      };
    }
    
    // Limit: 20 operations per minute per user
    if (userOps.length > 20) {
      return { 
        allowed: false, 
        reason: 'Too many operations. Please slow down.' 
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Generate a cost report for debugging
   */
  generateReport(): string {
    const stats = this.getStats();
    return `
  Firestore Cost Report (Last Hour):
- Total document reads: ${stats.totalReads}
- Average docs per operation: ${stats.averageDocsPerOperation.toFixed(1)}
- Expensive operations (>20 docs): ${stats.expensiveOperations}
- Operations by type: ${JSON.stringify(stats.operationCounts, null, 2)}

  Tips to reduce costs:
- Use pagination with limit()
- Add indexes for complex queries
- Cache frequently accessed data
- Use real-time listeners sparingly
`;
  }
  
  private logToAnalytics(metric: QueryMetrics) {
    // Integration point for analytics services
    // Could send to Firebase Analytics, Mixpanel, etc.
    if (__DEV__) {
      console.log(`Firestore: ${metric.operation} on ${metric.collection} (${metric.docCount} docs)`);
    }
  }
}

// Singleton instance
export const costMonitor = new CostMonitor();

/**
 * Wrapper for Firestore operations that includes cost tracking
 */
export const withCostTracking = async <T>(
  operation: string,
  collection: string,
  userId: string | undefined,
  queryFn: () => Promise<{ data: T; docCount: number }>
): Promise<T> => {
  // Check rate limits first
  if (userId) {
    const limitCheck = costMonitor.checkUserLimits(userId);
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason);
    }
  }
  
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    // Log the operation
    costMonitor.logOperation(operation, collection, result.docCount, userId);
    
    // Warn about slow operations
    if (duration > 1000) {
      console.warn(`Slow Firestore operation: ${operation} took ${duration}ms`);
    }
    
    return result.data;
  } catch (error) {
    console.error(`Firestore operation failed: ${operation} on ${collection}`, error);
    throw error;
  }
};

/**
 * Validate query parameters to prevent expensive operations
 */
export const validateQuery = (params: {
  limit?: number;
  hasWhere?: boolean;
  hasOrderBy?: boolean;
  operation: string;
}): { valid: boolean; error?: string } => {
  const { limit, hasWhere, hasOrderBy, operation } = params;
  
  // Require limit for list operations
  if (operation === 'list' && (!limit || limit > 100)) {
    return {
      valid: false,
      error: 'List operations must include a limit ≤ 100 to prevent cost attacks'
    };
  }
  
  // Require where clause for comments
  if (operation === 'listComments' && !hasWhere) {
    return {
      valid: false,
      error: 'Comment queries must filter by postId'
    };
  }
  
  // Require orderBy for paginated queries
  if (limit && !hasOrderBy) {
    return {
      valid: false,
      error: 'Paginated queries must include orderBy for consistent results'
    };
  }
  
  return { valid: true };
};

/**
 * Development helper to monitor costs in real-time
 */
export const enableCostDebugging = () => {
  if (__DEV__) {
    // Log stats every 30 seconds
    setInterval(() => {
      const stats = costMonitor.getStats();
      if (stats.totalReads > 0) {
        console.log(costMonitor.generateReport());
      }
    }, 30000);
  }
};
