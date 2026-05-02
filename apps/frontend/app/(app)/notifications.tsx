import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [prefs, setPrefs] = useState({ push: true, email: false, sms: false });

  useEffect(() => {
    if (!auth?.currentUser) return;

    const currentUser = auth.currentUser;

    // Listen to notifications
    const q = query(
      collection(db, 'users', currentUser.uid, 'notifications'),
      orderBy('timestamp', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Get preferences
    getDoc(doc(db, 'users', currentUser.uid)).then((docSnap) => {
      if (docSnap.exists() && docSnap.data().notificationPrefs) {
        setPrefs(docSnap.data().notificationPrefs);
      }
    });

    return () => unsubscribe();
  }, []);

  const togglePref = async (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    if (auth?.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        notificationPrefs: newPrefs,
      });
    }
  };

  const testPush = async () => {
    try {
      if (!auth?.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/notifications/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          title: 'Test Notification',
          body: 'This is a test push notification from Votexa.',
          channels: ['push'],
        }),
      });
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
        <Text className="text-2xl font-bold text-white">Notifications</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <Text className="text-lg font-bold text-slate-900 mb-4">Preferences</Text>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-700">Push Notifications</Text>
            <Switch
              value={prefs.push}
              onValueChange={() => togglePref('push')}
              trackColor={{ true: '#3B82F6' }}
            />
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-700">Email Alerts</Text>
            <Switch
              value={prefs.email}
              onValueChange={() => togglePref('email')}
              trackColor={{ true: '#3B82F6' }}
            />
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-700">SMS Reminders</Text>
            <Switch
              value={prefs.sms}
              onValueChange={() => togglePref('sms')}
              trackColor={{ true: '#3B82F6' }}
            />
          </View>

          <TouchableOpacity
            onPress={testPush}
            className="bg-slate-100 p-3 rounded-xl items-center mt-2"
          >
            <Text className="text-slate-700 font-bold">Send Test Push</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-slate-900 mb-4">History</Text>
        <View className="space-y-3 pb-12">
          {notifications.map((n) => (
            <View
              key={n.id}
              className={`bg-white p-4 rounded-xl border-l-4 ${n.read ? 'border-l-slate-300' : 'border-l-blue-500 bg-blue-50'}`}
            >
              <Text className="font-bold text-slate-900">{n.title}</Text>
              <Text className="text-slate-600 mt-1">{n.body}</Text>
              <Text className="text-slate-400 text-xs mt-2">
                {new Date(n.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
          {notifications.length === 0 && (
            <Text className="text-slate-500 italic">No notifications yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
