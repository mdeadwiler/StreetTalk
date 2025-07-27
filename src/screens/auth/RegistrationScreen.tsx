import React, { useState} from 'react'
// UI Components
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack' 
import { createUserWithEmailAndPassword} from 'firebase/auth'
import { auth } from '../../utils/firebaseConfig'