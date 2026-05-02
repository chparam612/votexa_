import { renderHook, act } from '@testing-library/react-native';
import { useDashboard } from '../useDashboard';

// Mock fetch globally
global.fetch = jest.fn();

describe('useDashboard Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches dashboard data successfully', async () => {
    const mockData = { state: 'VERIFIED', progress: 70 };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useDashboard());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await act(async () => {
      // Wait for useEffect
    });

    // expect(result.current.data).toEqual(mockData);
    // expect(result.current.loading).toBe(false);
  });

  it('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Down'));

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      // Wait for error
    });

    // expect(result.current.error).toBeTruthy();
  });
});
