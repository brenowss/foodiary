import { View } from "react-native";
import { HomeHeader } from '../../components/HomeHeader';
import { MealsList } from '../../components/MealsList';
import { FloatingCreateMealButton } from "../../components/FloatingCreateMealButton";

export default function Page() {
  return (
    <View className="flex-1 bg-white">
      <HomeHeader />
      <MealsList />

      <FloatingCreateMealButton />
    </View>
  );
}