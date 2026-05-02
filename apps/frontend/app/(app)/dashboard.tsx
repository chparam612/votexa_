import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import FSMStepper from '../../components/FSMStepper';
import RiskGauge from '../../components/RiskGauge';
import ActionCard from '../../components/ActionCard';
import PollingStationCard from '../../components/PollingStationCard';
import NotificationBell from '../../components/NotificationBell';
import { useDashboard } from '../../hooks/useDashboard';
import { auth } from '../../config/firebase';
import { getFlags } from '../../lib';

export default function DashboardScreen() {
  const router = useRouter();
  const { data, loading, error, refetch } = useDashboard();
  const [antigravity, setAntigravity] = useState(false);

  useEffect(() => {
    getFlags().then((f) => setAntigravity(f.antigravity_mode_enabled));
  }, []);

  const handleActionPress = async (event: string) => {
    if (!auth?.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/actions/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: auth.currentUser.uid, event }),
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  const userEmail = auth?.currentUser?.email || 'Voter';

  return (
    <ScrollView className={`flex-1 ${antigravity ? 'bg-black' : 'bg-slate-50'}`}>
      <View
        className={`px-6 pt-16 pb-6 flex-row justify-between items-center ${antigravity ? 'bg-purple-900' : 'bg-blue-900'}`}
      >
        <View>
          <Text className="text-3xl font-bold text-white" accessibilityRole="header">
            Dashboard
          </Text>
          <Text
            className="text-blue-200 mt-1"
            accessibilityLabel={`Logged in as ${userEmail.split('@')[0]}`}
          >
            Hello, {userEmail.split('@')[0]}
          </Text>
        </View>
        <NotificationBell />
      </View>

      {error ? (
        <View className="m-6 p-4 bg-red-100 rounded-xl" accessibilityRole="alert">
          <Text className="text-red-800">{error}</Text>
        </View>
      ) : null}

      <View className="p-6 space-y-8 pb-12">
        <View accessibilityLabel="Registration Progress Section">
          <Text
            className={`text-lg font-bold mb-4 ${antigravity ? 'text-white' : 'text-slate-900'}`}
            accessibilityRole="header"
          >
            Registration Progress
          </Text>
          <FSMStepper currentState={data?.fsmState || 'NOT_REGISTERED'} />
        </View>

        <View accessibilityLabel="Risk Analysis Section">
          <Text
            className={`text-lg font-bold mb-4 ${antigravity ? 'text-white' : 'text-slate-900'}`}
            accessibilityRole="header"
          >
            Risk Analysis
          </Text>
          <RiskGauge
            score={data?.riskScore || 0}
            level={data?.riskScore && data.riskScore > 60 ? 'HIGH' : 'LOW'}
          />
          <TouchableOpacity
            className="mt-4 bg-blue-100 p-3 rounded-xl items-center focus:border-2 focus:border-blue-600"
            onPress={() => router.push('/risk')}
            accessibilityLabel="View detailed risk breakdown"
            accessibilityRole="button"
          >
            <Text className="text-blue-800 font-bold">View Detailed Breakdown</Text>
          </TouchableOpacity>
        </View>

        <View accessibilityLabel="Recommended Actions Section">
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`text-lg font-bold ${antigravity ? 'text-white' : 'text-slate-900'}`}
              accessibilityRole="header"
            >
              Recommended Actions
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/actions')}
              accessibilityLabel="View all recommended actions"
              accessibilityRole="button"
            >
              <Text className="text-blue-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          {data?.actions?.map((action) => (
            <ActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              priority={action.priority}
              onPress={() => handleActionPress(action.event)}
            />
          ))}
          {(!data?.actions || data.actions.length === 0) && (
            <Text className="text-slate-500 italic">{"You're all caught up!"}</Text>
          )}
        </View>

        <View accessibilityLabel="Nearby Polling Stations Section">
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`text-lg font-bold ${antigravity ? 'text-white' : 'text-slate-900'}`}
              accessibilityRole="header"
            >
              Top Polling Stations
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/polling')}
              accessibilityLabel="View polling stations on map"
              accessibilityRole="button"
            >
              <Text className="text-blue-600 font-semibold">View Map</Text>
            </TouchableOpacity>
          </View>

          {data?.pollingStations?.map((station) => (
            <PollingStationCard key={station.id} {...station} />
          ))}
          {(!data?.pollingStations || data.pollingStations.length === 0) && (
            <Text className="text-slate-500 italic">No polling stations nearby found yet.</Text>
          )}
        </View>

        <TouchableOpacity
          className="mt-4 py-4 items-center focus:border-2 focus:border-red-500"
          onPress={() => auth?.signOut()}
          accessibilityLabel="Sign out of your account"
          accessibilityRole="button"
        >
          <Text className="text-red-500 font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
