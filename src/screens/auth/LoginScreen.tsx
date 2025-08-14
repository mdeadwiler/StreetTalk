import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert, StatusBar, StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../../context/AuthContext'
import { RootStackParamList } from '../../types'
import { StreetColors } from '../../styles/streetStyles'

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
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={StreetColors.background.primary} />
        
        <KeyboardAwareScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <View style={styles.content}>
                <View style={styles.headerSection}>
                    <Text style={styles.title}>
                        StreetTalk
                    </Text>
                    <Text style={styles.subtitle}>
                        Your voice, uncensored
                    </Text>
                </View>

                {/* Login Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Username
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your username"
                            placeholderTextColor="#9CA3AF"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="username"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Password
                        </Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            autoComplete="current-password"
                        />
                    </View>

                    <Pressable 
                        style={({ pressed }: { pressed: boolean }) => [
                            styles.loginButton,
                            { opacity: pressed ? 0.8 : 1 }
                        ]}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginButtonText}>
                            Sign In
                        </Text>
                    </Pressable>

                    <View style={styles.signupPrompt}>
                        <Text style={styles.signupText}>
                            Don't have an account?{' '}
                        </Text>
                        <Pressable 
                            style={({ pressed }: { pressed: boolean }) => [
                                styles.signupLink,
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                            onPress={navigateToRegister}
                        >
                            <Text style={styles.signupLinkText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  headerSection: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: StreetColors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: StreetColors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: StreetColors.background.primary,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: StreetColors.text.primary,
  },
  loginButton: {
    backgroundColor: StreetColors.brand.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  loginButtonText: {
    color: StreetColors.background.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 24,
  },
  signupText: {
    fontSize: 16,
    color: StreetColors.text.secondary,
  },
  signupLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  signupLinkText: {
    color: StreetColors.brand.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

