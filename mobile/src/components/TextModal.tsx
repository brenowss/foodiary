import { StatusBar } from 'expo-status-bar';
import { CheckIcon, MessageCircleIcon, XIcon } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useCreateMealFromText } from '../hooks/useCreateMealFromText';
import { colors } from '../styles/colors';
import { Button } from './Button';
import { Input } from './Input';

interface ITextModalProps {
  open: boolean;
  onClose: () => void;
}

export function TextModal({ onClose, open }: ITextModalProps) {
  const [text, setText] = useState<string>('');

  const { createMealFromText, isLoading } = useCreateMealFromText({
    onSuccess: (mealId: string) => {
      router.push(`/meals/${mealId}`);
      handleCloseModal();
    },
  });

  function handleCloseModal() {
    setText('');
    onClose();
  }

  function handleSubmit() {
    if (text.trim()) {
      createMealFromText(text.trim());
    }
  }

  return (
    <Modal
      transparent
      statusBarTranslucent
      onRequestClose={handleCloseModal}
      visible={open}
      animationType="slide"
    >
      <StatusBar style="light" />

      <SafeAreaProvider>
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            className="flex-1"
            behavior="height"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <Pressable className="bg-black/50 flex-1">
              <View className="bg-black flex-1 mt-20 rounded-t-3xl">
                <View className="flex-row p-5 border-b border-gray-800">
                  <Button size="icon" color="dark" onPress={handleCloseModal}>
                    <XIcon size={20} color={colors.gray[500]} />
                  </Button>
                  <Text className="flex-1 text-white text-lg font-sans-medium text-center mr-12">
                    Descrever Refeição
                  </Text>
                </View>

                <ScrollView className="flex-1 p-5">
                  <View className="items-center mb-6">
                    <View className="size-20 bg-lime-600/10 rounded-full items-center justify-center mb-4">
                      <MessageCircleIcon size={32} color={colors.lime[600]} />
                    </View>
                    <Text className="text-white text-lg font-sans-medium mb-2">
                      Conte-nos sobre sua refeição
                    </Text>
                    <Text className="text-gray-400 text-sm text-center px-4">
                      Descreva os alimentos que você consumiu, suas quantidades e qualquer detalhe adicional
                    </Text>
                  </View>

                  <Input
                    placeholder="Ex: 150g de arroz integral, 100g de frango grelhado, salada verde com tomate..."
                    value={text}
                    onChangeText={setText}
                    multiline
                    numberOfLines={8}
                    className="text-white border-gray-600 bg-gray-900/50 min-h-[200px]"
                    placeholderTextColor={colors.gray[400]}
                    style={{ textAlignVertical: 'top' }}
                  />

                  <Text className="text-gray-500 text-xs mt-3 text-center">
                    💡 Dica: Seja específico sobre quantidades e tipos de alimentos para uma análise mais precisa
                  </Text>
                </ScrollView>

                <View className="p-5 pt-2 border-t border-gray-800">
                  <Button
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={!text.trim()}
                    className="w-full"
                  >
                    <View className="flex-row items-center gap-2">
                      <CheckIcon size={20} color={colors.black[700]} />
                      <Text className="text-black-700 font-sans-medium">
                        Processar Refeição
                      </Text>
                    </View>
                  </Button>
                </View>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
} 