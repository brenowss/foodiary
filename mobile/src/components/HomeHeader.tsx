import { LogOutIcon } from "lucide-react-native";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../styles/colors";

export function HomeHeader() {
  return (
    <View className="bg-lime-400 h-32">
      <SafeAreaView className="flex-row items-center justify-between px-4">
        <View>
          <Text className="text-gray-700 text-sm font-sans-regular">Olá, 👋</Text>
          <Text className="text-black-700 text-base font-sans-semibold">Breno</Text>
        </View>

        <TouchableOpacity className="size-12 items-center justify-center">
          <LogOutIcon size={20} color={colors.black[700]} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}