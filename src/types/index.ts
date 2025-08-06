// Core types for the StreetTalk app

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  CreatePost: undefined;
  PostComments: { postId: string };
  EditPost: { postId: string };
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Auth types
export type AuthContextType = {
  user: import('firebase/auth').User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export interface User {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  createdAt: any; // Firebase Timestamp
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  createdAt: any; // Firebase Timestamp
}

export interface Post {
  id: string;
  content: string;
  userId: string;
  username: string;
  createdAt: any; // Firebase Timestamp
  updatedAt?: any; // Firebase Timestamp
  likes: number;
  commentsCount: number;
  // Media support
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaThumbnail?: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  userId: string;
  username: string;
  createdAt: any; // Firebase Timestamp
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

