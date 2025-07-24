import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface IMealCardProps {
  id: string;
  createdAt: Date;
  icon: string;
  name: string;
  foods: { name: string }[];
}

export function MealCard({
  foods,
  icon,
  id,
  name,
}: IMealCardProps) {
  return (
    <Link href={`/meals/${id}`} asChild>
      <TouchableOpacity>
        <View className="px-4 py-5 flex-row gap-3 items-center border border-gray-400 rounded-2xl">
          <View className="size-12 bg-gray-200 rounded-full items-center justify-center">
            <Text>{icon}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-base font-sans-medium text-gray-800 mb-1">
              {name}
            </Text>
            <Text
              className="text-sm font-sans-regular text-gray-600"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {foods.map(({ name }) => name).join(', ')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}