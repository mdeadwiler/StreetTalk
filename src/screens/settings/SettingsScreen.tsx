import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { StreetColors } from '../../styles/streetStyles';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const { logout, user, userProfile } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About StreetTalk',
      'StreetTalk is a social media app where you can share your thoughts and connect with others.\n\nVersion: 1.0.0',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Need help? Contact us at support@streettalk.com',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.accountInfo}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>@{userProfile?.username}</Text>
          </View>
          
          <View style={styles.accountInfo}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userProfile?.email}</Text>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('BlockedUsers')}
          >
            <Text style={styles.settingText}>Blocked Users</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <Text style={styles.settingText}>About StreetTalk</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleSupport}>
            <Text style={styles.settingText}>Support</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: StreetColors.brand.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    marginBottom: 16,
  },
  accountInfo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: StreetColors.text.muted,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: StreetColors.text.primary,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
  },
  settingText: {
    fontSize: 16,
    color: StreetColors.text.primary,
  },
  arrow: {
    fontSize: 16,
    color: StreetColors.text.muted,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: StreetColors.background.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
