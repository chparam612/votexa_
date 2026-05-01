import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePolling } from '../../hooks/usePolling';
import PollingStationCard from '../../components/PollingStationCard';

export default function PollingScreen() {
  const router = useRouter();
  const { stations, loading } = usePolling();

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-6 pt-16 pb-6 bg-blue-900 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-white text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Polling Stations</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-slate-600 mb-6">
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
              <View className="bg-white p-6 rounded-2xl items-center mt-10">
                <Text className="text-slate-500">No polling stations found near you.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
