import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken } from "@/api/client";
import { authApi } from "@/services/auth.service";
import type { User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const { data } = await authApi.refresh();
        if (!active) return;
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        if (!active) return;
        setAccessToken(null);
        setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string; rememberMe?: boolean }) => {
      const { data } = await authApi.login(input);
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    [],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const { data } = await authApi.register(input);
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
