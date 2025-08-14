import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getBlockedUsers, unblockUser } from '../../services/firestore';
import { StreetColors } from '../../styles/streetStyles';

export default function BlockedUsersScreen() {
  const { user } = useAuth();
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBlockedUsers();
    }
  }, [user]);

  const loadBlockedUsers = async () => {
    if (!user) return;
    
    try {
      const blocked = await getBlockedUsers(user.uid);
      setBlockedUserIds(blocked);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    if (!user) return;

    Alert.alert(
      'Unblock User',
      'Are you sure you want to unblock this user? You will see their posts and comments again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unblock',
          onPress: async () => {
            try {
              await unblockUser(user.uid, blockedUserId);
              setBlockedUserIds(prev => prev.filter(id => id !== blockedUserId));
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderBlockedUser = ({ item: userId }: { item: string }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userId}>User ID: {userId}</Text>
        <Text style={styles.blockedNote}>This user's content is hidden from your feed</Text>
      </View>
      
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(userId)}
      >
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Blocked Users</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading blocked users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blocked Users</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Users you've blocked won't appear in your feed or comments. You can unblock them at any time.
        </Text>

        {blockedUserIds.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No blocked users</Text>
            <Text style={styles.emptySubtext}>You haven't blocked anyone yet.</Text>
          </View>
        ) : (
          <FlatList
            data={blockedUserIds}
            keyExtractor={(item) => item}
            renderItem={renderBlockedUser}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: StreetColors.brand.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: 14,
    color: StreetColors.text.muted,
    marginBottom: 24,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: StreetColors.text.muted,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: StreetColors.text.muted,
    textAlign: 'center',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: StreetColors.background.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
  },
  userInfo: {
    flex: 1,
  },
  userId: {
    fontSize: 14,
    fontWeight: '500',
    color: StreetColors.text.primary,
    marginBottom: 8,
  },
  blockedNote: {
    fontSize: 12,
    color: StreetColors.text.muted,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: StreetColors.brand.primary,
  },
  unblockText: {
    fontSize: 14,
    color: StreetColors.brand.primary,
    fontWeight: '500',
  },
});
