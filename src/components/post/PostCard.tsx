import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Post } from '../../types';
import { colors, spacing } from '../../styles/theme';
import { formatTimestamp, deletePost } from '../../services/firestore';
import BlockUserButton from '../BlockUserButton';
import ReportButton from '../ReportButton';
import { StreetStyles } from '../../styles/streetStyles';

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
    <Pressable 
      style={({ pressed }: { pressed: boolean }) => ({
        opacity: pressed ? 0.95 : 1,
      })}
      className={StreetStyles.postCard}
      onPress={onPress}
    >
      <View className={StreetStyles.postHeader}>
        <View className="flex-1">
          <Text className={StreetStyles.postUsername}>@{post.username}</Text>
          <Text className={StreetStyles.postTimestamp}>{formatTimestamp(post.createdAt)}</Text>
        </View>
        
        <View className="flex-row items-center space-x-2">
          {/* Block User Button and Report Button (for non-owners) */}
          {!isOwner && (
            <View className="flex-row items-center space-x-2">
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
            <View className="flex-row items-center space-x-3">
              <Pressable 
                onPress={handleEdit} 
                style={({ pressed }: { pressed: boolean }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className={StreetStyles.editButton}
              >
                <Text className={StreetStyles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable 
                onPress={handleDelete} 
                style={({ pressed }: { pressed: boolean }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className={StreetStyles.deleteButton}
              >
                <Text className={StreetStyles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {post.content && (
        <Text className={StreetStyles.postContent}>
          {post.content}
        </Text>
      )}

      {/* Media Section */}
      {post.mediaUrl && (
        <View className={StreetStyles.mediaContainer}>
          {post.mediaType === 'image' ? (
            <Image 
              source={{ uri: post.mediaUrl }} 
              className={StreetStyles.mediaImage}
              style={{ resizeMode: 'cover' }}
            />
          ) : (
            <Video
              source={{ uri: post.mediaUrl }}
              className={StreetStyles.mediaImage}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
          )}
        </View>
      )}

      <View className={StreetStyles.postFooter}>
        <View className={StreetStyles.postStats}>
          <Text className={StreetStyles.postStat}>💬 {post.commentsCount} comments</Text>
          <Text className={StreetStyles.postStat}>❤️ {post.likes} likes</Text>
        </View>
        {post.updatedAt && (
          <Text className={StreetStyles.caption + " italic"}>Edited</Text>
        )}
      </View>
    </Pressable>
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
