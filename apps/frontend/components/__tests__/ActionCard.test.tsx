import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ActionCard from '../ActionCard';

// Mock icons
jest.mock('lucide-react-native', () => ({
  ArrowRight: 'ArrowRight',
  CheckCircle: 'CheckCircle',
}));

describe('ActionCard Component', () => {
  const mockProps = {
    title: 'Test Action',
    description: 'Test Description',
    priority: 'HIGH' as const,
    onPress: jest.fn(),
  };

  it('renders correctly with mandatory props', () => {
    const { getByText } = render(<ActionCard {...mockProps} />);
    expect(getByText('Test Action')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
    expect(getByText('HIGH')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const { getByRole } = render(<ActionCard {...mockProps} />);
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockProps.onPress).toHaveBeenCalled();
  });
  it('applies correct priority styles (visual verification via props)', () => {
    const { getByText, rerender } = render(<ActionCard {...mockProps} priority="CRITICAL" />);
    expect(getByText('CRITICAL')).toBeTruthy();
    
    rerender(<ActionCard {...mockProps} priority="LOW" />);
    expect(getByText('LOW')).toBeTruthy();
  });
});
