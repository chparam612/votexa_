import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';

export default function ActionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const actions = [
    { id: '1', title: 'Verify Identity', event: 'VERIFY' },
    { id: '2', title: 'Register as Voter', event: 'REGISTER' },
    { id: '3', title: 'Find Polling Station', event: 'FIND_POLLING' },
  ];

  const handleAction = async (event: string, id: string) => {
    const user = auth().currentUser;
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/actions/transition`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({ userId: user.uid, event }),
        },
      );

      if (response.ok) {
        setCompletedSteps([...completedSteps, id]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-4 pb-6 bg-blue-900 flex-row items-center">
        <Pressable 
          onPress={() => router.back()} 
          className="mr-4 p-2"
          android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
          accessibilityLabel="Go Back"
          accessibilityRole="button"
          hitSlop={15}
        >
          <Text className="text-blue-200 text-xl" maxFontSizeMultiplier={1.3}>← Back</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-white" accessibilityRole="header" maxFontSizeMultiplier={1.3}>Action Checklist</Text>
      </View>

      <ScrollView 
        className="flex-1 p-6"
        removeClippedSubviews={true}
      >
        <View className="space-y-4">
          {actions.map((action) => {
            const isCompleted = completedSteps.includes(action.id);
            return (
              <Pressable
                key={action.id}
                className={(({ pressed }: any) => 
                  `p-5 rounded-2xl shadow-sm mb-4 border-l-4 ${isCompleted ? 'border-l-green-500 bg-green-50' : 'border-l-blue-600 bg-white'} ${pressed ? 'bg-slate-50' : ''}`
                ) as any}
                onPress={() => !isCompleted && handleAction(action.event, action.id)}
                disabled={isCompleted || loading}
                android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
                accessibilityLabel={`${action.title}. ${isCompleted ? 'Completed' : 'Pending'}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: isCompleted }}
              >
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`text-lg font-bold ${isCompleted ? 'text-green-600 line-through' : 'text-slate-900'}`}
                    maxFontSizeMultiplier={1.3}
                  >
                    {action.title}
                  </Text>
                  {isCompleted && (
                    <View className="bg-green-500 w-6 h-6 rounded-full items-center justify-center">
                      <Text className="text-white font-bold" maxFontSizeMultiplier={1.3}>✓</Text>
                    </View>
                  )}
                  {loading && !isCompleted && <ActivityIndicator color="#3B82F6" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
