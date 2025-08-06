import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../utils/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

export interface MediaResult {
  uri: string;
  type: 'image' | 'video';
  fileName: string;
}

// Request media permissions
export const requestMediaPermissions = async (): Promise<boolean> => {
  try {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

// Pick image or video from library
export const pickMedia = async (): Promise<MediaResult | null> => {
  try {
    const hasPermissions = await requestMediaPermissions();
    if (!hasPermissions) {
      throw new Error('Media permissions not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 9],
      videoQuality: 1, // Medium quality (0-2, where 2 is highest)
      videoMaxDuration: 60, // 60 seconds max
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.uri.split('/').pop() || `media_${Date.now()}`;
    
    return {
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'image',
      fileName,
    };
  } catch (error) {
    console.error('Error picking media:', error);
    throw error;
  }
};

// Take photo or video with camera
export const takeMedia = async (): Promise<MediaResult | null> => {
  try {
    const hasPermissions = await requestMediaPermissions();
    if (!hasPermissions) {
      throw new Error('Camera permissions not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 9],
      videoQuality: 1, // Medium quality (0-2, where 2 is highest)
      videoMaxDuration: 60, // 60 seconds max
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.uri.split('/').pop() || `media_${Date.now()}`;
    
    return {
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'image',
      fileName,
    };
  } catch (error) {
    console.error('Error taking media:', error);
    throw error;
  }
};

// Upload media to Firebase Storage
export const uploadMedia = async (
  mediaUri: string, 
  fileName: string, 
  userId: string
): Promise<string> => {
  try {
    // Fetch the media file
    const response = await fetch(mediaUri);
    const blob = await response.blob();

    // Create storage reference
    const timestamp = Date.now();
    const storageRef = ref(storage, `posts/${userId}/${timestamp}_${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

// Delete media from Firebase Storage
export const deleteMedia = async (mediaUrl: string): Promise<void> => {
  try {
    const mediaRef = ref(storage, mediaUrl);
    await deleteObject(mediaRef);
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
};

// Generate thumbnail for video (placeholder - would need additional processing)
export const generateVideoThumbnail = async (videoUri: string): Promise<string> => {
  // For now, return the video URI itself
  // In a production app, you might want to generate actual thumbnails
  return videoUri;
};

// Validate media file size and type
export const validateMedia = (mediaResult: MediaResult): { isValid: boolean; error?: string } => {
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB limit
  
  // Note: expo-image-picker doesn't provide file size directly
  // You might need to implement additional checks based on your requirements
  
  if (mediaResult.type === 'video') {
    // Additional video validation could go here
    return { isValid: true };
  }
  
  if (mediaResult.type === 'image') {
    // Additional image validation could go here
    return { isValid: true };
  }
  
  return { isValid: false, error: 'Unsupported media type' };
};

// Media type helpers
export const isImage = (mediaType: string): boolean => {
  return mediaType === 'image';
};

export const isVideo = (mediaType: string): boolean => {
  return mediaType === 'video';
};

export const getMediaIcon = (mediaType: string): string => {
  return isImage(mediaType) ? '📷' : '🎥';
};
