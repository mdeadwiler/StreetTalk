import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth} from '../../context/AuthContext'
import { RootStackParamList } from '../../types'
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod'
import { authStyles } from '../../styles/authStyles'
import { colors } from '../../styles/theme'
import { db } from '../../utils/firebaseConfig'

type CreatePostScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePost'>

export const CreatePostScreen = ({ navigation }: CreatePostScreenProps)=> { 
const { user } = useAuth()
const [content, setContent] = useState('')

const handleCreatePost = async () => {
  const validation = validateCreatePostForm({ content })
  
  if (!validation.success) {
    Alert.alert('Error', getZodErrorMessage(validation.error))
    return
  }

  if (!user) {
    Alert.alert('Error', 'You must be logged in to create a post')
    return
  }

  try {
    await addDoc(collection(db, 'posts'), {
      content: content.trim(),
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: 0
    })

    Alert.alert('Success', 'Post created successfully!')
    navigation.goBack()
  } catch (error) {
    console.error('Error creating post:', error)
    Alert.alert('Error', 'Failed to create post. Please try again.')
  }
}

const handleCancel = () => {
  navigation.goBack()
}

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

        <TouchableOpacity 
          onPress={handleCreatePost}
          disabled={content.trim().length === 0}
          style={[
            authStyles.button,
            { marginTop: 20, width: '60%', paddingVertical: 12 }
          ]}
        >
          <Text style={authStyles.buttonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
)
}