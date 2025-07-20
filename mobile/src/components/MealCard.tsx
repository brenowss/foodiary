import { Text, TouchableOpacity, View } from 'react-native';

export function MealCard() {
  return (
    <TouchableOpacity>
      <Text className="text-base font-sans-regular text-gray-700">
        Hoje, 12h25
      </Text>

      <View className="mt-2 px-4 py-5 flex-row gap-3 items-center border border-gray-400 rounded-2xl">
        <View className="size-12 bg-gray-200 rounded-full items-center justify-center">
          <Text>🔥</Text>
        </View>

        <View>
          <Text className="text-base font-sans-regular text-gray-700">
            Café da manhã
          </Text>
          <Text className="text-base font-sans-medium text-black-700">
            Pão
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}