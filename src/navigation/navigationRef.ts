import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    // Root stack routes vary; keep this loosely typed for AuthGate helpers.
    (navigationRef as any).navigate(name, params);
  }
}
