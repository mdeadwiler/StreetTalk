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
import { authStyles } from '../../styles/authStyles';
import { validateEmail, validatePassword, validatePasswordMatch, getFirebaseErrorMessage } from '../../utils/validation';


type RegisterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register } = useAuth();

  const handleRegister = async (): Promise<void> => {
    const emailError = validateEmail(email);
    if (emailError) {
      Alert.alert("Error", emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert("Error", passwordError);
      return;
    }

    const passwordMatchError = validatePasswordMatch(password, confirmPassword);
    if (passwordMatchError) {
      Alert.alert("Error", passwordMatchError);
      return;
    }

    try {
      await register(email, password);
      // Navigation happens automatically via AuthContext and AppNavigator
      
    } catch (error: any) {
      console.log("Registration Error", error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      Alert.alert("Error", errorMessage);
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
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
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
