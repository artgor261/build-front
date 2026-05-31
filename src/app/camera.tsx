import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { recognizeImage } from '@/api/client';
import { ObjectResponse, RecognizeResponse } from '@/api/types';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [result, setResult] = useState<RecognizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    router.replace('/');
  }, [router]);

  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to the photo library.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const asset = pickerResult.assets[0];
      setPhotoUri(asset.uri);
      setResult(null);
      setError(null);
      await recognize(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'photo.jpg');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to the camera.');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const asset = pickerResult.assets[0];
      setPhotoUri(asset.uri);
      setResult(null);
      setError(null);
      await recognize(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'photo.jpg');
    }
  }, []);

  async function recognize(uri: string, type: string, fileName: string) {
    try {
      setRecognizing(true);
      setError(null);
      const data = await recognizeImage({ uri, type, fileName });
      if (data.object?.id) {
        router.replace(`/building/${data.object.id}`);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recognition failed');
    } finally {
      setRecognizing(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recognize</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo preview */}
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="add-a-photo" size={64} color="#ccc" />
            <Text style={styles.placeholderText}>Take or select a photo of a building</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <MaterialIcons name="camera-alt" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickFromGallery}>
            <MaterialIcons name="photo-library" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {recognizing && (
          <View style={styles.resultBlock}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.recognizingText}>Recognizing building...</Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.resultBlock}>
            <MaterialIcons name="error-outline" size={24} color="#c00" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result */}
        {result && !recognizing && !result.object && (
          <View style={styles.resultBlock}>
            <MaterialIcons name="info-outline" size={32} color="#666" />
            <Text style={styles.notFoundTitle}>Not found in database</Text>
            <Text style={styles.notFoundClass}>
              Recognized class: {result.class_name}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.select({ ios: 'system-ui', default: 'sans-serif' }),
  },
  headerSpacer: {
    width: 40,
  },
  // Placeholder
  placeholder: {
    height: 320,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Preview
  previewContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 320,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // Result
  resultBlock: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
  },
  recognizingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  notFoundClass: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#c00',
    textAlign: 'center',
  },
});
