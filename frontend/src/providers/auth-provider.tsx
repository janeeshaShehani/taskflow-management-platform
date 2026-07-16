"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "@/services/auth.service";
import type {
  AuthUser,
  LoginInput,
} from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await getCurrentUser();
      setUser(response.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const loadCurrentUser = async (): Promise<void> => {
      try {
        const response = await getCurrentUser();
        setUser(response.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCurrentUser();
  }, []);

  const login = async (
    input: LoginInput,
  ): Promise<AuthUser> => {
    const response = await loginUser(input);
    const loggedInUser = response.data.user;

    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider",
    );
  }

  return context;
}