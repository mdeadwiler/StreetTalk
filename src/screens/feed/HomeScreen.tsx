import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Alert, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, Post } from '../../types';
import { getPaginatedPosts } from '../../services/firestore';
import PostCard from '../../components/post/PostCard';
import { logError } from '../../utils/errorHandling';
import ErrorMessage from '../../components/ErrorMessage';
import { StreetColors } from '../../styles/streetStyles';

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
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>StreetTalk</Text>
          <Pressable 
            style={({ pressed }: { pressed: boolean }) => [
              styles.logoutButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Feed */}
      <FlatList
        style={styles.container}
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
              <Text style={styles.welcomeTitle}>Welcome to Street Talk</Text>
              <Text style={styles.welcomeUsername}>@{userProfile?.username}</Text>
            </View>
            {error && (
              <ErrorMessage 
                error={error} 
                onRetry={() => loadPosts()} 
                style={styles.errorMessage}
              />
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading posts...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No posts yet. Be the first to post!</Text>
            </View>
          )
        )}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingMoreText}>Loading more posts...</Text>
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
        style={({ pressed }: { pressed: boolean }) => [
          styles.createPostButton,
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }]
          }
        ]}
        onPress={handleCreatePost}
      >
        <Text style={styles.createPostButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  header: {
    backgroundColor: StreetColors.background.primary,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
  },
  logoutButton: {
    backgroundColor: StreetColors.background.tertiary,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  welcomeSection: {
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeUsername: {
    fontSize: 14,
    color: StreetColors.text.secondary,
    textAlign: 'center',
  },
  errorMessage: {
    marginHorizontal: 0,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    color: StreetColors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingMore: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingMoreText: {
    color: StreetColors.text.secondary,
    fontSize: 16,
  },
  createPostButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#34D399',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  createPostButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


