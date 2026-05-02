import React from 'react';
import { render } from '@testing-library/react-native';
import DashboardScreen from '../app/(app)/dashboard';
import { useDashboard } from '../hooks/useDashboard';

// Mock hooks and components
jest.mock('../hooks/useDashboard');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock('../lib', () => ({
  getFlags: jest.fn().mockResolvedValue({ antigravity_mode_enabled: false }),
}));

describe('DashboardScreen', () => {
  it('shows loading state initially', () => {
    (useDashboard as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const { getByTestId, queryByText } = render(<DashboardScreen />);
    // Since it returns ActivityIndicator, we just check data isn't rendered
    expect(queryByText('Dashboard')).toBeNull();
  });

  it('renders dashboard after data loads', async () => {
    (useDashboard as jest.Mock).mockReturnValue({
      data: {
        fsmState: 'REGISTERED',
        riskScore: 45,
        actions: [],
        pollingStations: []
      },
      loading: false,
      error: null,
    });

    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Registration Progress')).toBeTruthy();
  });
});
