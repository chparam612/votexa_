import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (isLogin: boolean) => {
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-slate-50">
      <Text className="text-5xl font-black text-blue-900 text-center mb-2">VOTEXA</Text>
      <Text className="text-lg text-slate-500 text-center mb-12">Smart Election Assistant</Text>

      <View className="space-y-4">
        <TextInput
          className="bg-white p-4 rounded-xl border border-slate-200 text-base mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className="bg-white p-4 rounded-xl border border-slate-200 text-base mb-4"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}

        <TouchableOpacity 
          className="bg-blue-900 p-4 rounded-xl items-center mb-3" 
          onPress={() => handleAuth(true)} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-transparent border border-blue-900 p-4 rounded-xl items-center" 
          onPress={() => handleAuth(false)} 
          disabled={loading}
        >
          <Text className="text-blue-900 text-base font-bold">Register Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
