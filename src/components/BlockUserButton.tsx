import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { blockUser, unblockUser, isUserBlocked } from '../services/firestore';
import { StreetColors } from '../styles/streetStyles';

interface BlockUserButtonProps {
  targetUserId: string;
  targetUsername: string;
  onBlockStatusChange?: (isBlocked: boolean) => void;
  compact?: boolean; // For smaller UI contexts
}

export default function BlockUserButton({ 
  targetUserId, 
  targetUsername, 
  onBlockStatusChange,
  compact = false 
}: BlockUserButtonProps) {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show block button for own content
  if (!user || user.uid === targetUserId) {
    return null;
  }

  useEffect(() => {
    checkBlockStatus();
  }, [user, targetUserId]);

  const checkBlockStatus = async () => {
    if (!user) return;
    
    try {
      const blocked = await isUserBlocked(user.uid, targetUserId);
      setIsBlocked(blocked);
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const handleBlockToggle = async () => {
    if (!user) return;

    const action = isBlocked ? 'unblock' : 'block';
    const actionTitle = isBlocked ? 'Unblock User' : 'Block User';
    const actionMessage = isBlocked 
      ? `Unblock @${targetUsername}? You will see their posts and comments again.`
      : `Block @${targetUsername}? You won't see their posts and comments anymore.`;

    Alert.alert(
      actionTitle,
      actionMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action === 'block' ? 'Block' : 'Unblock',
          style: action === 'block' ? 'destructive' : 'default',
          onPress: performBlockAction
        }
      ]
    );
  };

  const performBlockAction = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isBlocked) {
        await unblockUser(user.uid, targetUserId);
        setIsBlocked(false);
        onBlockStatusChange?.(false);
      } else {
        await blockUser(user.uid, targetUserId);
        setIsBlocked(true);
        onBlockStatusChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
      Alert.alert('Error', `Failed to ${isBlocked ? 'unblock' : 'block'} user. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        compact && styles.compactButton,
        isBlocked ? styles.unblockButton : styles.blockButton
      ]}
      onPress={handleBlockToggle}
      disabled={loading}
    >
      <Text style={[
        styles.buttonText,
        compact && styles.compactText,
        isBlocked ? styles.unblockText : styles.blockText
      ]}>
        {loading ? '...' : isBlocked ? (compact ? 'Unblock' : 'Unblock User') : (compact ? 'Block' : 'Block User')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  blockButton: {
    backgroundColor: StreetColors.background.primary,
    borderColor: '#FF4444',
  },
  unblockButton: {
    backgroundColor: StreetColors.background.primary,
    borderColor: StreetColors.text.muted,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactText: {
    fontSize: 12,
  },
  blockText: {
    color: '#FF4444',
  },
  unblockText: {
    color: StreetColors.text.muted,
  },
});
