import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../../context/AuthContext'
import { RootStackParamList } from '../../types';


type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation}: LoginScreenProps) {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

const { login } = useAuth()

const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields')
        return
    }
    
    if (!email.includes('@')) {
        Alert.alert('Error', 'Please enter a valid email address')
        return
    }
    
    try {
        await login(email, password)
        // Navigation happens automatically via AuthContext and AppNavigator
        
    } catch (error: any) {
        console.error('Login error:', error)
        
        // Handle specific Firebase auth errors
        let errorMessage = 'Login failed. Please try again.'
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.'
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.'
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.'
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Try again later.'
        }
        
        Alert.alert('Error', errorMessage)
    }
}

const navigateToRegister = () => {
    navigation.navigate('Register')
}



return (
    <View style={styles.container}>
        <Text style={styles.title}>Welcome to StreetTalk</Text>

        <View style={styles.form}>
            <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize='none'
        />

             <TextInput 
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            />


            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
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
    },
    input: {
        borderWidth: 1,
        borderColor: '#fffaf0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    loginButton: {
    backgroundColor: '#4b0082',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fffaf0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#fffaf0',
    fontSize: 16,
  },

})