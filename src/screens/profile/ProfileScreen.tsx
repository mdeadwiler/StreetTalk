import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Post } from '../../types';
import { getPaginatedUserPosts } from '../../services/firestore';
import { colors, spacing } from '../../styles/theme';
import PostCard from '../../components/post/PostCard';

export default function ProfileScreen() {
  const { user, userProfile } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const loadUserPosts = async (refresh = false) => {
    if (!user) return;
    
    try {
      if (refresh) {
        setRefreshing(true);
        const { posts, lastVisible: newLastVisible } = await getPaginatedUserPosts(user.uid, 20, undefined, user.uid);
        setUserPosts(posts);
        setLastVisible(newLastVisible);
        setHasMore(posts.length === 20);
      } else {
        setLoading(true);
        const { posts, lastVisible: newLastVisible } = await getPaginatedUserPosts(user.uid, 20, undefined, user.uid);
        setUserPosts(posts);
        setLastVisible(newLastVisible);
        setHasMore(posts.length === 20);
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || !lastVisible || !user) return;

    try {
      setLoadingMore(true);
      const { posts: newPosts, lastVisible: newLastVisible } = await getPaginatedUserPosts(user.uid, 20, lastVisible, user.uid);
      
      if (newPosts.length > 0) {
        setUserPosts(prev => [...prev, ...newPosts]);
        setLastVisible(newLastVisible);
        setHasMore(newPosts.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    loadUserPosts(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <FlatList
        style={styles.content}
        data={userPosts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={() => (
          <View>
            {/* User Info */}
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.displayName}>
                @{userProfile?.username || 'Unknown'}
              </Text>
              <Text style={styles.email}>{userProfile?.email}</Text>
              <Text style={styles.postCount}>
                {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
              </Text>
            </View>

            {/* Posts Section Header */}
            <View style={styles.postsSection}>
              <Text style={styles.sectionTitle}>Your Posts</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your posts...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You haven't posted anything yet.</Text>
            </View>
          )
        )}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading more posts...</Text>
            </View>
          ) : null
        )}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onPress={() => {}} // Could navigate to post details
            currentUserId={user?.uid}
            onDelete={() => loadUserPosts(true)} // Refresh list after deletion
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: spacing.sm,
  },
  postCount: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  postsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 16,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 16,
    textAlign: 'center',
  },
});
