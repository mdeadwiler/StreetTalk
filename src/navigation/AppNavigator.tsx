import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import { TabNavigator } from './TabNavigator'
import { CreatePostScreen } from '../screens/post/CreatePostScreen'
import { EditPostScreen } from '../screens/post/EditPostScreen'
import PostCommentsScreen from '../screens/post/PostCommentsScreen'
import { useAuth } from '../context/AuthContext'
import { ActivityIndicator, View } from 'react-native'
import { RootStackParamList } from '../types';



const Stack = createNativeStackNavigator<RootStackParamList>()

export const AppNavigator = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size='large' color='black' />
            </View>
        )
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name='MainTabs' component={TabNavigator} />
                    <Stack.Screen name='CreatePost' component={CreatePostScreen} />
                    <Stack.Screen name='EditPost' component={EditPostScreen} />
                    <Stack.Screen name='PostComments' component={PostCommentsScreen} />
                </>
            ) : ( 
                <>
                    <Stack.Screen name='Login' component={LoginScreen} />
                    <Stack.Screen name='Register' component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    )
}




