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
        
        let errorMessage = 'Login Failes. Please try again.'

        if (errorMessage === 'auth/email-already-in-use') {
            errorMessage = 'This email already in use'
        } else if (errorMessage === 'auth/invalid-email') {
            errorMessage= 'Invalid email address'
        } else if (errorMessage === 'auth/weak-password') {
            errorMessage = 'This is password should be at least 12 characters'
        }
         Alert.alert('Error', errorMessage)
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <View style={styles.form}>
                <TextInput
                style={styles.input}
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                />
                <TextInput
                style={styles.input}
                placeholder='Password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                />
                <TextInput
                style={styles.input}
                placeholder='confirmPassword'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                />
                <TouchableOpacity style={styles.registerButtonText} onPress={handleLogin}>
                    <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 20,
        justifyContent: 'center'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#4b0082',
    },
    form: {
        width: '100%',
        // alignItems: 'center', 
        // justifyContent: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#fffaf0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    registerButton: {
    backgroundColor: '#4b0082',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fffaf0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  

})
