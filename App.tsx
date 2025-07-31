import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider} from './src/context/AuthContext'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FeedScreen from './src/screens/feed/FeedScreen';
import { RootStackParamList } from './src/types';


const Stack = createNativeStackNavigator<RootStackParamList>();



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


