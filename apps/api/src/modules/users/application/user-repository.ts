import type { UserRole } from "@kikos/shared";

export type UserRecord = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
};

export type PublicUser = Omit<UserRecord, "passwordHash">;

export type UserRepository = {
  readonly findByEmail: (email: string) => Promise<UserRecord | null>;
  readonly findById: (id: string) => Promise<UserRecord | null>;
};
