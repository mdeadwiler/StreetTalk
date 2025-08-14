import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RateLimiter } from '../utils/rateLimiting';
import { StreetColors } from '../styles/streetStyles';

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
    marginVertical: 8,
    padding: 16,
    backgroundColor: StreetColors.background.secondary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: StreetColors.brand.primary,
  },
  nearLimit: {
    borderLeftColor: '#f59e0b', // Orange
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  atLimit: {
    borderLeftColor: '#dc2626', // Red
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  text: {
    fontSize: 12,
    color: StreetColors.text.muted,
    marginBottom: 4,
  },
  atLimitText: {
    color: '#dc2626',
    fontWeight: '500',
  },
  progressBar: {
    height: 3,
    backgroundColor: StreetColors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: StreetColors.brand.primary,
    borderRadius: 2,
  },
  warningProgress: {
    backgroundColor: '#f59e0b',
  },
});
