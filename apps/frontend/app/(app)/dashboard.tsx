import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FSMStepper from '../../components/FSMStepper';
import RiskGauge from '../../components/RiskGauge';
import ActionCard from '../../components/ActionCard';
import PollingStationCard from '../../components/PollingStationCard';
import NotificationBell from '../../components/NotificationBell';
import { useDashboard } from '../../hooks/useDashboard';
import { auth } from '../../config/firebase';
import { getFlags } from '../../lib';

import { ErrorBoundary } from '../../components/ErrorBoundary';

function Dashboard() {
  const router = useRouter();
  const { data, loading, error, refetch } = useDashboard();
  const [antigravity, setAntigravity] = useState(false);

  useEffect(() => {
    getFlags().then((f) => setAntigravity(f.antigravity_mode_enabled));
  }, []);

  const handleActionPress = async (event: string) => {
    const user = auth().currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${baseUrl}/api/actions/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Transition failed');
      refetch();
    } catch (e: any) {
      console.error(e);
      // Optional: show alert to user
    }
  };

  if (loading && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  const userEmail = auth().currentUser?.email || 'Voter';

  return (
    <SafeAreaView className={`flex-1 ${antigravity ? 'bg-black' : 'bg-slate-50'}`}>
      <ScrollView 
        className="flex-1"
        removeClippedSubviews={true}
      >
        <View
          className={`px-6 pt-10 pb-6 flex-row justify-between items-center ${antigravity ? 'bg-purple-900' : 'bg-blue-900'}`}
        >
          <View>
            <Text 
              className="text-3xl font-bold text-white" 
              accessibilityRole="header"
              maxFontSizeMultiplier={1.3}
            >
              Dashboard
            </Text>
            <Text
              className="text-blue-200 mt-1"
              accessibilityLabel={`Logged in as ${userEmail.split('@')[0]}`}
              maxFontSizeMultiplier={1.3}
            >
              Hello, {userEmail.split('@')[0]}
            </Text>
          </View>
          <NotificationBell />
        </View>

        {error ? (
          <View className="m-6 p-4 bg-red-100 rounded-xl" accessibilityRole="alert">
            <Text className="text-red-800" maxFontSizeMultiplier={1.3}>{error}</Text>
          </View>
        ) : null}

        <View className="p-6 space-y-8 pb-12">
          <View accessibilityLabel="Registration Progress Section">
            <Text
              className={`text-lg font-bold mb-4 ${antigravity ? 'text-white' : 'text-slate-900'}`}
              accessibilityRole="header"
              maxFontSizeMultiplier={1.3}
            >
              Registration Progress
            </Text>
            <FSMStepper currentState={data?.fsmState || 'NOT_REGISTERED'} />
          </View>

          <View accessibilityLabel="Risk Analysis Section">
            <Text
              className={`text-lg font-bold mb-4 ${antigravity ? 'text-white' : 'text-slate-900'}`}
              accessibilityRole="header"
              maxFontSizeMultiplier={1.3}
            >
              Risk Analysis
            </Text>
            <RiskGauge
              score={data?.riskScore || 0}
              level={data?.riskScore && data.riskScore > 60 ? 'HIGH' : 'LOW'}
            />
            <Pressable
              className={(({ pressed }: any) => 
                `mt-4 p-3 rounded-xl items-center ${pressed ? 'bg-blue-200' : 'bg-blue-100'}`
              ) as any}
              onPress={() => router.push('/risk')}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
              accessibilityLabel="View detailed risk breakdown"
              accessibilityRole="button"
              accessibilityHint="Navigates to detailed risk analysis screen"
            >
              <Text className="text-blue-800 font-bold" maxFontSizeMultiplier={1.3}>View Detailed Breakdown</Text>
            </Pressable>
          </View>

          <View accessibilityLabel="Recommended Actions Section">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-lg font-bold ${antigravity ? 'text-white' : 'text-slate-900'}`}
                accessibilityRole="header"
                maxFontSizeMultiplier={1.3}
              >
                Recommended Actions
              </Text>
              <Pressable
                onPress={() => router.push('/actions')}
                accessibilityLabel="View all recommended actions"
                accessibilityRole="button"
                accessibilityHint="Navigates to full list of actions"
                hitSlop={10}
              >
                <Text className="text-blue-600 font-semibold" maxFontSizeMultiplier={1.3}>View All</Text>
              </Pressable>
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
              <Text 
                className="text-slate-500 italic"
                maxFontSizeMultiplier={1.3}
              >
                {"You're all caught up!"}
              </Text>
            )}
          </View>

          <View accessibilityLabel="Nearby Polling Stations Section">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-lg font-bold ${antigravity ? 'text-white' : 'text-slate-900'}`}
                accessibilityRole="header"
                maxFontSizeMultiplier={1.3}
              >
                Top Polling Stations
              </Text>
              <Pressable
                onPress={() => router.push('/polling')}
                accessibilityLabel="View polling stations on map"
                accessibilityRole="button"
                accessibilityHint="Navigates to polling station map"
                hitSlop={10}
              >
                <Text className="text-blue-600 font-semibold" maxFontSizeMultiplier={1.3}>View Map</Text>
              </Pressable>
            </View>

            {data?.pollingStations?.map((station) => (
              <PollingStationCard key={station.id} {...station} />
            ))}
            {(!data?.pollingStations || data.pollingStations.length === 0) && (
              <Text 
                className="text-slate-500 italic"
                maxFontSizeMultiplier={1.3}
              >
                No polling stations nearby found yet.
              </Text>
            )}
          </View>

          <Pressable
            className={(({ pressed }: any) => 
              `mt-4 py-4 items-center rounded-xl ${pressed ? 'bg-red-50' : 'bg-transparent'}`
            ) as any}
            onPress={() => auth().signOut()}
            android_ripple={{ color: 'rgba(239, 68, 68, 0.1)' }}
            accessibilityLabel="Sign out of your account"
            accessibilityRole="button"
          >
            <Text className="text-red-500 font-bold" maxFontSizeMultiplier={1.3}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function DashboardScreen() {
  return (
    <ErrorBoundary screenName="DASHBOARD">
      <Dashboard />
    </ErrorBoundary>
  );
}
