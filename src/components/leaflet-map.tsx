import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { ObjectResponse } from '@/api/types';

const buildingIcon = L.divIcon({
  html:
    '<div style="width:24px;height:24px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px">🏛</div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const MOSCOW_CENTER: L.LatLngTuple = [55.7558, 37.6173];

let mapInstance: L.Map | null = null;

function MapEvents() {
  useMap();
  return null;
}

interface Props {
  objects: ObjectResponse[];
  onMapReady: (map: L.Map) => void;
}

export default function LeafletMap({ objects, onMapReady }: Props) {
  const readyRef = useRef(false);

  const objectsWithCoords = objects.filter(
    (obj) => obj.latitude != null && obj.longitude != null
  );

  return (
    <MapContainer
      center={MOSCOW_CENTER}
      zoom={12}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
      ref={(map) => {
        if (map && !readyRef.current) {
          readyRef.current = true;
          mapInstance = map;
          onMapReady(map);
        }
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />
      {objectsWithCoords.map((obj) => (
        <Marker
          key={obj.id}
          position={[obj.latitude!, obj.longitude!]}
          icon={buildingIcon}
        >
          <Popup>
            <div style={{ fontFamily: 'system-ui, sans-serif' }}>
              <strong>{obj.name}</strong>
              {obj.address ? <p style={{ margin: '4px 0 0' }}>{obj.address}</p> : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export { MOSCOW_CENTER, mapInstance };
