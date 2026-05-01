import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useRisk } from '../../hooks/useRisk';
import RiskGauge from '../../components/RiskGauge';
import Slider from '@react-native-community/slider';

export default function RiskScreen() {
  const router = useRouter();
  const { data, loading } = useRisk();
  const [simDays, setSimDays] = useState(30);
  const [simSteps, setSimSteps] = useState(5);
  const [simResult, setSimResult] = useState<any>(null);

  const simulate = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: [{ remainingSteps: simSteps, daysLeft: simDays }] })
      });
      const json = await res.json();
      setSimResult(json.results[0]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-6 pt-16 pb-6 bg-blue-900 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-white text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Risk Analysis</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {loading ? (
          <ActivityIndicator size="large" color="#1E3A8A" className="mt-10" />
        ) : (
          <View className="space-y-6 pb-12">
            <RiskGauge score={data?.score || 0} level={data?.level || 'LOW'} />

            <View className="bg-white p-6 rounded-2xl shadow-sm">
              <Text className="text-lg font-bold text-slate-900 mb-4">Breakdown</Text>
              {data?.recommendations?.map((rec: string, i: number) => (
                <View key={i} className="flex-row items-center mb-2">
                  <Text className="text-orange-500 mr-2">•</Text>
                  <Text className="text-slate-700 flex-1">{rec}</Text>
                </View>
              ))}
            </View>

            <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <Text className="text-lg font-bold text-slate-900 mb-4">What-If Simulator</Text>
              
              <Text className="text-slate-600 mb-2">Days left to election: {Math.round(simDays)}</Text>
              <Slider
                minimumValue={1}
                maximumValue={90}
                value={simDays}
                onValueChange={setSimDays}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#CBD5E1"
              />

              <Text className="text-slate-600 mb-2 mt-4">Remaining registration steps: {Math.round(simSteps)}</Text>
              <Slider
                minimumValue={0}
                maximumValue={5}
                value={simSteps}
                onValueChange={setSimSteps}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#CBD5E1"
              />

              <TouchableOpacity 
                className="bg-slate-900 p-4 rounded-xl items-center mt-6"
                onPress={simulate}
              >
                <Text className="text-white font-bold">Simulate Risk</Text>
              </TouchableOpacity>

              {simResult && (
                <View className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 items-center">
                  <Text className="text-slate-500 mb-1">Simulated Result</Text>
                  <Text className="text-3xl font-black text-slate-800">{simResult.score}%</Text>
                  <Text className={`font-bold mt-1 ${
                    simResult.level === 'CRITICAL' ? 'text-red-700' :
                    simResult.level === 'HIGH' ? 'text-red-500' :
                    simResult.level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                  }`}>{simResult.level} RISK</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
