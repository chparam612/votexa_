import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  score: number; // 0-100
  level: string;
}

export default function RiskGauge({ score, level }: Props) {
  const animatedScore = useSharedValue(0);

  useEffect(() => {
    animatedScore.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  let colorClass = 'bg-green-500';
  let textClass = 'text-green-600';

  if (level === 'CRITICAL') {
    colorClass = 'bg-red-700';
    textClass = 'text-red-700';
  } else if (level === 'HIGH') {
    colorClass = 'bg-red-500';
    textClass = 'text-red-600';
  } else if (level === 'MEDIUM') {
    colorClass = 'bg-yellow-500';
    textClass = 'text-yellow-600';
  }

  const widthStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedScore.value}%`,
    };
  });

  return (
    <View
      className="bg-white p-6 rounded-2xl shadow-sm items-center"
      accessibilityLabel={`Current dropoff risk: ${score} percent. Level: ${level}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: score }}
      accessibilityLiveRegion="polite"
    >
      <Text
        className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-widest"
        accessibilityRole="header"
      >
        Dropoff Risk
      </Text>
      <View className="flex-row items-baseline mb-4">
        <Text className={`text-5xl font-black ${textClass}`}>{score}</Text>
        <Text className={`text-xl font-bold ml-1 ${textClass}`}>%</Text>
      </View>

      <View className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
        <Animated.View className={`h-full rounded-full ${colorClass}`} style={widthStyle} />
      </View>

      <Text className={`mt-4 font-bold ${textClass}`}>{level} RISK LEVEL</Text>
    </View>
  );
}
