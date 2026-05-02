import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import FSMStepper from '../components/FSMStepper';
import RiskGauge from '../components/RiskGauge';
import { auth } from '../config/firebase';
import type { RiskLevel } from '@votexa/algorithms';

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export default function DashboardScreen() {
  const router = useRouter();
  const [fsmState] = useState('NOT_REGISTERED');
  const [riskScore] = useState(75);

  useEffect(() => {
    // Check auth
    if (auth && !auth().currentUser) {
      router.replace('/');
    }
    // Register FCM Token here
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome, {auth().currentUser?.email || 'Voter'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registration Progress</Text>
        <FSMStepper currentState={fsmState} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Election Risk Level</Text>
        <RiskGauge score={riskScore} level={getRiskLevel(riskScore)} />
        <TouchableOpacity style={styles.cardButton} onPress={() => router.push('/risk')}>
          <Text style={styles.cardButtonText}>View Detailed Analysis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Actions</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/actions')}>
          <Text style={styles.actionCardTitle}>Complete Registration</Text>
          <Text style={styles.actionCardDesc}>You have 5 days left before the deadline.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/polling')}>
            <Text style={styles.gridItemText}>Polling Stations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/chat')}>
            <Text style={styles.gridItemText}>AI Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/notifications')}>
            <Text style={styles.gridItemText}>Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          auth().signOut();
          router.replace('/');
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#1E3A8A',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    marginTop: 4,
  },
  section: {
    padding: 24,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  cardButton: {
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cardButtonText: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionCardDesc: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  logoutButton: {
    margin: 24,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
});
