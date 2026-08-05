import type { PublicUser, UserRecord, UserRepository } from "../application/user-repository.js";
import { UserModel } from "../../../shared/database/models/index.js";

const toUserRecord = (user: UserModel): UserRecord => ({
  id: user.id,
  name: user.name,
  email: user.email,
  passwordHash: user.passwordHash,
  role: user.role
});

const toPublicUser = (user: UserModel): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const createSequelizeUserRepository = (): UserRepository => ({
  findByEmail: async (email) => {
    const user = await UserModel.findOne({ where: { email } });
    return user ? toUserRecord(user) : null;
  },
  findById: async (id) => {
    const user = await UserModel.findByPk(id);
    return user ? toUserRecord(user) : null;
  },
  listSellers: async () => {
    const sellers = await UserModel.findAll({
      where: { role: "SELLER" },
      order: [["name", "ASC"]]
    });

    return sellers.map(toPublicUser);
  }
});
