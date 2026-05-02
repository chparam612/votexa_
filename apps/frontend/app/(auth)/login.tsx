import React, { useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (isLogin: boolean) => {
    const sanitizedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!sanitizedEmail || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!emailRegex.test(sanitizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await auth().signInWithEmailAndPassword(sanitizedEmail, password);
      } else {
        const credential = await auth().createUserWithEmailAndPassword(sanitizedEmail, password);
        try {
          await db().collection('voters').doc(credential.user.uid).set({
            email: credential.user.email,
            state: 'NOT_REGISTERED',
            experienceLevel: 'beginner',
            completedSteps: [],
            location: {},
            deadlines: {},
            notificationPrefs: { push: true, email: false, sms: false },
            createdAt: firestore.FieldValue.serverTimestamp(),
            lastActive: firestore.FieldValue.serverTimestamp(),
          });
        } catch (firestoreError) {
          await credential.user.delete();
          throw firestoreError;
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="p-6"
          removeClippedSubviews={true}
        >
          <Text 
            className="text-5xl font-black text-blue-900 text-center mb-2"
            maxFontSizeMultiplier={1.3}
          >
            VOTEXA
          </Text>
          <Text 
            className="text-lg text-slate-500 text-center mb-12"
            maxFontSizeMultiplier={1.3}
          >
            Smart Election Assistant
          </Text>

          <View className="space-y-4">
            <TextInput
              className="bg-white p-4 rounded-xl border border-slate-200 text-base mb-4"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              accessibilityLabel="Email address"
            />
            <TextInput
              className="bg-white p-4 rounded-xl border border-slate-200 text-base mb-4"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password"
            />

            {error ? (
              <Text 
                className="text-red-500 text-center mb-4"
                maxFontSizeMultiplier={1.3}
                accessibilityRole="alert"
              >
                {error}
              </Text>
            ) : null}

            <Pressable 
              className={(({ pressed }: any) => 
                `p-4 rounded-xl items-center mb-3 ${pressed ? 'bg-blue-800' : 'bg-blue-900'}`
              ) as any}
              onPress={() => handleAuth(true)} 
              disabled={loading}
              android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
              accessibilityLabel="Login to your account"
              accessibilityRole="button"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold" maxFontSizeMultiplier={1.3}>Login</Text>}
            </Pressable>

            <Pressable 
              className={(({ pressed }: any) => 
                `border border-blue-900 p-4 rounded-xl items-center ${pressed ? 'bg-slate-100' : 'bg-transparent'}`
              ) as any}
              onPress={() => handleAuth(false)} 
              disabled={loading}
              android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
              accessibilityLabel="Create a new account"
              accessibilityRole="button"
            >
              <Text className="text-blue-900 text-base font-bold" maxFontSizeMultiplier={1.3}>Register Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
