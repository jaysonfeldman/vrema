import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { DEV_ACCESS_TOKEN, isDevAuthBypass } from '@/lib/dev-auth';

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

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('googleAuth');
    if (!savedAuth) {
      return emptyState;
    }

    const parsed = JSON.parse(savedAuth) as AuthState;

    // Ignore a stale dev-bypass session when dev mode is off (and vice versa).
    const isDevSession = parsed.accessToken === DEV_ACCESS_TOKEN;
    if (isDevSession !== isDevAuthBypass) {
      localStorage.removeItem('googleAuth');
      return emptyState;
    }

    // Drop expired real sessions so the user is prompted to sign in again.
    if (!isDevSession && parsed.expiresAt && Date.now() >= parsed.expiresAt) {
      localStorage.removeItem('googleAuth');
      return emptyState;
    }

    return parsed;
  });

  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem('googleAuth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('googleAuth');
    }
  }, [authState]);

  const handleSignOut = () => {
    setAuthState(emptyState);
    localStorage.removeItem('googleAuth');
    navigate('/login', { replace: true });
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
        navigate('/', { replace: true });
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
    navigate('/', { replace: true });
  };

  const signIn = () => {
    if (isDevAuthBypass) {
      signInDev();
      return;
    }

    login();
  };

  const signOut = () => {
    handleSignOut();
  };

  const getAccessToken = async (): Promise<string> => {
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

  return (
    <GoogleAuthContext.Provider
      value={{
        authState,
        signIn,
        signInDev,
        signOut,
        getAccessToken,
        isDevAuthBypass,
      }}
    >
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
