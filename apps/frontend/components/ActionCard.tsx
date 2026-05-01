import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface Props {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  onPress: () => Promise<void>;
}

export default function ActionCard({ title, description, priority, onPress }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  let badgeColor = 'bg-slate-200 text-slate-700';
  let borderLeftColor = 'border-l-slate-400';

  if (priority === 'CRITICAL') {
    badgeColor = 'bg-red-100 text-red-800';
    borderLeftColor = 'border-l-red-500';
  } else if (priority === 'HIGH') {
    badgeColor = 'bg-orange-100 text-orange-800';
    borderLeftColor = 'border-l-orange-500';
  } else if (priority === 'MEDIUM') {
    badgeColor = 'bg-blue-100 text-blue-800';
    borderLeftColor = 'border-l-blue-500';
  }

  return (
    <TouchableOpacity
      className={`bg-white p-5 rounded-2xl shadow-sm mb-4 border-l-4 ${borderLeftColor} focus:border-2 focus:border-blue-500`}
      onPress={handlePress}
      disabled={loading}
      accessibilityLabel={`${title}. ${description}. Priority: ${priority}`}
      accessibilityRole="button"
      accessibilityHint="Double tap to start this registration step"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-slate-900 flex-1 mr-2">{title}</Text>
        <View className={`px-2 py-1 rounded-md ${badgeColor.split(' ')[0]}`}>
          <Text className={`text-xs font-bold ${badgeColor.split(' ')[1]}`}>{priority}</Text>
        </View>
      </View>
      <Text className="text-slate-600 mb-4">{description}</Text>

      <View className="flex-row justify-end">
        {loading ? (
          <ActivityIndicator color="#3B82F6" />
        ) : (
          <Text className="text-blue-600 font-semibold">Take Action →</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
