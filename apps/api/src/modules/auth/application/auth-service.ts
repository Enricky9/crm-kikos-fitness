import bcrypt from "bcryptjs";
import { Effect } from "effect";

import type { AuthenticatedUser } from "@kikos/shared";

import { InvalidCredentialsError, UnauthorizedError } from "../../../shared/errors/app-error.js";
import type { UserRepository } from "../../users/application/user-repository.js";

export type LoginInput = {
  readonly email: string;
  readonly password: string;
};

export type LoginResult = {
  readonly user: AuthenticatedUser;
};

export const createAuthService = (userRepository: UserRepository) => ({
  login: (input: LoginInput) =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: () => userRepository.findByEmail(input.email),
        catch: () => new InvalidCredentialsError()
      });

      if (!user) {
        return yield* Effect.fail(new InvalidCredentialsError());
      }

      const passwordMatches = yield* Effect.tryPromise({
        try: () => bcrypt.compare(input.password, user.passwordHash),
        catch: () => new InvalidCredentialsError()
      });

      if (!passwordMatches) {
        return yield* Effect.fail(new InvalidCredentialsError());
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    }),

  getAuthenticatedUser: (userId: string) =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: () => userRepository.findById(userId),
        catch: () => new UnauthorizedError()
      });

      if (!user) {
        return yield* Effect.fail(new UnauthorizedError());
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    })
});

export type AuthService = ReturnType<typeof createAuthService>;
