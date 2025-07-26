import { Stack } from 'expo-router';
import { View } from 'react-native';
import { BottomTabNavigation } from '../../components/BottomTabNavigation';

export default function Layout() {
  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
      <BottomTabNavigation />
    </View>
  );
}