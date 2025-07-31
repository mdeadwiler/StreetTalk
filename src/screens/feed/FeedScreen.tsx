import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';


type FeedScreenProps = NativeStackScreenProps<RootStackParamList, 'Feed'>;

export default function FeedScreen({ route }: FeedScreenProps) {
  const { userId } = route.params;
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation happens automatically via AuthContext + AppNavigator
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StreetTalk</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Feed */}
      <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome to Street Talk</Text>
          <Text style={styles.userIdText}>User: {userId}</Text>
        </View>

        {/* Sample Posts */}
        <View style={styles.postCard}>
          <Text style={styles.postAuthor}>@streetuser1</Text>
          <Text style={styles.postContent}>
            Just joined StreetTalk! Excited to connect with everyone
          </Text>
          <Text style={styles.postTime}>2 hours ago</Text>
        </View>

        <View style={styles.postCard}>
          <Text style={styles.postAuthor}>@cityexplorer</Text>
          <Text style={styles.postContent}>
            Beautiful sunset from downtown today. This city never fails to amaze me!
          </Text>
          <Text style={styles.postTime}>4 hours ago</Text>
        </View>

        <View style={styles.postCard}>
          <Text style={styles.postAuthor}>@techie2024</Text>
          <Text style={styles.postContent}>
            Working on some cool projects. Can't wait to share updates!
          </Text>
          <Text style={styles.postTime}>6 hours ago</Text>
        </View>
      </ScrollView>

      {/* Create Post Button */}
      <TouchableOpacity style={styles.createPostButton}>
        <Text style={styles.createPostText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4b0082',
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4b0082',
  },
  logoutText: {
    color: '#4b0082',
    fontSize: 14,
    fontWeight: '500',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fffaf0',
    marginBottom: 8,
  },
  userIdText: {
    fontSize: 12,
    color: '#888888',
  },
  postCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b0082',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    color: '#fffaf0',
    lineHeight: 22,
    marginBottom: 10,
  },
  postTime: {
    fontSize: 12,
    color: '#888888',
  },
  createPostButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4b0082',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createPostText: {
    color: '#fffaf0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
