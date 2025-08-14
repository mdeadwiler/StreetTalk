import React from 'react';
import { View, Text, Pressable, Alert, Image, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Post } from '../../types';
import { formatTimestamp, deletePost } from '../../services/firestore';
import BlockUserButton from '../BlockUserButton';
import ReportButton from '../ReportButton';

const { width: screenWidth } = Dimensions.get('window');

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
      style={({ pressed }: { pressed: boolean }) => [
        styles.postCard,
        pressed && styles.postCardPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.postHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.postUsername}>@{post.username}</Text>
          <Text style={styles.postTimestamp}>{formatTimestamp(post.createdAt)}</Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Block User Button and Report Button (for non-owners) */}
          {!isOwner && (
            <View style={styles.actionButtons}>
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
            <View style={styles.ownerActions}>
              <Pressable 
                onPress={handleEdit} 
                style={({ pressed }: { pressed: boolean }) => [
                  styles.editButton,
                  pressed && styles.editButtonPressed
                ]}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable 
                onPress={handleDelete} 
                style={({ pressed }: { pressed: boolean }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed
                ]}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {post.content && (
        <Text style={styles.postContent}>
          {post.content}
        </Text>
      )}

      {/* Media Section */}
      {post.mediaUrl && (
        <View style={styles.mediaContainer}>
          {post.mediaType === 'image' ? (
            <Image 
              source={{ uri: post.mediaUrl }} 
              style={styles.mediaImage}
              resizeMode="cover"
            />
          ) : (
            <Video
              source={{ uri: post.mediaUrl }}
              style={styles.mediaImage}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
          )}
        </View>
      )}

      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <Text style={styles.postStat}>💬 {post.commentsCount} comments</Text>
          <Text style={styles.postStat}>❤️ {post.likes} likes</Text>
        </View>
        {post.updatedAt && (
          <Text style={styles.editedText}>Edited</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postCardPressed: {
    backgroundColor: '#fafafa',
    borderColor: '#a1a1a1',
    shadowOpacity: 0.15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postUsername: {
    color: '#4b0082',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  postTimestamp: {
    color: '#a1a1a1',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 16,
  },
  postContent: {
    color: '#171717',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  mediaImage: {
    width: '100%',
    height: 240,
    minHeight: 180,
    maxHeight: 400,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  postStat: {
    color: '#a1a1a1',
    fontSize: 14,
    lineHeight: 16,
  },
  editedText: {
    color: '#a1a1a1',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  editButton: {
    backgroundColor: '#f3ecff',
    borderWidth: 1,
    borderColor: '#d4b3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minHeight: 32,
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonPressed: {
    backgroundColor: '#ede0ff',
    borderColor: '#c299ff',
  },
  editButtonText: {
    color: '#6b2c91',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minHeight: 32,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonPressed: {
    backgroundColor: '#fee2e2',
    borderColor: '#f87171',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
