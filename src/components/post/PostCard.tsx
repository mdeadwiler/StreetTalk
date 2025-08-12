import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Post } from '../../types';
import { colors, spacing } from '../../styles/theme';
import { formatTimestamp, deletePost } from '../../services/firestore';
import BlockUserButton from '../BlockUserButton';
import ReportButton from '../ReportButton';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PostCard({ post, onPress, currentUserId, onEdit, onDelete }: PostCardProps) {
  const isOwner = currentUserId === post.userId;

  const handleDelete = async () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id);
              onDelete?.();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    onEdit?.();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>@{post.username}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>
        </View>
        
        <View style={styles.headerActions}>
          {/* Block User Button and Report Button (for non-owners) */}
          {!isOwner && (
            <View style={styles.nonOwnerActions}>
              <ReportButton 
                targetType="post"
                targetId={post.id}
                targetUserId={post.userId}
                targetUsername={post.username}
                compact={true}
              />
              <BlockUserButton 
                targetUserId={post.userId}
                targetUsername={post.username}
                compact={true}
              />
            </View>
          )}
          
          {/* Owner Actions */}
          {isOwner && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {post.content && <Text style={styles.content}>{post.content}</Text>}

      {/* Media Section */}
      {post.mediaUrl && (
        <View style={styles.mediaContainer}>
          {post.mediaType === 'image' ? (
            <Image source={{ uri: post.mediaUrl }} style={styles.mediaContent} />
          ) : (
            <Video
              source={{ uri: post.mediaUrl }}
              style={styles.mediaContent}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.stats}>
          <Text style={styles.statText}>💬 {post.commentsCount} comments</Text>
          <Text style={styles.statText}>❤️ {post.likes} likes</Text>
        </View>
        {post.updatedAt && (
          <Text style={styles.editedText}>Edited</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.mutedText,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nonOwnerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  deleteText: {
    color: '#ff4444',
  },
  content: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statText: {
    fontSize: 12,
    color: colors.mutedText,
  },
  editedText: {
    fontSize: 10,
    color: colors.mutedText,
    fontStyle: 'italic',
  },
  mediaContainer: {
    marginVertical: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaContent: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});
