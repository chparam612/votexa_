import React from 'react';
import { render } from '@testing-library/react-native';
import FSMStepper from '../FSMStepper';

describe('FSMStepper Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<FSMStepper currentState="NOT_REGISTERED" />);
    // Check for a label that is known to exist in STATE_META
    expect(getByText('Not Registered')).toBeTruthy();
  });

  it('highlights current step correctly', () => {
    const { getByText } = render(<FSMStepper currentState="REGISTERED" />);
    expect(getByText('Registered')).toBeTruthy();
  });
});
