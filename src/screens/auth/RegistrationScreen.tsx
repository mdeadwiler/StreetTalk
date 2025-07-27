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
    }
}
