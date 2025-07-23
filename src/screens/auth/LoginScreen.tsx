import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

type LoginScreenProps = NativeStackScreenProps<any, 'Login'>

export default function LoginScreen({ navigation}: LoginScreenProps) {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
}
