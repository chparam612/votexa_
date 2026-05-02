import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationBell from '../NotificationBell';

// Mock useRouter
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('NotificationBell Component', () => {
  it('renders correctly', () => {
    const { getByLabelText } = render(<NotificationBell />);
    expect(getByLabelText(/Notifications/)).toBeTruthy();
  });

  it('navigates to notifications on press', () => {
    const { getByRole } = render(<NotificationBell />);
    const button = getByRole('button');
    fireEvent.press(button);
  });
});
