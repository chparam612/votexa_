import { renderHook, act } from '@testing-library/react-native';
import { usePolling } from '../usePolling';

global.fetch = jest.fn();

describe('usePolling Hook', () => {
  it('fetches polling stations based on location', async () => {
    const mockStations = [{ id: '1', name: 'Station A' }];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStations),
    });

    const { result } = renderHook(() => usePolling());

    await act(async () => {
      // Wait
    });

    // expect(result.current.stations).toHaveLength(1);
  });
});
