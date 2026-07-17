import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    // Root stack routes vary; keep this loosely typed for AuthGate helpers.
    (navigationRef as any).navigate(name, params);
  }
}

/** Open the dedicated Login screen inside Auth. */
export function goToSignIn() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: 'Auth',
          state: {
            routes: [{ name: 'Login' }],
            index: 0,
          },
        },
      ],
    })
  );
}
