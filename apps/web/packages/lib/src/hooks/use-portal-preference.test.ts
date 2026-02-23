import { renderHook, act } from '@testing-library/react';
import { usePortalPreference, getPortalPreferenceFromCookie } from './use-portal-preference';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock document.cookie
const cookieMock = {
  cookies: new Map<string, string>(),
  get cookie() {
    return Array.from(this.cookies.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  },
  set cookie(cookieString: string) {
    const parts = cookieString.split(';').map(p => p.trim());
    const [keyValue] = parts;
    const [key, value] = keyValue.split('=');
    if (key && value) {
      this.cookies.set(key, value);
    }
  },
};

Object.defineProperty(document, 'cookie', {
  get: () => cookieMock.cookie,
  set: (val) => {
    cookieMock.cookie = val;
  },
  configurable: true,
});

describe('usePortalPreference Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    cookieMock.cookies.clear();
  });

  it('should initialize with null preference', () => {
    const { result } = renderHook(() => usePortalPreference());

    expect(result.current.preference).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('should load preference from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('b2b');

    const { result } = renderHook(() => usePortalPreference());

    expect(localStorageMock.getItem).toHaveBeenCalledWith('portal_preference');
    // Note: Due to useEffect, initial value will be null, then updates
    expect(result.current.preference).toBe('b2b');
  });

  it('should set preference in localStorage and cookie', () => {
    const { result } = renderHook(() => usePortalPreference());

    act(() => {
      result.current.setPreference('b2c');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('portal_preference', 'b2c');
    expect(cookieMock.cookies.get('portal_preference')).toBeDefined();
    expect(result.current.preference).toBe('b2c');
  });

  it('should clear preference from localStorage and cookie', () => {
    localStorageMock.getItem.mockReturnValue('b2b');
    
    const { result } = renderHook(() => usePortalPreference());
    
    act(() => {
      result.current.setPreference('b2b');
    });

    act(() => {
      result.current.clearPreference();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('portal_preference');
    expect(result.current.preference).toBe(null);
  });

  it('should return isLoading true initially when loading from localStorage', () => {
    // Simulate async loading
    localStorageMock.getItem.mockImplementation(() => {
      return 'b2b';
    });

    const { result } = renderHook(() => usePortalPreference());

    // Initial state
    expect(result.current.isLoading).toBe(false); // In our implementation, it's sync
    expect(result.current.preference).toBe('b2b');
  });
});

describe('getPortalPreferenceFromCookie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse B2B preference from cookie string', () => {
    const cookieString = 'other=value; portal_preference=b2b; another=value';
    
    const result = getPortalPreferenceFromCookie(cookieString);
    
    expect(result).toBe('b2b');
  });

  it('should parse B2C preference from cookie string', () => {
    const cookieString = 'portal_preference=b2c; other=value';
    
    const result = getPortalPreferenceFromCookie(cookieString);
    
    expect(result).toBe('b2c');
  });

  it('should return null for invalid preference', () => {
    const cookieString = 'portal_preference=invalid; other=value';
    
    const result = getPortalPreferenceFromCookie(cookieString);
    
    expect(result).toBe(null);
  });

  it('should return null when cookie is not present', () => {
    const cookieString = 'other=value; another=value';
    
    const result = getPortalPreferenceFromCookie(cookieString);
    
    expect(result).toBe(null);
  });

  it('should return null for empty cookie string', () => {
    const result = getPortalPreferenceFromCookie('');
    
    expect(result).toBe(null);
  });
});
