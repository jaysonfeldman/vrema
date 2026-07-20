import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { DEV_ACCESS_TOKEN, isDevAuthBypass } from '@/lib/dev-auth';
import { DEMO_ACCESS_TOKEN, demoUser } from '@/lib/demo-data';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  expiresAt?: number | null;
}

interface GoogleAuthContextType {
  authState: AuthState;
  signIn: () => void;
  signInDev: () => void;
  signOut: () => void;
  getAccessToken: () => Promise<string>;
  isDevAuthBypass: boolean;
  isDemoMode: boolean;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'openid',
  'profile',
  'email',
].join(' ');

const emptyState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  expiresAt: null,
};

const demoAuthState: AuthState = {
  isAuthenticated: true,
  user: demoUser,
  accessToken: DEMO_ACCESS_TOKEN,
  expiresAt: null,
};

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDemoMode = location.pathname.startsWith('/preview');

  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('googleAuth');
    if (!savedAuth) {
      return emptyState;
    }

    const parsed = JSON.parse(savedAuth) as AuthState;

    const isDevSession = parsed.accessToken === DEV_ACCESS_TOKEN;
    if (isDevSession !== isDevAuthBypass) {
      localStorage.removeItem('googleAuth');
      return emptyState;
    }

    if (!isDevSession && parsed.expiresAt && Date.now() >= parsed.expiresAt) {
      localStorage.removeItem('googleAuth');
      return emptyState;
    }

    return parsed;
  });

  useEffect(() => {
    if (isDemoMode) return;
    if (authState.isAuthenticated) {
      localStorage.setItem('googleAuth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('googleAuth');
    }
  }, [authState, isDemoMode]);

  const handleSignOut = () => {
    setAuthState(emptyState);
    localStorage.removeItem('googleAuth');
  };

  const login = useGoogleLogin({
    scope: SCOPES,
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        const expiresAt = Date.now() + (tokenResponse.expires_in ?? 3600) * 1000;

        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to load Google profile');
        }

        const profile = await profileResponse.json();

        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: {
            id: profile.sub,
            name: profile.name ?? profile.email ?? 'User',
            email: profile.email ?? '',
            imageUrl: profile.picture ?? '',
          },
          accessToken,
          expiresAt,
        };

        setAuthState(newAuthState);
        navigate('/app', { replace: true });
      } catch (error) {
        console.error('Error completing Google sign-in:', error);
      }
    },
    onError: (error) => {
      console.error('Google sign-in failed:', error);
    },
  });

  const signInDev = () => {
    setAuthState({
      isAuthenticated: true,
      user: {
        id: 'dev-user',
        name: 'Dev User',
        email: 'dev@localhost',
        imageUrl: '',
      },
      accessToken: DEV_ACCESS_TOKEN,
      expiresAt: null,
    });
    navigate('/app', { replace: true });
  };

  const signIn = () => {
    if (isDevAuthBypass) {
      signInDev();
      return;
    }

    login();
  };

  const signOut = () => {
    if (isDemoMode) return;
    handleSignOut();
  };

  const getAccessToken = async (): Promise<string> => {
    if (isDemoMode) return DEMO_ACCESS_TOKEN;

    if (authState.accessToken === DEV_ACCESS_TOKEN) {
      return DEV_ACCESS_TOKEN;
    }

    if (!authState.accessToken) {
      throw new Error('No access token available');
    }

    if (authState.expiresAt && Date.now() >= authState.expiresAt) {
      handleSignOut();
      throw new Error('Session expired - please sign in again');
    }

    return authState.accessToken;
  };

  const value = useMemo(
    () => ({
      authState: isDemoMode ? demoAuthState : authState,
      signIn,
      signInDev,
      signOut,
      getAccessToken,
      isDevAuthBypass,
      isDemoMode,
    }),
    [authState, isDemoMode]
  );

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
}
