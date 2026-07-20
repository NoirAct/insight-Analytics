import type { Prisma, User, UserStatus } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import { AppError } from "../middlewares/error-handler.js";
import { hashPassword } from "../utils/crypto.js";
import type {
  CreateUserInput,
  ListUsersInput,
  UpdateUserInput,
} from "../validators/users.validators.js";

type UserWithRole = User & {
  role: {
    id: string;
    name: string;
    description: string | null;
    permissions: { id: string; key: string; description: string | null }[];
  } | null;
};

export function serializeUser(user: UserWithRole) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    status: user.status,
    theme: user.theme,
    locale: user.locale,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description,
          permissions: user.role.permissions.map((permission) => ({
            id: permission.id,
            key: permission.key,
            description: permission.description,
          })),
        }
      : null,
  };
}

const userInclude = {
  role: {
    include: {
      permissions: true,
    },
  },
} satisfies Prisma.UserInclude;

export const usersService = {
  async list(input: ListUsersInput) {
    const where: Prisma.UserWhereInput = {};

    if (input.search) {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { email: { contains: input.search, mode: "insensitive" } },
      ];
    }

    if (input.status) {
      where.status = input.status as UserStatus;
    }

    if (input.roleId) {
      where.roleId = input.roleId;
    }

    const skip = (input.page - 1) * input.pageSize;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: input.pageSize,
      }),
    ]);

    return {
      data: users.map(serializeUser),
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
      },
    };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!user) {
      throw new AppError(404, "Usuário não encontrado");
    }
    return serializeUser(user);
  },

  async create(input: CreateUserInput) {
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "E-mail já cadastrado");
    }

    if (input.roleId) {
      const role = await prisma.role.findUnique({ where: { id: input.roleId } });
      if (!role) {
        throw new AppError(400, "Cargo inválido");
      }
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        status: input.status,
        roleId: input.roleId ?? null,
      },
      include: userInclude,
    });

    return serializeUser(user);
  },

  async update(id: string, input: UpdateUserInput) {
    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, "Usuário não encontrado");
    }

    if (input.email && input.email.toLowerCase() !== current.email) {
      const email = input.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError(409, "E-mail já cadastrado");
      }
    }

    if (input.roleId) {
      const role = await prisma.role.findUnique({ where: { id: input.roleId } });
      if (!role) {
        throw new AppError(400, "Cargo inválido");
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email.toLowerCase();
    if (input.status !== undefined) data.status = input.status;
    if (input.roleId !== undefined) {
      data.role = input.roleId
        ? { connect: { id: input.roleId } }
        : { disconnect: true };
    }
    if (input.password && input.password.length > 0) {
      data.passwordHash = await hashPassword(input.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: userInclude,
    });

    return serializeUser(user);
  },

  async remove(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new AppError(400, "Você não pode remover a própria conta");
    }

    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, "Usuário não encontrado");
    }

    await prisma.user.delete({ where: { id } });
    return { ok: true };
  },

  async updateAvatar(id: string, avatarUrl: string) {
    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, "Usuário não encontrado");
    }

    const user = await prisma.user.update({
      where: { id },
      data: { avatarUrl },
      include: userInclude,
    });

    return serializeUser(user);
  },

  async listRoles() {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: "asc" },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((permission) => ({
        id: permission.id,
        key: permission.key,
        description: permission.description,
      })),
    }));
  },
};
