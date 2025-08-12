// Report functionality for content moderation
// Required for App Store approval

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'hate_speech'
  | 'misinformation'
  | 'other';

export interface ReportData {
  reporterUserId: string;
  reporterUsername: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  targetUserId: string;
  targetUsername: string;
  reason: ReportReason;
  description?: string;
  createdAt: any;
  status: 'pending' | 'reviewed' | 'resolved';
}

export const reportContent = async (
  reporterUserId: string,
  reporterUsername: string,
  targetType: 'post' | 'comment' | 'user',
  targetId: string,
  targetUserId: string,
  targetUsername: string,
  reason: ReportReason,
  description?: string
): Promise<void> => {
  try {
    const reportData: ReportData = {
      reporterUserId,
      reporterUsername,
      targetType,
      targetId,
      targetUserId,
      targetUsername,
      reason,
      description,
      createdAt: serverTimestamp(),
      status: 'pending'
    };

    await addDoc(collection(db, 'reports'), reportData);
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report. Please try again.');
  }
};

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'misinformation', label: 'False Information' },
  { value: 'other', label: 'Other' }
];
