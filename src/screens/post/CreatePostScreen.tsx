import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Video, ResizeMode } from 'expo-av'
import { useAuth} from '../../context/AuthContext'
import { RootStackParamList } from '../../types'
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod'
import { StreetColors } from '../../styles/streetStyles'
import { createPost } from '../../services/firestore'
import { pickMedia, takeMedia, uploadMedia, MediaResult, validateMedia } from '../../services/mediaService'
import { withRateLimit } from '../../utils/rateLimiting'
import RateLimitStatus from '../../components/RateLimitStatus'
import { logError } from '../../utils/errorHandling'

type CreatePostScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePost'>

export const CreatePostScreen = ({ navigation }: CreatePostScreenProps)=> { 
const { user, userProfile } = useAuth()
const [content, setContent] = useState('')
const [selectedMedia, setSelectedMedia] = useState<MediaResult | null>(null)
const [uploading, setUploading] = useState(false)

const handleCreatePost = async () => {
  if (content.trim().length === 0 && !selectedMedia) {
    Alert.alert('Error', 'Please add some content or media to your post')
    return
  }

  const validation = validateCreatePostForm({ content: content || ' ' }) // Allow empty content if media exists
  
  if (!validation.success && !selectedMedia) {
    Alert.alert('Error', getZodErrorMessage(validation.error))
    return
  }

  if (!user || !userProfile) {
    Alert.alert('Error', 'You must be logged in to create a post')
    return
  }

  setUploading(true)
  try {
    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | undefined;

    // Upload media if selected
    if (selectedMedia) {
      const mediaValidation = validateMedia(selectedMedia);
      if (!mediaValidation.isValid) {
        Alert.alert('Error', mediaValidation.error || 'Invalid media file');
        setUploading(false);
        return;
      }

      mediaUrl = await uploadMedia(selectedMedia.uri, selectedMedia.fileName, user.uid);
      mediaType = selectedMedia.type;
    }

    // Apply rate limiting to prevent spam posting
    await withRateLimit(user.uid, 'POST_CREATION', async () => {
      return createPost(user.uid, userProfile.username, content, mediaUrl, mediaType);
    });
    
    Alert.alert('Success', 'Post created successfully!')
    navigation.navigate('MainTabs')
  } catch (error) {
    const parsedError = logError(error, 'CreatePostScreen - Handle Create Post');
    Alert.alert('Post Creation Failed', parsedError.message);
  } finally {
    setUploading(false)
  }
}

const handleCancel = () => {
  navigation.navigate('MainTabs')
}

const handlePickMedia = async () => {
  try {
    const media = await pickMedia();
    if (media) {
      setSelectedMedia(media);
    }
  } catch (error) {
    const parsedError = logError(error, 'CreatePostScreen - Handle Pick Media');
    Alert.alert('Media Selection Failed', parsedError.message);
  }
};

const handleTakeMedia = async () => {
  try {
    const media = await takeMedia();
    if (media) {
      setSelectedMedia(media);
    }
  } catch (error) {
    const parsedError = logError(error, 'CreatePostScreen - Handle Take Media');
    Alert.alert('Camera Failed', parsedError.message);
  }
};

const handleRemoveMedia = () => {
  setSelectedMedia(null);
};

const showMediaOptions = () => {
  Alert.alert(
    'Add Media',
    'Choose an option',
    [
      { text: 'Camera', onPress: handleTakeMedia },
      { text: 'Photo Library', onPress: handlePickMedia },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
};

const characterCount = content.length
const isOverLimit = characterCount > 250

return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor={StreetColors.background.primary} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Post</Text>
        
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

        {/* Media Section */}
        {selectedMedia && (
          <View style={styles.mediaContainer}>
            {selectedMedia.type === 'image' ? (
              <Image source={{ uri: selectedMedia.uri }} style={styles.mediaImage} />
            ) : (
              <Video
                source={{ uri: selectedMedia.uri }}
                style={styles.mediaImage}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
              />
            )}
            <TouchableOpacity 
              style={styles.removeMediaButton}
              onPress={handleRemoveMedia}
            >
              <Text style={styles.removeMediaText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Actions */}
        <View style={styles.mediaActionsContainer}>
          <TouchableOpacity 
            style={styles.addMediaButton} 
            onPress={showMediaOptions}
          >
            <Text style={styles.addMediaButtonText}>📷 Add Media</Text>
          </TouchableOpacity>
        </View>

        {/* Rate Limit Status */}
        <RateLimitStatus actionType="POST_CREATION" showWarning={true} />

        <TouchableOpacity 
          style={[
            styles.createButton,
            ((content.trim().length === 0 && !selectedMedia) || isOverLimit || uploading) && styles.disabledButton
          ]}
          onPress={handleCreatePost}
          disabled={(content.trim().length === 0 && !selectedMedia) || isOverLimit || uploading}
        >
          <Text style={[
            styles.createButtonText,
            ((content.trim().length === 0 && !selectedMedia) || isOverLimit || uploading) && styles.disabledButtonText
          ]}>
            {uploading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    paddingHorizontal: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: StreetColors.brand.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    marginBottom: 32,
    alignSelf: 'center',
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
  mediaContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: StreetColors.background.secondary,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
  },
  mediaImage: {
    width: '100%',
    height: 256,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  addMediaButton: {
    backgroundColor: StreetColors.background.tertiary,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaButtonText: {
    fontSize: 16,
    color: StreetColors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  createButton: {
    width: '100%',
    backgroundColor: StreetColors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: StreetColors.background.primary,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});

