import React from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth} from '../../context/AuthContext'
import { RootStackParamList } from '../../types'
import { validateCreatePostForm, getZodErrorMessage } from '../../utils/zod'
import { authStyles } from '../../styles/authStyles'

type CreatePostScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePost'>

export const CreatePostScreen = ({ navigation }: CreatePostScreenProps)=> { 
const { user } = useAuth()

return (
    <View style={authStyles.container}>
        <Text>Post</Text>
    </View>
)
}