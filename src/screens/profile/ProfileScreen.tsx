import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Post } from '../../types';
import { getPaginatedUserPosts } from '../../services/firestore';
import { StreetColors } from '../../styles/streetStyles';
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
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: StreetColors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: StreetColors.background.primary,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: StreetColors.text.muted,
    marginBottom: 12,
  },
  postCount: {
    fontSize: 16,
    color: StreetColors.brand.primary,
    fontWeight: '500',
  },
  postsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: StreetColors.text.muted,
    fontSize: 16,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: StreetColors.text.muted,
    fontSize: 16,
    textAlign: 'center',
  },
});
