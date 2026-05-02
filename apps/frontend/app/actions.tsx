import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebase';

export default function ActionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const actions = [
    { id: '1', title: 'Verify Identity', event: 'VERIFY' },
    { id: '2', title: 'Register as Voter', event: 'REGISTER' },
    { id: '3', title: 'Find Polling Station', event: 'FIND_POLLING' },
  ];

  const handleAction = async (event: string, id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/actions/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth().currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ userId: auth().currentUser?.uid, event })
      });
      
      if (response.ok) {
        setCompletedSteps([...completedSteps, id]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Action Checklist</Text>
      </View>

      <View style={styles.content}>
        {actions.map((action) => (
          <TouchableOpacity 
            key={action.id} 
            style={[styles.actionCard, completedSteps.includes(action.id) && styles.actionCardCompleted]}
            onPress={() => !completedSteps.includes(action.id) && handleAction(action.event, action.id)}
            disabled={completedSteps.includes(action.id) || loading}
          >
            <View style={styles.actionHeader}>
              <Text style={[styles.actionTitle, completedSteps.includes(action.id) && styles.actionTitleCompleted]}>
                {action.title}
              </Text>
              {completedSteps.includes(action.id) && (
                <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#1E3A8A' },
  backButton: { marginBottom: 16 },
  backText: { color: '#BFDBFE', fontSize: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  content: { padding: 24, gap: 16 },
  actionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionCardCompleted: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionTitleCompleted: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  checkBadge: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
