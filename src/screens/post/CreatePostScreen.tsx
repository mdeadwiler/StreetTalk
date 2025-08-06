import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Video, ResizeMode } from 'expo-av'
import { useAuth} from '../../context/AuthContext'
import { RootStackParamList } from '../../types'
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod'
import { authStyles } from '../../styles/authStyles'
import { colors, spacing } from '../../styles/theme'
import { createPost } from '../../services/firestore'
import { pickMedia, takeMedia, uploadMedia, MediaResult, validateMedia } from '../../services/mediaService'

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

    await createPost(user.uid, userProfile.username, content, mediaUrl, mediaType)
    Alert.alert('Success', 'Post created successfully!')
    navigation.navigate('MainTabs')
  } catch (error) {
    console.error('Error creating post:', error)
    Alert.alert('Error', 'Failed to create post. Please try again.')
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
    console.error('Error picking media:', error);
    Alert.alert('Error', 'Failed to pick media. Please check permissions.');
  }
};

const handleTakeMedia = async () => {
  try {
    const media = await takeMedia();
    if (media) {
      setSelectedMedia(media);
    }
  } catch (error) {
    console.error('Error taking media:', error);
    Alert.alert('Error', 'Failed to take media. Please check permissions.');
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
    <View style={[authStyles.container, { justifyContent: 'flex-start', paddingTop: 60 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingBottom: 20 }}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={authStyles.linkText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 40 }}>
        <Text style={[authStyles.title, { fontSize: 28, marginBottom: 30 }]}>Post</Text>
        
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

        {/* Media Section */}
        {selectedMedia && (
          <View style={mediaStyles.mediaContainer}>
            {selectedMedia.type === 'image' ? (
              <Image source={{ uri: selectedMedia.uri }} style={mediaStyles.mediaPreview} />
            ) : (
              <Video
                source={{ uri: selectedMedia.uri }}
                style={mediaStyles.mediaPreview}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
              />
            )}
            <TouchableOpacity style={mediaStyles.removeButton} onPress={handleRemoveMedia}>
              <Text style={mediaStyles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Actions */}
        <View style={mediaStyles.mediaActions}>
          <TouchableOpacity style={mediaStyles.mediaButton} onPress={showMediaOptions}>
            <Text style={mediaStyles.mediaButtonText}>📷 Add Media</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleCreatePost}
          disabled={(content.trim().length === 0 && !selectedMedia) || isOverLimit || uploading}
          style={[
            authStyles.button,
            { marginTop: 20, width: '60%', paddingVertical: 12 },
            ((content.trim().length === 0 && !selectedMedia) || isOverLimit || uploading) && authStyles.buttonDisabled
          ]}
        >
          <Text style={[
            authStyles.buttonText,
            ((content.trim().length === 0 && !selectedMedia) || isOverLimit || uploading) && authStyles.buttonTextDisabled
          ]}>{uploading ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>
    </View>
)
}

const mediaStyles = StyleSheet.create({
  mediaContainer: {
    position: 'relative',
    marginVertical: spacing.md,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  mediaButton: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  mediaButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});