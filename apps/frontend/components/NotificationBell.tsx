import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'notifications'),
      where('read', '==', false)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  return (
    <TouchableOpacity 
      onPress={() => router.push('/notifications')}
      className="relative p-2"
    >
      <Text className="text-2xl">🔔</Text>
      {unreadCount > 0 && (
        <View className="absolute top-0 right-0 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
          <Text className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
