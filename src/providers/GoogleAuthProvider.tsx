import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

interface GoogleAuthContextType {
  authState: AuthState;
  signIn: () => void;
  signOut: () => void;
  getAccessToken: () => Promise<string>;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

// Your Google OAuth client ID
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'profile',
  'email'
].join(' ');

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('googleAuth');
    return savedAuth ? JSON.parse(savedAuth) : {
      isAuthenticated: false,
      user: null,
      accessToken: null
    };
  });

  // Persist auth state to localStorage
  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem('googleAuth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('googleAuth');
    }
  }, [authState]);

  // Load the Google API client library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = initializeGoogleAuth;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleAuth = () => {
    window.gapi.load('client:auth2', () => {
      window.gapi.client
        .init({
          clientId: CLIENT_ID,
          scope: SCOPES,
          plugin_name: 'timetracker2400'
        })
        .then(() => {
          // Check if user is already signed in
          const authInstance = window.gapi.auth2.getAuthInstance();
          const isSignedIn = authInstance.isSignedIn.get();
          
          if (isSignedIn) {
            const googleUser = authInstance.currentUser.get();
            handleAuthSuccess(googleUser);
          }

          // Listen for sign-in state changes
          authInstance.isSignedIn.listen((signedIn: boolean) => {
            if (!signedIn) {
              handleSignOut();
            }
          });
        })
        .catch(console.error);
    });
  };

  const handleAuthSuccess = (googleUser: any) => {
    const profile = googleUser.getBasicProfile();
    const accessToken = googleUser.getAuthResponse().access_token;

    const newAuthState = {
      isAuthenticated: true,
      user: {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      },
      accessToken
    };

    setAuthState(newAuthState);
    localStorage.setItem('googleAuth', JSON.stringify(newAuthState));

    // Redirect to home page after successful login
    navigate('/', { replace: true });
  };

  const signIn = () => {
    if (!window.gapi) {
      console.error('Google API client not loaded');
      return;
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    authInstance
      .signIn()
      .then(handleAuthSuccess)
      .catch((error: Error) => {
        console.error('Error signing in:', error);
      });
  };

  const signOut = () => {
    if (!window.gapi) {
      console.error('Google API client not loaded');
      return;
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    authInstance
      .signOut()
      .then(handleSignOut)
      .catch(console.error);
  };

  const handleSignOut = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null
    });
    localStorage.removeItem('googleAuth');
    navigate('/login', { replace: true });
  };

  const getAccessToken = async (): Promise<string> => {
    if (!authState.accessToken) {
      throw new Error('No access token available');
    }
    return authState.accessToken;
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        authState,
        signIn,
        signOut,
        getAccessToken
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

// Add type definition for window.gapi
declare global {
  interface Window {
    gapi: any;
  }
}
