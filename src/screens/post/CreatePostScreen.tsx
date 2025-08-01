import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth} from '../../context/AuthContext'
import { RootStackParamList } from '../../types'
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod'
import { authStyles } from '../../styles/authStyles'

type CreatePostScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePost'>

export const CreatePostScreen = ({ navigation }: CreatePostScreenProps)=> { 
const { user } = useAuth()
const [content, setContent] = useState('')

const handleCreatePost = () => {
  const validation = validateCreatePostForm({ content })
  
  if (!validation.success) {
    Alert.alert('Error', getZodErrorMessage(validation.error))
    return
  }

  // TODO: Add Firestore logic here
  console.log('Creating post:', { content, userId: user?.uid })
  Alert.alert('Success', 'Post created successfully!')
  navigation.goBack()
}

const handleCancel = () => {
  navigation.goBack()
}

const characterCount = content.length
const isOverLimit = characterCount > 300

return (
    <View style={authStyles.container}>
      <View style={authStyles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={authStyles.linkText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={authStyles.title}>New Post</Text>
        <TouchableOpacity 
          onPress={handleCreatePost}
          disabled={content.trim().length === 0}
          style={[
            authStyles.button,
            content.trim().length === 0 && authStyles.buttonDisabled
          ]}
        >
          <Text style={[
            authStyles.buttonText,
            content.trim().length === 0 && authStyles.buttonTextDisabled
          ]}>Post</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[authStyles.textArea, { height: 200 }]}
        placeholder="What's happening?"
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={300}
        autoFocus
      />

      <Text style={[
        authStyles.characterCounter,
        { color: isOverLimit ? '#ff0000' : characterCount > 250 ? '#ff6600' : '#666' }
      ]}>
        {characterCount}/300
      </Text>
    </View>
)
}