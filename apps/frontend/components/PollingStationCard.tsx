import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

interface Props {
  name: string;
  address: string;
  distance_km: number;
  score: number;
  crowd_factor: number;
  avg_wait_minutes: number;
  maps_url: string;
}

export default function PollingStationCard({
  name,
  address,
  distance_km,
  score,
  crowd_factor,
  avg_wait_minutes,
  maps_url,
}: Props) {
  let crowdBadge = 'bg-green-100 text-green-800';
  let crowdText = 'Low Crowd';
  if (crowd_factor > 0.7) {
    crowdBadge = 'bg-red-100 text-red-800';
    crowdText = 'Heavy Crowd';
  } else if (crowd_factor > 0.4) {
    crowdBadge = 'bg-yellow-100 text-yellow-800';
    crowdText = 'Moderate Crowd';
  }

  const openMaps = () => {
    Linking.openURL(maps_url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View
      className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-slate-100"
      accessibilityLabel={`Polling Station: ${name}. ${address}. ${distance_km.toFixed(1)} km away. ${crowdText}.`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold text-slate-900" accessibilityRole="header">
            {name}
          </Text>
          <Text className="text-sm text-slate-500 mt-1">{address}</Text>
        </View>
        <View
          className="bg-blue-50 px-3 py-2 rounded-lg items-center"
          accessibilityLabel={`Votexa Quality Score: ${score}`}
        >
          <Text className="text-blue-900 font-bold text-lg">{score}</Text>
          <Text className="text-blue-600 text-xs">Score</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-4 mt-2">
        <View
          className={`px-2 py-1 rounded-md ${crowdBadge.split(' ')[0]}`}
          accessibilityLabel={`Crowd level: ${crowdText}`}
        >
          <Text className={`text-xs font-bold ${crowdBadge.split(' ')[1]}`}>{crowdText}</Text>
        </View>
        <View
          className="bg-slate-100 px-2 py-1 rounded-md"
          accessibilityLabel={`Estimated wait time: ${avg_wait_minutes} minutes`}
        >
          <Text className="text-xs font-bold text-slate-700">~{avg_wait_minutes}m wait</Text>
        </View>
        <View
          className="bg-slate-100 px-2 py-1 rounded-md"
          accessibilityLabel={`Distance: ${distance_km.toFixed(1)} kilometers`}
        >
          <Text className="text-xs font-bold text-slate-700">{distance_km.toFixed(1)} km away</Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-blue-600 p-3 rounded-xl items-center focus:bg-blue-800"
        onPress={openMaps}
        accessibilityLabel={`Get directions to ${name} in Google Maps`}
        accessibilityRole="button"
      >
        <Text className="text-white font-bold">Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}
