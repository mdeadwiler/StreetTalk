import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StatusBar,
  StyleSheet,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from '../../types';
import { validateRegisterForm, getZodErrorMessage, getFirebaseErrorMessage } from '../../utils/zod';
import { parseError, logError } from '../../utils/errorHandling';
import { StreetColors } from '../../styles/streetStyles';


type RegisterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register } = useAuth();

  const handleRegister = async (): Promise<void> => {
    const result = validateRegisterForm({ email, username, password, confirmPassword });
    if (!result.success) {
      Alert.alert("Error", getZodErrorMessage(result.error));
      return;
    }

    try {
      await register(email, username, password);
      // Navigation happens automatically via AuthContext and AppNavigator
      
    } catch (error: any) {
      const parsedError = logError(error, 'RegisterScreen - Handle Register');
      Alert.alert('Registration Failed', parsedError.message);
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={StreetColors.background.primary} />
      
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              Create Account
            </Text>
            <Text style={styles.subtitle}>
              Join the conversation
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor={StreetColors.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Username
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="4-12 chars: letters, numbers, _-."
                placeholderTextColor={StreetColors.text.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                maxLength={12}
                autoComplete="username"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Password
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="12+ chars with mixed case, number, special"
                placeholderTextColor={StreetColors.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoComplete="new-password"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Confirm Password
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Re-enter your password"
                placeholderTextColor={StreetColors.text.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />
            </View>

            <Pressable 
              style={({ pressed }: { pressed: boolean }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed
              ]}
              onPress={handleRegister}
            >
              <Text style={styles.primaryButtonText}>
                Create Account
              </Text>
            </Pressable>

            <View style={styles.signInSection}>
              <Text style={styles.signInText}>
                Already have an account?{' '}
              </Text>
              <Pressable 
                style={({ pressed }: { pressed: boolean }) => [
                  styles.linkButton,
                  pressed && styles.linkButtonPressed
                ]}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Sign in
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  scrollViewContent: {
    flexGrow: 1,
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
    fontSize: 30,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: StreetColors.text.secondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: StreetColors.background.primary,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: StreetColors.text.primary,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: StreetColors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: StreetColors.background.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  signInText: {
    fontSize: 16,
    color: StreetColors.text.secondary,
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkText: {
    color: StreetColors.brand.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
