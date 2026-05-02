import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [prefs, setPrefs] = useState({ push: true, email: false, sms: false });

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = db()
      .collection('users')
      .doc(user.uid)
      .collection('notifications')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        if (snapshot) {
          setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
      });

    db()
      .collection('users')
      .doc(user.uid)
      .get()
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.notificationPrefs) {
            setPrefs(data.notificationPrefs);
          }
        }
      });

    return () => unsubscribe();
  }, []);

  const togglePref = async (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    const user = auth().currentUser;
    if (user) {
      await db().collection('users').doc(user.uid).update({
        notificationPrefs: newPrefs,
      });
    }
  };

  const testPush = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/notifications/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
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
        <Text className="text-2xl font-bold text-white" accessibilityRole="header" maxFontSizeMultiplier={1.3}>Notifications</Text>
      </View>

      <ScrollView 
        className="flex-1 p-6"
        removeClippedSubviews={true}
      >
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <Text className="text-lg font-bold text-slate-900 mb-4" maxFontSizeMultiplier={1.3}>Preferences</Text>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-700" maxFontSizeMultiplier={1.3}>Push Notifications</Text>
            <Switch
              value={prefs.push}
              onValueChange={() => togglePref('push')}
              trackColor={{ true: '#3B82F6' }}
              accessibilityLabel="Toggle Push Notifications"
            />
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-700" maxFontSizeMultiplier={1.3}>Email Alerts</Text>
            <Switch
              value={prefs.email}
              onValueChange={() => togglePref('email')}
              trackColor={{ true: '#3B82F6' }}
              accessibilityLabel="Toggle Email Alerts"
            />
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-700" maxFontSizeMultiplier={1.3}>SMS Reminders</Text>
            <Switch
              value={prefs.sms}
              onValueChange={() => togglePref('sms')}
              trackColor={{ true: '#3B82F6' }}
              accessibilityLabel="Toggle SMS Reminders"
            />
          </View>

          <Pressable
            onPress={testPush}
            className={(({ pressed }: any) => 
              `p-3 rounded-xl items-center mt-2 ${pressed ? 'bg-slate-200' : 'bg-slate-100'}`
            ) as any}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            accessibilityLabel="Send Test Push Notification"
            accessibilityRole="button"
          >
            <Text className="text-slate-700 font-bold" maxFontSizeMultiplier={1.3}>Send Test Push</Text>
          </Pressable>
        </View>

        <Text className="text-lg font-bold text-slate-900 mb-4" maxFontSizeMultiplier={1.3}>History</Text>
        <View className="space-y-3 pb-12">
          {notifications.map((n) => (
            <View
              key={n.id}
              className={`bg-white p-4 rounded-xl border-l-4 ${n.read ? 'border-l-slate-300' : 'border-l-blue-500 bg-blue-50'}`}
              accessibilityLabel={`Notification: ${n.title}. ${n.body}. Sent on ${new Date(n.timestamp).toLocaleString()}`}
            >
              <Text className="font-bold text-slate-900" maxFontSizeMultiplier={1.3}>{n.title}</Text>
              <Text className="text-slate-600 mt-1" maxFontSizeMultiplier={1.3}>{n.body}</Text>
              <Text className="text-slate-400 text-xs mt-2" maxFontSizeMultiplier={1.3}>
                {new Date(n.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
          {notifications.length === 0 && (
            <Text className="text-slate-500 italic" maxFontSizeMultiplier={1.3}>No notifications yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
