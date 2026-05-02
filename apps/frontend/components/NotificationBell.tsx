import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebase';
export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = db()
      .collection('users')
      .doc(user.uid)
      .collection('notifications')
      .where('read', '==', false)
      .onSnapshot((snapshot) => {
        if (snapshot) {
          setUnreadCount(snapshot.size);
        }
      });

    return () => unsubscribe();
  }, []);

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      className={(({ pressed }: any) => 
        `relative p-2 rounded-full ${pressed ? 'bg-slate-200' : 'bg-transparent'}`
      ) as any}
      android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
      accessibilityLabel={`Notifications, ${unreadCount === 0 ? 'no' : unreadCount} unread`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view your notifications"
    >
      <Text className="text-2xl" accessibilityLabel="Bell icon">
        🔔
      </Text>
      {unreadCount > 0 && (
        <View 
          className="absolute top-0 right-0 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
          accessibilityLabel={`${unreadCount} unread notifications`}
        >
          <Text className="text-white text-xs font-bold" maxFontSizeMultiplier={1.2}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
