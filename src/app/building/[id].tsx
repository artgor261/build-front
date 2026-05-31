import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchObjectById } from '@/api/client';
import { ObjectResponse } from '@/api/types';

export default function BuildingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [building, setBuilding] = useState<ObjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (id) loadBuilding();
  }, [id]);

  async function loadBuilding() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchObjectById(Number(id));
      setBuilding(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load building');
    } finally {
      setLoading(false);
    }
  }

  const handleBack = useCallback(() => {
    router.replace('/');
  }, [router]);

  const handleCopyAddress = useCallback(async () => {
    if (building?.name) {
      await Clipboard.setStringAsync(building.name);
      Alert.alert('Copied', 'Building name copied to clipboard');
    }
  }, [building]);

  const subtitle = building?.style || 'Historical building';

  const rawPhoto = building?.image_base64;
  const photoUri = rawPhoto
    ? rawPhoto.startsWith('data:')
      ? rawPhoto
      : `data:image/jpeg;base64,${rawPhoto}`
    : null;

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !building) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error || 'Building not found'}</Text>
        <TouchableOpacity onPress={loadBuilding} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo */}
        <TouchableOpacity
          style={styles.photoContainer}
          activeOpacity={1}
          onPress={() => photoUri && setFullscreen(true)}
        >
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="photo-library" size={48} color="#bbb" />
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Name row */}
        <View style={styles.nameRow}>
          <View style={styles.nameBlock}>
            <Text style={styles.buildingName}>{building.name}</Text>
            <Text style={styles.buildingStyle}>{subtitle}</Text>
            {building.address ? (
              <Text style={styles.buildingAddress}>{building.address}</Text>
            ) : null}
          </View>
          {/* Copy + Route icons */}
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleCopyAddress}>
              <MaterialIcons name="content-copy" size={14} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="directions" size={14} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Year and Architect */}
        {(building.year_built || building.architect) ? (
          <View style={styles.metaRow}>
            {building.year_built ? (
              <View style={styles.metaItem}>
                <MaterialIcons name="calendar-today" size={14} color="#666" />
                <Text style={styles.metaText}>{building.year_built}</Text>
              </View>
            ) : null}
            {building.architect ? (
              <View style={styles.metaItem}>
                <MaterialIcons name="person" size={14} color="#666" />
                <Text style={styles.metaText}>{building.architect}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Description */}
        {building.description ? (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {building.description}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Fullscreen photo */}
      <Modal
        visible={fullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          <StatusBar hidden />
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={() => setFullscreen(false)}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Photo
  photoContainer: {
    height: 400,
    backgroundColor: '#E8E8E8',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 13,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Name row
  nameRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  nameBlock: {
    flex: 1,
  },
  buildingName: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'system-ui', default: 'sans-serif' }),
    color: '#000',
    lineHeight: 29,
  },
  buildingStyle: {
    fontSize: 16,
    color: '#828282',
    marginTop: 4,
  },
  buildingAddress: {
    fontSize: 16,
    color: '#000',
    marginTop: 6,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(217,217,217,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Meta row (year, architect)
  metaRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  // Description
  descriptionBox: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: 'rgba(217,217,217,0.34)',
    borderRadius: 8,
    padding: 14,
    position: 'relative',
  },
  descriptionText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  // Error / Retry
  errorText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Fullscreen
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});
