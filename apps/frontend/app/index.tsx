import { Redirect } from 'expo-router';
import { auth } from '../config/firebase';

export default function Index() {
  if (auth().currentUser) {
    return <Redirect href="/(app)/dashboard" />;
  }
  return <Redirect href="/(auth)/login" />;
}
