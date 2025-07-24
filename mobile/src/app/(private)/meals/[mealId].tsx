import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Logo } from '../../../components/Logo';
import { httpClient } from '../../../services/httpClient';
import { formatMealDate } from '../../../utils/formatMealDate';

type Meal = {
  id: string;
  createdAt: string;
  icon: string;
  name: string;
  status: 'uploading' | 'processing' | 'success' | 'failed';
  foods: {
    name: string;
    quantity: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  }[];
}

export default function MealDetails() {
  const { mealId } = useLocalSearchParams();

  const { data: meal, isFetching } = useQuery({
    queryKey: ['meal', mealId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data } = await httpClient.get<{ meal: Meal }>(`/meals/${mealId}`);

      return data.meal;
    },
    refetchInterval: (query) => {
      if (query.state.data?.status === 'success') {
        return false;
      }

      return 2_000;
    },
  });

  if (isFetching || meal?.status !== 'success') {
    return (
      <View className="bg-lime-700 flex-1 items-center justify-center gap-12">
        <Logo width={187} height={60} />
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  // Calcular totais nutricionais
  const totals = meal.foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      proteins: acc.proteins + food.proteins,
      carbohydrates: acc.carbohydrates + food.carbohydrates,
      fats: acc.fats + food.fats,
    }),
    { calories: 0, proteins: 0, carbohydrates: 0, fats: 0 }
  );

  // Formatação de números para melhor legibilidade
  const formatNumber = (num: number, decimals: number = 1) => {
    return decimals === 0 ? Math.round(num).toString() : num.toFixed(decimals);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: meal.name,
          headerBackTitle: 'Voltar',
          headerBackTitleStyle: {
            fontSize: 16,
          },
          headerBackButtonDisplayMode: 'minimal',
          headerStyle: {
            backgroundColor: '#f8fafc',
          },
          headerTintColor: '#0f172a',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 16,
          },
          headerShadowVisible: false,
        }}
      />

      <ScrollView className="flex-1 bg-slate-50">
        {/* Hero Section */}
        <View className="items-center pt-8 pb-12 px-4">
          <View className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100">
            <Text className="text-8xl text-center mb-4">{meal.icon}</Text>
            <Text className="text-slate-600 text-center text-base font-medium">
              {formatMealDate(new Date(meal.createdAt))}
            </Text>
          </View>
        </View>

        {/* Nutritional Overview */}
        <View className="px-4 mb-12">
          <Text className="text-slate-800 text-xl font-bold mb-8 text-center">
            Informações Nutricionais
          </Text>

          <View className="gap-6">
            {/* Calorias - Destaque Principal */}
            <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border-l-4 border-orange-400">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-orange-700 text-sm font-medium uppercase tracking-wide">
                    Energia Total
                  </Text>
                  <Text className="text-orange-900 text-3xl font-bold mt-1">
                    {formatNumber(totals.calories, 0)} kcal
                  </Text>
                </View>
                <Text className="text-orange-400 text-4xl">🔥</Text>
              </View>
            </View>

            {/* Macronutrientes */}
            <View className="flex-row gap-4">
              <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <Text className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-2">
                  Proteínas
                </Text>
                <Text className="text-blue-900 text-xl font-bold">
                  {formatNumber(totals.proteins)}g
                </Text>
              </View>

              <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-100">
                <Text className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">
                  Carboidratos
                </Text>
                <Text className="text-green-900 text-xl font-bold">
                  {formatNumber(totals.carbohydrates)}g
                </Text>
              </View>

              <View className="flex-1 bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <Text className="text-yellow-600 text-xs font-semibold uppercase tracking-wide mb-2">
                  Gorduras
                </Text>
                <Text className="text-yellow-900 text-xl font-bold">
                  {formatNumber(totals.fats)}g
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Foods List */}
        <View className="px-4 pb-8">
          <Text className="text-slate-800 text-xl font-bold mb-6 text-center">
            Composição da Refeição
          </Text>
          <Text className="text-slate-500 text-center text-sm mb-8">
            {meal.foods.length} {meal.foods.length === 1 ? 'alimento identificado' : 'alimentos identificados'}
          </Text>

          <View className="gap-6">
            {meal.foods.map((food, index) => (
              <View
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <View className="mb-4">
                  <Text className="text-slate-800 text-lg font-semibold mb-1">
                    {food.name}
                  </Text>
                  <Text className="text-slate-500 text-sm">
                    {food.quantity}
                  </Text>
                </View>

                {/* Valor Calórico Principal */}
                <View className="bg-orange-50 rounded-xl p-4 mb-4 border border-orange-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-orange-700 text-sm font-medium">
                      Energia
                    </Text>
                    <Text className="text-orange-900 text-xl font-bold">
                      {food.calories} kcal
                    </Text>
                  </View>
                </View>

                {/* Detalhes Nutricionais */}
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                      <Text className="text-blue-700 text-xs font-bold">P</Text>
                    </View>
                    <Text className="text-blue-700 text-sm font-semibold">
                      {formatNumber(food.proteins)}g
                    </Text>
                    <Text className="text-slate-400 text-xs">Proteínas</Text>
                  </View>

                  <View className="items-center">
                    <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                      <Text className="text-green-700 text-xs font-bold">C</Text>
                    </View>
                    <Text className="text-green-700 text-sm font-semibold">
                      {formatNumber(food.carbohydrates)}g
                    </Text>
                    <Text className="text-slate-400 text-xs">Carboidratos</Text>
                  </View>

                  <View className="items-center">
                    <View className="bg-yellow-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                      <Text className="text-yellow-700 text-xs font-bold">G</Text>
                    </View>
                    <Text className="text-yellow-700 text-sm font-semibold">
                      {formatNumber(food.fats)}g
                    </Text>
                    <Text className="text-slate-400 text-xs">Gorduras</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}