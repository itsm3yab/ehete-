import * as Location from 'expo-location';
import { Platform } from 'react-native';

export type ResolvedLocation = {
  placeLabel: string;
  latitude: number | null;
  longitude: number | null;
};

const FALLBACK: ResolvedLocation = {
  placeLabel: 'Nearby (location unavailable)',
  latitude: null,
  longitude: null,
};

/** Get a rough place label for distress — never blocks SOS if GPS fails */
export async function resolveDistressLocation(): Promise<ResolvedLocation> {
  try {
    const { status: current } = await Location.getForegroundPermissionsAsync();
    let status = current;
    if (status !== 'granted') {
      const req = await Location.requestForegroundPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return FALLBACK;

    let coords: Location.LocationObjectCoords | null = null;
    const last = await Location.getLastKnownPositionAsync();
    if (last?.coords) {
      coords = last.coords;
    } else {
      const currentPos = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy:
            Platform.OS === 'android'
              ? Location.Accuracy.Balanced
              : Location.Accuracy.High,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      coords = currentPos?.coords ?? null;
    }

    if (!coords) return FALLBACK;

    let placeLabel = `Near you · ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      const p = places[0];
      if (p) {
        const bits = [p.street, p.district, p.city || p.subregion].filter(Boolean);
        if (bits.length) placeLabel = bits.join(', ');
      }
    } catch {
      // keep coordinate label
    }

    return {
      placeLabel,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  } catch {
    return FALLBACK;
  }
}
