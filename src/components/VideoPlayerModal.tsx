import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string;
  onClose: () => void;
}

export default function VideoPlayerModal({ visible, videoUrl, onClose }: VideoPlayerModalProps) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
    p.muted = false;
    p.volume = 1.0;
    p.play();
  });

  const handleClose = () => {
    player.pause();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <VideoView
          player={player}
          style={styles.video}
          nativeControls
          contentFit="contain"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    flex: 1,
  },
});
