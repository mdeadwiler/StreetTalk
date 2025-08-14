import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StreetColors } from './src/styles/streetStyles';

// White theme for navigation
const WhiteTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: StreetColors.brand.primary,
    background: StreetColors.background.primary,
    card: StreetColors.background.primary,
    text: StreetColors.text.primary,
    border: StreetColors.border.light,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={WhiteTheme}>
      <StatusBar style="dark" backgroundColor={StreetColors.background.primary} />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}

