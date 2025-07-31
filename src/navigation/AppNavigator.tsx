import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import FeedScreen from '../screens/feed/FeedScreen'
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
                <Stack.Screen name='Feed' component={FeedScreen} initialParams={{ userId: user.uid }} />
            ) : ( 
                <>
                    <Stack.Screen name='Login' component={LoginScreen} />
                    <Stack.Screen name='Register' component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    )
}




