import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Home, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import StatsIcon from '../assets/icons/stats';

export function BottomTabNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const getIconColor = (route: string) => {
    if (route === '/') {
      return pathname === '/' ? '#10B981' : '#6B7280';
    }

    return pathname.startsWith(route) ? '#10B981' : '#6B7280';
  };

  return (
    <View className="absolute bottom-6 left-5 right-5 bg-white rounded-2xl shadow-lg border border-gray-100">
      <View className="flex-row justify-around items-center py-3">
        <TouchableOpacity
          className="flex-1 items-center py-2"
          onPress={() => {
            router.push('/(private)/');
          }}
        >
          <Home size={24} color={getIconColor('/')} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center py-2"
          onPress={() => {
            router.push('/(private)/meals');
          }}
        >
          <StatsIcon width={24} height={24} color={getIconColor('/meals')} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center py-2"
          onPress={() => {
            router.push('/(private)/profile');
          }}
        >
          <User size={24} color={getIconColor('/profile')} />
        </TouchableOpacity>
      </View>
    </View>
  );
} 