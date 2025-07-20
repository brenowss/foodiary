import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  withDelay,
  useDerivedValue,
  runOnJS
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface IArcProps {
  percentage: number;
  color: string;
  radius: number;
  strokeWidth: number;
  baseStrokeColor?: string;
  className?: string;
  delay?: number;
}

function Arc({
  percentage,
  color,
  radius,
  strokeWidth,
  className,
  delay = 0,
}: IArcProps) {
  const semiCircumference = Math.PI * radius;
  const animatedPercentage = useSharedValue(0);

  useEffect(() => {
    animatedPercentage.value = withDelay(
      delay,
      withTiming(percentage, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [percentage, delay]);

  const animatedProps = useAnimatedProps(() => {
    const arcLength = (animatedPercentage.value / 100) * semiCircumference;
    return {
      strokeDasharray: [arcLength, semiCircumference],
    };
  });

  const arcDraw = `M ${strokeWidth / 2},${radius + strokeWidth / 2}
                   A ${radius},${radius} 0 0,1 ${radius * 2 + strokeWidth / 2},${radius + strokeWidth / 2}`;

  return (
    <View className={cn(className)}>
      <Svg
        width={radius * 2 + strokeWidth}
        height={radius + strokeWidth}
      >
        <Path
          d={arcDraw}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          strokeDasharray={semiCircumference}
          strokeLinecap="round"
        />

        <AnimatedPath
          d={arcDraw}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

interface AnimatedNumberProps {
  value: number;
  delay?: number;
  className?: string;
  suffix?: string;
}

function AnimatedNumber({ value, delay = 0, className, suffix = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withDelay(
      delay,
      withTiming(value, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [value, delay]);

  useDerivedValue(() => {
    runOnJS(setDisplayValue)(Math.round(animatedValue.value));
  });

  return (
    <Text className={className}>
      {displayValue}{suffix}
    </Text>
  );
}

type MacroProgress = {
  goal: number;
  current: number;
}

interface IGoalArcsProps {
  calories: MacroProgress;
  proteins: MacroProgress;
  carbohydrates: MacroProgress;
  fats: MacroProgress;
}

export function DailyStats({
  calories,
  carbohydrates,
  fats,
  proteins,
}: IGoalArcsProps) {
  return (
    <View className="items-center justify-center">
      <View className="items-center relative min-h-[172px]">
        <Arc
          percentage={calcMacroPercentage(calories)}
          color="#FF5736"
          radius={160}
          strokeWidth={12}
          delay={0}
        />
        <Arc
          percentage={calcMacroPercentage(proteins)}
          color="#2A9D90"
          radius={140}
          strokeWidth={12}
          className="absolute top-[20]"
          delay={200}
        />
        <Arc
          percentage={calcMacroPercentage(carbohydrates)}
          color="#E8C468"
          radius={120}
          strokeWidth={12}
          className="absolute top-[40]"
          delay={400}
        />
        <Arc
          percentage={calcMacroPercentage(fats)}
          color="#F4A462"
          radius={100}
          strokeWidth={12}
          className="absolute top-[60]"
          delay={600}
        />

        <View className="-mt-16 items-center justify-center">
          <Text>
            <AnimatedNumber
              value={calories.current}
              delay={0}
              className="font-sans-bold text-support-tomato text-xl"
            />
            <Text className="text-base text-gray-700"> / {calories.goal}</Text>
          </Text>

          <Text className="text-gray-700 mt-1 text-center font-sans-regular text-sm">
            Calorias
          </Text>
        </View>
      </View>

      <View className="p-4 w-full flex-row items-center justify-between">
        <View className="items-center w-1/3 justify-center">
          <Text className="font-sans-bold text-support-teal text-base">
            <AnimatedNumber
              value={proteins.current}
              delay={200}
              suffix="g"
            />
            <Text className="text-sm text-gray-700"> / {proteins.goal}g</Text>
          </Text>
          <Text className="text-sm text-gray-700">Proteínas</Text>
        </View>

        <View className="items-center w-1/3 justify-center">
          <Text className="font-sans-bold text-support-yellow text-base">
            <AnimatedNumber
              value={carbohydrates.current}
              delay={400}
              suffix="g"
            />
            <Text className="text-sm text-gray-700"> / {carbohydrates.goal}g</Text>
          </Text>
          <Text className="text-sm text-gray-700">Carboidratos</Text>
        </View>

        <View className="items-center w-1/3 justify-center">
          <Text className="font-sans-bold text-support-orange text-base">
            <AnimatedNumber
              value={fats.current}
              delay={600}
              suffix="g"
            />
            <Text className="text-sm text-gray-700"> / {fats.goal}g</Text>
          </Text>
          <Text className="text-sm text-gray-700">Gorduras</Text>
        </View>
      </View>
    </View>
  );
}

function calcMacroPercentage({ goal, current }: MacroProgress) {
  const percentage = (current / goal) * 100;
  return Math.min(percentage, 100);
}