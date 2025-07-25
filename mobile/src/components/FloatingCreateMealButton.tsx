import { CameraIcon, MicIcon, PlusIcon, XIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioModal } from './AudioModal';
import { CameraModal } from './CameraModal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingCreateMealButton() {
  const { bottom } = useSafeAreaInsets();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const rotation = useSharedValue(0);
  const micScale = useSharedValue(0);
  const cameraScale = useSharedValue(0);
  const micTranslateY = useSharedValue(0);
  const cameraTranslateY = useSharedValue(0);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    if (newExpanded) {
      rotation.value = withSpring(45);
      micScale.value = withSpring(1, { damping: 12 });
      cameraScale.value = withTiming(1, { duration: 300 });
      micTranslateY.value = withSpring(-80);
      cameraTranslateY.value = withSpring(-150);
    } else {
      rotation.value = withSpring(0);
      micScale.value = withTiming(0, { duration: 200 });
      cameraScale.value = withTiming(0, { duration: 200 });
      micTranslateY.value = withSpring(0);
      cameraTranslateY.value = withSpring(0);
    }
  };

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: micScale.value },
      { translateY: micTranslateY.value },
    ],
  }));

  const cameraButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cameraScale.value },
      { translateY: cameraTranslateY.value },
    ],
  }));

  const handleMicPress = () => {
    setIsAudioModalOpen(true);
    toggleExpanded();
  };

  const handleCameraPress = () => {
    setIsCameraModalOpen(true);
    toggleExpanded();
  };

  return (
    <>
      {/* Backdrop overlay quando expandido */}
      {isExpanded && (
        <Pressable
          className="absolute inset-0 bg-black/20 z-40"
          onPress={toggleExpanded}
        />
      )}

      <View
        className="absolute z-50"
        style={{
          right: 20,
          bottom: 20 + bottom
        }}
      >
        {/* Botão do Microfone */}
        <AnimatedPressable
          style={micButtonStyle}
          className="absolute w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
          onPress={handleMicPress}
        >
          <MicIcon size={24} color="white" />
        </AnimatedPressable>

        {/* Botão da Câmera */}
        <AnimatedPressable
          style={cameraButtonStyle}
          className="absolute w-14 h-14 bg-green-500 rounded-full items-center justify-center shadow-lg"
          onPress={handleCameraPress}
        >
          <CameraIcon size={24} color="white" />
        </AnimatedPressable>

        {/* Botão Principal */}
        <AnimatedPressable
          style={mainButtonStyle}
          className="w-16 h-16 bg-lime-500 rounded-full items-center justify-center shadow-xl"
          onPress={toggleExpanded}
        >
          {isExpanded ? (
            <XIcon size={28} color="white" />
          ) : (
            <PlusIcon size={28} color="white" />
          )}
        </AnimatedPressable>
      </View>

      <AudioModal
        open={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />

      <CameraModal
        open={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />
    </>
  );
}