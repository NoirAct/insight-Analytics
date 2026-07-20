import type { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import { AppError } from "../middlewares/error-handler.js";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import type {
  UpdateCompanyInput,
  UpdateProfileInput,
} from "../validators/profile.validators.js";
import { serializeUser } from "./users.service.js";

export const profileService = {
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const current = await prisma.user.findUnique({ where: { id: userId } });
    if (!current) {
      throw new AppError(404, "Usuário não encontrado");
    }

    if (input.newPassword && input.newPassword.length > 0) {
      if (!input.currentPassword) {
        throw new AppError(400, "Informe a senha atual");
      }
      const valid = await verifyPassword(
        input.currentPassword,
        current.passwordHash,
      );
      if (!valid) {
        throw new AppError(400, "Senha atual inválida");
      }
    }

    if (input.email && input.email.toLowerCase() !== current.email) {
      const existing = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (existing) {
        throw new AppError(409, "E-mail já cadastrado");
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email.toLowerCase();
    if (input.theme !== undefined) data.theme = input.theme;
    if (input.locale !== undefined) data.locale = input.locale;
    if (input.newPassword && input.newPassword.length > 0) {
      data.passwordHash = await hashPassword(input.newPassword);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        role: { include: { permissions: true } },
      },
    });

    return serializeUser(user);
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      include: {
        role: { include: { permissions: true } },
      },
    });
    return serializeUser(user);
  },

  async listSessions(userId: string) {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      active: session.expiresAt.getTime() > Date.now(),
    }));
  },

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new AppError(404, "Sessão não encontrada");
    }
    await prisma.session.delete({ where: { id: sessionId } });
    return { ok: true };
  },

  async listNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new AppError(404, "Notificação não encontrada");
    }
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  async getCompany() {
    const existing = await prisma.companySettings.findFirst();
    if (existing) return existing;
    return prisma.companySettings.create({
      data: { name: "Insight Analytics" },
    });
  },

  async updateCompany(input: UpdateCompanyInput) {
    const company = await this.getCompany();
    return prisma.companySettings.update({
      where: { id: company.id },
      data: {
        name: input.name ?? company.name,
      },
    });
  },

  async updateCompanyLogo(logoUrl: string) {
    const company = await this.getCompany();
    return prisma.companySettings.update({
      where: { id: company.id },
      data: { logoUrl },
    });
  },
};
