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
    
    // First get the current post data to preserve all fields
    const currentPost = await getDoc(docRef);
    if (!currentPost.exists()) {
      throw new Error('Post not found');
    }
    
    const currentData = currentPost.data();
    
    // Update with all existing fields preserved (rules require this)
    await updateDoc(docRef, {
      content: sanitizeUserContent(content),
      updatedAt: serverTimestamp(),
      // Preserve all other fields exactly as they are
      userId: currentData.userId,
      username: currentData.username,
      createdAt: currentData.createdAt,
      likes: currentData.likes,
      commentsCount: currentData.commentsCount,
      // Preserve media fields if they exist
      ...(currentData.mediaUrl && { mediaUrl: currentData.mediaUrl }),
      ...(currentData.mediaType && { mediaType: currentData.mediaType }),
      ...(currentData.mediaThumbnail && { mediaThumbnail: currentData.mediaThumbnail })
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    // First delete all nested comments for this post
    // Add limit to comply with security rules
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments'),
      limit(50)
    );
    let hasMoreComments = true;
    
    // Delete comments in batches to handle large numbers
    while (hasMoreComments) {
      const commentsSnapshot = await getDocs(commentsQuery);
      
      if (commentsSnapshot.empty) {
        hasMoreComments = false;
        break;
      }
      
      const deletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // If we got fewer than the limit, we're done
      if (commentsSnapshot.docs.length < 50) {
        hasMoreComments = false;
      }
    }
    
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
    // Add comment to nested collection
    const docRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
      postId,
      content: sanitizeUserContent(content),
      userId,
      username,
      createdAt: serverTimestamp()
    });
    
    // Increment comments count on post using atomic increment
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
      collection(db, 'posts', postId, 'comments'), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (lastVisible) {
      q = query(
        collection(db, 'posts', postId, 'comments'), 
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
    // Delete comment from nested collection
    const docRef = doc(db, 'posts', postId, 'comments', commentId);
    await deleteDoc(docRef);
    
    // Decrement comments count on post using atomic decrement
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(-1)
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Helper function to filter out blocked users' content
const filterBlockedContent = <T extends { userId: string }>(content: T[], blockedUsers: string[]): T[] => {
  if (blockedUsers.length === 0) return content;
  return content.filter(item => !blockedUsers.includes(item.userId));
};

// Paginated posts fetching to replace expensive real-time listeners
export const getPaginatedPosts = async (limitCount: number = 20, lastVisible?: any, currentUserId?: string): Promise<{ posts: Post[], lastVisible: any }> => {
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
    let posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];

    // Filter out blocked users' posts if currentUserId is provided
    if (currentUserId) {
      const blockedUsers = await getBlockedUsers(currentUserId);
      posts = filterBlockedContent(posts, blockedUsers);
    }

    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { posts, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching paginated posts:', error);
    throw error;
  }
};

export const getPaginatedUserPosts = async (userId: string, limitCount: number = 20, lastVisible?: any, currentUserId?: string): Promise<{ posts: Post[], lastVisible: any }> => {
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
    let posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];

    // Filter out blocked users' posts if currentUserId is provided and it's not the user's own posts
    if (currentUserId && currentUserId !== userId) {
      const blockedUsers = await getBlockedUsers(currentUserId);
      posts = filterBlockedContent(posts, blockedUsers);
    }

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

// Paginated comments fetching to replace expensive real-time listeners
export const getPaginatedComments = async (postId: string, limitCount: number = 50, lastVisible?: any, currentUserId?: string): Promise<{ comments: Comment[], lastVisible: any }> => {
  try {
    let q = query(
      collection(db, 'posts', postId, 'comments'), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastVisible) {
      q = query(
        collection(db, 'posts', postId, 'comments'), 
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    let comments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];

    // Filter out blocked users' comments if currentUserId is provided
    if (currentUserId) {
      const blockedUsers = await getBlockedUsers(currentUserId);
      comments = filterBlockedContent(comments, blockedUsers);
    }

    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { comments, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching paginated comments:', error);
    throw error;
  }
};

export const subscribeToCommentsUpdates = (postId: string, callback: (comments: Comment[]) => void, limitCount: number = 50) => {
  const q = query(
    collection(db, 'posts', postId, 'comments'), 
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

// User Blocking Functions
export const blockUser = async (blockerUserId: string, blockedUserId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', blockerUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentBlockedUsers = userData.blockedUsers || [];
      
      if (!currentBlockedUsers.includes(blockedUserId)) {
        await updateDoc(userRef, {
          blockedUsers: [...currentBlockedUsers, blockedUserId]
        });
      }
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

export const unblockUser = async (blockerUserId: string, unblockedUserId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', blockerUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentBlockedUsers = userData.blockedUsers || [];
      
      await updateDoc(userRef, {
        blockedUsers: currentBlockedUsers.filter((userId: string) => userId !== unblockedUserId)
      });
    }
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

export const getBlockedUsers = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.blockedUsers || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting blocked users:', error);
    return [];
  }
};

export const isUserBlocked = async (blockerUserId: string, potentiallyBlockedUserId: string): Promise<boolean> => {
  try {
    const blockedUsers = await getBlockedUsers(blockerUserId);
    return blockedUsers.includes(potentiallyBlockedUserId);
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }
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

// ADMIN FUNCTIONS

// Admin: Delete any post (bypasses ownership check)
export const adminDeletePost = async (postId: string, adminUserId: string): Promise<void> => {
  try {
    console.log(`Admin ${adminUserId} deleting post ${postId}`);
    
    // Delete all nested comments for this post first
    // Add limit to comply with security rules
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments'),
      limit(50)
    );
    let hasMoreComments = true;
    let totalDeleted = 0;
    
    // Delete comments in batches to handle large numbers
    while (hasMoreComments) {
      const commentsSnapshot = await getDocs(commentsQuery);
      
      if (commentsSnapshot.empty) {
        hasMoreComments = false;
        break;
      }
      
      const deleteCommentPromises = commentsSnapshot.docs.map(commentDoc => 
        deleteDoc(commentDoc.ref)
      );
      await Promise.all(deleteCommentPromises);
      
      totalDeleted += commentsSnapshot.docs.length;
      
      // If we got fewer than the limit, we're done
      if (commentsSnapshot.docs.length < 50) {
        hasMoreComments = false;
      }
    }
    
    // Delete the post
    await deleteDoc(doc(db, 'posts', postId));
    
    console.log(`Admin deleted post ${postId} and ${totalDeleted} associated comments`);
  } catch (error) {
    console.error('Admin error deleting post:', error);
    throw error;
  }
};

// Admin: Delete any comment (bypasses ownership check)
export const adminDeleteComment = async (commentId: string, postId: string, adminUserId: string): Promise<void> => {
  try {
    console.log(`Admin ${adminUserId} deleting comment ${commentId} from post ${postId}`);
    
    // Delete the comment from nested collection
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
    
    // Decrease comment count on the post
    const postRef = doc(db, 'posts', postId);
    
    // Get current post data first
    const currentPost = await getDoc(postRef);
    if (currentPost.exists()) {
      const currentData = currentPost.data();
      const newCommentsCount = Math.max(0, (currentData.commentsCount || 0) - 1);
      
      await updateDoc(postRef, {
        commentsCount: newCommentsCount
      });
    }
    
    console.log(`Admin deleted comment ${commentId}`);
  } catch (error) {
    console.error('Admin error deleting comment:', error);
    throw error;
  }
};

// Admin: Get all posts (no user filtering)
export const adminGetAllPosts = async (): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as Post);
    });
    
    return posts;
  } catch (error) {
    console.error('Admin error getting all posts:', error);
    throw error;
  }
};

// Admin: Get user activity summary
export const adminGetUserActivity = async (userId: string): Promise<{
  postCount: number;
  commentCount: number;
  posts: Post[];
  comments: Comment[];
}> => {
  try {
    // Get user's posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const postsSnapshot = await getDocs(postsQuery);
    const posts: Post[] = [];
    postsSnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    
    // Get user's comments from all posts (this is complex with nested structure)
    // For admin purposes, we'll use collection group query if available
    // or iterate through all posts to find user's comments
    const comments: Comment[] = [];
    
    // Simple approach: get all posts and check their comments
    const allPostsQuery = query(collection(db, 'posts'));
    const allPostsSnapshot = await getDocs(allPostsQuery);
    
    for (const postDoc of allPostsSnapshot.docs) {
      const commentsQuery = query(
        collection(db, 'posts', postDoc.id, 'comments'),
        where('userId', '==', userId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach((commentDoc) => {
        comments.push({ id: commentDoc.id, ...commentDoc.data() } as Comment);
      });
    }
    
    return {
      postCount: posts.length,
      commentCount: comments.length,
      posts,
      comments
    };
  } catch (error) {
    console.error('Admin error getting user activity:', error);
    throw error;
  }
};
