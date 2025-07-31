import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider} from './src/context/AuthContext'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import { RootStackParamList } from './src/types';




const Stack = createNativeStackNavigator<RootStackParamList>();

function FeedScreen({ route }: { route: { params: { userId: string } } }) {
  const { userId } = route.params;
  
  return (
    <View style={styles.container}>
      <Text>Welcome to Street Talk</Text>
      <Text style={styles.userId}>Name: {userId}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Feed" component={FeedScreen} />
      </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userId: {
    color: '#fffaf0',
    fontSize: 14,
    marginTop: 10,
  },
});
