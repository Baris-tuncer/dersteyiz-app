import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface DiplomaSectionProps {
  diplomaUrl: string;
  diplomaType?: 'diploma' | 'certificate';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DiplomaSection({ diplomaUrl, diplomaType = 'diploma' }: DiplomaSectionProps) {
  const [zoomVisible, setZoomVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="verified" size={20} color={Colors.navy} />
        <Text style={styles.title}>
          {diplomaType === 'certificate' ? 'Onaylı Sertifika' : 'Onaylı Diploma'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={() => setZoomVisible(true)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: diplomaUrl }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.zoomOverlay}>
          <Ionicons name="expand-outline" size={18} color={Colors.textOnDark} />
        </View>
      </TouchableOpacity>

      {/* Zoom Modal */}
      <Modal visible={zoomVisible} transparent animationType="fade" onRequestClose={() => setZoomVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setZoomVisible(false)}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setZoomVisible(false)}>
            <Ionicons name="close" size={28} color={Colors.textOnDark} />
          </TouchableOpacity>
          <Image
            source={{ uri: diplomaUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  thumbnailContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: {
    width: '100%',
    height: 160,
  },
  zoomOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
  },
});
