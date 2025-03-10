import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { GoogleAuthState } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

// This is a public OAuth client ID that's meant to be used with http://localhost or the deployed app domain
// You should replace this with your own Google OAuth Client ID for production use
const GOOGLE_CLIENT_ID = '238356005706-p3un444dbhbhqbb8opj5pg31o36ggqkf.apps.googleusercontent.com';

interface GoogleAuthContextType {
  authState: GoogleAuthState;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
  refreshToken: () => Promise<string | null>;
}

const defaultAuthState: GoogleAuthState = {
  isAuthenticated: false,
  token: null,
  profile: null,
  tokenExpiry: null
};

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<GoogleAuthState>(() => {
    const savedAuth = localStorage.getItem('googleAuth');
    return savedAuth ? JSON.parse(savedAuth) : defaultAuthState;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem('googleAuth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('googleAuth');
    }
  }, [authState]);

  // Check if token is expired
  const isTokenExpired = () => {
    if (!authState.tokenExpiry) return true;
    
    // Add a 5-minute buffer before expiration to refresh token
    const expiryTime = new Date(authState.tokenExpiry).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return currentTime + fiveMinutesInMs >= expiryTime;
  };

  const refreshToken = async (): Promise<string | null> => {
    if (!authState.isAuthenticated) {
      return null;
    }

    if (isTokenExpired()) {
      console.log('Token expired or missing, logging out silently');
      // Instead of showing a toast, just log out silently
      await logout(true);
      return null;
    }

    return authState.token;
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true);
        console.log('Google login successful, fetching user profile');
        
        // Calculate token expiry (default OAuth tokens last 1 hour)
        const now = new Date();
        const expiryTime = new Date(now.getTime() + response.expires_in * 1000);
        
        // Get user profile info
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`
          }
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const profileData = await profileResponse.json();
        
        setAuthState({
          isAuthenticated: true,
          token: response.access_token,
          profile: {
            name: profileData.name,
            email: profileData.email,
            picture: profileData.picture
          },
          tokenExpiry: expiryTime.toISOString()
        });
        
        toast({
          title: "Success!",
          description: "Connected to Google Calendar",
        });
      } catch (error) {
        console.error('Google auth error:', error);
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Could not connect to Google Calendar",
        });
      } finally {
        setIsLoading(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    onError: (error) => {
      console.error('Login Failed:', error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Could not connect to Google Calendar",
      });
      setIsLoading(false);
    }
  });

  const login = () => {
    setIsLoading(true);
    googleLogin();
  };

  const logout = async (silent = false) => {
    setAuthState(defaultAuthState);
    if (!silent) {
      toast({
        description: "Disconnected from Google Calendar",
      });
    }
    return true;
  };

  return (
    <GoogleAuthContext.Provider value={{ authState, login, logout, isLoading, refreshToken }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const GoogleAuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleAuthProvider>{children}</GoogleAuthProvider>
    </GoogleOAuthProvider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
