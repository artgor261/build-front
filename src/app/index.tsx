import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchObjects } from '@/api/client';
import { ObjectResponse } from '@/api/types';

const MOSCOW_REGION: Region = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.08,
  longitudeDelta: 0.04,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [objects, setObjects] = useState<ObjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadObjects();
  }, []);

  async function loadObjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchObjects();
      setObjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  }

  const objectsWithCoords = objects.filter(
    (obj) => obj.latitude != null && obj.longitude != null
  );

  const handleMyLocation = useCallback(() => {
    mapRef.current?.animateToRegion(MOSCOW_REGION, 500);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={MOSCOW_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {objectsWithCoords.map((obj) => (
          <Marker
            key={obj.id}
            coordinate={{
              latitude: obj.latitude!,
              longitude: obj.longitude!,
            }}
            title={obj.name}
            description={obj.address}
          >
            <View style={styles.marker}>
              <MaterialIcons name="account-balance" size={14} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { top: insets.top + 12 }]}>
        <View style={styles.searchInner}>
          <MaterialIcons
            name="search"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search building"
            placeholderTextColor="#999"
            editable={false}
          />
          <TouchableOpacity style={styles.searchClear}>
            <MaterialIcons name="close" size={16} color="#1E1E1E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { bottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.smallButton}>
          <MaterialIcons name="sort" size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.photoButton}>
          <MaterialIcons name="photo-camera" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={handleMyLocation}>
          <MaterialIcons name="my-location" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centerOverlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.centerOverlay}>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadObjects} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
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
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'system-ui', default: 'normal' }),
    color: '#1E1E1E',
  },
  searchClear: {
    padding: 2,
  },
  bottomControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 40,
  },
  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  photoButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  centerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
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
