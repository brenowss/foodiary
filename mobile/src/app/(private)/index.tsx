import { View, Text, ScrollView, Image } from "react-native";
import { getGreetingMessage } from "../../utils/getGreetingMessage";
import { formatDateForDashboard } from "../../utils/formatDate";

export default function Page() {
  const greeting = getGreetingMessage();

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <View className="flex-row items-center mb-2">
          <View>
            <Text className="text-lg font-semibold text-gray-800">{greeting.message} {greeting.emoji}</Text>

            {/* TODO: Add weight tracking feature */}
            <Text className="text-sm text-gray-600">You've gain 2kg yesterday keep it up!</Text>
          </View>
        </View>

        {/* Date */}
        <View className="flex-row items-center mt-4">
          <Text className="text-base font-medium text-gray-700">📅 {formatDateForDashboard()}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="px-6 mb-6">
        <View className="flex-row flex-wrap justify-between">
          {/* Water Card */}
          <View className="w-[48%] bg-blue-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-medium mb-2">Water</Text>
            <View className="h-20 bg-blue-200 rounded-xl mb-2 items-center justify-center">
              <View className="w-full h-8 bg-blue-400 rounded-lg opacity-70"></View>
            </View>
            <Text className="text-lg font-bold text-gray-800">2100 ml</Text>
            <Text className="text-xs text-gray-600">Daily goal 3.5L</Text>
          </View>

          {/* Weight Card */}
          <View className="w-[48%] bg-orange-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-medium mb-2">Weight</Text>
            <View className="h-20 rounded-xl mb-2 items-center justify-center">
              <View className="w-16 h-16 rounded-full border-8 border-orange-300 items-center justify-center">
                <View className="w-8 h-8 bg-orange-500 rounded-full"></View>
              </View>
            </View>
            <Text className="text-lg font-bold text-gray-800">75 kg</Text>
            <Text className="text-xs text-gray-600">Goal 65kg</Text>
          </View>

          {/* Calories Card */}
          <View className="w-[48%] bg-green-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-medium mb-2">Calories</Text>
            <View className="h-20 rounded-xl mb-2 items-center justify-center">
              <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center">
                <Text className="text-white text-lg">🔥</Text>
              </View>
            </View>
            <Text className="text-lg font-bold text-gray-800">750 kcal</Text>
            <Text className="text-xs text-gray-600">Left 2500 kcal</Text>
          </View>

          {/* BPM Card */}
          <View className="w-[48%] bg-pink-100 rounded-2xl p-4 mb-4">
            <Text className="text-gray-700 font-medium mb-2">BPM</Text>
            <View className="h-20 rounded-xl mb-2 items-center justify-center">
              <View className="flex-row items-center">
                <Text className="text-pink-500 text-2xl">❤️</Text>
                <View className="ml-2">
                  <View className="w-8 h-1 bg-pink-400 mb-1"></View>
                  <View className="w-6 h-1 bg-pink-300 mb-1"></View>
                  <View className="w-10 h-1 bg-pink-500"></View>
                </View>
              </View>
            </View>
            <Text className="text-lg font-bold text-gray-800">105 bpm</Text>
            <Text className="text-xs text-gray-600">Last check 2d</Text>
          </View>
        </View>
      </View>

      {/* Today's Meal Section */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-800">Today's meal 🥗</Text>
          <View className="flex-row items-center">
            <Text className="text-pink-500 font-medium mr-1">New plan</Text>
            <Text className="text-pink-500">✏️</Text>
          </View>
        </View>

        {/* Breakfast Card */}
        <View className="bg-yellow-100 rounded-2xl p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">Breakfast</Text>
              <Text className="text-sm text-gray-600 mb-3">Br</Text>
              <View className="flex-row items-center">
                <Text className="text-yellow-600">🔥</Text>
                <Text className="text-sm font-medium text-gray-700 ml-1">245 kcal</Text>
              </View>
            </View>
            <View className="relative">
              <View className="w-20 h-20 bg-yellow-200 rounded-xl items-center justify-center">
                <Text className="text-2xl">🥞</Text>
              </View>
              {/* Status indicators */}
              <View className="absolute -top-2 -right-2 flex-row">
                <View className="w-6 h-6 bg-orange-400 rounded-full mr-1 items-center justify-center">
                  <Text className="text-white text-xs">🏠</Text>
                </View>
                <View className="w-6 h-6 bg-gray-300 rounded-full mr-1 items-center justify-center">
                  <Text className="text-white text-xs">📊</Text>
                </View>
                <View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center">
                  <Text className="text-white text-xs">👤</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}