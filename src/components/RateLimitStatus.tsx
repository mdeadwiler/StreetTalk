import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RateLimiter } from '../utils/rateLimiting';
import { colors, spacing } from '../styles/theme';

interface RateLimitStatusProps {
  actionType: 'POST_CREATION' | 'COMMENT_CREATION';
  showWarning?: boolean; // Show warning when approaching limit
}

export default function RateLimitStatus({ actionType, showWarning = true }: RateLimitStatusProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    current: number;
    max: number;
    windowMinutes: number;
    timeUntilReset?: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadStatus = async () => {
      try {
        const rateLimitStatus = await RateLimiter.getRateLimitStatus(user.uid, actionType);
        setStatus(rateLimitStatus);
      } catch (error) {
        console.error('Error loading rate limit status:', error);
      }
    };

    loadStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    
    return () => clearInterval(interval);
  }, [user, actionType]);

  if (!status || !user) return null;

  const percentage = (status.current / status.max) * 100;
  const isNearLimit = percentage >= 80; // Show warning at 80%
  const isAtLimit = status.current >= status.max;

  // Only show if we want warnings and user is approaching limit
  if (!showWarning || (!isNearLimit && status.current === 0)) {
    return null;
  }

  const actionName = actionType === 'POST_CREATION' ? 'posts' : 'comments';
  const timeUntilResetMinutes = status.timeUntilReset ? Math.ceil(status.timeUntilReset / (1000 * 60)) : 0;

  return (
    <View style={[styles.container, isAtLimit && styles.atLimit, isNearLimit && styles.nearLimit]}>
      <Text style={[styles.text, isAtLimit && styles.atLimitText]}>
        {isAtLimit 
          ? `Rate limit reached. You can ${actionName.slice(0, -1)} again in ${timeUntilResetMinutes} minute${timeUntilResetMinutes !== 1 ? 's' : ''}.`
          : `${status.current}/${status.max} ${actionName} used (${status.windowMinutes} min window)`
        }
      </Text>
      
      {!isAtLimit && (
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%` },
              isNearLimit && styles.warningProgress
            ]} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  nearLimit: {
    borderLeftColor: '#FFA500', // Orange
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
  },
  atLimit: {
    borderLeftColor: '#FF4444', // Red
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  text: {
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: spacing.xs,
  },
  atLimitText: {
    color: '#FF4444',
    fontWeight: '500',
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.borderColor,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  warningProgress: {
    backgroundColor: '#FFA500',
  },
});
