import React, { useState} from 'react'
// UI Components
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack' 
import { createUserWithEmailAndPassword} from 'firebase/auth'
import { auth } from '../../utils/firebaseConfig'

type AuthStackParamList = {
    Login: { userId: string},
    Register: { userId: string},
    Feed: { userId: string},
}

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>

export default function RegisterScreen({ navigation}: RegisterScreenProps ){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleLogin = async (): Promise<void> => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address')
            return
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match')
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            // This is a check to see if the user is logged in
            console.log('Login successful:', user.uid)
            Alert.alert('Success', 'Login successful')
            navigation.navigate('Feed', { userId: user.uid})
        } catch (error: any) {
            console.log('Login Error', error)
        }
        // Have to set if else statements
    }
}
