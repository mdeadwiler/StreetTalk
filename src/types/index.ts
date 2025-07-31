// Core types for the BlockStreet app

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Feed: { userId: string };
};

// Auth types
export type AuthContextType = {
  user: import('firebase/auth').User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export interface User {
  id: string;
  anonymousName: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
