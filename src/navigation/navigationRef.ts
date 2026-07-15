import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    // Root stack routes vary; keep this loosely typed for AuthGate helpers.
    (navigationRef as any).navigate(name, params);
  }
}

/** Only sign-in UI: Welcome last slide (Continue with Google) */
export function goToSignIn() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: 'Auth',
          state: {
            routes: [{ name: 'Welcome', params: { startAtEnd: true } }],
            index: 0,
          },
        },
      ],
    })
  );
}
