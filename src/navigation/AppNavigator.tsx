import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/auth/LoginScreen'
import FeedScreen from '../screens/FeedScreen'
import { useAuth } from '../context/AuthContext'
import { ActivityIndicator, View} from 'react-native'


const Stack = createNativeStackNavigator()

export const AppNavigato = () => {
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
                <Stack.Screen name='Feed' component={FeedScreen} />
            ) : ( 
                <Stack.Screen name='Login' component={LoginScreen} />
            )}
        </Stack.Navigator>
    )
}


