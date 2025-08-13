import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from '../../types';
import { styles as authStyles } from '../../styles/theme';
import { validateRegisterForm, getZodErrorMessage, getFirebaseErrorMessage } from '../../utils/zod';
import { parseError, logError } from '../../utils/errorHandling';


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
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Register</Text>
      <View style={authStyles.form}>
        <TextInput
          style={authStyles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={authStyles.input}
          placeholder="Username (4-12 chars: letters, numbers, _-.)"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={12}
          autoComplete="username"
        />
        <TextInput
          style={authStyles.input}
          placeholder="Password (12+ chars with mixed case, number, special)"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoComplete="new-password"
        />
        <TextInput
          style={authStyles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        />
        <TouchableOpacity style={authStyles.button} onPress={handleRegister}>
          <Text style={authStyles.buttonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={authStyles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
