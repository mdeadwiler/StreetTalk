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
import { StreetColors } from '../styles/streetStyles';

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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: StreetColors.background.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: StreetColors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: StreetColors.border.light,
  },
  cancelButton: {
    color: StreetColors.brand.primary,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },
  submitButtonDisabled: {
    backgroundColor: StreetColors.text.muted,
  },
  submitButtonText: {
    color: StreetColors.background.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonTextDisabled: {
    color: StreetColors.background.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: StreetColors.text.primary,
    marginTop: 24,
    marginBottom: 16,
  },
  reasonOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: StreetColors.border.light,
  },
  reasonOptionSelected: {
    backgroundColor: StreetColors.brand.primary,
    borderColor: StreetColors.brand.primary,
  },
  reasonText: {
    fontSize: 16,
    color: StreetColors.text.primary,
  },
  reasonTextSelected: {
    color: StreetColors.background.primary,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: StreetColors.border.light,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: StreetColors.text.primary,
    backgroundColor: StreetColors.background.secondary,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: StreetColors.text.muted,
    fontSize: 12,
    marginTop: 8,
  },
});
