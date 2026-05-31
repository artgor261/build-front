import { MaterialIcons } from '@expo/vector-icons';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { fetchObjects } from '@/api/client';
import { ObjectResponse } from '@/api/types';

const LeafletMap = lazy(() => import('@/components/leaflet-map'));

const MOSCOW_CENTER: [number, number] = [55.7558, 37.6173];

let mapRef: { flyTo: (center: [number, number], zoom: number, opts?: Record<string, unknown>) => void } | null = null;

function MapFallback() {
  return (
    <View style={styles.mapFallback}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}

export default function MapScreenWeb() {
  const router = useRouter();
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

  const handleMapReady = useCallback((map: typeof mapRef) => {
    mapRef = map;
  }, []);

  const handleMyLocation = useCallback(() => {
    mapRef?.flyTo(MOSCOW_CENTER, 12, { duration: 0.5 });
  }, []);

  const handleMarkerPress = useCallback((id: number) => {
    router.push(`/building/${id}`);
  }, [router]);

  return (
    <View style={styles.container}>
      <Suspense fallback={<MapFallback />}>
        <LeafletMap objects={objects} onMapReady={handleMapReady} onMarkerPress={handleMarkerPress} />
      </Suspense>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.smallButton}>
          <MaterialIcons name="sort" size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.photoButton} onPress={() => router.push({ pathname: '/camera' })}>
          <MaterialIcons name="photo-camera" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={handleMyLocation}>
          <MaterialIcons name="my-location" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      {error && (
        <View style={styles.centerOverlay} pointerEvents="box-none">
          <View style={styles.errorBox} pointerEvents="auto">
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
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 40,
    zIndex: 1000,
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
      default: {
        boxShadow: '0 2px 3px rgba(0,0,0,0.15)',
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
      default: {
        boxShadow: '0 4px 5px rgba(0,0,0,0.3)',
      },
    }),
  },
  centerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
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
      default: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
