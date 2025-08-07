import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, Post, Comment } from '../../types';
import { 
  getPost, 
  getPaginatedComments, 
  createComment,
  formatTimestamp 
} from '../../services/firestore';
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod';
import { colors, spacing } from '../../styles/theme';
import PostCard from '../../components/post/PostCard';
import { withRateLimit } from '../../utils/rateLimiting';
import BlockUserButton from '../../components/BlockUserButton';

type PostCommentsScreenProps = NativeStackScreenProps<RootStackParamList, 'PostComments'>;

export default function PostCommentsScreen({ route, navigation }: PostCommentsScreenProps) {
  const { postId } = route.params;
  const { user, userProfile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadComments = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        const { comments: newComments, lastVisible: newLastVisible } = await getPaginatedComments(postId, 30, undefined, user?.uid);
        setComments(newComments);
        setLastVisible(newLastVisible);
        setHasMore(newComments.length === 30);
      } else {
        setLoading(true);
        const { comments: newComments, lastVisible: newLastVisible } = await getPaginatedComments(postId, 30, undefined, user?.uid);
        setComments(newComments);
        setLastVisible(newLastVisible);
        setHasMore(newComments.length === 30);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreComments = async () => {
    if (!hasMore || loadingMore || !lastVisible) return;

    try {
      setLoadingMore(true);
      const { comments: newComments, lastVisible: newLastVisible } = await getPaginatedComments(postId, 30, lastVisible, user?.uid);
      
      if (newComments.length > 0) {
        setComments(prev => [...prev, ...newComments]);
        setLastVisible(newLastVisible);
        setHasMore(newComments.length === 30);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadPost = async () => {
    try {
      const postData = await getPost(postId);
      setPost(postData);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post.');
      navigation.goBack();
    }
  };

  const handleSubmitComment = async () => {
    const validation = validateCreatePostForm({ content: newComment });
    
    if (!validation.success) {
      Alert.alert('Error', getZodErrorMessage(validation.error));
      return;
    }

    if (!user || !userProfile) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    setSubmitting(true);
    try {
      // Apply rate limiting to prevent spam commenting
      await withRateLimit(user.uid, 'COMMENT_CREATION', async () => {
        return createComment(postId, user.uid, userProfile.username, newComment);
      });
      
      setNewComment('');
      // Refresh comments to show the new one
      loadComments(true);
    } catch (error) {
      console.error('Error creating comment:', error);
      // Show specific rate limiting message if available
      const errorMessage = error instanceof Error ? error.message : 'Failed to post comment. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const characterCount = newComment.length;
  const isOverLimit = characterCount > 250;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <FlatList
        style={styles.content}
        data={comments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadComments(true)} />
        }
        onEndReached={loadMoreComments}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={() => (
          <View>
            {/* Original Post */}
            {post && (
              <View style={styles.postSection}>
                <PostCard 
                  post={post} 
                  onPress={() => {}} 
                  currentUserId={user?.uid}
                />
              </View>
            )}

            {/* Comments Section Header */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
            </View>
          )
        )}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading more comments...</Text>
            </View>
          ) : null
        )}
        renderItem={({ item: comment }) => (
          <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <View style={styles.commentAuthorSection}>
                <Text style={styles.commentAuthor}>
                  @{comment.username}
                </Text>
                <Text style={styles.commentTime}>
                  {formatTimestamp(comment.createdAt)}
                </Text>
              </View>
              
              {/* Block User Button for Comments */}
              <BlockUserButton 
                targetUserId={comment.userId}
                targetUsername={comment.username}
                compact={true}
              />
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
          </View>
        )}
      />

      {/* Comment Input */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor={colors.mutedText}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={250}
        />
        
        <View style={styles.inputFooter}>
          <Text style={[
            styles.characterCounter,
            { color: isOverLimit ? '#ff4444' : characterCount > 200 ? '#ff8800' : colors.mutedText }
          ]}>
            {characterCount}/250
          </Text>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (newComment.trim().length === 0 || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitComment}
            disabled={newComment.trim().length === 0 || submitting}
          >
            <Text style={[
              styles.submitButtonText,
              (newComment.trim().length === 0 || submitting) && styles.submitButtonTextDisabled
            ]}>
              {submitting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  backButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  postSection: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    marginBottom: spacing.md,
  },
  commentsSection: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  commentsTitle: {
    fontSize: 16,
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
  commentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  commentAuthorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  commentTime: {
    fontSize: 12,
    color: colors.mutedText,
    marginLeft: spacing.sm,
  },
  commentContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  inputSection: {
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    maxHeight: 100,
    minHeight: 40,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  characterCounter: {
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  submitButtonDisabled: {
    backgroundColor: colors.mutedText,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButtonTextDisabled: {
    color: colors.mutedText,
  },
});
