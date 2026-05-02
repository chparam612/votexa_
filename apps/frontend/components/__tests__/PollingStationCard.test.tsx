import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PollingStationCard from '../PollingStationCard';

// Mock Expo Linking for directions
jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

describe('PollingStationCard Component', () => {
  const mockStation = {
    id: 's1',
    name: 'Primary School Booth',
    address: '123 Election Street',
    distance_km: 0.5,
    avg_wait_minutes: 15,
    score: 80,
    crowd_factor: 2,
    maps_url: 'https://maps.google.com',
  };

  it('renders station details correctly', () => {
    const { getByText } = render(<PollingStationCard {...mockStation} />);
    expect(getByText('Primary School Booth')).toBeTruthy();
    expect(getByText('123 Election Street')).toBeTruthy();
    expect(getByText('0.5 km')).toBeTruthy();
  });

  it('shows wait time info', () => {
    const { getByText } = render(<PollingStationCard {...mockStation} />);
    expect(getByText('15 min wait')).toBeTruthy();
  });

  it('calls maps on press', () => {
    const { getByRole } = render(<PollingStationCard {...mockStation} />);
    const button = getByRole('button');
    fireEvent.press(button);
  });
});
