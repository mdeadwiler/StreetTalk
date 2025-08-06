import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod';
import { authStyles } from '../../styles/authStyles';
import { colors } from '../../styles/theme';
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
      <View style={[authStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Loading post...</Text>
      </View>
    );
  }

  return (
    <View style={[authStyles.container, { justifyContent: 'flex-start', paddingTop: 60 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20 }}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={authStyles.linkText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[authStyles.title, { fontSize: 18 }]}>Edit Post</Text>
        <TouchableOpacity 
          onPress={handleUpdatePost}
          disabled={content.trim().length === 0 || isOverLimit}
        >
          <Text style={[
            authStyles.linkText,
            (content.trim().length === 0 || isOverLimit) && { color: colors.mutedText }
          ]}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 40 }}>        
        <TextInput
          style={[authStyles.textArea, { height: 150, width: '100%' }]}
          placeholder="What's happening?"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={250}
          autoFocus
        />

        <Text style={[
          authStyles.characterCounter,
          { color: isOverLimit ? '#ff4444' : characterCount > 200 ? '#ff8800' : colors.mutedText }
        ]}>
          {characterCount}/250
        </Text>

        <TouchableOpacity 
          onPress={handleUpdatePost}
          disabled={content.trim().length === 0 || isOverLimit}
          style={[
            authStyles.button,
            { marginTop: 20, width: '60%', paddingVertical: 12 },
            (content.trim().length === 0 || isOverLimit) && authStyles.buttonDisabled
          ]}
        >
          <Text style={[
            authStyles.buttonText,
            (content.trim().length === 0 || isOverLimit) && authStyles.buttonTextDisabled
          ]}>Update Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
