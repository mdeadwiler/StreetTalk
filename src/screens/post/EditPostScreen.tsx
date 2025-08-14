import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, StatusBar, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod';
import { StreetColors } from '../../styles/streetStyles';
import { getPost, updatePost } from '../../services/firestore';

type EditPostScreenProps = NativeStackScreenProps<RootStackParamList, 'EditPost'>;

export const EditPostScreen = ({ route, navigation }: EditPostScreenProps) => { 
  const { postId } = route.params;
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const post = await getPost(postId);
      if (!post) {
        Alert.alert('Error', 'Post not found');
        navigation.goBack();
        return;
      }

      if (post.userId !== user?.uid) {
        Alert.alert('Error', 'You can only edit your own posts');
        navigation.goBack();
        return;
      }

      setContent(post.content);
      setOriginalContent(post.content);
      setLoading(false);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
      navigation.goBack();
    }
  };

  const handleUpdatePost = async () => {
    const validation = validateCreatePostForm({ content });
    
    if (!validation.success) {
      Alert.alert('Error', getZodErrorMessage(validation.error));
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to edit a post');
      return;
    }

    if (content.trim() === originalContent.trim()) {
      Alert.alert('Info', 'No changes made to the post');
      return;
    }

    try {
      await updatePost(postId, content);
      Alert.alert('Success', 'Post updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    }
  };

  const handleCancel = () => {
    if (content.trim() !== originalContent.trim()) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 250;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={StreetColors.background.primary} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor={StreetColors.background.primary} />
      
      <View style={styles.header}>
        <Pressable 
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <Pressable 
          style={({ pressed }) => [
            styles.headerButton, 
            { opacity: pressed ? 0.7 : (content.trim().length === 0 || isOverLimit) ? 0.5 : 1 }
          ]}
          onPress={handleUpdatePost}
          disabled={content.trim().length === 0 || isOverLimit}
        >
          <Text style={[
            styles.saveButtonText,
            (content.trim().length === 0 || isOverLimit) && styles.disabledButtonText
          ]}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.content}>        
        <TextInput
          style={styles.textInput}
          placeholder="What's happening?"
          placeholderTextColor={StreetColors.text.muted}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={250}
          autoFocus
          textAlignVertical="top"
        />

        <Text style={[
          styles.characterCounter,
          isOverLimit ? styles.overLimitText : 
          characterCount > 200 ? styles.warningText : 
          styles.normalCounterText
        ]}>
          {characterCount}/250
        </Text>

        <Pressable 
          style={({ pressed }) => [
            styles.updateButton,
            { opacity: pressed ? 0.8 : (content.trim().length === 0 || isOverLimit) ? 0.5 : 1 }
          ]}
          onPress={handleUpdatePost}
          disabled={content.trim().length === 0 || isOverLimit}
        >
          <Text style={[
            styles.updateButtonText,
            (content.trim().length === 0 || isOverLimit) && styles.disabledButtonText
          ]}>Update Post</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: StreetColors.text.primary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: StreetColors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
  },
  headerButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: StreetColors.text.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: StreetColors.brand.primary,
    fontWeight: '500',
  },
  saveButtonText: {
    fontSize: 16,
    color: StreetColors.brand.primary,
    fontWeight: '600',
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    minHeight: 120,
    maxHeight: 200,
    backgroundColor: StreetColors.background.secondary,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: StreetColors.text.primary,
    textAlignVertical: 'top',
  },
  characterCounter: {
    alignSelf: 'flex-end',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  normalCounterText: {
    color: StreetColors.text.muted,
  },
  warningText: {
    color: '#D97706',
  },
  overLimitText: {
    color: '#DC2626',
  },
  updateButton: {
    width: '100%',
    backgroundColor: StreetColors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: StreetColors.background.primary,
    textAlign: 'center',
  },
});
