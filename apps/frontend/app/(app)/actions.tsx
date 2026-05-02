import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase';
import { useDashboard } from '../../hooks/useDashboard';
import ActionCard from '../../components/ActionCard';

export default function ActionsScreen() {
  const router = useRouter();
  const { data, loading, refetch } = useDashboard();
  const [transitioning, setTransitioning] = useState(false);

  const handleAction = async (event: string) => {
    setTransitioning(true);
    try {
      const token = await auth().currentUser?.getIdToken();
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/actions/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: auth().currentUser?.uid, event }),
      });
      await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setTransitioning(false);
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
          <Text className="text-white text-xl" maxFontSizeMultiplier={1.3}>←</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-white" accessibilityRole="header" maxFontSizeMultiplier={1.3}>Action Checklist</Text>
      </View>

      <ScrollView 
        className="flex-1 p-6"
        removeClippedSubviews={true}
      >
        <Text className="text-slate-600 mb-6" maxFontSizeMultiplier={1.3}>
          Complete these steps to move forward in your election journey.
        </Text>

        {loading || transitioning ? (
          <ActivityIndicator size="large" color="#1E3A8A" className="mt-10" />
        ) : (
          <View className="space-y-4">
            {data?.actions && data.actions.length > 0 ? (
              data.actions.map((action) => (
                <ActionCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  priority={action.priority}
                  onPress={() => handleAction(action.event)}
                />
              ))
            ) : (
              <View 
                className="bg-white p-6 rounded-2xl border border-slate-200 items-center mt-10"
                accessibilityLabel="All actions completed"
              >
                <Text className="text-4xl mb-4" accessibilityElementsHidden={true}>🎉</Text>
                <Text className="text-xl font-bold text-slate-800 text-center" maxFontSizeMultiplier={1.3}>
                  You're all caught up!
                </Text>
                <Text className="text-slate-500 text-center mt-2" maxFontSizeMultiplier={1.3}>
                  No pending actions for your current state. Check back later or review your polling
                  station details.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
