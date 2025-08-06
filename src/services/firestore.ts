import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  serverTimestamp,
  increment,
  Timestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { Post, Comment } from '../types';
import { sanitizeUserContent } from '../utils/security';

// Posts Collection Functions
export const createPost = async (
  userId: string, 
  username: string, 
  content: string, 
  mediaUrl?: string, 
  mediaType?: 'image' | 'video',
  mediaThumbnail?: string
): Promise<string> => {
  try {
    const postData: any = {
      content: sanitizeUserContent(content),
      userId,
      username,
      createdAt: serverTimestamp(),
      likes: 0,
      commentsCount: 0
    };

    // Add media fields if provided
    if (mediaUrl) {
      postData.mediaUrl = mediaUrl;
      postData.mediaType = mediaType;
      if (mediaThumbnail) {
        postData.mediaThumbnail = mediaThumbnail;
      }
    }

    const docRef = await addDoc(collection(db, 'posts'), postData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (limitCount: number = 20, lastVisible?: any): Promise<{posts: Post[], lastVisible: any}> => {
  try {
    let q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    // Add pagination cursor if provided
    if (lastVisible) {
      q = query(
        collection(db, 'posts'), 
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { posts, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const getPost = async (postId: string): Promise<Post | null> => {
  try {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Post;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const updatePost = async (postId: string, content: string): Promise<void> => {
  try {
    const docRef = doc(db, 'posts', postId);
    await updateDoc(docRef, {
      content: sanitizeUserContent(content),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    // First delete all comments for this post
    const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    const deletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Then delete the post
    const docRef = doc(db, 'posts', postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const getUserPosts = async (userId: string, limitCount: number = 20, lastVisible?: any): Promise<{posts: Post[], lastVisible: any}> => {
  try {
    let q = query(
      collection(db, 'posts'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (lastVisible) {
      q = query(
        collection(db, 'posts'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { posts, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

// Comments Collection Functions
export const createComment = async (
  postId: string, 
  userId: string, 
  username: string, 
  content: string
): Promise<string> => {
  try {
    // Add comment
    const docRef = await addDoc(collection(db, 'comments'), {
      postId,
      content: sanitizeUserContent(content),
      userId,
      username,
      createdAt: serverTimestamp()
    });
    
    // Increment comments count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const getPostComments = async (postId: string, limitCount: number = 50, lastVisible?: any): Promise<{comments: Comment[], lastVisible: any}> => {
  try {
    let q = query(
      collection(db, 'comments'), 
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (lastVisible) {
      q = query(
        collection(db, 'comments'), 
        where('postId', '==', postId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
    
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { comments, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  try {
    // Delete comment
    const docRef = doc(db, 'comments', commentId);
    await deleteDoc(docRef);
    
    // Decrement comments count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(-1)
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Paginated posts fetching to replace expensive real-time listeners
export const getPaginatedPosts = async (limitCount: number = 20, lastVisible?: any): Promise<{ posts: Post[], lastVisible: any }> => {
  try {
    let q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastVisible) {
      q = query(
        collection(db, 'posts'), 
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];

    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { posts, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching paginated posts:', error);
    throw error;
  }
};

export const getPaginatedUserPosts = async (userId: string, limitCount: number = 20, lastVisible?: any): Promise<{ posts: Post[], lastVisible: any }> => {
  try {
    let q = query(
      collection(db, 'posts'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastVisible) {
      q = query(
        collection(db, 'posts'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];

    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { posts, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching paginated user posts:', error);
    throw error;
  }
};

// Real-time listeners with limits to prevent cost attacks (keep for initial load only)
export const subscribeToPostsUpdates = (callback: (posts: Post[]) => void, limitCount: number = 30) => {
  const q = query(
    collection(db, 'posts'), 
    orderBy('createdAt', 'desc'),
    limit(limitCount)  // Limit real-time listener to prevent cost attacks
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    callback(posts);
  });
};

export const subscribeToCommentsUpdates = (postId: string, callback: (comments: Comment[]) => void, limitCount: number = 50) => {
  const q = query(
    collection(db, 'comments'), 
    where('postId', '==', postId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)  // Limit comments listener to prevent cost attacks
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const comments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
    callback(comments);
  });
};

// Utility functions
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'Just now';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

// Simple client-side rate limiting helper
const actionTimestamps = new Map<string, number[]>();

export const checkRateLimit = (userId: string, action: string, maxActions: number, windowMs: number): boolean => {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = actionTimestamps.get(key) || [];
  
  // Remove old timestamps outside the window
  const validTimestamps = timestamps.filter(time => now - time < windowMs);
  
  if (validTimestamps.length >= maxActions) {
    return false; // Rate limit exceeded
  }
  
  // Add current timestamp
  validTimestamps.push(now);
  actionTimestamps.set(key, validTimestamps);
  
  return true; // Action allowed
};
