import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { auth } from '../../config/firebase';

// Mock Firebase
const mockAuth = {
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  currentUser: null,
};

jest.mock('../../config/firebase', () => ({
  auth: () => mockAuth,
}));

describe('useAuth Hook', () => {
  it('should initialize with loading true and user null', () => {
    mockAuth.onAuthStateChanged.mockReturnValue(() => {});
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
  });

  it('should update user when auth state changes', async () => {
    let callback: any;
    mockAuth.onAuthStateChanged.mockImplementation((cb: any) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      callback({ uid: 'test-uid', email: 'test@example.com' });
    });

    expect(result.current.user?.uid).toBe('test-uid');
  });
});
