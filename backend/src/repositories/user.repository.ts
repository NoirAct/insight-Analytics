import type { User } from "@prisma/client";
import { prisma } from "../database/prisma.js";

export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    theme: user.theme,
    locale: user.locale,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },
};

export const sessionRepository = {
  create(data: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.session.create({ data });
  },

  findById(id: string) {
    return prisma.session.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  updateTokenHash(id: string, refreshTokenHash: string, expiresAt: Date) {
    return prisma.session.update({
      where: { id },
      data: { refreshTokenHash, expiresAt },
    });
  },

  deleteById(id: string) {
    return prisma.session.delete({ where: { id } }).catch(() => null);
  },

  deleteByUserId(userId: string) {
    return prisma.session.deleteMany({ where: { userId } });
  },
};

export const passwordResetRepository = {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({ data });
  },

  findValidByHash(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  markUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  invalidateAllForUser(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },
};
