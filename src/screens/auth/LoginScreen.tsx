import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../../context/AuthContext'
import { RootStackParamList } from '../../types'
import { authStyles } from '../../styles/authStyles'
import { validateLoginForm, getZodErrorMessage, getFirebaseErrorMessage } from '../../utils/zod';


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
        console.error('Login error:', error);
        if (error.message === 'Username not found') {
            Alert.alert('Error', 'Username not found. Please check your username or register for a new account.');
        } else {
            const errorMessage = getFirebaseErrorMessage(error.code);
            Alert.alert('Error', errorMessage);
        }
    }
}

const navigateToRegister = () => {
    navigation.navigate('Register')
}



return (
    <View style={authStyles.container}>
        <Text style={authStyles.title}>Welcome to StreetTalk</Text>

        <View style={authStyles.form}>
            <TextInput
                style={authStyles.input}
                placeholder="Username"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput 
                style={authStyles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />

            <TouchableOpacity style={authStyles.button} onPress={handleLogin}>
                <Text style={authStyles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToRegister}>
                <Text style={authStyles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    </View>
)
}

