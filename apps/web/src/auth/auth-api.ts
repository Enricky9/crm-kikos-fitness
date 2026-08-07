import type { AuthenticatedUser } from "@kikos/shared";

import { apiRequest } from "../shared/api/http";

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

type LoginResponse = {
  readonly token: string;
  readonly user: AuthenticatedUser;
};

type MeResponse = {
  readonly user: AuthenticatedUser;
};

export const loginRequest = (input: LoginInput) =>
  apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: input
  });

export const meRequest = (token: string) =>
  apiRequest<MeResponse>("/auth/me", {
    token
  });
