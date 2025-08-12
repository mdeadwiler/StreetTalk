import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { reportContent, REPORT_REASONS, ReportReason } from '../services/reportService';
import { colors, spacing } from '../styles/theme';

interface ReportButtonProps {
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  targetUserId: string;
  targetUsername: string;
  compact?: boolean;
}

export default function ReportButton({
  targetType,
  targetId,
  targetUserId,
  targetUsername,
  compact = false
}: ReportButtonProps) {
  const { user, userProfile } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Don't show report button for own content
  if (targetUserId === user?.uid) {
    return null;
  }

  const handleReport = async () => {
    if (!user || !userProfile || !selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting.');
      return;
    }

    setSubmitting(true);
    try {
      await reportContent(
        user.uid,
        userProfile.username,
        targetType,
        targetId,
        targetUserId,
        targetUsername,
        selectedReason,
        description.trim() || undefined
      );

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our moderation team will review it shortly.',
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );

      // Reset form
      setSelectedReason(null);
      setDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={compact ? styles.compactButton : styles.button}
      >
        <Text style={compact ? styles.compactButtonText : styles.buttonText}>
          Report
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report {targetType}</Text>
            <TouchableOpacity 
              onPress={handleReport}
              disabled={!selectedReason || submitting}
              style={[
                styles.submitButton,
                (!selectedReason || submitting) && styles.submitButtonDisabled
              ]}
            >
              <Text style={[
                styles.submitButtonText,
                (!selectedReason || submitting) && styles.submitButtonTextDisabled
              ]}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Why are you reporting this {targetType}?</Text>
            
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                onPress={() => setSelectedReason(reason.value)}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.value && styles.reasonOptionSelected
                ]}
              >
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason.value && styles.reasonTextSelected
                ]}>
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Additional details (optional)</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Provide additional context about this report..."
              value={description}
              onChangeText={setDescription}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  compactButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  compactButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  cancelButton: {
    color: colors.primary,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  submitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  submitButtonDisabled: {
    backgroundColor: colors.mutedText,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonTextDisabled: {
    color: colors.background,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  reasonOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  reasonOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonText: {
    fontSize: 16,
    color: colors.text,
  },
  reasonTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.cardBackground,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: colors.mutedText,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
