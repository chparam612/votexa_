// Global mocks for testing
global.__DEV__ = true;
require('react-native/jest/setup');

jest.mock('lucide-react-native', () => ({
  ArrowRight: 'ArrowRight',
  CheckCircle: 'CheckCircle',
  ShieldCheck: 'ShieldCheck',
  MapPin: 'MapPin',
  Clock: 'Clock',
  AlertTriangle: 'AlertTriangle',
  Bell: 'Bell',
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

// Increase timeout for long-running tests
jest.setTimeout(30000);
