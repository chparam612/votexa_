import React from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePolling } from '../../hooks/usePolling';
import PollingStationCard from '../../components/PollingStationCard';

export default function PollingScreen() {
  const router = useRouter();
  const { stations, loading } = usePolling();

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
        <Text className="text-2xl font-bold text-white" accessibilityRole="header" maxFontSizeMultiplier={1.3}>Polling Stations</Text>
      </View>

      <ScrollView 
        className="flex-1 p-6"
        removeClippedSubviews={true}
      >
        <Text className="text-slate-600 mb-6" maxFontSizeMultiplier={1.3}>
          Showing optimized polling stations based on distance, wait times, and crowd levels.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1E3A8A" className="mt-10" />
        ) : (
          <View className="space-y-4 pb-12">
            {stations.map(station => (
              <PollingStationCard key={station.id} {...station} />
            ))}
            {stations.length === 0 && (
              <View 
                className="bg-white p-6 rounded-2xl items-center mt-10"
                accessibilityLabel="No results found"
              >
                <Text className="text-slate-500" maxFontSizeMultiplier={1.3}>No polling stations found near you.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
