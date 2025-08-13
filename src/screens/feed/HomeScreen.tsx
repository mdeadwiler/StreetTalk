import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, Post } from '../../types';
import { getPaginatedPosts } from '../../services/firestore';
import { colors, spacing } from '../../styles/theme';
import PostCard from '../../components/post/PostCard';
import { logError } from '../../utils/errorHandling';
import ErrorMessage from '../../components/ErrorMessage';
import { StreetStyles } from '../../styles/streetStyles';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { logout, user, userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadPosts = async (refresh = false) => {
    try {
      setError(null); // Clear previous errors
      if (refresh) {
        setRefreshing(true);
        const { posts: newPosts, lastVisible: newLastVisible } = await getPaginatedPosts(20, undefined, user?.uid);
        setPosts(newPosts);
        setLastVisible(newLastVisible);
        setHasMore(newPosts.length === 20);
      } else {
        setLoading(true);
        const { posts: newPosts, lastVisible: newLastVisible } = await getPaginatedPosts(20, undefined, user?.uid);
        setPosts(newPosts);
        setLastVisible(newLastVisible);
        setHasMore(newPosts.length === 20);
      }
    } catch (error) {
      const parsedError = logError(error, 'HomeScreen - Load Posts');
      setError(parsedError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || !lastVisible) return;

    try {
      setLoadingMore(true);
      const { posts: newPosts, lastVisible: newLastVisible } = await getPaginatedPosts(20, lastVisible, user?.uid);
      
      if (newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts]);
        setLastVisible(newLastVisible);
        setHasMore(newPosts.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      const parsedError = logError(error, 'HomeScreen - Load More Posts');
      // For load more errors, show a brief alert instead of persistent error
      Alert.alert('Load More Failed', parsedError.message);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Add navigation listener to refresh when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh posts when screen comes into focus (after creating/editing posts)
      loadPosts();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      const parsedError = logError(error, 'HomeScreen - Handle Logout');
      Alert.alert('Logout Failed', parsedError.message);
    }
  };

  const handleRefresh = () => {
    loadPosts(true);
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleDeletePost = (postId: string) => {
    // Immediately remove post from UI (optimistic update)
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  return (
    <View className={StreetStyles.screen}>
      {/* Header */}
      <View className={StreetStyles.header}>
        <View className="flex-row justify-between items-center">
          <Text className={StreetStyles.headerTitle}>StreetTalk</Text>
          <Pressable 
            style={({ pressed }: { pressed: boolean }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
            className={StreetStyles.buttonSecondary}
            onPress={handleLogout}
          >
            <Text className={StreetStyles.deleteButtonText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Feed */}
      <FlatList
        className={StreetStyles.container}
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome to Street Talk</Text>
              <Text style={styles.userEmailText}>@{userProfile?.username}</Text>
            </View>
            {error && (
              <ErrorMessage 
                error={error} 
                onRetry={() => loadPosts()} 
                style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
              />
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet. Be the first to post!</Text>
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
            onPress={() => navigation.navigate('PostComments', { postId: item.id })}
            currentUserId={user?.uid}
            onEdit={() => navigation.navigate('EditPost', { postId: item.id })}
            onDelete={() => handleDeletePost(item.id)}
          />
        )}
      />

      {/* Create Post Button */}
      <Pressable 
        style={({ pressed }: { pressed: boolean }) => ([
          styles.createPostButton,
          { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }
        ])}
        onPress={handleCreatePost}
      >
        <Text style={styles.createPostText}>+</Text>
      </Pressable>
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
    justifyContent: 'space-between',
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
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  logoutText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  welcomeSection: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  userEmailText: {
    fontSize: 12,
    color: colors.mutedText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 16,
    textAlign: 'center',
  },
  createPostButton: {
    position: 'absolute',
    bottom: 30,
    right: spacing.lg,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createPostText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
