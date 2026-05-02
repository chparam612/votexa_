import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/login';

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();

jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  });
});

// Mock Firestore
const mockSet = jest.fn();
jest.mock('@react-native-firebase/firestore', () => {
  const mockFirestore = () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: mockSet,
      })),
    })),
  });
  mockFirestore.FieldValue = { serverTimestamp: jest.fn() };
  return mockFirestore;
});

// Mock local config
jest.mock('../config/firebase', () => ({
  auth: () => ({
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  }),
  db: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: mockSet,
      })),
    })),
  }),
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('shows error when fields are empty on login click', async () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Login'));
    
    await waitFor(() => {
      expect(getByText('Please enter both email and password')).toBeTruthy();
    });
  });

  it('calls firebase auth on valid input', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
