import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert, StatusBar } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../../context/AuthContext'
import { RootStackParamList } from '../../types'

import { validateLoginForm, getZodErrorMessage, getFirebaseErrorMessage } from '../../utils/zod';
import { parseError, logError } from '../../utils/errorHandling';



type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation}: LoginScreenProps) {
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')

const { login } = useAuth()

const handleLogin = async (): Promise<void> => {
    const result = validateLoginForm({ username, password });
    if (!result.success) {
        Alert.alert('Error', getZodErrorMessage(result.error));
        return;
    }
    
    try {
        await login(username, password);
        // Navigation happens automatically via AuthContext and AppNavigator
        
    } catch (error: any) {
        const parsedError = logError(error, 'LoginScreen - Handle Login');
        Alert.alert('Login Failed', parsedError.message);
    }
}

const navigateToRegister = () => {
    navigation.navigate('Register')
}



return (
    <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <KeyboardAwareScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <View className="flex-1 justify-center px-8 py-8">
            <View className="mb-12">
                <Text className="text-3xl font-bold text-black text-center mb-3">
                    StreetTalk
                </Text>
                <Text className="text-lg text-gray-600 text-center">
                    Your voice, uncensored
                </Text>
            </View>

            {/* Login Form */}
            <View className="space-y-6">
                <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Username
                    </Text>
                    <TextInput
                        className="bg-white border border-gray-300 rounded-lg px-4 py-4 text-base text-black"
                        placeholder="Enter your username"
                        placeholderTextColor="#9CA3AF"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoComplete="username"
                    />
                </View>

                <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Password
                    </Text>
                    <TextInput 
                        className="bg-white border border-gray-300 rounded-lg px-4 py-4 text-base text-black"
                        placeholder="Enter your password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        autoComplete="current-password"
                    />
                </View>

                <Pressable 
                    style={({ pressed }: { pressed: boolean }) => ({
                        opacity: pressed ? 0.8 : 1,
                    })}
                    className="bg-purple-600 rounded-lg py-4 px-6 mt-6"
                    onPress={handleLogin}
                >
                    <Text className="text-white text-base font-semibold text-center">
                        Sign In
                    </Text>
                </Pressable>

                <View className="flex-row justify-center pt-6">
                    <Text className="text-base text-gray-600">
                        Don't have an account?{' '}
                    </Text>
                    <Pressable 
                        style={({ pressed }: { pressed: boolean }) => ({
                            opacity: pressed ? 0.7 : 1,
                        })}
                        className="py-1 px-2"
                        onPress={navigateToRegister}
                    >
                        <Text className="text-purple-600 text-base font-medium">
                            Sign up
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
        </KeyboardAwareScrollView>
    </View>
)
}

