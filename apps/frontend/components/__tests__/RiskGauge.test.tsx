import React from 'react';
import { render } from '@testing-library/react-native';
import RiskGauge from '../RiskGauge';

describe('RiskGauge Component', () => {
  it('renders risk score correctly', () => {
    const { getByText } = render(<RiskGauge score={45} level="MEDIUM" />);
    expect(getByText('45%')).toBeTruthy();
    expect(getByText('MEDIUM RISK')).toBeTruthy();
  });

  it('applies correct color for high risk', () => {
    const { getByText } = render(<RiskGauge score={85} level="CRITICAL" />);
    expect(getByText('CRITICAL RISK')).toBeTruthy();
  });
});
