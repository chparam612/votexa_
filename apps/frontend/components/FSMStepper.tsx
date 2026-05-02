import React from 'react';
import { View, Text } from 'react-native';
import { STATE_META, VoterState } from '../../../packages/algorithms/src/StateMachine';

interface Props {
  currentState: string;
}

const STATES_ORDER: VoterState[] = ['NOT_REGISTERED', 'REGISTERED', 'VERIFIED', 'READY', 'VOTED'];

export default function FSMStepper({ currentState }: Props) {
  const currentIndex = STATES_ORDER.indexOf(currentState as VoterState) || 0;

  // Quick fallback if state is START or DISQUALIFIED
  if (currentState === 'DISQUALIFIED') {
    return (
      <View className="bg-red-50 p-4 rounded-xl border border-red-200 items-center">
        <Text className="text-red-600 font-bold text-lg">Application Disqualified</Text>
        <Text className="text-red-500 text-center mt-1">
          Please contact your local election officer for assistance.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white p-4 rounded-2xl shadow-sm">
      {STATES_ORDER.map((state, index) => {
        const meta = STATE_META[state];
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <View
            key={state}
            className="flex-row items-start mb-4 last:mb-0"
            accessibilityLabel={`Step ${index + 1}: ${meta.label}. ${isCompleted ? 'Completed' : isCurrent ? 'Current Step' : 'Pending'}`}
          >
            <View
              className="items-center mr-4"
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                {isCompleted && <Text className="text-white font-bold">✓</Text>}
                {isCurrent && <View className="w-3 h-3 bg-white rounded-full" />}
              </View>
              {index < STATES_ORDER.length - 1 && (
                <View
                  className={`w-0.5 h-10 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}
                  importantForAccessibility="no"
                />
              )}
            </View>
            <View className="flex-1 pt-1">
              <Text
                className={`font-bold text-base ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-800' : 'text-slate-400'}`}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
