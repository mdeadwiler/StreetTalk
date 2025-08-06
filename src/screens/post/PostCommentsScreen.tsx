import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, Post, Comment } from '../../types';
import { 
  getPost, 
  subscribeToCommentsUpdates, 
  createComment,
  formatTimestamp 
} from '../../services/firestore';
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod';
import { colors, spacing } from '../../styles/theme';
import PostCard from '../../components/post/PostCard';

type PostCommentsScreenProps = NativeStackScreenProps<RootStackParamList, 'PostComments'>;

export default function PostCommentsScreen({ route, navigation }: PostCommentsScreenProps) {
  const { postId } = route.params;
  const { user, userProfile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
    
    const unsubscribe = subscribeToCommentsUpdates(postId, (updatedComments) => {
      setComments(updatedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

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
      await createComment(postId, user.uid, userProfile.username, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({comments.length})
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    @{comment.username}
                  </Text>
                  <Text style={styles.commentTime}>
                    {formatTimestamp(comment.createdAt)}
                  </Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

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
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  commentTime: {
    fontSize: 12,
    color: colors.mutedText,
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
