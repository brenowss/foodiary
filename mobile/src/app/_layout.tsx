import {
  HostGrotesk_400Regular,
  HostGrotesk_500Medium,
  HostGrotesk_600SemiBold,
  HostGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/host-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootLayout() {
  const { isLoggedIn, isLoading } = useAuth();

  const [loaded, error] = useFonts({
    HostGrotesk_400Regular,
    HostGrotesk_500Medium,
    HostGrotesk_600SemiBold,
    HostGrotesk_700Bold,
  });

  useEffect(() => {
    const isFontLoaded = loaded || error;
    const isUserLoaded = !isLoading;

    if (isFontLoaded && isUserLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(private)" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
    </Stack>
  );
}