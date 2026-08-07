import type { AuthenticatedUser } from "@kikos/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { HttpError } from "../../shared/api/http";
import { loginRequest, meRequest, type LoginInput } from "./api/auth-api";
import { authStorage } from "./auth-storage";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  readonly status: AuthStatus;
  readonly user: AuthenticatedUser | null;
  readonly token: string | null;
  readonly login: (input: LoginInput) => Promise<void>;
  readonly logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { readonly children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());

  const logout = useCallback(() => {
    authStorage.clearToken();
    setToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("anonymous");
      return;
    }

    let isActive = true;

    meRequest(token)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setUser(response.user);
        setStatus("authenticated");
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        if (error instanceof HttpError && error.status === 401) {
          authStorage.clearToken();
        }

        setToken(null);
        setUser(null);
        setStatus("anonymous");
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input);
    authStorage.setToken(response.token);
    setToken(response.token);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      token,
      login,
      logout
    }),
    [login, logout, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
