import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

import { fetchObjectById } from '@/api/client';
import { ObjectResponse } from '@/api/types';

export default function BuildingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [building, setBuilding] = useState<ObjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(true);

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

  const handleCopyAddress = useCallback(() => {
    if (building?.address) {
      Alert.alert('Copied', 'Address copied to clipboard');
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
      {/* Search / Close bar */}
      <View style={[styles.searchBar, { top: insets.top + 12 }]} pointerEvents="box-none">
        <View style={styles.searchInner} pointerEvents="auto">
          <MaterialIcons name="search" size={18} color="#999" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search building</Text>
          <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
            <MaterialIcons name="close" size={16} color="#1E1E1E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo */}
        <View style={styles.photoContainer}>
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
        </View>

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
            {building.address ? (
              <TouchableOpacity style={styles.iconButton} onPress={handleCopyAddress}>
                <MaterialIcons name="content-copy" size={14} color="#000" />
              </TouchableOpacity>
            ) : null}
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
            <Text
              style={styles.descriptionText}
              numberOfLines={descriptionExpanded ? undefined : 3}
            >
              {building.description}
            </Text>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setDescriptionExpanded(!descriptionExpanded)}
            >
              <MaterialIcons
                name={descriptionExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={18}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
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
  // Search bar
  searchBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    height: 49,
    paddingHorizontal: 12,
    width: 182,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      default: {
        boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  closeButton: {
    padding: 2,
  },
  // Photo
  photoContainer: {
    height: 287,
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
    paddingRight: 20,
  },
  expandButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
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
});
