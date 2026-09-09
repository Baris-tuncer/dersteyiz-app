import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import TrialRequestModal from './TrialRequestModal';

interface TrialRequestButtonProps {
  teacherId: string;
  parentId: string;
}

export default function TrialRequestButton({ teacherId, parentId }: TrialRequestButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={20} color={Colors.navy} />
        <Text style={styles.text}>15 dk Tanışma Talebi</Text>
      </TouchableOpacity>

      <TrialRequestModal
        visible={modalVisible}
        teacherId={teacherId}
        parentId={parentId}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navyLight,
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
});
